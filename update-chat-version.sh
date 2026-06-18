#!/bin/bash

# Script để cập nhật version của chat files trên tất cả trang HTML
# Usage: ./update-chat-version.sh <old_version> <new_version>
# Example: ./update-chat-version.sh 40 41

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <old_version> <new_version>"
    echo "Example: $0 40 41"
    exit 1
fi

OLD_VERSION=$1
NEW_VERSION=$2

echo "🔄 Đang cập nhật chat version từ v=$OLD_VERSION sang v=$NEW_VERSION..."
echo ""

# Danh sách các file HTML cần cập nhật
HTML_FILES=(
    "index.html"
    "watch.html"
    "movie-detail.html"
    "search.html"
    "danh-sach.html"
    "categories.html"
    "hanh-dong.html"
    "phim-theo-quoc-gia.html"
    "phim-x.html"
    "profile.html"
    "payment.html"
    "pricing.html"
    "register.html"
    "login.html"
    "support.html"
    "filter.html"
)

# Đếm số file đã cập nhật
UPDATED_COUNT=0

# Cập nhật từng file
for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Đang cập nhật $file..."
        
        # Cập nhật chat-room.css
        sed -i "s/chat-room\.css?v=$OLD_VERSION/chat-room.css?v=$NEW_VERSION/g" "$file"
        
        # Cập nhật chat-room.js
        sed -i "s/chat-room\.js?v=$OLD_VERSION/chat-room.js?v=$NEW_VERSION/g" "$file"
        
        # Cập nhật firebase-chat.js
        sed -i "s/firebase-chat\.js?v=$OLD_VERSION/firebase-chat.js?v=$NEW_VERSION/g" "$file"
        
        UPDATED_COUNT=$((UPDATED_COUNT + 1))
        echo "   ✅ Đã cập nhật $file"
    else
        echo "   ⚠️  Không tìm thấy $file"
    fi
done

echo ""
echo "🎉 Hoàn thành! Đã cập nhật $UPDATED_COUNT/$((${#HTML_FILES[@]})) files"
echo ""
echo "📋 Các file đã cập nhật:"
echo "   - chat-room.css: v=$OLD_VERSION → v=$NEW_VERSION"
echo "   - chat-room.js: v=$OLD_VERSION → v=$NEW_VERSION"
echo "   - firebase-chat.js: v=$OLD_VERSION → v=$NEW_VERSION"
echo ""
echo "🔍 Kiểm tra kết quả:"
echo "   grep -r \"chat-room.*v=$NEW_VERSION\" *.html"
echo ""
echo "✨ Nhớ clear cache và hard reload (Ctrl + Shift + R) khi test!"
