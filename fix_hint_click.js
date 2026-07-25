const fs = require('fs');

let content = fs.readFileSync('js/newGames.js', 'utf8');

// Replace the automatic selection logic in handleHintRequest
const regex = /\/\/ Eğer seçili olan başka bir sütun varsa iptal et[\s\S]*?renderColumns\(\); \/\/ Taşın havaya kalkması için render/m;

const replacement = `
            // Oyuncunun kendi başına tıklaması daha doğal olduğu için
            // otomatik seçimi iptal ediyoruz. Sadece görsel yönlendirme yapacağız.
            if (selectedColIndex !== -1) {
                selectedColIndex = -1;
                selectedGemsCount = 0;
            }
            renderColumns(); // Seçimi sıfırlamak için render
`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('js/newGames.js', content);
    console.log('Hint auto-select removed.');
    
    let sw = fs.readFileSync('sw.js', 'utf8');
    sw = sw.replace(/const CACHE_NAME = "zeka-diyari-v[0-9]+";/, 'const CACHE_NAME = "zeka-diyari-v26";');
    fs.writeFileSync('sw.js', sw);
} else {
    console.log('REGEX FAILED');
}
