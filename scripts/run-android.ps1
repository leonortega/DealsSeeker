<#
.SYNOPSIS
    Runs the DealsSeeker API in one terminal and the .NET MAUI Android app in another.

.DESCRIPTION
    The API and the Android app are started as two separate, independent processes so that each
    keeps its own console, and so that either one can be restarted without touching the other.

    By default (Target = both) two new terminal windows are opened: one for the API and one for
    the app. The API is given time to become healthy before the app is built and deployed, so the
    app never races the API at startup.

    Missing tooling is installed automatically before the first Android build:
      - the .NET MAUI workload
      - a JDK (Microsoft OpenJDK 21 when JAVA_HOME does not point to one)
      - the Android SDK (platform, build-tools, platform-tools)
      - an emulator and system image when -InstallEmulator is passed
    See scripts/install-android-tools.ps1 for details.

    When no Android device is connected, the script starts the emulator and waits for it to boot
    before deploying. Use -SkipToolInstall to never download anything, or -InstallEmulator to
    provision an emulator first.

    The API listens on port 5005. The app receives that address through DEALSEEKER_API_BASEURL:
      - Android emulator : http://10.0.2.2:5005 (10.0.2.2 is the emulator alias for the host)
      - Physical device  : http://<machine-lan-ip>:5005 (device on the same network)

    The app is built and launched with `dotnet build -t:Run -f net10.0-android`, which builds the
    Android package, installs it on the connected device/emulator and starts it.

.PARAMETER Target
    api  - run only the API in the current terminal.
    app  - install tooling if needed, then build, install and run the Android app.
    both - open the API and the app in two separate terminal windows (default).

.PARAMETER ApiPort
    Port the API listens on. Default 5005.

.PARAMETER ApiHost
    Address the API binds to. Default 0.0.0.0, so that an Android emulator (10.0.2.2) and a
    physical device on the same network can both reach it.

.PARAMETER Platform
    Which Android target decides the API base URL:
      emulator - Android emulator (10.0.2.2)  [default]
      device   - physical device on the same network (machine LAN address)

.PARAMETER ApiBaseUrl
    Overrides the API base URL handed to the app, whatever the platform implies.

.PARAMETER Configuration
    Build configuration for the Android app. Default Debug.

.PARAMETER DeviceId
    Optional adb device identifier (for example emulator-5554) when more than one is connected.

.PARAMETER InstallEmulator
    Install the emulator and the system image, and create the AVD, if they are missing.

.PARAMETER AvdName
    Android virtual device started when no device is connected. Default DealsSeekerApi.

.PARAMETER SkipToolInstall
    Do not install missing tooling. The Android build will fail with the SDK error if none is present.

.PARAMETER Wait
    Keep this terminal open until Ctrl+C, so the child terminals can be closed together.

.EXAMPLE
    .\scripts\run-android.ps1

.EXAMPLE
    .\scripts\run-android.ps1 -InstallEmulator

.EXAMPLE
    .\scripts\run-android.ps1 -Platform device

.EXAMPLE
    .\scripts\run-android.ps1 -Target app -DeviceId emulator-5554

.EXAMPLE
    .\scripts\run-android.ps1 -Target api
#>
[CmdletBinding()]
param(
    [ValidateSet('api', 'app', 'both')]
    [string]$Target = 'both',

    [ValidateRange(1, 65535)]
    [int]$ApiPort = 5005,

    [string]$ApiHost = '0.0.0.0',

    [ValidateSet('emulator', 'device')]
    [string]$Platform = 'emulator',

    [string]$ApiBaseUrl,

    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Debug',

    [string]$DeviceId,

    [switch]$InstallEmulator,

    [string]$AvdName = 'DealsSeekerApi',

    [switch]$SkipToolInstall,

    [switch]$Wait
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $scriptDir '..'))
$scriptPath = $MyInvocation.MyCommand.Path
$installerScript = Join-Path $scriptDir 'install-android-tools.ps1'
$apiProject = Join-Path $repoRoot 'src\DealsSeeker.Api\DealsSeeker.Api.csproj'
$appProject = Join-Path $repoRoot 'src\DealsSeeker.Mobile\DealsSeeker.Mobile.csproj'
$androidFramework = 'net10.0-android'

function Write-Heading {
    param([string]$Text)
    Write-Host ''
    Write-Host "== $Text " -ForegroundColor Cyan -NoNewline
    Write-Host ('=' * [Math]::Max(0, 60 - $Text.Length)) -ForegroundColor DarkCyan
}

function Write-Info {
    param([string]$Text)
    Write-Host "   $Text" -ForegroundColor Gray
}

function Add-ToProcessPath {
    param([string]$PathToAdd)

    if (-not $PathToAdd -or -not (Test-Path -LiteralPath $PathToAdd)) {
        return
    }

    $parts = $env:Path -split ';' | Where-Object { $_ }
    if ($parts -contains $PathToAdd) {
        return
    }

    $env:Path = "$PathToAdd;$env:Path"
}

function Get-LanAddress {
    try {
        $address = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop |
            Where-Object { $_.IPAddress -notlike '127.*' -and $_.PrefixOrigin -ne 'WellKnown' } |
            Select-Object -First 1
        if ($address) {
            return $address.IPAddress
        }
    }
    catch {
        # Fall through to the loopback address.
    }

    return '127.0.0.1'
}

function Resolve-ApiBaseUrl {
    if ($ApiBaseUrl) {
        return $ApiBaseUrl.TrimEnd('/')
    }

    switch ($Platform) {
        'device' { return "http://$(Get-LanAddress):$ApiPort" }
        default { return "http://10.0.2.2:$ApiPort" }
    }
}

function Write-AddressGuide {
    Write-Info 'Reachable addresses:'
    Write-Info "  Android emulator (10.0.2.2) : http://10.0.2.2:$ApiPort"
    Write-Info "  physical device (LAN)       : http://$(Get-LanAddress):$ApiPort"
    Write-Info "  app is configured with      : $env:DEALSEEKER_API_BASEURL"
}

function Assert-Command {
    param([string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "'$Name' was not found on PATH. Install it and try again."
    }
}

function Get-AndroidSdkRoot {
    $candidates = @($env:ANDROID_SDK_ROOT, $env:ANDROID_HOME) | Where-Object { $_ }
    foreach ($candidate in $candidates) {
        if (Test-Path -LiteralPath $candidate) {
            return $candidate
        }
    }

    return Join-Path $env:LOCALAPPDATA 'Android\Sdk'
}

function Get-JavaHome {
    $candidates = @($env:JAVA_HOME, (Join-Path $env:LOCALAPPDATA 'DealsSeeker\Android\jdk-21'))

    $javaRoot = Join-Path $env:LOCALAPPDATA 'DealsSeeker\Android\jdk-21'
    if (Test-Path -LiteralPath $javaRoot) {
        Get-ChildItem -LiteralPath $javaRoot -Directory -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending |
            ForEach-Object { $candidates += $_.FullName }
    }

    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path -LiteralPath (Join-Path $candidate 'bin\java.exe'))) {
            return $candidate
        }
    }

    return Join-Path $env:LOCALAPPDATA 'DealsSeeker\Android\jdk-21'
}

function Test-AndroidSdk {
    param([string]$Root)

    if (-not $Root -or -not (Test-Path -LiteralPath $Root)) {
        return $false
    }

    return (Test-Path -LiteralPath (Join-Path $Root 'platform-tools')) -and
        (Test-Path -LiteralPath (Join-Path $Root 'platforms')) -and
        (Test-Path -LiteralPath (Join-Path $Root 'build-tools'))
}

function Test-JavaHome {
    param([string]$Root)

    return $Root -and (Test-Path -LiteralPath (Join-Path $Root 'bin\java.exe'))
}

function Install-Toolchain {
    if (-not (Test-Path -LiteralPath $installerScript)) {
        throw "Toolchain installer not found at '$installerScript'."
    }

    $installerArguments = @{
        AndroidSdkDirectory = Get-AndroidSdkRoot
        JavaSdkDirectory = Get-JavaHome
    }

    if ($InstallEmulator) {
        $installerArguments.InstallEmulator = $true
        $installerArguments.AvdName = $AvdName
    }

    & $installerScript @installerArguments
    if ($LASTEXITCODE -ne 0) {
        throw "Android tool installation failed with exit code $LASTEXITCODE."
    }
}

function Initialize-AndroidEnvironment {
    if (-not $SkipToolInstall) {
        $sdkRoot = Get-AndroidSdkRoot
        $javaHome = Get-JavaHome
        $emulatorMissing = $InstallEmulator -and
            -not (Test-Path -LiteralPath (Join-Path $sdkRoot 'emulator\emulator.exe'))

        if (-not (Test-AndroidSdk $sdkRoot) -or -not (Test-JavaHome $javaHome) -or $emulatorMissing) {
            Write-Heading 'Installing missing Android tooling'
            Write-Info "Android SDK : $sdkRoot"
            Write-Info "Java SDK    : $javaHome"
            Write-Info 'This happens once; downloads can take several minutes.'
            Install-Toolchain
        }
    }

    $androidSdk = Get-AndroidSdkRoot
    if (Test-Path -LiteralPath $androidSdk) {
        $env:ANDROID_HOME = $androidSdk
        $env:ANDROID_SDK_ROOT = $androidSdk
        Add-ToProcessPath (Join-Path $androidSdk 'platform-tools')
        Add-ToProcessPath (Join-Path $androidSdk 'emulator')
    }
    else {
        Write-Info 'Android SDK was not found. Set ANDROID_HOME/ANDROID_SDK_ROOT or run without -SkipToolInstall.' -ForegroundColor Yellow
    }

    $javaHome = Get-JavaHome
    if (Test-JavaHome $javaHome) {
        $env:JAVA_HOME = $javaHome
        Add-ToProcessPath (Join-Path $javaHome 'bin')
    }
}

function Get-OnlineDevices {
    param([string]$AdbPath)

    return @(& $AdbPath devices | Select-Object -Skip 1 | Where-Object { $_ -match '\sdevice$' })
}

function Start-EmulatorIfNeeded {
    if (-not $env:ANDROID_HOME) {
        return
    }

    $adb = Join-Path $env:ANDROID_HOME 'platform-tools\adb.exe'
    if (-not (Test-Path -LiteralPath $adb)) {
        return
    }

    $onlineDevices = Get-OnlineDevices $adb
    if ($onlineDevices.Count -gt 0) {
        return
    }

    $emulator = Join-Path $env:ANDROID_HOME 'emulator\emulator.exe'
    if (-not (Test-Path -LiteralPath $emulator)) {
        Write-Info 'No Android device is connected and the emulator is not installed.' -ForegroundColor Yellow
        Write-Info 'Re-run with -InstallEmulator to download the emulator and a system image.' -ForegroundColor Yellow
        return
    }

    $availableAvds = @(& $emulator -list-avds 2>$null | Where-Object { $_ })
    $avdToStart = if ($availableAvds -contains $AvdName) { $AvdName } else { $availableAvds | Select-Object -First 1 }

    if (-not $avdToStart) {
        Write-Info 'No Android virtual device exists yet.' -ForegroundColor Yellow
        Write-Info 'Re-run with -InstallEmulator to create one, or connect a physical device.' -ForegroundColor Yellow
        return
    }

    if ($avdToStart -ne $AvdName) {
        Write-Info "AVD '$AvdName' was not found; starting '$avdToStart' instead."
    }

    Write-Info "Starting Android emulator '$avdToStart'..."
    $emulatorProcess = Start-Process -FilePath $emulator -ArgumentList @('-avd', $avdToStart, '-no-snapshot', '-no-boot-anim') -PassThru

    $deadline = (Get-Date).AddMinutes(4)
    while ((Get-Date) -lt $deadline) {
        if ($emulatorProcess.HasExited) {
            Write-Info "The emulator exited with code $($emulatorProcess.ExitCode)." -ForegroundColor Yellow
            return
        }

        $devices = Get-OnlineDevices $adb
        if ($devices.Count -gt 0) {
            $booted = (& $adb shell getprop sys.boot_completed 2>$null | Out-String).Trim()
            if ($booted -eq '1') {
                Write-Info 'Emulator is booted.' -ForegroundColor Green
                return
            }
        }

        Start-Sleep -Seconds 3
    }

    Write-Info 'The emulator did not finish booting in time; the build is attempted anyway.' -ForegroundColor Yellow
}

function Invoke-Api {
    Write-Heading 'DealsSeeker API'
    Write-Info "Bound to      : http://$ApiHost`:$ApiPort"
    Write-Info "Health        : http://localhost:$ApiPort/health/live"
    Write-Info 'Press Ctrl+C to stop.'

    $env:ASPNETCORE_ENVIRONMENT = 'Development'
    $env:ASPNETCORE_URLS = "http://$ApiHost`:$ApiPort"
    $env:DOTNET_ENVIRONMENT = 'Development'

    Push-Location $repoRoot
    try {
        & dotnet run --project $apiProject --urls "http://$ApiHost`:$ApiPort"
        if ($LASTEXITCODE -ne 0) {
            throw "The API exited with code $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }
}

function Invoke-App {
    Write-Heading 'DealsSeeker Android app (.NET MAUI)'
    Write-Info "API base URL : $env:DEALSEEKER_API_BASEURL"
    Write-Info "Framework    : $androidFramework ($Configuration)"
    if ($DeviceId) {
        Write-Info "Device       : $DeviceId"
    }
    Write-Info 'Press Ctrl+C to stop.'
    Write-AddressGuide

    Initialize-AndroidEnvironment
    Start-EmulatorIfNeeded

    $adb = Get-Command 'adb' -ErrorAction SilentlyContinue
    if ($adb) {
        $onlineDevices = Get-OnlineDevices $adb.Source
        if ($onlineDevices.Count -eq 0) {
            Write-Info 'No online Android device or emulator was detected. Start one before the build deploys.' -ForegroundColor Yellow
        }
        else {
            foreach ($device in $onlineDevices) {
                Write-Info "Detected     : $device"
            }
        }
    }
    else {
        Write-Info 'adb was not found; the Android build will use whatever device it can reach.' -ForegroundColor Yellow
    }

    $buildArguments = @(
        'build', $appProject,
        '-f', $androidFramework,
        '-c', $Configuration,
        '-t:Run',
        '--nologo'
    )

    if ($env:ANDROID_HOME) {
        $buildArguments += "-p:AndroidSdkDirectory=$env:ANDROID_HOME"
    }

    if ($env:JAVA_HOME) {
        $buildArguments += "-p:JavaSdkDirectory=$env:JAVA_HOME"
    }

    if ($DeviceId) {
        $buildArguments += "-p:AdbTarget=-s $DeviceId"
    }

    Push-Location $repoRoot
    try {
        & dotnet @buildArguments
        if ($LASTEXITCODE -ne 0) {
            throw "The Android app build/run exited with code $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }
}

function Get-ShellExecutable {
    # Windows Terminal gives the nicest experience, but a plain console works everywhere.
    $windowsTerminal = Get-Command 'wt.exe' -ErrorAction SilentlyContinue
    if ($windowsTerminal) {
        return @{ FilePath = $windowsTerminal.Source; UseWindowsTerminal = $true }
    }

    $powershell = Get-Command 'powershell.exe' -ErrorAction SilentlyContinue
    if ($powershell) {
        return @{ FilePath = $powershell.Source; UseWindowsTerminal = $false }
    }

    $pwsh = Get-Command 'pwsh.exe' -ErrorAction SilentlyContinue
    if ($pwsh) {
        return @{ FilePath = $pwsh.Source; UseWindowsTerminal = $false }
    }

    throw 'No terminal executable (wt.exe, powershell.exe or pwsh.exe) was found.'
}

function Start-ChildTerminal {
    param(
        [Parameter(Mandatory = $true)][string]$ChildTarget,
        [Parameter(Mandatory = $true)][string]$Title
    )

    $shell = Get-ShellExecutable

    # The argument list is built as a single string with explicit quoting: Start-Process joins an
    # array with spaces without quoting its elements, which would break values that contain spaces.
    $childArguments = '-NoExit -ExecutionPolicy Bypass -File "{0}" -Target {1} -ApiPort {2} -ApiHost {3} -Platform {4} -Configuration {5} -AvdName "{6}"' -f `
        $scriptPath, $ChildTarget, $ApiPort, $ApiHost, $Platform, $Configuration, $AvdName

    if ($ApiBaseUrl) {
        $childArguments += ' -ApiBaseUrl "{0}"' -f $ApiBaseUrl
    }

    if ($DeviceId) {
        $childArguments += ' -DeviceId "{0}"' -f $DeviceId
    }

    if ($InstallEmulator) {
        $childArguments += ' -InstallEmulator'
    }

    if ($SkipToolInstall) {
        $childArguments += ' -SkipToolInstall'
    }

    if ($shell.UseWindowsTerminal) {
        $commandLine = '-w new new-tab --title "{0}" -d "{1}" powershell.exe {2}' -f `
            $Title, $repoRoot, $childArguments
    }
    else {
        $commandLine = $childArguments
    }

    $process = Start-Process -FilePath $shell.FilePath -ArgumentList $commandLine -WorkingDirectory $repoRoot -PassThru
    return $process
}

function Wait-ApiHealthy {
    param([int]$TimeoutSeconds = 120)

    $healthUrl = "http://localhost:$ApiPort/health/live"
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

    Write-Info "Waiting for the API to become healthy ($healthUrl)..."

    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 3
            if ($response.StatusCode -eq 200) {
                Write-Info 'API is healthy.' -ForegroundColor Green
                return $true
            }
        }
        catch {
            # Not up yet.
        }

        Start-Sleep -Seconds 2
    }

    Write-Info 'The API did not become healthy in time; the app is started anyway.' -ForegroundColor Yellow
    return $false
}

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if (-not (Test-Path -LiteralPath $apiProject)) {
    throw "API project not found at '$apiProject'."
}

if (-not (Test-Path -LiteralPath $appProject)) {
    throw "MAUI app project not found at '$appProject'."
}

Assert-Command 'dotnet'

$env:DEALSEEKER_API_BASEURL = Resolve-ApiBaseUrl

switch ($Target) {
    'api' {
        Invoke-Api
    }

    'app' {
        Invoke-App
    }

    'both' {
        Write-Heading 'DealsSeeker - starting API and Android app'
        Write-Info "API           : http://localhost:$ApiPort (bound to $ApiHost)"
        Write-Info "API base URL  : $env:DEALSEEKER_API_BASEURL"
        Write-Info "App           : $androidFramework ($Configuration)"
        Write-Info 'Two terminals will be opened. Close them with Ctrl+C.'
        Write-AddressGuide

        $apiProcess = Start-ChildTerminal -ChildTarget 'api' -Title 'DealsSeeker API'

        Wait-ApiHealthy | Out-Null

        $appProcess = Start-ChildTerminal -ChildTarget 'app' -Title 'DealsSeeker Android'

        Write-Host ''
        Write-Host '   API terminal and Android app terminal are running.' -ForegroundColor Green
        Write-Host '   Press Ctrl+C in this terminal to stop waiting.' -ForegroundColor Gray

        if ($Wait) {
            while ($true) {
                Start-Sleep -Seconds 3600
            }
        }
    }
}
