
# =============================================================
# APhim — Inject Inline Ad Banners into all pages
# Strategy: Insert banner in natural whitespace before footer/input-footer
# =============================================================

$rootPath = "f:\Wesite Xem Phim"

# HTML của 1 banner inline (3 partner ngang hàng)
$bannerHTML = @'
    <!-- [INLINE-AD] APhim Partner Banners -->
    <div class="aphim-inline-ad">
        <span class="aphim-inline-ad-label">Quảng cáo</span>
        <div class="aphim-inline-ad-inner">
            <a class="aphim-inline-ad-item" href="https://www.aa8qbet.com/?ch=74858ce908" target="_blank" rel="noopener nofollow" aria-label="8QBet">
                <img src="/quangcao/8pbet/banner_8Qbet.gif" alt="8QBet" loading="lazy">
            </a>
            <a class="aphim-inline-ad-item" href="https://vsbet294.com/p/BSYk" target="_blank" rel="noopener nofollow" aria-label="VSBet">
                <img src="/ads/catfish/vsbet.gif" alt="VSBet" loading="lazy">
            </a>
            <a class="aphim-inline-ad-item" href="https://colatv88.live/" target="_blank" rel="noopener nofollow" aria-label="ColaTV">
                <img src="/ads/catfish/colatv.gif" alt="ColaTV" loading="lazy">
            </a>
            <a class="aphim-inline-ad-item" href="https://colascores.com/" target="_blank" rel="noopener nofollow" aria-label="ColaScore">
                <img src="/ads/catfish/colascore.gif" alt="ColaScore" loading="lazy">
            </a>
        </div>
    </div>
    <!-- [/INLINE-AD] -->
'@

# CSS link để thêm vào <head>
$cssLink = '    <link rel="stylesheet" href="/css/inline-ad.css?v=1">'

# Danh sách trang và anchor để insert BEFORE (đặt banner phía trên anchor)
# watch.html      -> trước </section> của comments-section (sau bình luận)
# search.html     -> trước input-footer (khu vực cuối trang)
# movie-detail.html -> trước comments-section (phía trên bình luận)
# các trang còn lại -> trước input-footer hoặc </main>

$pagesConfig = @{
    "watch.html"               = 'id="input-footer"'
    "search.html"              = 'id="input-footer"'
    "movie-detail.html"        = 'id="input-footer"'
    "danh-sach.html"           = 'id="input-footer"'
    "index.html"               = 'id="input-footer"'
    "profile.html"             = 'id="input-footer"'
    "pricing.html"             = 'id="input-footer"'
    "support.html"             = 'id="input-footer"'
    "login.html"               = 'id="input-footer"'
    "register.html"            = 'id="input-footer"'
    "payment.html"             = 'id="input-footer"'
    "categories.html"          = 'id="input-footer"'
    "filter.html"              = 'id="input-footer"'
    "hanh-dong.html"           = 'id="input-footer"'
    "phim-theo-quoc-gia.html"  = 'id="input-footer"'
    "phim-x.html"              = 'id="input-footer"'
    "partner.html"             = 'id="input-footer"'
}

$injected = 0
$skipped  = 0

foreach ($entry in $pagesConfig.GetEnumerator()) {
    $filePath = Join-Path $rootPath $entry.Key
    $anchor   = $entry.Value

    if (-not (Test-Path $filePath)) {
        Write-Host "SKIP (not found): $($entry.Key)"
        $skipped++
        continue
    }

    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

    # Bỏ qua nếu đã inject rồi
    if ($content -match '\[INLINE-AD\]') {
        Write-Host "SKIP (already injected): $($entry.Key)"
        $skipped++
        continue
    }

    # Thêm CSS vào <head> nếu chưa có
    if ($content -notmatch 'inline-ad\.css') {
        $content = $content -replace '(<link[^>]+catfish-banner\.css[^>]*>)', "`$1`n$cssLink"
    }

    # Tìm dòng chứa anchor và chèn banner trước nó
    if ($content -match [regex]::Escape($anchor)) {
        # Tìm vị trí mở thẻ div/section chứa anchor đó
        $anchorPattern = '(\s*)<div[^>]+' + [regex]::Escape($anchor)
        if ($content -match $anchorPattern) {
            $content = $content -replace $anchorPattern, ($bannerHTML + "`n`$0")
        } else {
            # Fallback: insert trước phần tử chứa anchor
            $content = $content -replace "(\s*)(<[^>]+" + [regex]::Escape($anchor) + ")", ($bannerHTML + "`n`$0")
        }
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
        Write-Host "OK: $($entry.Key)"
        $injected++
    } else {
        # Fallback nếu không tìm thấy anchor: insert trước </main> hoặc </body>
        if ($content -match '</main>') {
            $content = $content -replace '</main>', ($bannerHTML + "`n</main>")
        } elseif ($content -match '</body>') {
            $content = $content -replace '</body>', ($bannerHTML + "`n</body>")
        }
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
        Write-Host "FALLBACK: $($entry.Key)"
        $injected++
    }
}

Write-Host "`n=== DONE: Injected=$injected | Skipped=$skipped ==="
