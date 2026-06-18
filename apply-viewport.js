const fs = require('fs');
const path = require('path');

const targetFiles = [
    'index.html',
    'categories.html',
    'danh-sach.html',
    'search.html',
    'phim-theo-quoc-gia.html',
    'ngon-ngu.html',
    'pricing.html',
    'watch.html',
    'watch-simple.html',
    'watch-direct.html',
    'auth.html',
    'user-profile.html',
    'movie-detail.html',
    'hanh-dong.html'
];

targetFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // 1. Update Viewport tag to include viewport-fit=cover
        if (content.includes('name="viewport"')) {
            content = content.replace(/<meta[^>]*name="viewport"[^>]*>/i, 
                '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no">');
        } else if (content.includes('content="width=device-width')) {
             content = content.replace(/<meta[^>]*content="width=device-width[^>]*>/i, 
                '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no">');
        }

        // 2. Add pt-safe to fixed nav
        content = content.replace(/<nav([^>]*)class="([^"]*fixed top-0[^"]*)"/g, (match, prefix, classList) => {
            if (!classList.includes('pt-safe')) {
                return `<nav${prefix}class="${classList} pt-safe"`;
            }
            return match;
        });

        // 3. Replace pt-20 on main or hero content with pt-safe-main
        content = content.replace(/class="([^"]*)pt-20([^"]*)"/g, (match, classStart, classEnd) => {
            if (!classStart.includes('pt-safe-main')) {
                return `class="${classStart}pt-safe-main${classEnd}"`;
            }
            return match;
        });
        
        // 4. Bump mobile-viewport-fix.css version to force cache refresh
        content = content.replace(/css\/mobile-viewport-fix\.css(\?v=[0-9]+)?/g, 'css/mobile-viewport-fix.css?v=4');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`Skipped ${file} (not found)`);
    }
});
