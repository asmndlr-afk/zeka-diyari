Add-Type -AssemblyName System.Drawing
$images = Get-ChildItem -Path 'assets\images' -File -Filter *.jpg
foreach ($img in $images) {
    try {
        $bmp = New-Object System.Drawing.Bitmap($img.FullName)
        $newBmp = New-Object System.Drawing.Bitmap($bmp, 300, 300)
        $bmp.Dispose()
        $imgName = $img.FullName
        Remove-Item -Path $imgName -Force
        $newBmp.Save($imgName, [System.Drawing.Imaging.ImageFormat]::Jpeg)
        $newBmp.Dispose()
        Write-Output ('Resized: ' + $imgName)
    } catch {
        Write-Output ('Failed: ' + $img.FullName)
    }
}
