# Update chat-room.js version to v=43

$files = @(
    "index.html",
    "watch.html",
    "movie-detail.html",
    "search.html",
    "danh-sach.html",
    "categories.html",
    "hanh-dong.html",
    "phim-theo-quoc-gia.html",
    "phim-x.html",
    "profile.html",
    "payment.html",
    "pricing.html",
    "register.html",
    "login.html",
    "support.html",
    "filter.html"
)

$oldPattern = 'chat-room\.js\?v=\d+'
$newVersion = 'chat-room.js?v=43'

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $newContent = $content -replace $oldPattern, $newVersion
        Set-Content $file -Value $newContent -NoNewline
        Write-Host "Updated: $file"
    } else {
        Write-Host "Not found: $file"
    }
}

Write-Host ""
Write-Host "Done! All files updated to v=43"
