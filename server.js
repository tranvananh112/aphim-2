const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes requiring SSR MUST be before express.static
const fs = require('fs');

app.get(['/movie-detail', '/movie-detail.html'], async (req, res) => {
    try {
        const slug = req.query.slug;
        let html = await fs.promises.readFile(path.join(__dirname, 'movie-detail.html'), 'utf-8');
        
        if (slug) {
            try {
                // Fetch SEO data from ophim1
                const response = await axios.get('https://ophim1.com/phim/' + slug, { timeout: 5000 });
                const data = response.data;
                if (data && data.status && data.movie) {
                    const movie = data.movie;
                    const isSeries = movie.type === 'series';
                    const name = movie.name || movie.title || '';
                    const originName = movie.origin_name || '';
                    const year = movie.year || new Date().getFullYear();
                    const genre = (movie.category && movie.category[0]) ? movie.category[0].name : 'Phim mới';
                    const country = (movie.country && movie.country[0]) ? movie.country[0].name : '';
                    const eps = movie.episode_total || '?';
                    const rawContent = movie.content ? movie.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '';
                    const content = rawContent.substring(0, 100);

                    // 1. Title
                    const title = 'Phim ' + name + ' Vietsub + Thuyết Minh - Full HD';

                    // 2. Meta description (max 155 chars)
                    let desc;
                    if (isSeries) {
                        desc = name + ' (' + originName + ') là bộ phim ' + genre + ' ' + country + ' ra mắt năm ' + year + ', gồm ' + eps + ' tập. ' + content + '... Xem miễn phí tại APhim.';
                    } else {
                        desc = name + ' (' + originName + ') là phim ' + genre + ' ' + country + ' năm ' + year + '. ' + content + '... Xem Vietsub Full HD miễn phí tại APhim.';
                    }
                    desc = desc.substring(0, 155);

                    // 3. Open Graph image
                    const img = movie.thumb_url
                        ? (movie.thumb_url.startsWith('http') ? movie.thumb_url : 'https://img.ophim.live/uploads/movies/' + movie.thumb_url)
                        : 'https://aphim.io.vn/apple-touch-icon.png';
                    const pageUrl = 'https://aphim.io.vn/movie-detail.html?slug=' + slug;

                    // 4. JSON-LD Schema
                    const schema = {
                        '@context': 'https://schema.org',
                        '@type': isSeries ? 'TVSeries' : 'Movie',
                        name: name,
                        alternateName: originName,
                        description: desc,
                        datePublished: (movie.created && movie.created.time) ? movie.created.time : String(year),
                        genre: Array.isArray(movie.category) ? movie.category.map(function(c) { return c.name; }) : ['Phim mới'],
                        image: img,
                        url: pageUrl
                    };
                    if (isSeries) {
                        schema.numberOfEpisodes = parseInt(eps) || 0;
                    }

                    // Build SSR head block
                    const seoBlock = '\n    <title>' + title + '</title>\n'
                        + '    <meta name="description" content="' + desc.replace(/"/g, '&quot;') + '" />\n'
                        + '    <meta property="og:title" content="' + title.replace(/"/g, '&quot;') + '" />\n'
                        + '    <meta property="og:description" content="' + desc.replace(/"/g, '&quot;') + '" />\n'
                        + '    <meta property="og:image" content="' + img + '" />\n'
                        + '    <meta property="og:url" content="' + pageUrl + '" />\n'
                        + '    <meta property="og:type" content="video.movie" />\n'
                        + '    <link rel="canonical" href="' + pageUrl + '" />\n'
                        + '    <script type="application/ld+json">' + JSON.stringify(schema) + '</script>\n';

                    // Remove existing duplicate tags from static HTML
                    html = html.replace(/<title>[\s\S]*?<\/title>/, '');
                    html = html.replace(/<meta\s+name="description"[^>]*>/gi, '');
                    html = html.replace(/<meta\s+property="og:title"[^>]*>/gi, '');
                    html = html.replace(/<meta\s+property="og:description"[^>]*>/gi, '');
                    html = html.replace(/<meta\s+property="og:image"[^>]*>/gi, '');
                    html = html.replace(/<meta\s+property="og:url"[^>]*>/gi, '');
                    html = html.replace(/<meta\s+property="og:type"[^>]*>/gi, '');
                    html = html.replace(/<link\s+rel="canonical"[^>]*>/gi, '');

                    // Inject SSR block right after <head>
                    html = html.replace('<head>', '<head>' + seoBlock);
                }
            } catch (e) {
                console.error('[SSR] SEO inject failed for slug:', slug, '-', e.message);
                // Fallback: serve original HTML without SEO injection — better than crashing
            }
        }

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    } catch (e) {
        console.error('[SSR] File read error:', e.message);
        res.status(500).send('Server Error');
    }
});

// ===== IMAGE SITEMAP — giúp Google index poster phim vào Google Images =====
// Cache sitemap 6 tiếng để tránh gọi API liên tục
let sitemapCache = { xml: null, timestamp: 0 };
const SITEMAP_TTL = 6 * 60 * 60 * 1000; // 6 giờ

app.get('/sitemap-images.xml', async (req, res) => {
    try {
        const now = Date.now();
        if (sitemapCache.xml && (now - sitemapCache.timestamp < SITEMAP_TTL)) {
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            return res.send(sitemapCache.xml);
        }

        // Lấy nhiều trang phim mới nhất để có đủ ảnh
        const pages = [1, 2, 3, 4, 5];
        const allMovies = [];

        await Promise.all(pages.map(async (page) => {
            try {
                const r = await axios.get('https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=' + page, { timeout: 6000 });
                if (r.data && r.data.data && r.data.data.items) {
                    allMovies.push(...r.data.data.items);
                }
            } catch (e) { /* bỏ qua trang lỗi */ }
        }));

        // Tạo từng <url> entry có <image:image>
        const urlEntries = allMovies.map(function(movie) {
            const slug = movie.slug || '';
            const name = (movie.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            const pageUrl = 'https://aphim.io.vn/movie-detail.html?slug=' + slug;
            const thumb = movie.thumb_url
                ? (movie.thumb_url.startsWith('http') ? movie.thumb_url : 'https://img.ophim.live/uploads/movies/' + movie.thumb_url)
                : '';
            const poster = movie.poster_url
                ? (movie.poster_url.startsWith('http') ? movie.poster_url : 'https://img.ophim.live/uploads/movies/' + movie.poster_url)
                : '';

            let imageEntries = '';
            if (thumb) {
                imageEntries += '\n        <image:image>\n            <image:loc>' + thumb + '</image:loc>\n            <image:title>' + name + '</image:title>\n        </image:image>';
            }
            if (poster && poster !== thumb) {
                imageEntries += '\n        <image:image>\n            <image:loc>' + poster + '</image:loc>\n            <image:title>' + name + ' - Poster</image:title>\n        </image:image>';
            }

            if (!imageEntries) return '';

            return '\n    <url>\n        <loc>' + pageUrl + '</loc>' + imageEntries + '\n    </url>';
        }).filter(Boolean).join('');

        const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
            + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
            + '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'
            + urlEntries
            + '\n</urlset>';

        sitemapCache = { xml: xml, timestamp: now };

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=21600'); // Browser cache 6h
        res.send(xml);
    } catch (e) {
        console.error('[Sitemap] Error:', e.message);
        res.status(500).send('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }
});

// ===== GENERAL SITEMAP — khai báo các trang tĩnh cho Google =====
app.get('/sitemap.xml', (req, res) => {
    const staticPages = ['', 'search', 'pricing', 'danh-sach', 'hanh-dong', 'phim-theo-quoc-gia'];
    const urls = staticPages.map(function(p) {
        return '\n    <url><loc>https://aphim.io.vn/' + (p ? p + '.html' : '') + '</loc><changefreq>daily</changefreq><priority>' + (p === '' ? '1.0' : '0.8') + '</priority></url>';
    }).join('');
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n    <sitemap><loc>https://aphim.io.vn/sitemap-images.xml</loc></sitemap>\n</sitemapindex>';
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
});

// Serve static files
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});



app.get('/watch', (req, res) => {
    res.sendFile(path.join(__dirname, 'watch.html'));
});

app.get(['/pricing', '/pricing.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'pricing.html'));
});

app.get(['/the-thao', '/the-thao.html'], (req, res) => {
    res.redirect(301, '/pricing');
});



// ===== PROXY: iSportsAPI =====
const ISPORTS_API_KEY = 'R86CxN79bK1lrAC0';

// Simple in-memory cache to save API usage
let cacheLivescores = { data: null, timestamp: 0 };
let cacheChanges = { data: null, timestamp: 0 };
const ISPORTS_CACHE_TTL = 30000; // 30 seconds

app.get(['/api/isports/livescores', '/v1/api/isports/livescores'], async (req, res) => {
    try {
        const now = Date.now();
        if (cacheLivescores.data && (now - cacheLivescores.timestamp < ISPORTS_CACHE_TTL)) {
            return res.status(200).json(cacheLivescores.data);
        }

        const url = `http://api.isportsapi.com/sport/football/livescores?api_key=${ISPORTS_API_KEY}`;
        const response = await axios.get(url);
        
        // Check for limit error
        if (response.data && response.data.code === 2) {
            console.warn("iSports Limit Reached!");
            return res.status(200).json({
                code: 2,
                message: "API iSports (Trial 200) đã hết hạn mức ngày hôm nay. Vui lòng cung cấp Key mới.",
                data: []
            });
        }
        
        cacheLivescores = { data: response.data, timestamp: now };
        res.status(200).json(response.data);
    } catch (error) {
        console.error("iSports Livescores Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch from iSports' });
    }
});

app.get(['/api/isports/schedule', '/v1/api/isports/schedule'], async (req, res) => {
    try {
        const date = req.query.date || '';
        const url = `http://api.isportsapi.com/sport/football/schedule?api_key=${ISPORTS_API_KEY}&date=${date}`;
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("iSports Schedule Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch schedule from iSports' });
    }
});

app.get(['/api/isports/summary', '/v1/api/isports/summary'], async (req, res) => {
    try {
        const url = `http://api.isportsapi.com/sport/football/summary?api_key=${ISPORTS_API_KEY}`;
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("iSports Summary Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch summary from iSports' });
    }
});

app.get(['/api/isports/livetext', '/v1/api/isports/livetext'], async (req, res) => {
    try {
        const url = `http://api.isportsapi.com/sport/football/livetext/list?api_key=${ISPORTS_API_KEY}`;
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("iSports LiveText Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch livetext from iSports' });
    }
});

app.get(['/api/isports/changes', '/v1/api/isports/changes'], async (req, res) => {
    try {
        const now = Date.now();
        if (cacheChanges.data && (now - cacheChanges.timestamp < 10000)) { // 10s for changes
            return res.status(200).json(cacheChanges.data);
        }

        const url = `http://api.isportsapi.com/sport/football/livescores/changes?api_key=${ISPORTS_API_KEY}`;
        const response = await axios.get(url);

        if (response.data && response.data.code === 2) {
             if (cacheChanges.data) return res.status(200).json(cacheChanges.data);
        } else {
            cacheChanges = { data: response.data, timestamp: now };
        }

        res.status(200).json(response.data);
    } catch (error) {
        console.error("iSports Changes Error:", error.message);
        if (cacheChanges.data) return res.status(200).json(cacheChanges.data);
        res.status(500).json({ error: 'Failed to fetch changes from iSports' });
    }
});

app.get(['/api/isports/team/:teamId', '/v1/api/isports/team/:teamId'], async (req, res) => {
    try {
        const teamId = req.params.teamId;
        const url = `http://api.isportsapi.com/sport/football/team?api_key=${ISPORTS_API_KEY}&teamId=${teamId}`;
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("iSports Team Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch team from iSports' });
    }
});

// Image Proxy & Cache Server-side cho Logo iSports
const isportsLogoCache = {};

app.get(['/api/isports/image/:teamId', '/v1/api/isports/image/:teamId'], async (req, res) => {
    try {
        const teamId = req.params.teamId;
        let logoUrl = isportsLogoCache[teamId];
        
        // 1. Phân giải Logo URL nếu chưa có
        if (!logoUrl) {
            const url = `http://api.isportsapi.com/sport/football/team?api_key=${ISPORTS_API_KEY}&teamId=${teamId}`;
            const response = await axios.get(url);
            if (response.data && response.data.data && response.data.data[0] && response.data.data[0].logo) {
                logoUrl = response.data.data[0].logo;
                isportsLogoCache[teamId] = logoUrl; // Lưu vào biến RAM
            }
        }
        
        // 2. Stream ảnh về client lách CORS/403
        if (logoUrl) {
            const imgParams = {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive'
                }
            };
            const imgResult = await axios.get(logoUrl, imgParams);
            res.set('Content-Type', 'image/png');
            res.set('Cache-Control', 'public, max-age=86400'); // Trình duyệt cache 1 ngày
            res.send(imgResult.data);
        } else {
            res.status(404).send('No logo');
        }
    } catch(e) {
        // Fallback im lặng tránh văng server
        res.status(404).send('Error fetching proxy image');
    }
});


// ===== PROXY: Sportmonks API =====
const SPORTMONKS_TOKEN = 'x8HmVIpZZd9bz5AqazZIeygXWXnNsqLIPNokCI1M5lQ4LTzMOGTp3i8ePBCk';
const FOOTBALL_DATA_TOKEN = '693024976693480792fe9c97125c68ca';

const fdAxios = axios.create({
    baseURL: 'https://api.football-data.org/v4/',
    headers: { 'X-Auth-Token': FOOTBALL_DATA_TOKEN }
});

app.get(['/api/fd/standings/:league', '/v1/api/fd/standings/:league'], async (req, res) => {
    try {
        const { league } = req.params;
        const response = await fdAxios.get(`competitions/${league}/standings`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("FD Standings Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed' });
    }
});

app.get(['/api/fd/scorers/:league', '/v1/api/fd/scorers/:league'], async (req, res) => {
    try {
        const { league } = req.params;
        const response = await fdAxios.get(`competitions/${league}/scorers?limit=10`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("FD Scorers Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed' });
    }
});

app.get(['/api/fd/matches', '/v1/api/fd/matches'], async (req, res) => {
    try {
        const response = await fdAxios.get(`matches`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("FD Matches Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed' });
    }
});

app.get(['/api/sportmonks/livescores', '/v1/api/sportmonks/livescores'], async (req, res) => {
    try {
        const url = `https://api.sportmonks.com/v3/football/livescores/inplay?api_token=${SPORTMONKS_TOKEN}&include=participants;scores;periods;events;league.country;round`;
        
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Sportmonks Proxy Error:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch from Sportmonks' });
    }
});

app.get(['/api/sportmonks/h2h/:t1/:t2', '/v1/api/sportmonks/h2h/:t1/:t2'], async (req, res) => {
    try {
        const { t1, t2 } = req.params;
        const url = `https://api.sportmonks.com/v3/football/fixtures/head-to-head/${t1}/${t2}?api_token=${SPORTMONKS_TOKEN}&include=participants;league;scores;state;venue;events`;
        
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Sportmonks H2H Error:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch H2H from Sportmonks' });
    }
});

app.get(['/api/sportmonks/fixture/:id', '/v1/api/sportmonks/fixture/:id'], async (req, res) => {
    try {
        const { id } = req.params;
        const url = `https://api.sportmonks.com/v3/football/fixtures/${id}?api_token=${SPORTMONKS_TOKEN}&include=participants;league;venue;state;scores;lineups.player;lineups.type;lineups.details.type;metadata.type;coaches`;
        
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Sportmonks Fixture Error:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch fixture from Sportmonks' });
    }
});

// ===== PROXY: Sport Radar Live Score =====

// ===== CACHE: 5 phút để tránh 429 rate limit =====
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

function getCached(key) {
    const entry = apiCache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
    return null;
}
function setCache(key, data) {
    apiCache.set(key, { data, ts: Date.now() });
}

// Queue để tránh gọi đồng thời nhiều request
let apiQueue = Promise.resolve();
function queuedFetch(url, options) {
    apiQueue = apiQueue.then(() =>
        fetch(url, options).then(async r => ({ status: r.status, text: await r.text() }))
    );
    return apiQueue;
}

// Proxy lấy dữ liệu trận đấu (Dùng RapidAPI) - Hỗ trợ cả subpath /v1/api nếu cần
app.get(['/api/sofascore/*', '/v1/api/sofascore/*'], async (req, res) => {
  try {
    const targetPath = req.params[0]; // VD: api/v1/sport/football/events/live
    const cacheKey = targetPath;

    // 1. Kiểm tra Cache
    const cached = getCached(cacheKey);
    if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).send(cached);
    } // Trả trực tiếp text từ cache

    // 2. Gọi RapidAPI qua hàng đợi
    const url = `https://sportapi7.p.rapidapi.com/${targetPath}`;
    console.log(`[Proxy] Fetching: ${url}`);
    
    const result = await queuedFetch(url, {
        headers: {
            'x-rapidapi-key': '8e131041e5msheef9200c98e9712p109669jsn30145b3c501d',
            'x-rapidapi-host': 'sportapi7.p.rapidapi.com',
            'Accept': 'application/json'
        }
    });

    // 3. Xử lý kết quả
    if (result.status === 200 && result.text) {
        setCache(cacheKey, result.text); 
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(result.text);
    } else {
        console.error(`[Proxy] Error ${result.status}:`, result.text);
        res.status(result.status || 500).json({ error: 'Upstream Error', details: result.text });
    }
  } catch (error) {
    console.error("RapidAPI Proxy Error:", error.message);
    res.status(200).json({ events: [] }); 
  }
});

// Proxy lấy ảnh (Logo đội bóng)
app.get('/api/image/team/:id', async (req, res) => {
  try {
    const teamId = req.params.id;
    const imageUrl = `https://api.sofascore.app/api/v1/team/${teamId}/image`;
    
    const response = await axios.get(imageUrl, { 
      responseType: 'arraybuffer',
      validateStatus: () => true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.sofascore.com/',
        'Origin': 'https://www.sofascore.com',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });

    if (response.status === 200) {
        res.set('Content-Type', 'image/png');
        res.send(response.data);
    } else {
        res.status(404).send('Not Found');
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch team image' });
  }
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'search.html'));
});

// Admin routes
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/admin/movies', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'movies.html'));
});

app.get('/admin/users', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'users.html'));
});

app.get('/admin/payments', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'payments.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Không tìm thấy trang</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-900 text-white flex items-center justify-center min-h-screen">
            <div class="text-center">
                <h1 class="text-6xl font-bold text-yellow-400 mb-4">404</h1>
                <p class="text-xl mb-8">Không tìm thấy trang</p>
                <a href="/" class="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors">
                    Về trang chủ
                </a>
            </div>
        </body>
        </html>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎬 CineStream Server đang chạy!                        ║
║                                                           ║
║   🌐 URL: http://localhost:${PORT}                        ║
║   📁 Thư mục: ${__dirname}                    
║                                                           ║
║   📄 Các trang có sẵn:                                   ║
║   • http://localhost:${PORT}/                             ║
║   • http://localhost:${PORT}/login                        ║
║   • http://localhost:${PORT}/movie-detail                 ║
║   • http://localhost:${PORT}/watch                        ║
║   • http://localhost:${PORT}/pricing                      ║
║   • http://localhost:${PORT}/profile                      ║
║   • http://localhost:${PORT}/search                       ║
║   • http://localhost:${PORT}/admin/dashboard              ║
║                                                           ║
║   ⏹️  Nhấn Ctrl+C để dừng server                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

