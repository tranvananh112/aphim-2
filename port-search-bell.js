const fs = require('fs');
const path = require('path');

const srcDir = 'f:\\Wesite Xem Phim Node';
const destDirs = ['f:\\Wesite Xem Phim', 'f:\\Wesite Xem Phim Mới'];

const filesToCopy = [
    { src: 'js/user-ui.js', dest: 'js/user-ui.js' },
    { src: 'js/mobile-search-overlay.js', dest: 'js/mobile-search-overlay.js' },
    { src: 'css/mobile-search-overlay.css', dest: 'css/mobile-search-overlay.css' }
];

const mobileSearchHTML = `
<!-- ===== MOBILE SEARCH OVERLAY ===== -->
<div id="mobileSearchOverlay" style="opacity: 0; visibility: hidden; pointer-events: none;">
    <div class="mso-header">
        <div class="mso-input-wrap">
            <span class="material-icons-round mso-icon-search">search</span>
            <input type="text" id="msoInput" class="mso-input"
                placeholder="Tìm kiếm phim, diễn viên..." autocomplete="off" enterkeyhint="search">
            <button id="msoClearBtn" class="mso-clear-btn" aria-label="Xóa">
                <span class="material-icons-round" style="font-size:18px;">close</span>
            </button>
        </div>
        <button id="msoCloseBtn" class="mso-close-btn" aria-label="Đóng">
            <span class="material-icons-round">close</span>
        </button>
    </div>
    
    <div id="msoResultsArea" class="mso-results-area">
        <div id="msoResultsHeader" class="mso-results-header">
            <span>KẾT QUẢ TÌM KIẾM</span>
            <span id="msoResultsCount">0 phim</span>
        </div>
        <div id="msoResultsList" class="mso-results-list">
            <!-- Search results injected here -->
        </div>
        <a href="#" id="msoSeeAll" class="mso-see-all">Xem tất cả kết quả &gt;</a>
    </div>
</div>
<link rel="stylesheet" href="css/mobile-search-overlay.css?v=110">
<script src="js/mobile-search-overlay.js?v=111" defer></script>
`;

const searchBtnHTML = `
                <!-- Mobile: Search icon -->
                <div class="flex items-center gap-2.5 lg:hidden">
                    <button id="mtiSearchBtn"
                        class="mti-btn"
                        style="width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; background: transparent; border: 1px solid rgba(255,255,255,0.15); backdrop-filter: blur(8px);"
                        aria-label="Tìm kiếm">
                        <span class="material-icons-outlined" style="font-size:20px; color:#eab308;">search</span>
                    </button>
                </div>
`;

function processHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (file.endsWith('.html')) {
            let p = path.join(dir, file);
            let content = fs.readFileSync(p, 'utf8');
            
            // 1. Inject searchBtn into ZONE 3
            if (!content.includes('id="mtiSearchBtn"')) {
                const zone3Regex = /<!-- Auth Container[^>]*>\s*<div id="authContainer"/g;
                content = content.replace(zone3Regex, searchBtnHTML + '\n                <!-- Auth Container -->\n                <div id="authContainer"');
            }

            // 2. Inject mobile search overlay before </body>
            if (!content.includes('id="mobileSearchOverlay"')) {
                const bodyIndex = content.lastIndexOf('</body>');
                if (bodyIndex !== -1) {
                    content = content.substring(0, bodyIndex) + '\n' + mobileSearchHTML + '\n' + content.substring(bodyIndex);
                }
            }
            
            fs.writeFileSync(p, content, 'utf8');
        }
    });
    
    const profileDir = path.join(dir, 'profile');
    if (fs.existsSync(profileDir)) {
        const pFiles = fs.readdirSync(profileDir);
        pFiles.forEach(file => {
            if (file.endsWith('.html')) {
                let p = path.join(profileDir, file);
                let content = fs.readFileSync(p, 'utf8');
                
                // For subdirectories, adjust the paths for CSS and JS
                let subHTML = mobileSearchHTML.replace(/"css\//g, '"../css/').replace(/"js\//g, '"../js/');
                
                if (!content.includes('id="mtiSearchBtn"')) {
                    const zone3Regex = /<!-- Auth Container[^>]*>\s*<div id="authContainer"/g;
                    content = content.replace(zone3Regex, searchBtnHTML + '\n                <!-- Auth Container -->\n                <div id="authContainer"');
                }
                if (!content.includes('id="mobileSearchOverlay"')) {
                    const bodyIndex = content.lastIndexOf('</body>');
                    if (bodyIndex !== -1) {
                        content = content.substring(0, bodyIndex) + '\n' + subHTML + '\n' + content.substring(bodyIndex);
                    }
                }
                fs.writeFileSync(p, content, 'utf8');
            }
        });
    }
}

destDirs.forEach(dir => {
    console.log('Processing ' + dir);
    // Copy files
    filesToCopy.forEach(f => {
        const srcPath = path.join(srcDir, f.src);
        const destPath = path.join(dir, f.dest);
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log('Copied ' + f.src);
        } else {
            console.error('File not found: ' + srcPath);
        }
    });
    
    // Process HTML
    processHtmlFiles(dir);
});
console.log('Done!');
