const fs = require('fs');

if (fs.existsSync('linh-mieu.html')) {
    let content = fs.readFileSync('linh-mieu.html', 'utf8');

    // 1. Xóa style block đầu file nếu có
    content = content.replace(/<style id="sequential-layout-fix">[\s\S]*?<\/style>\r?\n?/, '');

    // 2. Sửa hero-thumbnails-container
    content = content.replace(/<div class="hero-thumbnails-container absolute z-30 left-0 right-0 pointer-events-none" style="[^"]*">/, '<div class="hero-thumbnails-container relative z-30 pointer-events-none">');

    // 3. Xóa style block bên trong hero-thumbnails-container
    content = content.replace(/<style>\s*@media \(min-width: 768px\) \{[\s\S]*?<\/style>\r?\n?/, '');

    // 4. Sửa mobile-thumb-wrapper
    content = content.replace(/<div class="w-full max-w-\[1600px\] mx-auto px-4 md:px-6 lg:px-8 mobile-thumb-wrapper"[^>]*>/, '<div class="w-full max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 mobile-thumb-wrapper">');

    // 5. Sửa interests-section
    content = content.replace(/<section class="interests-section absolute left-0 right-0 z-40 bg-transparent pt-4 pb-0 mb-0" style="[^"]*">/, '<section class="interests-section relative z-40 bg-transparent pt-4 pb-0 mb-0">');

    // Check and remove margin-top: -60px for .bg-void
    content = content.replace(/\.bg-void\s*\{\s*margin-top:\s*-60px\s*!important;\s*position:\s*relative\s*!important;\s*z-index:\s*50\s*!important;\s*\}/g, 
        '.bg-void { margin-top: 0px !important; position: relative !important; z-index: 50 !important; padding-top: 24px !important; }');
    content = content.replace(/\.bg-void::before\s*\{[\s\S]*?z-index:\s*-1;\s*\}/g, '.bg-void::before { display: none !important; }');

    fs.writeFileSync('linh-mieu.html', content, 'utf8');
    console.log('Fixed linh-mieu.html successfully!');
} else {
    console.log('linh-mieu.html not found.');
}
