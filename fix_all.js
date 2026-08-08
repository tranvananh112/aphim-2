const fs = require('fs');
const path = require('path');

// Fix JS modal
const authModalLogic = `
    if (typeof window !== 'undefined') {
        setTimeout(async () => {
            try {
                const res = await fetch('https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=1');
                const data = await res.json();
                if (data?.items?.length > 0) {
                    let bestMovie = data.items[0];
                    for (const item of data.items) {
                        if ((item.tmdb?.vote_average || 0) > (bestMovie.tmdb?.vote_average || 0)) {
                            bestMovie = item;
                        }
                    }
                    // phimapi.com trả v? full URL cho poster_url, ta dùng luôn.
                    // N?u l?i CORS, h?y thay b?ng ophim1.com và img.ophimimg.com
                    const url = bestMovie.poster_url || 'https://image.tmdb.org/t/p/w780/8b8R8l88Qje9dn9OE8Ez05N5cKk.jpg';
                    if (url) {
                        dynamicPosterURL = url;
                        const img = new Image();
                        img.src = url;
                        
                        const leftPanels = document.querySelectorAll('.ap-auth-left, #auth-left-panel, #dynamic-auth-bg');
                        leftPanels.forEach(p => {
                            p.style.backgroundImage = \`linear-gradient(to bottom, rgba(15,15,30,0.15) 0%, rgba(15,15,30,0.95) 100%), url('\${url}')\`;
                            p.style.backgroundPosition = 'center';
                            p.style.backgroundSize = 'cover';
                            p.style.backgroundRepeat = 'no-repeat';
                        });
                    }
                }
            } catch(e) {}
        }, 100);
    }
`;

const projectDirs = [
    "f:\\\\Wesite Xem Phim",
    "f:\\\\Wesite Xem Phim Mới",
    "f:\\\\Wesite Xem Phim Node",
    "f:\\\\Wesite Xem Phim Node\\\\public"
];

for (const dir of projectDirs) {
    const authModalPath = path.join(dir, 'js', 'auth-modal.js');
    if (fs.existsSync(authModalPath)) {
        let content = fs.readFileSync(authModalPath, 'utf8');
        
        // Fix Close button ? -> &times;
        content = content.replace(/>\?</g, ">&times;<");
        // N?u cb?n c b? l?i unicode thì s?a luôn
        content = content.replace(/>\?\?</g, ">&times;<");
        
        // Change Tagline
        content = content.replace(/Phim hay cả rổ/g, "Giải trí không giới hạn");
        
        // Update Fetch Logic - replace the whole block again
        const fetchBlockPattern = /if\s*\(typeof\s*window\s*!==\s*'undefined'\)\s*\{\s*setTimeout\(async\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*,\s*100\);\s*\}/;
        if (fetchBlockPattern.test(content)) {
            content = content.replace(fetchBlockPattern, authModalLogic.trim());
        }
        
        fs.writeFileSync(authModalPath, content, 'utf8');
    }
}

// 2. Fix Standalone Pages
const targetFiles = [
    "f:\\\\Wesite Xem Phim\\\\login.html",
    "f:\\\\Wesite Xem Phim\\\\register.html",
    "f:\\\\Wesite Xem Phim Mới\\\\login.html",
    "f:\\\\Wesite Xem Phim Mới\\\\register.html",
    "f:\\\\Wesite Xem Phim Node\\\\views\\\\login.ejs",
    "f:\\\\Wesite Xem Phim Node\\\\views\\\\register.ejs"
];

const standaloneScript = `
    <!-- Dynamic Auth Background Script -->
    <script>
        setTimeout(async () => {
            try {
                const res = await fetch('https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=1');
                const data = await res.json();
                if (data?.items?.length > 0) {
                    let bestMovie = data.items[0];
                    for (const item of data.items) {
                        if ((item.tmdb?.vote_average || 0) > (bestMovie.tmdb?.vote_average || 0)) {
                            bestMovie = item;
                        }
                    }
                    const url = bestMovie.poster_url || 'https://image.tmdb.org/t/p/w780/8b8R8l88Qje9dn9OE8Ez05N5cKk.jpg';
                    if (url) {
                        const bgEl = document.getElementById('auth-left-panel') || document.getElementById('dynamic-auth-bg');
                        if (bgEl) {
                            bgEl.style.backgroundImage = \`linear-gradient(to bottom, rgba(15,15,30,0.15) 0%, rgba(15,15,30,0.95) 100%), url('\${url}')\`;
                            bgEl.style.backgroundPosition = 'center';
                            bgEl.style.backgroundSize = 'cover';
                            bgEl.style.backgroundRepeat = 'no-repeat';
                        }
                    }
                }
            } catch(e) {}
        }, 100);
    </script>
`;

for (const filePath of targetFiles) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Fix Close button ? -> &times;
        content = content.replace(/class="page-close-btn"[^>]*>\?</g, 'class="page-close-btn" title="Quay lại" onclick="if(window.history.length > 1 && document.referrer.includes(window.location.host)) { window.history.back(); return false; }">&times;<');
        
        // Fix Tagline
        content = content.replace(/Phim hay cả rổ/g, "Giải trí không giới hạn");
        
        // Fix the missing inline style background in auth-left-panel if it's missing
        if (content.includes('id="auth-left-panel"') && !content.includes('style="background: linear-gradient')) {
            content = content.replace(
                /id="auth-left-panel"\s+class="([^"]+)"/,
                'id="auth-left-panel" class="$1" style="background: linear-gradient(to right, rgba(15,15,30,1) 0%, rgba(15,15,30,0) 100%), url(\'https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8Ez05N5cKk.jpg\') center / cover no-repeat;"'
            );
        }
        
        // Ensure standalone script is there and up to date
        if (content.includes('Dynamic Auth Background Script')) {
            const scriptPattern = /<!-- Dynamic Auth Background Script -->[\s\S]*?<\/script>/;
            content = content.replace(scriptPattern, standaloneScript.trim());
        } else {
            content = content.replace(/<\/body>/, standaloneScript + '\\n</body>');
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

console.log('Fixed all UI bugs in auth modal and standalone pages.');
