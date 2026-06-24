const fs = require('fs');
const path = require('path');

const targetDirs = [
    'F:\\Wesite Xem Phim Mới',
    'F:\\Wesite Xem Phim',
    'F:\\Wesite Xem Phim Node'
];

const lottieHTML = `<div class="w-16 h-16 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 pointer-events-none filter drop-shadow-[0_0_10px_rgba(255,100,0,0.5)]">
    <dotlottie-wc src="https://lottie.host/b6aa21df-5315-4db3-ac65-3e36bc67912a/dLNeR1IODi.lottie" style="width: 100%; height: 100%; pointer-events: none;" autoplay loop></dotlottie-wc>
</div>`;

// Regex:
const oldBtnRegex = /<div class="w-12 h-12 rounded-full bg-\[#fcd576\]\/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-\[0_0_20px_rgba\(252,213,118,0\.5\)\]">\s*<span class="[^"]*text-black[^"]*">play_arrow<\/span>\s*<\/div>/g;

function processDirectory(dir, exts) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('.tempmediaStorage')) {
                processDirectory(fullPath, exts);
            }
        } else {
            const ext = path.extname(fullPath);
            if (exts.includes(ext)) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let modified = false;
                
                if (oldBtnRegex.test(content)) {
                    content = content.replace(oldBtnRegex, lottieHTML);
                    modified = true;
                }
                
                // Inject script if HTML/EJS
                if (['.html', '.ejs'].includes(ext)) {
                     if (!content.includes('@lottiefiles/dotlottie-wc') && content.includes('</head>')) {
                         content = content.replace('</head>', `    <script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.14/dist/dotlottie-wc.js" type="module"></script>\n</head>`);
                         modified = true;
                     }
                }
                
                if (modified) {
                    fs.writeFileSync(fullPath, content, 'utf8');
                    console.log(`Replaced in ${fullPath}`);
                }
            }
        }
    }
}

targetDirs.forEach(dir => processDirectory(dir, ['.js', '.html', '.ejs']));
console.log('Finished mass replace!');
