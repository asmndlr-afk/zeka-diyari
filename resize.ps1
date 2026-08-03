Add-Type -AssemblyName System.Drawing
$folders = @('assets\images\pixar_heads', 'assets\images\pixar_fruits', 'assets\images\pixar_tiles')
foreach ($folder in $folders) {
    $images = Get-ChildItem -Path $folder -Include *.png, *.jpg -Recurse
    foreach ($img in $images) {
        try {
            $bmp = New-Object System.Drawing.Bitmap($img.FullName)
            $newBmp = New-Object System.Drawing.Bitmap($bmp, 150, 150)
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
}
