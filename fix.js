const fs = require('fs');
const path = require('path');
const src = 'F:/Wesite Xem Phim Node/js/movie-slider.js';
const targets = ['F:/Wesite Xem Phim Mới', 'F:/Wesite Xem Phim'];
targets.forEach(t => {
    fs.copyFileSync(src, path.join(t, 'js', 'movie-slider.js'));
    fs.readdirSync(t).filter(f => f.endsWith('.html')).forEach(f => {
        const p = path.join(t, f);
        let c = fs.readFileSync(p, 'utf8');
        if(!c.includes('movie-slider.js')) {
            c = c.replace(/<\/body>/, '<script src="js/movie-slider.js"></script>\n</body>');
            fs.writeFileSync(p, c);
            console.log('Fixed', p);
        }
    });
});
