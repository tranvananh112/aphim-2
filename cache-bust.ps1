# Global CSS Cache Bust Utility for A Phim
$files = Get-ChildItem -Path . -Filter *.html -Recurse

foreach ($f in $files) {
    $content = Get-Content $f.FullName
    $modified = @()
    $changed = $false
    
    foreach ($line in $content) {
        $newLine = $line
        if ($newLine -match 'chat-room\.css\?v=\d+') {
            $newLine = $newLine -replace 'chat-room\.css\?v=\d+', 'chat-room.css?v=65'
            $changed = $true
        }
        if ($newLine -match 'chat-mobile-fixed\.css\?v=\d+') {
            $newLine = $newLine -replace 'chat-mobile-fixed\.css\?v=\d+', 'chat-mobile-fixed.css?v=65'
            $changed = $true
        }
        if ($newLine -match 'chat-room\.js\?v=\d+') {
            $newLine = $newLine -replace 'chat-room\.js\?v=\d+', 'chat-room.js?v=65'
            $changed = $true
        }
        $modified += $newLine
    }
    
    if ($changed) {
        $modified | Set-Content $f.FullName -Force
        Write-Host "Busted Cache -> $($f.FullName)" -ForegroundColor Green
    }
}
Write-Host "Cache bust completed successfully!"
