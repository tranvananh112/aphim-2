# ADD CHAT MOBILE CSS TO ALL PAGES
# Script này thêm CSS link mà KHÔNG làm hỏng UTF-8 encoding

$pages = @(
    "index.html",
    "categories.html",
    "phim-theo-quoc-gia.html",
    "movie-detail.html",
    "watch.html",
    "search.html",
    "profile.html",
    "pricing.html",
    "support.html",
    "login.html",
    "register.html",
    "danh-sach.html",
    "filter.html",
    "hanh-dong.html",
    "payment.html",
    "phim-x.html"
)

$searchPattern = '<link rel="stylesheet" href="css/chat-room\.css\?v=\d+">'
$newLine = '    <link rel="stylesheet" href="css/chat-mobile-fixed.css?v=44">'

Write-Host "🚀 Starting to add chat-mobile-fixed.css to all pages..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$skipCount = 0
$errorCount = 0

foreach ($page in $pages) {
    if (-not (Test-Path $page)) {
        Write-Host "⚠️  File not found: $page" -ForegroundColor Yellow
        $errorCount++
        continue
    }

    try {
        # Read file with UTF-8 encoding (NO BOM)
        $content = [System.IO.File]::ReadAllText((Resolve-Path $page), [System.Text.UTF8Encoding]::new($false))
        
        # Check if already added
        if ($content -match 'chat-mobile-fixed\.css') {
            Write-Host "⏭️  Already added: $page" -ForegroundColor Gray
            $skipCount++
            continue
        }

        # Find chat-room.css line
        if ($content -match $searchPattern) {
            # Add new line after chat-room.css
            $content = $content -replace "($searchPattern)", "`$1`n$newLine"
            
            # Save file with UTF-8 encoding (NO BOM)
            $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
            [System.IO.File]::WriteAllText((Resolve-Path $page), $content, $utf8NoBom)
            
            Write-Host "✅ Added to: $page" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "⚠️  chat-room.css not found in: $page" -ForegroundColor Yellow
            $skipCount++
        }
    }
    catch {
        Write-Host "❌ Error processing: $page" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Success: $successCount files" -ForegroundColor Green
Write-Host "⏭️  Skipped: $skipCount files" -ForegroundColor Gray
Write-Host "❌ Errors:  $errorCount files" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "🎉 Done! Added chat-mobile-fixed.css to $successCount pages" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Please verify UTF-8 encoding is correct:" -ForegroundColor Yellow
    Write-Host "   1. Open any modified file in browser" -ForegroundColor Yellow
    Write-Host "   2. Check Vietnamese text displays correctly" -ForegroundColor Yellow
    Write-Host "   3. If broken, run: git checkout HEAD -- [filename]" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  No files were modified" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Test on mobile device or Chrome DevTools" -ForegroundColor White
Write-Host "   2. Open chat widget" -ForegroundColor White
Write-Host "   3. Verify fixed positioning works" -ForegroundColor White
Write-Host "   4. Commit changes: git add . && git commit -m 'feat: add mobile fixed layout for chat'" -ForegroundColor White
