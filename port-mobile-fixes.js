const fs = require('fs');
const path = require('path');

const targetDirs = [
    'f:\\Wesite Xem Phim',
    'f:\\Wesite Xem Phim Mới'
];

targetDirs.forEach(dir => {
    // 1. Update movie-detail.html
    const detailHtmlPath = path.join(dir, 'movie-detail.html');
    if (fs.existsSync(detailHtmlPath)) {
        let content = fs.readFileSync(detailHtmlPath, 'utf8');
        content = content.replace(
            '<main class="relative pt-0 min-h-screen pb-20 movie-content-zone">',
            '<main class="relative pt-0 min-h-screen pb-20 movie-content-zone overflow-x-hidden w-full max-w-[100vw]">'
        );
        fs.writeFileSync(detailHtmlPath, content, 'utf8');
        console.log('Updated movie-detail.html in ' + dir);
    }

    // 2. Update watch.html
    const watchHtmlPath = path.join(dir, 'watch.html');
    if (fs.existsSync(watchHtmlPath)) {
        let content = fs.readFileSync(watchHtmlPath, 'utf8');
        content = content.replace(
            '<body class="bg-background-dark text-gray-100 font-display min-h-screen flex flex-col watch-page">',
            '<body class="bg-background-dark text-gray-100 font-display min-h-screen flex flex-col watch-page overflow-x-hidden w-full">'
        );
        // also fix the server buttons wrapping if needed
        content = content.replace(
            '<div class="flex flex-wrap items-center justify-center gap-3">',
            '<div class="flex flex-wrap items-center justify-center gap-3 w-full">'
        );
        fs.writeFileSync(watchHtmlPath, content, 'utf8');
        console.log('Updated watch.html in ' + dir);
    }

    // 3. Update js/movie-detail.js
    const jsPath = path.join(dir, 'js', 'movie-detail.js');
    if (fs.existsSync(jsPath)) {
        let content = fs.readFileSync(jsPath, 'utf8');
        
        // Target the gallery rendering
        content = content.replace(
            /<div style="flex: 0 0 auto; width: 280px; max-width: 80vw;" class="aspect-video rounded-xl/g,
            '<div style="flex-shrink: 0; width: 280px; aspect-ratio: 16/9; max-width: 80vw;" class="rounded-xl'
        );
        content = content.replace(
            /class="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110">/g,
            'style="width: 100%; height: 100%; object-fit: cover;" class="transform transition-transform duration-500 hover:scale-110">'
        );
        
        fs.writeFileSync(jsPath, content, 'utf8');
        console.log('Updated movie-detail.js in ' + dir);
    }
});

console.log('Done!');
