const fs = require('fs');
const files = [
    'F:\\Wesite Xem Phim Mới\\index.html',
    'F:\\Wesite Xem Phim\\index.html',
    'F:\\Wesite Xem Phim Node\\views\\index.ejs'
];

const btnRegex = /<a\s+id="heroPlayBtn"\s+href="#"\s+class="group\s+inline-block\s+relative[^>]*>[\s\S]*?<\/a>/;

const correctHTML = `<a id="heroPlayBtn" href="#" class="group inline-block relative before:absolute before:-inset-y-8 before:-inset-x-6 before:content-[''] before:z-0">
    <div class="relative">
        <div class="relative rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300" style="width: 68px; height: 68px;">
            <dotlottie-wc src="https://lottie.host/b6aa21df-5315-4db3-ac65-3e36bc67912a/dLNeR1IODi.lottie" style="width: 80px; height: 80px; pointer-events: none; margin-left: -6px; margin-top: -6px; filter: drop-shadow(0 0 15px rgba(255,100,0,0.6));" autoplay loop></dotlottie-wc>
        </div>
    </div>
    <span class="absolute top-full left-1/2 -translate-x-1/2 whitespace-nowrap mt-2 text-center text-primary font-bold uppercase tracking-widest text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 drop-shadow-[0_2px_8px_rgba(252,211,77,0.5)]">
        Xem Ngay
    </span>
</a>`;

files.forEach(f => {
    if(fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        if(btnRegex.test(content)) {
            content = content.replace(btnRegex, correctHTML);
            fs.writeFileSync(f, content, 'utf8');
            console.log('Fixed completely in ' + f);
        } else {
            console.log('Regex did not match in ' + f);
        }
    }
});
