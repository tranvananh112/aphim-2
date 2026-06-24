const fs = require('fs');
const files = [
    'F:\\Wesite Xem Phim Mới\\index.html',
    'F:\\Wesite Xem Phim\\index.html',
    'F:\\Wesite Xem Phim Node\\views\\index.ejs'
];

const replacement = `<a id="heroPlayBtn" href="#" class="group inline-block relative transform hover:scale-110 transition-transform duration-300 pointer-events-auto">
                        <div class="relative w-[80px] h-[80px] flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(255,100,0,0.6)]">
                            <dotlottie-wc src="https://lottie.host/b6aa21df-5315-4db3-ac65-3e36bc67912a/dLNeR1IODi.lottie" style="width: 100%; height: 100%; pointer-events: none;" autoplay loop></dotlottie-wc>
                        </div>
                    </a>`;

const oldBtnRegex = /<a\s+id="heroPlayBtn"\s+href="#"\s+class="group\s+inline-block\s+relative">[\s\S]*?<\/a>/;

files.forEach(f => {
    if(fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        content = content.replace(oldBtnRegex, replacement);
        fs.writeFileSync(f, content, 'utf8');
        console.log('Replaced in ' + f);
    }
});
