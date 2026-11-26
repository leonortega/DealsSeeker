<#
.SYNOPSIS
    Starts the DealsSeeker API and Expo dev server for running the app on a physical device.

.DESCRIPTION
    The phone runs the app through Expo Go (or a dev build installed from EAS); no local native
    build or USB connection is needed. This script starts only the two services it needs:

      - the API, in a separate terminal, via run-reactnative-android.ps1 -Target api
      - Metro, in the current terminal, using tunnel mode by default so no inbound firewall rule is needed

    An API or Metro process that is already listening is left running; no duplicate instance is started.

    Expo Go must support SDK 58; update it from the Play Store if the QR code reports a version mismatch.

.PARAMETER ApiPort
    Port the API listens on. Default 5005.

.PARAMETER ExpoPort
    Port Metro listens on. Default 8081.

.PARAMETER ApiBaseUrl
    Overrides the API URL handed to Metro. Defaults to this machine's LAN address.

.PARAMETER MetroHost
    'tunnel' (default) works without firewall changes. 'lan' uses the machine's LAN address
    and requires port 8081 to be reachable from the device.

.PARAMETER Client
    'go' (default) targets the Expo Go app. 'dev-client' targets a development build installed from EAS.

.EXAMPLE
    .\scripts\run-expo-go.ps1

.EXAMPLE
    .\scripts\run-expo-go.ps1 -Client dev-client -MetroHost lan
#>
[CmdletBinding()]
param(
    [ValidateRange(1, 65535)]
    [int]$ApiPort = 5005,

    [ValidateRange(1, 65535)]
    [int]$ExpoPort = 8081,

    [string]$ApiBaseUrl,

    [ValidateSet('tunnel', 'lan')]
    [string]$MetroHost = 'tunnel',

    [ValidateSet('go', 'dev-client')]
    [string]$Client = 'go',

    [switch]$Clear
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $scriptDir '..'))
$appDir = Join-Path $repoRoot 'src\DealsSeeker.ReactNative'
$apiScript = Join-Path $scriptDir 'run-reactnative-android.ps1'

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

function Test-PortListening {
    param([int]$Port)
    return @(Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue).Count -gt 0
}

function Start-Api {
    if (Test-PortListening $ApiPort) {
        Write-Info "API is already listening on port $ApiPort; leaving it running." -ForegroundColor Yellow
        return
    }

    $arguments = '-NoExit -ExecutionPolicy Bypass -File "{0}" -Target api -Platform device -ApiPort {1}' -f `
        $apiScript, $ApiPort
    Start-Process -FilePath 'powershell.exe' -ArgumentList $arguments -WorkingDirectory $repoRoot | Out-Null
    Write-Info 'API started in a separate terminal.'
}

function Start-Metro {
    if (Test-PortListening $ExpoPort) {
        Write-Info "Metro is already listening on port $ExpoPort; leaving it running." -ForegroundColor Yellow
        Write-Info 'If it was started for the emulator, restart it manually to apply the API URL above.'
        return
    }

    Write-Info "Metro host   : $MetroHost"
    Write-Info "Client       : $Client"
    Write-Info "Expo server  : port $ExpoPort"
    Write-Info 'Press Ctrl+C to stop Metro.'

    $expoArgs = @('start', "--$Client", '--host', $MetroHost, '--port', "$ExpoPort")
    if ($Clear) {
        $expoArgs += '--clear'
    }

    Push-Location $appDir
    try {
        & npx expo @expoArgs
    }
    finally {
        Pop-Location
    }
}

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if (-not (Test-Path -LiteralPath $apiScript)) {
    throw "API runner not found at '$apiScript'."
}

if (-not (Test-Path -LiteralPath (Join-Path $appDir 'package.json'))) {
    throw "React Native app not found at '$appDir'."
}

Assert-Command 'npx'

if ($ApiBaseUrl) {
    $env:EXPO_PUBLIC_API_BASE_URL = $ApiBaseUrl.TrimEnd('/')
}
else {
    $env:EXPO_PUBLIC_API_BASE_URL = "http://$(Get-LanAddress):$ApiPort"
}
$env:NODE_ENV = 'development'

Write-Heading 'DealsSeeker EAS dev build services'
Write-Info "API base URL : $env:EXPO_PUBLIC_API_BASE_URL"
Write-Info 'Scan the QR code printed by Metro with Expo Go (or enter its URL in the dev build launcher).'

Start-Api
Start-Metro
