// newGames.js - Oyun 13, 14, 15 ve 16 motorları

/* ============================================================
   OYUN 13: SAYI YAPBOZU (Number Puzzle) - Swap Logic
   ============================================================ */
window.startNumberPuzzleGame = function(container, levelNumber) {
    const LEVELS = [
        { level: 1, name: "Başlangıç", cols: 2, rows: 2, scoreBase: 50 },
        { level: 2, name: "Isınma", cols: 3, rows: 2, scoreBase: 70 },
        { level: 3, name: "Kolay", cols: 3, rows: 3, scoreBase: 100 },
        { level: 4, name: "Biraz Karmaşık", cols: 4, rows: 3, scoreBase: 120 },
        { level: 5, name: "Orta", cols: 4, rows: 4, scoreBase: 150 },
        { level: 6, name: "Dikkatli Ol", cols: 5, rows: 4, scoreBase: 200 },
        { level: 7, name: "Zor", cols: 5, rows: 5, scoreBase: 250 },
        { level: 8, name: "Usta", cols: 6, rows: 5, scoreBase: 300 },
        { level: 9, name: "Efsane", cols: 6, rows: 6, scoreBase: 400 },
        { level: 10, name: "Yapboz Kralı", cols: 7, rows: 6, scoreBase: 500 }
    ];

    const cfg = LEVELS[levelNumber - 1];
    const totalCells = cfg.cols * cfg.rows;
    
    function isLvlUnlocked(lvl) {
        const max = parseInt(localStorage.getItem('zeka_diyari_game_13_unlocked_v3') || "1");
        return lvl <= max;
    }

    const selectHTML = `
        <div style="margin-bottom:15px; padding: 0 10px;">
            <select class="level-select form-control" style="width:100%; max-width:100%; padding:10px 15px; font-size:1.1rem; border-radius:12px; display:block; border: 2px solid var(--primary); outline:none; background-color:#fff; color:#333; box-shadow:0 4px 6px rgba(0,0,0,0.1); cursor:pointer;">
                ${LEVELS.map(l => {
                    const unl = (typeof isLvlUnlocked === 'function') ? isLvlUnlocked(l.level) : true;
                    const name = l.name ? l.name : 'Seviye ' + l.level;
                    const label = unl ? (l.level + '. ' + name) : ('🔒 ' + l.level);
                    return `<option value="${l.level}" ${l.level === levelNumber ? 'selected' : ''} ${unl ? '' : 'disabled'}>${label}</option>`;
                }).join('')}
            </select>
        </div>
    `;

    // Hedef diziyi oluştur [1, 2, 3, ..., 0] (0 = boşluk)
    let targetArr = [];
    for(let i=1; i < totalCells; i++) targetArr.push(i);
    targetArr.push(0);

    let currentArr = [...targetArr];
    let moves = 0;
    let isShuffled = false;
    
    function getValidMoves(emptyIdx) {
        const moves = [];
        const r = Math.floor(emptyIdx / cfg.cols);
        const c = emptyIdx % cfg.cols;
        if (r > 0) moves.push(emptyIdx - cfg.cols); // Yukarı kayabilir
        if (r < cfg.rows - 1) moves.push(emptyIdx + cfg.cols); // Aşağı kayabilir
        if (c > 0) moves.push(emptyIdx - 1); // Sola kayabilir
        if (c < cfg.cols - 1) moves.push(emptyIdx + 1); // Sağa kayabilir
        return moves;
    }

    function doShuffle() {
        let emptyIdx = currentArr.indexOf(0);
        let lastMove = -1;
        let attempts = 0;
        
        do {
            const extraMoves = Math.floor(Math.random() * 20); 
            const shuffleCount = (totalCells * 15) + extraMoves; 
            
            for (let i = 0; i < shuffleCount; i++) {
                const possibleMoves = getValidMoves(emptyIdx);
                let filteredMoves = possibleMoves.filter(m => m !== lastMove);
                
                // %10 ihtimalle geri gitmeye izin ver ki matematiksel döngüler kırılsın
                if (filteredMoves.length === 0 || Math.random() < 0.1) {
                    filteredMoves = possibleMoves;
                }
                
                const move = filteredMoves[Math.floor(Math.random() * filteredMoves.length)];
                currentArr[emptyIdx] = currentArr[move];
                currentArr[move] = 0;
                lastMove = emptyIdx;
                emptyIdx = move;
            }
            attempts++;
        } while (JSON.stringify(currentArr) === JSON.stringify(targetArr) && attempts < 10);
        
        moves = 0;
        isShuffled = true;
        renderGrid();
    }
    
    const uiHTML = `
        <div class="number-puzzle-game" style="max-width: 500px; margin: 0 auto; user-select:none;">
            ${selectHTML}
            <div style="text-align:center; margin-bottom: 10px;">
                <p style="font-size: 1.1rem; color: var(--text-dark);">Hamle: <span id="np-moves">0</span></p>
                <p style="font-size: 0.9rem; color: #666;">Kareleri boşluğa doğru kaydırarak (tıklayarak) sayıları sıraya diz!</p>
                <button class="btn btn-warning" id="btn-shuffle" style="margin-top:10px; padding: 6px 16px; font-size: 0.9rem;">Karıştır!</button>
            </div>
            <div id="np-grid" style="display: grid; grid-template-columns: repeat(${cfg.cols}, 1fr); gap: 8px; padding: 15px; background: var(--bg-card); border-radius: 15px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);">
            </div>
        </div>
    `;
    
    container.innerHTML = uiHTML;
    
    const levelSelect = container.querySelector('.level-select');
    if (levelSelect) {
        levelSelect.addEventListener('change', (e) => {
            if(window.playSound) window.playSound('click');
            window.startNumberPuzzleGame(container, parseInt(e.target.value));
        });
    }
    
    container.querySelector('#btn-shuffle').addEventListener('click', () => {
        if(window.playSound) window.playSound('click');
        doShuffle();
    });

    const gridEl = container.querySelector('#np-grid');
    const movesEl = container.querySelector('#np-moves');

    function renderGrid() {
        gridEl.innerHTML = '';
        movesEl.innerText = moves;
        currentArr.forEach((num, idx) => {
            const btn = document.createElement('div');
            btn.className = 'glass';
            
            if (num === 0) {
                // Boşluk
                btn.style.cssText = `
                    height: 60px; border-radius: 12px;
                    background: transparent; box-shadow: none;
                `;
            } else {
                // Dolu kare
                const isCorrectPos = (num === targetArr[idx]);
                btn.style.cssText = `
                    height: 60px; font-size: 1.5rem; font-weight: bold; border-radius: 12px;
                    display: flex; justify-content: center; align-items: center; cursor: pointer;
                    background: ${isShuffled && isCorrectPos ? '#e2ffe2' : 'white'};
                    color: var(--text-dark); transition: transform 0.1s; user-select: none;
                    border: 2px solid ${isShuffled && isCorrectPos ? '#86efac' : '#e5e7eb'};
                `;
                btn.innerText = num;
                
                if (isShuffled) {
                    btn.addEventListener('click', () => {
                        attemptMove(idx);
                    });
                }
            }
            gridEl.appendChild(btn);
        });
    }

    function attemptMove(idx) {
        const emptyIdx = currentArr.indexOf(0);
        const validMoves = getValidMoves(emptyIdx);
        
        // Eğer tıklanan blok boşluğa komşuysa
        if (validMoves.includes(idx)) {
            if (window.playSound) window.playSound('click');
            // Swap
            currentArr[emptyIdx] = currentArr[idx];
            currentArr[idx] = 0;
            moves++;
            renderGrid();
            checkWin();
        } else {
            // Hata sesi veya efekti eklenebilir
        }
    }

    function checkWin() {
        if (!isShuffled) return;
        
        if (JSON.stringify(currentArr) === JSON.stringify(targetArr)) {
            if (window.playSound) window.playSound('win');
            
            const max = parseInt(localStorage.getItem('zeka_diyari_game_13_unlocked_v3') || "1");
            if (levelNumber === max && levelNumber < 10) {
                localStorage.setItem('zeka_diyari_game_13_unlocked_v3', levelNumber + 1);
            }
            
            const score = cfg.scoreBase + Math.max(0, (200 - moves) * 2);
            if (window.updateStats) window.updateStats(score, 1);
            
            setTimeout(() => {
                const nextLevelHtml = levelNumber < 10 ? `<button class="btn btn-success" id="np-next" style="margin-top:15px;">Sonraki Seviye</button>` : '';
                container.innerHTML = `
                    <div style="text-align:center; padding: 30px;">
                        <h2 style="color:var(--primary); font-size:2rem; margin-bottom:15px;">Harika! 🎉</h2>
                        <p>Bulmacayı <b>${moves}</b> hamlede çözdün!</p>
                        <p style="font-size:1.5rem; margin: 15px 0;">+${score} Puan</p>
                        ${nextLevelHtml}
                    </div>
                `;
                if(levelNumber < 10) {
                    container.querySelector('#np-next').onclick = () => {
                        if(window.playSound) window.playSound('click');
                        window.startNumberPuzzleGame(container, levelNumber + 1);
                    };
                }
            }, 500);
        }
    }

    doShuffle();
};

/* ============================================================
   OYUN 14: SEVİMLİ BOYAMA KİTABI (Coloring Book)
   ============================================================ */
window.startColoringBookGame = function(container, levelNumber) {
    const LEVELS = [
  { level: 1, name: 'Çiçek', svg: '<circle class="paintable" cx="50" cy="30" r="15" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="50" cy="70" r="15" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="30" cy="50" r="15" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="70" cy="50" r="15" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="50" cy="50" r="15" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 2, name: 'Güneş', svg: '<circle class="paintable" cx="50" cy="50" r="20" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="69.69615506024417,46.52703644666139 95,50 69.69615506024417,53.47296355333861" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="66.38304088577983,61.471528727020925 81.81980515339464,81.81980515339464 61.471528727020925,66.38304088577983" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="53.47296355333861,69.69615506024417 50,95 46.52703644666139,69.69615506024417" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="38.52847127297908,66.38304088577985 18.180194846605364,81.81980515339464 33.616959114220165,61.471528727020925" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="30.30384493975584,53.47296355333861 5,50.00000000000001 30.30384493975584,46.52703644666139" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="33.61695911422016,38.52847127297908 18.180194846605353,18.180194846605364 38.528471272979075,33.616959114220165" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="46.52703644666139,30.30384493975584 49.99999999999999,5 53.4729635533386,30.303844939755837" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="61.471528727020925,33.616959114220165 81.81980515339463,18.180194846605353 66.38304088577983,38.52847127297907" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 3, name: 'Araba', svg: '<path class="paintable" d="M10,60 L20,40 L70,40 L80,60 L90,60 L90,80 L10,80 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M30,40 L30,60 L20,60 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M60,40 L60,60 L70,60 Z" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="30" cy="80" r="10" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="70" cy="80" r="10" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="30" cy="80" r="3" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="70" cy="80" r="3" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 4, name: 'Kelebek', svg: '<path class="paintable" d="M 50 20 C 70 0, 100 30, 60 50 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 50 80 C 70 100, 100 70, 60 50 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 50 20 C 30 0, 0 30, 40 50 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 50 80 C 30 100, 0 70, 40 50 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 46 20 Q 50 5 54 20 L 54 80 Q 50 95 46 80 Z" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="50" cy="15" r="3" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 5, name: 'Ev', svg: '<rect class="paintable" x="20" y="50" width="60" height="40" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="10,50 50,15 90,50" stroke="#333" stroke-width="2" fill="#fff"/><rect class="paintable" x="40" y="65" width="20" height="25" stroke="#333" stroke-width="2" fill="#fff"/><rect class="paintable" x="25" y="55" width="12" height="12" stroke="#333" stroke-width="2" fill="#fff"/><rect class="paintable" x="63" y="55" width="12" height="12" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="45" cy="77" r="2" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 6, name: 'Balık', svg: '<path class="paintable" d="M 30 50 Q 50 20 80 50 Q 50 80 30 50 Z" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="30,50 10,30 10,70" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="50,28 60,15 70,30" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="50,72 60,85 70,70" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="65" cy="45" r="3" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 7, name: 'Kardan Adam', svg: '<circle class="paintable" cx="50" cy="75" r="20" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="50" cy="45" r="15" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="50" cy="20" r="10" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="50,20 65,22 50,24" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="46" cy="17" r="1.5" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="54" cy="17" r="1.5" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="50" cy="40" r="2" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="50" cy="50" r="2" stroke="#333" stroke-width="2" fill="#fff"/><rect class="paintable" x="38" y="5" width="24" height="6" stroke="#333" stroke-width="2" fill="#fff"/><rect class="paintable" x="43" y="-5" width="14" height="10" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 8, name: 'Ağaç', svg: '<path class="paintable" d="M 45 90 Q 45 50 35 40 Q 50 50 55 40 Q 55 50 55 90 Z" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="50" cy="30" r="25" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="30" cy="45" r="20" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="70" cy="45" r="20" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="50" cy="10" r="15" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 9, name: 'Kaplumbağa', svg: '<circle class="paintable" cx="75" cy="50" r="8" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 25 50 L 15 45 L 20 55 Z" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="35" cy="30" r="6" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="60" cy="30" r="6" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="35" cy="70" r="6" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="60" cy="70" r="6" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="47" cy="50" r="22" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="47,38 57,44 57,56 47,62 37,56 37,44" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 10, name: 'Gökkuşağı', svg: '<path class="paintable" d="M 10 80 A 40 40 0 0 1 90 80" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 20 80 A 30 30 0 0 1 80 80" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 30 80 A 20 20 0 0 1 70 80" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 40 80 A 10 10 0 0 1 60 80" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 11, name: 'Gemi', svg: '<polygon class="paintable" points="20,70 80,70 70,90 30,90" stroke="#333" stroke-width="2" fill="#fff"/><rect class="paintable" x="48" y="20" width="4" height="50" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="52,25 85,45 52,65" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="48,30 25,45 48,60" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 12, name: 'Kedi', svg: '<circle class="paintable" cx="50" cy="45" r="20" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="35,33 25,10 45,30" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="65,33 75,10 55,30" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 40 60 Q 50 90 60 60 Z" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="42" cy="40" r="3" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="58" cy="40" r="3" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="48,48 52,48 50,52" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 60 80 Q 80 90 80 60 Q 80 50 70 50 Q 75 60 70 80 Z" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 13, name: 'Baykuş', svg: '<path class="paintable" d="M 30 50 C 30 20, 70 20, 70 50 C 70 80, 30 80, 30 50 Z" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="40" cy="40" r="8" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="60" cy="40" r="8" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="40" cy="40" r="3" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="60" cy="40" r="3" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="47,45 53,45 50,52" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 30 50 Q 15 60 25 80 Q 20 60 30 70 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 70 50 Q 85 60 75 80 Q 80 60 70 70 Z" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="35,80 40,85 45,80" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="55,80 60,85 65,80" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 14, name: 'Roket', svg: '<path class="paintable" d="M 40 30 L 60 30 L 70 70 L 30 70 Z" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="40,30 50,5 60,30" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="30,70 20,90 40,70" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="70,70 80,90 60,70" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="40,70 60,70 50,90" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="50" cy="45" r="8" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="50" cy="45" r="4" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 15, name: 'Mantar', svg: '<path class="paintable" d="M 40 60 L 40 90 C 40 95, 60 95, 60 90 L 60 60 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 10 60 C 10 10, 90 10, 90 60 Z" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="35" cy="40" r="5" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="65" cy="45" r="6" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="50" cy="30" r="4" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="30" cy="55" r="3" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="75" cy="55" r="4" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 16, name: 'Uğur Böceği', svg: '<circle class="paintable" cx="50" cy="60" r="30" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="50" cy="25" r="12" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 50 30 L 50 90" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="35" cy="55" r="4" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="40" cy="75" r="5" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="65" cy="50" r="4.5" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="60" cy="70" r="5.5" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="45" cy="20" r="2" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="55" cy="20" r="2" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 42 16 Q 35 5 40 2" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 58 16 Q 65 5 60 2" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 17, name: 'Tavus Kuşu', svg: '<path class="paintable" d="M 45 60 C 45 40, 55 40, 55 60 C 65 80, 35 80, 45 60 Z" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="48" cy="48" r="1" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="52" cy="48" r="1" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="48,51 52,51 50,55" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 50 60 Q 20 20 10 40 Q 30 50 45 65 Z" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="15" cy="35" r="3" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 50 60 Q 30 10 30 25 Q 40 40 48 60 Z" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="30" cy="20" r="3" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 50 60 Q 50 0 50 15 Q 50 40 50 60 Z" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="50" cy="10" r="3" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 50 60 Q 70 10 70 25 Q 60 40 52 60 Z" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="70" cy="20" r="3" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 50 60 Q 80 20 90 40 Q 70 50 55 65 Z" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="85" cy="35" r="3" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 18, name: 'Penguen', svg: '<path class="paintable" d="M 35 50 C 35 10, 65 10, 65 50 C 70 90, 30 90, 35 50 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 40 55 C 40 25, 60 25, 60 55 C 62 85, 38 85, 40 55 Z" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="45" cy="35" r="3" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="55" cy="35" r="3" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="48,40 52,40 50,45" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 35 45 Q 20 60 25 70 Q 30 60 37 55 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 65 45 Q 80 60 75 70 Q 70 60 63 55 Z" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="40,85 35,95 45,95" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="60,85 55,95 65,95" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 19, name: 'Fil', svg: '<circle class="paintable" cx="50" cy="45" r="20" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 45 60 Q 40 90 55 95 Q 60 90 55 60 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 30 45 C 10 30, 10 70, 35 60 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 70 45 C 90 30, 90 70, 65 60 Z" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="43" cy="40" r="2" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="57" cy="40" r="2" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="40,65 35,85 45,85" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="60,65 55,85 65,85" stroke="#333" stroke-width="2" fill="#fff"/>' },
  { level: 20, name: 'Mandala', svg: '<circle class="paintable" cx="50" cy="50" r="49" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 48.96472381958991 46.13629669484373 Q 50 38.66666666666667 51.03527618041008 46.13629669484373 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 51.03527618041008 46.13629669484373 Q 55.666666666666664 40.185045423776366 52.82842712474619 47.17157287525381 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 52.82842712474619 47.17157287525381 Q 59.81495457622364 44.333333333333336 53.86370330515627 48.96472381958992 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 53.86370330515627 48.96472381958992 Q 61.33333333333333 50 53.86370330515627 51.03527618041008 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 53.86370330515627 51.03527618041008 Q 59.81495457622364 55.666666666666664 52.82842712474619 52.82842712474619 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 52.82842712474619 52.82842712474619 Q 55.666666666666664 59.814954576223634 51.03527618041008 53.86370330515627 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 51.03527618041008 53.86370330515627 Q 50 61.33333333333333 48.96472381958991 53.86370330515627 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 48.96472381958991 53.86370330515627 Q 44.333333333333336 59.81495457622364 47.17157287525381 52.82842712474619 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 47.17157287525381 52.82842712474619 Q 40.18504542377636 55.666666666666664 46.13629669484373 51.03527618041009 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 46.13629669484373 51.03527618041009 Q 38.66666666666667 50 46.13629669484373 48.96472381958992 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 46.13629669484373 48.96472381958992 Q 40.185045423776366 44.333333333333336 47.17157287525381 47.17157287525381 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 47.17157287525381 47.17157287525381 Q 44.33333333333333 40.185045423776366 48.96472381958992 46.13629669484373 Z" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="47.066717488838094,39.05284063539056 50,33.81557985224717 52.9332825111619,39.05284063539056" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="52.9332825111619,39.05284063539056 58.092210073876416,35.98388100652535 58.01387685344754,41.986123146552465" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="58.01387685344754,41.986123146552465 64.01611899347465,41.907789926123584 60.94715936460944,47.0667174888381" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="60.94715936460944,47.0667174888381 66.18442014775283,50 60.94715936460944,52.9332825111619" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="60.94715936460944,52.9332825111619 64.01611899347465,58.092210073876416 58.01387685344754,58.013876853447535" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="58.01387685344754,58.013876853447535 58.092210073876416,64.01611899347465 52.9332825111619,60.94715936460944" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="52.9332825111619,60.94715936460944 50,66.18442014775283 47.066717488838094,60.94715936460944" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="47.066717488838094,60.94715936460944 41.907789926123584,64.01611899347465 41.986123146552465,58.01387685344754" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="41.986123146552465,58.01387685344754 35.98388100652535,58.092210073876416 39.05284063539056,52.933282511161906" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="39.05284063539056,52.933282511161906 33.81557985224717,50 39.05284063539056,47.0667174888381" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="39.05284063539056,47.0667174888381 35.98388100652535,41.907789926123584 41.98612314655246,41.986123146552465" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="41.98612314655246,41.986123146552465 41.90778992612358,35.98388100652535 47.0667174888381,39.05284063539056" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 45.16871115808628 31.969384575937394 Q 50 21.354754180230163 54.83128884191372 31.969384575937394 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 54.83128884191372 31.969384575937394 Q 64.32262290988493 25.192489422429325 63.199326582148885 36.800673417851115 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 63.199326582148885 36.800673417851115 Q 74.80751057757068 35.67737709011509 68.0306154240626 45.16871115808628 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 68.0306154240626 45.16871115808628 Q 78.64524581976984 50 68.0306154240626 54.83128884191372 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 68.0306154240626 54.83128884191372 Q 74.80751057757068 64.32262290988491 63.199326582148885 63.199326582148885 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 63.199326582148885 63.199326582148885 Q 64.32262290988493 74.80751057757067 54.83128884191372 68.0306154240626 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 54.83128884191372 68.0306154240626 Q 50 78.64524581976984 45.16871115808628 68.0306154240626 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 45.16871115808628 68.0306154240626 Q 35.67737709011509 74.80751057757068 36.800673417851115 63.199326582148885 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 36.800673417851115 63.199326582148885 Q 25.192489422429322 64.32262290988491 31.969384575937397 54.831288841913725 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 31.969384575937397 54.831288841913725 Q 21.354754180230163 50 31.96938457593739 45.16871115808629 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 31.96938457593739 45.16871115808629 Q 25.192489422429325 35.67737709011508 36.800673417851115 36.800673417851115 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 36.800673417851115 36.800673417851115 Q 35.67737709011507 25.19248942242933 45.16871115808628 31.969384575937394 Z" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="43.270704827334455,24.885928516484228 50,17.00336878709735 56.72929517266554,24.885928516484228" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="56.72929517266554,24.885928516484228 66.49831560645133,21.42407913031977 68.38477631085024,31.61522368914977" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="68.38477631085024,31.61522368914977 78.57592086968023,33.50168439354868 75.11407148351577,43.27070482733446" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="75.11407148351577,43.27070482733446 82.99663121290266,50 75.11407148351577,56.72929517266554" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="75.11407148351577,56.72929517266554 78.57592086968023,66.49831560645131 68.38477631085024,68.38477631085023" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="68.38477631085024,68.38477631085023 66.49831560645133,78.57592086968023 56.72929517266554,75.11407148351577" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="56.72929517266554,75.11407148351577 50,82.99663121290266 43.270704827334455,75.11407148351577" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="43.270704827334455,75.11407148351577 33.501684393548686,78.57592086968023 31.61522368914977,68.38477631085024" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="31.61522368914977,68.38477631085024 21.424079130319768,66.49831560645131 24.88592851648423,56.729295172665545" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="24.88592851648423,56.729295172665545 17.00336878709735,50.00000000000001 24.885928516484224,43.27070482733447" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="24.885928516484224,43.27070482733447 21.42407913031977,33.50168439354867 31.61522368914976,31.61522368914977" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="31.61522368914976,31.61522368914977 33.50168439354866,21.42407913031978 43.27070482733446,24.885928516484228" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 41.37269849658264 17.802472457031058 Q 50 11.619767137539696 58.62730150341736 17.802472457031058 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 58.62730150341736 17.802472457031058 Q 69.19011643123015 16.76174333794704 73.57022603955159 26.429773960448422 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 73.57022603955159 26.429773960448422 Q 83.23825666205298 30.809883568769852 82.19752754296894 41.37269849658264 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 82.19752754296894 41.37269849658264 Q 88.3802328624603 50 82.19752754296894 58.62730150341736 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 82.19752754296894 58.62730150341736 Q 83.23825666205298 69.19011643123015 73.57022603955159 73.57022603955159 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 73.57022603955159 73.57022603955159 Q 69.19011643123015 83.23825666205296 58.62730150341736 82.19752754296894 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 58.62730150341736 82.19752754296894 Q 50 88.3802328624603 41.37269849658264 82.19752754296894 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 41.37269849658264 82.19752754296894 Q 30.809883568769855 83.23825666205298 26.429773960448422 73.57022603955159 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 26.429773960448422 73.57022603955159 Q 16.76174333794703 69.19011643123015 17.802472457031065 58.627301503417364 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 17.802472457031065 58.627301503417364 Q 11.619767137539696 50.00000000000001 17.802472457031058 41.37269849658266 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 17.802472457031058 41.37269849658266 Q 16.76174333794704 30.809883568769845 26.429773960448415 26.429773960448422 Z" stroke="#333" stroke-width="2" fill="#fff"/><path class="paintable" d="M 26.429773960448415 26.429773960448422 Q 30.80988356876983 16.76174333794704 41.37269849658264 17.802472457031058 Z" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="39.47469216583082,10.719016397577889 50,-0.773276979805992 60.525307834169176,10.719016397577889" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="60.525307834169176,10.719016397577889 75.386638489903,6.029052302104375 78.75567576825293,21.244324231747072" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="78.75567576825293,21.244324231747072 93.97094769789564,24.613361510097008 89.28098360242211,39.474692165830824" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="89.28098360242211,39.474692165830824 100.77327697980598,50 89.28098360242211,60.525307834169176" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="89.28098360242211,60.525307834169176 93.97094769789564,75.38663848990299 78.75567576825293,78.75567576825293" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="78.75567576825293,78.75567576825293 75.386638489903,93.97094769789562 60.525307834169176,89.28098360242211" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="60.525307834169176,89.28098360242211 50,100.77327697980598 39.47469216583082,89.28098360242211" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="39.47469216583082,89.28098360242211 24.613361510097015,93.97094769789564 21.244324231747072,78.75567576825293" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="21.244324231747072,78.75567576825293 6.029052302104368,75.38663848990299 10.719016397577896,60.52530783416918" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="10.719016397577896,60.52530783416918 -0.773276979805992,50.00000000000001 10.719016397577889,39.47469216583084" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="10.719016397577889,39.47469216583084 6.029052302104375,24.613361510096997 21.24432423174706,21.244324231747072" stroke="#333" stroke-width="2" fill="#fff"/><polygon class="paintable" points="21.24432423174706,21.244324231747072 24.613361510096983,6.0290523021043825 39.47469216583083,10.719016397577889" stroke="#333" stroke-width="2" fill="#fff"/><circle class="paintable" cx="50" cy="50" r="4" stroke="#333" stroke-width="2" fill="#fff"/>' },
];

    const cfg = LEVELS[levelNumber - 1];
    let selectedColor = '#ef4444'; 
    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#0ea5e9', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e', '#78716c', '#1e293b', '#ffffff', '#fcd34d', '#2dd4bf', '#fb923c'];

    const selectHTML = `
        <div style="margin-bottom:15px; padding: 0 10px;">
            <select class="level-select form-control" style="width:100%; max-width:100%; padding:10px 15px; font-size:1.1rem; border-radius:12px; display:block; border: 2px solid var(--primary); outline:none; background-color:#fff; color:#333; box-shadow:0 4px 6px rgba(0,0,0,0.1); cursor:pointer;">
                ${LEVELS.map(l => {
                    const unl = (typeof isLvlUnlocked === 'function') ? isLvlUnlocked(l.level) : true;
                    const name = l.name ? l.name : 'Seviye ' + l.level;
                    const label = unl ? (l.level + '. ' + name) : ('🔒 ' + l.level);
                    return `<option value="${l.level}" ${l.level === levelNumber ? 'selected' : ''} ${unl ? '' : 'disabled'}>${label}</option>`;
                }).join('')}
            </select>
        </div>
    `;

    const colorsHTML = colors.map(c => `
        <div class="color-btn" data-color="${c}" style="width: 35px; height: 35px; border-radius: 50%; background-color: ${c}; border: 3px solid ${c === selectedColor ? '#333' : '#ddd'}; cursor: pointer; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
    `).join('');

    const uiHTML = `
        <div class="coloring-game" style="max-width: 500px; width: 100%; margin: 0 auto; user-select:none;">
            ${selectHTML}
            
            <div style="display:flex; justify-content:center; align-items:center; background: #f8fafc; border-radius: 15px; padding: 20px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);">
                <svg id="coloring-canvas" viewBox="0 0 100 100" style="width: 100%; max-width: 300px; cursor: crosshair;">
                    ${cfg.svg}
                </svg>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <p style="margin-bottom: 10px; font-weight: bold; color: var(--text-dark);">Renk Seç ve Boya!</p>
                <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;" id="color-palette">
                    ${colorsHTML}
                </div>
                <button id="btn-save-coloring" class="btn btn-success" style="margin-top: 20px; width: 100%; font-size: 1.1rem; padding: 10px;">Kaydet ve Devam Et</button>
            </div>
        </div>
    `;
    
    container.innerHTML = uiHTML;
    
    const levelSelect = container.querySelector('.level-select');
    if (levelSelect) {
        levelSelect.addEventListener('change', (e) => {
            if(window.playSound) window.playSound('click');
            window.startColoringBookGame(container, parseInt(e.target.value));
        });
    }

    container.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(window.playSound) window.playSound('click');
            selectedColor = e.target.getAttribute('data-color');
            container.querySelectorAll('.color-btn').forEach(b => {
                b.style.borderColor = (b === e.target) ? '#333' : '#ddd';
                b.style.transform = (b === e.target) ? 'scale(1.1)' : 'scale(1)';
            });
        });
    });

    container.querySelectorAll('.paintable').forEach(el => {
        el.addEventListener('click', (e) => {
            if(window.playSound) window.playSound('pop');
            e.target.setAttribute('fill', selectedColor);
        });
        
        // Touch events for better mobile experience
        el.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default scroll if painting
            if(window.playSound) window.playSound('pop');
            e.target.setAttribute('fill', selectedColor);
        }, {passive: false});
    });
    
    const saveBtn = container.querySelector('#btn-save-coloring');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if(window.playSound) window.playSound('win');
            
            const max = parseInt(localStorage.getItem('zeka_diyari_game_14_unlocked_v3') || "1");
            if (levelNumber === max && levelNumber < 20) {
                localStorage.setItem('zeka_diyari_game_14_unlocked_v3', levelNumber + 1);
            }
            
            const score = 50; // Boyama için 50 puan
            if (window.updateStats) window.updateStats(score, 1);
            
            const nextLevelHtml = levelNumber < 20 ? `<button class="btn btn-success" id="cb-next" style="margin-top:15px;">Sonraki Resim</button>` : '';
            container.innerHTML = `
                <div style="text-align:center; padding: 30px;">
                    <h2 style="color:var(--primary); font-size:2rem; margin-bottom:15px;">Harika Bir Eser! 🎨</h2>
                    <p>Eserini başarıyla kaydettin!</p>
                    <p style="font-size:1.5rem; margin: 15px 0;">+${score} Puan</p>
                    ${nextLevelHtml}
                    <button class="btn btn-primary" onclick="if(window.playSound) window.playSound('click'); document.getElementById('game-modal').style.display='none';" style="margin-top:15px;">Menüye Dön</button>
                </div>
            `;
            
            if (levelNumber < 20) {
                const nxt = document.getElementById('cb-next');
                if(nxt) nxt.onclick = (e) => { 
                    e.stopPropagation(); 
                    if(window.playSound) window.playSound('click');
                    window.startColoringBookGame(container, levelNumber + 1); 
                };
            }
        });
    }
};

/* ============================================================
   OYUN 15: YAPBOZ KULESİ (Tower Puzzle) 
   ============================================================ */
window.startTowerStackerGame = function(container) {
    const uiHTML = `
        <div class="tower-game" style="max-width: 400px; margin: 0 auto; user-select:none; text-align:center;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px; padding: 0 5px; font-weight:bold; color: var(--text-dark);">
                <div style="font-size:1rem; flex:1; text-align:left;">Skor: <span id="tower-score">0</span></div>
                <button id="btn-tower-restart" style="padding: 6px 12px; background:var(--primary); color:white; border:none; border-radius: 8px; font-size: 0.9rem; font-weight:bold; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.2);">Yeniden Başla</button>
                <div style="font-size:1rem; flex:1; text-align:right;">En İyi: <span id="tower-best-score">0</span></div>
            </div>
            <div style="position:relative; width:100%; max-width: 300px; height: 350px; background:#1e293b; margin:0 auto; border-radius: 12px; overflow:hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <canvas id="tower-canvas" width="300" height="350" style="display:block; width:100%; height:100%; cursor:pointer; touch-action: none;"></canvas>
                <div id="tower-overlay" style="position:absolute; inset:0; background:rgba(0,0,0,0.7); display:flex; flex-direction:column; justify-content:center; align-items:center; color:white; z-index:10; cursor:pointer;">
                    <h2 style="margin:0; font-size:1.8rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Başlamak için Dokun</h2>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = uiHTML;

    const canvas = container.querySelector('#tower-canvas');
    const ctx = canvas.getContext('2d');
    const overlay = container.querySelector('#tower-overlay');
    const scoreEl = container.querySelector('#tower-score');
    const bestScoreEl = container.querySelector('#tower-best-score');
    const btnRestart = container.querySelector('#btn-tower-restart');
    if (btnRestart) {
        btnRestart.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            if(window.playSound) window.playSound('click');
            initGame();
        });
    }
    
    let isPlaying = false;
    let isGameOver = false;
    let blocks = [];
    let fallingBlocks = [];
    let currentBlock = null;
    let direction = 1;
    let score = 0;
    let bestScore = parseInt(localStorage.getItem('zeka_diyari_tower_best') || "0");
    bestScoreEl.innerText = bestScore;
    
    const blockHeight = 25;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

    let lastTime = 0;
    let currentSpeed = 3;

    function adjustColor(color, amount) {
        return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    }

    function initGame() {
        blocks = [];
        fallingBlocks = [];
        currentSpeed = 3;
        score = 0;
        scoreEl.innerText = score;
        
        const baseColor = '#94a3b8';
        const startW = 100;
        blocks.push({
            x: (canvasWidth - startW) / 2,
            y: canvasHeight - blockHeight,
            w: startW,
            h: blockHeight,
            color: baseColor,
            topColor: adjustColor(baseColor, 40),
            rightColor: adjustColor(baseColor, -40)
        });
        
        spawnBlock();
        isPlaying = true;
        isGameOver = false;
        overlay.style.display = 'none';
        if (window.towerAnimFrame) cancelAnimationFrame(window.towerAnimFrame);
        lastTime = performance.now();
        gameLoop(lastTime);
    }
    
    function spawnBlock() {
        const lastBlock = blocks[blocks.length - 1];
        let newY = lastBlock.y - blockHeight;
        
        if (newY < 50) {
            blocks.forEach(b => b.y += blockHeight);
            fallingBlocks.forEach(fb => fb.y += blockHeight);
            newY += blockHeight;
        }
        
        const baseColor = colors[blocks.length % colors.length];
        currentBlock = {
            x: direction === 1 ? -lastBlock.w : canvasWidth,
            y: newY,
            w: lastBlock.w,
            h: blockHeight,
            color: baseColor,
            topColor: adjustColor(baseColor, 40),
            rightColor: adjustColor(baseColor, -40)
        };
        // Increase speed slightly each block
        currentSpeed += 0.15;
    }

    function placeBlock() {
        const last = blocks[blocks.length - 1];
        const curr = currentBlock;
        
        const overlapStart = Math.max(last.x, curr.x);
        const overlapEnd = Math.min(last.x + last.w, curr.x + curr.w);
        const overlapWidth = overlapEnd - overlapStart;
        
        if (overlapWidth <= 0) {
            // Entire block falls
            fallingBlocks.push({...curr, vy: 0});
            currentBlock = null;
            
            isGameOver = true;
            isPlaying = false;
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('zeka_diyari_tower_best', bestScore);
                bestScoreEl.innerText = bestScore;
            }
            
            overlay.innerHTML = `
                <h2 style="color:#ef4444; font-size:2rem; margin-bottom:10px;">Oyun Bitti</h2>
                <p>Skorun: ${score}</p>
                <button class="btn btn-warning" id="btn-tower-retry" style="margin-top:15px; z-index:20;">Tekrar Dene</button>
            `;
            overlay.style.display = 'flex';
            if (window.playSound) window.playSound('locked');
            setTimeout(() => {
                document.getElementById('btn-tower-retry').onpointerdown = (e) => { e.stopPropagation(); initGame(); };
            }, 100);
            return;
        }
        
        if (window.playSound) window.playSound('click');
        
        // Handle overhangs falling
        if (curr.x < last.x) {
            fallingBlocks.push({
                x: curr.x, y: curr.y, w: last.x - curr.x, h: curr.h,
                color: curr.color, topColor: curr.topColor, rightColor: curr.rightColor, vy: 0
            });
        }
        if (curr.x + curr.w > last.x + last.w) {
            fallingBlocks.push({
                x: last.x + last.w, y: curr.y, w: (curr.x + curr.w) - (last.x + last.w), h: curr.h,
                color: curr.color, topColor: curr.topColor, rightColor: curr.rightColor, vy: 0
            });
        }
        
        curr.x = overlapStart;
        curr.w = overlapWidth;
        blocks.push({...curr});
        score++;
        scoreEl.innerText = score;
        
        spawnBlock();
    }

    function draw3DBlock(x, y, w, h, baseColor, topColor, rightColor) {
        if (w <= 0) return;
        const depth = 15;
        const strokeCol = 'rgba(0,0,0,0.3)';

        ctx.fillStyle = baseColor;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = topColor;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + depth, y - depth);
        ctx.lineTo(x + w + depth, y - depth);
        ctx.lineTo(x + w, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = rightColor;
        ctx.beginPath();
        ctx.moveTo(x + w, y);
        ctx.lineTo(x + w + depth, y - depth);
        ctx.lineTo(x + w + depth, y + h - depth);
        ctx.lineTo(x + w, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    function gameLoop(time) {
        if (!isPlaying && fallingBlocks.length === 0) return;
        
        if (!time) time = performance.now();
        const deltaTime = time - lastTime;
        lastTime = time;
        
        const dt = Math.min(deltaTime, 32); 
        const frameMultiplier = dt / 16.666;
        
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        if (isPlaying && currentBlock) {
            currentBlock.x += currentSpeed * direction * frameMultiplier;
            if (currentBlock.x <= 0 || currentBlock.x + currentBlock.w >= canvasWidth - 15) {
                direction *= -1;
                // clamp position
                if (currentBlock.x <= 0) currentBlock.x = 0;
                if (currentBlock.x + currentBlock.w >= canvasWidth - 15) currentBlock.x = canvasWidth - 15 - currentBlock.w;
            }
        }
        
        // Update & Draw falling blocks
        for (let i = fallingBlocks.length - 1; i >= 0; i--) {
            let fb = fallingBlocks[i];
            fb.vy += 0.5 * frameMultiplier; // gravity
            fb.y += fb.vy * frameMultiplier;
            draw3DBlock(fb.x, fb.y, fb.w, fb.h, fb.color, fb.topColor, fb.rightColor);
            
            if (fb.y > canvasHeight + 50) {
                fallingBlocks.splice(i, 1);
            }
        }
        
        blocks.forEach(b => {
            draw3DBlock(b.x, b.y, b.w, b.h, b.color, b.topColor, b.rightColor);
        });
        
        if (currentBlock) {
            draw3DBlock(currentBlock.x, currentBlock.y, currentBlock.w, currentBlock.h, currentBlock.color, currentBlock.topColor, currentBlock.rightColor);
        }
        
        window.towerAnimFrame = requestAnimationFrame(gameLoop);
    }
    
    const handleTap = (e) => {
        e.preventDefault();
        if (!isPlaying && !isGameOver) {
            initGame();
        } else if (isPlaying) {
            placeBlock();
        }
    };
    
    canvas.addEventListener('pointerdown', handleTap);
    overlay.addEventListener('pointerdown', handleTap);
    
    window.currentGameCleanup = () => {
        if (window.towerAnimFrame) cancelAnimationFrame(window.towerAnimFrame);
    };
};
/* ============================================================
   OYUN 16: NOKTALARI BİRLEŞTİR (Connect the Dots)
   ============================================================ */
window.startConnectDotsGame = function(container, levelNumber) {
    const LEVELS = [
        { level: 1, name: "Üçgen", points: [{x:50, y:20}, {x:80, y:80}, {x:20, y:80}], image: '🍕' },
        { level: 2, name: "Kare", points: [{x:30, y:30}, {x:70, y:30}, {x:70, y:70}, {x:30, y:70}], image: '🖼️' },
        { level: 3, name: "Yıldız", points: [{x:50, y:10}, {x:60, y:40}, {x:95, y:40}, {x:65, y:60}, {x:80, y:95}, {x:50, y:75}, {x:20, y:95}, {x:35, y:60}, {x:5, y:40}, {x:40, y:40}], image: '⭐' },
        { level: 4, name: "Ev", points: [{x:50, y:20}, {x:80, y:45}, {x:80, y:85}, {x:20, y:85}, {x:20, y:45}], image: '🏠' },
        { level: 5, name: "Kalp", points: [{x:50, y:30}, {x:70, y:15}, {x:90, y:35}, {x:50, y:80}, {x:10, y:35}, {x:30, y:15}], image: '❤️' },
        { level: 6, name: "Gemi", points: [{x:30, y:70}, {x:70, y:70}, {x:85, y:50}, {x:15, y:50}, {x:45, y:45}, {x:45, y:15}, {x:70, y:45}], image: '⛵' },
        { level: 7, name: "Çam Ağacı", points: [{x:50, y:10}, {x:70, y:40}, {x:60, y:40}, {x:80, y:70}, {x:60, y:70}, {x:60, y:90}, {x:40, y:90}, {x:40, y:70}, {x:20, y:70}, {x:40, y:40}, {x:30, y:40}], image: '🌲' },
        { level: 8, name: "Elmas", points: [{x:30, y:20}, {x:70, y:20}, {x:90, y:40}, {x:50, y:90}, {x:10, y:40}], image: '💎' },
        { level: 9, name: "Taç", points: [{x:20, y:80}, {x:80, y:80}, {x:90, y:40}, {x:70, y:60}, {x:50, y:20}, {x:30, y:60}, {x:10, y:40}], image: '👑' },
        { level: 10, name: "Roket", points: [{x:50, y:10}, {x:65, y:40}, {x:65, y:70}, {x:80, y:90}, {x:50, y:80}, {x:20, y:90}, {x:35, y:70}, {x:35, y:40}], image: '🚀' }
    ];

    const cfg = LEVELS[levelNumber - 1];

    function isLvlUnlocked(lvl) {
        const max = parseInt(localStorage.getItem('zeka_diyari_game_16_unlocked_v3') || "1");
        return lvl <= max;
    }

    const selectHTML = `
        <div style="margin-bottom:15px; padding: 0 10px;">
            <select class="level-select form-control" style="width:100%; max-width:100%; padding:10px 15px; font-size:1.1rem; border-radius:12px; display:block; border: 2px solid var(--primary); outline:none; background-color:#fff; color:#333; box-shadow:0 4px 6px rgba(0,0,0,0.1); cursor:pointer;">
                ${LEVELS.map(l => {
                    const unl = (typeof isLvlUnlocked === 'function') ? isLvlUnlocked(l.level) : true;
                    const name = l.name ? l.name : 'Seviye ' + l.level;
                    const label = unl ? (l.level + '. ' + name) : ('🔒 ' + l.level);
                    return `<option value="${l.level}" ${l.level === levelNumber ? 'selected' : ''} ${unl ? '' : 'disabled'}>${label}</option>`;
                }).join('')}
            </select>
        </div>
    `;

    const uiHTML = `
        <div class="dots-game" style="max-width: 400px; margin: 0 auto; user-select:none; text-align:center;">
            ${selectHTML}
            <p style="margin-bottom: 5px; font-weight:bold;">Tüm sayıları birleştir, en son kaldığın sayıdan 1'e geri dön!</p>
            <div style="position:relative; width:100%; max-width: 300px; height: 300px; background:#f8fafc; margin:0 auto; border-radius: 12px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.05); touch-action: none;">
                <canvas id="dots-canvas" width="300" height="300" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:1; pointer-events:none;"></canvas>
                <div id="dots-container" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:2; touch-action: none; cursor: crosshair;"></div>
                <div id="dots-result" style="position:absolute; inset:0; display:flex; justify-content:center; align-items:center; font-size:6rem; opacity:0; transition: opacity 1s; z-index:3; pointer-events:none;">
                    ${cfg.image}
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = uiHTML;

    const levelSelect = container.querySelector('.level-select');
    if (levelSelect) {
        levelSelect.addEventListener('change', (e) => {
            if(window.playSound) window.playSound('click');
            window.startConnectDotsGame(container, parseInt(e.target.value));
        });
    }

    const canvas = container.querySelector('#dots-canvas');
    const ctx = canvas.getContext('2d');
    const dotsContainer = container.querySelector('#dots-container');
    const resultEl = container.querySelector('#dots-result');
    
    let currentDotIndex = 0; // Starts at 0 (meaning 1st dot is active)
    let isDragging = false;
    let isFullyConnected = false;
    let currentPointerX = 0;
    let currentPointerY = 0;
    
    const cw = canvas.width;
    const ch = canvas.height;
    
    function drawLines() {
        ctx.clearRect(0, 0, cw, ch);
        ctx.beginPath();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        // Draw confirmed segments
        for (let i = 0; i <= currentDotIndex; i++) {
            if (i >= cfg.points.length && !isFullyConnected) break;
            const p = cfg.points[i % cfg.points.length];
            const px = (p.x / 100) * cw;
            const py = (p.y / 100) * ch;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        
        // If finished, ensure it's closed
        if (isFullyConnected) {
            const p0 = cfg.points[0];
            ctx.lineTo((p0.x / 100) * cw, (p0.y / 100) * ch);
        } else if (isDragging) {
            // Draw dynamic line to pointer from currentDotIndex
            ctx.lineTo(currentPointerX, currentPointerY);
        }
        
        ctx.stroke();

        if (isDragging && !isFullyConnected) {
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Draw Hand Icon
            ctx.fillText('👆', currentPointerX, currentPointerY + 15);
        }
    }
    
    function initDots() {
        dotsContainer.innerHTML = '';
        cfg.points.forEach((p, idx) => {
            const px = (p.x / 100) * cw;
            const py = (p.y / 100) * ch;
            
            const dot = document.createElement('div');
            dot.style.position = 'absolute';
            dot.style.left = px + 'px';
            dot.style.top = py + 'px';
            dot.style.transform = 'translate(-50%, -50%)';
            dot.style.width = '28px';
            dot.style.height = '28px';
            dot.style.borderRadius = '50%';
            dot.style.background = '#ef4444';
            dot.style.color = 'white';
            dot.style.fontSize = '14px';
            dot.style.fontWeight = 'bold';
            dot.style.display = 'flex';
            dot.style.justifyContent = 'center';
            dot.style.alignItems = 'center';
            dot.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            dot.style.pointerEvents = 'none'; 
            dot.innerText = idx + 1;
            dot.id = 'dot-' + idx;
            
            dotsContainer.appendChild(dot);
        });
        
        highlightDot(0);
        drawLines();
    }
    
    function highlightDot(idx) {
        if (idx >= cfg.points.length) return;
        const dot = dotsContainer.querySelector('#dot-' + idx);
        if (dot) {
            dot.style.transform = 'translate(-50%, -50%) scale(1.2)';
            dot.style.boxShadow = '0 0 12px #ef4444';
        }
    }
    
    function solveDot(idx) {
        const dot = dotsContainer.querySelector('#dot-' + idx);
        if (dot) {
            dot.style.background = '#22c55e';
            dot.style.transform = 'translate(-50%, -50%) scale(1)';
            dot.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        }
    }

    function checkSnap() {
        if (isFullyConnected) return false;
        
        // Target is either the next index, or if current is last, target is 0
        const targetIndex = (currentDotIndex + 1) % cfg.points.length;
        const nextTarget = cfg.points[targetIndex];
        
        const tx = (nextTarget.x / 100) * cw;
        const ty = (nextTarget.y / 100) * ch;
        
        const dist = Math.hypot(currentPointerX - tx, currentPointerY - ty);
        if (dist < 20) { // Precise snapping radius
            if (window.playSound) window.playSound('click');
            
            solveDot(targetIndex === 0 ? cfg.points.length - 1 : currentDotIndex);
            
            currentDotIndex++;
            isDragging = false; // Force user to lift and press again!
            
            if (currentDotIndex === cfg.points.length - 1) {
                // Son rakama ulaştılar. Şimdi 1'e (index 0) bağlamaları lazım.
                highlightDot(0);
            } else if (currentDotIndex === cfg.points.length) {
                // Son rakamı da 1'e bağladılar! Oyun bitti.
                isFullyConnected = true;
                solveDot(0);
                handleWin();
            } else {
                highlightDot(currentDotIndex);
                if (window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate(20);
                }
            }
            return true;
        }
        return false;
    }

    dotsContainer.addEventListener('pointerdown', (e) => {
        if (isFullyConnected) return;
        e.preventDefault();
        const rect = dotsContainer.getBoundingClientRect();
        currentPointerX = e.clientX - rect.left;
        currentPointerY = e.clientY - rect.top;
        
        // Sadece mevcuttaki son noktadan tutmasına izin ver
        const activeIndex = currentDotIndex % cfg.points.length;
        const curTarget = cfg.points[activeIndex];
        const tx = (curTarget.x / 100) * cw;
        const ty = (curTarget.y / 100) * ch;
        
        const distToLast = Math.hypot(currentPointerX - tx, currentPointerY - ty);
        
        if (distToLast < 40) {
            isDragging = true;
            drawLines();
        }
    });

    dotsContainer.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const rect = dotsContainer.getBoundingClientRect();
        currentPointerX = e.clientX - rect.left;
        currentPointerY = e.clientY - rect.top;
        
        checkSnap();
        drawLines();
    });

    window.addEventListener('pointerup', (e) => {
        if (isDragging) {
            isDragging = false;
            drawLines(); 
        }
    });

    function handleWin() {
        if (window.playSound) window.playSound('win');
        resultEl.style.opacity = '1'; 
        dotsContainer.style.opacity = '0'; 
        drawLines(); 
        
        const max = parseInt(localStorage.getItem('zeka_diyari_game_16_unlocked_v3') || "1");
        if (levelNumber === max && levelNumber < 10) {
            localStorage.setItem('zeka_diyari_game_16_unlocked_v3', levelNumber + 1);
        }
        
        if (window.updateStats) window.updateStats(100, 1);
        
        const nextBtn = levelNumber < 10 ? `<button class="btn btn-success" id="btn-dots-next" style="margin-top:20px; z-index:20; position:relative; pointer-events:auto;">Sonraki Seviye</button>` : '';
        
        setTimeout(() => {
            const html = `
                <div style="position:absolute; inset:0; background:rgba(0,0,0,0.7); display:flex; flex-direction:column; justify-content:center; align-items:center; color:white; z-index:10;">
                    <h2 style="color:#34d399; font-size:2rem; margin-bottom:10px;">Tamamlandı!</h2>
                    ${nextBtn}
                </div>
            `;
            const overlay = document.createElement('div');
            overlay.innerHTML = html;
            container.querySelector('.dots-game').appendChild(overlay);
            
            if (levelNumber < 10) {
                const btn = document.getElementById('btn-dots-next');
                if(btn) {
                    btn.onclick = () => window.startConnectDotsGame(container, levelNumber + 1);
                }
            }
        }, 1500);
    }

    initDots();
};

window.startColorSortGame = function(container, levelNumber) {
    const LEVELS = [
        { level: 1, columns: 3, colors: 2 },
        { level: 2, columns: 4, colors: 2 },
        { level: 3, columns: 5, colors: 3 },
        { level: 4, columns: 6, colors: 4 },
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
    
    function getHintsLeft() {
        return parseInt(localStorage.getItem('zeka_diyari_hints') || "3");
    }
    
    function setHintsLeft(val) {
        localStorage.setItem('zeka_diyari_hints', val);
        const el = container.querySelector('#hint-count');
        if (el) el.innerText = val;
    }

    const tabsHTML = LEVELS.map(l => {
        const unl = isLvlUnlocked(l.level);
        return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" ' + (unl ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"') + '>' + (unl ? '💎 ' + l.level : '🔒 ' + l.level) + '</button>';
    }).join('');

    const uiHTML = `
        <div class="color-sort-game" style="max-width: 600px; user-select:none; text-align:center;">
            <div class="level-tabs" style="display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin-bottom:15px;">${tabsHTML}</div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px; padding: 0 10px;">
                <button id="btn-sort-restart" class="btn btn-sm btn-primary" style="padding: 5px 12px; border-radius: 8px;">Yeniden Başla</button>
                <div style="font-size:0.9rem; font-weight:bold; color:var(--text-main); background:var(--bg-card); padding:5px 12px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">Hamle: <span id="move-count">0</span></div>
                <button id="btn-sort-hint" class="btn btn-sm" style="padding: 5px 12px; border-radius: 8px; background:var(--pastel-yellow); color:#1F2937; border:2px solid #ca8a04; font-weight:bold; display:flex; align-items:center; gap:5px;">
                    💡 <span id="hint-count">${getHintsLeft()}</span>
                </button>
            </div>
            
            <div id="sort-container" style="display:flex; flex-wrap:wrap; justify-content:center; gap:12px; margin-top:20px; min-height:350px; align-items:flex-end; position:relative;">
            </div>
        </div>
    `;
    
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

    const btnHint = container.querySelector('#btn-sort-hint');
    if (btnHint) {
        btnHint.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            handleHintRequest();
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
        let itemIndex = 0;
        
        for (let i = 0; i < cfg.columns; i++) {
            let colItems = [];
            if (i < cfg.colors) {
                for (let j = 0; j < 4; j++) {
                    let isHidden = false;
                    // Eğer seviye 7 veya daha yüksekse, en alt sırayı (j === 0) gizli yap.
                    // Seviye 9 veya 10 ise, alttan ikinci sırayı da (j === 1) gizli yap.
                    if (levelNumber >= 7) {
                        if (j === 0) isHidden = true;
                        if (levelNumber >= 9 && j === 1) isHidden = true;
                    }
                    colItems.push({ colorIdx: items[itemIndex++], hidden: isHidden });
                }
            }
            columns.push(colItems);
        }
    }

    function renderColumns(hintSrc = -1, hintDest = -1) {
        sortContainer.innerHTML = '';
        moveCountEl.innerText = moveCount;
        
        // Sütunları satırlara böl (6'dan fazla sütun varsa eşit böl)
        const rows = [];
        const total = columns.length;
        if (total <= 6) {
            rows.push(columns.map((col, idx) => ({ col, cIdx: idx })));
        } else {
            const half = Math.ceil(total / 2);
            const r1 = [];
            const r2 = [];
            columns.forEach((col, idx) => {
                if (idx < half) r1.push({ col, cIdx: idx });
                else r2.push({ col, cIdx: idx });
            });
            rows.push(r1);
            rows.push(r2);
        }
        
        const maxCols = total <= 6 ? total : Math.ceil(total / 2);
        const colWidth = Math.min(60, (sortContainer.clientWidth - (maxCols * 12)) / maxCols);
        
        sortContainer.style.display = 'flex';
        sortContainer.style.flexDirection = 'column';
        sortContainer.style.alignItems = 'center';
        sortContainer.style.gap = '15px';
        
        rows.forEach(rowItems => {
            const rowDiv = document.createElement('div');
            rowDiv.style.display = 'flex';
            rowDiv.style.justifyContent = 'center';
            rowDiv.style.gap = '12px';
            rowDiv.style.width = '100%';
            
            rowItems.forEach(({ col, cIdx }) => {
                const colDiv = document.createElement('div');
                colDiv.className = 'gem-column';
                colDiv.setAttribute('data-col-index', cIdx);
                colDiv.style.width = `${colWidth}px`;
                colDiv.style.height = '240px';
                colDiv.style.background = 'rgba(255, 255, 255, 0.1)';
                colDiv.style.border = '2px solid rgba(255, 255, 255, 0.2)';
                colDiv.style.borderRadius = '0 0 20px 20px';
                colDiv.style.borderTop = 'none';
                colDiv.style.position = 'relative';
                colDiv.style.display = 'flex';
                colDiv.style.flexDirection = 'column-reverse'; 
                colDiv.style.alignItems = 'center';
                colDiv.style.paddingBottom = '10px';
                colDiv.style.gap = '5px';
                colDiv.style.boxShadow = 'inset 0 -10px 20px rgba(0,0,0,0.3)';
                colDiv.style.cursor = 'pointer';
                
                // Üstteki taşı otomatik aç (Reveal logic)
                if (col.length > 0) {
                    if (col[col.length - 1].hidden) {
                        col[col.length - 1].hidden = false;
                        if(window.playSound) window.playSound('success');
                    }
                }

                col.forEach((gemData, rIdx) => {
                    const gem = document.createElement('div');
                    gem.className = 'gem';
                    gem.style.width = `${colWidth - 16}px`;
                    gem.style.height = `${(colWidth - 16) * 0.9}px`;
                    
                    if (gemData.hidden) {
                        gem.style.background = 'linear-gradient(135deg, #475569, #1e293b)';
                        gem.style.boxShadow = 'inset 0 2px 4px rgba(255,255,255,0.2), 0 4px 6px rgba(0,0,0,0.5)';
                        gem.innerHTML = '<span style="color:#94a3b8; font-weight:900; font-size:1.5rem; filter:drop-shadow(0 2px 2px rgba(0,0,0,0.8));">?</span>';
                        gem.style.display = 'flex';
                        gem.style.justifyContent = 'center';
                        gem.style.alignItems = 'center';
                    } else {
                        gem.style.background = GEM_COLORS[gemData.colorIdx];
                        gem.style.boxShadow = 'inset 0 4px 8px rgba(255,255,255,0.4), inset 0 -4px 8px rgba(0,0,0,0.4), 0 4px 6px rgba(0,0,0,0.3)';
                    }
                    
                    gem.style.clipPath = 'polygon(20% 0%, 80% 0%, 100% 40%, 50% 100%, 0% 40%)';
                    gem.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    gem.style.position = 'relative';
                    
                    if (selectedColIndex === cIdx && rIdx >= col.length - selectedGemsCount) {
                        gem.style.transform = 'translateY(-20px) scale(1.1)';
                        gem.style.zIndex = '10';
                        if (!gemData.hidden) {
                            gem.style.filter = 'brightness(1.3) drop-shadow(0 0 10px rgba(255,255,255,0.8))';
                        }
                    }
                    
                    colDiv.appendChild(gem);
                });
                
                colDiv.addEventListener('pointerdown', (e) => {
                    e.stopPropagation();
                    handleColumnClick(cIdx, colDiv);
                });
                
                rowDiv.appendChild(colDiv);
            });
            sortContainer.appendChild(rowDiv);
        });
    }

    function checkWin() {
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
            
            const nextBtn = levelNumber < 10 ? `<button class="btn btn-success" id="btn-sort-next" style="margin-top:20px; z-index:20; position:relative; pointer-events:auto; font-size:1.1rem; padding:10px 20px;">Sonraki Seviye</button>` : '';
            
            setTimeout(() => {
                const html = `
                    <div style="position:absolute; inset:0; background:rgba(0,0,0,0.85); display:flex; flex-direction:column; justify-content:center; align-items:center; color:white; z-index:10; border-radius:12px;">
                        <div style="font-size: 5rem; margin-bottom:15px; animation: bounce-loop 2s infinite;">💎</div>
                        <h2 style="color:#a78bfa; font-size:2.5rem; margin-bottom:10px; text-shadow: 0 0 15px rgba(167,139,250,0.8);">Mükemmel!</h2>
                        <p style="color:#cbd5e1; font-size:1.1rem;">Tüm mücevherler patlatıldı!</p>
                        ${nextBtn}
                    </div>
                `;
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
        if(window.playSound) window.playSound('success'); 
        
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
            p.style.boxShadow = `0 0 10px ${pColor}`;
            
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 80 + 20;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist - 50;
            
            p.animate([
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
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
        let count = 1;
        const topGem = col[col.length - 1];
        if (topGem.hidden) return 0; // Gizli taş seçilemez

        for (let i = col.length - 2; i >= 0; i--) {
            if (col[i].hidden) break; // Gizli taş zinciri kırar
            if (col[i].colorIdx === topGem.colorIdx) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }
    
    // Check if the entire column consists of the SAME color (for avoiding useless moves to empty columns)
    function isColumnUniform(col) {
        if (col.length === 0) return true;
        const topColor = col[col.length - 1].colorIdx;
        return col.every(g => g.colorIdx === topColor);
    }

    
    let hintPointer = null;
    let hintDestLabel = null;

    function showHintPointer(srcIdx, destIdx) {
        if (hintPointer) { hintPointer.remove(); hintPointer = null; }
        if (hintDestLabel) { hintDestLabel.remove(); hintDestLabel = null; }
        
        const srcCol = sortContainer.querySelector(`[data-col-index="${srcIdx}"]`);
        const destCol = sortContainer.querySelector(`[data-col-index="${destIdx}"]`);
        
        if (!srcCol || !destCol) return;
        
        const srcRect = srcCol.getBoundingClientRect();
        const destRect = destCol.getBoundingClientRect();
        const containerRect = sortContainer.getBoundingClientRect();
        
        const startX = srcRect.left - containerRect.left + srcRect.width / 2;
        const startY = srcRect.top - containerRect.top + 10;
        
        const endX = destRect.left - containerRect.left + destRect.width / 2;
        const endY = destRect.top - containerRect.top + 10;
        
        hintPointer = document.createElement('div');
        hintPointer.innerHTML = '👆';
        hintPointer.style.position = 'absolute';
        hintPointer.style.fontSize = '3.5rem';
        hintPointer.style.zIndex = '100';
        hintPointer.style.pointerEvents = 'none';
        hintPointer.style.left = '0';
        hintPointer.style.top = '0';
        hintPointer.style.filter = 'drop-shadow(0 8px 8px rgba(0,0,0,0.5))';
        
        sortContainer.appendChild(hintPointer);
        
        hintPointer.animate([
            { transform: `translate(${startX - 28}px, ${startY}px) scale(1)` },
            { transform: `translate(${startX - 28}px, ${startY + 15}px) scale(0.9)`, offset: 0.1 },
            { transform: `translate(${startX - 28}px, ${startY}px) scale(1)`, offset: 0.2 },
            { transform: `translate(${endX - 28}px, ${endY}px) scale(1)`, offset: 0.7 },
            { transform: `translate(${endX - 28}px, ${endY + 15}px) scale(0.9)`, offset: 0.8 },
            { transform: `translate(${endX - 28}px, ${endY}px) scale(1)` }
        ], {
            duration: 2500,
            iterations: Infinity,
            easing: 'ease-in-out'
        });
        
        hintDestLabel = document.createElement('div');
        hintDestLabel.innerText = 'Buraya!';
        hintDestLabel.style.position = 'absolute';
        hintDestLabel.style.background = '#4ade80';
        hintDestLabel.style.color = '#14532d';
        hintDestLabel.style.padding = '6px 12px';
        hintDestLabel.style.borderRadius = '12px';
        hintDestLabel.style.fontWeight = '900';
        hintDestLabel.style.fontSize = '1.1rem';
        hintDestLabel.style.left = (endX) + 'px';
        hintDestLabel.style.top = (endY - 30) + 'px';
        hintDestLabel.style.transform = 'translateX(-50%)';
        hintDestLabel.style.pointerEvents = 'none';
        hintDestLabel.style.animation = 'bounce-loop 1s infinite';
        hintDestLabel.style.zIndex = '99';
        hintDestLabel.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
        
        sortContainer.appendChild(hintDestLabel);
        
        setTimeout(() => {
            if (hintPointer) { hintPointer.remove(); hintPointer = null; }
            if (hintDestLabel) { hintDestLabel.remove(); hintDestLabel = null; }
        }, 7500);
    }

    function handleHintRequest() {
        if (isAnimating) return;
        
        let hintsLeft = getHintsLeft();
        if (hintsLeft <= 0) {
            showAdModal();
            return;
        }

        let bestMove = null;
        let bestScore = -1;

        for (let src = 0; src < columns.length; src++) {
            if (columns[src].length === 0) continue;
            
            const topGem = columns[src][columns[src].length - 1];
            if (topGem.hidden) continue; // Gizli taş kaynak olamaz
            
            const moveCount = getContiguousGemsCount(columns[src]);
            const topColor = topGem.colorIdx;
            
            for (let dest = 0; dest < columns.length; dest++) {
                if (src === dest) continue;
                
                const destCol = columns[dest];
                if (destCol.length + moveCount <= 4) {
                    let score = -1;
                    
                    if (destCol.length > 0 && destCol[destCol.length - 1].colorIdx === topColor) {
                        if (destCol.length + moveCount === 4) {
                            score = 10;
                        } else {
                            score = 5;
                        }
                    } else if (destCol.length === 0) {
                        if (!isColumnUniform(columns[src])) {
                            score = 2;
                        }
                    }
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { src, dest };
                    }
                }
            }
        }

        if (bestMove) {
            if(window.playSound) window.playSound('success');
            setHintsLeft(hintsLeft - 1);
            
            // Eğer seçili olan başka bir sütun varsa iptal et, taşı oyuncu kendisi seçsin.
            if (selectedColIndex !== -1) {
                selectedColIndex = -1;
                selectedGemsCount = 0;
            }
            
            renderColumns(); // Seçimi temizlemek için render
            
            // Parmak animasyonunu başlat
            showHintPointer(bestMove.src, bestMove.dest);
            
        } else {
            if(window.playSound) window.playSound('locked');
            
            // OYUNCU TIKANMIŞ DEMEKTİR! (Yapılabilecek mantıklı/geçerli hiçbir hamle kalmamış)
            const html = `
                <div id="deadend-modal" style="position:absolute; inset:0; background:rgba(0,0,0,0.85); display:flex; flex-direction:column; justify-content:center; align-items:center; color:white; z-index:100; border-radius:12px; padding:20px; text-align:center;">
                    <div style="font-size: 5rem; margin-bottom:15px; animation: shake 0.5s ease-in-out;">🚧</div>
                    <h2 style="color:#facc15; font-size:2rem; margin-bottom:10px;">Hamle Kalmadı!</h2>
                    <p style="color:#cbd5e1; font-size:1.1rem; max-width: 80%; margin-bottom:20px;">Ne yazık ki yapılabilecek geçerli hiçbir hamle kalmadı, tıkandın! Bölümü geçmek için Yeniden Başlamalısın.</p>
                    <button class="btn btn-primary" id="btn-deadend-restart" style="padding:15px 30px; font-size:1.1rem; font-weight:bold; border-radius:12px;">🔄 Yeniden Başla</button>
                    <button class="btn btn-locked" id="btn-deadend-close" style="margin-top:15px; padding:10px 30px;">Kapat</button>
                </div>
            `;
            
            const overlay = document.createElement('div');
            overlay.innerHTML = html;
            container.querySelector('.color-sort-game').style.position = 'relative';
            container.querySelector('.color-sort-game').appendChild(overlay);
            
            document.getElementById('btn-deadend-restart').addEventListener('click', () => {
                if(window.playSound) window.playSound('click');
                overlay.remove();
                initLevel(); // Oyunu sıfırla
            });
            
            document.getElementById('btn-deadend-close').addEventListener('click', () => {
                if(window.playSound) window.playSound('click');
                overlay.remove();
            });
        }
    }
    
    function showAdModal() {
        if (window.playSound) window.playSound('locked');
        // Custom modal inside the container to avoid breaking global app modal if needed, 
        // but since we are in newGames, we can use a local overlay.
        const html = `
            <div id="hint-ad-modal" style="position:absolute; inset:0; background:rgba(0,0,0,0.85); display:flex; flex-direction:column; justify-content:center; align-items:center; color:white; z-index:100; border-radius:12px; padding:20px;">
                <div style="font-size: 5rem; margin-bottom:15px; filter: grayscale(100%);">💡</div>
                <h2 style="color:#ef4444; font-size:2rem; margin-bottom:10px;">İpucu Hakkın Bitti!</h2>
                <p style="color:#cbd5e1; font-size:1.1rem; text-align:center; max-width: 80%; margin-bottom:20px;">Oyuna devam edebilmek ve takıldığın yeri geçebilmek için 3 yeni ipucu kazanmak ister misin?</p>
                <button class="btn btn-success" id="btn-watch-ad" style="margin-bottom:15px; width:80%; max-width:300px; padding:15px; font-size:1.1rem; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:10px;">
                    🎬 Reklam İzle & Kazan
                </button>
                <button class="btn btn-locked" id="btn-cancel-ad" style="width:80%; max-width:300px; padding:10px;">Vazgeç</button>
            </div>
        `;
        
        const overlay = document.createElement('div');
        overlay.innerHTML = html;
        container.querySelector('.color-sort-game').style.position = 'relative';
        container.querySelector('.color-sort-game').appendChild(overlay);
        
        document.getElementById('btn-watch-ad').addEventListener('click', () => {
            if (window.playSound) window.playSound('success');
            // Simulate Ad
            document.getElementById('hint-ad-modal').innerHTML = `
                <div style="font-size: 3rem; margin-bottom:15px; animation:spin 2s linear infinite;">⏳</div>
                <h3 style="color:#cbd5e1;">Sponsorlu İçerik Yükleniyor...</h3>
            `;
            
            setTimeout(() => {
                setHintsLeft(3);
                if (window.playSound) window.playSound('win');
                document.getElementById('hint-ad-modal').innerHTML = `
                    <div style="font-size: 5rem; margin-bottom:15px; animation:bounce-loop 2s infinite;">🎁</div>
                    <h2 style="color:#4ade80;">Tebrikler!</h2>
                    <p style="color:#cbd5e1;">3 Adet İpucu Kazandın!</p>
                `;
                
                setTimeout(() => {
                    overlay.remove();
                }, 1500);
            }, 2000); // 2 sec ad simulation
        });
        
        document.getElementById('btn-cancel-ad').addEventListener('click', () => {
            if (window.playSound) window.playSound('click');
            overlay.remove();
        });
    }

    function handleColumnClick(cIdx, colElement) {
        if (isAnimating) return;
        
        // Animasyon varsa temizle
        if (typeof hintPointer !== 'undefined' && hintPointer) { hintPointer.remove(); hintPointer = null; }
        if (typeof hintDestLabel !== 'undefined' && hintDestLabel) { hintDestLabel.remove(); hintDestLabel = null; }

        
        if (selectedColIndex === cIdx) {
            selectedColIndex = -1;
            selectedGemsCount = 0;
            if (window.playSound) window.playSound('click');
            renderColumns();
            return;
        }
        
        if (selectedColIndex === -1) {
            if (columns[cIdx].length === 0) return; 
            selectedColIndex = cIdx;
            selectedGemsCount = getContiguousGemsCount(columns[cIdx]);
            if (window.playSound) window.playSound('click');
            renderColumns();
            return;
        }
        
        const sourceCol = columns[selectedColIndex];
        const destCol = columns[cIdx];
        const topGemColor = sourceCol[sourceCol.length - 1].colorIdx;
        
        let isValid = false;
        
        if (destCol.length + selectedGemsCount <= 4) {
            if (destCol.length === 0) {
                isValid = true;
            } else if (destCol[destCol.length - 1].colorIdx === topGemColor) {
                isValid = true;
            }
        }
        
        if (isValid) {
            moveCount++;
            const movingGems = sourceCol.splice(sourceCol.length - selectedGemsCount, selectedGemsCount);
            destCol.push(...movingGems);
            
            selectedColIndex = -1;
            selectedGemsCount = 0;
            if (window.playSound) window.playSound('click');
            
            if (destCol.length === 4 && getContiguousGemsCount(destCol) === 4) {
                isAnimating = true;
                renderColumns(); 
                
                setTimeout(() => {
                    createExplosion(sortContainer.querySelector(`[data-col-index="${cIdx}"]`), topGemColor);
                    columns[cIdx] = [];
                    renderColumns();
                    isAnimating = false;
                    checkWin();
                }, 300); 
            } else {
                renderColumns();
            }
        } else {
            if (window.playSound) window.playSound('locked');
            selectedColIndex = -1; 
            selectedGemsCount = 0;
            renderColumns();
        }
    }

    function initLevel() {
        selectedColIndex = -1;
        selectedGemsCount = 0;
        isAnimating = false;
        moveCount = 0;
        generateLevel();
        renderColumns();
    }
    
    initLevel();
};
