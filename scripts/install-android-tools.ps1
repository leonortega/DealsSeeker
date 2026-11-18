<#
.SYNOPSIS
    Installs the toolchain needed to build and run the DealsSeeker .NET MAUI Android app.

.DESCRIPTION
    Installs, only when missing, and always into user-writable locations by default:
      - the .NET MAUI workload (Android target)
      - a JDK (Microsoft OpenJDK 21, unless JAVA_HOME already points to one)
      - the Android SDK (via the supported `InstallAndroidDependencies` MSBuild target, which also
        downloads the platform, build-tools, platform-tools and licenses)
      - optionally the Android emulator, a system image and an AVD (-InstallEmulator)

    The script is idempotent: running it again skips whatever is already present. It prints the
    resolved paths at the end; the environment variables it sets only live for the current process,
    which is why run-android.ps1 resolves the same locations itself.

.PARAMETER AndroidSdkDirectory
    Where the Android SDK is installed. Defaults to ANDROID_SDK_ROOT/ANDROID_HOME when set,
    otherwise %LOCALAPPDATA%\Android\Sdk.

.PARAMETER JavaSdkDirectory
    Where the JDK is installed. Defaults to JAVA_HOME when it points to a JDK,
    otherwise %LOCALAPPDATA%\DealsSeeker\Android\jdk-21.

.PARAMETER SkipWorkload
    Do not check for or install the .NET MAUI workload.

.PARAMETER SkipUserEnvironment
    Do not persist ANDROID_HOME, ANDROID_SDK_ROOT and JAVA_HOME as user environment variables.

.PARAMETER InstallEmulator
    Also install the Android emulator and the system image, and create the AVD if it does not exist.

.PARAMETER AvdName
    Name of the Android virtual device. Default DealsSeekerApi.

.PARAMETER SystemImage
    System image used for the AVD. Default an Android 15 (API 35) Google APIs x86_64 image.

.EXAMPLE
    .\scripts\install-android-tools.ps1

.EXAMPLE
    .\scripts\install-android-tools.ps1 -InstallEmulator

.EXAMPLE
    .\scripts\install-android-tools.ps1 -AndroidSdkDirectory D:\android-sdk -JavaSdkDirectory D:\jdk-21
#>
[CmdletBinding()]
param(
    [string]$AndroidSdkDirectory,

    [string]$JavaSdkDirectory,

    [switch]$SkipWorkload,

    [switch]$SkipUserEnvironment,

    [switch]$InstallEmulator,

    [string]$AvdName = 'DealsSeekerApi',

    [string]$SystemImage = 'system-images;android-35;google_apis;x86_64'
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $scriptDir '..'))
$appProject = Join-Path $repoRoot 'src\DealsSeeker.Mobile\DealsSeeker.Mobile.csproj'
$androidFramework = 'net10.0-android'

$jdkDownloadUrl = 'https://aka.ms/download-jdk/microsoft-jdk-21-windows-x64.zip'
$commandLineToolsUrl = 'https://dl.google.com/android/repository/commandlinetools-win-13114758_latest.zip'

if (-not (Test-Path -LiteralPath $appProject)) {
    throw "MAUI app project not found at '$appProject'."
}

if (-not $AndroidSdkDirectory) {
    $existingSdk = @($env:ANDROID_SDK_ROOT, $env:ANDROID_HOME) | Where-Object { $_ } | Select-Object -First 1
    $AndroidSdkDirectory = if ($existingSdk) { $existingSdk } else { Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
}

if (-not $JavaSdkDirectory) {
    if ($env:JAVA_HOME -and (Test-Path -LiteralPath (Join-Path $env:JAVA_HOME 'bin\java.exe'))) {
        $JavaSdkDirectory = $env:JAVA_HOME
    }
    else {
        $JavaSdkDirectory = Join-Path $env:LOCALAPPDATA 'DealsSeeker\Android\jdk-21'
    }
}

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

function Set-UserEnvironmentVariable {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Value
    )

    $current = [Environment]::GetEnvironmentVariable($Name, 'User')
    if ($current -eq $Value) {
        return
    }

    if ($current) {
        Write-Info "Keeping the existing user $Name (it points elsewhere)."
        return
    }

    [Environment]::SetEnvironmentVariable($Name, $Value, 'User')
    Write-Info "Set user environment variable $Name."
}

function Find-JavaHome {
    param([string]$Root)

    if (-not $Root) {
        return $null
    }

    if (Test-Path -LiteralPath (Join-Path $Root 'bin\java.exe')) {
        return $Root
    }

    if (Test-Path -LiteralPath $Root) {
        $nested = Get-ChildItem -LiteralPath $Root -Directory -ErrorAction SilentlyContinue |
            Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'bin\java.exe') } |
            Select-Object -First 1
        if ($nested) {
            return $nested.FullName
        }
    }

    return $null
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

function Get-SdkManager {
    param([string]$Root)

    $commandLineTools = Join-Path $Root 'cmdline-tools'
    if (-not (Test-Path -LiteralPath $commandLineTools)) {
        return $null
    }

    return Get-ChildItem -LiteralPath $commandLineTools -Directory -ErrorAction SilentlyContinue |
        ForEach-Object { Join-Path $_.FullName 'bin\sdkmanager.bat' } |
        Where-Object { Test-Path -LiteralPath $_ } |
        Select-Object -First 1
}

function Install-MauiWorkload {
    if ($SkipWorkload) {
        Write-Info 'MAUI workload check skipped.'
        return
    }

    $installed = (& dotnet workload list 2>$null | Out-String)
    if ($installed -match '(?m)^\s*maui\s') {
        Write-Info 'The .NET MAUI workload is already installed.'
        return
    }

    Write-Info 'Installing the .NET MAUI workload (this can take several minutes)...'
    & dotnet workload install maui
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet workload install failed with exit code $LASTEXITCODE."
    }
}

function Install-Jdk {
    $existing = Find-JavaHome $JavaSdkDirectory
    if ($existing) {
        Write-Info "JDK already present at '$existing'."
        return $existing
    }

    Write-Info 'Downloading Microsoft OpenJDK 21 (about 200 MB)...'
    $zip = Join-Path $env:TEMP 'dealseeker-jdk-21.zip'
    New-Item -ItemType Directory -Force -Path $JavaSdkDirectory | Out-Null

    try {
        Invoke-WebRequest -Uri $jdkDownloadUrl -OutFile $zip -UseBasicParsing
        Expand-Archive -LiteralPath $zip -DestinationPath $JavaSdkDirectory -Force
    }
    finally {
        if (Test-Path -LiteralPath $zip) {
            Remove-Item -LiteralPath $zip -Force
        }
    }

    $installed = Find-JavaHome $JavaSdkDirectory
    if (-not $installed) {
        throw "The JDK was downloaded but no java.exe was found under '$JavaSdkDirectory'."
    }

    return $installed
}

function Install-AndroidSdk {
    param([Parameter(Mandatory = $true)][string]$JavaHome)

    Write-Info "Installing the Android SDK into '$AndroidSdkDirectory'..."
    Write-Info 'The first run downloads the platform, build-tools and platform-tools.'

    New-Item -ItemType Directory -Force -Path $AndroidSdkDirectory | Out-Null

    $arguments = @(
        'build', $appProject,
        '-f', $androidFramework,
        '-t:InstallAndroidDependencies',
        "-p:AndroidSdkDirectory=$AndroidSdkDirectory",
        "-p:JavaSdkDirectory=$JavaHome",
        '-p:AcceptAndroidSDKLicenses=True',
        '-p:AndroidInstallJavaDependencies=true',
        '-v:minimal',
        '--nologo'
    )

    & dotnet @arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Android SDK installation failed with exit code $LASTEXITCODE."
    }
}

function Install-CommandLineTools {
    if (Get-SdkManager $AndroidSdkDirectory) {
        return
    }

    Write-Info 'Downloading Android command-line tools...'
    $zip = Join-Path $env:TEMP 'dealseeker-cmdline-tools.zip'
    $temp = Join-Path $env:TEMP ('dealseeker-cmdline-tools-' + [guid]::NewGuid().ToString('N'))

    try {
        Invoke-WebRequest -Uri $commandLineToolsUrl -OutFile $zip -UseBasicParsing
        Expand-Archive -LiteralPath $zip -DestinationPath $temp -Force

        $destination = Join-Path $AndroidSdkDirectory 'cmdline-tools\latest'
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
        if (Test-Path -LiteralPath $destination) {
            Remove-Item -LiteralPath $destination -Recurse -Force
        }

        Move-Item -LiteralPath (Join-Path $temp 'cmdline-tools') -Destination $destination
    }
    finally {
        if (Test-Path -LiteralPath $zip) {
            Remove-Item -LiteralPath $zip -Force
        }
        if (Test-Path -LiteralPath $temp) {
            Remove-Item -LiteralPath $temp -Recurse -Force
        }
    }
}

function Install-Emulator {
    param([Parameter(Mandatory = $true)][string]$JavaHome)

    $sdkManager = Get-SdkManager $AndroidSdkDirectory
    if (-not $sdkManager) {
        Install-CommandLineTools
        $sdkManager = Get-SdkManager $AndroidSdkDirectory
    }

    if (-not $sdkManager) {
        throw "sdkmanager was not found under '$AndroidSdkDirectory'."
    }

    $env:JAVA_HOME = $JavaHome
    Add-ToProcessPath (Join-Path $JavaHome 'bin')

    Write-Info 'Accepting Android SDK licenses...'
    ("y`n" * 60) | & $sdkManager --licenses | Out-Null

    Write-Info "Installing the emulator and system image '$SystemImage' (large download)..."
    & $sdkManager --install 'platform-tools' 'emulator' $SystemImage
    if ($LASTEXITCODE -ne 0) {
        throw "Installing the emulator failed with exit code $LASTEXITCODE."
    }

    $avdManager = Join-Path (Split-Path -Parent $sdkManager) 'avdmanager.bat'
    if (-not (Test-Path -LiteralPath $avdManager)) {
        throw "avdmanager was not found at '$avdManager'."
    }

    $existingAvds = (& $avdManager list avd 2>$null | Out-String)
    $avdPattern = '(?m)^\s*Name:\s*' + [regex]::Escape($AvdName) + '\s*$'

    if ($existingAvds -match $avdPattern) {
        Write-Info "Android virtual device '$AvdName' already exists."
        return
    }

    Write-Info "Creating Android virtual device '$AvdName'..."
    'no' | & $avdManager create avd -n $AvdName -k $SystemImage --force
    if ($LASTEXITCODE -ne 0) {
        throw "Creating the AVD '$AvdName' failed with exit code $LASTEXITCODE."
    }
}

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

Write-Heading 'DealsSeeker Android toolchain'
Write-Info "Android SDK : $AndroidSdkDirectory"
Write-Info "Java SDK    : $JavaSdkDirectory"

Assert-Command 'dotnet'

Install-MauiWorkload

$javaHome = Install-Jdk

if (Test-AndroidSdk $AndroidSdkDirectory) {
    Write-Info "Android SDK already present at '$AndroidSdkDirectory'."
}
else {
    Install-AndroidSdk -JavaHome $javaHome
}

if (-not (Test-AndroidSdk $AndroidSdkDirectory)) {
    throw "The Android SDK is still incomplete at '$AndroidSdkDirectory'."
}

$env:ANDROID_HOME = $AndroidSdkDirectory
$env:ANDROID_SDK_ROOT = $AndroidSdkDirectory
$env:JAVA_HOME = $javaHome
Add-ToProcessPath (Join-Path $AndroidSdkDirectory 'platform-tools')
Add-ToProcessPath (Join-Path $AndroidSdkDirectory 'emulator')
Add-ToProcessPath (Join-Path $javaHome 'bin')

if (-not $SkipUserEnvironment) {
    Set-UserEnvironmentVariable 'ANDROID_HOME' $AndroidSdkDirectory
    Set-UserEnvironmentVariable 'ANDROID_SDK_ROOT' $AndroidSdkDirectory
    Set-UserEnvironmentVariable 'JAVA_HOME' $javaHome
}

if ($InstallEmulator) {
    Install-Emulator -JavaHome $javaHome
}

$adb = Join-Path $AndroidSdkDirectory 'platform-tools\adb.exe'
if (-not (Test-Path -LiteralPath $adb)) {
    throw "adb was not found at '$adb'. The Android SDK installation is incomplete."
}

Write-Heading 'Android toolchain ready'
Write-Info "Android SDK : $AndroidSdkDirectory"
Write-Info "Java SDK    : $javaHome"
Write-Info "adb         : $adb"

if ($InstallEmulator) {
    Write-Info "AVD         : $AvdName"
    Write-Info "Start it    : & '$AndroidSdkDirectory\emulator\emulator.exe' -avd $AvdName"
}

exit 0
