const fs = require('fs');

let content = fs.readFileSync('js/newGames.js', 'utf8');

const regex = /window\.startColorSortGame = function\(container, levelNumber\) \{[\s\S]*?(?=$)/;

const newCode = `window.startColorSortGame = function(container, levelNumber) {
    const LEVELS = [
        { level: 1, columns: 3, colors: 2 },
        { level: 2, columns: 4, colors: 3 },
        { level: 3, columns: 5, colors: 4 },
        { level: 4, columns: 6, colors: 5 },
        { level: 5, columns: 7, colors: 5 },
        { level: 6, columns: 8, colors: 6 },
        { level: 7, columns: 8, colors: 6, hidden: true },
        { level: 8, columns: 9, colors: 7, hidden: true },
        { level: 9, columns: 10, colors: 8 },
        { level: 10, columns: 10, colors: 8, hidden: true }
    ];

    const cfg = LEVELS[levelNumber - 1];
    
    function isLvlUnlocked(lvl) {
        const max = parseInt(localStorage.getItem('zeka_diyari_game_17_unlocked_v3') || "1");
        return lvl <= max;
    }

    const tabsHTML = LEVELS.map(l => {
        const unl = isLvlUnlocked(l.level);
        return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" ' + (unl ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"') + '>' + (unl ? '💎 ' + l.level : '🔒 ' + l.level) + '</button>';
    }).join('');

    const uiHTML = \`
        <div class="color-sort-game" style="max-width: 600px; margin: 0 auto; user-select:none; text-align:center; padding:10px;">
            <div class="level-tabs" style="display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin-bottom:15px;">\${tabsHTML}</div>
            
            <div style="display:flex; justify-content:space-between; margin-bottom: 10px; padding: 0 10px;">
                <button id="btn-sort-restart" class="btn btn-sm btn-primary" style="padding: 5px 15px; border-radius: 8px;">Yeniden Başla</button>
                <div style="font-size:0.9rem; font-weight:bold; color:var(--text-main); background:var(--bg-card); padding:5px 15px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">Hamle: <span id="move-count">0</span></div>
            </div>
            
            <div id="sort-container" style="display:flex; flex-wrap:wrap; justify-content:center; gap:12px; margin-top:20px; min-height:350px; align-items:flex-end; position:relative;">
            </div>
        </div>
    \`;
    
    container.innerHTML = uiHTML;

    container.querySelectorAll(".level-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            if (tab.hasAttribute("disabled")) return;
            const next = parseInt(tab.dataset.level);
            if (next === levelNumber) return;
            if(window.playSound) window.playSound('click');
            window.startColorSortGame(container, next);
        });
    });

    const btnRestart = container.querySelector('#btn-sort-restart');
    if (btnRestart) {
        btnRestart.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            if(window.playSound) window.playSound('click');
            initLevel();
        });
    }

    const sortContainer = container.querySelector('#sort-container');
    const moveCountEl = container.querySelector('#move-count');
    
    const GEM_COLORS = [
        'linear-gradient(135deg, #f87171, #dc2626)', // Red
        'linear-gradient(135deg, #60a5fa, #2563eb)', // Blue
        'linear-gradient(135deg, #4ade80, #16a34a)', // Green
        'linear-gradient(135deg, #facc15, #ca8a04)', // Yellow
        'linear-gradient(135deg, #c084fc, #9333ea)', // Purple
        'linear-gradient(135deg, #fb923c, #ea580c)', // Orange
        'linear-gradient(135deg, #f472b6, #db2777)', // Pink
        'linear-gradient(135deg, #2dd4bf, #0d9488)', // Teal
        'linear-gradient(135deg, #a78bfa, #7c3aed)'  // Violet
    ];
    
    let columns = [];
    let selectedColIndex = -1;
    let selectedGemsCount = 0;
    let isAnimating = false;
    let initialState = [];
    let moveCount = 0;

    function generateLevel() {
        let items = [];
        for (let i = 0; i < cfg.colors; i++) {
            for (let j = 0; j < 4; j++) {
                items.push(i);
            }
        }
        
        // Shuffle
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        
        columns = [];
        initialState = [];
        let itemIndex = 0;
        
        for (let i = 0; i < cfg.columns; i++) {
            let colItems = [];
            if (i < cfg.colors) { // Fill only 'colors' number of columns initially
                for (let j = 0; j < 4; j++) {
                    colItems.push({ id: itemIndex, colorIdx: items[itemIndex] });
                    itemIndex++;
                }
            }
            columns.push(colItems);
            initialState.push([...colItems]);
        }
    }

    function renderColumns() {
        sortContainer.innerHTML = '';
        moveCountEl.innerText = moveCount;
        
        const maxColsPerRow = Math.min(6, cfg.columns);
        const colWidth = Math.min(60, (sortContainer.clientWidth - (maxColsPerRow * 12)) / maxColsPerRow);
        
        columns.forEach((col, cIdx) => {
            const colDiv = document.createElement('div');
            colDiv.className = 'gem-column';
            colDiv.style.width = colWidth + 'px';
            colDiv.style.height = (colWidth * 4.2) + 'px';
            colDiv.style.background = 'linear-gradient(to top, #475569 0%, #334155 15%, transparent 15%)';
            colDiv.style.borderBottom = '15px solid #1e293b'; // Pedestal base
            colDiv.style.borderRadius = '5px';
            colDiv.style.position = 'relative';
            colDiv.style.display = 'flex';
            colDiv.style.flexDirection = 'column-reverse';
            colDiv.style.alignItems = 'center';
            colDiv.style.cursor = 'pointer';
            colDiv.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            colDiv.style.transition = 'all 0.2s';
            
            if (cIdx === selectedColIndex) {
                colDiv.style.background = 'linear-gradient(to top, #64748b 0%, #475569 15%, rgba(255,255,255,0.05) 15%)';
                colDiv.style.transform = 'scale(1.02)';
            }
            
            col.forEach((gemData, gIdx) => {
                const gem = document.createElement('div');
                gem.style.width = (colWidth * 0.9) + 'px';
                gem.style.height = (colWidth * 0.75) + 'px';
                
                // Gem Diamond cut styling
                gem.style.background = GEM_COLORS[gemData.colorIdx];
                gem.style.clipPath = 'polygon(20% 0%, 80% 0%, 100% 40%, 50% 100%, 0% 40%)';
                gem.style.boxShadow = 'inset 0 4px 6px rgba(255,255,255,0.5), inset 0 -4px 6px rgba(0,0,0,0.4)';
                
                gem.style.marginBottom = '2px';
                gem.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                gem.style.zIndex = gIdx;
                gem.style.position = 'relative';
                
                // Add inner reflection to make it look shiny
                const reflection = document.createElement('div');
                reflection.style.position = 'absolute';
                reflection.style.top = '10%';
                reflection.style.left = '20%';
                reflection.style.width = '30%';
                reflection.style.height = '20%';
                reflection.style.background = 'rgba(255,255,255,0.6)';
                reflection.style.transform = 'rotate(-15deg)';
                gem.appendChild(reflection);
                
                // If this gem is part of the selected group, elevate it
                if (cIdx === selectedColIndex && gIdx >= col.length - selectedGemsCount) {
                    // Calculate elevation offset
                    const offset = (col.length - gIdx - 1);
                    gem.style.transform = \`translateY(-\${colWidth * 1.5}px)\`;
                    gem.style.filter = 'brightness(1.2) drop-shadow(0 10px 10px rgba(0,0,0,0.3))';
                    gem.style.zIndex = 10 + gIdx;
                }
                
                if (cfg.hidden && gIdx < col.length - 1 && !(cIdx === selectedColIndex && gIdx >= col.length - selectedGemsCount)) {
                    gem.style.background = '#334155'; // hidden mode
                    gem.style.clipPath = 'none';
                    gem.style.borderRadius = '8px';
                    reflection.style.display = 'none';
                    gem.innerText = '?';
                    gem.style.color = '#fff';
                    gem.style.display = 'flex';
                    gem.style.justifyContent = 'center';
                    gem.style.alignItems = 'center';
                    gem.style.fontWeight = 'bold';
                }
                
                colDiv.appendChild(gem);
            });
            
            colDiv.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                handleColumnClick(cIdx, colDiv);
            });
            
            sortContainer.appendChild(colDiv);
        });
    }

    function checkWin() {
        // Win condition: All columns are empty!
        let isEmpty = true;
        for (let col of columns) {
            if (col.length > 0) {
                isEmpty = false;
                break;
            }
        }
        
        if (isEmpty) {
            if (window.playSound) window.playSound('win');
            
            const max = parseInt(localStorage.getItem('zeka_diyari_game_17_unlocked_v3') || "1");
            if (levelNumber === max && levelNumber < 10) {
                localStorage.setItem('zeka_diyari_game_17_unlocked_v3', levelNumber + 1);
            }
            
            if (window.updateStats) window.updateStats(100, 1);
            
            const nextBtn = levelNumber < 10 ? \`<button class="btn btn-success" id="btn-sort-next" style="margin-top:20px; z-index:20; position:relative; pointer-events:auto; font-size:1.1rem; padding:10px 20px;">Sonraki Seviye</button>\` : '';
            
            setTimeout(() => {
                const html = \`
                    <div style="position:absolute; inset:0; background:rgba(0,0,0,0.85); display:flex; flex-direction:column; justify-content:center; align-items:center; color:white; z-index:10; border-radius:12px;">
                        <div style="font-size: 5rem; margin-bottom:15px; animation: bounce-loop 2s infinite;">💎</div>
                        <h2 style="color:#a78bfa; font-size:2.5rem; margin-bottom:10px; text-shadow: 0 0 15px rgba(167,139,250,0.8);">Mükemmel!</h2>
                        <p style="color:#cbd5e1; font-size:1.1rem;">Tüm mücevherler patlatıldı!</p>
                        \${nextBtn}
                    </div>
                \`;
                const overlay = document.createElement('div');
                overlay.innerHTML = html;
                container.querySelector('.color-sort-game').style.position = 'relative';
                container.querySelector('.color-sort-game').appendChild(overlay);
                
                if (levelNumber < 10) {
                    const btn = document.getElementById('btn-sort-next');
                    if(btn) {
                        btn.onclick = () => window.startColorSortGame(container, levelNumber + 1);
                    }
                }
            }, 500);
        }
    }

    function createExplosion(colElement, colorIdx) {
        if(window.playSound) window.playSound('success'); // Play blast sound
        
        // Spawn particles
        const rect = colElement.getBoundingClientRect();
        const containerRect = sortContainer.getBoundingClientRect();
        const cx = rect.left - containerRect.left + rect.width / 2;
        const cy = rect.top - containerRect.top + rect.height / 2;
        
        const colorStops = ['#f87171', '#60a5fa', '#4ade80', '#facc15', '#c084fc', '#fb923c', '#f472b6', '#2dd4bf', '#a78bfa'];
        const pColor = colorStops[colorIdx];
        
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.style.position = 'absolute';
            p.style.width = '10px';
            p.style.height = '10px';
            p.style.background = pColor;
            p.style.borderRadius = '50%';
            p.style.left = cx + 'px';
            p.style.top = cy + 'px';
            p.style.zIndex = 50;
            p.style.boxShadow = \`0 0 10px \${pColor}\`;
            
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 80 + 20;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist - 50; // Tend upwards
            
            p.animate([
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: \`translate(calc(-50% + \${tx}px), calc(-50% + \${ty}px)) scale(0)\`, opacity: 0 }
            ], {
                duration: 600 + Math.random() * 400,
                easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
            });
            
            sortContainer.appendChild(p);
            setTimeout(() => p.remove(), 1000);
        }
    }

    function getContiguousGemsCount(col) {
        if (col.length === 0) return 0;
        const topColor = col[col.length - 1].colorIdx;
        let count = 0;
        for (let i = col.length - 1; i >= 0; i--) {
            if (col[i].colorIdx === topColor) count++;
            else break;
        }
        return count;
    }

    function handleColumnClick(cIdx, colElement) {
        if (isAnimating) return;
        
        // Tap same column again to deselect
        if (selectedColIndex === cIdx) {
            selectedColIndex = -1;
            selectedGemsCount = 0;
            if (window.playSound) window.playSound('click');
            renderColumns();
            return;
        }
        
        // Select a column (Multi-select)
        if (selectedColIndex === -1) {
            if (columns[cIdx].length === 0) return; // Cannot select empty
            selectedColIndex = cIdx;
            selectedGemsCount = getContiguousGemsCount(columns[cIdx]);
            if (window.playSound) window.playSound('click');
            renderColumns();
            return;
        }
        
        // Move from selected to clicked
        const sourceCol = columns[selectedColIndex];
        const destCol = columns[cIdx];
        
        const topGemColor = sourceCol[sourceCol.length - 1].colorIdx;
        
        // Validate Move
        let isValid = false;
        
        // Ensure destination has enough space for all selected gems
        if (destCol.length + selectedGemsCount <= 4) {
            if (destCol.length === 0) {
                isValid = true;
            } else if (destCol[destCol.length - 1].colorIdx === topGemColor) {
                isValid = true;
            }
        }
        
        if (isValid) {
            moveCount++;
            // Pop from source, push to dest
            const movingGems = sourceCol.splice(sourceCol.length - selectedGemsCount, selectedGemsCount);
            destCol.push(...movingGems);
            
            selectedColIndex = -1;
            selectedGemsCount = 0;
            if (window.playSound) window.playSound('click');
            
            // Check if destination column is now full with 4 gems of the same color
            if (destCol.length === 4 && getContiguousGemsCount(destCol) === 4) {
                isAnimating = true;
                renderColumns(); // Show them landing first
                
                setTimeout(() => {
                    createExplosion(sortContainer.children[cIdx], topGemColor);
                    // Clear the column
                    columns[cIdx] = [];
                    renderColumns();
                    isAnimating = false;
                    checkWin();
                }, 300); // Wait 300ms before explosion
            } else {
                renderColumns();
            }
        } else {
            // Invalid move
            if (window.playSound) window.playSound('locked');
            selectedColIndex = -1; // Deselect
            selectedGemsCount = 0;
            renderColumns();
        }
    }

    function initLevel() {
        selectedColIndex = -1;
        selectedGemsCount = 0;
        isAnimating = false;
        moveCount = 0;
        if (initialState.length > 0) {
            columns = initialState.map(col => [...col]); // Reset to initial
        } else {
            generateLevel();
        }
        renderColumns();
    }
    
    initLevel();
};
`;

if (regex.test(content)) {
    content = content.replace(regex, newCode);
    fs.writeFileSync('js/newGames.js', content);
    console.log('Advanced gem mechanics applied');
    
    let sw = fs.readFileSync('sw.js', 'utf8');
    sw = sw.replace(/const CACHE_NAME = "zeka-diyari-v[0-9]+";/, 'const CACHE_NAME = "zeka-diyari-v22";');
    fs.writeFileSync('sw.js', sw);
} else {
    console.log('REGEX FAILED');
}
