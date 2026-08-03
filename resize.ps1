Add-Type -AssemblyName System.Drawing
$images = Get-ChildItem -Path "assets\images\avatars" -Include *.png, *.jpg -Recurse
foreach ($img in $images) {
    try {
        $bmp = New-Object System.Drawing.Bitmap($img.FullName)
        $newBmp = New-Object System.Drawing.Bitmap($bmp, 150, 150)
        $bmp.Dispose()
        $imgName = $img.FullName
        Remove-Item -Path $imgName -Force
        $newBmp.Save($imgName, [System.Drawing.Imaging.ImageFormat]::Jpeg)
        $newBmp.Dispose()
        Write-Output ("Resized: " + $imgName)
    } catch {
        Write-Output ("Failed: " + $img.FullName)
    }
}
