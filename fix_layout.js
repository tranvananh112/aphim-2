const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Xóa style block đầu file
content = content.replace(/<style id="sequential-layout-fix">[\s\S]*?<\/style>\r?\n?/, '');

// 2. Sửa hero-thumbnails-container
content = content.replace(/<div class="hero-thumbnails-container absolute z-30 left-0 right-0 pointer-events-none" style="bottom: 305px;">/, '<div class="hero-thumbnails-container relative z-30 pointer-events-none">');

// 3. Xóa style block bên trong hero-thumbnails-container
content = content.replace(/<style>\s*@media \(min-width: 768px\) \{[\s\S]*?<\/style>\r?\n?/, '');

// 4. Sửa mobile-thumb-wrapper (đôi khi nó có justify-content:center hoặc flex-end)
content = content.replace(/<div class="w-full max-w-\[1600px\] mx-auto px-4 md:px-6 lg:px-8 mobile-thumb-wrapper"[^>]*>/, '<div class="w-full max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 mobile-thumb-wrapper">');

// 5. Sửa interests-section
content = content.replace(/<section class="interests-section absolute left-0 right-0 z-40 bg-transparent pt-4 pb-0 mb-0" style="[^"]*">/, '<section class="interests-section relative z-40 bg-transparent pt-4 pb-0 mb-0">');

fs.writeFileSync('index.html', content, 'utf8');
console.log('Fixed index.html successfully!');
