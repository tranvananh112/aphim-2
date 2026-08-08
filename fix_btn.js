const fs = require('fs');
const path = require('path');

const targetFiles = [
    "f:\\\\Wesite Xem Phim\\\\login.html",
    "f:\\\\Wesite Xem Phim\\\\register.html",
    "f:\\\\Wesite Xem Phim Mới\\\\login.html",
    "f:\\\\Wesite Xem Phim Mới\\\\register.html",
    "f:\\\\Wesite Xem Phim Node\\\\views\\\\login.ejs",
    "f:\\\\Wesite Xem Phim Node\\\\views\\\\register.ejs"
];

for (const filePath of targetFiles) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Find `>?</a>` where the previous line/context is `class="page-close-btn"`
        content = content.replace(/return false; \}">(?:\?|×)<\/a>/g, 'return false; }">&times;</a>');
        content = content.replace(/return false; }">\?<\/a>/g, 'return false; }">&times;</a>');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed button in', filePath);
    }
}
