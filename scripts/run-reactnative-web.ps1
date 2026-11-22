<#
.SYNOPSIS
    Runs the DealsSeeker API in one terminal and the React Native UI in another.

.DESCRIPTION
    The API and the UI are started as two separate, independent processes so that each keeps its
    own console, and so that either one can be restarted without touching the other.

    By default (Target = both) two new terminal windows are opened: one for the API and one for
    the Expo UI. The API is given time to become healthy before the UI is started.

    The API listens on port 5005, which is the address the client expects by default:
      - Android emulator : http://10.0.2.2:5005
      - iOS simulator/web: http://localhost:5005
      - Physical device  : http://<machine-lan-ip>:5005

.PARAMETER Target
    api  - run only the API in the current terminal.
    ui   - run only the React Native UI in the current terminal.
    both - open the API and the UI in two separate terminal windows (default).

.PARAMETER ApiPort
    Port the API listens on. Default 5005.

.PARAMETER ApiHost
    Address the API binds to. Default 0.0.0.0, so that the host browser, an Android emulator
    (10.0.2.2) and a physical device on the same network can all reach it.

.PARAMETER ExpoPort
    Port the Expo dev server listens on. Default 8081.

.PARAMETER Platform
    Which client the UI should target, which decides the API base URL:
      web     - host browser or iOS simulator (localhost)  [default]
      android - Android emulator (10.0.2.2)
      ios     - iOS simulator (localhost)
      device  - physical device on the same network (machine LAN address)

.PARAMETER ApiBaseUrl
    Overrides the API base URL handed to the UI, whatever the platform implies.
    Use this when the client runs somewhere the known addresses do not cover.

.PARAMETER Clear
    Clear the Expo bundler cache before starting the UI.

.PARAMETER Wait
    Keep this terminal open until Ctrl+C, so the child terminals can be closed together.

.EXAMPLE
    .\scripts\run-dev.ps1

.EXAMPLE
    .\scripts\run-dev.ps1 -Platform android

.EXAMPLE
    .\scripts\run-dev.ps1 -Platform device

.EXAMPLE
    .\scripts\run-dev.ps1 -Target api
#>
[CmdletBinding()]
param(
    [ValidateSet('api', 'ui', 'both')]
    [string]$Target = 'both',

    [ValidateRange(1, 65535)]
    [int]$ApiPort = 5005,

    [string]$ApiHost = '0.0.0.0',

    [ValidateRange(1, 65535)]
    [int]$ExpoPort = 8081,

    [ValidateSet('android', 'ios', 'web', 'device')]
    [string]$Platform = 'web',

    [string]$ApiBaseUrl,

    [switch]$Clear,

    [switch]$Wait
)

$ErrorActionPreference = 'Stop'

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
        'android' { return "http://10.0.2.2:$ApiPort" }
        'device' { return "http://$(Get-LanAddress):$ApiPort" }
        default { return "http://localhost:$ApiPort" }
    }
}

function Write-AddressGuide {
    Write-Info 'Reachable addresses:'
    Write-Info "  host browser / iOS simulator : http://localhost:$ApiPort"
    Write-Info "  Android emulator (10.0.2.2) : http://10.0.2.2:$ApiPort"
    Write-Info "  physical device (LAN)       : http://$(Get-LanAddress):$ApiPort"
    Write-Info "  UI is configured with       : $env:EXPO_PUBLIC_API_BASE_URL"
}

function Assert-Command {
    param([string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "'$Name' was not found on PATH. Install it and try again."
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

function Invoke-Ui {
    Write-Heading 'DealsSeeker UI (React Native / Expo)'
    Write-Info "API base URL : $env:EXPO_PUBLIC_API_BASE_URL"
    Write-Info "Expo server  : http://localhost:$ExpoPort"
    Write-Info 'Press Ctrl+C to stop.'
    Write-AddressGuide

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

    $expoArgs = @('expo', 'start', '--port', $ExpoPort)
    if ($Clear) {
        $expoArgs += '--clear'
    }

    Push-Location $appDir
    try {
        & npx @expoArgs
        if ($LASTEXITCODE -ne 0) {
            throw "Expo exited with code $LASTEXITCODE."
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
    $childArguments = '-NoExit -ExecutionPolicy Bypass -File "{0}" -Target {1} -ApiPort {2} -ApiHost {3} -ExpoPort {4} -Platform {5}' -f `
        $scriptPath, $ChildTarget, $ApiPort, $ApiHost, $ExpoPort, $Platform

    if ($Clear) {
        $childArguments += ' -Clear'
    }

    if ($ApiBaseUrl) {
        $childArguments += ' -ApiBaseUrl "{0}"' -f $ApiBaseUrl
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

    Write-Info 'The API did not become healthy in time; the UI is started anyway.' -ForegroundColor Yellow
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

$env:EXPO_PUBLIC_API_BASE_URL = Resolve-ApiBaseUrl
$env:NODE_ENV = 'development'

switch ($Target) {
    'api' {
        Invoke-Api
    }

    'ui' {
        Invoke-Ui
    }

    'both' {
        Write-Heading 'DealsSeeker - starting API and UI'
        Write-Info "API           : http://localhost:$ApiPort (bound to $ApiHost)"
        Write-Info "API base URL  : $env:EXPO_PUBLIC_API_BASE_URL"
        Write-Info "Expo server   : http://localhost:$ExpoPort"
        Write-Info 'Two terminals will be opened. Close them with Ctrl+C.'
        Write-AddressGuide

        $apiProcess = Start-ChildTerminal -ChildTarget 'api' -Title 'DealsSeeker API'

        Wait-ApiHealthy | Out-Null

        $uiProcess = Start-ChildTerminal -ChildTarget 'ui' -Title 'DealsSeeker UI'

        Write-Host ''
        Write-Host '   API terminal and UI terminal are running.' -ForegroundColor Green
        Write-Host '   Press Ctrl+C in this terminal to stop waiting.' -ForegroundColor Gray

        if ($Wait) {
            while ($true) {
                Start-Sleep -Seconds 3600
            }
        }
    }
}
