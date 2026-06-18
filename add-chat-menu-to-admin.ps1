# Script để thêm menu "Quản lý Chat" vào tất cả trang admin

$adminFiles = @(
    "admin/users.html",
    "admin/movies.html",
    "admin/categories.html",
    "admin/banners.html",
    "admin/comments.html",
    "admin/subscriptions.html",
    "admin/payments.html",
    "admin/supporters.html",
    "admin/settings.html",
    "admin/partner.html"
)

$oldPattern = @'
  <a href="users.html"class="sidebar-nav-item"id="nav-users">
   <i data-lucide="users"style="width: 1em; height: 1em;"></i>
   <span>Người dùng</span>
  </a>
  <a href="comments.html"class="sidebar-nav-item"id="nav-comments">
'@

$newPattern = @'
  <a href="users.html"class="sidebar-nav-item"id="nav-users">
   <i data-lucide="users"style="width: 1em; height: 1em;"></i>
   <span>Người dùng</span>
  </a>
  <a href="chat.html"class="sidebar-nav-item"id="nav-chat">
   <i data-lucide="message-square"style="width: 1em; height: 1em;"></i>
   <span>Quản lý Chat</span>
  </a>
  <a href="comments.html"class="sidebar-nav-item"id="nav-comments">
'@

$updatedCount = 0

foreach ($file in $adminFiles) {
    if (Test-Path $file) {
        Write-Host "📝 Đang cập nhật $file..." -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw -Encoding UTF8
        
        if ($content -match [regex]::Escape($oldPattern)) {
            $content = $content -replace [regex]::Escape($oldPattern), $newPattern
            Set-Content $file -Value $content -Encoding UTF8 -NoNewline
            $updatedCount++
            Write-Host "   ✅ Đã thêm menu Chat vào $file" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Không tìm thấy pattern hoặc đã có menu Chat" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ❌ Không tìm thấy $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Hoàn thành! Đã cập nhật $updatedCount/$($adminFiles.Count) files" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Menu 'Quản lý Chat' đã được thêm vào:" -ForegroundColor Cyan
Write-Host "   - Icon: message-square" -ForegroundColor Gray
Write-Host "   - Link: chat.html" -ForegroundColor Gray
Write-Host "   - Vị trí: Sau 'Người dùng', trước 'Bình luận'" -ForegroundColor Gray
