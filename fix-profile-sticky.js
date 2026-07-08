const fs = require('fs');
const path = require('path');

const targetDirs = [
    'f:\\Wesite Xem Phim',
    'f:\\Wesite Xem Phim Mới'
];

function processProfileJs(dir) {
    const profileJsPath = path.join(dir, 'js', 'profile.js');
    if (fs.existsSync(profileJsPath)) {
        let content = fs.readFileSync(profileJsPath, 'utf8');
        
        // Remove hiding of mainNav
        const hideCodeRegex = /if\s*\(\s*mainNav\s*\)\s*mainNav\.style\.display\s*=\s*'none';/g;
        content = content.replace(hideCodeRegex, '// mainNav.style.display = "none"; // Removed to keep header sticky');
        
        // Remove restoring of mainNav
        const showCodeRegex = /if\s*\(\s*mainNav\s*\)\s*mainNav\.style\.display\s*=\s*'';[^\n]*/g;
        content = content.replace(showCodeRegex, '// mainNav.style.display = ""; // Removed to keep header sticky');
        
        fs.writeFileSync(profileJsPath, content, 'utf8');
        console.log(`Updated ${profileJsPath}`);
    }
}

targetDirs.forEach(dir => processProfileJs(dir));
