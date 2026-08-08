const fs = require('fs');
const path = require('path');

const authModalLogic = `
    if (typeof window !== 'undefined') {
        setTimeout(async () => {
            try {
                // Fetch t? ophim1.com d? l?y d? li?u d? tránh l?i CORS image t? phimapi
                const res = await fetch('https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1');
                const data = await res.json();
                if (data?.items?.length > 0) {
                    let bestMovie = data.items[0];
                    for (const item of data.items) {
                        if ((item.tmdb?.vote_average || 0) > (bestMovie.tmdb?.vote_average || 0)) {
                            bestMovie = item;
                        }
                    }
                    
                    // Xây d?ng URL ?nh chu?n, img.ophimimg.com không ch?n hotlink
                    const imgPath = bestMovie.poster_url || bestMovie.thumb_url;
                    let url = 'https://image.tmdb.org/t/p/w780/8b8R8l88Qje9dn9OE8Ez05N5cKk.jpg';
                    if (imgPath) {
                        url = \`https://img.ophimimg.com/uploads/movies/\${imgPath}\`;
                    }
                    
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
            } catch(e) {}
        }, 100);
    }
`;

const standaloneScript = `
    <!-- Dynamic Auth Background Script -->
    <script>
        setTimeout(async () => {
            try {
                const res = await fetch('https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1');
                const data = await res.json();
                if (data?.items?.length > 0) {
                    let bestMovie = data.items[0];
                    for (const item of data.items) {
                        if ((item.tmdb?.vote_average || 0) > (bestMovie.tmdb?.vote_average || 0)) {
                            bestMovie = item;
                        }
                    }
                    const imgPath = bestMovie.poster_url || bestMovie.thumb_url;
                    let url = 'https://image.tmdb.org/t/p/w780/8b8R8l88Qje9dn9OE8Ez05N5cKk.jpg';
                    if (imgPath) {
                        url = \`https://img.ophimimg.com/uploads/movies/\${imgPath}\`;
                    }
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
        const fetchBlockPattern = /if\s*\(typeof\s*window\s*!==\s*'undefined'\)\s*\{\s*setTimeout\(async\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*,\s*100\);\s*\}/;
        if (fetchBlockPattern.test(content)) {
            content = content.replace(fetchBlockPattern, authModalLogic.trim());
            fs.writeFileSync(authModalPath, content, 'utf8');
            console.log('Updated auth-modal logic in', authModalPath);
        }
    }
}

const targetFiles = [
    "f:\\\\Wesite Xem Phim\\\\login.html",
    "f:\\\\Wesite Xem Phim\\\\register.html",
    "f:\\\\Wesite Xem Phim Mới\\\\login.html",
    "f:\\\\Wesite Xem Phim Mới\\\\register.html",
    "f:\\\\Wesite Xem Phim Node\\\\views\\\\login.ejs",
    "f:\\\\Wesite Xem Phim Node\\\\views\\\\register.ejs"
];

for (const filePath of targetFiles) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        const scriptPattern = /<!-- Dynamic Auth Background Script -->[\s\S]*?<\/script>/;
        if (scriptPattern.test(content)) {
            content = content.replace(scriptPattern, standaloneScript.trim());
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated standalone script in', filePath);
        }
    }
}
