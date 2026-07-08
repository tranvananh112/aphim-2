const fs = require('fs');
const path = require('path');

const targetDirs = [
    'f:\\Wesite Xem Phim',
    'f:\\Wesite Xem Phim Mới'
];

function processProfileHtmlFiles(dir) {
    const profileDir = path.join(dir, 'profile');
    if (!fs.existsSync(profileDir)) return;
    
    const files = fs.readdirSync(profileDir);
    files.forEach(file => {
        if (file.endsWith('.html')) {
            let p = path.join(profileDir, file);
            let content = fs.readFileSync(p, 'utf8');
            
            // Remove the yellow background from the "Quay lại menu" button
            const oldButtonRegex = /<button\s+onclick="goBackToMenu\(\)"\s+style="width:36px;\s*height:36px;\s*border-radius:50%;\s*background:\s*#e8b94f;\s*border:none;\s*color:#000;\s*display:flex;\s*align-items:center;\s*justify-content:center;\s*cursor:pointer;\s*box-shadow:\s*0\s*4px\s*12px\s*rgba\(232,185,79,0\.3\);"/g;
            
            const newButtonCode = `<button onclick="goBackToMenu()" style="width:36px; height:36px; border-radius:50%; background: transparent; border:none; color:#e8b94f; display:flex; align-items:center; justify-content:center; cursor:pointer; padding: 0;"`;
            
            if (oldButtonRegex.test(content)) {
                content = content.replace(oldButtonRegex, newButtonCode);
                fs.writeFileSync(p, content, 'utf8');
                console.log(`Updated back button in ${p}`);
            }
        }
    });
}

function processCssFiles(dir) {
    const cssFile = path.join(dir, 'css', 'navigation-modern.css'); // Best place to put avatar sizing since it loads everywhere
    if (fs.existsSync(cssFile)) {
        let content = fs.readFileSync(cssFile, 'utf8');
        
        if (!content.includes('.nav-user-avatar-wrap')) {
            const cssToAdd = `

/* Fixed Avatar Sizing matching Node version */
.nav-user-avatar-wrap {
    width: 36px !important;
    height: 36px !important;
}

@media (max-width: 1024px) {
    .nav-user-avatar-wrap {
        width: 28px !important;
        height: 28px !important;
    }
}
`;
            fs.appendFileSync(cssFile, cssToAdd, 'utf8');
            console.log(`Appended avatar CSS to ${cssFile}`);
        }
    }
}

targetDirs.forEach(dir => {
    console.log(`Processing UI fixes for ${dir}`);
    processProfileHtmlFiles(dir);
    processCssFiles(dir);
});
