# Script để cập nhật version của chat files trên tất cả trang HTML
# Usage: .\update-chat-version.ps1 -OldVersion 40 -NewVersion 41

param(
    [Parameter(Mandatory=$true)]
    [string]$OldVersion,
    
    [Parameter(Mandatory=$true)]
    [string]$NewVersion
)

Write-Host "🔄 Đang cập nhật chat version từ v=$OldVersion sang v=$NewVersion..." -ForegroundColor Cyan
Write-Host ""

# Danh sách các file HTML cần cập nhật
$htmlFiles = @(
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

# Đếm số file đã cập nhật
$updatedCount = 0

# Cập nhật từng file
foreach ($file in $htmlFiles) {
    if (Test-Path $file) {
        Write-Host "📝 Đang cập nhật $file..." -ForegroundColor Yellow
        
        # Đọc nội dung file
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Cập nhật chat-room.css
        $content = $content -replace "chat-room\.css\?v=$OldVersion", "chat-room.css?v=$NewVersion"
        
        # Cập nhật chat-room.js
        $content = $content -replace "chat-room\.js\?v=$OldVersion", "chat-room.js?v=$NewVersion"
        
        # Cập nhật firebase-chat.js
        $content = $content -replace "firebase-chat\.js\?v=$OldVersion", "firebase-chat.js?v=$NewVersion"
        
        # Ghi lại file
        Set-Content $file -Value $content -Encoding UTF8 -NoNewline
        
        $updatedCount++
        Write-Host "   ✅ Đã cập nhật $file" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Không tìm thấy $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Hoàn thành! Đã cập nhật $updatedCount/$($htmlFiles.Count) files" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Các file đã cập nhật:" -ForegroundColor Cyan
Write-Host "   - chat-room.css: v=$OldVersion → v=$NewVersion"
Write-Host "   - chat-room.js: v=$OldVersion → v=$NewVersion"
Write-Host "   - firebase-chat.js: v=$OldVersion → v=$NewVersion"
Write-Host ""
Write-Host "🔍 Kiểm tra kết quả:" -ForegroundColor Cyan
Write-Host "   Get-ChildItem *.html | Select-String 'chat-room.*v=$NewVersion'" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Nhớ clear cache và hard reload (Ctrl + Shift + R) khi test!" -ForegroundColor Yellow
