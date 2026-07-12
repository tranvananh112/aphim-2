$utf8NoBOM = New-Object System.Text.UTF8Encoding $false
$proj = '.'
$sourceImage = 'F:\Wesite Xem Phim Node\quangcao\728x90-AFF-Cup\728x90-AFF-Cup.gif'

$destFolder = Join-Path $proj 'ads\catfish'
if (Test-Path -LiteralPath $destFolder) {
    $destImage = Join-Path $destFolder '728x90-AFF-Cup.gif'
    Copy-Item -LiteralPath $sourceImage -Destination $destImage -Force
    Write-Output "Copied image to $destImage"
}

$files = Get-ChildItem -LiteralPath $proj -Include *.html, *.ejs, *.js -Recurse -File -ErrorAction SilentlyContinue
foreach ($file in $files) {
    if ($file.FullName -match '\\node_modules\\' -or $file.FullName -match '\\\.git\\') { continue }
    
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -match 'vsbet\.gif') {
        $newContent = $content -replace 'vsbet\.gif', '728x90-AFF-Cup.gif'
        [System.IO.File]::WriteAllText($file.FullName, $newContent, $utf8NoBOM)
        Write-Output "Updated references in $($file.FullName)"
    }
}
Write-Output "Replacement complete for Mới."
