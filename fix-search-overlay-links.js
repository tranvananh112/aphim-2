const fs = require('fs');
const path = require('path');

const targetDirs = [
    'f:\\Wesite Xem Phim',
    'f:\\Wesite Xem Phim Mới'
];

function fixSearchOverlay(dir) {
    const filePath = path.join(dir, 'js', 'mobile-search-overlay.js');
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    let updated = false;
    
    // Fix Enter key URL
    if (content.includes('window.location.href = `/search?q=${encodeURIComponent(q)}`')) {
        content = content.replace('window.location.href = `/search?q=${encodeURIComponent(q)}`', 'window.location.href = `search.html?q=${encodeURIComponent(q)}`');
        updated = true;
    }
    
    // Fix movie link URL
    if (content.includes('<a href="/phim/${movie.slug}" class="mso-suggest-row">')) {
        content = content.replace('<a href="/phim/${movie.slug}" class="mso-suggest-row">', '<a href="movie-detail.html?slug=${movie.slug}" class="mso-suggest-row">');
        updated = true;
    }
    
    // Fix "See All" URL
    if (content.includes('seeAllLink.href = `/search?q=${encodeURIComponent(keyword)}`')) {
        content = content.replace('seeAllLink.href = `/search?q=${encodeURIComponent(keyword)}`', 'seeAllLink.href = `search.html?q=${encodeURIComponent(keyword)}`');
        updated = true;
    }
    
    if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated mobile search overlay URLs in ${filePath}`);
    }
}

targetDirs.forEach(dir => fixSearchOverlay(dir));
