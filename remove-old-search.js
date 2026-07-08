const fs = require('fs');
const path = require('path');

const targetDirs = [
    'f:\\Wesite Xem Phim',
    'f:\\Wesite Xem Phim Mới'
];

function processHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (file.endsWith('.html')) {
            let p = path.join(dir, file);
            let content = fs.readFileSync(p, 'utf8');
            
            // Remove the mobile inline search form block
            // It looks like:
            // <!-- Mobile Inline Search -->
            // <form ... class="mobile-inline-search"> ... </form>
            
            const regex = /<!-- Mobile Inline Search -->\s*<form[^>]*class="mobile-inline-search"[^>]*>[\s\S]*?<\/form>\s*/gi;
            if (regex.test(content)) {
                content = content.replace(regex, '');
                fs.writeFileSync(p, content, 'utf8');
                console.log('Updated ' + p);
            }
        }
    });
    
    // Also process subdirectories like 'profile'
    const profileDir = path.join(dir, 'profile');
    if (fs.existsSync(profileDir)) {
        const pFiles = fs.readdirSync(profileDir);
        pFiles.forEach(file => {
            if (file.endsWith('.html')) {
                let p = path.join(profileDir, file);
                let content = fs.readFileSync(p, 'utf8');
                
                const regex = /<!-- Mobile Inline Search -->\s*<form[^>]*class="mobile-inline-search"[^>]*>[\s\S]*?<\/form>\s*/gi;
                if (regex.test(content)) {
                    content = content.replace(regex, '');
                    fs.writeFileSync(p, content, 'utf8');
                    console.log('Updated ' + p);
                }
            }
        });
    }
}

targetDirs.forEach(dir => {
    console.log('Processing ' + dir);
    processHtmlFiles(dir);
});

console.log('Done!');
