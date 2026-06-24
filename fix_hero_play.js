const fs = require('fs');
const files = [
    'F:\\Wesite Xem Phim Mới\\index.html',
    'F:\\Wesite Xem Phim\\index.html',
    'F:\\Wesite Xem Phim Node\\views\\index.ejs'
];

const brokenBtnRegex = /<a\s+id="heroPlayBtn"\s+href="#"\s+class="group\s+inline-block\s+relative[^"]*">\s*<div\s+class="relative[^"]*"[^>]*>\s*<dotlottie-wc[\s\S]*?<\/dotlottie-wc>\s*<\/div>\s*<\/a>/;

const fixedReplacement = `<a id="heroPlayBtn" href="#" class="group inline-block relative" style="width: 68px; height: 68px; display: block;">
    <div class="relative flex items-center justify-center" style="width: 68px; height: 68px; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        <dotlottie-wc src="https://lottie.host/b6aa21df-5315-4db3-ac65-3e36bc67912a/dLNeR1IODi.lottie" style="width: 80px; height: 80px; pointer-events: none; margin-left: -6px; margin-top: -6px; filter: drop-shadow(0 0 15px rgba(255,100,0,0.6));" autoplay loop></dotlottie-wc>
    </div>
</a>`;

files.forEach(f => {
    if(fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        if(brokenBtnRegex.test(content)) {
            content = content.replace(brokenBtnRegex, fixedReplacement);
            fs.writeFileSync(f, content, 'utf8');
            console.log('Fixed in ' + f);
        } else {
            console.log('Regex did not match in ' + f);
        }
    }
});
