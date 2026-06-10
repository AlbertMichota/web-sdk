param(
  [Parameter(Mandatory=$true)] [string] $Dir,
  [switch] $Force
)

Write-Host "Preparing to reverse-append first 99 frames in '$Dir'..."

if (-not (Test-Path -LiteralPath $Dir)) {
  Write-Error "Directory not found: $Dir"
  exit 1
}

$files = Get-ChildItem -LiteralPath $Dir -Filter *.png -File | Sort-Object Name
if ($files.Count -lt 100) {
  Write-Error "Need at least 100 PNG frames. Found: $($files.Count)"
  exit 1
}

# Parse filenames: prefix + number + ext
$parsed = @()
foreach ($f in $files) {
  $m = [Regex]::Match($f.Name, '^(?<prefix>.*?)(?<num>\d+)(?<ext>\.[^.]+)$')
  if ($m.Success) {
    $parsed += [PSCustomObject]@{
      Name = $f.Name
      FullName = $f.FullName
      Prefix = $m.Groups['prefix'].Value
      NumStr = $m.Groups['num'].Value
      Num = [int]$m.Groups['num'].Value
      Width = $m.Groups['num'].Value.Length
      Ext = $m.Groups['ext'].Value
    }
  }
}

if ($parsed.Count -eq 0) {
  Write-Error "No files matched the expected '<prefix><digits><ext>' pattern."
  exit 1
}

$prefixGroup = ($parsed | Group-Object Prefix | Sort-Object Count -Descending | Select-Object -First 1).Name
$extGroup = ($parsed | Group-Object Ext | Sort-Object Count -Descending | Select-Object -First 1).Name
$widthGroup = ($parsed | Group-Object Width | Sort-Object Count -Descending | Select-Object -First 1).Name

$nums = $parsed | Where-Object { $_.Prefix -eq $prefixGroup -and $_.Ext -eq $extGroup -and $_.Width -eq $widthGroup } | Select-Object -ExpandProperty Num
$numSet = [System.Collections.Generic.HashSet[int]]::new()
foreach ($n in $nums) { $numSet.Add($n) | Out-Null }

function HaveBlock([int] $start, [int] $length) {
  for ($k = 0; $k -lt $length; $k++) {
    if (-not $numSet.Contains($start + $k)) { return $false }
  }
  return $true
}

# Prefer 1..100 if present, else 0..99, else any contiguous 100-length block
$baseStart = $null
if (HaveBlock 1 100) { $baseStart = 1 }
elseif (HaveBlock 0 100) { $baseStart = 0 }
else {
  $minNum = ($nums | Measure-Object -Minimum).Minimum
  $maxNum = ($nums | Measure-Object -Maximum).Maximum
  for ($s = $minNum; $s -le $maxNum - 99; $s++) {
    if (HaveBlock $s 100) { $baseStart = $s; break }
  }
}

if ($null -eq $baseStart) {
  Write-Error "Could not find a contiguous 100-frame block in the detected sequence."
  exit 1
}

$baseEnd = $baseStart + 99
Write-Host "Using base block: $baseStart to $baseEnd (100 frames) with prefix '$prefixGroup', width $widthGroup, ext '$extGroup'."

# Plan copies: first 99 frames (baseStart..baseEnd-1) copied in reverse order to numbers (baseStart+101..baseStart+199)
$copyPlan = @()
for ($s = $baseStart; $s -le ($baseEnd - 1); $s++) {
  $target = $baseStart + 199 - $s
  $copyPlan += [PSCustomObject]@{ source = $s; target = $target }
}

# Detect conflicts
$conflicts = @()
foreach ($p in $copyPlan) {
  $tStr = $p.target.ToString().PadLeft($widthGroup, '0')
  $tName = "$prefixGroup$tStr$extGroup"
  $tPath = Join-Path -Path $Dir -ChildPath $tName
  if (Test-Path -LiteralPath $tPath) { $conflicts += $tPath }
}

if ($conflicts.Count -gt 0 -and -not $Force) {
  Write-Error "Target files already exist. Conflicts: `n$([string]::Join("`n", $conflicts))`nRe-run with -Force to overwrite."
  exit 2
}

# Execute copies
$copied = 0
foreach ($p in $copyPlan | Sort-Object target) {
  $sStr = $p.source.ToString().PadLeft($widthGroup, '0')
  $sName = "$prefixGroup$sStr$extGroup"
  $sPath = Join-Path -Path $Dir -ChildPath $sName

  $tStr = $p.target.ToString().PadLeft($widthGroup, '0')
  $tName = "$prefixGroup$tStr$extGroup"
  $tPath = Join-Path -Path $Dir -ChildPath $tName

  if (-not (Test-Path -LiteralPath $sPath)) {
    Write-Error "Source missing: $sName"
    exit 3
  }

  Copy-Item -LiteralPath $sPath -Destination $tPath -Force:$Force
  $copied++
}

if ($copied -gt 0) {
  $minTarget = ($copyPlan | Measure-Object -Property target -Minimum).Minimum
  $maxTarget = ($copyPlan | Measure-Object -Property target -Maximum).Maximum
  Write-Host "Copied $copied frame(s). Created/updated numbers: $minTarget .. $maxTarget"
} else {
  Write-Host "No frames copied."
}
Write-Host "Done."

exit 0
