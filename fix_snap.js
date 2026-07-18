const fs = require('fs');

const files = ['index.html', 'linh-mieu.html', 'pricing.html'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/scroll-snap-type:\s*x\s*mandatory;?/g, '');
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Removed scroll-snap from ${file}`);
    }
});
