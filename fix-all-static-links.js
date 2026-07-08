const fs = require('fs');
const path = require('path');

const targetDirs = [
    'f:\\Wesite Xem Phim',
    'f:\\Wesite Xem Phim Mới'
];

function processJsFiles(dir) {
    const jsDir = path.join(dir, 'js');
    if (!fs.existsSync(jsDir)) return;
    
    const files = fs.readdirSync(jsDir);
    files.forEach(file => {
        if (file.endsWith('.js')) {
            let p = path.join(jsDir, file);
            let content = fs.readFileSync(p, 'utf8');
            let updated = false;
            
            // Fix /phim/${...} to movie-detail.html?slug=${...}
            if (content.includes('href="/phim/${')) {
                content = content.replace(/href="\/phim\/\$\{([^}]+)\}"/g, 'href="movie-detail.html?slug=${$1}"');
                updated = true;
            }
            if (content.includes('href=`/phim/${')) {
                content = content.replace(/href=`\/phim\/\$\{([^}]+)\}`/g, 'href=`movie-detail.html?slug=${$1}`');
                updated = true;
            }
            if (content.includes('href = `/phim/${')) {
                content = content.replace(/href = `\/phim\/\$\{([^}]+)\}`/g, 'href = `movie-detail.html?slug=${$1}`');
                updated = true;
            }
            
            // Fix /search to search.html
            if (content.includes('href="/search"')) {
                content = content.replace(/href="\/search"/g, 'href="search.html"');
                updated = true;
            }
            if (content.includes('href="/search?')) {
                content = content.replace(/href="\/search\?/g, 'href="search.html?');
                updated = true;
            }
            
            // Fix window.location.href = `/search?
            if (content.includes('window.location.href = `/search?')) {
                content = content.replace(/window\.location\.href\s*=\s*`\/search\?/g, 'window.location.href = `search.html?');
                updated = true;
            }
            if (content.includes("window.location.href = '/search?")) {
                content = content.replace(/window\.location\.href\s*=\s*'\/search\?/g, "window.location.href = 'search.html?");
                updated = true;
            }
            if (content.includes('window.location.href = "/search?')) {
                content = content.replace(/window\.location\.href\s*=\s*"\/search\?/g, 'window.location.href = "search.html?');
                updated = true;
            }
            
            if (updated) {
                fs.writeFileSync(p, content, 'utf8');
                console.log(`Updated links in ${p}`);
            }
        }
    });
}

// Also check HTML files just in case
function processHtmlFiles(dir) {
    const processDir = (currentDir) => {
        if (!fs.existsSync(currentDir)) return;
        const files = fs.readdirSync(currentDir);
        files.forEach(file => {
            let p = path.join(currentDir, file);
            if (fs.statSync(p).isDirectory()) {
                if (file !== 'node_modules' && file !== '.git') {
                    processDir(p);
                }
            } else if (file.endsWith('.html')) {
                let content = fs.readFileSync(p, 'utf8');
                let updated = false;
                
                if (content.includes('href="/search"')) {
                    content = content.replace(/href="\/search"/g, 'href="search.html"');
                    updated = true;
                }
                if (content.includes('href="/search?')) {
                    content = content.replace(/href="\/search\?/g, 'href="search.html?');
                    updated = true;
                }
                
                // Static html typically doesn't use ${} but maybe it has hardcoded ones
                
                if (updated) {
                    fs.writeFileSync(p, content, 'utf8');
                    console.log(`Updated links in ${p}`);
                }
            }
        });
    };
    processDir(dir);
}

targetDirs.forEach(dir => {
    console.log(`Processing JS files in ${dir}...`);
    processJsFiles(dir);
    console.log(`Processing HTML files in ${dir}...`);
    processHtmlFiles(dir);
});

console.log('Done!');
