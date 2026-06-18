const axios = require('axios');
const fs = require('fs');

// Constants
const POSTED_MOVIES_FILE = 'posted-movies.json';
const API_URL = 'https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=1';
const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;

// Delay function for rate limit safety
const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
    if (!FB_PAGE_TOKEN && !COMPOSIO_API_KEY) {
        console.error('Missing both FB_PAGE_TOKEN and COMPOSIO_API_KEY. Exiting...');
        process.exit(1);
    }

    // 1. Load previously posted movies
    let postedMovies = [];
    if (fs.existsSync(POSTED_MOVIES_FILE)) {
        try {
            postedMovies = JSON.parse(fs.readFileSync(POSTED_MOVIES_FILE, 'utf8'));
        } catch (e) {
            console.error('Error reading posted-movies.json:', e.message);
        }
    }

    // 2. Fetch new movies from API
    let newMovies = [];
    try {
        console.log('Fetching new movies...');
        const r = await axios.get(API_URL, { timeout: 15000 });
        if (r.data && r.data.data && r.data.data.items) {
            newMovies = r.data.data.items;
        }
    } catch (e) {
        console.error('Error fetching movies:', e.message);
        process.exit(1);
    }

    // Reverse to post the oldest of the "new" ones first (chronological order)
    newMovies.reverse();

    // 3. Verify Facebook Page Token
    let pageId = 'me';
    let graphApiValid = false;
    let fallbackToken = FB_PAGE_TOKEN;

    if (FB_PAGE_TOKEN) {
        try {
            console.log('✅ Verifying Facebook Page Token...');
            const verifyRes = await axios.get('https://graph.facebook.com/v19.0/me?access_token=' + FB_PAGE_TOKEN);
            console.log(`✅ Ready to post to Fanpage: ${verifyRes.data.name} (${verifyRes.data.id})`);
            graphApiValid = true;
        } catch (error) {
            console.error('❌ Failed to verify Facebook Token:', error.response?.data || error.message);
            console.log('⚠️ Falling back to Composio...');
        }
    }

    if (!graphApiValid && COMPOSIO_API_KEY) {
        try {
            console.log(`2026-05-29 - Fetching Composio accounts via direct REST API...`);
            
            const accountsReq = await axios.get('https://backend.composio.dev/api/v3/connected_accounts', {
                headers: { 'x-api-key': COMPOSIO_API_KEY }
            });
            
            const accountsRes = accountsReq.data;
            // Log actual structure so we can debug if needed
            console.log('📋 Composio accounts response keys:', Object.keys(accountsRes || {}));
            
            const accountsList = accountsRes?.items || accountsRes?.data || accountsRes?.connectedAccounts || (Array.isArray(accountsRes) ? accountsRes : []);
            console.log(`📋 Found ${accountsList.length} connected accounts.`);
            
            const fbAcc = accountsList.find(a => {
                const name = (a.toolkit_name || a.appName || a.providerId || a.appUniqueId || '').toLowerCase();
                return name.includes('facebook') && (a.status === 'ACTIVE' || a.status === 'active');
            });
            
            if (!fbAcc) {
                console.error('❌ No active Facebook connection found in Composio!');
                process.exit(1);
            }
            
            console.log('✅ Found Facebook connection. Fetching Page Access Token via proxy...');
            const proxyRes = await axios.post('https://backend.composio.dev/api/v2/actions/proxy', {
                connectedAccountId: fbAcc.id,
                method: 'GET',
                endpoint: 'https://graph.facebook.com/v19.0/me/accounts'
            }, { headers: { 'x-api-key': COMPOSIO_API_KEY } });

            const pages = proxyRes.data.data.data;
            if (!pages || pages.length === 0) {
                console.error('❌ No Facebook Pages found for this Composio account!');
                process.exit(1);
            }

            const page = pages[0];
            fallbackToken = page.access_token;
            pageId = page.id;
            graphApiValid = true;
            console.log(`✅ Ready to post to Fanpage via Composio proxy: ${page.name} (${pageId})`);
        } catch (e) {
            console.error('❌ Failed to connect to Facebook via Composio:', e.response?.data || e.message);
            process.exit(1);
        }
    } 
    
    if (!graphApiValid) {
        console.error('❌ No valid posting method found. Exiting...');
        process.exit(1);
    }

    let postedCount = 0;

    // Helper to strip HTML tags
    const stripHtml = html => html ? html.replace(/<[^>]*>?/gm, '').trim() : '';
    const toHashtag = (str) => '#' + str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '').replace(/[^a-zA-Z0-9#]/g, '');

    // ── Affiliate Links (TikTok Shop) ─────────────────────────────────
    const AFFILIATE_LINKS = [
        'https://vt.tiktok.com/ZS9jjX4c2mHpC-0YzLx/',
        'https://vt.tiktok.com/ZS9jjXpnVjYfs-uHcEz/',
        'https://vt.tiktok.com/ZS9jjXgK7QgH3-xbKI7/',
        'https://vt.tiktok.com/ZS9jjXsGNkAHu-WyQgs/',
        'https://vt.tiktok.com/ZS9jjX7PscRKE-lGnLh/',
        'https://vt.tiktok.com/ZS9jjX7f5UNdH-c3P3i/',
        'https://vt.tiktok.com/ZS9jjXcprnnaD-3B1TS/',
        'https://vt.tiktok.com/ZS9jjXvgc8LAe-DRas7/',
        'https://vt.tiktok.com/ZS9jjXT25Yvu3-7DBZ5/',
        'https://vt.tiktok.com/ZS9jjXTK6mcSt-y7qq2/',
        'https://vt.tiktok.com/ZS9jjX3KdNhST-1fujU/',
        'https://vt.tiktok.com/ZS9jj4JaY3RdU-M96Wc/',
        'https://vt.tiktok.com/ZS9jj4dMjUC6R-2fKAo/',
        'https://vt.tiktok.com/ZS9jj4RgLYgDF-qU1RJ/',
        'https://vt.tiktok.com/ZS9jj4NNSGVRH-p2PsR/'
    ];
    const getAffiliateLink = () => AFFILIATE_LINKS[Math.floor(Math.random() * AFFILIATE_LINKS.length)];

    // 4. Process and post new movies
    for (const movie of newMovies) {
        const slug = movie.slug;
        if (postedMovies.includes(slug)) {
            continue; // Already posted, skip
        }

        try {
            console.log(`Fetching details for: ${slug}...`);
            // Fetch detailed movie info to get content and categories
            const detailRes = await axios.get(`https://ophim1.com/phim/${slug}`, { timeout: 10000 });
            const mDetail = detailRes.data.movie;
            
            const name = mDetail.name || mDetail.origin_name;
            const year = mDetail.year ? ` (${mDetail.year})` : '';
            const url = `https://aphim.io.vn/movie-detail.html?slug=${slug}`;
            
            // Generate clean description snippet (max 300 chars)
            let desc = stripHtml(mDetail.content);
            if (desc.length > 300) desc = desc.substring(0, 300) + '...';
            if (!desc) desc = 'Cùng khám phá những bí mật và tình tiết hấp dẫn trong siêu phẩm này!';

            // Generate hashtags
            let hashtags = ['#APhim', '#XemPhimOnline', '#PhimMoi', '#FullHD'];
            if (mDetail.category) {
                mDetail.category.forEach(c => hashtags.push(toHashtag(c.name)));
            }
            if (mDetail.country) {
                mDetail.country.forEach(c => hashtags.push(toHashtag(c.name)));
            }
            // Determine Movie Genres for Context-Aware Posts
            const categories = mDetail.category ? mDetail.category.map(c => c.name.toLowerCase()) : [];
            let genreType = 'generic';
            if (categories.some(c => c.includes('hành động') || c.includes('võ thuật') || c.includes('chiến tranh') || c.includes('phiêu lưu'))) genreType = 'action';
            else if (categories.some(c => c.includes('tình cảm') || c.includes('tâm lý') || c.includes('lãng mạn'))) genreType = 'romance';
            else if (categories.some(c => c.includes('kinh dị') || c.includes('ma') || c.includes('giật gân'))) genreType = 'horror';
            else if (categories.some(c => c.includes('hài hước') || c.includes('hài'))) genreType = 'comedy';
            else if (categories.some(c => c.includes('hoạt hình') || c.includes('anime'))) genreType = 'anime';
            else if (categories.some(c => c.includes('cổ trang') || c.includes('thần thoại'))) genreType = 'historical';
            else if (categories.some(c => c.includes('viễn tưởng') || c.includes('khoa học') || c.includes('bí ẩn'))) genreType = 'scifi';
            else if (categories.some(c => c.includes('chính kịch') || c.includes('hình sự'))) genreType = 'drama';

            // Generate context-aware POST templates
            const postTemplates = {
                action: [
                    `💥 PHIM HÀNH ĐỘNG CỰC CHÁY: ${name}${year}\n\n🔥 Bùng nổ thị giác: ${desc}\n\n👉 Xem ngay bản đẹp không che, mượt mà tại: ${url}\n\n${hashtags}`,
                    `🚀 SIÊU PHẨM BOM TẤN MỚI LÊN SÓNG: ${name}${year}\n\n⚔️ Cốt truyện kịch tính: ${desc}\n\n👇 Click xem full HD không quảng cáo:\n${url}\n\n${hashtags}`,
                    `🥊 Dân chơi hệ phiêu lưu bơi hết vào đây: ${name}${year}\n\n💥 ${desc}\n\n▶️ Lên kèo cày ngay tối nay:\n${url}\n\n${hashtags}`
                ],
                romance: [
                    `💖 Phim ngôn tình ngọt ngào cuối tuần: ${name}${year}\n\n🌸 Nội dung: ${desc}\n\n👉 Xem ngay để lấy động lực kiếm bồ nào: ${url}\n\n${hashtags}`,
                    `💑 Ai đang FA thì vào cày chung bộ này cho ấm lòng nhé: ${name}${year}\n\n✨ Tóm tắt: ${desc}\n\n👇 Xem full Vietsub nét căng tại:\n${url}\n\n${hashtags}`,
                    `💌 Câu chuyện tình yêu làm nức lòng người xem: ${name}${year}\n\n💕 ${desc}\n\n▶️ Xem trọn bộ thả ga không lo giật lag:\n${url}\n\n${hashtags}`
                ],
                horror: [
                    `👻 PHIM KINH DỊ CỰC MẠNH (Yếu tim đừng xem): ${name}${year}\n\n💀 ${desc}\n\n👉 Test gan ngay lúc nửa đêm tại: ${url}\n\n${hashtags}`,
                    `🩸 Ai dũng cảm thì vào cày bộ này nhé: ${name}${year}\n\n😱 Ám ảnh kinh hoàng: ${desc}\n\n👇 Xem ngay (nhớ rủ người xem cùng):\n${url}\n\n${hashtags}`,
                    `🏚️ Lạnh sống lưng với siêu phẩm giật gân: ${name}${year}\n\n👁️ ${desc}\n\n▶️ Xem HD Vietsub tại đây (chống chỉ định xem một mình):\n${url}\n\n${hashtags}`
                ],
                comedy: [
                    `😂 Xả stress với siêu phẩm hài hước: ${name}${year}\n\n🤣 Cười té ghế với nội dung: ${desc}\n\n👉 Xem ngay cho đời thêm vui: ${url}\n\n${hashtags}`,
                    `🤡 Góc tấu hài cuối tuần: ${name}${year}\n\n😆 ${desc}\n\n👇 Cười mỏi miệng cùng A Phim tại:\n${url}\n\n${hashtags}`,
                    `🤪 Chán đời á? Xem ngay bộ này đảm bảo hết buồn: ${name}${year}\n\n🎉 ${desc}\n\n▶️ Mời các thánh giải trí click vào:\n${url}\n\n${hashtags}`
                ],
                anime: [
                    `🌸 SIÊU PHẨM ANIME CỰC HOT ĐÃ ĐÁP CÁNH: ${name}${year}\n\n✨ ${desc}\n\n👉 Các wibu bơi hết vào đây cày nha: ${url}\n\n${hashtags}`,
                    `🎌 Cày anime quên lối về cùng: ${name}${year}\n\n💫 Nội dung: ${desc}\n\n👇 Xem Full HD Vietsub chuẩn không cần chỉnh:\n${url}\n\n${hashtags}`,
                    `🔥 Fan cứng không thể bỏ qua: ${name}${year}\n\n🌟 ${desc}\n\n▶️ Lên mâm tại A Phim ngay thôi:\n${url}\n\n${hashtags}`
                ],
                historical: [
                    `⛩️ SIÊU PHẨM CỔ TRANG CHẤT LƯỢNG: ${name}${year}\n\n🗡️ ${desc}\n\n👉 Đắm chìm vào thế giới huyền ảo ngay: ${url}\n\n${hashtags}`,
                    `🎎 Phim thần thoại cổ trang cực cuốn: ${name}${year}\n\n📜 Tóm tắt: ${desc}\n\n👇 Xem Vietsub không quảng cáo tại:\n${url}\n\n${hashtags}`,
                    `🐉 Bom tấn cổ trang không thể bỏ qua: ${name}${year}\n\n✨ ${desc}\n\n▶️ Cày xuyên đêm cùng A Phim:\n${url}\n\n${hashtags}`
                ],
                scifi: [
                    `🛸 SIÊU PHẨM KHOA HỌC VIỄN TƯỞNG: ${name}${year}\n\n🌌 ${desc}\n\n👉 Mở mang tầm mắt ngay tại: ${url}\n\n${hashtags}`,
                    `👽 Giải mã bí ẩn cùng bom tấn: ${name}${year}\n\n🧠 Khám phá: ${desc}\n\n👇 Click vào xem ngay Full HD:\n${url}\n\n${hashtags}`,
                    `🚀 Du hành thời gian và không gian: ${name}${year}\n\n💫 ${desc}\n\n▶️ Xem trực tiếp bản đẹp tại:\n${url}\n\n${hashtags}`
                ],
                drama: [
                    `🎭 CHÍNH KỊCH ĐỈNH CAO: ${name}${year}\n\n⚖️ Cốt truyện: ${desc}\n\n👉 Theo dõi diễn biến kịch tính tại: ${url}\n\n${hashtags}`,
                    `🕵️ Đấu trí căng thẳng với siêu phẩm hình sự: ${name}${year}\n\n🔍 ${desc}\n\n👇 Khám phá sự thật ngay:\n${url}\n\n${hashtags}`,
                    `📚 Kịch bản sâu sắc không thể bỏ qua: ${name}${year}\n\n🌟 ${desc}\n\n▶️ Xem HD Vietsub cực nét tại:\n${url}\n\n${hashtags}`
                ],
                generic: [
                    `🎬 [PHIM MỚI CẬP NHẬT] - ${name}${year}\n\n👑 ${desc}\n\n👉 Xem ngay Full HD Vietsub tại: ${url}\n\n${hashtags}`,
                    `🔥 SIÊU PHẨM MỚI LÊN SÓNG: ${name}${year}\n\n✨ ${desc}\n\n👇 Click xem ngay bản đẹp không quảng cáo:\n${url}\n\n${hashtags}`,
                    `🍿 [GÓC CÀY PHIM] Tối nay xem gì? Thử ngay ${name}${year}!\n\n💡 Nội dung sơ bộ: ${desc}\n\n🔗 Link xem full HD vietsub: ${url}\n\n${hashtags}`,
                    `🎥 Vừa ra lò nóng hổi: ${name}${year}\n\n💎 Cốt truyện: ${desc}\n\n▶️ Xem trực tiếp tốc độ cao tại:\n${url}\n\n${hashtags}`,
                    `🌟 Siêu phẩm đáng xem nhất hôm nay: ${name}${year}\n\n📜 ${desc}\n\n✅ Thưởng thức trọn bộ tại đây nha cả nhà: ${url}\n\n${hashtags}`
                ]
            };
            
            // Fallback to generic if array is empty
            const selectedTemplates = postTemplates[genreType] || postTemplates['generic'];
            const message = selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];
            
            // Get the image URL (prefer thumb_url for Facebook landscape, fallback to poster)
            const imageUrl = mDetail.thumb_url || mDetail.poster_url;

            console.log(`Posting to Facebook: ${name} (Genre: ${genreType})...`);
            
            let fbRes;
            if (imageUrl) {
                // Post as a Photo post (much better engagement and visual appeal)
                fbRes = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
                    url: imageUrl,
                    message: message,
                    access_token: fallbackToken
                });
            } else {
                // Fallback to text/link post if no image
                fbRes = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
                    message: message,
                    link: url,
                    access_token: fallbackToken
                });
            }
            
            console.log(`✅ Successfully posted: ${slug}`);
            
            // Extract the Post ID. Photos API returns 'post_id' inside the response or just 'id'
            const postId = fbRes.data.post_id || fbRes.data.id;
            
            if (postId) {
                // Context-aware Comments
                const commentTemplates = {
                    action: [
                        `Pha hành động cuối đỉnh vãi chưởng, ae xem chưa? 🔥`,
                        `Phim cuốn dã man, đánh đấm mãn nhãn luôn ae ạ 🥊`,
                        `Ai mê phim hành động mà bỏ qua bộ này là tiếc lắm nhé! 💥`
                    ],
                    romance: [
                        `Nam chính/nữ chính ngọt ngào quá đi mất 😍💖`,
                        `Cày bộ này khóc hết mấy cuộn giấy vệ sinh luôn mng ơi 😭`,
                        `Mong hai anh chị tới với nhau quá, phim hay dã man 💕`
                    ],
                    horror: [
                        `Hú vía mấy đoạn hù dọa, đang đêm xem sợ rớt tim ra ngoài 💀`,
                        `Thề luôn là phim ám ảnh cực kỳ, ai yếu bóng vía đừng xem 😱`,
                        `Kinh dị mà cuốn quá không dứt ra được ae ạ 👻`
                    ],
                    comedy: [
                        `Cười đau cả bụng, diễn viên tấu hài ác thật 🤣`,
                        `Đang stress xem bộ này xả xì trét cực mạnh luôn kkk 😂`,
                        `Bộ này coi cùng lũ bạn thì cười lộn ruột mất 😆`
                    ],
                    anime: [
                        `Nét vẽ 10 điểm, cốt truyện 10 điểm, tuyệt vời! ✨`,
                        `Hóng ss tiếp theo quá, đoạn kết cuốn thực sự 🤩`,
                        `Wibu chân chính không thể bỏ qua siêu phẩm này 🌸`
                    ],
                    historical: [
                        `Tạo hình cổ trang bộ này xuất sắc thật sự, đẹp lung linh ⛩️`,
                        `Nội dung huyền huyễn cực cuốn, xem một mạch hết mấy tập luôn 🐉`,
                        `Mê phim cổ trang mà lỡ bộ này là tiếc hùi hụi nhé cả nhà 🎎`
                    ],
                    scifi: [
                        `Kỹ xảo viễn tưởng đỉnh quá, nhìn như phim rạp luôn 🛸`,
                        `Kịch bản hack não thực sự, xem mà phải suy ngẫm mãi 🧠`,
                        `Ai đam mê khoa học viễn tưởng thì vào điểm danh ngay 👽`
                    ],
                    drama: [
                        `Kịch bản plot twist liên tục, không đoán được đoạn kết luôn 🤯`,
                        `Diễn viên đóng quá đạt, lột tả tâm lý nhân vật xuất sắc 🎭`,
                        `Những góc khuất xã hội được bóc trần quá chân thực, đáng xem 🕵️`
                    ],
                    generic: [
                        `Phim này hay quá anh em ơi, lưu lại tối cày thôi! 😍🍿`,
                        `Ai hóng bộ này giống admin không? Điểm danh phát nào! 🙋‍♂️`,
                        `Chờ mãi mới có vietsub chuẩn bộ này, cày xuyên đêm thôi! 🎬`,
                        `Tag ngay đứa bạn thân vào cùng xem cho đỡ buồn nào mọi người 😆`
                    ]
                };

                const hypeComments = commentTemplates[genreType] || commentTemplates['generic'];
                const randomComment = hypeComments[Math.floor(Math.random() * hypeComments.length)];

                // Post Comment 1 to boost engagement
                await delay(2000);
                await axios.post(`https://graph.facebook.com/v19.0/${postId}/comments`, {
                    message: randomComment,
                    access_token: fallbackToken
                });
                
                // Post Comment 2: Link phim + link affiliate ẩn ở cuối
                await delay(2000);
                const affiliateUrl = getAffiliateLink();
                await axios.post(`https://graph.facebook.com/v19.0/${postId}/comments`, {
                    message: `👉 Link xem trực tiếp full HD Vietsub không giật lag: ${url}\n${affiliateUrl}`,
                    access_token: fallbackToken
                });
                console.log(`💬 Added engagement comments to post: ${postId}`);
            }
            postedMovies.push(slug);
            postedCount++;

            // Wait 5 seconds to avoid rate limiting
            await delay(5000);
        } catch (e) {
            console.error(`❌ Failed to process/post ${slug}:`, e.response?.data || e.message);
        }
    }

    // 5. Save the updated list of posted movies
    if (postedCount > 0) {
        // Keep only the last 5000 records to prevent the file from growing indefinitely
        if (postedMovies.length > 5000) {
            postedMovies = postedMovies.slice(postedMovies.length - 5000);
        }
        
        fs.writeFileSync(POSTED_MOVIES_FILE, JSON.stringify(postedMovies, null, 2), 'utf8');
        console.log(`Finished! Posted ${postedCount} new movies.`);
    } else {
        console.log('No new movies to post.');
    }
})();
