# Global Input to Textarea Migrator for A Phim Chat Widget
$files = Get-ChildItem -Path . -Filter *.html -Recurse

$matchRegex = '<input\s+[^>]*id="chatMessageInput"[^>]*>'
$replacement = '<textarea id="chatMessageInput" placeholder="Viết tin nhắn..." rows="1" maxlength="1000"></textarea>'

foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    
    if ($content -match $matchRegex) {
        # Multi-line replacement to ensure any variance is sanitized to the perfect textarea
        $newContent = [regex]::Replace($content, $matchRegex, $replacement)
        $newContent | Set-Content $f.FullName -Force
        Write-Host "Migrated Tag -> $($f.FullName)" -ForegroundColor Green
    }
}

Write-Host "HTML input modernization complete!"
