const fs = require('fs');
const path = require('path');

const targetFiles = [
    "f:\\\\Wesite Xem Phim Mới\\\\index.html",
    "f:\\\\Wesite Xem Phim Mới\\\\watch.html",
    "f:\\\\Wesite Xem Phim Mới\\\\support.html",
    "f:\\\\Wesite Xem Phim Mới\\\\search.html",
    "f:\\\\Wesite Xem Phim Mới\\\\register.html",
    "f:\\\\Wesite Xem Phim Mới\\\\login.html",
    "f:\\\\Wesite Xem Phim Mới\\\\profile.html",
    "f:\\\\Wesite Xem Phim Mới\\\\profile\\\\phim-yeu-thich.html",
    "f:\\\\Wesite Xem Phim Mới\\\\profile\\\\lich-su-xem.html",
    "f:\\\\Wesite Xem Phim Mới\\\\profile\\\\goi-thanh-vien.html",
    "f:\\\\Wesite Xem Phim Mới\\\\profile\\\\giao-dich.html"
];

for (const filePath of targetFiles) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/catfish-banner\.css\?v=\d+/g, 'catfish-banner.css?v=19');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Bumped CSS version in', filePath);
    }
}
