<#
.SYNOPSIS
    Runs the DealsSeeker API in one terminal and the React Native (Expo) Android app in another.

.DESCRIPTION
    The API and the Android app are started as two separate, independent processes so that each
    keeps its own console, and so that either one can be restarted without touching the other.

    By default (Target = both) two new terminal windows are opened: one for the API and one for
    the app. The API is given time to become healthy before the app is built and launched, so the
    app never races the API at startup.

    The app script resolves the Android SDK and JDK, starts an emulator when no device is
    connected, points the app at a reachable API address, and builds/launches a development build
    with `expo run:android`.

    Other EXPO_PUBLIC_* variables (map provider, Google Maps key) keep their defaults from
    `src/DealsSeeker.ReactNative/src/api/config.ts` unless you set them before calling this script.

.PARAMETER Target
    api  - run only the API in the current terminal.
    app  - build, install and run the Android app.
    both - open the API and the app in two separate terminal windows (default).

.PARAMETER ApiPort
    Port the API listens on. Default 5005.

.PARAMETER ApiHost
    Address the API binds to. Default 0.0.0.0, so that an Android emulator (10.0.2.2) and a
    physical device on the same network can both reach it.

.PARAMETER ExpoPort
    Port the Expo dev server listens on. Default 8081.

.PARAMETER ApiBaseUrl
    Overrides the API base URL handed to the app, whatever the platform implies.

.PARAMETER Platform
    Which Android target decides the API base URL:
      emulator - Android emulator (10.0.2.2)  [default]
      device   - physical device on the same network (machine LAN address)

.PARAMETER DeviceId
    Optional adb device identifier (for example emulator-5554) passed to Expo when more than one
    device is connected.

.PARAMETER AvdName
    Android virtual device started when no device is connected. Default DealsSeekerApi.

.PARAMETER Resolution
    Emulator screen size in WIDTHxHEIGHT used when starting an AVD. Default 720x1280.
    Pass an empty string to use the AVD's own setting.

.PARAMETER Wait
    Keep this terminal open until Ctrl+C, so the child terminals can be closed together.

.EXAMPLE
    .\scripts\run-reactnative-android.ps1

.EXAMPLE
    .\scripts\run-reactnative-android.ps1 -Platform device

.EXAMPLE
    .\scripts\run-reactnative-android.ps1 -DeviceId emulator-5554

.EXAMPLE
    .\scripts\run-reactnative-android.ps1 -Target api

.EXAMPLE
    npm run android   (from src/DealsSeeker.ReactNative)
#>
[CmdletBinding()]
param(
    [ValidateSet('api', 'app', 'both')]
    [string]$Target = 'both',

    [ValidateRange(1, 65535)]
    [int]$ApiPort = 5005,

    [string]$ApiHost = '0.0.0.0',

    [ValidateRange(1, 65535)]
    [int]$ExpoPort = 8081,

    [string]$ApiBaseUrl,

    [ValidateSet('emulator', 'device')]
    [string]$Platform = 'emulator',

    [string]$DeviceId,

    [string]$AvdName = 'DealsSeekerApi',

    [string]$Resolution = '720x1280',

    [switch]$Wait
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $scriptDir '..'))
$scriptPath = $MyInvocation.MyCommand.Path
$apiProject = Join-Path $repoRoot 'src\DealsSeeker.Api\DealsSeeker.Api.csproj'
$appDir = Join-Path $repoRoot 'src\DealsSeeker.ReactNative'

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

function Assert-Command {
    param([string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "'$Name' was not found on PATH. Install it and try again."
    }
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

function Initialize-AndroidEnvironment {
    $sdkRoot = @($env:ANDROID_SDK_ROOT, $env:ANDROID_HOME) |
        Where-Object { $_ } | Select-Object -First 1
    if (-not $sdkRoot) {
        $sdkRoot = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
    }

    if (-not (Test-Path -LiteralPath (Join-Path $sdkRoot 'platform-tools\adb.exe'))) {
        throw "Android SDK not found or incomplete at '$sdkRoot'. Install Android Studio (or the Android SDK command-line tools) and set ANDROID_HOME."
    }

    $env:ANDROID_HOME = $sdkRoot
    $env:ANDROID_SDK_ROOT = $sdkRoot
    Add-ToProcessPath (Join-Path $sdkRoot 'platform-tools')
    Add-ToProcessPath (Join-Path $sdkRoot 'emulator')

    $javaFound = $false
    foreach ($candidate in @($env:JAVA_HOME, (Join-Path $env:ProgramFiles 'Android\Android Studio\jbr'))) {
        if ($candidate -and (Test-Path -LiteralPath (Join-Path $candidate 'bin\java.exe'))) {
            $env:JAVA_HOME = $candidate
            Add-ToProcessPath (Join-Path $candidate 'bin')
            $javaFound = $true
            break
        }
    }

    if (-not $javaFound) {
        Write-Info 'No JDK found; Expo will report what it needs (install JDK 17 or Android Studio).' -ForegroundColor Yellow
    }
}

function Get-OnlineDevices {
    param([string]$AdbPath)

    return @(& $AdbPath devices | Select-Object -Skip 1 | Where-Object { $_ -match '\sdevice$' })
}

function Start-EmulatorIfNeeded {
    $adb = Join-Path $env:ANDROID_HOME 'platform-tools\adb.exe'
    if ((Get-OnlineDevices $adb).Count -gt 0) {
        return
    }

    $emulator = Join-Path $env:ANDROID_HOME 'emulator\emulator.exe'
    if (-not (Test-Path -LiteralPath $emulator)) {
        throw 'No device is connected and the Android emulator is not installed. Connect a device or install the emulator through Android Studio.'
    }

    $availableAvds = @(& $emulator -list-avds 2>$null | Where-Object { $_ })
    $avdToStart = if ($availableAvds -contains $AvdName) { $AvdName } else { $availableAvds | Select-Object -First 1 }

    if (-not $avdToStart) {
        throw "No Android virtual device exists. Create one in Android Studio (for example '$AvdName') or connect a physical device."
    }

    if ($avdToStart -ne $AvdName) {
        Write-Info "AVD '$AvdName' was not found; starting '$avdToStart' instead."
    }

    Write-Info "Starting Android emulator '$avdToStart'..."
    $emulatorArgs = @('-avd', $avdToStart, '-no-snapshot', '-no-boot-anim')
    if (-not [string]::IsNullOrWhiteSpace($Resolution)) {
        if ($Resolution -notmatch '^\d+x\d+$') {
            throw "Resolution must be in WIDTHxHEIGHT form (for example 720x1280); got '$Resolution'."
        }
        $emulatorArgs += @('-skin', $Resolution)
    }
    $emulatorProcess = Start-Process -FilePath $emulator -ArgumentList $emulatorArgs -PassThru

    $deadline = (Get-Date).AddMinutes(4)
    while ((Get-Date) -lt $deadline) {
        if ($emulatorProcess.HasExited) {
            throw "The emulator exited with code $($emulatorProcess.ExitCode)."
        }

        if ((Get-OnlineDevices $adb).Count -gt 0) {
            $booted = (& $adb shell getprop sys.boot_completed 2>$null | Out-String).Trim()
            if ($booted -eq '1') {
                Write-Info 'Emulator is booted.' -ForegroundColor Green
                return
            }
        }

        Start-Sleep -Seconds 3
    }

    throw 'The emulator did not finish booting in time. Check it in Android Studio and try again.'
}

function Assert-WindowsLongPaths {
    $key = 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem'
    $longPaths = (Get-ItemProperty -Path $key -Name LongPathsEnabled -ErrorAction SilentlyContinue).LongPathsEnabled
    if ($longPaths -eq 1) {
        return
    }

    throw @"
Windows long paths are disabled, so the native (CMake/Ninja) build fails with
'Filename longer than 260 characters'. Run this in an elevated PowerShell, then
restart the computer before running this script again:

  New-ItemProperty -Path '$key' -Name LongPathsEnabled -Value 1 -PropertyType DWORD -Force
"@
}

function Initialize-CMake {
    # The Android SDK's default CMake 3.22.1 ships Ninja 1.10.2, which ignores Windows long paths.
    # Expo SDK 58 reads android.cmakeVersion; 3.31.6 bundles Ninja 1.12.1.
    $ninja = Join-Path $env:ANDROID_HOME 'cmake\3.31.6\bin\ninja.exe'
    if (-not (Test-Path -LiteralPath $ninja)) {
        $sdkManager = Join-Path $env:ANDROID_HOME 'cmdline-tools\latest\bin\sdkmanager.bat'
        throw @"
CMake 3.31.6 is required on Windows (it bundles Ninja 1.12.1). Install it with:

  & '$sdkManager' --install 'cmake;3.31.6'
"@
    }

    $property = '-Dorg.gradle.project.android.cmakeVersion=3.31.6'
    if (-not $env:GRADLE_OPTS) {
        $env:GRADLE_OPTS = $property
    }
    elseif ($env:GRADLE_OPTS -notmatch [regex]::Escape($property)) {
        $env:GRADLE_OPTS = "$env:GRADLE_OPTS $property"
    }
}

function Invoke-App {
    Write-Heading 'DealsSeeker Android app (React Native / Expo)'
    Write-Info "API base URL : $env:EXPO_PUBLIC_API_BASE_URL"
    Write-Info "Expo server  : http://localhost:$ExpoPort"
    Write-Info 'Press Ctrl+C to stop.'

    Initialize-AndroidEnvironment
    Assert-WindowsLongPaths
    Initialize-CMake
    Start-EmulatorIfNeeded

    if (-not (Test-Path -LiteralPath (Join-Path $appDir 'node_modules'))) {
        Write-Info 'Installing npm dependencies (first run only)...'
        Push-Location $appDir
        try {
            & npm install
            if ($LASTEXITCODE -ne 0) {
                throw "npm install failed with code $LASTEXITCODE."
            }
        }
        finally {
            Pop-Location
        }
    }

    $adb = Join-Path $env:ANDROID_HOME 'platform-tools\adb.exe'
    foreach ($device in (Get-OnlineDevices $adb)) {
        Write-Info "Device       : $(($device -split '\s+')[0])"
    }

    $expoArgs = @('expo', 'run:android', '--port', $ExpoPort)
    if ($DeviceId) {
        $expoArgs += @('--device', $DeviceId)
    }

    Push-Location $appDir
    try {
        & npx @expoArgs
        if ($LASTEXITCODE -ne 0) {
            throw "expo run:android exited with code $LASTEXITCODE."
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
    $childArguments = '-NoExit -ExecutionPolicy Bypass -File "{0}" -Target {1} -ApiPort {2} -ApiHost {3} -ExpoPort {4} -Platform {5} -AvdName "{6}" -Resolution "{7}"' -f `
        $scriptPath, $ChildTarget, $ApiPort, $ApiHost, $ExpoPort, $Platform, $AvdName, $Resolution

    if ($ApiBaseUrl) {
        $childArguments += ' -ApiBaseUrl "{0}"' -f $ApiBaseUrl
    }

    if ($DeviceId) {
        $childArguments += ' -DeviceId "{0}"' -f $DeviceId
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

    $healthUrl = "http://127.0.0.1:$ApiPort/health/live"
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

if (-not (Test-Path -LiteralPath (Join-Path $appDir 'package.json'))) {
    throw "React Native app not found at '$appDir'."
}

Assert-Command 'dotnet'
Assert-Command 'npm'
Assert-Command 'npx'

$env:EXPO_PUBLIC_API_BASE_URL = Resolve-ApiBaseUrl
$env:NODE_ENV = 'development'

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
        Write-Info "API base URL  : $env:EXPO_PUBLIC_API_BASE_URL"
        Write-Info "Expo server   : http://localhost:$ExpoPort"
        Write-Info 'Two terminals will be opened. Close them with Ctrl+C.'

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
