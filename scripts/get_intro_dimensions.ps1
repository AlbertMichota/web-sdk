$path = 'c:\Users\user\Documents\projects\frontend\New slot project\apps\Crypto_Reapers\public\assets\slotintro'
Get-ChildItem -Path $path -Recurse -Include *.png | ForEach-Object {
  try {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    Write-Output "$($_.FullName)`t$($img.Width)x$($img.Height)`t$($_.Length)"
    $img.Dispose()
  } catch {
    Write-Output "ERR: $($_.FullName) - $($_.Exception.Message)"
  }
}