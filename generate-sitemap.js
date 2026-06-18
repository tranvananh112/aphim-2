const axios = require('axios');
const fs = require('fs');

(async () => {
    const allMovies = [];
    const totalPages = 400; // Fetch 400 pages (~9600 movies) for much better SEO
    const batchSize = 10; // Batch requests to prevent rate limiting
    
    console.log(`Starting to fetch ${totalPages} pages...`);
    for (let i = 1; i <= totalPages; i += batchSize) {
        const batch = [];
        for (let j = 0; j < batchSize && (i + j) <= totalPages; j++) {
            batch.push(i + j);
        }
        
        await Promise.all(batch.map(async (page) => {
            try {
                const r = await axios.get('https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=' + page, { timeout: 15000 });
                if (r.data && r.data.data && r.data.data.items) {
                    allMovies.push(...r.data.data.items);
                    console.log('Page ' + page + ' done: ' + r.data.data.items.length + ' movies');
                }
            } catch(e) { console.log('Page ' + page + ' failed:', e.message); }
        }));
        
        // Anti-rate-limit delay
        await new Promise(res => setTimeout(res, 500));
    }

    // Deduplicate by slug
    const uniqueMoviesMap = new Map();
    allMovies.forEach(m => {
        if (m.slug) uniqueMoviesMap.set(m.slug, m);
    });
    const uniqueMovies = Array.from(uniqueMoviesMap.values());

    console.log(`Found ${uniqueMovies.length} unique movies. Generating XML...`);

    const urlEntries = uniqueMovies.map(function(movie) {
        const slug = movie.slug || '';
        const name = (movie.name || '')
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;');
        const pageUrl = 'https://aphim.io.vn/movie-detail.html?slug=' + slug;
        const thumb = movie.thumb_url
            ? (movie.thumb_url.startsWith('http') ? movie.thumb_url : 'https://img.ophim.live/uploads/movies/' + movie.thumb_url)
            : '';
        const poster = movie.poster_url
            ? (movie.poster_url.startsWith('http') ? movie.poster_url : 'https://img.ophim.live/uploads/movies/' + movie.poster_url)
            : '';
        
        let imgs = '';
        if (thumb) {
            imgs += '\n        <image:image><image:loc>' + thumb + '</image:loc><image:title>' + name + '</image:title></image:image>';
        }
        if (poster && poster !== thumb) {
            imgs += '\n        <image:image><image:loc>' + poster + '</image:loc><image:title>' + name + ' - Poster</image:title></image:image>';
        }
        if (!imgs) return '';
        return '\n    <url>\n        <loc>' + pageUrl + '</loc>' + imgs + '\n    </url>';
    }).filter(Boolean).join('');

    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
        + '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'
        + urlEntries
        + '\n</urlset>';
    
    fs.writeFileSync('sitemap-images.xml', xml, 'utf-8');
    console.log('Done! Tong: ' + allMovies.length + ' phim, file size: ' + Math.round(xml.length/1024) + ' KB');
})();
