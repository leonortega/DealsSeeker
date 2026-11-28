param([Parameter(Mandatory = $true)][string[]]$Xml)

foreach ($file in $Xml) {
  $raw = Get-Content $file -Raw
  $allBounds = [regex]::Matches($raw, 'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"')
  $displayRight = ($allBounds | ForEach-Object { [int]$_.Groups[3].Value } | Measure-Object -Maximum).Maximum
  $displayBottom = ($allBounds | ForEach-Object { [int]$_.Groups[4].Value } | Measure-Object -Maximum).Maximum
  $rotation = if ($raw -match '<hierarchy rotation="(\d+)"') { $Matches[1] } else { '?' }
  "display=${displayRight}x${displayBottom} rotation=$rotation"
  $nodes = [regex]::Matches($raw, '<node [^>]+>')
  $clickable = @()
  $issues = @()
  foreach ($node in $nodes) {
    $tag = $node.Value
    if ($tag -notmatch 'clickable="true"') { continue }
    $name = if ($tag -match 'content-desc="([^"]*)"') { $Matches[1] } elseif ($tag -match 'text="([^"]*)"') { $Matches[1] } else { '(unnamed)' }
    $bounds = if ($tag -match 'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"') { $Matches } else { continue }
    $left = [int]$bounds[1]; $top = [int]$bounds[2]; $right = [int]$bounds[3]; $bottom = [int]$bounds[4]
    $width = $right - $left; $height = $bottom - $top
    $clickable += "$name [$width x $height] @ ($left,$top)"
    if ($width -lt 144 -or $height -lt 144) { $issues += "$name is below 48dp floor (${width}x${height}px)" }
    if ($left -lt 0 -or $top -lt 0 -or $right -gt $displayRight -or $bottom -gt $displayBottom) { $issues += "$name is outside the display bounds" }
    if (-not $name -or $name -eq '(unnamed)') { $issues += 'clickable node has no name' }
  }
  "`n=== $(Split-Path $file -Leaf) ==="
  "clickable nodes: $($clickable.Count)"
  $clickable | Select-Object -First 30
  "issues: $($issues.Count)"
  $issues | Select-Object -First 30
}
