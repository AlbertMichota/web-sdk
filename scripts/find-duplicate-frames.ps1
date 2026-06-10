param(
  [Parameter(Mandatory=$true)] [string] $Dir,
  [Parameter(Mandatory=$false)] [string] $Out
)

Write-Host "Scanning PNG sequence in '$Dir' for exact duplicates..."

if (-not (Test-Path -LiteralPath $Dir)) {
  Write-Error "Directory not found: $Dir"
  exit 1
}

$files = Get-ChildItem -LiteralPath $Dir -Filter *.png -File | Sort-Object Name
if ($files.Count -eq 0) {
  Write-Host "No PNG files found in $Dir"
  exit 0
}

# Use System.Drawing to decode and normalize to 32bpp ARGB pixel data
$seen = @{}
$results = @()

for ($i = 0; $i -lt $files.Count; $i++) {
  $f = $files[$i]
  $bmp = [System.Drawing.Bitmap]::FromFile($f.FullName)
  try {
    $pf = [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    $rect = [System.Drawing.Rectangle]::new(0, 0, $bmp.Width, $bmp.Height)
    $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, $pf)
    try {
      $byteCount = $data.Stride * $bmp.Height
      $bytes = New-Object byte[] $byteCount
      [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $byteCount)

      $sha = [System.Security.Cryptography.SHA256]::Create()
      $prefix = [System.Text.Encoding]::UTF8.GetBytes("$($bmp.Width)x$($bmp.Height)")
      $ms = New-Object System.IO.MemoryStream
      $ms.Write($prefix, 0, $prefix.Length) | Out-Null
      $ms.Write($bytes, 0, $bytes.Length) | Out-Null
      $hash = ([BitConverter]::ToString($sha.ComputeHash($ms.ToArray()))).Replace('-', '').ToLower()

      if (-not $seen.ContainsKey($hash)) {
        $seen[$hash] = @{ firstIndex = $i; firstFile = $f.Name; occurrences = @(@{ index = $i; file = $f.Name }) }
      }
      else {
        $info = $seen[$hash]
        $occ = $info.occurrences + @(@{ index = $i; file = $f.Name })
        $info.occurrences = $occ
        $loopLen = $i - $info.firstIndex
        $results += [PSCustomObject]@{
          matchHash = $hash
          firstIndex = $info.firstIndex
          firstFile = $info.firstFile
          index = $i
          file = $f.Name
          loopLength = $loopLen
        }
        $seen[$hash] = $info
      }
    }
    finally {
      $bmp.UnlockBits($data)
    }
  }
  finally {
    $bmp.Dispose()
  }
}

Write-Host "Scanned $($files.Count) frame(s)."
if ($results.Count -eq 0) {
  Write-Host "No exact duplicates found."
}
else {
  Write-Host "Found $($results.Count) duplicate match(es):"
  foreach ($r in $results) {
    Write-Host ("- {0} == {1} (indices {2} -> {3}, loop length {4} frame(s))" -f $r.firstFile, $r.file, $r.firstIndex, $r.index, $r.loopLength)
  }
}

if ($Out) {
  $summary = [PSCustomObject]@{
    directory = $Dir
    totalFrames = $files.Count
    matches = $results
  }
  $json = $summary | ConvertTo-Json -Depth 5
  $outPath = if ([System.IO.Path]::IsPathRooted($Out)) { $Out } else { Join-Path -Path (Get-Location) -ChildPath $Out }
  $outDir = [System.IO.Path]::GetDirectoryName($outPath)
  if ($outDir -and -not (Test-Path -LiteralPath $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
  Set-Content -LiteralPath $outPath -Value $json -Encoding UTF8
  Write-Host "Saved summary to: $Out"
}

exit 0
