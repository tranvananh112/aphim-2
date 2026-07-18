const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Check and remove margin-top: -60px for .bg-void
content = content.replace(/\.bg-void\s*\{\s*margin-top:\s*-60px\s*!important;\s*position:\s*relative\s*!important;\s*z-index:\s*50\s*!important;\s*\}/g, 
    '.bg-void { margin-top: 0px !important; position: relative !important; z-index: 50 !important; padding-top: 24px !important; }');
content = content.replace(/\.bg-void::before\s*\{[\s\S]*?z-index:\s*-1;\s*\}/g, '.bg-void::before { display: none !important; }');

fs.writeFileSync('index.html', content, 'utf8');
console.log('Fixed bg-void margin successfully!');
