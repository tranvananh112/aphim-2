# Fix Vietnamese Encoding in HTML Files
# This script fixes broken UTF-8 encoding in categories.html and phim-theo-quoc-gia.html

$files = @(
    "categories.html",
    "phim-theo-quoc-gia.html"
)

$replacements = @{
    "Th? Lo?i" = "Thể Loại"
    "Qu?c Gia" = "Quốc Gia"
    "h?t d?ng" = "hỗ trợ động"
    "Ng?n ng?" = "Ngôn ngữ"
    "Chuy?n ngh?" = "Chuyên nghiệp"
    "Kh�m ph�" = "Khám phá"
    "y�u th�ch" = "yêu thích"
    "c?a b?n" = "của bạn"
    "Quay l?i" = "Quay lại"
    "danh s�ch" = "danh sách"
    "mi?n ph�" = "miễn phí"
    "thuy?t minh" = "thuyết minh"
    "l?ng ti?ng" = "lồng tiếng"
    "m?i kh?ng l?" = "mới không lỗ"
    "chi?u r?p" = "chiếu rạp"
    "phim b?" = "phim bộ"
    "phim l?" = "phim lẻ"
    "nhu Vi?t Nam" = "như Việt Nam"
    "H�n Qu?c" = "Hàn Quốc"
    "Trung Qu?c" = "Trung Quốc"
    "Th�i Lan" = "Thái Lan"
    "Nh?t B?n" = "Nhật Bản"
    "�u M?" = "Âu Mỹ"
    "da d?ng" = "đa dạng"
    "n?n t?ng" = "nền tảng"
    "tr?c tuy?n" = "trực tuyến"
    "nh?t nam" = "nhất năm"
    "ch?t lu?ng" = "chất lượng"
    "Gi? h?t d?ng" = "Giờ hỗ trợ động"
    "Ph?n h?i nhanh" = "Phản hồi nhanh"
    "C?ng d?ng s?i n?i" = "Cộng đồng sôi nổi"
    "K?t n?i v?i ngu?i xem" = "Kết nối với người xem"
    "Chat th?i gian th?" = "Chat thời gian thực"
    "Nh?n tin ngay l?p" = "Nhắn tin ngay lập"
    "kh�ng d? tr?" = "không độ trễ"
    "Gi? h?t d?ng" = "Giờ hỗ trợ động"
    "24/7 � Ph?n h?i nhanh" = "24/7 ⚡ Phản hồi nhanh"
    "Ng?n ng?" = "Ngôn ngữ"
    "Ti?ng Vi?t � Ti?ng Anh" = "Tiếng Việt ⚡ Tiếng Anh"
    "Chuy?n ngh??" = "Chuyên nghiệp"
    "�u?c d?o t?o b?i b?n" = "Được đào tạo bởi bản"
    "T?i th?u" = "Tối ưu"
    "Xong!" = "Xong!"
    "? Anti-flash: ?n grid th? lo?i ngay n?u dang ? ch? d? xem phim c?a th? lo?i" = "✓ Anti-flash: Ẩn grid thể loại ngay nếu đang ở chế độ xem phim của thể loại"
}

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..." -ForegroundColor Cyan
        
        # Read file with UTF-8 encoding
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Apply all replacements
        foreach ($key in $replacements.Keys) {
            $content = $content -replace [regex]::Escape($key), $replacements[$key]
        }
        
        # Save file with UTF-8 encoding (no BOM)
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText((Resolve-Path $file), $content, $utf8NoBom)
        
        Write-Host "✓ Fixed $file" -ForegroundColor Green
    } else {
        Write-Host "✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n✓ All files processed!" -ForegroundColor Green
Write-Host "Please verify the files manually to ensure all Vietnamese text is correct." -ForegroundColor Yellow
