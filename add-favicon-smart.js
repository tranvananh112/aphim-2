const fs = require('fs');
const path = require('path');

const directoryPath = 'f:\\Wesite Xem Phim';

function addFaviconToHtml(filePath) {
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Check if the 192x192 icon is already there
    if (html.includes('href="/android-chrome-192x192.png"')) {
        return; // Already added
    }

    const newTags = `
    <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">`;

    const faviconRegex = /<!-- Favicon -->/i;
    
    if (faviconRegex.test(html)) {
        html = html.replace(faviconRegex, `<!-- Favicon -->${newTags}`);
        fs.writeFileSync(filePath, html, 'utf8');
        console.log('Added 192x192 & 512x512 icons to', filePath);
    } else {
        // If there's no <!-- Favicon -->, try to insert right before </head>
        const headEndRegex = /<\/head>/i;
        if (headEndRegex.test(html)) {
            html = html.replace(headEndRegex, `${newTags}\n</head>`);
            fs.writeFileSync(filePath, html, 'utf8');
            console.log('Added 192x192 & 512x512 icons (before </head>) to', filePath);
        }
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                processDirectory(fullPath);
            }
        } else if (fullPath.endsWith('.html')) {
            addFaviconToHtml(fullPath);
        }
    }
}

processDirectory(directoryPath);
console.log('Done processing HTML files.');
