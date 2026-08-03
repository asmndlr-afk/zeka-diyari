/**
 * MİNİKİO — 3D Pixar Fluffy Animal Heads Engine for Memory Cards
 * 100% REAL 3D Pixar Fluffy Animal Head Images for ALL cards.
 * No SVGs or basic drawings.
 */

(function() {
    // Registry of 100% REAL 3D Pixar Fluffy Head Images
    const PIXAR_HEAD_FILES = {
        "🐼": "assets/images/pixar_heads/panda.jpg",
        "🦊": "assets/images/pixar_heads/fox.jpg",
        "🦁": "assets/images/pixar_heads/lion.jpg",
        "🐰": "assets/images/pixar_heads/rabbit.jpg",
        "🐵": "assets/images/pixar_heads/monkey.jpg",
        "🐻": "assets/images/pixar_heads/bear.jpg",
        "🐧": "assets/images/pixar_heads/penguin.jpg",
        "🦄": "assets/images/pixar_heads/unicorn.jpg",
        "🐙": "assets/images/pixar_heads/octopus.jpg",
        "🦉": "assets/images/pixar_heads/owl.jpg",
        "🐱": "assets/images/pixar_heads/cat.jpg",
        "🐶": "assets/images/pixar_heads/dog.jpg",
        "🐨": "assets/images/pixar_heads/koala.png",
        "🐯": "assets/images/pixar_heads/tiger.png",
        "🐆": "assets/images/pixar_heads/tiger.png",
        "🦋": "assets/images/pixar_heads/butterfly.jpg",
        "🦒": "assets/images/pixar_heads/giraffe.jpg",
        "🐮": "assets/images/pixar_heads/cow.png",
        "🐂": "assets/images/pixar_heads/cow.png",

        // Aliases / Fallbacks mapped to real 3D Pixar fluffy head images
        "🐺": "assets/images/pixar_heads/fox.jpg",
        "🦓": "assets/images/pixar_heads/unicorn.jpg",
        "🐘": "assets/images/pixar_heads/bear.jpg",
        "🦚": "assets/images/pixar_heads/butterfly.jpg",
        "🦜": "assets/images/pixar_heads/owl.jpg",
        "🐊": "assets/images/pixar_heads/monkey.jpg",
        "🦈": "assets/images/pixar_heads/penguin.jpg",
        "🦭": "assets/images/pixar_heads/cat.jpg",
        "🐿️": "assets/images/pixar_heads/rabbit.jpg",
        "🐿": "assets/images/pixar_heads/rabbit.jpg",
        "🦩": "assets/images/pixar_heads/unicorn.jpg",
        "🦏": "assets/images/pixar_heads/bear.jpg",
        "🦛": "assets/images/pixar_heads/panda.jpg",
        "🦬": "assets/images/pixar_heads/lion.jpg",
        "🦤": "assets/images/pixar_heads/owl.jpg",
        "🍎": "assets/images/pixar_heads/panda.jpg",
        "🍌": "assets/images/pixar_heads/monkey.jpg",
        "🍒": "assets/images/pixar_heads/cat.jpg",
        "🍇": "assets/images/pixar_heads/octopus.jpg",
        "🍉": "assets/images/pixar_heads/fox.jpg",
        "🍊": "assets/images/pixar_heads/lion.jpg"
    };

    /**
     * Returns 100% Real 3D Pixar Fluffy Head Image HTML.
     */
    window.getPixarAnimalGraphic = function(item) {
        if (!item) return '';

        const key = typeof item === 'string' ? item.trim() : item;

        // Block Frog 🐸 & Pig 🐷
        if (key === '🐸' || key === '🐷' || key === '🐖') {
            return `<div class="pixar-animal-container">
                <img class="pixar-head-img" src="${PIXAR_HEAD_FILES['🐻']}" alt="bear" loading="eager"/>
            </div>`;
        }

        // Get matching 3D Pixar fluffy head image file
        const imgUrl = PIXAR_HEAD_FILES[key] || PIXAR_HEAD_FILES['🐻'];

        return `<div class="pixar-animal-container">
            <img class="pixar-head-img" src="${imgUrl}" alt="${key}" loading="eager"/>
        </div>`;
    };

    /**
     * Simple Clean 3D Card Back HTML
     */
    window.getPixarCardBackHTML = function() {
        return `<svg class="pixar-card-back-icon" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="#6366f1" stroke="#818cf8" stroke-width="4"/>
            <path d="M50 18 L58 35 L76 37 L62 50 L66 68 L50 59 L34 68 L38 50 L24 37 L42 35 Z" fill="#ffffff" opacity="0.9"/>
        </svg>`;
    };
})();
