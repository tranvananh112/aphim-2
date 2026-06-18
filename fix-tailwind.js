const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

let updated = 0;
const goodConfig = `    <script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2f20d",
                        "primary-dim": "#b3b30a",
                        "primary-red": "#ec1313",
                        "background-light": "#f8f8f5",
                        "background-dark": "#1e202c",
                        "surface-dark": "#282a3a",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "sans-serif"],
                        "vietnam": ["Be Vietnam Pro", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px" },
                },
            },
        }
    </script>`;

for (const file of files) {
    if (file === 'index.html' || file === 'profile.html') continue; // Always skip index
    
    let content = fs.readFileSync(file, 'utf8');
    const tailwindBlockRegex = /<script>\s*tailwind\.config\s*=\s*\{[\s\S]*?\}[\s]*<\/script>/;
    const match = content.match(tailwindBlockRegex);
    
    if (match) {
        if (!match[0].includes('fontFamily')) {
            content = content.replace(match[0], goodConfig);
            fs.writeFileSync(file, content);
            console.log('Updated tailwind.config in: ' + file);
            updated++;
        }
    }
}
console.log('Total files updated: ' + updated);
