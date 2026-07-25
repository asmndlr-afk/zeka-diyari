const fs = require('fs');
let content = fs.readFileSync('js/app.js', 'utf8');

content = content.replace(
    /\} else if \(game\.id === 16\) \{\s*startConnectDotsGame\(modalBodyElement,\s*1\);\s*\}/,
    `} else if (game.id === 16) {
                startConnectDotsGame(modalBodyElement, 1);
            } else if (game.id === 17) {
                if (window.startColorSortGame) window.startColorSortGame(modalBodyElement, 1);
            }`
);

fs.writeFileSync('js/app.js', content);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = "zeka-diyari-v[0-9]+";/, 'const CACHE_NAME = "zeka-diyari-v21";');
fs.writeFileSync('sw.js', sw);
