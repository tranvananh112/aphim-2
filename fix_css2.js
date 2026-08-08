const fs = require('fs');
const path = require('path');

const cssToAdd = `
/* ── Ultimate Fix for Video Height ── */
.catfish-item-desktop-only {
    height: 70px !important;
    max-height: 70px !important;
    overflow: hidden !important;
}

.catfish-row:first-child .catfish-item {
    height: 70px !important;
    max-height: 70px !important;
    overflow: hidden !important;
}

.catfish-row:last-child .catfish-item {
    height: 55px !important;
    max-height: 55px !important;
    overflow: hidden !important;
}

.catfish-item video {
    height: 100% !important;
    max-height: 100% !important;
}

@media (max-width: 768px) {
    .catfish-rotate-slot,
    .catfish-row:first-child .catfish-item {
        height: 60px !important;
        max-height: 60px !important;
    }
    .catfish-row:last-child .catfish-item {
        height: 50px !important;
        max-height: 50px !important;
    }
}
`;

const projectDirs = [
    "f:\\\\Wesite Xem Phim Mới\\\\css\\\\catfish-banner.css",
    "f:\\\\Wesite Xem Phim Node\\\\public\\\\css\\\\catfish-banner.css"
];

for (const filePath of projectDirs) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('Ultimate Fix for Video Height')) {
            content += '\\n\\n' + cssToAdd;
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Appended ultimate height fix to', filePath);
        }
    }
}
