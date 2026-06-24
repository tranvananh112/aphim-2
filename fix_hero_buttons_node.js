const fs = require('fs');
const files = [
    'F:\\Wesite Xem Phim Node\\views\\index.ejs'
];

const blockRegex = /<!-- Play Button - Positioned at bottom left -->[\s\S]*?<!-- Thumbnails - Bottom Right/;

const replacement = `<!-- Play Button - Positioned at bottom left -->
                <div class="pt-4 flex items-center gap-6">
                    <a id="heroPlayBtn" href="#" class="group inline-block relative">
                        <div class="relative" style="width: 68px; height: 68px;">
                            <div class="relative rounded-full flex items-center justify-center group-hover:scale-[1.15] transition-transform duration-75" style="width: 100%; height: 100%;">
                                <dotlottie-wc src="https://lottie.host/b6aa21df-5315-4db3-ac65-3e36bc67912a/dLNeR1IODi.lottie" style="width: 115px; height: 115px; max-width: none; pointer-events: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); filter: drop-shadow(0 0 15px rgba(255,100,0,0.6));" autoplay loop></dotlottie-wc>
                            </div>
                        </div>
                        <span class="absolute top-full left-1/2 -translate-x-1/2 whitespace-nowrap mt-2 text-center text-primary font-bold uppercase tracking-widest text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-75 transform translate-y-2 group-hover:translate-y-0 drop-shadow-[0_2px_8px_rgba(252,211,77,0.5)]">
                            Xem Ngay
                        </span>
                    </a>

                    <!-- Favorite & Info Pill -->
                    <div class="flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-full overflow-hidden h-12">
                        <button id="heroFavBtn" class="w-14 h-full flex items-center justify-center hover:bg-white/20 transition-all duration-75 border-r border-white/10 group px-4">
                            <span class="material-icons-round text-white/90 group-hover:scale-125 transition-transform duration-75 group-hover:text-red-400">favorite_border</span>
                        </button>
                        <a id="heroInfoBtn" href="#" class="w-14 h-full flex items-center justify-center hover:bg-white/20 transition-all duration-75 group px-4">
                            <span class="material-icons-round text-white/90 group-hover:scale-125 transition-transform duration-75 group-hover:text-blue-400">info</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Thumbnails - Bottom Right`;

files.forEach(f => {
    if(fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        if(blockRegex.test(content)) {
            content = content.replace(blockRegex, replacement);
            fs.writeFileSync(f, content, 'utf8');
            console.log('Updated completely in ' + f);
        } else {
            console.log('Regex did not match in ' + f);
        }
    }
});
