param(
  [Parameter(Mandatory = $true)][string]$Path,
  [string]$Serial = 'emulator-5554'
)

$adb = 'C:\Users\marce\AppData\Local\Android\Sdk\platform-tools\adb.exe'
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $adb
$psi.Arguments = "-s $Serial exec-out screencap -p"
$psi.RedirectStandardOutput = $true
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true
$process = [System.Diagnostics.Process]::Start($psi)
$buffer = New-Object System.IO.MemoryStream
$process.StandardOutput.BaseStream.CopyTo($buffer)
$process.WaitForExit()
$bytes = $buffer.ToArray()
[System.IO.File]::WriteAllBytes((Join-Path (Get-Location) $Path), $bytes)
Write-Output "$Path : $($bytes.Length) bytes"
