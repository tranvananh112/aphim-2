$snippet = @"
    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="shortcut icon" href="/favicon.ico">
"@

$files = Get-ChildItem -Path . -Filter *.html

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match 'apple-touch-icon\.png') {
        Write-Host "Skipping $($file.Name) (already has new snippet)"
        continue
    }

    # Remove old links
    $content = $content -replace '(?im)^\s*<link[^>]+rel=["'']?(?:icon|apple-touch-icon|shortcut icon|manifest)["'']?[^>]*>\r?\n?', ''
    $content = $content -replace '(?m)^\s*<!-- Favicon -->\r?\n?', ''
    
    # Insert new snippet after </title>
    $content = $content -replace '(?i)(</title>)', "${1}
$snippet"
    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    Write-Host "Updated $($file.Name)"
}
