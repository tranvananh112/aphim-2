const fs = require('fs');
const snippet = `    <!-- Favicon -->\n    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n    <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">\n    <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">\n    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n    <link rel="manifest" href="/site.webmanifest">\n    <link rel="shortcut icon" href="/favicon.ico">`;

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
let count = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/^\s*<link[^>]+rel=["']?(?:icon|apple-touch-icon|shortcut icon|manifest)["']?[^>]*>\r?\n?/gim, '');
    content = content.replace(/^\s*<!-- Favicon -->\r?\n?/gim, '');
    if (content.match(/(<title>.*?<\/title>)/i)) {
        content = content.replace(/(<title>.*?<\/title>)/i, `$1\n${snippet}`);
        fs.writeFileSync(file, content, 'utf8');
        count++;
    } else {
        console.log('No title found in ' + file);
    }
});
console.log('Updated ' + count + ' files.');
