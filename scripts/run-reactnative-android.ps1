[CmdletBinding()]
param(
    [string]$JavaHome = "C:\Program Files (x86)\Java\jdk-21.0.10",
    [string]$AndroidSdkRoot = "C:\Users\mlortega\AppData\Local\Android\Sdk",
    [string]$JunctionPath = "C:\Endava\EndevLocal\rn",
    [string]$ApiBaseUrl = "http://10.0.2.2:5005",
    [switch]$SkipBuild,
    [switch]$SkipClean
)

$ErrorActionPreference = "Stop"

function Get-NormalizedPath {
    param([Parameter(Mandatory = $true)][string]$Path)

    return [System.IO.Path]::GetFullPath($Path)
}

function Add-ToProcessPath {
    param([Parameter(Mandatory = $true)][string]$PathToAdd)

    if (-not (Test-Path -LiteralPath $PathToAdd)) {
        return
    }

    $parts = $env:Path -split ';' | Where-Object { $_ }
    if ($parts -contains $PathToAdd) {
        return
    }

    $env:Path = "$PathToAdd;$env:Path"
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Get-NormalizedPath (Join-Path $scriptDir "..")
$sourceAppDir = Get-NormalizedPath (Join-Path $repoRoot "src\DealsSeeker.ReactNative")
$androidDir = Join-Path $sourceAppDir "android"
$localPropertiesPath = Join-Path $androidDir "local.properties"

if (-not (Test-Path -LiteralPath (Join-Path $sourceAppDir "package.json"))) {
    throw "React Native app not found at '$sourceAppDir'."
}

if (-not (Test-Path -LiteralPath $JavaHome)) {
    throw "JAVA_HOME path not found: '$JavaHome'."
}

if (-not (Test-Path -LiteralPath $AndroidSdkRoot)) {
    throw "ANDROID_SDK_ROOT path not found: '$AndroidSdkRoot'."
}

$env:JAVA_HOME = $JavaHome
$env:ANDROID_HOME = $AndroidSdkRoot
$env:ANDROID_SDK_ROOT = $AndroidSdkRoot
$env:EXPO_PUBLIC_API_BASE_URL = $ApiBaseUrl
$env:NODE_ENV = "development"

Add-ToProcessPath (Join-Path $JavaHome "bin")
Add-ToProcessPath (Join-Path $AndroidSdkRoot "platform-tools")
Add-ToProcessPath (Join-Path $AndroidSdkRoot "cmdline-tools\latest\bin")
Add-ToProcessPath (Join-Path $AndroidSdkRoot "emulator")

$junctionParent = Split-Path -Parent $JunctionPath
if (-not (Test-Path -LiteralPath $junctionParent)) {
    New-Item -ItemType Directory -Path $junctionParent | Out-Null
}

if (Test-Path -LiteralPath $JunctionPath) {
    $junctionItem = Get-Item -LiteralPath $JunctionPath -Force
    $junctionTarget = @($junctionItem.Target)[0]

    if ($junctionTarget) {
        $normalizedTarget = Get-NormalizedPath $junctionTarget
        if ($normalizedTarget -ne $sourceAppDir) {
            throw "Junction path '$JunctionPath' already points to '$normalizedTarget'."
        }
    } elseif ((Get-NormalizedPath $JunctionPath) -ne $sourceAppDir) {
        throw "Path '$JunctionPath' already exists and is not the expected junction target."
    }
} else {
    New-Item -ItemType Junction -Path $JunctionPath -Target $sourceAppDir | Out-Null
}

$sdkDirValue = $AndroidSdkRoot.Replace('\', '\\')
$localPropertiesContent = "sdk.dir=$sdkDirValue"
$currentLocalProperties = if (Test-Path -LiteralPath $localPropertiesPath) {
    Get-Content -LiteralPath $localPropertiesPath -Raw
} else {
    $null
}

if ($currentLocalProperties -ne $localPropertiesContent) {
    Set-Content -LiteralPath $localPropertiesPath -Value $localPropertiesContent -NoNewline
}

$junctionAndroidDir = Join-Path $JunctionPath "android"
$junctionCxxDir = Join-Path $junctionAndroidDir "app\.cxx"

Write-Host "Source app   : $sourceAppDir"
Write-Host "Junction path: $JunctionPath"
Write-Host "JAVA_HOME    : $env:JAVA_HOME"
Write-Host "ANDROID SDK  : $env:ANDROID_SDK_ROOT"
Write-Host "API base URL : $env:EXPO_PUBLIC_API_BASE_URL"

Push-Location $JunctionPath
try {
    & ".\android\gradlew.bat" --stop | Out-Host

    if (-not $SkipClean -and (Test-Path -LiteralPath $junctionCxxDir)) {
        cmd /c "rmdir /s /q `"$junctionCxxDir`""
    }

    if ($SkipBuild) {
        Write-Host "Setup complete. Build skipped."
        return
    }

    & "npx" "expo" "run:android"
    if ($LASTEXITCODE -ne 0) {
        throw "Android build failed with exit code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
}
