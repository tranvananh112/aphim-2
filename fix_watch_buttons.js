const fs = require('fs');
const files = [
    'F:\\Wesite Xem Phim Mới\\js\\watch.js',
    'F:\\Wesite Xem Phim\\js\\watch.js',
    'F:\\Wesite Xem Phim Node\\js\\watch.js'
];

const regex = /<!-- Server Buttons -->[\s\S]*?<\/div>\s*<\/div>\s*`;/g;

const replacement = `<!-- Server Buttons -->
            <div class="flex flex-wrap items-center justify-center gap-3">
                <button onclick="changeVersion('aphim.top')" style="background-color: #fcd576; color: black; box-shadow: \${isSvap1 ? '0 0 15px rgba(252,213,118,0.8)' : '0 4px 12px rgba(252,213,118,0.3)'}; \${isSvap1 ? 'transform: scale(1.05); border: 2px solid white;' : ''}" class="relative overflow-visible flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-lg transition-all text-sm font-bold hover:-translate-y-1 hover:brightness-95">
                    \${isSvap1 ? '<span class="material-icons-round text-[16px]">check_circle</span><span>Đang xem (SVAP1)</span>' : '<span>' + displayLang + ' (SVAP1)</span>'}
                    
                    <!-- Lottie Crown SVAP1 VIP -->
                    <div style="position: absolute; top: -14px; right: -14px; z-index: 20; pointer-events: none; width: 40px; height: 40px; transform: rotate(15deg); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                        <dotlottie-wc src="https://lottie.host/3d743490-d86f-4cc7-9170-2fefdb01db16/8A8VL5a8T2.lottie" style="width: 100%; height: 100%;" autoplay loop></dotlottie-wc>
                    </div>
                </button>
                <button onclick="changeVersion('aphim1.io.vn')" style="background-color: #c8407a; color: white; box-shadow: \${isSvap2 ? '0 0 15px rgba(200,64,122,0.8)' : '0 4px 12px rgba(200,64,122,0.3)'}; \${isSvap2 ? 'transform: scale(1.05); border: 2px solid white;' : ''}" class="relative overflow-visible flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-lg transition-all text-sm font-bold hover:-translate-y-1 hover:brightness-110">
                    \${isSvap2 ? '<span class="material-icons-round text-[16px]">check_circle</span><span>Đang xem (SVAP2)</span>' : '<span>' + displayLang + ' (SVAP2)</span>'}
                </button>
                <button onclick="changeVersion('aphim.io.vn')" style="background-color: #299573; color: white; box-shadow: \${isSvap3 ? '0 0 15px rgba(41,149,115,0.8)' : '0 4px 12px rgba(41,149,115,0.3)'}; \${isSvap3 ? 'transform: scale(1.05); border: 2px solid white;' : ''}" class="relative overflow-visible flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-lg transition-all text-sm font-bold hover:-translate-y-1 hover:brightness-110">
                    \${isSvap3 ? '<span class="material-icons-round text-[16px]">check_circle</span><span>Đang xem (SVAP3)</span>' : '<span>' + displayLang + ' (SVAP3)</span>'}
                </button>
            </div>
        </div>
    \`;`;

files.forEach(f => {
    if(fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        if(regex.test(content)) {
            content = content.replace(regex, replacement);
            fs.writeFileSync(f, content, 'utf8');
            console.log('Fixed watch buttons in ' + f);
        } else {
            console.log('Regex did not match in ' + f);
        }
    }
});
