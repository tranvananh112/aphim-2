const fs = require('fs');
const path = require('path');

const targetDirs = [
    'f:\\Wesite Xem Phim',
    'f:\\Wesite Xem Phim Mới'
];

const nodeZone1HTML = `
            <!-- ZONE 1: Logo -->
            <div class="flex-1 flex justify-start">
                <a href="index.html" class="flex items-center gap-2.5 group flex-shrink-0" style="text-decoration:none;">
                    <div
                        class="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center bg-black/40 group-hover:bg-primary/20 transition-colors duration-300 overflow-hidden">
                        <img src="/apple-touch-icon.png" alt="A Phim Logo"
                            class="w-5 h-5 object-contain group-hover:scale-110 transition-transform" />
                    </div>
                    <div class="flex flex-col leading-none" style="display: flex !important;">
                        <span class="text-xl font-bold text-white tracking-wide">A <span
                                class="text-primary">Phim</span></span>
                        <span class="text-[9px] text-white/40 uppercase tracking-widest">Cinema</span>
                    </div>
                </a>
            </div>
`;

function processHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (file.endsWith('.html')) {
            let p = path.join(dir, file);
            let content = fs.readFileSync(p, 'utf8');
            
            // 1. Replace ZONE 1
            // Find the <a> tag of ZONE 1
            const zone1Regex = /<!-- ZONE 1: Logo -->\s*<a href="[^"]*" class="flex items-center gap-2\.5 group flex-shrink-0"[\s\S]*?<\/a>/;
            if (zone1Regex.test(content)) {
                let replacement = nodeZone1HTML;
                if (file !== 'index.html') {
                    // Update href for subpages if needed, though they usually use index.html or /
                    replacement = replacement.replace('href="index.html"', 'href="/"');
                }
                content = content.replace(zone1Regex, replacement.trim());
            }

            // 2. Wrap ZONE 3 in flex-1 flex justify-end if not already wrapped
            if (content.includes('<!-- ZONE 3: Right') && !content.includes('<div class="flex-1 flex justify-end">')) {
                const zone3Regex = /(<!-- ZONE 3:[^>]*>)\s*<div class="flex items-center gap-2 flex-shrink-0 ml-4">/;
                content = content.replace(zone3Regex, '$1\n            <div class="flex-1 flex justify-end">\n                <div class="flex items-center gap-2 flex-shrink-0 ml-4">');
                
                // Add closing div after the mobileMenuBtn
                const closeRegex = /<button id="mobileMenuBtn"[^>]*>[\s\S]*?<\/button>\s*<\/div>/;
                content = content.replace(closeRegex, match => match + '\n            </div>');
            }

            fs.writeFileSync(p, content, 'utf8');
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
                
                const zone1Regex = /<!-- ZONE 1: Logo -->\s*<a href="[^"]*" class="flex items-center gap-2\.5 group flex-shrink-0"[\s\S]*?<\/a>/;
                if (zone1Regex.test(content)) {
                    let replacement = nodeZone1HTML.replace('href="index.html"', 'href="../index.html"').replace('src="/apple-touch-icon.png"', 'src="../apple-touch-icon.png"');
                    content = content.replace(zone1Regex, replacement.trim());
                }

                if (content.includes('<!-- ZONE 3: Right') && !content.includes('<div class="flex-1 flex justify-end">')) {
                    const zone3Regex = /(<!-- ZONE 3:[^>]*>)\s*<div class="flex items-center gap-2 flex-shrink-0 ml-4">/;
                    content = content.replace(zone3Regex, '$1\n            <div class="flex-1 flex justify-end">\n                <div class="flex items-center gap-2 flex-shrink-0 ml-4">');
                    
                    const closeRegex = /<button id="mobileMenuBtn"[^>]*>[\s\S]*?<\/button>\s*<\/div>/;
                    content = content.replace(closeRegex, match => match + '\n            </div>');
                }

                fs.writeFileSync(p, content, 'utf8');
            }
        });
    }
}

targetDirs.forEach(dir => {
    console.log('Processing ' + dir);
    processHtmlFiles(dir);
});

console.log('Done!');
