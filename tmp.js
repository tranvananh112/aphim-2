const fs = require('fs');
const html = fs.readFileSync('watch.html', 'utf8');
let gridStart = html.indexOf('<div class="grid grid-cols-1 lg:grid-cols-12');
if (gridStart !== -1) {
    let inGrid = html.substring(gridStart);
    let depth = 0;
    let children = [];
    let startPos = -1;
    let i = 0;
    while (i < inGrid.length) {
        if (inGrid.startsWith('<div', i) || inGrid.startsWith('<aside', i) || inGrid.startsWith('<section', i)) {
            if (depth === 1) {
                startPos = i;
            }
            depth++;
            i += 4;
        } else if (inGrid.startsWith('</div', i) || inGrid.startsWith('</aside', i) || inGrid.startsWith('</section', i)) {
            depth--;
            if (depth === 1 && startPos !== -1) {
                let childHTML = inGrid.substring(startPos, i + 6);
                let idMatch = childHTML.match(/id="([^"]+)"/);
                let classMatch = childHTML.match(/class="([^"]+)"/);
                children.push({
                    tag: childHTML.substring(1, 4),
                    id: idMatch ? idMatch[1] : null,
                    cls: classMatch ? classMatch[1] : null
                });
            }
            if (depth === 0) break;
            i += 5;
        } else {
            i++;
        }
    }
    console.log('Children:', children);
}
