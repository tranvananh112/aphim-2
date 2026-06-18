# Sync profile.html modifications to sub-pages
$source = "profile.html"
$dir = "profile"

if (Test-Path $source) {
    $pages = @("cua-hang.html", "goi-thanh-vien.html", "phim-yeu-thich.html", "lich-su-xem.html", "giao-dich.html", "danh-sach.html")
    foreach ($p in $pages) {
        $dest = Join-Path $dir $p
        Copy-Item $source $dest -Force
        Write-Host "Synced -> $dest"
    }
    Write-Host "Successfully synchronized all profile sub-pages."
} else {
    Write-Host "Error: profile.html not found."
}
