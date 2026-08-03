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
        const max = parseInt(localStorage.getItem('minikio_game_13_unlocked_v3') || "1");
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
            
            const max = parseInt(localStorage.getItem('minikio_game_13_unlocked_v3') || "1");
            if (levelNumber === max && levelNumber < 10) {
                localStorage.setItem('minikio_game_13_unlocked_v3', levelNumber + 1);
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
            
            const max = parseInt(localStorage.getItem('minikio_game_14_unlocked_v3') || "1");
            if (levelNumber === max && levelNumber < 20) {
                localStorage.setItem('minikio_game_14_unlocked_v3', levelNumber + 1);
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
    let bestScore = parseInt(localStorage.getItem('minikio_tower_best') || "0");
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
                localStorage.setItem('minikio_tower_best', bestScore);
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
        const max = parseInt(localStorage.getItem('minikio_game_16_unlocked_v3') || "1");
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
        
        const max = parseInt(localStorage.getItem('minikio_game_16_unlocked_v3') || "1");
        if (levelNumber === max && levelNumber < 10) {
            localStorage.setItem('minikio_game_16_unlocked_v3', levelNumber + 1);
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
        const max = parseInt(localStorage.getItem('minikio_game_17_unlocked_v3') || "1");
        return lvl <= max;
    }
    
    function getHintsLeft() {
        return parseInt(localStorage.getItem('minikio_hints') || "3");
    }
    
    function setHintsLeft(val) {
        localStorage.setItem('minikio_hints', val);
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
            
            const max = parseInt(localStorage.getItem('minikio_game_17_unlocked_v3') || "1");
            if (levelNumber === max && levelNumber < 10) {
                localStorage.setItem('minikio_game_17_unlocked_v3', levelNumber + 1);
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

// ============================================================
// OYUN 18: KODLAMA ROBOTU (CODING ROBOT GAME ENGINE)
// ============================================================
window.startCodingRobotGame = function(container, levelNumber) {
    const LEVELS = [
        { level: 1, obstacles: [], start: [0, 4] },
        { level: 2, obstacles: [[2, 2]], start: [0, 4] },
        { level: 3, obstacles: [[1, 1], [3, 3]], start: [0, 4] },
        { level: 4, obstacles: [[2, 1], [2, 2], [2, 3]], start: [0, 4] },
        { level: 5, obstacles: [[1, 2], [2, 2], [3, 2], [2, 3]], start: [0, 4] },
        { level: 6, obstacles: [[1, 1], [1, 3], [3, 1], [3, 3], [2, 2]], start: [0, 4] },
        { level: 7, obstacles: [[0, 2], [1, 2], [3, 2], [4, 2]], start: [0, 4] },
        { level: 8, obstacles: [[1, 0], [1, 1], [1, 2], [3, 2], [3, 3], [3, 4]], start: [0, 4] },
        { level: 9, obstacles: [[0, 1], [1, 1], [2, 1], [2, 3], [3, 3], [4, 3]], start: [0, 4] },
        { level: 10, obstacles: [[1, 1], [1, 2], [1, 3], [1, 4], [3, 0], [3, 1], [3, 2], [3, 3]], start: [0, 4] },
        { level: 11, obstacles: [[1, 1], [1, 2], [1, 3], [1, 4], [2, 1], [3, 1], [3, 2], [3, 3]], start: [0, 4] },
        { level: 12, obstacles: [[1, 0], [1, 2], [1, 4], [3, 0], [3, 2], [3, 4], [2, 1], [2, 3]], start: [0, 4] },
        { level: 13, obstacles: [[0, 1], [1, 1], [2, 1], [3, 1], [1, 3], [2, 3], [3, 3], [4, 3], [2, 0]], start: [0, 4] },
        { level: 14, obstacles: [[1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [3, 1], [3, 0], [2, 0]], start: [0, 4] },
        { level: 15, obstacles: [[1, 1], [1, 2], [1, 3], [1, 4], [2, 1], [3, 1], [3, 3], [3, 2]], start: [0, 4] }
    ];

    const maxLvl = 15;
    function getUnlockedLevel() {
        return parseInt(localStorage.getItem('minikio_game_18_unlocked_v3') || '1');
    }
    function setUnlockedLevel(lvl) {
        localStorage.setItem('minikio_game_18_unlocked_v3', lvl);
    }

    const cfg = LEVELS[levelNumber - 1];
    let robotPos = [...cfg.start];
    let commands = [];
    let isRunning = false;
    let runInterval = null;
    let targetPos = [4, 0];

    function getShortestPathLength(start, target, obstacles) {
        let queue = [[start[0], start[1], 0]];
        let visited = new Set();
        visited.add(`${start[0]},${start[1]}`);
        
        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        while (queue.length > 0) {
            const [cx, cy, dist] = queue.shift();
            if (cx === target[0] && cy === target[1]) return dist;
            
            for (const [dx, dy] of dirs) {
                const nx = cx + dx;
                const ny = cy + dy;
                const key = `${nx},${ny}`;
                
                if (nx >= 0 && nx < 5 && ny >= 0 && ny < 5 && !visited.has(key)) {
                    const isObstacle = obstacles.some(o => o[0] === nx && o[1] === ny);
                    if (!isObstacle) {
                        visited.add(key);
                        queue.push([nx, ny, dist + 1]);
                    }
                }
            }
        }
        return -1;
    }

    function generateTarget() {
        let candidates = [];
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                if (x === cfg.start[0] && y === cfg.start[1]) continue;
                if (cfg.obstacles.some(o => o[0] === x && o[1] === y)) continue;

                const pathLen = getShortestPathLength(cfg.start, [x, y], cfg.obstacles);
                if (pathLen !== -1) {
                    candidates.push({ pos: [x, y], dist: pathLen });
                }
            }
        }

        candidates.sort((a, b) => a.dist - b.dist);

        if (candidates.length > 0) {
            let minD = 3;
            let maxD = 25;

            if (levelNumber <= 3) {
                minD = 3;
                maxD = 5;
            } else if (levelNumber <= 6) {
                minD = 5;
                maxD = 8;
            } else if (levelNumber <= 9) {
                minD = 8;
                maxD = 11;
            } else if (levelNumber <= 12) {
                minD = 11;
                maxD = 14;
            } else {
                minD = Math.max(12, candidates[candidates.length - 1].dist - 2);
                maxD = 25;
            }

            let filtered = candidates.filter(c => c.dist >= minD && c.dist <= maxD);
            
            if (filtered.length === 0) {
                filtered = candidates;
            }

            const rnd = Math.floor(Math.random() * filtered.length);
            targetPos = filtered[rnd].pos;
        } else {
            targetPos = [4, 0];
        }
    }
    generateTarget();

    const tabsHTML = LEVELS.map(l => {
        const unlocked = l.level <= getUnlockedLevel();
        return `<button class="level-tab ${l.level === levelNumber ? 'active' : ''}" data-level="${l.level}" ${unlocked ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"'}>${unlocked ? '🤖 ' + l.level : '🔒 ' + l.level}</button>`;
    }).join('');

    const uiHTML = `
        <div class="coding-robot-game" style="max-width: 600px; margin: 0 auto; user-select:none; text-align:center; padding:10px;">
            <div class="level-tabs" style="display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin-bottom:15px;">${tabsHTML}</div>
            
            <div class="game-instructions-panel" style="margin-bottom:15px; background:var(--bg-card); padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); font-size:0.95rem; color:var(--text-main);">
                <strong>Görev:</strong> Robotu (🤖) engellere (🪨) çarpmadan komutlarla hedefe (⭐) ulaştır!
            </div>

            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;">
                <!-- Sol Taraf: 5x5 Izgara -->
                <div id="robot-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(5, 1fr); gap: 4px; width: 280px; height: 280px; background: rgba(0,0,0,0.05); padding: 6px; border-radius: 12px; border: 3px solid var(--text-muted); position: relative; box-shadow: var(--shadow-medium);">
                </div>

                <!-- Sağ Taraf: Komut Arayüzü -->
                <div style="flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 12px;">
                    <div style="background: var(--bg-card); padding: 10px; border-radius: 12px; box-shadow: var(--shadow-small); flex: 1; display: flex; flex-direction: column; min-height: 120px;">
                        <span style="font-weight: bold; font-size: 0.9rem; margin-bottom: 8px; display: block; color: var(--text-main);">Komut Kuyruğu (Maks 8)</span>
                        <div id="commands-tray" style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; align-content: flex-start; flex: 1; padding: 6px; background: rgba(0,0,0,0.03); border-radius: 8px; border: 1px dashed var(--text-muted);">
                        </div>
                    </div>

                    <!-- Yön Butonları -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; width: 150px; margin: 0 auto;">
                        <div></div>
                        <button class="btn cmd-btn" data-dir="up" style="padding:10px 0; border-radius:8px; background:var(--pastel-blue); font-size:1.2rem;">⬆️</button>
                        <div></div>
                        <button class="btn cmd-btn" data-dir="left" style="padding:10px 0; border-radius:8px; background:var(--pastel-blue); font-size:1.2rem;">⬅️</button>
                        <button class="btn cmd-btn" data-dir="down" style="padding:10px 0; border-radius:8px; background:var(--pastel-blue); font-size:1.2rem;">⬇️</button>
                        <button class="btn cmd-btn" data-dir="right" style="padding:10px 0; border-radius:8px; background:var(--pastel-blue); font-size:1.2rem;">➡️</button>
                    </div>

                    <!-- Kontrol Butonları -->
                    <div style="display: flex; gap: 8px;">
                        <button id="btn-robot-run" class="btn btn-success" style="flex: 2; border-radius: 10px; font-weight: bold; padding: 12px 0;">▶️ ÇALIŞTIR</button>
                        <button id="btn-robot-clear" class="btn btn-danger" style="flex: 1; border-radius: 10px; font-weight: bold; padding: 12px 0;">🗑️ TEMİZLE</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = uiHTML;

    // Level tabs click event
    container.querySelectorAll(".level-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            if (tab.hasAttribute("disabled")) return;
            const next = parseInt(tab.dataset.level);
            if (next === levelNumber) return;
            if (window.playSound) window.playSound('click');
            cleanup();
            window.startCodingRobotGame(container, next);
        });
    });

    const gridEl = container.querySelector('#robot-grid');
    const trayEl = container.querySelector('#commands-tray');
    const runBtn = container.querySelector('#btn-robot-run');
    const clearBtn = container.querySelector('#btn-robot-clear');

    // Direction buttons
    container.querySelectorAll('.cmd-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isRunning) return;
            if (commands.length >= 8) {
                if (window.playSound) window.playSound('locked');
                return;
            }
            if (window.playSound) window.playSound('click');
            commands.push(btn.dataset.dir);
            renderCommands();
        });
    });

    clearBtn.addEventListener('click', () => {
        if (isRunning) return;
        if (window.playSound) window.playSound('click');
        commands = [];
        renderCommands();
    });

    runBtn.addEventListener('click', () => {
        if (isRunning) {
            // Stop run
            stopSimulation();
        } else {
            if (commands.length === 0) {
                if (window.playSound) window.playSound('locked');
                return;
            }
            runSimulation();
        }
    });

    function renderGrid() {
        gridEl.innerHTML = '';
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const cell = document.createElement('div');
                cell.style.background = 'var(--bg-card)';
                cell.style.borderRadius = '6px';
                cell.style.display = 'flex';
                cell.style.alignItems = 'center';
                cell.style.justifyContent = 'center';
                cell.style.fontSize = '1.8rem';
                cell.style.position = 'relative';
                cell.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.1)';
                cell.style.transition = 'all 0.2s';

                // Check robot
                if (robotPos[0] === c && robotPos[1] === r) {
                    cell.innerText = '🤖';
                    cell.style.transform = 'scale(1.1)';
                    cell.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))';
                    cell.style.zIndex = '5';
                }
                // Check target
                else if (targetPos[0] === c && targetPos[1] === r) {
                    cell.innerText = '⭐';
                    cell.style.background = 'rgba(253, 255, 182, 0.4)';
                    cell.style.border = '2px dashed var(--pastel-yellow)';
                }
                // Check obstacles
                else if (cfg.obstacles.some(o => o[0] === c && o[1] === r)) {
                    cell.innerText = '🪨';
                    cell.style.background = 'rgba(0,0,0,0.06)';
                }

                gridEl.appendChild(cell);
            }
        }
    }

    function renderCommands() {
        trayEl.innerHTML = '';
        commands.forEach((cmd, idx) => {
            const cmdBadge = document.createElement('div');
            cmdBadge.style.width = '30px';
            cmdBadge.style.height = '30px';
            cmdBadge.style.background = 'var(--pastel-blue)';
            cmdBadge.style.borderRadius = '6px';
            cmdBadge.style.display = 'flex';
            cmdBadge.style.alignItems = 'center';
            cmdBadge.style.justifyContent = 'center';
            cmdBadge.style.fontSize = '1.1rem';
            cmdBadge.style.cursor = isRunning ? 'default' : 'pointer';
            cmdBadge.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            cmdBadge.style.transition = 'all 0.1s';
            cmdBadge.innerText = cmd === 'up' ? '⬆️' : cmd === 'down' ? '⬇️' : cmd === 'left' ? '⬅️' : '➡️';
            
            if (!isRunning) {
                cmdBadge.addEventListener('click', () => {
                    if (window.playSound) window.playSound('click');
                    commands.splice(idx, 1);
                    renderCommands();
                });
                cmdBadge.addEventListener('mouseenter', () => {
                    cmdBadge.style.transform = 'scale(1.1)';
                    cmdBadge.style.background = '#FFADAD'; // Reddish to indicate delete
                });
                cmdBadge.addEventListener('mouseleave', () => {
                    cmdBadge.style.transform = 'scale(1)';
                    cmdBadge.style.background = 'var(--pastel-blue)';
                });
            }
            trayEl.appendChild(cmdBadge);
        });
    }

    function runSimulation() {
        isRunning = true;
        runBtn.innerText = '⏹️ DURDUR';
        runBtn.className = 'btn btn-danger';
        robotPos = [...cfg.start];
        renderGrid();
        
        let step = 0;
        
        runInterval = setInterval(() => {
            if (step >= commands.length) {
                // Done commands, check if won
                clearInterval(runInterval);
                checkWin();
                return;
            }

            // Highlight current command in tray
            const badges = trayEl.children;
            for (let i = 0; i < badges.length; i++) {
                badges[i].style.transform = i === step ? 'scale(1.2)' : 'scale(1)';
                badges[i].style.border = i === step ? '2px solid var(--text-main)' : 'none';
            }

            const cmd = commands[step];
            let nextX = robotPos[0];
            let nextY = robotPos[1];

            if (cmd === 'up') nextY--;
            else if (cmd === 'down') nextY++;
            else if (cmd === 'left') nextX--;
            else if (cmd === 'right') nextX++;

            // Check out of bounds or obstacle
            if (nextX < 0 || nextX > 4 || nextY < 0 || nextY > 4) {
                triggerCrash();
                return;
            }

            if (cfg.obstacles.some(o => o[0] === nextX && o[1] === nextY)) {
                triggerCrash();
                return;
            }

            // Valid move
            robotPos = [nextX, nextY];
            if (window.playSound) window.playSound('click');
            renderGrid();
            step++;
        }, 500);
    }

    function triggerCrash() {
        clearInterval(runInterval);
        if (window.playSound) window.playSound('locked');
        
        // Vibrate grid visually
        gridEl.style.animation = 'shake 0.4s';
        setTimeout(() => { gridEl.style.animation = ''; }, 400);

        isRunning = false;
        runBtn.innerText = '▶️ ÇALIŞTIR';
        runBtn.className = 'btn btn-success';
        
        // Reset robot to start
        robotPos = [...cfg.start];
        renderGrid();
        renderCommands();
    }

    function stopSimulation() {
        clearInterval(runInterval);
        isRunning = false;
        runBtn.innerText = '▶️ ÇALIŞTIR';
        runBtn.className = 'btn btn-success';
        robotPos = [...cfg.start];
        renderGrid();
        renderCommands();
    }

    function checkWin() {
        isRunning = false;
        runBtn.innerText = '▶️ ÇALIŞTIR';
        runBtn.className = 'btn btn-success';

        if (robotPos[0] === targetPos[0] && robotPos[1] === targetPos[1]) {
            if (window.playSound) window.playSound('win');
            
            // Unlock next level
            const nextLvl = levelNumber + 1;
            if (nextLvl <= maxLvl) {
                if (nextLvl > getUnlockedLevel()) {
                    setUnlockedLevel(nextLvl);
                }
            }

            // Update user stats
            if (window.updateStats) window.updateStats(100 + levelNumber * 20, 1);

            // Win overlay
            const nextBtn = levelNumber < maxLvl ? `<button class="btn btn-success" id="btn-robot-next" style="margin-top:20px; z-index:20; position:relative; font-size:1.1rem; padding:10px 20px;">Sonraki Seviye</button>` : '';
            
            setTimeout(() => {
                const overlay = document.createElement('div');
                overlay.style.position = 'absolute';
                overlay.style.inset = '0';
                overlay.style.background = 'rgba(0,0,0,0.85)';
                overlay.style.display = 'flex';
                overlay.style.flexDirection = 'column';
                overlay.style.justifyContent = 'center';
                overlay.style.alignItems = 'center';
                overlay.style.color = 'white';
                overlay.style.zIndex = '10';
                overlay.style.borderRadius = '12px';
                overlay.innerHTML = `
                    <div style="font-size: 5rem; margin-bottom:15px; animation: bounce-loop 2s infinite;">🏆</div>
                    <h2 style="color:#4ade80; font-size:2.5rem; margin-bottom:10px;">Harika Kodlama!</h2>
                    <p style="color:#cbd5e1; font-size:1.1rem;">Robot hedefe başarıyla ulaştı!</p>
                    ${nextBtn}
                `;
                container.querySelector('.coding-robot-game').style.position = 'relative';
                container.querySelector('.coding-robot-game').appendChild(overlay);

                if (levelNumber < maxLvl) {
                    document.getElementById('btn-robot-next').addEventListener('click', () => {
                        cleanup();
                        window.startCodingRobotGame(container, levelNumber + 1);
                    });
                }
            }, 300);
        } else {
            // Finished moves but not at star
            if (window.playSound) window.playSound('locked');
            stopSimulation();
        }
    }

    function cleanup() {
        if (runInterval) clearInterval(runInterval);
    }

    // Register cleanup callback
    window.currentGameCleanup = cleanup;

    // Init
    renderGrid();
    renderCommands();
};

// ============================================================
// OYUN 19: SİMETRİ AYNASI (SYMMETRY MIRROR GAME ENGINE)
// ============================================================
window.startSymmetryMirrorGame = function(container, levelNumber) {
    const LEVELS = [
        {
            level: 1,
            color: '#ff4a4a', // Neon Red
            points: [{dx: 150, y: 150}, {dx: 50, y: 150}]
        },
        {
            level: 2,
            color: '#39ff14', // Neon Green
            points: [{dx: 100, y: 100}, {dx: 100, y: 200}, {dx: 50, y: 200}]
        },
        {
            level: 3,
            color: '#00f0ff', // Neon Blue
            points: [{dx: 0, y: 100}, {dx: 100, y: 150}, {dx: 0, y: 200}]
        },
        {
            level: 4,
            color: '#fffb00', // Neon Yellow
            points: [{dx: 100, y: 100}, {dx: 100, y: 200}, {dx: 20, y: 200}, {dx: 20, y: 100}]
        },
        {
            level: 5,
            color: '#e0aaff', // Neon Purple
            points: [{dx: 0, y: 80}, {dx: 120, y: 140}, {dx: 120, y: 220}, {dx: 0, y: 220}]
        },
        {
            level: 6,
            color: '#ff9f1c', // Neon Orange
            points: [{dx: 40, y: 110}, {dx: 40, y: 150}, {dx: 100, y: 150}, {dx: 100, y: 190}, {dx: 40, y: 190}, {dx: 40, y: 230}]
        },
        {
            level: 7,
            color: '#ff007f', // Neon Pink
            points: [{dx: 0, y: 80}, {dx: 100, y: 150}, {dx: 0, y: 220}]
        },
        {
            level: 8,
            color: '#00ffd2', // Teal
            points: [{dx: 0, y: 60}, {dx: 30, y: 110}, {dx: 90, y: 110}, {dx: 40, y: 150}, {dx: 60, y: 210}, {dx: 0, y: 170}]
        },
        {
            level: 9,
            color: '#ffd700', // Gold
            points: [{dx: 0, y: 60}, {dx: 40, y: 100}, {dx: 20, y: 100}, {dx: 60, y: 150}, {dx: 30, y: 150}, {dx: 80, y: 200}, {dx: 20, y: 200}, {dx: 20, y: 240}, {dx: 0, y: 240}]
        },
        {
            level: 10,
            color: '#ff6f59', // Coral
            points: [{dx: 0, y: 100}, {dx: 60, y: 110}, {dx: 100, y: 150}, {dx: 60, y: 190}, {dx: 0, y: 200}, {dx: 40, y: 230}, {dx: 40, y: 70}, {dx: 0, y: 100}]
        },
        {
            level: 11,
            color: '#ff70a6', // Light Pink
            points: [{dx: 10, y: 80}, {dx: 80, y: 60}, {dx: 100, y: 110}, {dx: 30, y: 140}, {dx: 80, y: 180}, {dx: 60, y: 220}, {dx: 10, y: 200}]
        },
        {
            level: 12,
            color: '#98f5e1', // Cyan/Mint
            points: [{dx: 0, y: 220}, {dx: 100, y: 220}, {dx: 120, y: 120}, {dx: 70, y: 170}, {dx: 0, y: 100}]
        },
        {
            level: 13,
            color: '#3a86c8', // Sky Blue
            points: [{dx: 0, y: 80}, {dx: 0, y: 180}, {dx: 100, y: 180}, {dx: 70, y: 230}, {dx: 0, y: 230}]
        },
        {
            level: 14,
            color: '#a7c957', // Sage Green
            points: [{dx: 0, y: 60}, {dx: 40, y: 100}, {dx: 40, y: 200}, {dx: 60, y: 220}, {dx: 20, y: 220}, {dx: 20, y: 200}, {dx: 0, y: 200}]
        },
        {
            level: 15,
            color: '#b5179e', // Magenta/Violet
            points: [{dx: 0, y: 150}, {dx: 40, y: 100}, {dx: 90, y: 110}, {dx: 60, y: 150}, {dx: 90, y: 190}, {dx: 40, y: 200}, {dx: 0, y: 150}]
        },
        {
            level: 16,
            color: '#2a9d8f', // Aqua Green
            points: [{dx: 0, y: 100}, {dx: 50, y: 60}, {dx: 100, y: 70}, {dx: 120, y: 110}, {dx: 100, y: 160}, {dx: 50, y: 210}, {dx: 0, y: 250}]
        },
        {
            level: 17,
            color: '#e63946', // Rose Red
            points: [{dx: 0, y: 80}, {dx: 30, y: 60}, {dx: 40, y: 80}, {dx: 20, y: 120}, {dx: 40, y: 180}, {dx: 80, y: 180}, {dx: 100, y: 220}, {dx: 50, y: 240}, {dx: 0, y: 240}]
        },
        {
            level: 18,
            color: '#ff006e', // Magenta Pink
            points: [{dx: 40, y: 80}, {dx: 80, y: 100}, {dx: 40, y: 160}, {dx: 100, y: 220}, {dx: 60, y: 250}, {dx: 0, y: 250}]
        },
        {
            level: 19,
            color: '#7209b7', // Indigo
            points: [{dx: 0, y: 60}, {dx: 120, y: 60}, {dx: 120, y: 220}, {dx: 40, y: 220}, {dx: 40, y: 120}, {dx: 80, y: 120}, {dx: 80, y: 180}, {dx: 60, y: 180}]
        },
        {
            level: 20,
            color: '#fb8500', // Amber Orange
            points: [{dx: 0, y: 240}, {dx: 120, y: 240}, {dx: 120, y: 160}, {dx: 90, y: 160}, {dx: 90, y: 120}, {dx: 70, y: 120}, {dx: 70, y: 160}, {dx: 40, y: 160}, {dx: 40, y: 100}, {dx: 0, y: 50}]
        }
    ];

    const maxLvl = 20;
    function getUnlockedLevel() {
        return parseInt(localStorage.getItem('minikio_game_19_unlocked_v3') || '1');
    }
    function setUnlockedLevel(lvl) {
        localStorage.setItem('minikio_game_19_unlocked_v3', lvl);
    }

    const cfg = LEVELS[levelNumber - 1];
    let userPoints = [];
    let isDrawing = false;

    const tabsHTML = LEVELS.map(l => {
        const unlocked = l.level <= getUnlockedLevel();
        return `<button class="level-tab ${l.level === levelNumber ? 'active' : ''}" data-level="${l.level}" ${unlocked ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"'}>${unlocked ? '🦋 ' + l.level : '🔒 ' + l.level}</button>`;
    }).join('');

    const uiHTML = `
        <div class="symmetry-mirror-game" style="max-width: 600px; margin: 0 auto; user-select:none; text-align:center; padding:10px;">
            <div class="level-tabs" style="display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin-bottom:15px;">${tabsHTML}</div>
            
            <div class="game-instructions-panel" style="margin-bottom:15px; background:var(--bg-card); padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); font-size:0.95rem; color:var(--text-main);">
                <strong>Görev:</strong> Sol taraftaki renkli şeklin dikey ayna simetriğini sağ tarafa **parmağınla veya farenle çiz!**
            </div>

            <div style="display:flex; flex-direction:column; align-items:center; gap:15px;">
                <div style="position: relative; width: 100%; max-width: 500px; aspect-ratio: 5/3; background: rgba(0,0,0,0.1); border-radius: 12px; border: 3px solid var(--text-muted); overflow: hidden; box-shadow: var(--shadow-medium);">
                    <canvas id="symmetry-canvas" width="500" height="300" style="width:100%; height:100%; display: block; cursor: crosshair; touch-action: none; background:#0f172a;"></canvas>
                </div>

                <div style="display: flex; gap: 10px; width: 100%; max-width: 320px;">
                    <button id="btn-sym-check" class="btn btn-success" style="flex: 2; border-radius: 10px; font-weight: bold; padding: 12px 0;">🔍 KONTROL ET</button>
                    <button id="btn-sym-clear" class="btn btn-danger" style="flex: 1; border-radius: 10px; font-weight: bold; padding: 12px 0;">🗑️ TEMİZLE</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = uiHTML;

    container.querySelectorAll(".level-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            if (tab.hasAttribute("disabled")) return;
            const next = parseInt(tab.dataset.level);
            if (next === levelNumber) return;
            if (window.playSound) window.playSound('click');
            window.startSymmetryMirrorGame(container, next);
        });
    });

    const canvas = container.querySelector('#symmetry-canvas');
    const ctx = canvas.getContext('2d');
    const checkBtn = container.querySelector('#btn-sym-check');
    const clearBtn = container.querySelector('#btn-sym-clear');

    let targetSamples = [];
    function generateTargetSamples() {
        targetSamples = [];
        for (let i = 0; i < cfg.points.length - 1; i++) {
            const p1 = cfg.points[i];
            const p2 = cfg.points[i + 1];
            
            const x1 = 250 + p1.dx;
            const y1 = p1.y;
            const x2 = 250 + p2.dx;
            const y2 = p2.y;
            
            const dist = Math.hypot(x2 - x1, y2 - y1);
            const steps = Math.ceil(dist / 4);
            
            for (let s = 0; s <= steps; s++) {
                const t = s / steps;
                const sx = x1 + (x2 - x1) * t;
                const sy = y1 + (y2 - y1) * t;
                targetSamples.push({ x: sx, y: sy });
            }
        }
    }
    generateTargetSamples();

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        for (let x = 25; x < canvas.width; x += 25) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 25; y < canvas.height; y += 25) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(250, 0);
        ctx.lineTo(250, 300);
        ctx.strokeStyle = cfg.color + '44';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        cfg.points.forEach((pt, idx) => {
            const lx = 250 - pt.dx;
            const ly = pt.y;
            if (idx === 0) ctx.moveTo(lx, ly);
            else ctx.lineTo(lx, ly);
        });
        ctx.strokeStyle = cfg.color + '55';
        ctx.lineWidth = 4;
        ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        cfg.points.forEach(pt => {
            ctx.beginPath();
            ctx.arc(250 - pt.dx, pt.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = cfg.color;
            ctx.fill();
        });

        if (userPoints.length > 0) {
            ctx.beginPath();
            ctx.moveTo(userPoints[0].x, userPoints[0].y);
            for (let i = 1; i < userPoints.length; i++) {
                const pt = userPoints[i];
                if (pt.isNewSegment) {
                    ctx.moveTo(pt.x, pt.y);
                } else {
                    ctx.lineTo(pt.x, pt.y);
                }
            }
            ctx.strokeStyle = cfg.color;
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowColor = cfg.color;
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    function getCanvasCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function handleStart(e) {
        e.preventDefault();
        isDrawing = true;
        const coords = getCanvasCoords(e);
        if (coords.x >= 250) {
            userPoints.push({ x: coords.x, y: coords.y, isNewSegment: true });
            draw();
        }
    }

    function handleMove(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const coords = getCanvasCoords(e);
        if (coords.x >= 248) {
            userPoints.push({ x: coords.x, y: coords.y, isNewSegment: false });
            draw();
        } else {
            isDrawing = false;
        }
    }

    function handleEnd() {
        isDrawing = false;
    }

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    clearBtn.addEventListener('click', () => {
        if (window.playSound) window.playSound('click');
        userPoints = [];
        draw();
    });

    checkBtn.addEventListener('click', () => {
        if (userPoints.length < 5) {
            if (window.playSound) window.playSound('locked');
            alertMessage("Çizmeye başla!", false);
            return;
        }

        let hitCount = 0;
        const tolerance = 22;

        targetSamples.forEach(targetPt => {
            const hasHit = userPoints.some(userPt => {
                const dist = Math.hypot(userPt.x - targetPt.x, userPt.y - targetPt.y);
                return dist < tolerance;
            });
            if (hasHit) hitCount++;
        });

        const coverage = hitCount / targetSamples.length;

        let outliers = 0;
        userPoints.forEach(userPt => {
            const isNearAny = targetSamples.some(targetPt => {
                const dist = Math.hypot(userPt.x - targetPt.x, userPt.y - targetPt.y);
                return dist < 35;
            });
            if (!isNearAny) outliers++;
        });

        const outlierRatio = outliers / userPoints.length;

        if (coverage >= 0.72 && outlierRatio <= 0.45) {
            if (window.playSound) window.playSound('win');

            const nextLvl = levelNumber + 1;
            if (nextLvl <= maxLvl) {
                if (nextLvl > getUnlockedLevel()) {
                    setUnlockedLevel(nextLvl);
                }
            }

            if (window.updateStats) window.updateStats(100 + levelNumber * 20, 1);

            const nextBtn = levelNumber < maxLvl ? `<button class="btn btn-success" id="btn-sym-next" style="margin-top:20px; z-index:20; position:relative; font-size:1.1rem; padding:10px 20px;">Sonraki Seviye</button>` : '';

            setTimeout(() => {
                const overlay = document.createElement('div');
                overlay.style.position = 'absolute';
                overlay.style.inset = '0';
                overlay.style.background = 'rgba(0,0,0,0.85)';
                overlay.style.display = 'flex';
                overlay.style.flexDirection = 'column';
                overlay.style.justifyContent = 'center';
                overlay.style.alignItems = 'center';
                overlay.style.color = 'white';
                overlay.style.zIndex = '20';
                overlay.style.borderRadius = '12px';
                overlay.innerHTML = `
                    <div style="font-size: 5rem; margin-bottom:15px; animation: bounce-loop 2s infinite;">🎨✍️</div>
                    <h2 style="color:${cfg.color}; font-size:2.5rem; margin-bottom:10px; text-shadow: 0 0 10px ${cfg.color}88;">Harika Simetri!</h2>
                    <p style="color:#cbd5e1; font-size:1.1rem;">Ayna yansımasını mükemmel tamamladın!</p>
                    ${nextBtn}
                `;
                container.querySelector('.symmetry-mirror-game').style.position = 'relative';
                container.querySelector('.symmetry-mirror-game').appendChild(overlay);

                if (levelNumber < maxLvl) {
                    document.getElementById('btn-sym-next').addEventListener('click', () => {
                        cleanup();
                        window.startSymmetryMirrorGame(container, levelNumber + 1);
                    });
                }
            }, 300);
        } else {
            if (window.playSound) window.playSound('locked');
            
            const box = canvas.parentElement;
            box.style.animation = 'shake 0.4s';
            setTimeout(() => { box.style.animation = ''; }, 400);

            if (coverage < 0.72) {
                alertMessage("Çizim henüz tamamlanmadı. Şeklin simetriğini çizmeye devam et!", false);
            } else {
                alertMessage("Çok fazla dışarı taşırdın. Daha özenli çiz!", false);
            }
        }
    });

    function alertMessage(msg, isSuccess) {
        const infoPanel = container.querySelector('.game-instructions-panel');
        infoPanel.innerHTML = `<strong style="color:${isSuccess ? '#4ade80' : '#f87171'}">${msg}</strong>`;
        setTimeout(() => {
            infoPanel.innerHTML = `<strong>Görev:</strong> Sol taraftaki renkli şeklin dikey ayna simetriğini sağ tarafa **parmağınla veya farenle çiz!**`;
        }, 3000);
    }

    function cleanup() {
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchend', handleEnd);
    }

    window.currentGameCleanup = cleanup;
    draw();
};

// ============================================================
// OYUN 20: RİTİM VE DANS (RHYTHM AND DANCE SEQUENCER ENGINE)
// ============================================================
window.startRhythmDanceGame = function(container, levelNumber) {
    const SONGS = [
        { id: 1, name: "Daha Dün Annemizin", baseNotes: [0, 0, 1, 1, 2, 2, 1, 0, 0, 1, 1, 2, 2, 1], baseMelody: [261.63, 261.63, 392.00, 392.00, 440.00, 440.00, 392.00, 349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63], baseSpawnRate: 1000, speed: 2.2 },
        { id: 2, name: "Küçük Kurbağa", baseNotes: [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2], baseMelody: [329.63, 261.63, 329.63, 261.63, 329.63, 349.23, 392.00, 392.00, 349.23, 329.63, 349.23, 329.63, 293.66, 293.66, 261.63], baseSpawnRate: 900, speed: 2.4 },
        { id: 3, name: "Ali Babanın Çiftliği", baseNotes: [0, 0, 2, 2, 1, 1, 2, 0, 0, 2, 2, 1, 1, 0], baseMelody: [261.63, 261.63, 261.63, 293.66, 329.63, 329.63, 293.66, 293.66, 261.63, 261.63, 261.63, 293.66, 329.63, 261.63], baseSpawnRate: 850, speed: 2.6 },
        { id: 4, name: "Arı Vız Vız Vız", baseNotes: [1, 1, 0, 0, 2, 2, 1, 1, 0, 0, 2, 2, 1, 1, 0], baseMelody: [392.00, 349.23, 329.63, 293.66, 261.63, 293.66, 329.63, 392.00, 392.00, 349.23, 329.63, 293.66, 261.63, 293.66, 261.63], baseSpawnRate: 800, speed: 2.8 },
        { id: 5, name: "Mini Mini Bir Kuş", baseNotes: [0, 1, 0, 1, 2, 1, 2, 1, 0, 1, 0, 1, 2, 1], baseMelody: [329.63, 349.23, 392.00, 392.00, 440.00, 440.00, 392.00, 349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63], baseSpawnRate: 750, speed: 3.0 },
        { id: 6, name: "Kırmızı Balık", baseNotes: [0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2, 0], baseMelody: [293.66, 329.63, 349.23, 293.66, 329.63, 349.23, 392.00, 392.00, 349.23, 329.63, 293.66, 293.66, 261.63], baseSpawnRate: 700, speed: 3.2 },
        { id: 7, name: "Bak Postacı Geliyor", baseNotes: [0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1], baseMelody: [261.63, 293.66, 329.63, 261.63, 293.66, 329.63, 349.23, 349.23, 329.63, 293.66, 261.63, 261.63], baseSpawnRate: 700, speed: 3.2 },
        { id: 8, name: "Baltalar Elimizde", baseNotes: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0], baseMelody: [261.63, 293.66, 329.63, 349.23, 392.00, 392.00, 440.00, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63], baseSpawnRate: 650, speed: 3.4 },
        { id: 9, name: "Kutu Kutu Pense", baseNotes: [1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1], baseMelody: [329.63, 329.63, 349.23, 392.00, 392.00, 349.23, 329.63, 293.66, 293.66, 329.63, 349.23, 349.23, 329.63, 293.66, 261.63], baseSpawnRate: 650, speed: 3.4 },
        { id: 10, name: "Tohumlar Fidana", baseNotes: [0, 0, 1, 1, 0, 0, 2, 2, 0, 0, 1, 1, 0, 0], baseMelody: [261.63, 293.66, 329.63, 261.63, 329.63, 349.23, 392.00, 392.00, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63], baseSpawnRate: 600, speed: 3.6 },
        { id: 11, name: "Horozumu Kaçırdılar", baseNotes: [1, 1, 1, 0, 2, 2, 2, 1, 1, 1, 1, 0, 2, 2, 2], baseMelody: [329.63, 329.63, 349.23, 392.00, 392.00, 349.23, 329.63, 293.66, 293.66, 261.63, 293.66, 329.63, 329.63, 293.66, 261.63], baseSpawnRate: 600, speed: 3.6 },
        { id: 12, name: "Tren Gelir Hoş Gelir", baseNotes: [0, 2, 0, 2, 1, 1, 2, 2, 0, 2, 0, 2, 1, 1, 2], baseMelody: [261.63, 293.66, 329.63, 392.00, 392.00, 329.63, 293.66, 261.63, 261.63, 293.66, 329.63, 392.00, 329.63, 293.66, 261.63], baseSpawnRate: 550, speed: 3.8 },
        { id: 13, name: "Dere Geliyor Dere", baseNotes: [0, 1, 0, 1, 2, 2, 1, 1, 0, 1, 0, 1, 2, 2, 1], baseMelody: [293.66, 329.63, 349.23, 392.00, 440.00, 440.00, 392.00, 349.23, 329.63, 293.66, 293.66, 261.63, 293.66, 329.63, 293.66], baseSpawnRate: 550, speed: 3.8 },
        { id: 14, name: "Sarı Kız", baseNotes: [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1], baseMelody: [261.63, 329.63, 392.00, 392.00, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63, 293.66, 329.63, 293.66, 261.63], baseSpawnRate: 500, speed: 4.0 },
        { id: 15, name: "Yalancı Çoban", baseNotes: [1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1], baseMelody: [329.63, 261.63, 293.66, 329.63, 349.23, 392.00, 392.00, 349.23, 329.63, 293.66, 261.63, 293.66, 329.63, 293.66, 261.63], baseSpawnRate: 500, speed: 4.0 },
        { id: 16, name: "Çay Elinden Öteye", baseNotes: [0, 0, 1, 2, 1, 0, 0, 1, 2, 1, 0, 0, 1, 2, 1], baseMelody: [293.66, 293.66, 329.63, 349.23, 392.00, 392.00, 349.23, 329.63, 293.66, 293.66, 261.63, 293.66, 329.63, 293.66, 261.63], baseSpawnRate: 450, speed: 4.2 },
        { id: 17, name: "Ceviz Adam", baseNotes: [1, 1, 1, 0, 2, 2, 2, 0, 1, 1, 1, 0, 2, 0], baseMelody: [329.63, 329.63, 329.63, 261.63, 293.66, 293.66, 293.66, 261.63, 329.63, 329.63, 329.63, 261.63, 293.66, 261.63], baseSpawnRate: 450, speed: 4.2 },
        { id: 18, name: "Ankara Havası", baseNotes: [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2], baseMelody: [261.63, 293.66, 329.63, 349.23, 392.00, 392.00, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63, 261.63, 293.66, 261.63], baseSpawnRate: 420, speed: 4.4 },
        { id: 19, name: "Karadeniz Horonu", baseNotes: [0, 2, 0, 2, 1, 2, 1, 2, 0, 2, 0, 2, 1, 2], baseMelody: [293.66, 349.23, 293.66, 349.23, 392.00, 440.00, 392.00, 440.00, 392.00, 349.23, 293.66, 349.23, 293.66, 261.63], baseSpawnRate: 400, speed: 4.6 },
        { id: 20, name: "Zeybek Ritmi", baseNotes: [0, 0, 1, 0, 0, 2, 1, 0, 0, 1, 0, 0, 2, 1], baseMelody: [220.00, 220.00, 261.63, 293.66, 220.00, 220.00, 261.63, 293.66, 329.63, 293.66, 261.63, 220.00, 261.63, 220.00], baseSpawnRate: 380, speed: 4.8 }
    ];

    function getUnlockedSong() {
        return parseInt(localStorage.getItem('minikio_rhythm_unlocked_song_v3') || '1');
    }
    function setUnlockedSong(val) {
        localStorage.setItem('minikio_rhythm_unlocked_song_v3', val);
    }

    let activeNotes = [];
    let gameRunning = false;
    let score = 0;
    let misses = 0;
    let nextNoteIndex = 0;
    let melodyProgressIndex = 0;
    
    let spawnTimeoutId = null;
    let animFrameId = null;
    
    let activeSong = null;
    let currentSpeed = 2.2;
    let currentSpawnRate = 1000;

    function checkOrientation() {
        const isMobilePhone = /Mobi|Android|iPhone/i.test(navigator.userAgent) && !/iPad|Macintosh/i.test(navigator.userAgent);
        const isPortrait = window.innerHeight > window.innerWidth;
        
        let overlay = container.querySelector('#rhythm-rotate-overlay');
        
        if (isMobilePhone && isPortrait) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'rhythm-rotate-overlay';
                overlay.style.position = 'absolute';
                overlay.style.inset = '0';
                overlay.style.background = '#0f172a';
                overlay.style.color = '#fff';
                overlay.style.display = 'flex';
                overlay.style.flexDirection = 'column';
                overlay.style.justifyContent = 'center';
                overlay.style.alignItems = 'center';
                overlay.style.zIndex = '500';
                overlay.style.padding = '20px';
                overlay.style.textAlign = 'center';
                overlay.innerHTML = `
                    <div style="font-size: 4rem; margin-bottom: 20px; animation: rotate-phone 2s infinite ease-in-out;">${'🔄'}📱</div>
                    <h3 style="color: var(--pastel-yellow); margin-bottom: 10px;">Telefonu Yan Çevir!</h3>
                    <p style="color: #cbd5e1; font-size: 0.95rem; max-width: 250px; line-height: 1.4;">Daha rahat oynamak için lütfen telefonunu yatay konuma getir.</p>
                    <style>
                        @keyframes rotate-phone {
                            0% { transform: rotate(0deg); }
                            50% { transform: rotate(-90deg); }
                            100% { transform: rotate(0deg); }
                        }
                    </style>
                `;
                container.querySelector('.rhythm-dance-game').style.position = 'relative';
                container.querySelector('.rhythm-dance-game').appendChild(overlay);
            }
        } else {
            if (overlay) {
                overlay.remove();
            }
        }
    }

    function renderSongList() {
        const unlockedCount = getUnlockedSong();
        
        let listHTML = SONGS.map(song => {
            const isUnlocked = song.id <= unlockedCount;
            const badgeColor = isUnlocked ? 'var(--pastel-blue)' : 'rgba(255,255,255,0.05)';
            const border = isUnlocked ? '1px solid rgba(255,255,255,0.1)' : '1px dashed rgba(255,255,255,0.1)';
            const opacity = isUnlocked ? '1' : '0.4';
            const cursor = isUnlocked ? 'pointer' : 'not-allowed';
            
            const songHigh = localStorage.getItem('minikio_rhythm_song_high_' + song.id) || '0';
            const songBadge = localStorage.getItem('minikio_rhythm_song_badge_' + song.id) || ''; 
            
            const noteCount = song.baseNotes.length * 5;
            
            return `<div class="song-card" data-id="` + song.id + `" style="background:` + badgeColor + `; border:` + border + `; opacity:` + opacity + `; cursor:` + cursor + `; padding:10px; border-radius:10px; text-align:left; display:flex; justify-content:space-between; align-items:center; transition:transform 0.1s;">
                    <div>
                        <strong style="color:var(--text-main); font-size:0.9rem; display:block;">` + song.id + `. ` + song.name + `</strong>
                        <small style="color:var(--text-muted); font-size:0.75rem;">
                            Melodi: ` + noteCount + ` Nota 
                            ` + (isUnlocked && songHigh > 0 ? '| Rekor: ' + songHigh : '') + `
                        </small>
                    </div>
                    <div style="font-size:1.35rem; display:flex; align-items:center; gap:5px;">
                        ` + (songBadge ? '<span title="Başarı Derecesi">' + songBadge + '</span>' : '') + `
                        <span>` + (isUnlocked ? '🎹' : '🔒') + `</span>
                    </div>
                </div>`;
        }).join('');

        const containerHTML = `
            <div class="rhythm-dance-game" style="max-width: 600px; margin: 0 auto; user-select:none; text-align:center; padding:10px;">
                <div style="font-size: 1.15rem; font-weight: bold; color: var(--pastel-yellow); margin-bottom: 12px; text-shadow:0 0 8px rgba(253,255,182,0.3);">
                    🎹 SANAL PİYANO LİSTESİ 🎹
                </div>
                
                <div class="game-instructions-panel" style="margin-bottom:15px; background:var(--bg-card); padding:8px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); font-size:0.9rem; color:var(--text-main);">
                    Ekrana düşen **piyano tuşlarının üzerine basarak** çal! Kusursuz bitir, sonrakini aç!
                </div>

                <div id="songs-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; max-height: 380px; overflow-y:auto; padding-right:5px; margin-bottom:10px;">
                    ` + listHTML + `
                </div>
            </div>
        `;

        container.innerHTML = containerHTML;

        container.querySelectorAll('.song-card').forEach(card => {
            card.addEventListener('click', () => {
                const songId = parseInt(card.dataset.id);
                if (songId > unlockedCount) {
                    if (window.playSound) window.playSound('locked');
                    return;
                }
                if (window.playSound) window.playSound('click');
                loadSong(songId);
            });
            card.addEventListener('mouseenter', () => {
                const songId = parseInt(card.dataset.id);
                if (songId <= unlockedCount) card.style.transform = 'scale(1.02)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'none';
            });
        });

        checkOrientation();
    }

    function loadSong(songId) {
        const songConfig = SONGS[songId - 1];
        activeSong = {
            ...songConfig,
            notes: Array(5).fill(songConfig.baseNotes).flat(),
            melody: Array(5).fill(songConfig.baseMelody).flat()
        };

        const currentHigh = localStorage.getItem('minikio_rhythm_song_high_' + activeSong.id) || '0';
        
        const playUI = `
            <div class="rhythm-dance-game" style="max-width: 600px; margin: 0 auto; user-select:none; text-align:center; padding:10px;">
                <div style="font-size: 1.25rem; font-weight: 900; color: #000000; margin-bottom: 10px;">
                    🎹 ` + activeSong.id + `. ` + activeSong.name + ` 🎹
                </div>

                <div class="game-instructions-panel" style="margin-bottom:15px; background:rgba(0,0,0,0.06); padding:8px; border-radius:12px; border:1.5px solid rgba(0,0,0,0.15); font-size:0.9rem; color: #000000; font-weight:bold; line-height:1.4;">
                    Yukarıdan kayan **renkli piyano tuşlarının üzerine** doğrudan tıkla/dokun!
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:0 15px; font-weight:900; font-size:1.05rem; color: #000000;">
                    <div style="color: #000000;">Skor: <span id="rhythm-score" style="font-size:1.3rem; font-weight:900;">0</span></div>
                    <div style="color: #000000;">En Yüksek: <span style="font-weight:900;">` + currentHigh + `</span></div>
                    <div style="color: #000000;">Hata: <span id="rhythm-misses" style="font-size:1.3rem; font-weight:900;">0</span></div>
                    <button id="btn-rhythm-back" class="btn btn-danger" style="padding:4px 10px; font-size:0.8rem; border-radius:6px; font-weight:bold;">🔙 GERİ DÖN</button>
                </div>

                <!-- Geri Bildirim Paneli -->
                <div style="background:rgba(15,23,42,0.8); border-radius:12px; padding:10px; margin-bottom:15px; border:2px solid rgba(255,255,255,0.05); min-height:45px; position:relative; display:flex; align-items:center; justify-content:center;">
                    <div id="rhythm-feedback" style="font-size:1.3rem; font-weight:bold; text-shadow:0 2px 4px rgba(0,0,0,0.6); opacity:0; transition:all 0.1s;">-</div>
                </div>

                <!-- Oyun Alanı (3 Kulvar) -->
                <div style="display:flex; justify-content:center; gap:20px; background:#0f172a; padding:15px 15px 15px 15px; border-radius:16px; border:3px solid var(--text-muted); position:relative; overflow:hidden; height:320px; margin-bottom:15px; box-shadow:var(--shadow-medium);">
                    <div style="display:flex; justify-content:center; gap:20px; width:100%; height:100%;">
                        <div id="rhythm-track-0" style="position:relative; width:60px; height:100%; border-left:1px dashed rgba(255,255,255,0.08); border-right:1px dashed rgba(255,255,255,0.08);"></div>
                        <div id="rhythm-track-1" style="position:relative; width:60px; height:100%; border-left:1px dashed rgba(255,255,255,0.08); border-right:1px dashed rgba(255,255,255,0.08);"></div>
                        <div id="rhythm-track-2" style="position:relative; width:60px; height:100%; border-left:1px dashed rgba(255,255,255,0.08); border-right:1px dashed rgba(255,255,255,0.08);"></div>
                    </div>
                    
                    <div id="rhythm-start-overlay" style="position:absolute; inset:0; background:rgba(15,23,42,0.96); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:100;">
                        <div style="font-size:3.5rem; margin-bottom:10px;">🎹🎼🎵</div>
                        <h3 style="color:#fdffb6; margin-bottom:12px;">Piyano Dinletisi</h3>
                        <p style="color:#cbd5e1; font-size:0.85rem; max-width:280px; line-height:1.4; padding:0 10px;">Ekrana düşen renkli tuşların üstüne tam zamanında basarak melodi seslerini tetikle! Şarkı gittikçe hızlanacaktır!</p>
                        <button id="btn-rhythm-start" class="btn btn-success" style="font-size:1.2rem; padding:12px 30px; border-radius:10px; font-weight:bold;">OYUNU BAŞLAT</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = playUI;

        const backBtn = container.querySelector('#btn-rhythm-back');
        backBtn.addEventListener('click', () => {
            cleanup();
            if (window.playSound) window.playSound('click');
            renderSongList();
        });

        const startBtn = container.querySelector('#btn-rhythm-start');
        startBtn.addEventListener('click', () => {
            if (window.playSound) window.playSound('click');
            startGame();
        });

        checkOrientation();
    }

    function startGame() {
        container.querySelector('#rhythm-start-overlay').style.display = 'none';
        gameRunning = true;
        score = 0;
        misses = 0;
        nextNoteIndex = 0;
        melodyProgressIndex = 0;
        activeNotes = [];
        
        currentSpeed = activeSong.speed;
        currentSpawnRate = activeSong.baseSpawnRate;

        container.querySelectorAll('#rhythm-track-0, #rhythm-track-1, #rhythm-track-2').forEach(t => {
            t.innerHTML = '';
        });

        container.querySelector('#rhythm-score').innerText = '0';
        container.querySelector('#rhythm-misses').innerText = '0';

        // Start progressive spawn scheduler
        scheduleNextSpawn();

        animFrameId = requestAnimationFrame(gameLoop);
    }

    function scheduleNextSpawn() {
        if (!gameRunning) return;
        if (nextNoteIndex >= activeSong.notes.length) return;

        spawnNoteAtIndex();

        // Calculate progress ratio (0 to 1)
        const progressRatio = nextNoteIndex / activeSong.notes.length;
        
        // Progressive acceleration: speed increases, spawn rate speeds up
        currentSpeed = activeSong.speed + progressRatio * 1.8;
        currentSpawnRate = activeSong.baseSpawnRate - progressRatio * (activeSong.baseSpawnRate * 0.4);

        spawnTimeoutId = setTimeout(scheduleNextSpawn, currentSpawnRate);
    }

    function spawnNoteAtIndex() {
        const col = activeSong.notes[nextNoteIndex];
        const noteEl = document.createElement('div');
        noteEl.className = 'rhythm-falling-note';
        
        // Rectangular tile look (Piano Tile style)
        noteEl.style.position = 'absolute';
        noteEl.style.width = '50px';
        noteEl.style.height = '65px';
        noteEl.style.borderRadius = '8px';
        noteEl.style.left = '5px';
        noteEl.style.top = '-70px';
        noteEl.style.boxSizing = 'border-box';
        noteEl.style.zIndex = '10';
        noteEl.style.cursor = 'pointer';

        let glowColor = '#ff4a4a';
        if (col === 0) {
            noteEl.style.background = 'linear-gradient(135deg, #ef4444, #b91c1c)';
            noteEl.style.border = '2px solid #fee2e2';
            glowColor = '#ff4a4a';
        } else if (col === 1) {
            noteEl.style.background = 'linear-gradient(135deg, #eab308, #a16207)';
            noteEl.style.border = '2px solid #fef9c3';
            glowColor = '#fffb00';
        } else {
            noteEl.style.background = 'linear-gradient(135deg, #06b6d4, #0891b2)';
            noteEl.style.border = '2px solid #ecfeff';
            glowColor = '#00f0ff';
        }
        noteEl.style.boxShadow = '0 0 12px ' + glowColor;

        const noteObj = {
            id: Date.now() + Math.random(),
            col: col,
            y: -70,
            el: noteEl,
            tapped: false
        };

        // Tap/click directly on the tile element itself!
        const triggerTap = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (noteObj.tapped) return;
            
            // Perfect hit is when tile is near bottom of playable area (y between 120 and 260)
            if (noteObj.y > 60 && noteObj.y < 280) {
                noteObj.tapped = true;
                
                // Explode animation on tap
                noteEl.style.transform = 'scale(1.25)';
                noteEl.style.opacity = '0';
                noteEl.style.transition = 'all 0.08s';
                setTimeout(() => noteEl.remove(), 80);

                // Remove from active tracking list
                activeNotes = activeNotes.filter(n => n.id !== noteObj.id);

                const diff = Math.abs(noteObj.y - 180); // Center perfect offset
                let points = 0;
                let feedbackText = "";
                let feedbackColor = "";

                if (diff < 20) {
                    points = 10;
                    feedbackText = "MÜKEMMEL! 🔥";
                    feedbackColor = "#4ade80";
                } else {
                    points = 5;
                    feedbackText = "İYİ! 👍";
                    feedbackColor = "#fffb00";
                }

                score += points;
                container.querySelector('#rhythm-score').innerText = score;
                showFeedback(feedbackText, feedbackColor);
                
                const noteFreq = activeSong.melody[melodyProgressIndex % activeSong.melody.length];
                playPianoNote(noteFreq);
                melodyProgressIndex++;
            }
        };

        noteEl.addEventListener('mousedown', triggerTap);
        noteEl.addEventListener('touchstart', triggerTap);

        const track = container.querySelector(`#rhythm-track-${col}`);
        track.appendChild(noteEl);

        activeNotes.push(noteObj);
        nextNoteIndex++;
    }

    function gameLoop() {
        if (!gameRunning) return;

        for (let i = activeNotes.length - 1; i >= 0; i--) {
            const note = activeNotes[i];
            note.y += currentSpeed;
            note.el.style.top = note.y + 'px';

            // Went past bottom of the track (Miss)
            if (note.y > 275) {
                // Instantly end game on a single miss!
                misses = 1;
                endGame();
                return;
            }
        }

        if (nextNoteIndex >= activeSong.notes.length && activeNotes.length === 0) {
            endGame();
            return;
        }

        animFrameId = requestAnimationFrame(gameLoop);
    }

    function triggerKeyboardHit(col) {
        // Keyboard controls support: finds lowest untapped note in column
        const colNotes = activeNotes.filter(n => n.col === col && !n.tapped);
        if (colNotes.length === 0) return;

        colNotes.sort((a, b) => b.y - a.y); // Lowest note has highest y
        const lowestNote = colNotes[0];
        
        // Trigger its click handler
        if (lowestNote.y > 60 && lowestNote.y < 280) {
            lowestNote.el.dispatchEvent(new Event('mousedown'));
        }
    }

    function showFeedback(text, color) {
        const fbEl = container.querySelector('#rhythm-feedback');
        fbEl.innerText = text;
        fbEl.style.color = color;
        fbEl.style.opacity = '1';
        fbEl.style.transform = 'scale(1.15)';

        setTimeout(() => {
            fbEl.style.transform = 'scale(1)';
        }, 80);

        setTimeout(() => {
            if (fbEl.innerText === text) {
                fbEl.style.opacity = '0';
            }
        }, 600);
    }

    function playPianoNote(frequency) {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const now = ctx.currentTime;
            
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const osc3 = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc1.connect(gainNode);
            osc2.connect(gainNode);
            osc3.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(frequency, now);
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(frequency * 2, now);
            
            osc3.type = 'sine';
            osc3.frequency.setValueAtTime(frequency * 3, now);
            
            gainNode.gain.setValueAtTime(0.001, now);
            gainNode.gain.linearRampToValueAtTime(0.24, now + 0.015);
            gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.18);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
            
            osc1.start(now);
            osc2.start(now);
            osc3.start(now);
            
            osc1.stop(now + 1.0);
            osc2.stop(now + 1.0);
            osc3.stop(now + 1.0);
        } catch(e) {}
    }

    function handleKeyDown(e) {
        if (!gameRunning) return;
        const key = e.key.toLowerCase();
        if (key === 'a' || e.key === 'ArrowLeft') {
            triggerKeyboardHit(0);
        } else if (key === 's' || e.key === 'ArrowDown') {
            triggerKeyboardHit(1);
        } else if (key === 'd' || e.key === 'ArrowRight') {
            triggerKeyboardHit(2);
        }
    }

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', checkOrientation);

    function updateLocalStats(songId, finalScore, finalMisses) {
        const oldHigh = parseInt(localStorage.getItem('minikio_rhythm_song_high_' + songId) || '0');
        const isNewHigh = finalScore > oldHigh;
        if (isNewHigh) {
            localStorage.setItem('minikio_rhythm_song_high_' + songId, finalScore);
        }

        let badge = '';
        if (finalMisses === 0) badge = '🏆';
        else if (finalMisses <= 2) badge = '🥈';
        else if (finalMisses <= 4) badge = '🥉';

        const oldBadge = localStorage.getItem('minikio_rhythm_song_badge_' + songId) || '';
        const rank = { '🏆': 3, '🥈': 2, '🥉': 1, '': 0 };

        if (rank[badge] > rank[oldBadge]) {
            localStorage.setItem('minikio_rhythm_song_badge_' + songId, badge);
        }

        return { isNewHigh, badge };
    }

    function endGame() {
        gameRunning = false;
        if (spawnTimeoutId) clearTimeout(spawnTimeoutId);
        if (animFrameId) cancelAnimationFrame(animFrameId);

        const win = misses === 0;
        const stats = updateLocalStats(activeSong.id, score, misses);

        if (win) {
            if (window.playSound) window.playSound('win');

            const nextSongId = activeSong.id + 1;
            const currentUnlocked = getUnlockedSong();
            if (nextSongId <= SONGS.length && nextSongId > currentUnlocked) {
                setUnlockedSong(nextSongId);
            }

            if (window.updateStats) window.updateStats(200 + activeSong.id * 20, 1);

            const nextBtn = activeSong.id < SONGS.length ? `<button class="btn btn-success" id="btn-rhythm-next" style="margin-top:20px; z-index:20; position:relative; font-size:1.1rem; padding:10px 20px;">Sonraki Şarkı</button>` : '';

            setTimeout(() => {
                const overlay = document.createElement('div');
                overlay.style.position = 'absolute';
                overlay.style.inset = '0';
                overlay.style.background = 'rgba(15,23,42,0.96)';
                overlay.style.display = 'flex';
                overlay.style.flexDirection = 'column';
                overlay.style.justifyContent = 'center';
                overlay.style.alignItems = 'center';
                overlay.style.color = 'white';
                overlay.style.zIndex = '20';
                overlay.style.borderRadius = '12px';
                
                const highBadgeHTML = stats.isNewHigh 
                    ? `<div style="background:#fdffb6; color:#0f172a; padding:3px 10px; border-radius:12px; font-size:0.8rem; font-weight:bold; margin-bottom:10px; animation: pulse 1s infinite;">🔥 YENİ REKOR!</div>` 
                    : '';

                overlay.innerHTML = `
                    <div style="font-size: 5rem; margin-bottom:15px; animation: bounce-loop 2s infinite;">🏆🌟</div>
                    ${highBadgeHTML}
                    <h2 style="color:#fdffb6; font-size:2.3rem; margin-bottom:5px; text-shadow: 0 0 10px rgba(253,255,182,0.8);">KUSURSUZ PERFORMANS!</h2>
                    <p style="color:#cbd5e1; font-size:1.1rem;">Şarkıyı 0 hata ile çalarak <strong>🏆 Altın Kupa</strong> kazandın!</p>
                    <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:15px;">Skorun: <strong>${score}</strong> | En Yüksek: <strong>${localStorage.getItem('minikio_rhythm_song_high_' + activeSong.id)}</strong></p>
                    <div style="display:flex; gap:10px; margin-top:5px;">
                        ${nextBtn}
                        <button class="btn btn-primary" id="btn-rhythm-list" style="margin-top:20px; z-index:20; position:relative; font-size:1.1rem; padding:10px 20px;">Şarkı Listesi</button>
                    </div>
                `;
                container.querySelector('.rhythm-dance-game').style.position = 'relative';
                container.querySelector('.rhythm-dance-game').appendChild(overlay);

                if (activeSong.id < SONGS.length) {
                    document.getElementById('btn-rhythm-next').addEventListener('click', () => {
                        cleanup();
                        loadSong(activeSong.id + 1);
                    });
                }
                document.getElementById('btn-rhythm-list').addEventListener('click', () => {
                    cleanup();
                    renderSongList();
                });
            }, 300);
        } else {
            if (window.playSound) window.playSound('locked');

            setTimeout(() => {
                const overlay = document.createElement('div');
                overlay.style.position = 'absolute';
                overlay.style.inset = '0';
                overlay.style.background = 'rgba(15,23,42,0.96)';
                overlay.style.display = 'flex';
                overlay.style.flexDirection = 'column';
                overlay.style.justifyContent = 'center';
                overlay.style.alignItems = 'center';
                overlay.style.color = 'white';
                overlay.style.zIndex = '20';
                overlay.style.borderRadius = '12px';
                
                const highBadgeHTML = stats.isNewHigh 
                    ? `<div style="background:#fdffb6; color:#0f172a; padding:3px 10px; border-radius:12px; font-size:0.8rem; font-weight:bold; margin-bottom:10px; animation: pulse 1s infinite;">🔥 YENİ REKOR!</div>` 
                    : '';

                overlay.innerHTML = `
                    <div style="font-size: 5rem; margin-bottom:15px;">😢💔</div>
                    ${highBadgeHTML}
                    <h2 style="color:#f87171; font-size:2.3rem; margin-bottom:5px; text-shadow: 0 0 10px rgba(248,113,113,0.4);">YANDIN!</h2>
                    <p style="color:#cbd5e1; font-size:1.1rem; max-width:280px; line-height:1.4; margin-bottom:15px;">Notalardan birini kaçırdın! Bir sonraki şarkıyı açmak için tüm şarkıyı hiç hata yapmadan tamamlamalısın.</p>
                    <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:15px;">Skorun: <strong>${score}</strong> | En Yüksek: <strong>${localStorage.getItem('minikio_rhythm_song_high_' + activeSong.id)}</strong></p>
                    <div style="display:flex; gap:10px; margin-top:5px;">
                        <button class="btn btn-success" id="btn-rhythm-retry" style="margin-top:20px; z-index:20; position:relative; font-size:1.1rem; padding:10px 20px;">Tekrar Çal</button>
                        <button class="btn btn-primary" id="btn-rhythm-list" style="margin-top:20px; z-index:20; position:relative; font-size:1.1rem; padding:10px 20px;">Şarkı Listesi</button>
                    </div>
                `;

                container.querySelector('.rhythm-dance-game').style.position = 'relative';
                container.querySelector('.rhythm-dance-game').appendChild(overlay);

                document.getElementById('btn-rhythm-retry').addEventListener('click', () => {
                    cleanup();
                    loadSong(activeSong.id);
                });
                document.getElementById('btn-rhythm-list').addEventListener('click', () => {
                    cleanup();
                    renderSongList();
                });
            }, 300);
        }
    }

    function cleanup() {
        gameRunning = false;
        if (spawnTimeoutId) clearTimeout(spawnTimeoutId);
        if (animFrameId) cancelAnimationFrame(animFrameId);
        document.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('resize', checkOrientation);
    }

    window.currentGameCleanup = cleanup;
    renderSongList();
};

// ============================================================
// OYUN 21: POFUDUK BLOK EŞLEME (BLOCK BLAST)
// ============================================================
window.startBlockBlastGame = function(container, levelNumber) {
    if (!document.getElementById('bb-game-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'bb-game-styles';
        styleEl.innerHTML = `
            /* Dreamy Fluffy Fur Gradient Flow */
            @keyframes gradient-flow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            .bb-dreamland-bg {
                background: linear-gradient(-45deg, #ffc6ff, #ffd6a5, #fdffb6, #caffbf, #9bf6ff, #a0c4ff);
                background-size: 300% 300%;
                animation: gradient-flow 18s ease infinite;
                border-radius: 28px;
                padding: 16px 12px;
                position: relative;
                overflow: hidden;
                box-shadow: 0 14px 32px rgba(236,72,153,0.18);
            }

            /* Floating Fluffy Cloud Animations */
            @keyframes float-cloud-1 {
                0% { transform: translate(-80px, 10px) scale(0.9); opacity: 0.35; }
                50% { transform: translate(160px, -15px) scale(1.0); opacity: 0.6; }
                100% { transform: translate(400px, 10px) scale(0.9); opacity: 0.35; }
            }
            @keyframes float-cloud-2 {
                0% { transform: translate(320px, 120px) scale(1.1); opacity: 0.45; }
                50% { transform: translate(80px, 90px) scale(1.2); opacity: 0.7; }
                100% { transform: translate(-80px, 120px) scale(1.1); opacity: 0.45; }
            }
            .bb-cloud {
                position: absolute;
                background: #ffffff;
                border-radius: 100px;
                pointer-events: none;
                z-index: 1;
                filter: blur(3px);
                box-shadow: 0 4px 15px rgba(255,255,255,0.8);
            }
            .bb-cloud::before, .bb-cloud::after {
                content: '';
                position: absolute;
                background: #ffffff;
                border-radius: 50%;
            }

            .bb-board-cell {
                width: 36px;
                height: 36px;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.75);
                border: 2px dashed #cbd5e1;
                box-shadow: inset 1px 2px 4px rgba(0, 0, 0, 0.05);
                transition: all 0.12s ease;
                position: relative;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            /* Ultra Fluffy Plush Fur Blocks 🧸 */
            .bb-block {
                width: 100%;
                height: 100%;
                border-radius: 12px;
                box-sizing: border-box;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.05rem;
                user-select: none;
                /* Volumetric Plush Fur Halo & Shadow */
                box-shadow: inset 0 0 10px rgba(255,255,255,0.85), inset -2px -4px 6px rgba(0,0,0,0.2), 0 5px 12px rgba(0,0,0,0.18);
                outline: 2.5px dotted rgba(255, 255, 255, 0.9);
                outline-offset: -3px;
                transition: transform 0.12s ease, filter 0.12s ease;
                animation: bb-fur-pulse 3s infinite alternate ease-in-out;
            }
            
            @keyframes bb-fur-pulse {
                0% { transform: scale(1); }
                100% { transform: scale(1.02); }
            }

            /* Cute Plush Ears on Top Corners! */
            .bb-block::before {
                content: '';
                position: absolute;
                top: -4px;
                left: 2px;
                width: 8px;
                height: 8px;
                background: inherit;
                border-radius: 50% 50% 0 0;
                border: 1.5px solid rgba(255,255,255,0.9);
                box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
            }
            .bb-block::after {
                content: '';
                position: absolute;
                top: -4px;
                right: 2px;
                width: 8px;
                height: 8px;
                background: inherit;
                border-radius: 50% 50% 0 0;
                border: 1.5px solid rgba(255,255,255,0.9);
                box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
            }

            /* Plush Color Palettes */
            .bb-block-0 { background: radial-gradient(circle at 35% 35%, #ffb3c6, #ff4d8d); border: 2.5px solid #fff0f5; } /* Fluffy Bunny Pink 🐰 */
            .bb-block-1 { background: radial-gradient(circle at 35% 35%, #90e0ef, #0077b6); border: 2.5px solid #e0f7fa; } /* Fluffy Puppy Blue 🐶 */
            .bb-block-2 { background: radial-gradient(circle at 35% 35%, #fef08a, #d97706); border: 2.5px solid #fffbeb; } /* Fluffy Bear Yellow 🐻 */
            .bb-block-3 { background: radial-gradient(circle at 35% 35%, #86efac, #15803d); border: 2.5px solid #f0fdf4; } /* Fluffy Froggy Mint 🐸 */
            .bb-block-4 { background: radial-gradient(circle at 35% 35%, #e9d5ff, #7e22ce); border: 2.5px solid #faf5ff; } /* Fluffy Kitty Lavender 🐱 */
            .bb-block-5 { background: radial-gradient(circle at 35% 35%, #fed7aa, #c2410c); border: 2.5px solid #fff7ed; } /* Fluffy Fox Peach 🦊 */

            .bb-board-cell.preview-fit {
                box-shadow: inset 0 0 14px rgba(74, 222, 128, 0.95), 0 0 10px rgba(74, 222, 128, 0.6) !important;
                background: rgba(74, 222, 128, 0.35) !important;
                border-color: #22c55e !important;
            }
            .bb-board-cell.preview-fail {
                box-shadow: inset 0 0 14px rgba(248, 113, 113, 0.95) !important;
                background: rgba(248, 113, 113, 0.3) !important;
                border-color: #ef4444 !important;
            }

            .bb-dock-slot {
                width: 96px;
                height: 96px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.92);
                border: 3px dashed #ec4899;
                border-radius: 22px;
                box-shadow: 0 6px 16px rgba(236,72,153,0.15);
                cursor: pointer;
                transition: all 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .bb-dock-slot.has-piece:hover {
                background: #ffffff;
                transform: scale(1.08) translateY(-3px);
                box-shadow: 0 10px 24px rgba(236,72,153,0.3);
            }
            .bb-dock-slot.selected {
                background: rgba(251, 207, 232, 0.4);
                border: 3px solid #ec4899;
                box-shadow: 0 0 22px rgba(236, 72, 153, 0.55);
                transform: scale(1.12) translateY(-4px);
            }

            .bb-piece-grid {
                display: grid;
                gap: 3px;
            }
            .bb-mini-cell {
                width: 19px;
                height: 19px;
                border-radius: 6px;
                position: relative;
            }
            .bb-mini-cell.filled {
                box-shadow: inset 0 0 4px rgba(255,255,255,0.8), 0 2px 5px rgba(0,0,0,0.15);
                outline: 1.5px dotted rgba(255, 255, 255, 0.85);
                outline-offset: -2px;
            }

            @keyframes bb-blast {
                0% { transform: scale(1); filter: brightness(1.4); }
                40% { transform: scale(1.4); filter: brightness(1.8); opacity: 0.9; }
                100% { transform: scale(0); opacity: 0; }
            }
            .bb-blast-anim {
                animation: bb-blast 0.38s ease-out forwards !important;
            }

            @keyframes particle-fade {
                0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
                100% { transform: translate(var(--dx), var(--dy)) scale(0.3) rotate(180deg); opacity: 0; }
            }
            .bb-particle {
                position: absolute;
                pointer-events: none;
                font-size: 1.1rem;
                animation: particle-fade 0.68s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
                z-index: 99;
            }
        `;
        document.head.appendChild(styleEl);
    }

    const SHAPES = [
        { name: "single", grid: [[1]], colorIdx: 0 },
        { name: "h-2", grid: [[1, 1]], colorIdx: 1 },
        { name: "v-2", grid: [[1], [1]], colorIdx: 2 },
        { name: "h-3", grid: [[1, 1, 1]], colorIdx: 3 },
        { name: "v-3", grid: [[1], [1], [1]], colorIdx: 4 },
        { name: "square-2", grid: [[1, 1], [1, 1]], colorIdx: 5 },
        { name: "l-1", grid: [[1, 1], [1, 0]], colorIdx: 0 },
        { name: "l-2", grid: [[1, 1], [0, 1]], colorIdx: 1 },
        { name: "l-3", grid: [[1, 0], [1, 1]], colorIdx: 2 },
        { name: "l-4", grid: [[0, 1], [1, 1]], colorIdx: 3 },
        { name: "t-1", grid: [[0, 1, 0], [1, 1, 1]], colorIdx: 4 },
        { name: "z-1", grid: [[1, 1, 0], [0, 1, 1]], colorIdx: 5 }
    ];

    let board = Array(8).fill(null).map(() => Array(8).fill(null));
    let score = 0;
    let highVal = parseInt(localStorage.getItem('minikio_blockblast_high') || '0');
    
    let activePieces = [null, null, null];
    let selectedPieceIdx = null;

    function playSynthSound(type) {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const now = ctx.currentTime;
            
            if (type === 'click') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === 'place') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(750, now + 0.15);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
                osc.start(now);
                osc.stop(now + 0.18);
            } else if (type === 'blast') {
                for (let i = 0; i < 4; i++) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.setValueAtTime(900 - i * 160, now + i * 0.04);
                    osc.frequency.exponentialRampToValueAtTime(180, now + i * 0.04 + 0.14);
                    gain.gain.setValueAtTime(0.12, now + i * 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.14);
                    osc.start(now + i * 0.04);
                    osc.stop(now + i * 0.04 + 0.15);
                }
            } else if (type === 'error') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(140, now);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === 'gameover') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(280, now);
                osc.frequency.linearRampToValueAtTime(90, now + 0.6);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
                osc.start(now);
                osc.stop(now + 0.7);
            }
        } catch (e) {}
    }

    function initGame() {
        board = Array(8).fill(null).map(() => Array(8).fill(null));
        score = 0;
        selectedPieceIdx = null;
        activePieces = [null, null, null];
        
        container.innerHTML = `
            <div class="bb-dreamland-bg" style="max-width: 480px; margin: 0 auto; min-height: 520px; box-sizing: border-box;">
                <!-- Animated Floating Clouds inside Background -->
                <div class="bb-cloud" style="width: 70px; height: 24px; top: 15px; left: 0; animation: float-cloud-1 25s linear infinite;"></div>
                <div class="bb-cloud" style="width: 85px; height: 28px; top: 140px; left: 0; animation: float-cloud-2 30s linear infinite;"></div>
                
                <!-- Bubbly Scorecard Plate -->
                <div style="background: rgba(255, 255, 255, 0.9); border-radius: 20px; border: 3px solid #ffffff; box-shadow: 0 8px 20px rgba(0,0,0,0.05); padding: 8px 18px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 10;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #64748b; font-weight: 800; font-size: 0.95rem;">SKOR:</span>
                        <span id="bb-score" style="font-size: 1.5rem; font-weight: 900; color: #7c3aed;">0</span>
                    </div>
                    <div style="font-size: 0.95rem; color: #f59e0b; font-weight: 800; display: flex; align-items: center; gap: 4px;">
                        👑 REKOR: <span id="bb-high" style="color: #d97706; font-size:1.1rem; font-weight:900;">` + highVal + `</span>
                    </div>
                    <button id="bb-restart" class="btn btn-warning" style="padding: 5px 12px; font-size: 0.85rem; font-weight: 800; border-radius: 10px; border: 2.5px solid #d97706; box-shadow: 0 3px 0 #b45309;">YENİDEN</button>
                </div>

                <!-- Thick White Marshmallow Tray Frame -->
                <div style="background: rgba(255, 255, 255, 0.95); padding: 12px; border-radius: 28px; box-shadow: 0 16px 36px rgba(0,0,0,0.08); display: inline-block; border: 8px solid #ffffff; margin-bottom: 12px; position: relative; z-index: 10;">
                    <div id="bb-board" style="display: grid; grid-template-columns: repeat(8, 36px); grid-template-rows: repeat(8, 36px); gap: 5px; justify-content: center; position: relative;">
                        <!-- Generated Dynamically -->
                    </div>
                </div>

                <div style="font-size: 0.85rem; font-weight: 800; color: #475569; margin-bottom: 10px; position: relative; z-index: 10; text-shadow: 0 1px 2px rgba(255,255,255,0.8);">
                    Yerleştirmek istediğin bloğa dokun, ardından tahtada boş bir yere dokun!
                </div>

                <!-- Nesting Piece Baskets Dock -->
                <div style="display: flex; justify-content: center; align-items: center; gap: 15px; min-height: 100px; background: rgba(255, 255, 255, 0.9); border-radius: 22px; padding: 10px; border: 3px solid #ffffff; box-shadow: 0 8px 24px rgba(0,0,0,0.04); position: relative; z-index: 10;">
                    <div id="bb-dock-0" class="bb-dock-slot" data-idx="0"></div>
                    <div id="bb-dock-1" class="bb-dock-slot" data-idx="1"></div>
                    <div id="bb-dock-2" class="bb-dock-slot" data-idx="2"></div>
                </div>
            </div>
        `;

        // Bind restart button
        container.querySelector('#bb-restart').addEventListener('click', () => {
            playSynthSound('click');
            initGame();
        });

        // Generate Board Slots
        const boardEl = container.querySelector('#bb-board');
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cell = document.createElement('div');
                cell.className = 'bb-board-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                
                cell.addEventListener('mouseenter', () => handleCellMouseEnter(r, c));
                cell.addEventListener('mouseleave', () => clearBoardPreviews());
                cell.addEventListener('click', () => handleCellClick(r, c));
                
                boardEl.appendChild(cell);
            }
        }

        refillDockIfNeeded();

        container.querySelectorAll('.bb-dock-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                const idx = parseInt(slot.dataset.idx);
                if (!activePieces[idx]) return;
                playSynthSound('click');
                selectPiece(idx);
            });
        });
    }

    function selectPiece(idx) {
        selectedPieceIdx = idx;
        container.querySelectorAll('.bb-dock-slot').forEach((slot, sIdx) => {
            if (sIdx === idx) {
                slot.classList.add('selected');
            } else {
                slot.classList.remove('selected');
            }
        });
    }

    function clearBoardPreviews() {
        container.querySelectorAll('.bb-board-cell').forEach(cell => {
            cell.classList.remove('preview-fit', 'preview-fail');
        });
    }

    function checkFit(piece, targetRow, targetCol) {
        const pr = piece.grid.length;
        const pc = piece.grid[0].length;
        
        if (targetRow + pr > 8 || targetCol + pc > 8) return false;
        
        for (let r = 0; r < pr; r++) {
            for (let c = 0; c < pc; c++) {
                if (piece.grid[r][c] === 1) {
                    if (board[targetRow + r][targetCol + c] !== null) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function handleCellMouseEnter(row, col) {
        if (selectedPieceIdx === null) return;
        const piece = activePieces[selectedPieceIdx];
        if (!piece) return;

        clearBoardPreviews();

        const fits = checkFit(piece, row, col);
        const pr = piece.grid.length;
        const pc = piece.grid[0].length;

        for (let r = 0; r < pr; r++) {
            for (let c = 0; c < pc; c++) {
                if (piece.grid[r][c] === 1) {
                    const br = row + r;
                    const bc = col + c;
                    if (br < 8 && bc < 8) {
                        const cellEl = container.querySelector(`[data-row="${br}"][data-col="${bc}"]`);
                        if (cellEl) {
                            cellEl.classList.add(fits ? 'preview-fit' : 'preview-fail');
                        }
                    }
                }
            }
        }
    }

    function handleCellClick(row, col) {
        if (selectedPieceIdx === null) return;
        const piece = activePieces[selectedPieceIdx];
        if (!piece) return;

        const fits = checkFit(piece, row, col);
        if (!fits) {
            playSynthSound('error');
            const boardParent = container.querySelector('#bb-board').parentElement;
            boardParent.style.transform = 'translateX(5px)';
            setTimeout(() => boardParent.style.transform = 'translateX(-5px)', 50);
            setTimeout(() => boardParent.style.transform = 'translateX(0)', 100);
            return;
        }

        playSynthSound('place');
        const pr = piece.grid.length;
        const pc = piece.grid[0].length;
        
        for (let r = 0; r < pr; r++) {
            for (let c = 0; c < pc; c++) {
                if (piece.grid[r][c] === 1) {
                    const br = row + r;
                    const bc = col + c;
                    
                    board[br][bc] = {
                        colorIdx: piece.colorIdx
                    };
                }
            }
        }

        let pieceBlockCount = 0;
        piece.grid.forEach(row => row.forEach(val => { if (val === 1) pieceBlockCount++; }));
        score += pieceBlockCount * 2;

        activePieces[selectedPieceIdx] = null;
        const slotEl = container.querySelector(`#bb-dock-${selectedPieceIdx}`);
        slotEl.innerHTML = '';
        slotEl.className = 'bb-dock-slot';
        slotEl.classList.remove('selected', 'has-piece');
        
        selectedPieceIdx = null;
        clearBoardPreviews();
        
        renderBoardCells();
        checkAndBlastLines();
    }

    const FURRY_BLOCK_IMAGES = [
        'assets/images/furry_block_0.jpg',
        'assets/images/furry_block_1.jpg',
        'assets/images/furry_block_2.jpg',
        'assets/images/furry_block_3.jpg',
        'assets/images/furry_block_4.jpg',
        'assets/images/furry_block_5.jpg'
    ];

    function createFluffyFurBlockImageElement(colorIdx, size = 36) {
        const img = document.createElement('img');
        img.src = FURRY_BLOCK_IMAGES[colorIdx % FURRY_BLOCK_IMAGES.length];
        img.style.width = size + 'px';
        img.style.height = size + 'px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '10px';
        img.style.display = 'block';
        img.style.boxShadow = '0 4px 8px rgba(0,0,0,0.22), inset 0 0 6px rgba(255,255,255,0.7)';
        img.style.border = '2px solid rgba(255,255,255,0.9)';
        img.style.boxSizing = 'border-box';
        img.style.userSelect = 'none';
        img.style.pointerEvents = 'none';
        return img;
    }

    function renderBoardCells() {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cellEl = container.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                cellEl.innerHTML = '';
                
                const val = board[r][c];
                if (val !== null) {
                    const blockImg = createFluffyFurBlockImageElement(val.colorIdx, 36);
                    cellEl.appendChild(blockImg);
                }
            }
        }
        
        container.querySelector('#bb-score').innerText = score;
        if (score > highVal) {
            highVal = score;
            localStorage.setItem('minikio_blockblast_high', highVal);
            container.querySelector('#bb-high').innerText = highVal;
        }
    }

    function spawnBlastParticles(r, c) {
        const boardEl = container.querySelector('#bb-board');
        const cellEl = container.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        if (!cellEl) return;
        
        const rect = cellEl.getBoundingClientRect();
        const boardRect = boardEl.getBoundingClientRect();
        const left = rect.left - boardRect.left + 18;
        const top = rect.top - boardRect.top + 18;
        
        const particleIcons = ["✨", "🧸", "💖", "🌸", "🐰", "⭐"];
        
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'bb-particle';
            particle.innerText = particleIcons[Math.floor(Math.random() * particleIcons.length)];
            particle.style.left = left + 'px';
            particle.style.top = top + 'px';
            
            const dx = (Math.random() - 0.5) * 80;
            const dy = (Math.random() - 0.5) * 80;
            
            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');
            
            boardEl.appendChild(particle);
            
            setTimeout(() => particle.remove(), 700);
        }
    }

    function checkAndBlastLines() {
        let rowsToBlast = [];
        let colsToBlast = [];

        for (let r = 0; r < 8; r++) {
            let rowFull = true;
            for (let c = 0; c < 8; c++) {
                if (board[r][c] === null) {
                    rowFull = false;
                    break;
                }
            }
            if (rowFull) rowsToBlast.push(r);
        }

        for (let c = 0; c < 8; c++) {
            let colFull = true;
            for (let r = 0; r < 8; r++) {
                if (board[r][c] === null) {
                    colFull = false;
                    break;
                }
            }
            if (colFull) colsToBlast.push(c);
        }

        if (rowsToBlast.length > 0 || colsToBlast.length > 0) {
            playSynthSound('blast');
            
            let cellsToAnim = new Set();
            rowsToBlast.forEach(r => {
                for (let c = 0; c < 8; c++) cellsToAnim.add(`${r},${c}`);
            });
            colsToBlast.forEach(c => {
                for (let r = 0; r < 8; r++) cellsToAnim.add(`${r},${c}`);
            });

            cellsToAnim.forEach(coordStr => {
                const parts = coordStr.split(',');
                const r = parseInt(parts[0]);
                const c = parseInt(parts[1]);
                const cellEl = container.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                const child = cellEl.querySelector('.bb-block');
                if (child) {
                    child.classList.add('bb-blast-anim');
                }
                
                spawnBlastParticles(r, c);
            });

            setTimeout(() => {
                cellsToAnim.forEach(coordStr => {
                    const parts = coordStr.split(',');
                    const r = parseInt(parts[0]);
                    const c = parseInt(parts[1]);
                    board[r][c] = null;
                });
                
                const totalLines = rowsToBlast.length + colsToBlast.length;
                score += totalLines * 80 + (totalLines - 1) * 40;
                
                renderBoardCells();
                refillDockIfNeeded();
                checkGameOver();
            }, 360);
        } else {
            refillDockIfNeeded();
            checkGameOver();
        }
    }

    function refillDockIfNeeded() {
        const slotsEmpty = activePieces.every(p => p === null);
        if (slotsEmpty) {
            for (let i = 0; i < 3; i++) {
                const randShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
                activePieces[i] = randShape;
                renderDockPiece(i, randShape);
            }
        }
    }

    function renderDockPiece(slotIdx, shape) {
        const slotEl = container.querySelector(`#bb-dock-${slotIdx}`);
        slotEl.innerHTML = '';
        slotEl.className = 'bb-dock-slot has-piece';
        slotEl.classList.remove('selected');

        const pr = shape.grid.length;
        const pc = shape.grid[0].length;

        const gridContainer = document.createElement('div');
        gridContainer.className = 'bb-piece-grid';
        gridContainer.style.gridTemplateColumns = `repeat(${pc}, 18px)`;
        gridContainer.style.gridTemplateRows = `repeat(${pr}, 18px)`;

        for (let r = 0; r < pr; r++) {
            for (let c = 0; c < pc; c++) {
                if (shape.grid[r][c] === 1) {
                    const miniImg = createFluffyFurBlockImageElement(shape.colorIdx, 18);
                    gridContainer.appendChild(miniImg);
                } else {
                    const empty = document.createElement('div');
                    empty.style.width = '18px';
                    empty.style.height = '18px';
                    gridContainer.appendChild(empty);
                }
            }
        }

        slotEl.appendChild(gridContainer);
    }

    function checkGameOver() {
        let hasMoves = false;
        
        for (let i = 0; i < 3; i++) {
            const piece = activePieces[i];
            if (piece) {
                if (canPieceFitAnywhere(piece)) {
                    hasMoves = true;
                    break;
                }
            }
        }

        const hasPiecesInDock = activePieces.some(p => p !== null);
        if (hasPiecesInDock && !hasMoves) {
            triggerGameOver();
        }
    }

    function canPieceFitAnywhere(piece) {
        const pr = piece.grid.length;
        const pc = piece.grid[0].length;
        
        for (let r = 0; r <= 8 - pr; r++) {
            for (let c = 0; c <= 8 - pc; c++) {
                let fits = true;
                for (let i = 0; i < pr; i++) {
                    for (let j = 0; j < pc; j++) {
                        if (piece.grid[i][j] === 1) {
                            if (board[r + i][c + j] !== null) {
                                fits = false;
                                break;
                            }
                        }
                    }
                    if (!fits) break;
                }
                if (fits) return true;
            }
        }
        return false;
    }

    function triggerGameOver() {
        playSynthSound('gameover');
        
        setTimeout(() => {
            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.inset = '0';
            overlay.style.background = 'rgba(15,23,42,0.96)';
            overlay.style.display = 'flex';
            overlay.style.flexDirection = 'column';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.color = 'white';
            overlay.style.zIndex = '150';
            overlay.style.borderRadius = '20px';

            overlay.innerHTML = `
                <div style="font-size: 5rem; margin-bottom:15px; animation: bounce-loop 2s infinite;">😢🧸</div>
                <h2 style="color:#fdffb6; font-size:2.3rem; margin-bottom:5px; text-shadow:0 0 10px rgba(253,255,182,0.5);">HAMLE KALMADI!</h2>
                <p style="color:#cbd5e1; font-size:1.1rem; margin-bottom:15px;">Blokları yerleştirecek boş alan kalmadı.</p>
                <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:15px;">Elde Ettiğin Skor: <strong>${score}</strong> | En Yüksek: <strong>${highVal}</strong></p>
                <button class="btn btn-warning" id="btn-bb-retry" style="font-size:1.2rem; padding:10px 30px; font-weight:bold; border-radius:10px;">TEKRAR DENE</button>
            `;

            const containerGame = container.querySelector('.bb-dreamland-bg');
            containerGame.style.position = 'relative';
            containerGame.appendChild(overlay);

            document.getElementById('btn-bb-retry').addEventListener('click', () => {
                playSynthSound('click');
                initGame();
            });
        }, 500);
    }

    function cleanup() {
    }

    window.currentGameCleanup = cleanup;
    initGame();
};

// ============================================================
// OYUN 22: HEDEF VURMA (OKÇULUK / ARCHERY CHALLENGE)
// ============================================================
window.startTargetShooterGame = function(container, levelNumber) {
    if (!document.getElementById('archery-game-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'archery-game-styles';
        styleEl.innerHTML = `
            .archery-container {
                max-width: 520px;
                margin: 0 auto;
                user-select: none;
                text-align: center;
                position: relative;
            }
            .archery-hud {
                background: #ffffff;
                border-radius: 18px;
                border: 3px solid #e2e8f0;
                box-shadow: 0 6px 15px rgba(0,0,0,0.06);
                padding: 8px 14px;
                margin-bottom: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: 800;
            }
            .archery-canvas-wrap {
                position: relative;
                width: 100%;
                border-radius: 24px;
                border: 6px solid #ffffff;
                box-shadow: 0 16px 36px rgba(0,0,0,0.12);
                overflow: hidden;
                background: linear-gradient(180deg, #7dd3fc 0%, #e0f2fe 55%, #86efac 55%, #4ade80 100%);
            }
            #archery-canvas {
                display: block;
                width: 100%;
                height: 380px;
                cursor: crosshair;
                touch-action: none;
            }
            .archery-overlay {
                position: absolute;
                inset: 0;
                background: rgba(15,23,42,0.92);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 100;
                color: white;
                padding: 20px;
                border-radius: 18px;
            }
        `;
        document.head.appendChild(styleEl);
    }

    let score = 0;
    let highVal = parseInt(localStorage.getItem('minikio_archery_high') || '0');
    let currentStage = levelNumber || 1;
    
    // Level Targets & Arrow configuration
    let targetScore = 20 + currentStage * 12; // Level 1: 32, Level 2: 44, Level 3: 56...
    let totalArrows = Math.max(7, 10 - Math.floor((currentStage - 1) * 0.5));
    let arrowsLeft = totalArrows;

    // Canvas & State
    let canvas, ctx;
    let animFrameId = null;
    
    // Bow position & Dragging
    const bowPos = { x: 50, y: 190 };
    let dragStart = null;
    let currentDrag = null;
    let isDragging = false;
    
    let activeArrow = null;
    let stuckArrows = [];
    
    // Targets configuration based on stage (Mesafe Uzasın & Hedef Artsın)
    let targets = [];
    
    function initTargetsForStage() {
        targets = [];
        
        // Target Distance increases with level: Level 1 -> x: 380, Level 2 -> x: 420, Level 3+ -> x: 450
        const distanceX = Math.min(455, 380 + (currentStage - 1) * 25);
        const baseRadius = Math.max(28, 44 - (currentStage - 1) * 3);

        // Target 1 (Primary Target)
        targets.push({
            id: 1,
            x: distanceX,
            y: 190,
            radius: baseRadius,
            vy: currentStage === 1 ? 0 : 1.5 + (currentStage - 1) * 0.5,
            minY: 70,
            maxY: 300,
            direction: 1,
            isGolden: false
        });

        // Target 2 (Added from Level 3 onwards - Hedef Artsın!)
        if (currentStage >= 3) {
            targets.push({
                id: 2,
                x: distanceX - 45,
                y: 120,
                radius: Math.max(22, baseRadius - 8),
                vy: 2.5 + (currentStage - 3) * 0.4,
                minY: 60,
                maxY: 310,
                direction: -1,
                isGolden: true
            });
        }
    }
    
    // Wind factor
    let wind = 0;

    function playSynthSound(type) {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const now = ctx.currentTime;
            
            if (type === 'pull') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(320, now + 0.1);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'shoot') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(500, now);
                osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
                osc.start(now);
                osc.stop(now + 0.16);
            } else if (type === 'hit') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'square';
                osc.frequency.setValueAtTime(180, now);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.09);
            } else if (type === 'bullseye') {
                [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                    gain.gain.setValueAtTime(0.2, now + idx * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
                    osc.start(now + idx * 0.08);
                    osc.stop(now + idx * 0.08 + 0.2);
                });
            } else if (type === 'miss') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(140, now);
                osc.frequency.linearRampToValueAtTime(80, now + 0.2);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                osc.start(now);
                osc.stop(now + 0.22);
            }
        } catch (e) {}
    }

    function initUI() {
        score = 0;
        targetScore = 20 + currentStage * 12;
        totalArrows = Math.max(7, 10 - Math.floor((currentStage - 1) * 0.5));
        arrowsLeft = totalArrows;
        stuckArrows = [];
        activeArrow = null;
        isDragging = false;
        
        container.innerHTML = `
            <div class="archery-container">
                <!-- Scoreboard Header -->
                <div class="archery-hud">
                    <div style="color: #4338ca; font-size: 0.9rem;">
                        🏆 SEVİYE <strong>${currentStage}</strong>
                    </div>
                    <div style="color: #7c3aed; font-size: 1.15rem;">
                        🎯 SKOR: <span id="archery-score">0</span> / <strong>${targetScore}</strong>
                    </div>
                    <div style="color: #0284c7; font-size: 0.95rem;" id="archery-wind">
                        💨 RÜZGAR: 0.0
                    </div>
                    <div style="color: #ef4444; font-size: 1.1rem;" id="archery-arrows">
                        🏹 x${arrowsLeft}
                    </div>
                    <button id="archery-restart" class="btn btn-warning" style="padding: 4px 10px; font-size: 0.8rem; font-weight: 800; border-radius: 8px;">🔄 REKOR: ${highVal}</button>
                </div>

                <!-- Canvas Arena -->
                <div class="archery-canvas-wrap">
                    <canvas id="archery-canvas" width="500" height="380"></canvas>

                    <!-- Start Overlay -->
                    <div id="archery-start-overlay" class="archery-overlay">
                        <div style="font-size: 4rem; margin-bottom: 10px; animation: bounce-loop 2s infinite;">🏹🎯</div>
                        <h2 style="color: #fdffb6; font-size: 2.1rem; margin-bottom: 6px;">SEVİYE ${currentStage}</h2>
                        <p style="color: #cbd5e1; font-size: 0.95rem; max-width: 330px; line-height: 1.4; margin-bottom: 16px;">
                            Geçmek için en az <strong>${targetScore} Puan</strong> topla!<br>
                            ${currentStage >= 3 ? '⚡ <strong>2 Tane Hareketli Hedef Tahtası Var!</strong>' : currentStage > 1 ? '🎯 <strong>Mesafe Uzadı ve Hedef Hareket Ediyor!</strong>' : 'Yayı ger ve oku fırlat!'}
                        </p>
                        <button id="btn-archery-start" class="btn btn-success" style="font-size: 1.25rem; padding: 12px 35px; border-radius: 12px; font-weight: 900;">OYUNA BAŞLAR</button>
                    </div>
                </div>
            </div>
        `;

        canvas = container.querySelector('#archery-canvas');
        ctx = canvas.getContext('2d');

        container.querySelector('#btn-archery-start').addEventListener('click', () => {
            if (window.playSound) window.playSound('click');
            container.querySelector('#archery-start-overlay').style.display = 'none';
            startGame();
        });

        container.querySelector('#archery-restart').addEventListener('click', () => {
            if (window.playSound) window.playSound('click');
            cleanup();
            initUI();
        });
    }

    function setupWind() {
        if (currentStage === 1) {
            wind = 0;
        } else {
            wind = (Math.random() * (2 + currentStage * 0.5) - (1 + currentStage * 0.25)).toFixed(1);
        }
        const windEl = container.querySelector('#archery-wind');
        if (windEl) {
            const dir = wind > 0 ? '➔' : wind < 0 ? '⬅' : '●';
            windEl.innerText = `💨 RÜZGAR: ${dir} ${Math.abs(wind)}`;
        }
    }

    function startGame() {
        score = 0;
        arrowsLeft = totalArrows;
        stuckArrows = [];
        activeArrow = null;
        isDragging = false;
        
        initTargetsForStage();
        setupWind();
        updateHUD();

        bindEvents();
        if (animFrameId) cancelAnimationFrame(animFrameId);
        gameLoop();
    }

    function updateHUD() {
        const scoreEl = container.querySelector('#archery-score');
        const arrowsEl = container.querySelector('#archery-arrows');
        if (scoreEl) scoreEl.innerHTML = `${score}`;
        if (arrowsEl) arrowsEl.innerText = `🏹 x${arrowsLeft}`;
    }

    function getCanvasCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function bindEvents() {
        const handleStart = (e) => {
            if (arrowsLeft <= 0 || activeArrow) return;
            const coords = getCanvasCoords(e);
            dragStart = { x: coords.x, y: coords.y };
            currentDrag = { x: coords.x, y: coords.y };
            isDragging = true;
            playSynthSound('pull');
        };

        const handleMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            currentDrag = getCanvasCoords(e);
        };

        const handleEnd = (e) => {
            if (!isDragging) return;
            isDragging = false;

            const dx = dragStart.x - currentDrag.x;
            const dy = dragStart.y - currentDrag.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 15 && arrowsLeft > 0) {
                // Shoot arrow!
                const power = Math.min(dist * 0.18, 17);
                const angle = Math.atan2(dy, dx);
                
                activeArrow = {
                    x: bowPos.x,
                    y: bowPos.y,
                    vx: Math.cos(angle) * power,
                    vy: Math.sin(angle) * power,
                    angle: angle
                };
                
                arrowsLeft--;
                updateHUD();
                playSynthSound('shoot');
            }
        };

        canvas.addEventListener('mousedown', handleStart);
        canvas.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);

        canvas.addEventListener('touchstart', handleStart, { passive: false });
        canvas.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
    }

    let popups = [];

    function addPopupText(text, x, y, color) {
        popups.push({ text, x, y, color, opacity: 1, scale: 1.2, life: 45 });
    }

    function update() {
        // Move Targets
        targets.forEach(t => {
            if (t.vy !== 0) {
                t.y += t.vy * t.direction;
                if (t.y > t.maxY) {
                    t.y = t.maxY;
                    t.direction = -1;
                } else if (t.y < t.minY) {
                    t.y = t.minY;
                    t.direction = 1;
                }
            }
        });

        // Active Arrow Flight
        if (activeArrow) {
            activeArrow.x += activeArrow.vx;
            activeArrow.y += activeArrow.vy;
            activeArrow.vy += 0.22; // Gravity
            activeArrow.vx += parseFloat(wind) * 0.015; // Wind drift
            activeArrow.angle = Math.atan2(activeArrow.vy, activeArrow.vx);

            // Check Collision with all active targets
            let hitTargetObj = null;

            for (let t of targets) {
                const dx = activeArrow.x - t.x;
                const dy = activeArrow.y - t.y;
                const dist = Math.hypot(dx, dy);

                if (dist <= t.radius && activeArrow.x >= t.x - 10) {
                    hitTargetObj = { target: t, dist: dist };
                    break;
                }
            }

            if (hitTargetObj) {
                const t = hitTargetObj.target;
                const dist = hitTargetObj.dist;

                let pts = 0;
                let text = '';
                let color = '#ffffff';

                const r = t.radius;
                const bullseyeR = r * 0.22;
                const ring1R = r * 0.48;
                const ring2R = r * 0.74;

                if (dist <= bullseyeR) {
                    pts = t.isGolden ? 15 : 10;
                    text = t.isGolden ? '🌟 ALTIN TAM İSABET! +15' : '🎯 TAM İSABET! +10';
                    color = '#facc15';
                    arrowsLeft++; // Bonus arrow on bullseye!
                    playSynthSound('bullseye');
                } else if (dist <= ring1R) {
                    pts = t.isGolden ? 12 : 8;
                    text = '✨ HARİKA! +' + pts;
                    color = '#ef4444';
                    playSynthSound('hit');
                } else if (dist <= ring2R) {
                    pts = t.isGolden ? 8 : 5;
                    text = '👍 İYİ! +' + pts;
                    color = '#3b82f6';
                    playSynthSound('hit');
                } else {
                    pts = 3;
                    text = '🎯 İSABET! +3';
                    color = '#ffffff';
                    playSynthSound('hit');
                }

                score += pts;
                updateHUD();
                addPopupText(text, activeArrow.x - 20, activeArrow.y - 20, color);

                // Stick arrow relative to hit target
                stuckArrows.push({
                    targetId: t.id,
                    relX: activeArrow.x - t.x,
                    relY: activeArrow.y - t.y,
                    angle: activeArrow.angle
                });

                activeArrow = null;
                setupWind();
                checkGameOver();
            } else if (activeArrow.x > canvas.width + 50 || activeArrow.y > canvas.height + 50) {
                // Miss
                addPopupText('❌ ISKA!', activeArrow.x < canvas.width ? activeArrow.x : canvas.width - 60, canvas.height - 50, '#f87171');
                playSynthSound('miss');
                activeArrow = null;
                setupWind();
                checkGameOver();
            }
        }

        // Update Popups
        popups.forEach((p) => {
            p.y -= 0.8;
            p.opacity -= 0.022;
            p.life--;
        });
        popups = popups.filter(p => p.life > 0);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Environment Background details
        // Sun
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(420, 55, 35, 0, Math.PI * 2);
        ctx.fill();

        // Clouds
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(100, 50, 20, 0, Math.PI * 2);
        ctx.arc(125, 45, 26, 0, Math.PI * 2);
        ctx.arc(150, 50, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(280, 80, 16, 0, Math.PI * 2);
        ctx.arc(300, 75, 22, 0, Math.PI * 2);
        ctx.arc(320, 80, 16, 0, Math.PI * 2);
        ctx.fill();

        // Ground Stand / Grass details
        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, 310, canvas.width, 70);

        // Draw Targets
        targets.forEach(t => {
            const tx = t.x;
            const ty = t.y;
            const r = t.radius;

            // Wooden Stand Pole
            ctx.fillStyle = t.isGolden ? '#a16207' : '#78350f';
            ctx.fillRect(tx - 4, ty, 8, 310 - ty);

            // Target Rings
            const rings = t.isGolden ? [
                { r: r, color: '#fef08a' },
                { r: r * 0.74, color: '#eab308' },
                { r: r * 0.48, color: '#ca8a04' },
                { r: r * 0.22, color: '#ffffff' }
            ] : [
                { r: r, color: '#ffffff' },
                { r: r * 0.74, color: '#0284c7' },
                { r: r * 0.48, color: '#ef4444' },
                { r: r * 0.22, color: '#facc15' }
            ];

            rings.forEach(ring => {
                ctx.fillStyle = ring.color;
                ctx.beginPath();
                ctx.arc(tx, ty, ring.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            });

            // Draw Stuck Arrows for this target
            stuckArrows.filter(sa => sa.targetId === t.id).forEach(arr => {
                const ax = tx + arr.relX;
                const ay = ty + arr.relY;
                drawArrow(ax, ay, arr.angle);
            });
        });

        // Draw Bow & Aim Trajectory Line
        drawBow();

        // Draw Flying Active Arrow
        if (activeArrow) {
            drawArrow(activeArrow.x, activeArrow.y, activeArrow.angle);
        }

        // Draw Popups
        popups.forEach(p => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.font = '900 18px sans-serif';
            ctx.fillStyle = p.color;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.fillText(p.text, p.x, p.y);
            ctx.restore();
        });
    }

    function drawBow() {
        const bx = bowPos.x;
        const by = bowPos.y;

        let pullDx = 0;
        let pullDy = 0;

        if (isDragging && dragStart && currentDrag) {
            pullDx = dragStart.x - currentDrag.x;
            pullDy = dragStart.y - currentDrag.y;
            
            // Limit pull distance
            const dist = Math.hypot(pullDx, pullDy);
            const maxDist = 70;
            if (dist > maxDist) {
                pullDx = (pullDx / dist) * maxDist;
                pullDy = (pullDy / dist) * maxDist;
            }

            // Draw Trajectory Dots
            const power = Math.min(dist * 0.18, 17);
            const angle = Math.atan2(pullDy, pullDx);
            let simX = bx;
            let simY = by;
            let simVx = Math.cos(angle) * power;
            let simVy = Math.sin(angle) * power;

            ctx.fillStyle = 'rgba(255,255,255,0.75)';
            for (let i = 0; i < 18; i++) {
                simX += simVx;
                simY += simVy;
                simVy += 0.22; // Gravity
                simVx += parseFloat(wind) * 0.015;

                ctx.beginPath();
                ctx.arc(simX, simY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Wood Bow Limb Curve
        ctx.save();
        ctx.translate(bx, by);
        const bowAngle = (isDragging && (pullDx !== 0 || pullDy !== 0)) ? Math.atan2(pullDy, pullDx) : 0;
        ctx.rotate(bowAngle);

        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(-10, 0, 35, -Math.PI / 2.2, Math.PI / 2.2);
        ctx.stroke();

        // String
        const notchX = -Math.hypot(pullDx, pullDy) * 0.5 - 5;
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10 - Math.cos(-Math.PI / 2.2) * 35, Math.sin(-Math.PI / 2.2) * 35);
        ctx.lineTo(notchX, 0);
        ctx.lineTo(-10 - Math.cos(Math.PI / 2.2) * 35, Math.sin(Math.PI / 2.2) * 35);
        ctx.stroke();

        // Nocked Arrow before shoot
        if (isDragging && arrowsLeft > 0) {
            drawArrow(notchX, 0, 0);
        }

        ctx.restore();
    }

    function drawArrow(x, y, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Shaft
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.lineTo(15, 0);
        ctx.stroke();

        // Arrowhead
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(15, -4);
        ctx.lineTo(24, 0);
        ctx.lineTo(15, 4);
        ctx.closePath();
        ctx.fill();

        // Feathers
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.lineTo(-32, -6);
        ctx.lineTo(-24, 0);
        ctx.lineTo(-32, 6);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    function checkGameOver() {
        // If target score reached: WIN immediately or after arrow finishes
        if (score >= targetScore) {
            setTimeout(() => {
                endGame(true);
            }, 500);
            return;
        }

        // If no arrows left and no active arrow in flight: LOST LEVEL
        if (arrowsLeft <= 0 && !activeArrow) {
            setTimeout(() => {
                endGame(false);
            }, 600);
        }
    }

    function endGame(isWon) {
        if (score > highVal) {
            highVal = score;
            localStorage.setItem('minikio_archery_high', highVal);
        }

        if (isWon) {
            playSynthSound('bullseye');
            if (window.updateStats) window.updateStats(score, 1);
        } else {
            playSynthSound('miss');
        }

        const overlay = document.createElement('div');
        overlay.className = 'archery-overlay';
        overlay.style.zIndex = '150';

        if (isWon) {
            overlay.innerHTML = `
                <div style="font-size: 4.5rem; margin-bottom: 12px; animation: bounce-loop 2s infinite;">🏆🏹</div>
                <h2 style="color: #fdffb6; font-size: 2.3rem; margin-bottom: 5px;">SEVİYE ${currentStage} TAMAMLANDI!</h2>
                <p style="color: #cbd5e1; font-size: 1.1rem; margin-bottom: 12px;">Hedeflenen <strong>${targetScore} Puana</strong> ulaştın!</p>
                <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 18px;">Elde Ettiğin Skor: <strong>${score}</strong> | Rekor: <strong>${highVal}</strong></p>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-warning" id="btn-archery-retry" style="font-size: 1.1rem; padding: 10px 20px; font-weight: 900; border-radius: 10px;">TEKRAR OYNA</button>
                    <button class="btn btn-success" id="btn-archery-next" style="font-size: 1.1rem; padding: 10px 22px; font-weight: 900; border-radius: 10px;">SONRAKİ SEVİYE (${currentStage + 1}) ➔</button>
                </div>
            `;
        } else {
            overlay.innerHTML = `
                <div style="font-size: 4.5rem; margin-bottom: 12px; animation: bounce-loop 2s infinite;">😢🏹</div>
                <h2 style="color: #f87171; font-size: 2.2rem; margin-bottom: 5px;">OKLAR BİTTİ!</h2>
                <p style="color: #cbd5e1; font-size: 1.05rem; margin-bottom: 12px;">Hedeflenen <strong>${targetScore} Puana</strong> ulaşamadın (Skor: ${score}).</p>
                <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 18px;">💡 İpucu: Tam merkezden vurarak (Tam İsabet) ekstra ok kazanabilirsin!</p>
                <button class="btn btn-warning" id="btn-archery-retry" style="font-size: 1.2rem; padding: 10px 30px; font-weight: 900; border-radius: 10px;">TEKRAR DENE</button>
            `;
        }

        const wrap = container.querySelector('.archery-canvas-wrap');
        wrap.appendChild(overlay);

        const retryBtn = document.getElementById('btn-archery-retry');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                cleanup();
                initUI();
                startGame();
            });
        }

        const nextBtn = document.getElementById('btn-archery-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentStage++;
                cleanup();
                initUI();
                startGame();
            });
        }
    }

    function gameLoop() {
        update();
        draw();
        animFrameId = requestAnimationFrame(gameLoop);
    }

    function cleanup() {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        isDragging = false;
        activeArrow = null;
        popups = [];
    }

    window.currentGameCleanup = cleanup;
    initUI();
};

// ============================================================
// OYUN 23: GALAKTİK KRİSTAL ŞEKERLER (UNIQUE MATCH-3)
// ============================================================
window.startGalacticCandyGame = function(container, levelNumber) {
    if (!document.getElementById('gc-game-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'gc-game-styles';
        styleEl.innerHTML = `
            .gc-wrapper {
                max-width: 500px;
                margin: 0 auto;
                user-select: none;
                text-align: center;
                position: relative;
            }
            .gc-hud {
                background: rgba(15, 23, 42, 0.88);
                backdrop-filter: blur(12px);
                border-radius: 18px;
                border: 2px solid rgba(168, 85, 247, 0.35);
                box-shadow: 0 8px 24px rgba(0,0,0,0.35);
                padding: 8px 14px;
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: white;
                font-weight: 800;
            }
            .gc-map-wrap {
                position: relative;
                width: 100%;
                height: 420px;
                background: linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
                border-radius: 24px;
                border: 4px solid #a855f7;
                box-shadow: 0 16px 40px rgba(168, 85, 247, 0.25);
                overflow-y: auto;
                padding: 20px 10px;
                box-sizing: border-box;
            }
            .gc-map-path {
                display: flex;
                flex-direction: column-reverse;
                align-items: center;
                gap: 24px;
                padding-bottom: 20px;
            }
            .gc-map-node {
                width: 65px;
                height: 65px;
                border-radius: 50%;
                background: linear-gradient(135deg, #a855f7, #6b21a8);
                border: 3px solid #ffffff;
                box-shadow: 0 0 15px rgba(168, 85, 247, 0.6);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 900;
                font-size: 1.1rem;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                position: relative;
            }
            .gc-map-node:hover {
                transform: scale(1.12);
                box-shadow: 0 0 25px rgba(253, 224, 71, 0.8);
            }
            .gc-map-node.locked {
                background: #334155;
                border-color: #64748b;
                box-shadow: none;
                cursor: not-allowed;
                opacity: 0.6;
            }
            .gc-map-node .stars {
                font-size: 0.75rem;
                margin-top: -2px;
            }
            .gc-grid-wrap {
                position: relative;
                width: 100%;
                background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
                border-radius: 24px;
                border: 4px solid #a855f7;
                box-shadow: 0 16px 40px rgba(168, 85, 247, 0.25);
                padding: 10px;
                box-sizing: border-box;
                overflow: hidden;
            }
            .gc-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 5px;
                width: 100%;
                aspect-ratio: 1 / 1;
                touch-action: none;
            }
            .gc-tile {
                background: rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                border: 1.5px solid rgba(255, 255, 255, 0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.75rem;
                cursor: pointer;
                transition: transform 0.15s ease, background-color 0.15s, border-color 0.15s;
                position: relative;
                box-shadow: inset 0 2px 4px rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.3);
            }
            .gc-tile.has-ice {
                background: linear-gradient(135deg, rgba(186,230,253,0.7), rgba(56,189,248,0.5)) !important;
                border: 2px solid #bae6fd !important;
                box-shadow: inset 0 0 10px rgba(255,255,255,0.8), 0 0 12px rgba(56,189,248,0.5);
            }
            .gc-tile.has-ice::after {
                content: "🧊";
                position: absolute;
                bottom: 1px;
                right: 1px;
                font-size: 0.8rem;
                opacity: 0.9;
                pointer-events: none;
            }
            .gc-tile.has-vine {
                border: 2.5px dashed #4ade80 !important;
                box-shadow: inset 0 0 12px rgba(74,222,128,0.5) !important;
            }
            .gc-tile.has-vine::before {
                content: "🌿";
                position: absolute;
                top: 1px;
                left: 1px;
                font-size: 0.8rem;
                pointer-events: none;
            }
            .gc-tile.special-rainbow {
                border-color: #fde047 !important;
                box-shadow: 0 0 20px #f472b6, inset 0 0 12px #38bdf8 !important;
                animation: gc-rainbow-glow 1.2s infinite alternate ease-in-out;
            }
            @keyframes gc-rainbow-glow {
                0% { transform: scale(1); filter: hue-rotate(0deg); }
                100% { transform: scale(1.1); filter: hue-rotate(360deg); }
            }
            .gc-tile:hover {
                transform: scale(1.06);
            }
            .gc-tile.selected {
                border-color: #fde047 !important;
                box-shadow: 0 0 16px #fde047, inset 0 0 10px #fde047 !important;
                transform: scale(1.1);
                animation: gc-pulse 1s infinite alternate;
                z-index: 10;
            }
            @keyframes gc-pulse {
                0% { transform: scale(1.05); }
                100% { transform: scale(1.12); }
            }
            .gc-tile.match-pop {
                animation: gc-pop 0.25s ease-out forwards;
            }
            @keyframes gc-pop {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.35) rotate(15deg); opacity: 0.8; }
                100% { transform: scale(0); opacity: 0; }
            }
            .gc-overlay {
                position: absolute;
                inset: 0;
                background: rgba(15,23,42,0.94);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 100;
                color: white;
                padding: 20px;
                border-radius: 20px;
            }
        `;
        document.head.appendChild(styleEl);
    }

    // Load Saga Progress (maxUnlockedLevel, starsPerLevel)
    let sagaProgress = JSON.parse(localStorage.getItem('minikio_candy_saga_progress') || '{"maxLevel":1,"stars":{}}');
    let highVal = parseInt(localStorage.getItem('minikio_candy_high') || '0');
    
    let currentLevel = levelNumber || sagaProgress.maxLevel || 1;
    let viewMode = 'map'; // 'map' or 'game'

    let score = 0;
    let movesLeft = 18;
    
    // Level Objectives state
    let targetConfig = {
        scoreGoal: 1000,
        iceGoal: 0,
        vineGoal: 0,
        currentIce: 0,
        currentVine: 0
    };

    const GRID_SIZE = 7;
    let grid = []; // 7x7 cell objects
    let selectedTile = null;
    let isProcessing = false;

    const CANDY_TYPES = [
        { id: 'star', icon: '🌟', color: '#fde047', glow: 'rgba(253, 224, 71, 0.6)' },
        { id: 'orb', icon: '🔮', color: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)' },
        { id: 'diamond', icon: '💎', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)' },
        { id: 'donut', icon: '🍩', color: '#f472b6', glow: 'rgba(244, 114, 182, 0.6)' },
        { id: 'leaf', icon: '🍃', color: '#4ade80', glow: 'rgba(74, 222, 128, 0.6)' },
        { id: 'sun', icon: '🍊', color: '#fb923c', glow: 'rgba(251, 146, 60, 0.6)' }
    ];

    function playSynthSound(type) {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const now = ctx.currentTime;

            if (type === 'select') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
                osc.start(now); osc.stop(now + 0.09);
            } else if (type === 'swap') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(500, now + 0.1);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
                osc.start(now); osc.stop(now + 0.11);
            } else if (type === 'pop') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(550, now);
                osc.frequency.exponentialRampToValueAtTime(1100, now + 0.12);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
                osc.start(now); osc.stop(now + 0.13);
            } else if (type === 'ice') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1400, now + 0.1);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.start(now); osc.stop(now + 0.12);
            } else if (type === 'vine') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(250, now);
                osc.frequency.linearRampToValueAtTime(450, now + 0.12);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
                osc.start(now); osc.stop(now + 0.13);
            } else if (type === 'combo') {
                [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain); gain.connect(ctx.destination);
                    osc.frequency.setValueAtTime(freq, now + i * 0.06);
                    gain.gain.setValueAtTime(0.15, now + i * 0.06);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.14);
                    osc.start(now + i * 0.06); osc.stop(now + i * 0.06 + 0.15);
                });
            }
        } catch (e) {}
    }

    function renderSagaMap() {
        viewMode = 'map';
        container.innerHTML = `
            <div class="gc-wrapper">
                <div class="gc-hud">
                    <div style="color: #c084fc; font-size: 1rem;">
                        🌌 GALAKTİK SEVİYE HARİTASI
                    </div>
                    <div style="color: #fde047; font-size: 1rem;">
                        ⭐ ${getTotalStars()} Yıldız
                    </div>
                    <button id="btn-gc-map-close" class="btn btn-warning" style="padding: 4px 10px; font-size: 0.8rem; font-weight: 800; border-radius: 8px;">🔄 REKOR: ${highVal}</button>
                </div>

                <div class="gc-map-wrap">
                    <div class="gc-map-path" id="gc-map-nodes"></div>
                </div>
            </div>
        `;

        const pathEl = container.querySelector('#gc-map-nodes');
        const maxUnluck = sagaProgress.maxLevel || 1;

        for (let i = 1; i <= 10; i++) {
            const isUnlocked = i <= maxUnluck;
            const starsEarned = sagaProgress.stars[i] || 0;
            let starsStr = '';
            for (let s = 0; s < 3; s++) {
                starsStr += s < starsEarned ? '⭐' : '☆';
            }

            const node = document.createElement('div');
            node.className = `gc-map-node ${isUnlocked ? '' : 'locked'}`;

            // Zig-zag offset
            const offset = (i % 2 === 0 ? 50 : -50);
            node.style.transform = `translateX(${offset}px)`;

            node.innerHTML = `
                <div>${isUnlocked ? i : '🔒'}</div>
                <div class="stars">${isUnlocked ? starsStr : ''}</div>
            `;

            if (isUnlocked) {
                node.addEventListener('click', () => {
                    if (window.playSound) window.playSound('click');
                    currentLevel = i;
                    initGameUI();
                });
            }
            pathEl.appendChild(node);
        }
    }

    function getTotalStars() {
        let total = 0;
        Object.values(sagaProgress.stars || {}).forEach(s => total += s);
        return total;
    }

    function getLevelConfig(lvl) {
        if (lvl === 1) {
            return { moves: 18, scoreGoal: 1000, ice: 0, vine: 0, title: "Başlangıç (1000 Puan)" };
        } else if (lvl === 2) {
            return { moves: 16, scoreGoal: 800, ice: 8, vine: 0, title: "🧊 8 Buz Katmanını Erit!" };
        } else if (lvl === 3) {
            return { moves: 16, scoreGoal: 800, ice: 0, vine: 10, title: "🌿 10 Sarmaşığı Temizle!" };
        } else if (lvl === 4) {
            return { moves: 18, scoreGoal: 1000, ice: 8, vine: 6, title: "🧊 8 Buz + 🌿 6 Sarmaşık!" };
        } else if (lvl === 5) {
            return { moves: 20, scoreGoal: 1500, ice: 12, vine: 0, title: "🧊 12 Buz + 1500 Puan!" };
        } else if (lvl === 6) {
            return { moves: 18, scoreGoal: 1800, ice: 0, vine: 12, title: "🌿 12 Sarmaşık + 1800 Puan!" };
        } else {
            const iceCount = Math.min(18, 6 + (lvl - 6) * 2);
            const vineCount = Math.min(16, 4 + (lvl - 6) * 2);
            return { moves: 18, scoreGoal: 1200 + lvl * 300, ice: iceCount, vine: vineCount, title: `🧊 ${iceCount} Buz + 🌿 ${vineCount} Sarmaşık` };
        }
    }

    function initGameUI() {
        viewMode = 'game';
        score = 0;
        selectedTile = null;
        isProcessing = false;

        const cfg = getLevelConfig(currentLevel);
        movesLeft = cfg.moves;
        targetConfig = {
            scoreGoal: cfg.scoreGoal,
            iceGoal: cfg.ice,
            vineGoal: cfg.vine,
            currentIce: cfg.ice,
            currentVine: cfg.vine
        };

        container.innerHTML = `
            <div class="gc-wrapper">
                <!-- HUD Header -->
                <div class="gc-hud">
                    <button id="btn-gc-map-back" class="btn btn-warning" style="padding: 4px 8px; font-size: 0.8rem; font-weight: 800; border-radius: 8px;">🗺️ HARİTA</button>
                    <div style="color: #fde047; font-size: 1rem;">
                        💎 SKOR: <span id="gc-score">0</span>
                    </div>
                    <div style="color: #38bdf8; font-size: 1rem;" id="gc-moves">
                        🔄 HAMLE: ${movesLeft}
                    </div>
                </div>

                <!-- Goals HUD Banner -->
                <div id="gc-goal-banner" style="background: rgba(30,27,75,0.9); border-radius: 12px; border: 1.5px solid #a855f7; padding: 6px 12px; margin-bottom: 8px; color: #fdffb6; font-size: 0.95rem; font-weight: 800;">
                    🎯 HEDEF: <span id="gc-goal-text"></span>
                </div>

                <!-- Grid Wrap -->
                <div class="gc-grid-wrap">
                    <div id="gc-grid" class="gc-grid"></div>

                    <!-- Start Overlay -->
                    <div id="gc-start-overlay" class="gc-overlay">
                        <div style="font-size: 4rem; margin-bottom: 10px; animation: bounce-loop 2s infinite;">🔮🧊</div>
                        <h2 style="color: #fdffb6; font-size: 2.1rem; margin-bottom: 6px;">SEVİYE ${currentLevel}</h2>
                        <p style="color: #cbd5e1; font-size: 1rem; max-width: 320px; line-height: 1.4; margin-bottom: 16px;">
                            Bölüm Görevi:<br><strong>${cfg.title}</strong>
                        </p>
                        <button id="btn-gc-start" class="btn btn-success" style="font-size: 1.25rem; padding: 12px 35px; border-radius: 12px; font-weight: 900;">BAŞLA</button>
                    </div>
                </div>
            </div>
        `;

        container.querySelector('#btn-gc-map-back').addEventListener('click', () => {
            if (window.playSound) window.playSound('click');
            renderSagaMap();
        });

        container.querySelector('#btn-gc-start').addEventListener('click', () => {
            if (window.playSound) window.playSound('click');
            container.querySelector('#gc-start-overlay').style.display = 'none';
            startGame();
        });
    }

    function updateGoalBanner() {
        const goalTextEl = container.querySelector('#gc-goal-text');
        if (!goalTextEl) return;

        let parts = [];
        if (targetConfig.iceGoal > 0) {
            const left = targetConfig.currentIce;
            parts.push(`🧊 Buz: ${targetConfig.iceGoal - left}/${targetConfig.iceGoal}`);
        }
        if (targetConfig.vineGoal > 0) {
            const left = targetConfig.currentVine;
            parts.push(`🌿 Sarmaşık: ${targetConfig.vineGoal - left}/${targetConfig.vineGoal}`);
        }
        if (targetConfig.scoreGoal > 0 && (targetConfig.iceGoal === 0 && targetConfig.vineGoal === 0)) {
            parts.push(`💎 Skor: ${score}/${targetConfig.scoreGoal}`);
        }

        goalTextEl.innerText = parts.join(' | ');
    }

    function generateGridWithObstacles() {
        grid = [];
        let totalIceToPlace = targetConfig.iceGoal;
        let totalVineToPlace = targetConfig.vineGoal;

        for (let r = 0; r < GRID_SIZE; r++) {
            grid[r] = [];
            for (let c = 0; c < GRID_SIZE; c++) {
                let candy;
                do {
                    candy = getRandomCandy();
                } while (
                    (c >= 2 && grid[r][c - 1].type.id === candy.id && grid[r][c - 2].type.id === candy.id) ||
                    (r >= 2 && grid[r - 1][c].type.id === candy.id && grid[r - 2][c].type.id === candy.id)
                );

                grid[r][c] = {
                    type: candy,
                    special: null,
                    ice: 0,
                    vine: false
                };
            }
        }

        // Randomly assign Ice obstacles (middle rows r: 1..5, c: 1..5)
        while (totalIceToPlace > 0) {
            const r = 1 + Math.floor(Math.random() * 5);
            const c = 1 + Math.floor(Math.random() * 5);
            if (grid[r][c].ice === 0) {
                grid[r][c].ice = 1;
                totalIceToPlace--;
            }
        }

        // Randomly assign Vine obstacles
        while (totalVineToPlace > 0) {
            const r = 1 + Math.floor(Math.random() * 5);
            const c = 1 + Math.floor(Math.random() * 5);
            if (!grid[r][c].vine && grid[r][c].ice === 0) {
                grid[r][c].vine = true;
                totalVineToPlace--;
            }
        }
    }

    function getRandomCandy() {
        return CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
    }

    function renderGrid() {
        const gridEl = container.querySelector('#gc-grid');
        if (!gridEl) return;
        gridEl.innerHTML = '';

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const item = grid[r][c];
                const tile = document.createElement('div');
                tile.className = 'gc-tile';
                tile.dataset.r = r;
                tile.dataset.c = c;

                if (item && item.ice > 0) tile.classList.add('has-ice');
                if (item && item.vine) tile.classList.add('has-vine');
                if (item && item.special === 'rainbow') tile.classList.add('special-rainbow');

                if (item && item.type) {
                    let displayIcon = item.type.icon;
                    if (item.special === 'beam') displayIcon = '⚡';
                    else if (item.special === 'bomb') displayIcon = '💣';
                    else if (item.special === 'rainbow') displayIcon = '🌈';

                    tile.innerHTML = `<span>${displayIcon}</span>`;
                    const bgGlow = item.special === 'rainbow' ? 'rgba(253, 224, 71, 0.9)' : item.type.glow;
                    tile.style.background = `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.35), ${bgGlow})`;
                }

                if (selectedTile && selectedTile.r === r && selectedTile.c === c) {
                    tile.classList.add('selected');
                }

                tile.addEventListener('click', () => onTileClick(r, c));
                gridEl.appendChild(tile);
            }
        }
    }

    function updateHUD() {
        const scoreEl = container.querySelector('#gc-score');
        const movesEl = container.querySelector('#gc-moves');
        if (scoreEl) scoreEl.innerText = score;
        if (movesEl) movesEl.innerText = `🔄 HAMLE: ${movesLeft}`;
        updateGoalBanner();
    }

    async function onTileClick(r, c) {
        if (isProcessing || movesLeft <= 0) return;

        if (!selectedTile) {
            selectedTile = { r, c };
            playSynthSound('select');
            renderGrid();
        } else {
            const r1 = selectedTile.r;
            const c1 = selectedTile.c;
            selectedTile = null;

            // Check if adjacent
            const isAdjacent = (Math.abs(r1 - r) === 1 && c1 === c) || (Math.abs(c1 - c) === 1 && r1 === r);

            if (isAdjacent) {
                isProcessing = true;

                const tile1 = grid[r1][c1];
                const tile2 = grid[r][c];

                // Check for Rainbow Color Bomb Swap! (Yer değiştirince o renkten olanların hepsini yok eden Renk Bombası)
                if ((tile1 && tile1.special === 'rainbow') || (tile2 && tile2.special === 'rainbow')) {
                    movesLeft--;
                    updateHUD();

                    const rainbowTile = tile1.special === 'rainbow' ? tile1 : tile2;
                    const otherTile = tile1.special === 'rainbow' ? tile2 : tile1;
                    const targetColorId = otherTile && otherTile.type ? otherTile.type.id : null;

                    swapCandies(r1, c1, r, c);
                    renderGrid();
                    await new Promise(res => setTimeout(res, 200));

                    await triggerRainbowWipe(targetColorId);
                    isProcessing = false;
                    return;
                }

                playSynthSound('swap');
                swapCandies(r1, c1, r, c);
                renderGrid();

                await new Promise(res => setTimeout(res, 200));

                const matches = findMatches();
                if (matches.length > 0) {
                    movesLeft--;
                    updateHUD();
                    await processMatches(matches);
                } else {
                    // Revert swap if no match
                    swapCandies(r1, c1, r, c);
                    renderGrid();
                }
                isProcessing = false;
            } else {
                selectedTile = { r, c };
                playSynthSound('select');
                renderGrid();
            }
        }
    }

    async function triggerRainbowWipe(targetColorId) {
        playSynthSound('combo');
        let matched = [];

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = grid[r][c];
                if (cell) {
                    if (targetColorId === null || cell.special === 'rainbow' || (cell.type && cell.type.id === targetColorId)) {
                        matched.push({ r, c });
                    }
                }
            }
        }

        if (matched.length > 0) {
            await processMatches(matched);
        }
    }

    function swapCandies(r1, c1, r2, c2) {
        const temp = grid[r1][c1];
        grid[r1][c1] = grid[r2][c2];
        grid[r2][c2] = temp;
    }

    function findMatches() {
        let matched = new Set();
        let rainbowSpawns = [];

        // Horizontal matches
        for (let r = 0; r < GRID_SIZE; r++) {
            let matchLen = 1;
            for (let c = 0; c < GRID_SIZE; c++) {
                let checkEnd = false;
                if (c < GRID_SIZE - 1 && grid[r][c] && grid[r][c + 1] && grid[r][c].type && grid[r][c + 1].type && grid[r][c].type.id === grid[r][c + 1].type.id) {
                    matchLen++;
                } else {
                    checkEnd = true;
                }

                if (checkEnd) {
                    if (matchLen >= 3) {
                        for (let k = 0; k < matchLen; k++) {
                            matched.add(`${r},${c - k}`);
                        }
                        // 5 in a row -> Create Rainbow Color Bomb 🌈
                        if (matchLen >= 5) {
                            const midC = c - Math.floor(matchLen / 2);
                            rainbowSpawns.push({ r, c: midC });
                        }
                    }
                    matchLen = 1;
                }
            }
        }

        // Vertical matches
        for (let c = 0; c < GRID_SIZE; c++) {
            let matchLen = 1;
            for (let r = 0; r < GRID_SIZE; r++) {
                let checkEnd = false;
                if (r < GRID_SIZE - 1 && grid[r][c] && grid[r + 1][c] && grid[r][c].type && grid[r + 1][c].type && grid[r][c].type.id === grid[r + 1][c].type.id) {
                    matchLen++;
                } else {
                    checkEnd = true;
                }

                if (checkEnd) {
                    if (matchLen >= 3) {
                        for (let k = 0; k < matchLen; k++) {
                            matched.add(`${r - k},${c}`);
                        }
                        // 5 in a column -> Create Rainbow Color Bomb 🌈
                        if (matchLen >= 5) {
                            const midR = r - Math.floor(matchLen / 2);
                            rainbowSpawns.push({ r: midR, c });
                        }
                    }
                    matchLen = 1;
                }
            }
        }

        // Set rainbow spawns on grid
        rainbowSpawns.forEach(sp => {
            if (grid[sp.r][sp.c]) {
                grid[sp.r][sp.c].special = 'rainbow';
            }
        });

        return Array.from(matched).map(coord => {
            const [r, c] = coord.split(',').map(Number);
            return { r, c };
        });
    }

    async function processMatches(initialMatches) {
        let currentMatches = initialMatches;
        let comboCount = 0;

        while (currentMatches.length > 0) {
            comboCount++;
            const pts = currentMatches.length * 25 * comboCount;
            score += pts;

            // Break Ice & Remove Vines on matched cells & adjacent
            currentMatches.forEach(m => {
                const cell = grid[m.r][m.c];
                if (cell && cell.ice > 0) {
                    cell.ice--;
                    targetConfig.currentIce = Math.max(0, targetConfig.currentIce - 1);
                    playSynthSound('ice');
                }

                // Check Vine removal (on cell or adjacent cells)
                const checkVine = (vr, vc) => {
                    if (vr >= 0 && vr < GRID_SIZE && vc >= 0 && vc < GRID_SIZE) {
                        if (grid[vr][vc] && grid[vr][vc].vine) {
                            grid[vr][vc].vine = false;
                            targetConfig.currentVine = Math.max(0, targetConfig.currentVine - 1);
                            playSynthSound('vine');
                        }
                    }
                };

                checkVine(m.r, m.c);
                checkVine(m.r - 1, m.c);
                checkVine(m.r + 1, m.c);
                checkVine(m.r, m.c - 1);
                checkVine(m.r, m.c + 1);
            });

            updateHUD();

            if (comboCount > 1) playSynthSound('combo');
            else playSynthSound('pop');

            // Mark & Animate pop
            const gridEl = container.querySelector('#gc-grid');
            currentMatches.forEach(m => {
                const idx = m.r * GRID_SIZE + m.c;
                const tile = gridEl.children[idx];
                if (tile) tile.classList.add('match-pop');
                grid[m.r][m.c] = null;
            });

            await new Promise(res => setTimeout(res, 240));

            // Drop Candies (Gravity)
            dropCandies();
            renderGrid();
            await new Promise(res => setTimeout(res, 200));

            // Check new cascade matches
            currentMatches = findMatches();
        }

        checkGameOver();
    }

    function dropCandies() {
        for (let c = 0; c < GRID_SIZE; c++) {
            let emptySlots = 0;
            for (let r = GRID_SIZE - 1; r >= 0; r--) {
                if (grid[r][c] === null) {
                    emptySlots++;
                } else if (emptySlots > 0) {
                    grid[r + emptySlots][c] = grid[r][c];
                    grid[r][c] = null;
                }
            }
            // Fill top empty slots with new random candies
            for (let r = 0; r < emptySlots; r++) {
                grid[r][c] = { type: getRandomCandy(), special: null, ice: 0, vine: false };
            }
        }
    }

    function isObjectiveAchieved() {
        const iceDone = targetConfig.iceGoal === 0 || targetConfig.currentIce <= 0;
        const vineDone = targetConfig.vineGoal === 0 || targetConfig.currentVine <= 0;
        const scoreDone = score >= targetConfig.scoreGoal;

        if (targetConfig.iceGoal > 0 || targetConfig.vineGoal > 0) {
            return iceDone && vineDone && scoreDone;
        }
        return scoreDone;
    }

    function checkGameOver() {
        if (isObjectiveAchieved()) {
            setTimeout(() => endGame(true), 300);
            return;
        }

        if (movesLeft <= 0) {
            setTimeout(() => endGame(false), 300);
        }
    }

    function endGame(isWon) {
        if (score > highVal) {
            highVal = score;
            localStorage.setItem('minikio_candy_high', highVal);
        }

        let starsEarned = 0;

        if (isWon) {
            playSynthSound('combo');
            if (window.updateStats) window.updateStats(score, 1);

            // Calculate 1 to 3 stars based on remaining moves
            starsEarned = movesLeft >= 6 ? 3 : movesLeft >= 2 ? 2 : 1;

            // Update Saga Progress
            if (sagaProgress.stars[currentLevel] === undefined || starsEarned > sagaProgress.stars[currentLevel]) {
                sagaProgress.stars[currentLevel] = starsEarned;
            }
            if (currentLevel >= sagaProgress.maxLevel) {
                sagaProgress.maxLevel = currentLevel + 1;
            }
            localStorage.setItem('minikio_candy_saga_progress', JSON.stringify(sagaProgress));
        } else {
            playSynthSound('vine');
        }

        const overlay = document.createElement('div');
        overlay.className = 'gc-overlay';
        overlay.style.zIndex = '150';

        if (isWon) {
            let starsStr = '';
            for (let s = 0; s < 3; s++) starsStr += s < starsEarned ? '⭐' : '☆';

            overlay.innerHTML = `
                <div style="font-size: 4.5rem; margin-bottom: 12px; animation: bounce-loop 2s infinite;">🏆✨</div>
                <h2 style="color: #fdffb6; font-size: 2.2rem; margin-bottom: 5px;">SEVİYE ${currentLevel} TAMAMLANDI!</h2>
                <div style="font-size: 2.5rem; margin-bottom: 10px;">${starsStr}</div>
                <p style="color: #cbd5e1; font-size: 1.05rem; margin-bottom: 12px;">Tüm görevleri başarıyla yerine getirdin!</p>
                <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 18px;">Kazanılan Skor: <strong>${score}</strong> | Harita Açıldı: <strong>Seviye ${currentLevel + 1}</strong></p>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-warning" id="btn-gc-map" style="font-size: 1.1rem; padding: 10px 20px; font-weight: 900; border-radius: 10px;">🗺️ HARİTA</button>
                    <button class="btn btn-success" id="btn-gc-next" style="font-size: 1.1rem; padding: 10px 20px; font-weight: 900; border-radius: 10px;">SONRAKİ SEVİYE ➔</button>
                </div>
            `;
        } else {
            overlay.innerHTML = `
                <div style="font-size: 4.5rem; margin-bottom: 12px; animation: bounce-loop 2s infinite;">😢🔮</div>
                <h2 style="color: #f87171; font-size: 2.1rem; margin-bottom: 5px;">HAMLE KALMADI!</h2>
                <p style="color: #cbd5e1; font-size: 1rem; margin-bottom: 12px;">Bölüm hedeflerini tamamlayamadın.</p>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 18px;">💡 İpucu: Çoklu eşleştirmeler yaparak buzları ve sarmaşıkları hızla yok edebilirsin!</p>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-warning" id="btn-gc-map" style="font-size: 1.1rem; padding: 10px 20px; font-weight: 900; border-radius: 10px;">🗺️ HARİTA</button>
                    <button class="btn btn-success" id="btn-gc-retry" style="font-size: 1.1rem; padding: 10px 20px; font-weight: 900; border-radius: 10px;">TEKRAR DENE</button>
                </div>
            `;
        }

        const wrap = container.querySelector('.gc-grid-wrap');
        wrap.appendChild(overlay);

        const mapBtn = document.getElementById('btn-gc-map');
        if (mapBtn) {
            mapBtn.addEventListener('click', () => {
                cleanup();
                renderSagaMap();
            });
        }

        const retryBtn = document.getElementById('btn-gc-retry');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                cleanup();
                initGameUI();
                startGame();
            });
        }

        const nextBtn = document.getElementById('btn-gc-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentLevel++;
                cleanup();
                initGameUI();
                startGame();
            });
        }
    }

    function startGame() {
        score = 0;
        selectedTile = null;
        isProcessing = false;
        
        generateGridWithObstacles();
        renderGrid();
        updateHUD();
    }

    function cleanup() {
        grid = [];
        selectedTile = null;
        isProcessing = false;
    }

    window.currentGameCleanup = cleanup;
    renderSagaMap();
};

/* ============================================================
   OYUN 24: IŞIK & AYNA LAZER YANSITMA (Laser & Mirror Optics)
   ============================================================ */
window.startLaserOpticsGame = function(container, levelNumber) {
    const LEVELS = [
        { level: 1, name: "Işık Düzeneği", grid: 4, scoreBase: 50, laser:{r:0,c:0,dir:'R'}, target:{r:2,c:0}, mirrors: [{r:0,c:2,dir:90},{r:2,c:2,dir:0}] },
        { level: 2, name: "Ayna Köşesi", grid: 5, scoreBase: 70, laser:{r:1,c:0,dir:'R'}, target:{r:4,c:1}, mirrors: [{r:1,c:3,dir:90},{r:3,c:3,dir:0},{r:3,c:1,dir:90}] },
        { level: 3, name: "Işık Yolu", grid: 5, scoreBase: 100, laser:{r:0,c:1,dir:'D'}, target:{r:0,c:2}, mirrors: [{r:3,c:1,dir:90},{r:3,c:4,dir:0},{r:0,c:4,dir:90}] },
        { level: 4, name: "Çifte Dönüş", grid: 5, scoreBase: 130, laser:{r:0,c:0,dir:'R'}, target:{r:2,c:3}, mirrors: [{r:0,c:4,dir:0},{r:4,c:4,dir:90},{r:4,c:1,dir:0},{r:2,c:1,dir:90}] },
        { level: 5, name: "Prizma Labirenti", grid: 6, scoreBase: 160, laser:{r:1,c:1,dir:'R'}, target:{r:3,c:4}, mirrors: [{r:1,c:5,dir:0},{r:5,c:5,dir:90},{r:5,c:0,dir:0},{r:3,c:0,dir:90}] },
        { level: 6, name: "Kristal Odası", grid: 6, scoreBase: 200, laser:{r:0,c:0,dir:'D'}, target:{r:5,c:2}, mirrors: [{r:4,c:0,dir:0},{r:4,c:3,dir:90},{r:1,c:3,dir:0},{r:1,c:5,dir:90},{r:5,c:5,dir:0}] },
        { level: 7, name: "Lazer Kırılması", grid: 6, scoreBase: 240, laser:{r:2,c:0,dir:'R'}, target:{r:3,c:5}, mirrors: [{r:2,c:4,dir:0},{r:5,c:4,dir:90},{r:5,c:1,dir:0},{r:0,c:1,dir:90},{r:0,c:5,dir:0}] },
        { level: 8, name: "Foton Ustası", grid: 7, scoreBase: 280, laser:{r:0,c:2,dir:'D'}, target:{r:3,c:4}, mirrors: [{r:5,c:2,dir:0},{r:5,c:6,dir:90},{r:1,c:6,dir:0},{r:1,c:0,dir:90},{r:6,c:0,dir:0},{r:6,c:4,dir:90}] },
        { level: 9, name: "Ayna Matrisi", grid: 7, scoreBase: 350, laser:{r:1,c:0,dir:'R'}, target:{r:0,c:0}, mirrors: [{r:1,c:6,dir:0},{r:6,c:6,dir:90},{r:6,c:2,dir:0},{r:3,c:2,dir:90},{r:3,c:5,dir:0},{r:0,c:5,dir:90}] },
        { level: 10, name: "Lazer Krallığı", grid: 7, scoreBase: 500, laser:{r:0,c:0,dir:'R'}, target:{r:5,c:3}, mirrors: [{r:0,c:5,dir:0},{r:4,c:5,dir:90},{r:4,c:1,dir:0},{r:6,c:1,dir:90},{r:6,c:6,dir:0},{r:2,c:6,dir:90},{r:2,c:3,dir:0}] }
    ];

    const cfg = LEVELS[(levelNumber - 1) % LEVELS.length];

    function isLvlUnlocked(lvl) {
        const max = parseInt(localStorage.getItem('minikio_game_24_unlocked_v3') || "1");
        return lvl <= max;
    }

    let lives = 3;
    let isAnimating = false;
    let laserTimer = null;
    let visiblePath = [];
    let errorCell = null;

    let mirrorStates = cfg.mirrors.map((m, idx) => ({
        r: m.r,
        c: m.c,
        dir: (m.dir + (idx % 2 === 0 ? 90 : 0)) % 180
    }));

    const tabsHTML = LEVELS.map(l => {
        const unl = isLvlUnlocked(l.level);
        return `<button class="level-tab ${l.level === levelNumber ? 'active' : ''}" data-level="${l.level}" ${unl ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"'}>${unl ? (l.level + '. ' + l.name) : ('🔒 ' + l.level)}</button>`;
    }).join('');

    const maxContainerWidth = cfg.grid >= 7 ? '340px' : (cfg.grid >= 6 ? '360px' : '400px');
    const gridPadding = cfg.grid >= 7 ? '8px' : (cfg.grid >= 6 ? '10px' : '14px');
    const gridGap = cfg.grid >= 7 ? '3px' : (cfg.grid >= 6 ? '4px' : (cfg.grid >= 5 ? '5px' : '7px'));

    const html = `
        <div class="laser-optics-game" style="max-width:480px; margin:0 auto; user-select:none; text-align:center; font-family:var(--font-heading, sans-serif);">
            <div class="level-tabs" style="margin-bottom:8px;">${tabsHTML}</div>

            <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.95) 100%); border:2px solid rgba(168, 85, 247, 0.5); border-radius:14px; padding:8px 14px; margin-bottom:10px; box-shadow:0 0 20px rgba(168, 85, 247, 0.25);">
                <div style="display:flex; align-items:center; gap:6px;">
                    <span style="background:linear-gradient(135deg, #a855f7, #6b21a8); padding:4px 10px; border-radius:10px; color:white; font-size:0.85rem; font-weight:800; letter-spacing:0.5px;">${cfg.level}. SEVİYE</span>
                    <span style="color:#e2e8f0; font-weight:700; font-size:0.95rem;">${cfg.name}</span>
                </div>
                <div id="laser-lives-display" style="display:flex; gap:4px; font-size:1.2rem;">
                    ❤️ ❤️ ❤️
                </div>
            </div>

            <div style="position:relative; padding:${gridPadding}; background:radial-gradient(circle at center, #0f172a 0%, #020617 100%); border:3px solid rgba(168, 85, 247, 0.6); border-radius:20px; box-shadow:0 0 25px rgba(168, 85, 247, 0.3); margin:0 auto; max-width:${maxContainerWidth};">
                <div id="laser-grid-container" style="display:grid; grid-template-columns:repeat(${cfg.grid}, 1fr); gap:${gridGap}; position:relative;">
                </div>
            </div>

            <div id="laser-status-banner" style="margin-top:10px; font-weight:700; font-size:0.95rem; min-height:26px; color:#94a3b8; transition:all 0.3s ease;">
                🎯 Aynalara tıklayarak açılarını ayarla, ardından buton ile fırlat!
            </div>

            <button id="btn-fire-laser" style="margin-top:10px; width:100%; padding:12px; font-size:1.05rem; font-weight:900; letter-spacing:1px; text-transform:uppercase; border-radius:16px; background:linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%); border:none; color:white; cursor:pointer; box-shadow:0 0 20px rgba(236, 72, 153, 0.5); transition:all 0.2s ease;">
                ⚡ IŞINI YOLLA!
            </button>
        </div>
    `;

    container.innerHTML = html;

    container.querySelectorAll(".level-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            if (isAnimating) return;
            const lvl = parseInt(tab.getAttribute("data-level"));
            if (isLvlUnlocked(lvl)) {
                if (window.playSound) window.playSound('click');
                if (laserTimer) clearInterval(laserTimer);
                window.startLaserOpticsGame(container, lvl);
            }
        });
    });

    const gridContainer = container.querySelector("#laser-grid-container");
    const statusBanner = container.querySelector("#laser-status-banner");
    const livesDisplay = container.querySelector("#laser-lives-display");
    const btnFire = container.querySelector("#btn-fire-laser");

    function updateLivesHUD() {
        let heartsHTML = "";
        for (let i = 0; i < 3; i++) {
            if (i < lives) {
                heartsHTML += `<span style="filter:drop-shadow(0 0 8px #ef4444); display:inline-block;">❤️</span>`;
            } else {
                heartsHTML += `<span style="opacity:0.25; filter:grayscale(100%); display:inline-block;">🖤</span>`;
            }
        }
        livesDisplay.innerHTML = heartsHTML;
    }

    updateLivesHUD();

    function computeRayPath() {
        const path = [];
        let currR = cfg.laser.r;
        let currC = cfg.laser.c;
        let dir = cfg.laser.dir;

        path.push({ r: currR, c: currC, dir: dir, isMirror: false, isError: false });

        let steps = 0;
        let hitTarget = false;

        while (steps < 50) {
            steps++;
            let nextR = currR;
            let nextC = currC;

            if (dir === 'R') nextC++;
            else if (dir === 'L') nextC--;
            else if (dir === 'D') nextR++;
            else if (dir === 'U') nextR--;

            if (nextR < 0 || nextR >= cfg.grid || nextC < 0 || nextC >= cfg.grid) {
                path.push({ r: currR, c: currC, dir: dir, isMirror: false, isError: true });
                break;
            }

            currR = nextR;
            currC = nextC;

            if (currR === cfg.target.r && currC === cfg.target.c) {
                hitTarget = true;
                path.push({ r: currR, c: currC, dir: dir, isMirror: false, isError: false });
                break;
            }

            const m = mirrorStates.find(m => m.r === currR && m.c === currC);
            if (m) {
                path.push({ r: currR, c: currC, dir: dir, isMirror: true, isError: false });
                if (m.dir === 0) { // '/'
                    if (dir === 'R') dir = 'U';
                    else if (dir === 'L') dir = 'D';
                    else if (dir === 'D') dir = 'L';
                    else if (dir === 'U') dir = 'R';
                } else { // '\'
                    if (dir === 'R') dir = 'D';
                    else if (dir === 'L') dir = 'U';
                    else if (dir === 'D') dir = 'R';
                    else if (dir === 'U') dir = 'L';
                }
            } else {
                path.push({ r: currR, c: currC, dir: dir, isMirror: false, isError: false });
            }
        }
        return { path, hitTarget };
    }

    function renderBoard() {
        gridContainer.innerHTML = "";

        const cellFontSize = cfg.grid >= 7 ? '0.9rem' : (cfg.grid >= 6 ? '1.05rem' : (cfg.grid >= 5 ? '1.25rem' : '1.5rem'));
        const mirrorFontSize = cfg.grid >= 7 ? '1.0rem' : (cfg.grid >= 6 ? '1.15rem' : (cfg.grid >= 5 ? '1.35rem' : '1.6rem'));
        const cellRadius = cfg.grid >= 7 ? '8px' : (cfg.grid >= 6 ? '10px' : '12px');

        for (let r = 0; r < cfg.grid; r++) {
            for (let c = 0; c < cfg.grid; c++) {
                const cell = document.createElement("div");
                cell.style.cssText = `aspect-ratio:1; background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius:${cellRadius}; display:flex; align-items:center; justify-content:center; position:relative; font-size:${cellFontSize}; border:2px solid rgba(56, 189, 248, 0.2); transition:all 0.25s ease; box-shadow:inset 0 0 8px rgba(0,0,0,0.5);`;

                const pathItem = visiblePath.find(p => p.r === r && p.c === c);
                const isErrCell = errorCell && errorCell.r === r && errorCell.c === c;

                if (isErrCell) {
                    cell.style.background = "radial-gradient(circle, #ef4444 0%, #7f1d1d 100%)";
                    cell.style.borderColor = "#f87171";
                    cell.style.boxShadow = "0 0 25px #ef4444, inset 0 0 15px #fca5a5";
                } else if (pathItem) {
                    cell.style.background = "radial-gradient(circle, rgba(236, 72, 153, 0.65) 0%, rgba(168, 85, 247, 0.4) 100%)";
                    cell.style.borderColor = "#f472b6";
                    cell.style.boxShadow = "0 0 22px rgba(236, 72, 153, 0.9), inset 0 0 12px rgba(192, 132, 252, 0.7)";
                }

                if (r === cfg.laser.r && c === cfg.laser.c) {
                    const dirIcons = { 'R': '▶️', 'L': '◀️', 'U': '🔼', 'D': '🔽' };
                    cell.innerHTML = `<span title="Lazer Emitter" style="filter:drop-shadow(0 0 8px #a855f7);">⚡${dirIcons[cfg.laser.dir] || ''}</span>`;
                } else if (r === cfg.target.r && c === cfg.target.c) {
                    const hit = visiblePath.some(p => p.r === r && p.c === c);
                    cell.innerHTML = `<span title="Hedef Kristal" style="${hit ? 'filter:drop-shadow(0 0 15px #22c55e); animation:pulse 1s infinite;' : ''}">💎</span>`;
                } else {
                    const m = mirrorStates.find(m => m.r === r && m.c === c);
                    if (m) {
                        cell.style.cursor = "pointer";
                        cell.title = "Aynayı döndürmek için tıkla";
                        const angle = m.dir === 0 ? "45deg" : "135deg";
                        cell.innerHTML = `<div style="transform:rotate(${angle}); transition:transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); font-size:${mirrorFontSize}; filter:drop-shadow(0 0 8px #38bdf8);">🪞</div>`;
                        cell.addEventListener("click", () => {
                            if (isAnimating) return;
                            m.dir = m.dir === 0 ? 90 : 0;
                            if (window.playSound) window.playSound('click');
                            visiblePath = [];
                            errorCell = null;
                            renderBoard();
                        });
                    }
                }

                gridContainer.appendChild(cell);
            }
        }
    }

    renderBoard();

    btnFire.addEventListener("click", () => {
        if (isAnimating) return;
        isAnimating = true;
        btnFire.disabled = true;
        btnFire.style.opacity = "0.5";
        btnFire.style.cursor = "not-allowed";
        visiblePath = [];
        errorCell = null;
        if (window.playSound) window.playSound('click');

        statusBanner.style.color = "#a855f7";
        statusBanner.innerText = "⚡ Lazer ışını ilerliyor...";

        const { path, hitTarget } = computeRayPath();
        let stepIdx = 0;

        laserTimer = setInterval(() => {
            if (stepIdx < path.length) {
                const step = path[stepIdx];
                if (step.isError) {
                    errorCell = { r: step.r, c: step.c };
                } else {
                    visiblePath.push(step);
                }
                renderBoard();

                if (stepIdx === path.length - 1) {
                    clearInterval(laserTimer);
                    laserTimer = null;
                    isAnimating = false;
                    btnFire.disabled = false;
                    btnFire.style.opacity = "1";
                    btnFire.style.cursor = "pointer";

                    if (hitTarget) {
                        if (window.playSound) window.playSound('success');
                        if (window.unlockNextLevel) window.unlockNextLevel(24, levelNumber);
                        if (window.updateStats) window.updateStats(cfg.scoreBase, 1);
                        statusBanner.style.color = "#22c55e";
                        statusBanner.innerHTML = `🎉 TEBRİKLER! Hedef Kristali Aydınlattın!<br><button class="btn btn-success" id="btn-next-laser" style="margin-top:8px; padding:10px 24px; font-size:1.05rem; border-radius:14px; cursor:pointer;">Sonraki Seviye ➡️</button>`;
                        const btnNext = container.querySelector("#btn-next-laser");
                        if (btnNext) {
                            btnNext.addEventListener("click", () => {
                                window.startLaserOpticsGame(container, levelNumber < LEVELS.length ? levelNumber + 1 : 1);
                            });
                        }
                    } else {
                        if (window.playSound) window.playSound('locked');
                        lives--;
                        updateLivesHUD();
                        if (lives <= 0) {
                            statusBanner.style.color = "#ef4444";
                            statusBanner.innerHTML = `💥 Canların Bitti!<br><button class="btn btn-primary" id="btn-retry-laser" style="margin-top:8px; padding:10px 24px; font-size:1.05rem; border-radius:14px; cursor:pointer;">Yeniden Başla 🔄</button>`;
                            const btnRetry = container.querySelector("#btn-retry-laser");
                            if (btnRetry) {
                                btnRetry.addEventListener("click", () => {
                                    window.startLaserOpticsGame(container, levelNumber);
                                });
                            }
                        } else {
                            statusBanner.style.color = "#f59e0b";
                            statusBanner.innerText = `❌ Işın hedefe ulaşamadı! Aynaların açısını değiştirip tekrar dene. (${lives} can kaldı)`;
                        }
                    }
                }
                stepIdx++;
            } else {
                clearInterval(laserTimer);
                laserTimer = null;
                isAnimating = false;
                btnFire.disabled = false;
                btnFire.style.opacity = "1";
                btnFire.style.cursor = "pointer";
            }
        }, 110);
    });
};
        /* ============================================================
           OYUN 25: BAHÇE & ÇİFTLİK SULAMA (Karakterli 2D RPG & Hay Day Mantığı)
           ============================================================ */
        window.startGardenFarmGame = function(container, levelNumber) {
            const CROPS = {
                wheat:      { id: 'wheat',      name: 'Buğday',   icon: '🌾', cost: 5,  growTime: 3.0, score: 20, color: '#f59e0b' },
                carrot:     { id: 'carrot',     name: 'Havuç',    icon: '🥕', cost: 10, growTime: 4.5, score: 35, color: '#f97316' },
                tomato:     { id: 'tomato',     name: 'Domates',  icon: '🍅', cost: 20, growTime: 6.0, score: 55, color: '#ef4444' },
                strawberry: { id: 'strawberry', name: 'Çilek',    icon: '🍓', cost: 35, growTime: 7.5, score: 90, color: '#ec4899' },
                corn:       { id: 'corn',       name: 'Mısır',    icon: '🌽', cost: 50, growTime: 9.0, score: 140, color: '#eab308' },
                sunflower:  { id: 'sunflower',  name: 'Ayçiçeği', icon: '🌻', cost: 75, growTime: 11.0, score: 210, color: '#fbbf24' }
            };

            const LEVELS = [
                { level: 1, name: "İlk Tarla", rows: 2, cols: 2, targets: { wheat: 3, carrot: 2 }, scoreBase: 100 },
                { level: 2, name: "Çiçekli Bahçe", rows: 2, cols: 3, targets: { carrot: 4, tomato: 3 }, scoreBase: 150 },
                { level: 3, name: "Çilek Bahçesi", rows: 2, cols: 3, targets: { wheat: 4, strawberry: 3 }, scoreBase: 200 },
                { level: 4, name: "Çiftlik Pazarı", rows: 2, cols: 4, targets: { tomato: 4, corn: 3 }, scoreBase: 260 },
                { level: 5, name: "Güneş Çiftliği", rows: 3, cols: 3, targets: { corn: 4, sunflower: 3 }, scoreBase: 320 },
                { level: 6, name: "Verimli Vadi", rows: 3, cols: 3, targets: { strawberry: 4, sunflower: 4 }, scoreBase: 390 },
                { level: 7, name: "Bereketli Bahçe", rows: 3, cols: 4, targets: { wheat: 5, carrot: 5, tomato: 4 }, scoreBase: 470 },
                { level: 8, name: "Büyük Panayır", rows: 3, cols: 4, targets: { strawberry: 5, corn: 5 }, scoreBase: 560 },
                { level: 9, name: "Altın Tarlalar", rows: 3, cols: 4, targets: { sunflower: 6, strawberry: 6 }, scoreBase: 660 },
                { level: 10, name: "Efsane Çiftçi", rows: 4, cols: 4, targets: { wheat: 6, tomato: 6, corn: 6 }, scoreBase: 800 }
            ];

            const cfg = LEVELS[(levelNumber - 1) % LEVELS.length];

            function isLvlUnlocked(lvl) {
                const max = parseInt(localStorage.getItem('minikio_game_25_unlocked_v3') || "1");
                return lvl <= max;
            }

            // Coin Economy (stored in localStorage or session)
            let playerCoins = parseInt(localStorage.getItem('minikio_farm_coins') || "60");

            let currentProgress = {};
            Object.keys(cfg.targets).forEach(cId => {
                currentProgress[cId] = 0;
            });

            const availableSeedKeys = Object.keys(CROPS).filter(cKey => {
                return Object.keys(cfg.targets).includes(cKey) || ['wheat', 'carrot'].includes(cKey);
            });

            let selectedSeedKey = availableSeedKeys[0];
            let animFrameId = null;
            let activeTimers = [];

            // Farmers Character State
            const farmer = {
                x: 80,
                y: 120,
                targetX: 80,
                targetY: 120,
                speed: 0.9, // Slow, deliberate step-by-step walking speed
                state: 'IDLE', // IDLE, WALKING, WATERING, PLANTING, HARVESTING
                targetPlot: null,
                actionTimer: 0,
                animTick: 0,
                direction: 'RIGHT'
            };

            // Build plots positions
            const plotGridWidth = 480;
            const plotGridHeight = 260;
            const startX = (540 - plotGridWidth) / 2 + 10;
            const startY = 120;
            const cellW = (plotGridWidth - 20) / cfg.cols;
            const cellH = (plotGridHeight - 20) / cfg.rows;

            let plots = [];
            let plotId = 0;
            for (let r = 0; r < cfg.rows; r++) {
                for (let c = 0; c < cfg.cols; c++) {
                    plots.push({
                        id: plotId++,
                        row: r,
                        col: c,
                        x: startX + c * cellW + 6,
                        y: startY + r * cellH + 6,
                        w: cellW - 12,
                        h: cellH - 12,
                        state: 'EMPTY', // EMPTY, SEEDED, GROWING, READY
                        cropKey: null,
                        progress: 0,
                        startTime: null,
                        duration: 0
                    });
                }
            }

            // Particles systems
            let waterParticles = [];
            let coinParticles = [];
            let floatingTexts = [];

            const tabsHTML = LEVELS.map(l => {
                const unl = isLvlUnlocked(l.level);
                return `<button class="level-tab ${l.level === levelNumber ? 'active' : ''}" data-level="${l.level}" ${unl ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"'}>${unl ? (l.level + '. ' + l.name) : ('🔒 ' + l.level)}</button>`;
            }).join('');

            function buildTargetsHTML() {
                return Object.keys(cfg.targets).map(cId => {
                    const crop = CROPS[cId];
                    const current = currentProgress[cId] || 0;
                    const required = cfg.targets[cId];
                    const isDone = current >= required;
                    return `
                        <div style="display:inline-flex; align-items:center; gap:6px; background:${isDone ? '#dcfce7' : '#ffffff'}; border:2px solid ${isDone ? '#22c55e' : '#cbd5e1'}; border-radius:12px; padding:4px 10px; font-weight:700; font-size:0.85rem; color:var(--text-dark); transition:all 0.3s ease;">
                            <span style="font-size:1.2rem;">${crop.icon}</span>
                            <span>${current}/${required}</span>
                            ${isDone ? '<span style="color:#16a34a; font-weight:bold;">✓</span>' : ''}
                        </div>
                    `;
                }).join('');
            }

            function buildSeedSelectorHTML() {
                return availableSeedKeys.map(cKey => {
                    const crop = CROPS[cKey];
                    const isSelected = cKey === selectedSeedKey;
                    const canAfford = playerCoins >= crop.cost;
                    return `
                        <button class="seed-btn ${isSelected ? 'selected' : ''}" data-seed="${cKey}" style="
                            display:flex; flex-direction:column; align-items:center; justify-content:center;
                            background:${isSelected ? 'linear-gradient(135deg, #10b981, #059669)' : (canAfford ? '#ffffff' : '#f1f5f9')};
                            color:${isSelected ? '#ffffff' : (canAfford ? '#334155' : '#94a3b8')};
                            border:2px solid ${isSelected ? '#047857' : (canAfford ? '#cbd5e1' : '#e2e8f0')};
                            border-radius:14px; padding:6px 10px; cursor:${canAfford ? 'pointer' : 'not-allowed'}; min-width:75px;
                            box-shadow:${isSelected ? '0 4px 12px rgba(16,185,129,0.4)' : '0 2px 4px rgba(0,0,0,0.05)'};
                            transform:${isSelected ? 'scale(1.05)' : 'scale(1)'};
                            transition:all 0.2s ease;
                        ">
                            <span style="font-size:1.5rem; line-height:1;">${crop.icon}</span>
                            <span style="font-size:0.75rem; font-weight:800; margin-top:2px;">${crop.name}</span>
                            <span style="font-size:0.65rem; font-weight:700; color:${isSelected ? '#d1fae5' : '#d97706'};">🪙 $${crop.cost}</span>
                        </button>
                    `;
                }).join('');
            }

            const html = `
                <div class="garden-farm-rpg-game" style="max-width:560px; margin:0 auto; user-select:none; font-family:inherit;">
                    <div class="level-tabs" style="margin-bottom:10px; display:flex; gap:6px; overflow-x:auto; padding-bottom:4px;">${tabsHTML}</div>

                    <!-- Header Status Card -->
                    <div style="background:linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border:2px solid #a7f3d0; border-radius:18px; padding:10px 14px; margin-bottom:10px; box-shadow:0 4px 14px rgba(16,185,129,0.12); display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:1.2rem; font-weight:800; color:#065f46;">🌾 Çiftlik RPG</span>
                            <span style="font-size:0.8rem; background:#10b981; color:white; padding:2px 8px; border-radius:20px; font-weight:700;">Seviye ${levelNumber}</span>
                        </div>
                        <div id="coin-counter" style="background:#fef3c7; border:2px solid #f59e0b; border-radius:14px; padding:4px 12px; font-size:1rem; font-weight:800; color:#b45309; display:flex; align-items:center; gap:4px; box-shadow:0 2px 8px rgba(245,158,11,0.2);">
                            <span>🪙 Altın Kasa:</span>
                            <span id="coin-amount" style="color:#d97706; font-size:1.15rem;">$${playerCoins}</span>
                        </div>
                        <div id="farm-targets" style="display:flex; flex-wrap:wrap; align-items:center; gap:6px; width:100%; justify-content:center;">
                            ${buildTargetsHTML()}
                        </div>
                    </div>

                    <!-- Seed Palette Selector -->
                    <div style="margin-bottom:10px; text-align:center;">
                        <div style="font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px;">🌱 EKMEK İSTEDİĞİN TOHUMU SEÇ:</div>
                        <div id="seed-palette" style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
                            ${buildSeedSelectorHTML()}
                        </div>
                    </div>

                    <!-- Interactive Canvas Area -->
                    <div style="position:relative; width:100%; border-radius:24px; overflow:hidden; border:4px solid #b45309; box-shadow:0 12px 32px rgba(0,0,0,0.25);">
                        <canvas id="farmCanvas" width="540" height="420" style="width:100%; height:auto; display:block; cursor:pointer; background:#4ade80;"></canvas>
                        
                        <!-- Status Banner Overlay -->
                        <div id="farmer-status-banner" style="
                            position:absolute; bottom:12px; left:50%; transform:translateX(-50%);
                            background:rgba(15, 23, 42, 0.85); color:white; padding:6px 16px; border-radius:20px;
                            font-size:0.85rem; font-weight:700; backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.2);
                            box-shadow:0 4px 12px rgba(0,0,0,0.3); pointer-events:none; text-align:center;
                        ">
                            👨‍🌾 Tarladaki parsele tıkla: Çiftçi yürüsün, eksin, sulasın & biçsin!
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;

            const canvas = container.querySelector("#farmCanvas");
            const ctx = canvas.getContext("2d");
            const statusBanner = container.querySelector("#farmer-status-banner");

            // Level tabs listener
            container.querySelectorAll(".level-tab").forEach(tab => {
                tab.addEventListener("click", () => {
                    const lvl = parseInt(tab.getAttribute("data-level"));
                    if (isLvlUnlocked(lvl)) {
                        cleanupAll();
                        if (window.playSound) window.playSound('click');
                        window.startGardenFarmGame(container, lvl);
                    }
                });
            });

            // Seed selector listeners
            function attachSeedListeners() {
                container.querySelectorAll(".seed-btn").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const seedKey = btn.getAttribute("data-seed");
                        const crop = CROPS[seedKey];
                        if (playerCoins >= crop.cost) {
                            selectedSeedKey = seedKey;
                            if (window.playSound) window.playSound('click');
                            container.querySelector("#seed-palette").innerHTML = buildSeedSelectorHTML();
                            attachSeedListeners();
                        } else {
                            if (window.playSound) window.playSound('pop');
                            updateStatus("❌ Yetersiz Altın! Ürün biçerek altın biriktir.");
                        }
                    });
                });
            }
            attachSeedListeners();

            function updateCoins(delta) {
                playerCoins = Math.max(0, playerCoins + delta);
                localStorage.setItem('minikio_farm_coins', playerCoins.toString());
                const coinEl = container.querySelector("#coin-amount");
                if (coinEl) coinEl.innerText = `$${playerCoins}`;
                container.querySelector("#seed-palette").innerHTML = buildSeedSelectorHTML();
                attachSeedListeners();
            }

            function updateStatus(text) {
                if (statusBanner) statusBanner.innerText = text;
            }

            function cleanupAll() {
                if (animFrameId) cancelAnimationFrame(animFrameId);
                activeTimers.forEach(t => clearInterval(t));
                activeTimers = [];
            }

            // Click handling on Canvas
            canvas.addEventListener("click", (e) => {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const clickX = (e.clientX - rect.left) * scaleX;
                const clickY = (e.clientY - rect.top) * scaleY;

                // Check which plot was clicked
                const clickedPlot = plots.find(p => 
                    clickX >= p.x && clickX <= p.x + p.w &&
                    clickY >= p.y && clickY <= p.y + p.h
                );

                if (clickedPlot) {
                    farmer.targetX = clickedPlot.x + clickedPlot.w / 2;
                    farmer.targetY = clickedPlot.y + clickedPlot.h / 2;
                    farmer.targetPlot = clickedPlot;
                    farmer.state = 'WALKING';

                    if (window.playSound) window.playSound('click');
                    updateStatus(`👨‍🌾 Çiftçi parsele yürüyor... (${clickedPlot.state === 'EMPTY' ? 'Ekim' : clickedPlot.state === 'SEEDED' ? 'Sulama' : clickedPlot.state === 'READY' ? 'Hasat' : 'Büyüme Hızlandırma'})`);
                }
            });

            function checkLevelCompletion() {
                const allDone = Object.keys(cfg.targets).every(cId => (currentProgress[cId] || 0) >= cfg.targets[cId]);
                if (allDone) {
                    cleanupAll();
                    if (window.playSound) window.playSound('success');

                    const nextLvl = levelNumber + 1;
                    const curMax = parseInt(localStorage.getItem('minikio_game_25_unlocked_v3') || "1");
                    if (nextLvl > curMax) localStorage.setItem('minikio_game_25_unlocked_v3', nextLvl);
                    if (window.updateStats) window.updateStats(cfg.scoreBase, 1);

                    setTimeout(() => {
                        container.innerHTML = `
                            <div style="text-align:center; padding:35px 20px; animation:bounceIn 0.5s ease; background:linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius:24px; border:3px solid #4ade80; box-shadow:0 12px 32px rgba(34,197,94,0.2);">
                                <div style="font-size:4.8rem; margin-bottom:12px; animation:pulse 1s infinite alternate;">🌾🚜🪙🎉</div>
                                <h2 style="color:#065f46; margin-bottom:8px; font-weight:800; font-size:1.8rem;">Tebrikler! Muhteşem Hasat!</h2>
                                <p style="color:#047857; font-size:1.1rem; max-width:420px; margin:0 auto 15px auto;">Tüm hedefleri tamamladın ve altın kasana bereket kattın!</p>
                                <div style="font-size:1.4rem; font-weight:800; color:#16a34a; background:white; display:inline-block; padding:10px 24px; border-radius:16px; border:2px solid #86efac; box-shadow:0 4px 12px rgba(0,0,0,0.06); margin-bottom:20px;">
                                    +${cfg.scoreBase} Bonus Çiftlik Puanı! ⭐
                                </div>
                                <div>
                                    <button class="btn btn-success" id="btn-next-farm" style="padding:14px 32px; font-size:1.15rem; font-weight:bold; border-radius:16px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); border:none; color:white; cursor:pointer; box-shadow:0 6px 18px rgba(16,185,129,0.35);">
                                        Sonraki Seviye ➡️
                                    </button>
                                </div>
                            </div>
                        `;
                        container.querySelector("#btn-next-farm").addEventListener("click", () => {
                            window.startGardenFarmGame(container, levelNumber < LEVELS.length ? levelNumber + 1 : 1);
                        });
                    }, 500);
                }
            }

            function triggerWaterEffect(targetX, targetY) {
                for (let i = 0; i < 22; i++) {
                    waterParticles.push({
                        x: targetX + (Math.random() * 30 - 15),
                        y: targetY - 20 + (Math.random() * 10 - 5),
                        vy: 2 + Math.random() * 3,
                        vx: Math.random() * 2 - 1,
                        size: 3 + Math.random() * 3,
                        alpha: 1
                    });
                }
            }

            function triggerCoinEffect(fromX, fromY, amount, cropIcon) {
                for (let i = 0; i < 5; i++) {
                    coinParticles.push({
                        x: fromX + (Math.random() * 20 - 10),
                        y: fromY + (Math.random() * 20 - 10),
                        targetX: 470,
                        targetY: 30,
                        speed: 0.05 + Math.random() * 0.03,
                        progress: 0,
                        icon: cropIcon || '🪙'
                    });
                }

                floatingTexts.push({
                    x: fromX,
                    y: fromY - 15,
                    text: `+$${amount} 🪙`,
                    alpha: 1,
                    vy: -1
                });
            }

            function executePlotAction(plot) {
                if (plot.state === 'EMPTY') {
                    const selectedCrop = CROPS[selectedSeedKey];
                    if (playerCoins >= selectedCrop.cost) {
                        updateCoins(-selectedCrop.cost);
                        plot.state = 'SEEDED';
                        plot.cropKey = selectedSeedKey;
                        farmer.state = 'PLANTING';
                        farmer.actionTimer = 25;
                        if (window.playSound) window.playSound('click');
                        updateStatus(`🌱 Tohum Ekildi: ${selectedCrop.name}. Şimdi 💧 Sula!`);
                    } else {
                        if (window.playSound) window.playSound('pop');
                        updateStatus("❌ Tohum almak için yeterli altın yok!");
                        farmer.state = 'IDLE';
                    }
                } else if (plot.state === 'SEEDED') {
                    // WATERING ACTION
                    plot.state = 'GROWING';
                    plot.progress = 0;
                    plot.startTime = Date.now();
                    const crop = CROPS[plot.cropKey];
                    plot.duration = crop.growTime * 1000;

                    farmer.state = 'WATERING';
                    farmer.actionTimer = 40;

                    triggerWaterEffect(plot.x + plot.w / 2, plot.y + plot.h / 2);
                    if (window.playSound) window.playSound('click');

                    updateStatus(`💧 Gerçek Su İle Sulandı! ${crop.name} büyüyor... ⌛`);

                    const interval = setInterval(() => {
                        const elapsed = Date.now() - plot.startTime;
                        const pct = Math.min(100, Math.floor((elapsed / plot.duration) * 100));
                        plot.progress = pct;

                        if (pct >= 100) {
                            plot.state = 'READY';
                            clearInterval(interval);
                            if (window.playSound) window.playSound('pop');
                        }
                    }, 200);

                    activeTimers.push(interval);

                } else if (plot.state === 'GROWING') {
                    // Boost speed with extra water
                    plot.startTime -= (plot.duration * 0.18);
                    farmer.state = 'WATERING';
                    farmer.actionTimer = 20;
                    triggerWaterEffect(plot.x + plot.w / 2, plot.y + plot.h / 2);
                    if (window.playSound) window.playSound('click');
                    updateStatus(`💧 Ekstra su verildi! Büyüme hızlandı! ✨`);
                } else if (plot.state === 'READY') {
                    // HARVESTING ACTION
                    const crop = CROPS[plot.cropKey];
                    const harvestedKey = plot.cropKey;
                    
                    if (currentProgress.hasOwnProperty(harvestedKey)) {
                        currentProgress[harvestedKey] = (currentProgress[harvestedKey] || 0) + 1;
                    }

                    updateCoins(crop.score);
                    triggerCoinEffect(plot.x + plot.w / 2, plot.y + plot.h / 2, crop.score, crop.icon);
                    if (window.playSound) window.playSound('success');

                    plot.state = 'EMPTY';
                    plot.cropKey = null;
                    plot.progress = 0;

                    farmer.state = 'HARVESTING';
                    farmer.actionTimer = 30;

                    container.querySelector("#farm-targets").innerHTML = buildTargetsHTML();
                    updateStatus(`✨ Harika! ${crop.name} biçildi! +$${crop.score} Altın Kazandın! 🪙`);

                    checkLevelCompletion();
                }
            }

            // Game Loop
            function update() {
                farmer.animTick++;

                // Movement logic
                if (farmer.state === 'WALKING') {
                    const dx = farmer.targetX - farmer.x;
                    const dy = farmer.targetY - farmer.y;
                    const dist = Math.hypot(dx, dy);

                    if (dx > 0) farmer.direction = 'RIGHT';
                    else if (dx < 0) farmer.direction = 'LEFT';

                    if (dist > 5) {
                        farmer.x += (dx / dist) * farmer.speed;
                        farmer.y += (dy / dist) * farmer.speed;
                    } else {
                        farmer.x = farmer.targetX;
                        farmer.y = farmer.targetY;
                        if (farmer.targetPlot) {
                            executePlotAction(farmer.targetPlot);
                            farmer.targetPlot = null;
                        } else {
                            farmer.state = 'IDLE';
                        }
                    }
                } else if (['WATERING', 'PLANTING', 'HARVESTING'].includes(farmer.state)) {
                    farmer.actionTimer--;
                    if (farmer.actionTimer <= 0) {
                        farmer.state = 'IDLE';
                    }
                }

                // Update Water Particles
                for (let i = waterParticles.length - 1; i >= 0; i--) {
                    const p = waterParticles[i];
                    p.y += p.vy;
                    p.x += p.vx;
                    p.alpha -= 0.03;
                    if (p.alpha <= 0) waterParticles.splice(i, 1);
                }

                // Update Coin Particles
                for (let i = coinParticles.length - 1; i >= 0; i--) {
                    const c = coinParticles[i];
                    c.progress += c.speed;
                    c.x += (c.targetX - c.x) * c.speed;
                    c.y += (c.targetY - c.y) * c.speed;
                    if (c.progress >= 1 || Math.hypot(c.targetX - c.x, c.targetY - c.y) < 15) {
                        coinParticles.splice(i, 1);
                    }
                }

                // Update Floating Texts
                for (let i = floatingTexts.length - 1; i >= 0; i--) {
                    const ft = floatingTexts[i];
                    ft.y += ft.vy;
                    ft.alpha -= 0.02;
                    if (ft.alpha <= 0) floatingTexts.splice(i, 1);
                }
            }

            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // 1. Draw Grass World & Decor Background
                ctx.fillStyle = "#4ade80";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Grass details / flowers
                ctx.fillStyle = "#22c55e";
                for (let i = 0; i < 15; i++) {
                    const gx = (i * 37) % canvas.width;
                    const gy = (i * 73) % canvas.height;
                    ctx.fillRect(gx, gy, 4, 8);
                    ctx.fillRect(gx + 4, gy + 2, 4, 6);
                }

                // Fences at borders
                ctx.fillStyle = "#b45309";
                ctx.fillRect(10, 10, canvas.width - 20, 8);
                ctx.fillRect(10, canvas.height - 18, canvas.width - 20, 8);

                // Barn House on Top Left
                ctx.fillStyle = "#ef4444";
                ctx.fillRect(20, 25, 70, 50);
                ctx.fillStyle = "#7f1d1d";
                ctx.beginPath();
                ctx.moveTo(15, 25);
                ctx.lineTo(55, 5);
                ctx.lineTo(95, 25);
                ctx.fill();
                ctx.fillStyle = "#fef08a";
                ctx.fillRect(40, 45, 30, 30);
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 0.7rem sans-serif";
                ctx.fillText("🛖 AMBAR", 30, 40);

                // Water Well on Top Right
                ctx.fillStyle = "#64748b";
                ctx.beginPath();
                ctx.arc(480, 45, 22, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#0284c7";
                ctx.beginPath();
                ctx.arc(480, 45, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#0f172a";
                ctx.font = "bold 0.75rem sans-serif";
                ctx.fillText("💧 KUYU", 460, 20);

                // 2. Draw Soil Bed Plots Grid
                plots.forEach(plot => {
                    let isWet = plot.state === 'GROWING' || plot.state === 'READY';
                    
                    // Outer soil bed border
                    ctx.fillStyle = isWet ? "#3b1c09" : "#5c2d12";
                    ctx.beginPath();
                    ctx.roundRect(plot.x, plot.y, plot.w, plot.h, 14);
                    ctx.fill();
                    ctx.strokeStyle = isWet ? "#78350f" : "#92400e";
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    // Dirt furrows / lines inside plot
                    ctx.strokeStyle = isWet ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.15)";
                    ctx.lineWidth = 2;
                    for (let l = 1; l < 4; l++) {
                        ctx.beginPath();
                        ctx.moveTo(plot.x + 8, plot.y + (plot.h / 4) * l);
                        ctx.lineTo(plot.x + plot.w - 8, plot.y + (plot.h / 4) * l);
                        ctx.stroke();
                    }

                    // Draw Crop / Sprout states
                    if (plot.state === 'EMPTY') {
                        ctx.fillStyle = "rgba(255,255,255,0.7)";
                        ctx.font = "0.75rem sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("🌱 Ek", plot.x + plot.w / 2, plot.y + plot.h / 2 + 4);
                    } else if (plot.state === 'SEEDED') {
                        ctx.fillStyle = "#78350f";
                        ctx.beginPath();
                        ctx.arc(plot.x + plot.w / 2, plot.y + plot.h / 2, 6, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // "Sula!" badge
                        ctx.fillStyle = "#0284c7";
                        ctx.beginPath();
                        ctx.roundRect(plot.x + plot.w/2 - 20, plot.y + plot.h - 18, 40, 14, 7);
                        ctx.fill();
                        ctx.fillStyle = "#ffffff";
                        ctx.font = "bold 0.65rem sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("💧 Sula", plot.x + plot.w / 2, plot.y + plot.h - 8);
                    } else if (plot.state === 'GROWING') {
                        const crop = CROPS[plot.cropKey];
                        let stageEmoji = '🌱';
                        if (plot.progress > 70) stageEmoji = '🌿';

                        ctx.font = `${1.2 + (plot.progress/100)*0.5}rem sans-serif`;
                        ctx.textAlign = "center";
                        ctx.fillText(stageEmoji, plot.x + plot.w / 2, plot.y + plot.h / 2 + 4);

                        // Growth Progress bar
                        const barW = plot.w - 16;
                        ctx.fillStyle = "rgba(0,0,0,0.5)";
                        ctx.fillRect(plot.x + 8, plot.y + plot.h - 12, barW, 6);
                        ctx.fillStyle = "#22c55e";
                        ctx.fillRect(plot.x + 8, plot.y + plot.h - 12, (barW * plot.progress) / 100, 6);
                    } else if (plot.state === 'READY') {
                        const crop = CROPS[plot.cropKey];
                        
                        // Glowing ready aura
                        ctx.fillStyle = "rgba(251, 191, 36, 0.25)";
                        ctx.beginPath();
                        ctx.arc(plot.x + plot.w / 2, plot.y + plot.h / 2, plot.w / 2.2, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.font = "2rem sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText(crop.icon, plot.x + plot.w / 2, plot.y + plot.h / 2 + 8);

                        // "Biç!" Badge
                        ctx.fillStyle = "#d97706";
                        ctx.beginPath();
                        ctx.roundRect(plot.x + plot.w/2 - 20, plot.y + plot.h - 18, 40, 14, 7);
                        ctx.fill();
                        ctx.fillStyle = "#ffffff";
                        ctx.font = "bold 0.65rem sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("✨ Biç!", plot.x + plot.w / 2, plot.y + plot.h - 8);
                    }
                });

                // 3. Draw Water Particles
                waterParticles.forEach(p => {
                    ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                });

                // 4. Draw Farmer Character Sprite (Vibrant 2D Vector Character)
                const bounce = farmer.state === 'WALKING' ? Math.sin(farmer.animTick * 0.35) * 4 : 0;
                const fx = farmer.x;
                const fy = farmer.y + bounce;

                // Character Ground Shadow & Selection Aura
                ctx.fillStyle = "rgba(0,0,0,0.25)";
                ctx.beginPath();
                ctx.ellipse(fx, farmer.y + 16, 16, 7, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                ctx.strokeStyle = "#10b981";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(fx, farmer.y + 16, 18, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.save();
                // Shadow for 3D depth
                ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
                ctx.shadowBlur = 6;
                ctx.shadowOffsetY = 4;

                // --- Farmer Legs ---
                ctx.fillStyle = "#1e3a8a"; // Dark blue jeans
                const legOffset = farmer.state === 'WALKING' ? Math.sin(farmer.animTick * 0.4) * 5 : 0;
                ctx.fillRect(fx - 8, fy + 4, 6, 12 + legOffset);
                ctx.fillRect(fx + 2, fy + 4, 6, 12 - legOffset);

                // Boots
                ctx.fillStyle = "#78350f";
                ctx.fillRect(fx - 10, fy + 14 + legOffset, 8, 5);
                ctx.fillRect(fx + 2, fy + 14 - legOffset, 8, 5);

                // --- Farmer Body / Overalls ---
                // Shirt (Red)
                ctx.fillStyle = "#ef4444";
                ctx.beginPath();
                ctx.roundRect(fx - 11, fy - 10, 22, 16, 4);
                ctx.fill();

                // Overalls (Vibrant Blue)
                ctx.fillStyle = "#0284c7";
                ctx.beginPath();
                ctx.roundRect(fx - 9, fy - 4, 18, 14, 3);
                ctx.fill();

                // Straps & Buttons
                ctx.fillStyle = "#0369a1";
                ctx.fillRect(fx - 7, fy - 10, 4, 8);
                ctx.fillRect(fx + 3, fy - 10, 4, 8);
                ctx.fillStyle = "#f59e0b"; // Gold buttons
                ctx.beginPath();
                ctx.arc(fx - 5, fy - 2, 2, 0, Math.PI * 2);
                ctx.arc(fx + 5, fy - 2, 2, 0, Math.PI * 2);
                ctx.fill();

                // --- Farmer Head & Face ---
                ctx.fillStyle = "#fdba74"; // Warm rosy skin
                ctx.beginPath();
                ctx.arc(fx, fy - 18, 10, 0, Math.PI * 2);
                ctx.fill();

                // Cheeks & Eyes
                ctx.fillStyle = "#f87171"; // Rosy cheeks
                ctx.beginPath();
                ctx.arc(fx - 5, fy - 16, 2.5, 0, Math.PI * 2);
                ctx.arc(fx + 5, fy - 16, 2.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#0f172a"; // Eyes
                ctx.beginPath();
                ctx.arc(fx - 4,   fy - 19, 1.8, 0, Math.PI * 2);
                ctx.arc(fx + 4,   fy - 19, 1.8, 0, Math.PI * 2);
                ctx.fill();

                // Smile
                ctx.strokeStyle = "#9a3412";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(fx, fy - 17, 4, 0.1, Math.PI - 0.1);
                ctx.stroke();

                // --- Straw Hat ---
                // Brim
                ctx.fillStyle = "#facc15"; // Bright yellow straw hat
                ctx.beginPath();
                ctx.ellipse(fx, fy - 24, 18, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#ca8a04";
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Crown
                ctx.fillStyle = "#eab308";
                ctx.beginPath();
                ctx.roundRect(fx - 9, fy - 34, 18, 11, 4);
                ctx.fill();

                // Hat Red Band
                ctx.fillStyle = "#dc2626";
                ctx.fillRect(fx - 9, fy - 26, 18, 3);

                ctx.restore();

                // --- Floating Badge / Pointer ---
                ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
                ctx.beginPath();
                ctx.roundRect(fx - 24, fy - 46, 48, 14, 7);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 0.65rem sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("👨‍🌾 Çiftçi", fx, fy - 36);

                // --- Tools Visualization during actions ---
                if (farmer.state === 'WATERING') {
                    ctx.font = "1.8rem sans-serif";
                    ctx.fillText("🚿", fx + (farmer.direction === 'RIGHT' ? 24 : -24), fy - 6);
                } else if (farmer.state === 'HARVESTING') {
                    ctx.font = "1.8rem sans-serif";
                    ctx.fillText("🧺", fx + (farmer.direction === 'RIGHT' ? 24 : -24), fy - 6);
                } else if (farmer.state === 'PLANTING') {
                    ctx.font = "1.6rem sans-serif";
                    ctx.fillText("🌱", fx + (farmer.direction === 'RIGHT' ? 22 : -22), fy + 4);
                }

                // 5. Draw Coin Particles
                coinParticles.forEach(c => {
                    ctx.font = "1.4rem sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText(c.icon, c.x, c.y);
                });

                // 6. Draw Floating Texts
                floatingTexts.forEach(ft => {
                    ctx.fillStyle = `rgba(217, 119, 6, ${ft.alpha})`;
                    ctx.font = "bold 1.1rem sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText(ft.text, ft.x, ft.y);
                });

                // Loop
                update();
                animFrameId = requestAnimationFrame(draw);
            }

            // Start Render Loop
            draw();
        };

        window.startPipeFlowGame = window.startGardenFarmGame;

        /* ============================================================
           OYUN 26: SATRANÇ & AKIL HAMLELERİ (2 Kişilik & Bilgisayar AI)
           ============================================================ */
        window.startChessGame = function(container, levelNumber) {
            // Mode State: '2P' (Two Players) or 'AI' (vs Computer)
            let gameMode = 'AI'; // Default mode
            let aiDifficulty = 'MEDIUM'; // EASY, MEDIUM, HARD

            // Unicode Chess Symbols mapping
            const SYMBOLS = {
                'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
                'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
            };

            const PIECE_NAMES = {
                'K': 'Şah', 'Q': 'Vezir', 'R': 'Kale', 'B': 'Fil', 'N': 'At', 'P': 'Piyon',
                'k': 'Şah', 'q': 'Vezir', 'r': 'Kale', 'b': 'Fil', 'n': 'At', 'p': 'Piyon'
            };

            // Game State
            let board = [];
            let currentTurn = 'W'; // 'W' = White, 'B' = Black
            let selectedCell = null; // {r, c}
            let validMoves = []; // Array of {r, c}
            let capturedWhite = [];
            let capturedBlack = [];
            let gameStatus = 'PLAYING'; // PLAYING, CHECKMATE, STALEMATE
            let lastMove = null; // { from: {r,c}, to: {r,c}, path: [{r,c}, ...] }
            let statusMessage = "⚪ Oyunu Başlat! Hamle yapmak için taştan birine tıkla.";

            function initBoard() {
                board = [
                    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
                    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
                    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
                ];
                currentTurn = 'W';
                selectedCell = null;
                validMoves = [];
                capturedWhite = [];
                capturedBlack = [];
                lastMove = null;
                gameStatus = 'PLAYING';
                statusMessage = "⚪ Beyaz'ın Sırası. Hamle yapmak için taş seç!";
            }

            function isWhite(p) { return p && p === p.toUpperCase(); }
            function isBlack(p) { return p && p === p.toLowerCase(); }
            function getColor(p) { if (!p) return null; return isWhite(p) ? 'W' : 'B'; }

            function cloneBoard(bd) {
                return bd.map(row => [...row]);
            }

            // Pseudo-legal move generator (without check verification)
            function getPseudoLegalMoves(bd, r, c) {
                const p = bd[r][c];
                if (!p) return [];
                const color = getColor(p);
                const moves = [];

                const addMove = (tr, tc) => {
                    if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
                        const targetColor = getColor(bd[tr][tc]);
                        if (targetColor !== color) {
                            moves.push({ r: tr, c: tc });
                            return targetColor === null; // Continue sliding if empty
                        }
                    }
                    return false; // Blocked by friendly or enemy piece
                };

                const type = p.toUpperCase();
                if (type === 'P') {
                    const dir = color === 'W' ? -1 : 1;
                    const startRank = color === 'W' ? 6 : 1;

                    // Forward 1 step
                    if (r + dir >= 0 && r + dir < 8 && bd[r + dir][c] === null) {
                        moves.push({ r: r + dir, c: c });
                        // Forward 2 steps from start
                        if (r === startRank && bd[r + 2 * dir][c] === null) {
                            moves.push({ r: r + 2 * dir, c: c });
                        }
                    }

                    // Diagonal captures
                    [-1, 1].forEach(dc => {
                        const tr = r + dir;
                        const tc = c + dc;
                        if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
                            const targetColor = getColor(bd[tr][tc]);
                            if (targetColor && targetColor !== color) {
                                moves.push({ r: tr, c: tc });
                            }
                        }
                    });
                } else if (type === 'N') {
                    const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
                    offsets.forEach(([dr, dc]) => addMove(r + dr, c + dc));
                } else if (type === 'B') {
                    const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
                    dirs.forEach(([dr, dc]) => {
                        let step = 1;
                        while (addMove(r + dr * step, c + dc * step)) step++;
                    });
                } else if (type === 'R') {
                    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
                    dirs.forEach(([dr, dc]) => {
                        let step = 1;
                        while (addMove(r + dr * step, c + dc * step)) step++;
                    });
                } else if (type === 'Q') {
                    const dirs = [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]];
                    dirs.forEach(([dr, dc]) => {
                        let step = 1;
                        while (addMove(r + dr * step, c + dc * step)) step++;
                    });
                } else if (type === 'K') {
                    const dirs = [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]];
                    dirs.forEach(([dr, dc]) => addMove(r + dr, c + dc));
                }

                return moves;
            }

            // Checks if King of given color is currently under attack
            function isKingInCheck(bd, color) {
                let kr = -1, kc = -1;
                const kingPiece = color === 'W' ? 'K' : 'k';
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        if (bd[r][c] === kingPiece) {
                            kr = r; kc = c;
                            break;
                        }
                    }
                }
                if (kr === -1) return false;

                const enemyColor = color === 'W' ? 'B' : 'W';
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        if (getColor(bd[r][c]) === enemyColor) {
                            const enemyMoves = getPseudoLegalMoves(bd, r, c);
                            if (enemyMoves.some(m => m.r === kr && m.c === kc)) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }

            // Strict legal moves that prevent leaving own King in Check
            function getStrictLegalMoves(bd, r, c) {
                const color = getColor(bd[r][c]);
                const pseudo = getPseudoLegalMoves(bd, r, c);

                return pseudo.filter(m => {
                    const testBd = cloneBoard(bd);
                    testBd[m.r][m.c] = testBd[r][c];
                    testBd[r][c] = null;
                    return !isKingInCheck(testBd, color);
                });
            }

            // Check if player of given color has any legal moves available
            function getAllStrictLegalMoves(bd, color) {
                const all = [];
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        if (getColor(bd[r][c]) === color) {
                            const moves = getStrictLegalMoves(bd, r, c);
                            moves.forEach(m => {
                                all.push({ from: { r, c }, to: m });
                            });
                        }
                    }
                }
                return all;
            }

            // Calculate intermediate squares passed during move
            function getMovePath(from, to) {
                const path = [];
                const dr = Math.sign(to.r - from.r);
                const dc = Math.sign(to.c - from.c);
                let curR = from.r + dr;
                let curC = from.c + dc;
                while (curR !== to.r || curC !== to.c) {
                    path.push({ r: curR, c: curC });
                    if (curR !== to.r) curR += dr;
                    if (curC !== to.c) curC += dc;
                }
                return path;
            }

            let isAnimatingMove = false;

            // Execute Move on Board with Smooth Physical Sliding Piece Animation
            function makeMove(from, to) {
                if (isAnimatingMove) return;

                const movingPiece = board[from.r][from.c];
                const targetPiece = board[to.r][to.c];
                if (!movingPiece) return;

                isAnimatingMove = true;

                // Create floating piece overlay on board for smooth physical sliding
                const fromTile = boardEl.children[from.r * 8 + from.c];
                const toTile = boardEl.children[to.r * 8 + to.c];

                const boardRect = boardEl.getBoundingClientRect();
                const fromRect = fromTile ? fromTile.getBoundingClientRect() : null;
                const toRect = toTile ? toTile.getBoundingClientRect() : null;

                if (fromRect && toRect && boardRect) {
                    const startX = fromRect.left - boardRect.left;
                    const startY = fromRect.top - boardRect.top;
                    const endX = toRect.left - boardRect.left;
                    const endY = toRect.top - boardRect.top;

                    // Create sliding piece clone
                    const slidePiece = document.createElement("div");
                    slidePiece.innerText = SYMBOLS[movingPiece];
                    slidePiece.style.cssText = `
                        position: absolute;
                        left: 0; top: 0;
                        width: ${fromRect.width}px;
                        height: ${fromRect.height}px;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 2.2rem; font-weight: bold;
                        color: ${isWhite(movingPiece) ? '#ffffff' : '#0f172a'};
                        text-shadow: ${isWhite(movingPiece) ? '0 2px 4px rgba(0,0,0,0.6)' : '0 1px 2px rgba(255,255,255,0.4)'};
                        z-index: 60; pointer-events: none;
                        transform: translate(${startX}px, ${startY}px);
                        transition: transform 0.65s cubic-bezier(0.25, 1, 0.5, 1);
                    `;
                    boardEl.style.position = "relative";
                    boardEl.appendChild(slidePiece);

                    if (fromTile) fromTile.style.opacity = "0.2";

                    requestAnimationFrame(() => {
                        slidePiece.style.transform = `translate(${endX}px, ${endY}px)`;
                    });

                    setTimeout(() => {
                        slidePiece.remove();
                        completeMove(from, to, movingPiece, targetPiece);
                        isAnimatingMove = false;
                    }, 650);
                } else {
                    completeMove(from, to, movingPiece, targetPiece);
                    isAnimatingMove = false;
                }
            }

            function completeMove(from, to, movingPiece, targetPiece) {
                if (targetPiece) {
                    if (getColor(targetPiece) === 'W') capturedWhite.push(targetPiece);
                    else capturedBlack.push(targetPiece);
                    if (window.playSound) window.playSound('pop');
                } else {
                    if (window.playSound) window.playSound('click');
                }

                // Record Last Move with step-by-step traversal path
                lastMove = {
                    from: { r: from.r, c: from.c },
                    to: { r: to.r, c: to.c },
                    path: getMovePath(from, to)
                };

                board[to.r][to.c] = movingPiece;
                board[from.r][from.c] = null;

                // Pawn Promotion to Queen
                if (movingPiece === 'P' && to.r === 0) board[to.r][to.c] = 'Q';
                if (movingPiece === 'p' && to.r === 7) board[to.r][to.c] = 'q';

                // Switch Turn
                currentTurn = currentTurn === 'W' ? 'B' : 'W';
                selectedCell = null;
                validMoves = [];

                // Check Game State (Checkmate / Stalemate)
                const opponentMoves = getAllStrictLegalMoves(board, currentTurn);
                const inCheck = isKingInCheck(board, currentTurn);

                if (opponentMoves.length === 0) {
                    if (inCheck) {
                        gameStatus = 'CHECKMATE';
                        const winner = currentTurn === 'W' ? "Siyah (🖤)" : "Beyaz (⚪)";
                        statusMessage = `🏆 ŞAH-MAT! ${winner} Oyunu Kazandı! 🎉`;
                        if (window.playSound) window.playSound('success');
                        if (window.updateStats) window.updateStats(200, 1);
                    } else {
                        gameStatus = 'STALEMATE';
                        statusMessage = "🤝 PAT! Hamle Kalmadı - Berabere!";
                        if (window.playSound) window.playSound('locked');
                    }
                } else if (inCheck) {
                    statusMessage = `⚠️ ŞAH! ${currentTurn === 'W' ? "Beyaz (⚪)" : "Siyah (🖤)"} Şah Tehdit Altında!`;
                } else {
                    statusMessage = `${currentTurn === 'W' ? "⚪ Beyaz'ın Sırası" : "🖤 Siyah'ın Sırası"}`;
                }

                render();

                // Trigger AI Turn if in AI mode and it's Black's turn (Deliberate 750ms slow-motion thinking)
                if (gameStatus === 'PLAYING' && gameMode === 'AI' && currentTurn === 'B') {
                    setTimeout(makeAiMove, 750);
                }
            }

            // Smart Minimax AI Move Generator for Black
            function makeAiMove() {
                if (gameStatus !== 'PLAYING' || currentTurn !== 'B') return;

                const legalMoves = getAllStrictLegalMoves(board, 'B');
                if (legalMoves.length === 0) return;

                const pieceVals = { 'P':10, 'N':30, 'B':32, 'R':50, 'Q':90, 'K':900 };

                let bestMove = null;
                let bestScore = -9999;

                legalMoves.sort(() => Math.random() - 0.5);

                legalMoves.forEach(m => {
                    const testBd = cloneBoard(board);
                    const target = testBd[m.to.r][m.to.c];
                    testBd[m.to.r][m.to.c] = testBd[m.from.r][m.from.c];
                    testBd[m.from.r][m.from.c] = null;

                    let score = 0;

                    if (target) {
                        score += (pieceVals[target.toUpperCase()] || 10) * 10;
                    }

                    if (m.to.r >= 2 && m.to.r <= 5 && m.to.c >= 2 && m.to.c <= 5) {
                        score += 5;
                    }

                    if (isKingInCheck(testBd, 'W')) {
                        score += 25;
                    }

                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = m;
                    }
                });

                if (!bestMove) bestMove = legalMoves[0];
                makeMove(bestMove.from, bestMove.to);
            }

            // HTML Layout
            const html = `
                <div class="chess-game" style="max-width:540px; margin:0 auto; user-select:none; font-family:inherit;">
                    <!-- Mode Selector Bar -->
                    <div style="display:flex; justify-content:center; gap:10px; margin-bottom:12px;">
                        <button id="btn-mode-ai" style="
                            padding:8px 16px; border-radius:14px; font-weight:800; border:2px solid #0284c7; cursor:pointer;
                            background:${gameMode === 'AI' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : '#ffffff'};
                            color:${gameMode === 'AI' ? '#ffffff' : '#0369a1'};
                            box-shadow:0 4px 10px rgba(0,0,0,0.08); transition:all 0.2s ease;
                        ">🤖 Bilgisayara Karşı</button>

                        <button id="btn-mode-2p" style="
                            padding:8px 16px; border-radius:14px; font-weight:800; border:2px solid #059669; cursor:pointer;
                            background:${gameMode === '2P' ? 'linear-gradient(135deg, #10b981, #059669)' : '#ffffff'};
                            color:${gameMode === '2P' ? '#ffffff' : '#059669'};
                            box-shadow:0 4px 10px rgba(0,0,0,0.08); transition:all 0.2s ease;
                        ">👥 2 Kişilik (Aynı Cihaz)</button>
                    </div>

                    <!-- Status Banner Card -->
                    <div id="chess-status" style="
                        background:linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                        border:2px solid #cbd5e1; border-radius:16px; padding:10px 14px; margin-bottom:12px;
                        text-align:center; font-size:1rem; font-weight:800; color:#1e293b;
                        box-shadow:0 4px 12px rgba(0,0,0,0.05); transition:all 0.3s ease;
                    ">
                        ${statusMessage}
                    </div>

                    <!-- Captured Pieces Display (Top/Bottom) -->
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#1e293b; color:white; padding:6px 14px; border-radius:12px 12px 0 0; font-size:0.85rem; font-weight:700;">
                        <span>🖤 Siyah Yenenler: <span id="captured-black" style="font-size:1.1rem; color:#cbd5e1;"></span></span>
                        <span>⚪ Beyaz Yenenler: <span id="captured-white" style="font-size:1.1rem; color:#cbd5e1;"></span></span>
                    </div>

                    <!-- 8x8 Chess Board -->
                    <div id="chess-board" style="
                        display:grid; grid-template-columns:repeat(8, 1fr);
                        border:4px solid #334155; border-radius:0 0 16px 16px; overflow:hidden;
                        box-shadow:0 12px 32px rgba(0,0,0,0.2); max-width:480px; margin:0 auto;
                    ">
                    </div>

                    <!-- Controls / Reset Button -->
                    <div style="margin-top:14px; text-align:center;">
                        <button id="btn-chess-reset" class="btn btn-primary" style="padding:10px 24px; font-weight:bold; border-radius:14px; background:linear-gradient(135deg, #475569, #334155); border:none; color:white; cursor:pointer;">
                            🔄 Yeniden Başlat
                        </button>
                    </div>
                </div>
            `;

            container.innerHTML = html;

            const boardEl = container.querySelector("#chess-board");

            container.querySelector("#btn-mode-ai").addEventListener("click", () => {
                gameMode = 'AI';
                if (window.playSound) window.playSound('click');
                initBoard();
                render();
            });

            container.querySelector("#btn-mode-2p").addEventListener("click", () => {
                gameMode = '2P';
                if (window.playSound) window.playSound('click');
                initBoard();
                render();
            });

            container.querySelector("#btn-chess-reset").addEventListener("click", () => {
                if (window.playSound) window.playSound('click');
                initBoard();
                render();
            });

            function render() {
                const btnAi = container.querySelector("#btn-mode-ai");
                const btn2p = container.querySelector("#btn-mode-2p");
                if (btnAi && btn2p) {
                    btnAi.style.background = gameMode === 'AI' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : '#ffffff';
                    btnAi.style.color = gameMode === 'AI' ? '#ffffff' : '#0369a1';
                    btn2p.style.background = gameMode === '2P' ? 'linear-gradient(135deg, #10b981, #059669)' : '#ffffff';
                    btn2p.style.color = gameMode === '2P' ? '#ffffff' : '#059669';
                }

                const statusEl = container.querySelector("#chess-status");
                if (statusEl) {
                    statusEl.innerText = statusMessage;
                    if (gameStatus === 'CHECKMATE') statusEl.style.borderColor = '#22c55e';
                    else if (statusMessage.includes('⚠️')) statusEl.style.borderColor = '#ef4444';
                    else statusEl.style.borderColor = '#cbd5e1';
                }

                const capWEl = container.querySelector("#captured-white");
                const capBEl = container.querySelector("#captured-black");
                if (capWEl) capWEl.innerText = capturedWhite.map(p => SYMBOLS[p]).join(' ');
                if (capBEl) capBEl.innerText = capturedBlack.map(p => SYMBOLS[p]).join(' ');

                const inCheck = isKingInCheck(board, currentTurn);

                // Add or remove Check Alert Banner
                let alertBanner = container.querySelector("#chess-alert-banner");
                if (inCheck && gameStatus === 'PLAYING') {
                    if (!alertBanner) {
                        alertBanner = document.createElement("div");
                        alertBanner.id = "chess-alert-banner";
                        boardEl.parentNode.insertBefore(alertBanner, boardEl);
                    }
                    alertBanner.style.cssText = `
                        background: linear-gradient(135deg, #dc2626, #b91c1c);
                        color: white; padding: 10px; border-radius: 14px;
                        font-weight: 800; font-size: 1.15rem; text-align: center;
                        box-shadow: 0 6px 18px rgba(220,38,38,0.4); margin-bottom: 10px;
                        animation: pulse 0.8s infinite alternate; border: 2px solid #fca5a5;
                    `;
                    alertBanner.innerHTML = `🚨 ⚠️ ŞAH! ${currentTurn === 'W' ? 'Beyaz (⚪)' : 'Siyah (🖤)'} Şah Tehdit Altında!`;
                } else if (alertBanner) {
                    alertBanner.remove();
                }

                // Render 8x8 Board Tiles
                boardEl.innerHTML = "";
                let inCheckKingPos = null;
                if (inCheck) {
                    const kSymbol = currentTurn === 'W' ? 'K' : 'k';
                    for (let r = 0; r < 8; r++) {
                        for (let c = 0; c < 8; c++) {
                            if (board[r][c] === kSymbol) {
                                inCheckKingPos = { r, c };
                                break;
                            }
                        }
                    }
                }

                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        const isDarkSquare = (r + c) % 2 === 1;
                        const tile = document.createElement("div");
                        const piece = board[r][c];

                        const isSelected = selectedCell && selectedCell.r === r && selectedCell.c === c;
                        const isValidTarget = validMoves.some(m => m.r === r && m.c === c);
                        const isKingCheckedTile = inCheckKingPos && inCheckKingPos.r === r && inCheckKingPos.c === c;

                        let bgColor = isDarkSquare ? '#b88b4a' : '#e3c16f';
                        if (isKingCheckedTile) bgColor = '#ef4444'; // Red check highlight
                        else if (isSelected) bgColor = '#facc15';
                        else if (isValidTarget) bgColor = isDarkSquare ? '#65a30d' : '#84cc16';

                        tile.style.cssText = `
                            aspect-ratio: 1;
                            background: ${bgColor};
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 2.2rem;
                            cursor: pointer;
                            position: relative;
                            box-shadow: ${isKingCheckedTile ? 'inset 0 0 12px #7f1d1d, 0 0 16px #ef4444' : 'inset 0 0 4px rgba(0,0,0,0.1)'};
                            transition: background 0.15s ease;
                        `;

                        if (piece) {
                            const isWhitePiece = isWhite(piece);
                            const pieceSpan = document.createElement("span");
                            pieceSpan.innerText = SYMBOLS[piece] || piece;
                            pieceSpan.style.cssText = `
                                color: ${isWhitePiece ? '#ffffff' : '#0f172a'};
                                text-shadow: ${isWhitePiece ? '0 2px 4px rgba(0,0,0,0.6)' : '0 1px 2px rgba(255,255,255,0.4)'};
                                font-weight: bold;
                                transform: scale(1.1);
                            `;
                            tile.appendChild(pieceSpan);
                        }

                        if (isValidTarget && !piece) {
                            const dot = document.createElement("div");
                            dot.style.cssText = `
                                width: 14px; height: 14px;
                                background: rgba(0,0,0,0.25);
                                border-radius: 50%;
                            `;
                            tile.appendChild(dot);
                        }

                        tile.addEventListener("click", () => {
                            if (gameStatus !== 'PLAYING') return;

                            if (gameMode === 'AI' && currentTurn === 'B') return;

                            if (selectedCell) {
                                if (isValidTarget) {
                                    makeMove(selectedCell, { r, c });
                                } else if (piece && getColor(piece) === currentTurn) {
                                    selectedCell = { r, c };
                                    validMoves = getStrictLegalMoves(board, r, c);
                                    if (window.playSound) window.playSound('click');
                                    render();
                                } else {
                                    selectedCell = null;
                                    validMoves = [];
                                    render();
                                }
                            } else {
                                if (piece && getColor(piece) === currentTurn) {
                                    selectedCell = { r, c };
                                    validMoves = getStrictLegalMoves(board, r, c);
                                    if (window.playSound) window.playSound('click');
                                    render();
                                }
                            }
                        });

                        boardEl.appendChild(tile);
                    }
                }

                // Checkmate / Outcome Modal Overlay
                let outcomeModal = container.querySelector("#chess-outcome-modal");
                if (gameStatus !== 'PLAYING') {
                    if (!outcomeModal) {
                        outcomeModal = document.createElement("div");
                        outcomeModal.id = "chess-outcome-modal";
                        boardEl.parentNode.appendChild(outcomeModal);
                    }

                    const isPlayerWin = (gameStatus === 'CHECKMATE' && currentTurn === 'B');
                    const isDraw = gameStatus === 'STALEMATE';

                    outcomeModal.style.cssText = `
                        position: absolute; top:0; left:0; right:0; bottom:0;
                        background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(6px);
                        display: flex; align-items: center; justify-content: center;
                        padding: 20px; z-index: 100; border-radius: 16px;
                    `;

                    if (isDraw) {
                        outcomeModal.innerHTML = `
                            <div style="text-align:center; padding:30px 24px; background:linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius:20px; border:3px solid #64748b; box-shadow:0 12px 32px rgba(0,0,0,0.3); animation:bounceIn 0.5s ease; max-width:400px; width:100%;">
                                <div style="font-size:4.5rem; margin-bottom:10px;">🤝♟️</div>
                                <h2 style="color:#1e293b; font-size:1.8rem; font-weight:800; margin-bottom:8px;">PAT! BERABERE!</h2>
                                <p style="color:#475569; font-size:1.05rem; margin-bottom:20px;">Yapılabilecek hiçbir yasal hamle kalmadı.</p>
                                <button id="btn-modal-restart" class="btn btn-secondary" style="padding:12px 28px; font-weight:bold; font-size:1.1rem; border-radius:14px; background:#475569; color:white; border:none; cursor:pointer;">🔄 Yeni Maç Başlat</button>
                            </div>
                        `;
                    } else if (isPlayerWin) {
                        outcomeModal.innerHTML = `
                            <div style="text-align:center; padding:30px 24px; background:linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius:20px; border:3px solid #22c55e; box-shadow:0 12px 32px rgba(34,197,94,0.35); animation:bounceIn 0.5s ease; max-width:400px; width:100%;">
                                <div style="font-size:4.8rem; margin-bottom:10px; animation:pulse 1s infinite alternate;">🏆👑🎉</div>
                                <h2 style="color:#065f46; font-size:1.8rem; font-weight:800; margin-bottom:8px;">TEBRİKLER! KAZANDIN!</h2>
                                <p style="color:#047857; font-size:1.1rem; margin-bottom:16px;">Harika bir strateji ile ŞAH-MAT yaptın!</p>
                                <div style="font-size:1.3rem; font-weight:800; color:#16a34a; background:white; display:inline-block; padding:8px 22px; border-radius:14px; margin-bottom:20px; border:2px solid #86efac; box-shadow:0 4px 12px rgba(0,0,0,0.06);">+200 Zafer Puanı! ⭐</div>
                                <div>
                                    <button id="btn-modal-restart" class="btn btn-success" style="padding:12px 28px; font-weight:bold; font-size:1.1rem; border-radius:14px; background:linear-gradient(135deg, #10b981, #059669); color:white; border:none; cursor:pointer; box-shadow:0 6px 18px rgba(16,185,129,0.35);">🔄 Yeni Maç Başlat</button>
                                </div>
                            </div>
                        `;
                    } else {
                        outcomeModal.innerHTML = `
                            <div style="text-align:center; padding:30px 24px; background:linear-gradient(135deg, #fef2f2, #fee2e2); border-radius:20px; border:3px solid #ef4444; box-shadow:0 12px 32px rgba(239,68,68,0.35); animation:bounceIn 0.5s ease; max-width:400px; width:100%;">
                                <div style="font-size:4.5rem; margin-bottom:10px;">🔒🤖💔</div>
                                <h2 style="color:#7f1d1d; font-size:1.7rem; font-weight:800; margin-bottom:8px;">ŞAH-MAT! ${gameMode === 'AI' ? 'BİLGİSAYAR KAZANDI' : 'SIYAH KAZANDI'}</h2>
                                <p style="color:#991b1b; font-size:1.05rem; margin-bottom:20px;">Şahın savunmasız kaldı. Yeni bir strateji ile tekrar dene!</p>
                                <div>
                                    <button id="btn-modal-restart" class="btn btn-danger" style="padding:12px 28px; font-weight:bold; font-size:1.1rem; border-radius:14px; background:linear-gradient(135deg, #ef4444, #dc2626); color:white; border:none; cursor:pointer; box-shadow:0 6px 18px rgba(239,68,68,0.35);">🔄 Tekrar Dene</button>
                                </div>
                            </div>
                        `;
                    }

                    outcomeModal.querySelector("#btn-modal-restart").addEventListener("click", () => {
                        if (window.playSound) window.playSound('click');
                        initBoard();
                        render();
                    });
                } else if (outcomeModal) {
                    outcomeModal.remove();
                }
            }

            initBoard();
            render();
        };

        window.startMastermindCodeGame = window.startChessGame;

        /* ============================================================
           OYUN 27: UNO RENKLİ KARTLAR (UNO Card Game Engine)
           ============================================================ */
        /* ============================================================
           OYUN 27: UNO RENKLİ KARTLAR (4-Player Real Table & Animation)
           ============================================================ */
        window.startUnoCardGame = function(container, levelNumber) {
            const COLORS = {
                RED: { name: "Kırmızı", bg: "linear-gradient(135deg, #ef4444, #dc2626)", hex: "#ef4444" },
                YELLOW: { name: "Sarı", bg: "linear-gradient(135deg, #f59e0b, #d97706)", hex: "#f59e0b" },
                GREEN: { name: "Yeşil", bg: "linear-gradient(135deg, #10b981, #059669)", hex: "#10b981" },
                BLUE: { name: "Mavi", bg: "linear-gradient(135deg, #3b82f6, #2563eb)", hex: "#3b82f6" },
                WILD: { name: "Joker", bg: "linear-gradient(135deg, #475569, #1e293b)", hex: "#475569" }
            };

            // Build standard UNO deck
            function createDeck() {
                const deck = [];
                const colorKeys = ['RED', 'YELLOW', 'GREEN', 'BLUE'];

                colorKeys.forEach(c => {
                    deck.push({ color: c, type: 'NUM', value: 0, label: '0' });
                    for (let n = 1; n <= 9; n++) {
                        deck.push({ color: c, type: 'NUM', value: n, label: String(n) });
                        deck.push({ color: c, type: 'NUM', value: n, label: String(n) });
                    }
                    deck.push({ color: c, type: 'SKIP', value: 'SKIP', label: '🚫' });
                    deck.push({ color: c, type: 'SKIP', value: 'SKIP', label: '🚫' });
                    deck.push({ color: c, type: 'REVERSE', value: 'REVERSE', label: '🔄' });
                    deck.push({ color: c, type: 'REVERSE', value: 'REVERSE', label: '🔄' });
                    deck.push({ color: c, type: 'DRAW2', value: 'DRAW2', label: '+2' });
                    deck.push({ color: c, type: 'DRAW2', value: 'DRAW2', label: '+2' });
                });

                for (let i = 0; i < 4; i++) {
                    deck.push({ color: 'WILD', type: 'WILD', value: 'WILD', label: '🌈' });
                    deck.push({ color: 'WILD', type: 'WILD4', value: 'WILD4', label: '🌈+4' });
                }

                // Shuffle
                for (let i = deck.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [deck[i], deck[j]] = [deck[j], deck[i]];
                }
                return deck;
            }

            const SEAT_ORDER = [0, 3, 2, 1]; // 0: Siz (Alt) -> 3: Bot 3 (Sağ) -> 2: Bot 2 (Üst/Karşı) -> 1: Bot 1 (Sol) -> 0: Siz
            let currentTurnOrderIdx = 0;
            let deck = createDeck();
            let playerHand = [];
            let bot1Hand = []; // Sol / Left (Seat 1)
            let bot2Hand = []; // Üst / Top (Seat 2)
            let bot3Hand = []; // Sağ / Right (Seat 3)
            let discardPile = [];
            let currentTurn = 0; // Seat index currently active
            let activeColor = 'RED';
            let gameStatus = 'PLAYING'; // PLAYING, WON, LOST
            let turnDirection = 1; // 1 = clockwise around circle, -1 = counter-clockwise
            let statusMsg = "🟢 Sıra Sende! Rengi veya sayısı uyan bir kart at.";
            let isChoosingColor = false;
            let isThrowingCard = false;
            let unoAnnounce = null;

            function initUnoGame() {
                deck = createDeck();
                playerHand = [];
                bot1Hand = [];
                bot2Hand = [];
                bot3Hand = [];
                discardPile = [];
                currentTurnOrderIdx = 0;
                currentTurn = SEAT_ORDER[currentTurnOrderIdx];
                turnDirection = 1;
                gameStatus = 'PLAYING';
                isChoosingColor = false;
                isThrowingCard = false;
                unoAnnounce = null;

                // Deal 7 cards to 4 players
                for (let i = 0; i < 7; i++) {
                    playerHand.push(deck.pop());
                    bot1Hand.push(deck.pop());
                    bot2Hand.push(deck.pop());
                    bot3Hand.push(deck.pop());
                }

                // First discard card must be a number card
                let firstCard = deck.pop();
                while (firstCard.color === 'WILD') {
                    deck.unshift(firstCard);
                    firstCard = deck.pop();
                }
                discardPile.push(firstCard);
                activeColor = firstCard.color;
                statusMsg = "🟢 Sıra Sende! Masadaki renge veya sayıya uygun kart at.";
            }

            function getTopCard() {
                return discardPile[discardPile.length - 1];
            }

            function isPlayable(card) {
                if (card.color === 'WILD') return true;
                const top = getTopCard();
                return card.color === activeColor || (card.type === top.type && card.value === top.value);
            }

            function drawCardFor(hand) {
                if (deck.length === 0) {
                    const top = discardPile.pop();
                    deck = [...discardPile];
                    for (let i = deck.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [deck[i], deck[j]] = [deck[j], deck[i]];
                    }
                    discardPile = [top];
                }
                if (deck.length > 0) {
                    hand.push(deck.pop());
                }
            }

            function getHandByTurn(turnIdx) {
                if (turnIdx === 0) return playerHand;
                if (turnIdx === 1) return bot1Hand;
                if (turnIdx === 2) return bot2Hand;
                return bot3Hand;
            }

            function getPlayerName(turnIdx) {
                if (turnIdx === 0) return "Sen";
                if (turnIdx === 1) return "Bot 1 (Sol)";
                if (turnIdx === 2) return "Bot 2 (Üst)";
                return "Bot 3 (Sağ)";
            }

            function advanceTurn(skip = false) {
                hasDrawnThisTurn = false;
                let step = turnDirection * (skip ? 2 : 1);
                currentTurnOrderIdx = (currentTurnOrderIdx + step + 40) % 4;
                currentTurn = SEAT_ORDER[currentTurnOrderIdx];

                if (currentTurn === 0) {
                    statusMsg = "🟢 SIRA SENDE! Rengi veya sayısı uyan bir kart seç ya da desteden kart çek.";
                } else {
                    statusMsg = `🤖 ${getPlayerName(currentTurn)} hamle sırasını kullanıyor...`;
                    setTimeout(playBotTurn, 1000);
                }
                render();
            }

            // Animate card thrown smoothly from player seat to center discard pile
            function animateCardThrow(card, seatIdx, onComplete) {
                isThrowingCard = true;
                const seatEl = container.querySelector(`#seat-player-${seatIdx}`);
                const discardEl = container.querySelector("#discard-card");

                if (seatEl && discardEl) {
                    const tableContainer = container.querySelector("#uno-table-felt");
                    const tableRect = tableContainer.getBoundingClientRect();
                    const seatRect = seatEl.getBoundingClientRect();
                    const discardRect = discardEl.getBoundingClientRect();

                    const startX = seatRect.left - tableRect.left + (seatRect.width / 2) - 34;
                    const startY = seatRect.top - tableRect.top + (seatRect.height / 2) - 48;
                    const endX = discardRect.left - tableRect.left;
                    const endY = discardRect.top - tableRect.top;

                    const throwCardEl = document.createElement("div");
                    throwCardEl.style.cssText = `
                        position: absolute;
                        width: 68px; height: 96px;
                        background: ${COLORS[card.color].bg};
                        border: 3px solid white; border-radius: 12px;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 1.8rem; font-weight: 900; color: white;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.6);
                        box-shadow: 0 10px 24px rgba(0,0,0,0.5);
                        z-index: 80; pointer-events: none;
                        transform: translate(${startX}px, ${startY}px) scale(0.7) rotate(0deg);
                        transition: transform 0.75s cubic-bezier(0.25, 1, 0.5, 1);
                    `;
                    throwCardEl.innerText = card.label;
                    tableContainer.appendChild(throwCardEl);

                    requestAnimationFrame(() => {
                        throwCardEl.style.transform = `translate(${endX}px, ${endY}px) scale(1) rotate(${Math.floor(Math.random()*20 - 10)}deg)`;
                    });

                    setTimeout(() => {
                        throwCardEl.remove();
                        if (window.playSound) window.playSound('click');
                        isThrowingCard = false;
                        onComplete();
                    }, 750);
                } else {
                    if (window.playSound) window.playSound('click');
                    isThrowingCard = false;
                    onComplete();
                }
            }

            function playCard(hand, cardIndex, chosenColor = null) {
                if (isThrowingCard) return;

                const card = hand[cardIndex];
                const seatIdx = currentTurn;

                animateCardThrow(card, seatIdx, () => {
                    hand.splice(cardIndex, 1);
                    discardPile.push(card);

                    if (card.color === 'WILD') {
                        activeColor = chosenColor || 'RED';
                    } else {
                        activeColor = card.color;
                    }

                    // Uno announcement check
                    if (hand.length === 1) {
                        unoAnnounce = seatIdx === 0 ? "👤 SEN UNO DEDİN! 📣" : `🤖 ${getPlayerName(seatIdx)} UNO DEDİ! 📣`;
                        if (window.playSound) window.playSound('pop');
                    } else {
                        unoAnnounce = null;
                    }

                    // Check Win condition
                    if (hand.length === 0) {
                        if (seatIdx === 0) {
                            gameStatus = 'WON';
                            statusMsg = "🏆 TEBRİKLER! TÜM KARTLARI BİTİRDİN VE KAZANDIN! 🎉";
                            if (window.playSound) window.playSound('success');
                            if (window.updateStats) window.updateStats(250, 1);
                        } else {
                            gameStatus = 'LOST';
                            statusMsg = `🔒 ${getPlayerName(seatIdx)} KAZANDI! TEKRAR DENE.`;
                            if (window.playSound) window.playSound('locked');
                        }
                        render();
                        return;
                    }

                    // Action Card Effects with Explicit Announcements & Circle Targeting
                    let skipNext = false;
                    const nextOrderIdx = (currentTurnOrderIdx + turnDirection + 40) % 4;
                    const nextSeat = SEAT_ORDER[nextOrderIdx];

                    if (card.type === 'SKIP') {
                        skipNext = true;
                        unoAnnounce = `🚫 PAS KARTI! ${getPlayerName(nextSeat)} PAS GEÇİLDİ!`;
                    } else if (card.type === 'REVERSE') {
                        turnDirection *= -1;
                        unoAnnounce = `🔄 DÖNÜŞ YÖNÜ TERSİNE ÇEVRİLDİ! (${turnDirection === 1 ? 'Saat Yönü ➡️' : 'Ters Yön ⬅️'})`;
                    } else if (card.type === 'DRAW2') {
                        const nextHand = getHandByTurn(nextSeat);
                        drawCardFor(nextHand);
                        drawCardFor(nextHand);
                        skipNext = true;
                        unoAnnounce = `➕2️⃣ ${getPlayerName(nextSeat)} 2 KART ÇEKTİ VE PAS GEÇİLDİ!`;
                    } else if (card.type === 'WILD4') {
                        const nextHand = getHandByTurn(nextSeat);
                        for (let k = 0; k < 4; k++) drawCardFor(nextHand);
                        skipNext = true;
                        unoAnnounce = `🌈+4 ${getPlayerName(nextSeat)} 4 KART ÇEKTİ VE PAS GEÇİLDİ!`;
                    }

                    advanceTurn(skipNext);
                });
            }

            function playBotTurn() {
                if (gameStatus !== 'PLAYING' || currentTurn === 0 || isThrowingCard) return;

                const hand = getHandByTurn(currentTurn);
                const playableIndices = hand.map((c, i) => isPlayable(c) ? i : -1).filter(i => i !== -1);

                if (playableIndices.length > 0) {
                    const pickIdx = playableIndices[Math.floor(Math.random() * playableIndices.length)];
                    const card = hand[pickIdx];
                    let chosenColor = null;
                    if (card.color === 'WILD') {
                        const counts = { RED:0, YELLOW:0, GREEN:0, BLUE:0 };
                        hand.forEach(c => { if (c.color !== 'WILD') counts[c.color]++; });
                        chosenColor = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
                    }
                    playCard(hand, pickIdx, chosenColor);
                } else {
                    drawCardFor(hand);
                    advanceTurn(false);
                }
            }

            // HTML Layout (4-Corner Real Table)
            const html = `
                <div class="uno-game" style="max-width:540px; margin:0 auto; user-select:none; font-family:inherit; background:#0f172a; border-radius:24px; padding:14px; color:white; box-shadow:0 12px 32px rgba(0,0,0,0.4);">
                    
                    <!-- Top Status Banner -->
                    <div id="uno-status" style="background:#1e293b; border:2px solid #0284c7; border-radius:14px; padding:8px 12px; text-align:center; font-weight:800; font-size:0.95rem; margin-bottom:12px; color:#f0f9ff; box-shadow:0 4px 12px rgba(0,0,0,0.2);">
                        ${statusMsg}
                    </div>

                    <!-- UNO Toast Message -->
                    <div style="text-align:center; font-size:1.15rem; font-weight:800; color:#fbbf24; min-height:24px; margin-bottom:6px;" id="uno-toast"></div>

                    <!-- 4-PLAYER REAL SQUARE FELT TABLE CONTAINER -->
                    <div id="uno-table-felt" style="
                        background: radial-gradient(circle, #15803d 0%, #14532d 100%);
                        border: 8px solid #78350f; border-radius: 32px;
                        padding: 16px; min-height: 330px; position: relative;
                        box-shadow: inset 0 0 32px rgba(0,0,0,0.6), 0 12px 32px rgba(0,0,0,0.4);
                        display: grid; grid-template-rows: auto 1fr auto; grid-template-columns: 1fr auto 1fr;
                        align-items: center; justify-items: center; row-gap: 12px;
                    ">
                        
                        <!-- TOP ROW (ROW 1, COL 2): Bot 2 (Üst - Karşıda) -->
                        <div style="grid-row: 1; grid-column: 2; text-align: center;">
                            <div id="seat-player-2" style="
                                padding: 6px 16px; border-radius: 20px; background: rgba(30, 41, 59, 0.9);
                                display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.85rem;
                                border: ${currentTurn === 2 ? '3px solid #facc15' : '2px solid rgba(255,255,255,0.2)'};
                                box-shadow: ${currentTurn === 2 ? '0 0 20px #facc15, inset 0 0 10px rgba(250,204,21,0.3)' : 'none'};
                                transition: all 0.3s ease;
                            ">
                                <span style="font-size:1.4rem;">🤖</span>
                                <span>Bot 2 (Üst - Karşıda): <span id="bot2-count" style="color:#fbbf24;">7</span> Kart</span>
                            </div>
                        </div>

                        <!-- MIDDLE LEFT (ROW 2, COL 1): Bot 1 (Sol) -->
                        <div style="grid-row: 2; grid-column: 1; justify-self: start;">
                            <div id="seat-player-1" style="
                                padding: 8px 12px; border-radius: 20px; background: rgba(30, 41, 59, 0.9);
                                display: flex; flex-direction: column; align-items: center; gap: 4px; font-weight: 800; font-size: 0.8rem;
                                border: ${currentTurn === 1 ? '3px solid #facc15' : '2px solid rgba(255,255,255,0.2)'};
                                box-shadow: ${currentTurn === 1 ? '0 0 20px #facc15, inset 0 0 10px rgba(250,204,21,0.3)' : 'none'};
                                transition: all 0.3s ease;
                            ">
                                <span style="font-size:1.5rem;">🤖</span>
                                <span>Bot 1 (Sol)</span>
                                <span id="bot1-count" style="color:#60a5fa; font-size:0.9rem;">7 Kart</span>
                            </div>
                        </div>

                        <!-- CENTER SQUARE (ROW 2, COL 2): Draw Pile, Active Color & Discard Pile -->
                        <div style="grid-row: 2; grid-column: 2; display: flex; align-items: center; gap: 14px; background: rgba(20, 83, 45, 0.5); padding: 12px 16px; border-radius: 20px; border: 2px dashed rgba(255,255,255,0.25);">
                            <!-- Draw Pile -->
                            <div id="draw-pile" style="cursor:pointer; text-align:center;">
                                <div style="width:64px; height:92px; background:linear-gradient(135deg, #334155, #0f172a); border:3px solid #64748b; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.8rem; font-weight:900; color:#38bdf8; box-shadow:0 6px 14px rgba(0,0,0,0.5); transform:rotate(-4deg); transition:transform 0.2s;">
                                    🎴
                                </div>
                                <div style="font-size:0.75rem; font-weight:800; margin-top:4px; color:#bbf7d0;">Deste (<span id="deck-count">0</span>)</div>
                            </div>

                            <!-- Active Color Ring -->
                            <div style="text-align:center;">
                                <div id="active-color-badge" style="width:34px; height:34px; border-radius:50%; margin:0 auto; border:3px solid white; box-shadow:0 0 16px rgba(255,255,255,0.5); transition:all 0.3s;"></div>
                            </div>

                            <!-- Discard Pile (Masa Kartı) -->
                            <div style="text-align:center;">
                                <div id="discard-card" style="width:68px; height:96px; border-radius:12px; border:3px solid white; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:900; font-size:1.8rem; color:white; box-shadow:0 8px 20px rgba(0,0,0,0.5); transform:rotate(3deg); transition:all 0.3s;">
                                </div>
                                <div style="font-size:0.75rem; font-weight:800; margin-top:4px; color:#bbf7d0;">Masa Kartı</div>
                            </div>
                        </div>

                        <!-- MIDDLE RIGHT (ROW 2, COL 3): Bot 3 (Sağ - Solun Karşısında) -->
                        <div style="grid-row: 2; grid-column: 3; justify-self: end;">
                            <div id="seat-player-3" style="
                                padding: 8px 12px; border-radius: 20px; background: rgba(30, 41, 59, 0.9);
                                display: flex; flex-direction: column; align-items: center; gap: 4px; font-weight: 800; font-size: 0.8rem;
                                border: ${currentTurn === 3 ? '3px solid #facc15' : '2px solid rgba(255,255,255,0.2)'};
                                box-shadow: ${currentTurn === 3 ? '0 0 20px #facc15, inset 0 0 10px rgba(250,204,21,0.3)' : 'none'};
                                transition: all 0.3s ease;
                            ">
                                <span style="font-size:1.5rem;">🤖</span>
                                <span>Bot 3 (Sağ)</span>
                                <span id="bot3-count" style="color:#fca5a5; font-size:0.9rem;">7 Kart</span>
                            </div>
                        </div>

                        <!-- BOTTOM ROW (ROW 3, COL 2): Human Player (Siz - Üstün Karşısında) -->
                        <div style="grid-row: 3; grid-column: 2; text-align: center;">
                            <div id="seat-player-0" style="
                                padding: 6px 16px; border-radius: 20px; background: rgba(30, 41, 59, 0.9);
                                display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.85rem;
                                border: ${currentTurn === 0 ? '3px solid #4ade80' : '2px solid rgba(255,255,255,0.2)'};
                                box-shadow: ${currentTurn === 0 ? '0 0 20px #4ade80, inset 0 0 10px rgba(74,222,128,0.3)' : 'none'};
                                transition: all 0.3s ease;
                            ">
                                <span style="font-size:1.4rem;">👤</span>
                                <span>Siz (Alt - Üstün Karşısında): <span id="player-count" style="color:#4ade80;">7</span> Kart</span>
                            </div>
                        </div>

                    </div>

                    <!-- Player Hand Deck Area -->
                    <div style="margin-top:12px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; padding:0 4px;">
                            <span style="font-weight:800; font-size:0.9rem; color:#4ade80;">👤 Elindeki Kartlar</span>
                            <button id="btn-pass-turn" style="display:none; padding:4px 12px; border-radius:10px; background:#f59e0b; color:white; font-weight:800; font-size:0.8rem; border:none; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.3);">⏭️ Pas Geç (Sırayı Devret)</button>
                        </div>
                        <div id="player-hand-container" style="display:flex; gap:6px; overflow-x:auto; padding:8px 4px; min-height:110px; align-items:center; scrollbar-width:thin;">
                        </div>
                    </div>

                    <!-- Reset Controls -->
                    <div style="margin-top:12px; text-align:center;">
                        <button id="btn-uno-reset" style="padding:8px 20px; border-radius:12px; background:#334155; border:none; color:white; font-weight:bold; cursor:pointer;">🔄 Yeni Oyuna Başla</button>
                    </div>

                    <!-- Color Selector Modal Overlay -->
                    <div id="color-modal" style="display:none; position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(15,23,42,0.92); border-radius:24px; z-index:100; flex-direction:column; align-items:center; justify-content:center; padding:20px;">
                        <h3 style="color:white; margin-bottom:16px; font-weight:800;">🌈 Bir Renk Seç!</h3>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; width:220px;">
                            <button class="btn-color-pick" data-color="RED" style="padding:16px; border-radius:14px; background:#ef4444; border:3px solid white; color:white; font-weight:800; font-size:1.1rem; cursor:pointer;">🔴 Kırmızı</button>
                            <button class="btn-color-pick" data-color="YELLOW" style="padding:16px; border-radius:14px; background:#f59e0b; border:3px solid white; color:white; font-weight:800; font-size:1.1rem; cursor:pointer;">🟡 Sarı</button>
                            <button class="btn-color-pick" data-color="GREEN" style="padding:16px; border-radius:14px; background:#10b981; border:3px solid white; color:white; font-weight:800; font-size:1.1rem; cursor:pointer;">🟢 Yeşil</button>
                            <button class="btn-color-pick" data-color="BLUE" style="padding:16px; border-radius:14px; background:#3b82f6; border:3px solid white; color:white; font-weight:800; font-size:1.1rem; cursor:pointer;">🔵 Mavi</button>
                        </div>
                    </div>

                    <!-- Win/Loss Outcome Modal Overlay -->
                    <div id="uno-outcome-modal" style="display:none; position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(15,23,42,0.94); border-radius:24px; z-index:110; flex-direction:column; align-items:center; justify-content:center; padding:20px;">
                        <div id="uno-outcome-content"></div>
                    </div>

                </div>
            `;

            container.innerHTML = html;

            const handContainer = container.querySelector("#player-hand-container");
            const discardCardEl = container.querySelector("#discard-card");
            const activeColorBadge = container.querySelector("#active-color-badge");
            const drawPileEl = container.querySelector("#draw-pile");
            const colorModal = container.querySelector("#color-modal");
            const outcomeModal = container.querySelector("#uno-outcome-modal");
            const outcomeContent = container.querySelector("#uno-outcome-content");
            const passTurnBtn = container.querySelector("#btn-pass-turn");
            let pendingWildIndex = null;

            function showErrorBanner(msg) {
                let errBanner = container.querySelector("#uno-error-banner");
                if (!errBanner) {
                    errBanner = document.createElement("div");
                    errBanner.id = "uno-error-banner";
                    const statusEl = container.querySelector("#uno-status");
                    statusEl.parentNode.insertBefore(errBanner, statusEl.nextSibling);
                }
                errBanner.style.cssText = `
                    background: linear-gradient(135deg, #ef4444, #b91c1c);
                    color: white; padding: 10px 14px; border-radius: 14px;
                    font-weight: 800; font-size: 0.95rem; text-align: center;
                    box-shadow: 0 6px 20px rgba(239,68,68,0.5); margin-bottom: 12px;
                    border: 2px solid #fca5a5; animation: bounceIn 0.3s ease;
                `;
                errBanner.innerText = msg;
                if (window.playSound) window.playSound('locked');

                setTimeout(() => {
                    if (errBanner) errBanner.remove();
                }, 3500);
            }

            function render() {
                container.querySelector("#bot1-count").innerText = bot1Hand.length;
                container.querySelector("#bot2-count").innerText = bot2Hand.length;
                container.querySelector("#bot3-count").innerText = bot3Hand.length;
                container.querySelector("#player-count").innerText = playerHand.length;
                container.querySelector("#deck-count").innerText = deck.length;

                if (passTurnBtn) {
                    passTurnBtn.style.display = (hasDrawnThisTurn && currentTurn === 0 && gameStatus === 'PLAYING') ? "inline-block" : "none";
                }

                const dirText = turnDirection === 1 ? "➡️ Saat Yönü" : "⬅️ Yön Ters";
                const activePlayerText = currentTurn === 0 ? "👉 SIRA SENDE! (Senin Koltuğun Işıklı)" : `👉 SIRA ${getPlayerName(currentTurn).toUpperCase()}'DE!`;
                container.querySelector("#uno-status").innerHTML = `<span style="color:#fbbf24; font-size:1.05rem;">${activePlayerText}</span> <span style="font-size:0.8rem; color:#94a3b8; margin-left:8px;">(${dirText})</span><br><span style="font-size:0.85rem; color:#e2e8f0; font-weight:normal;">${statusMsg}</span>`;

                const toastEl = container.querySelector("#uno-toast");
                if (toastEl) toastEl.innerText = unoAnnounce || "";

                // Active Turn Spotlights Update
                for (let i = 0; i < 4; i++) {
                    const seat = container.querySelector(`#seat-player-${i}`);
                    if (seat) {
                        const isCurrent = (currentTurn === i && gameStatus === 'PLAYING');
                        seat.style.border = isCurrent ? '3px solid #facc15' : '2px solid rgba(255,255,255,0.2)';
                        seat.style.boxShadow = isCurrent ? '0 0 22px #facc15, inset 0 0 12px rgba(250,204,21,0.4)' : 'none';
                        seat.style.opacity = isCurrent ? '1' : '0.65';
                        seat.style.transform = isCurrent ? 'scale(1.08)' : 'scale(1)';
                    }
                }

                // Active Color Badge Update
                activeColorBadge.style.background = COLORS[activeColor].bg;

                // Render Top Discard Card
                const top = getTopCard();
                if (top) {
                    discardCardEl.style.background = COLORS[top.color].bg;
                    discardCardEl.innerHTML = `
                        <div style="font-size:2.2rem; text-shadow:0 2px 6px rgba(0,0,0,0.5);">${top.label}</div>
                    `;
                }

                // Render Player Hand (ALL CARDS ARE CLICKABLE WITH VALIDATION WARNING IF INVALID)
                handContainer.innerHTML = "";
                playerHand.forEach((card, idx) => {
                    const isMyTurn = (currentTurn === 0 && gameStatus === 'PLAYING' && !isThrowingCard);
                    const cardEl = document.createElement("div");
                    cardEl.style.cssText = `
                        min-width: 64px; height: 96px;
                        background: ${COLORS[card.color].bg};
                        border: 2px solid rgba(255,255,255,0.85);
                        border-radius: 12px;
                        display: flex; flex-direction: column; align-items: center; justify-content: center;
                        font-size: 1.7rem; font-weight: 900; color: white;
                        cursor: ${isMyTurn ? 'pointer' : 'default'};
                        opacity: ${isMyTurn ? '1' : '0.8'};
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        transition: all 0.2s ease;
                        flex-shrink: 0;
                    `;
                    cardEl.innerHTML = `
                        <div style="text-shadow:0 2px 4px rgba(0,0,0,0.6);">${card.label}</div>
                    `;

                    cardEl.addEventListener("click", () => {
                        if (!isMyTurn) {
                            showErrorBanner("⏳ Henüz senin sıran değil! Işıklı koltuğuna sıra gelmesini bekle.");
                            return;
                        }

                        if (!isPlayable(card)) {
                            const top = getTopCard();
                            const topColorName = COLORS[activeColor].name;
                            showErrorBanner(`⚠️ YANLIŞ KART SEÇTİN! ${card.label} (${COLORS[card.color].name}) atılamaz! Masadaki Aktif Renk: ${topColorName}, Sembol/Sayı: ${top.label}. Rengi veya sayısı uyan bir kart seç ya da desteden kart çek!`);
                            return;
                        }

                        if (card.color === 'WILD') {
                            pendingWildIndex = idx;
                            colorModal.style.display = "flex";
                        } else {
                            playCard(playerHand, idx);
                        }
                    });

                    handContainer.appendChild(cardEl);
                });

                // Render Win/Loss Modal
                if (gameStatus !== 'PLAYING') {
                    outcomeModal.style.display = "flex";
                    if (gameStatus === 'WON') {
                        outcomeContent.innerHTML = `
                            <div style="text-align:center; padding:30px 24px; background:linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius:20px; border:3px solid #22c55e; color:#065f46; max-width:380px; width:100%; box-shadow:0 12px 32px rgba(34,197,94,0.4); animation:bounceIn 0.5s ease;">
                                <div style="font-size:4.5rem; margin-bottom:10px; animation:pulse 1s infinite alternate;">🏆🎴🎉</div>
                                <h2 style="font-size:1.8rem; font-weight:900; margin-bottom:8px;">TEBRİKLER! KAZANDIN!</h2>
                                <p style="font-size:1.05rem; margin-bottom:16px;">Tüm kartları 3 robottan önce bitirip UNO şampiyonu oldun!</p>
                                <div style="font-size:1.3rem; font-weight:800; color:#16a34a; background:white; display:inline-block; padding:8px 22px; border-radius:14px; margin-bottom:20px; border:2px solid #86efac;">+250 Zafer Puanı! ⭐</div>
                                <div>
                                    <button id="btn-modal-uno-restart" style="padding:12px 28px; font-weight:bold; font-size:1.1rem; border-radius:14px; background:linear-gradient(135deg, #10b981, #059669); color:white; border:none; cursor:pointer; box-shadow:0 6px 18px rgba(16,185,129,0.4);">🔄 Yeni Maç Başlat</button>
                                </div>
                            </div>
                        `;
                    } else {
                        outcomeContent.innerHTML = `
                            <div style="text-align:center; padding:30px 24px; background:linear-gradient(135deg, #fef2f2, #fee2e2); border-radius:20px; border:3px solid #ef4444; color:#7f1d1d; max-width:380px; width:100%; box-shadow:0 12px 32px rgba(239,68,68,0.4); animation:bounceIn 0.5s ease;">
                                <div style="font-size:4.5rem; margin-bottom:10px;">🔒🤖💔</div>
                                <h2 style="font-size:1.7rem; font-weight:900; margin-bottom:8px;">ROBOT KAZANDI</h2>
                                <p style="font-size:1.05rem; margin-bottom:20px;">Robotlardan biri elini senden önce bitirdi. Şansını tekrar dene!</p>
                                <div>
                                    <button id="btn-modal-uno-restart" style="padding:12px 28px; font-weight:bold; font-size:1.1rem; border-radius:14px; background:linear-gradient(135deg, #ef4444, #dc2626); color:white; border:none; cursor:pointer; box-shadow:0 6px 18px rgba(239,68,68,0.4);">🔄 Tekrar Dene</button>
                                </div>
                            </div>
                        `;
                    }

                    outcomeContent.querySelector("#btn-modal-uno-restart").addEventListener("click", () => {
                        if (window.playSound) window.playSound('click');
                        outcomeModal.style.display = "none";
                        initUnoGame();
                        render();
                    });
                } else {
                    outcomeModal.style.display = "none";
                }
            }

            let hasDrawnThisTurn = false;

            // Draw Pile Click Handler (Official UNO Rule: Drawn card can be played immediately if playable!)
            drawPileEl.addEventListener("click", () => {
                if (gameStatus !== 'PLAYING' || currentTurn !== 0 || isThrowingCard) return;
                if (hasDrawnThisTurn) {
                    showErrorBanner("⚠️ Bu turda zaten kart çektin! Elindeki uygun kartı at ya da Pas Geç butonuna tıkla.");
                    return;
                }

                drawCardFor(playerHand);
                hasDrawnThisTurn = true;
                if (window.playSound) window.playSound('click');

                const drawnCard = playerHand[playerHand.length - 1];

                if (isPlayable(drawnCard)) {
                    unoAnnounce = `🎴 DESTE ÇEKTİN! ${drawnCard.label} (${COLORS[drawnCard.color].name}) GELDİ! Uyuştuğu için TIKLAYIP ATABİLİRSİN!`;
                    statusMsg = `🟢 Çektiğin ${drawnCard.label} kartını atabilirsin veya Pas Geç butonuna basabilirsin.`;
                    render();
                } else {
                    unoAnnounce = `🎴 Desteden ${drawnCard.label} (${COLORS[drawnCard.color].name}) çektin. Uymadığı için sıra geçiyor...`;
                    render();
                    setTimeout(() => {
                        hasDrawnThisTurn = false;
                        advanceTurn(false);
                    }, 1200);
                }
            });

            if (passTurnBtn) {
                passTurnBtn.addEventListener("click", () => {
                    if (gameStatus !== 'PLAYING' || currentTurn !== 0) return;
                    hasDrawnThisTurn = false;
                    if (window.playSound) window.playSound('click');
                    advanceTurn(false);
                });
            }

            // Color Selector Buttons
            container.querySelectorAll(".btn-color-pick").forEach(btn => {
                btn.addEventListener("click", () => {
                    const chosen = btn.getAttribute("data-color");
                    colorModal.style.display = "none";
                    if (pendingWildIndex !== null) {
                        const idx = pendingWildIndex;
                        pendingWildIndex = null;
                        playCard(playerHand, idx, chosen);
                    }
                });
            });

            // Reset Game Button
            container.querySelector("#btn-uno-reset").addEventListener("click", () => {
                if (window.playSound) window.playSound('click');
                initUnoGame();
                render();
            });

            initUnoGame();
            render();
        };

        window.startGravitySlingshotGame = window.startUnoCardGame;

        /* ============================================================
           OYUN 28: RENKLİ YAPBOZ (Metinsiz Saf 3D Sanat Yapbozu)
           ============================================================ */
                window.startPuzzleGame = function(container, levelNumber) {
            const LEVELS = [
                { level: 1, name: "Pixar Dostları", rows: 2, cols: 2, scoreBase: 60, image: "assets/images/puzzle_pixar_1.jpg", emoji: "🦁" },
                { level: 2, name: "Sihirli Ejderha", rows: 3, cols: 3, scoreBase: 100, image: "assets/images/puzzle_pixar_2.jpg", emoji: "🐉" },
                { level: 3, name: "Galaksi Kedi", rows: 4, cols: 3, scoreBase: 120, image: "assets/images/puzzle_pixar_3.jpg", emoji: "🪐" },
                { level: 4, name: "Uzaylı Robot", rows: 4, cols: 4, scoreBase: 180, image: "assets/images/puzzle_pixar_4.jpg", emoji: "🤖" },
                { level: 5, name: "Sualtı Macerası", rows: 5, cols: 4, scoreBase: 220, image: "assets/images/puzzle_pixar_5.jpg", emoji: "🐠" },
                { level: 6, name: "Sihirli Orman", rows: 5, cols: 5, scoreBase: 300, image: "assets/images/puzzle_pixar_1.jpg", emoji: "🌲" },
                { level: 7, name: "Gökyüzü Şehri", rows: 6, cols: 5, scoreBase: 400, image: "assets/images/puzzle_pixar_2.jpg", emoji: "☁️" },
                { level: 8, name: "Derin Uzay", rows: 6, cols: 6, scoreBase: 500, image: "assets/images/puzzle_pixar_3.jpg", emoji: "🌌" },
                { level: 9, name: "Robot Şehri", rows: 7, cols: 6, scoreBase: 650, image: "assets/images/puzzle_pixar_4.jpg", emoji: "🌆" },
                { level: 10, name: "Kayıp Kıta", rows: 7, cols: 7, scoreBase: 800, image: "assets/images/puzzle_pixar_5.jpg", emoji: "🗺️" }
            ];

            const cfg = LEVELS[(levelNumber - 1) % LEVELS.length];
            const rows = cfg.rows;
            const cols = cfg.cols;
            const totalPieces = rows * cols;

            function isLvlUnlocked(lvl) {
                const max = parseInt(localStorage.getItem('minikio_game_28_unlocked_v3') || "1");
                return lvl <= max;
            }

            const imgUri = cfg.image;
            let placedCount = 0;
            let showHint = false;

            // Generate interlocking seams (Girinti ve Çıkıntılar)
            const hSeams = []; // Horizontal seams (rows-1) x cols
            for (let r = 0; r < rows - 1; r++) {
                hSeams[r] = [];
                for (let c = 0; c < cols; c++) {
                    hSeams[r][c] = (Math.random() < 0.5) ? 1 : -1;
                }
            }

            const vSeams = []; // Vertical seams rows x (cols-1)
            for (let r = 0; r < rows; r++) {
                vSeams[r] = [];
                for (let c = 0; c < cols - 1; c++) {
                    vSeams[r][c] = (Math.random() < 0.5) ? 1 : -1;
                }
            }

            function getPieceSeams(r, c) {
                const top = (r === 0) ? 0 : -hSeams[r - 1][c];
                const right = (c === cols - 1) ? 0 : vSeams[r][c];
                const bottom = (r === rows - 1) ? 0 : hSeams[r][c];
                const left = (c === 0) ? 0 : -vSeams[r][c - 1];
                return { top, right, bottom, left };
            }

            const puzzleW = 350;
            const puzzleH = Math.round(350 * (rows / cols)); // Keep aspect ratio depending on grid
            const pieceW = puzzleW / cols;
            const pieceH = puzzleH / rows;
            const tabSize = Math.min(pieceW, pieceH) * 0.25; // 25% of piece size

            function getJigsawPath(w, h, ts, top, right, bottom, left) {
                let d = `M ${ts} ${ts} `;
                // Top
                if (top === 0) d += `L ${ts + w} ${ts} `;
                else {
                    const sign = top === 1 ? -1 : 1;
                    const cx = ts + w/2, cy = ts, th = ts * sign;
                    d += `L ${cx - w*0.15} ${cy} `;
                    d += `C ${cx - w*0.15} ${cy + th*0.8}, ${cx - w*0.25} ${cy + th}, ${cx} ${cy + th} `;
                    d += `C ${cx + w*0.25} ${cy + th}, ${cx + w*0.15} ${cy + th*0.8}, ${cx + w*0.15} ${cy} `;
                    d += `L ${ts + w} ${ts} `;
                }
                // Right
                if (right === 0) d += `L ${ts + w} ${ts + h} `;
                else {
                    const sign = right === 1 ? 1 : -1;
                    const cx = ts + w, cy = ts + h/2, th = ts * sign;
                    d += `L ${cx} ${cy - h*0.15} `;
                    d += `C ${cx + th*0.8} ${cy - h*0.15}, ${cx + th} ${cy - h*0.25}, ${cx + th} ${cy} `;
                    d += `C ${cx + th} ${cy + h*0.25}, ${cx + th*0.8} ${cy + h*0.15}, ${cx} ${cy + h*0.15} `;
                    d += `L ${ts + w} ${ts + h} `;
                }
                // Bottom
                if (bottom === 0) d += `L ${ts} ${ts + h} `;
                else {
                    const sign = bottom === 1 ? 1 : -1;
                    const cx = ts + w/2, cy = ts + h, th = ts * sign;
                    d += `L ${cx + w*0.15} ${cy} `;
                    d += `C ${cx + w*0.15} ${cy + th*0.8}, ${cx + w*0.25} ${cy + th}, ${cx} ${cy + th} `;
                    d += `C ${cx - w*0.25} ${cy + th}, ${cx - w*0.15} ${cy + th*0.8}, ${cx - w*0.15} ${cy} `;
                    d += `L ${ts} ${ts + h} `;
                }
                // Left
                if (left === 0) d += `L ${ts} ${ts} `;
                else {
                    const sign = left === 1 ? -1 : 1;
                    const cx = ts, cy = ts + h/2, th = ts * sign;
                    d += `L ${cx} ${cy + h*0.15} `;
                    d += `C ${cx + th*0.8} ${cy + h*0.15}, ${cx + th} ${cy + h*0.25}, ${cx + th} ${cy} `;
                    d += `C ${cx + th} ${cy - h*0.25}, ${cx + th*0.8} ${cy - h*0.15}, ${cx} ${cy - h*0.15} `;
                    d += `L ${ts} ${ts} `;
                }
                d += "Z";
                return d;
            }

            const pieces = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const id = r * cols + c;
                    const seams = getPieceSeams(r, c);
                    const path = getJigsawPath(pieceW, pieceH, tabSize, seams.top, seams.right, seams.bottom, seams.left);
                    pieces.push({ id, r, c, path, placed: false });
                }
            }

            const shuffledPieces = [...pieces].sort(() => Math.random() - 0.5);

            const tabsHTML = LEVELS.map(l => {
                const unl = isLvlUnlocked(l.level);
                return `
                    <div class="level-tab ${unl ? 'unlocked' : 'locked'} ${l.level === levelNumber ? 'active' : ''}" data-level="${l.level}" style="
                        padding: 8px 16px; border-radius: 20px; background: ${l.level === levelNumber ? '#fbbf24' : (unl ? '#334155' : '#1e293b')};
                        color: ${l.level === levelNumber ? '#1e293b' : (unl ? '#f8fafc' : '#475569')};
                        font-weight: bold; cursor: ${unl ? 'pointer' : 'not-allowed'};
                        display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: 0.2s;
                    ">
                        ${unl ? l.emoji : '🔒'} Lvl ${l.level}
                    </div>
                `;
            }).join('');

            const html = `
                <div style="position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #0f172a, #1e293b); padding: 10px; box-sizing: border-box; overflow-y: auto; color: white;">
                    <div style="display:flex; overflow-x:auto; width:100%; max-width:600px; gap:10px; padding:10px; margin-bottom:15px; scrollbar-width:none;">
                        ${tabsHTML}
                    </div>
                    <div style="text-align: center; margin-bottom: 10px;">
                        <h2 style="font-size: 1.8rem; font-weight: 900; color: #fbbf24; margin:0;">${cfg.name}</h2>
                        <div style="color:#cbd5e1; font-size:0.9rem;">
                            Parçaları doğru yere sürükleyin! İpucu için 👁️ butonuna basın.
                        </div>
                    </div>
                    <button id="btn-puzzle-hint" style="margin-bottom:15px; padding:8px 20px; border-radius:20px; background:#3b82f6; border:none; color:white; font-weight:bold; cursor:pointer; display:flex; align-items:center; gap:8px;">
                        👁️ Resmi Göster/Gizle
                    </button>

                    <div style="position:relative; margin-bottom: 20px;">
                        <div id="puzzle-board" style="
                            width: ${puzzleW}px; height: ${puzzleH}px;
                            background: rgba(15, 23, 42, 0.8);
                            border: 6px solid #475569;
                            border-radius: 10px;
                            box-shadow: inset 0 0 40px rgba(0,0,0,0.9), 0 10px 25px rgba(0,0,0,0.5);
                            position: relative;
                        ">
                            <!-- Board will be populated with SVG outlines -->
                        </div>
                        <img id="hint-preview" src="${imgUri}" style="
                            position:absolute; top:6px; left:6px; width:${puzzleW}px; height:${puzzleH}px;
                            display:none; border-radius:4px; opacity:0.3; pointer-events:none; z-index:1;
                        ">
                    </div>

                    <div style="width:100%; max-width:500px;">
                        <div style="font-size:1rem; font-weight:800; color:#38bdf8; margin-bottom:10px; text-align:center;">
                            🧩 Sürükle ve Bırak
                        </div>
                        <div id="puzzle-tray" style="
                            display: flex; flex-wrap: wrap; gap: 5px; justify-content: center;
                            padding: 20px; background: #1e293b; border-radius: 20px;
                            border: 2px dashed #38bdf8; min-height: 120px;
                        ">
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;

            const boardEl = container.querySelector("#puzzle-board");
            const trayEl = container.querySelector("#puzzle-tray");
            const hintBtn = container.querySelector("#btn-puzzle-hint");
            const hintPreview = container.querySelector("#hint-preview");

            container.querySelectorAll(".level-tab").forEach(tab => {
                tab.addEventListener("click", () => {
                    const lvl = parseInt(tab.getAttribute("data-level"));
                    if (isLvlUnlocked(lvl)) {
                        if (window.playSound) window.playSound('click');
                        window.startPuzzleGame(container, lvl);
                    }
                });
            });

            hintBtn.addEventListener("click", () => {
                showHint = !showHint;
                hintPreview.style.display = showHint ? "block" : "none";
                if (window.playSound) window.playSound('click');
            });

            // Draw faint outlines on the board
            const boardSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            boardSvg.setAttribute("width", "100%");
            boardSvg.setAttribute("height", "100%");
            boardSvg.style.position = "absolute";
            boardSvg.style.top = "0";
            boardSvg.style.left = "0";
            boardEl.appendChild(boardSvg);

            pieces.forEach(p => {
                const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                // Offset the path back by tabSize to align visually with the grid
                g.setAttribute("transform", `translate(${p.c * pieceW - tabSize}, ${p.r * pieceH - tabSize})`);
                
                const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
                pathEl.setAttribute("d", p.path);
                pathEl.setAttribute("fill", "rgba(255,255,255,0.03)");
                pathEl.setAttribute("stroke", "rgba(255,255,255,0.15)");
                pathEl.setAttribute("stroke-width", "1");
                g.appendChild(pathEl);
                boardSvg.appendChild(g);

                // Add drop zone
                const zone = document.createElement("div");
                zone.dataset.id = p.id;
                zone.style.position = "absolute";
                zone.style.left = `${p.c * pieceW}px`;
                zone.style.top = `${p.r * pieceH}px`;
                zone.style.width = `${pieceW}px`;
                zone.style.height = `${pieceH}px`;
                zone.style.zIndex = "2";
                boardEl.appendChild(zone);

                zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.style.background = "rgba(255, 255, 255, 0.1)"; });
                zone.addEventListener("dragleave", () => { zone.style.background = "transparent"; });
                zone.addEventListener("drop", (e) => {
                    e.preventDefault();
                    zone.style.background = "transparent";
                    const draggedId = parseInt(e.dataTransfer.getData("text/plain"));
                    if (draggedId === p.id) {
                        placePiece(draggedId);
                    } else {
                        if(window.playSound) window.playSound('error');
                    }
                });
            });

            function renderTray() {
                trayEl.innerHTML = "";
                shuffledPieces.forEach(p => {
                    if (p.placed) return;
                    
                    const actualW = pieceW + 2 * tabSize;
                    const actualH = pieceH + 2 * tabSize;
                    
                    const wrapper = document.createElement("div");
                    wrapper.style.width = `${actualW}px`;
                    wrapper.style.height = `${actualH}px`;
                    wrapper.style.margin = `-${tabSize*0.8}px`; // collapse the negative space in the tray
                    
                    const pieceEl = document.createElement("div");
                    pieceEl.draggable = true;
                    pieceEl.dataset.id = p.id;
                    pieceEl.style.width = "100%";
                    pieceEl.style.height = "100%";
                    pieceEl.style.clipPath = `path('${p.path}')`;
                    pieceEl.style.WebkitClipPath = `path('${p.path}')`;
                    
                    const bgX = (p.c * pieceW) - tabSize;
                    const bgY = (p.r * pieceH) - tabSize;
                    pieceEl.style.backgroundImage = `url('${imgUri}')`;
                    pieceEl.style.backgroundSize = `${cols * pieceW}px ${rows * pieceH}px`;
                    pieceEl.style.backgroundPosition = `${-bgX}px ${-bgY}px`;
                    
                    // Glossy premium feel
                    pieceEl.style.filter = "drop-shadow(2px 4px 6px rgba(0,0,0,0.8))";
                    pieceEl.style.transition = "transform 0.2s";
                    
                    pieceEl.addEventListener("mouseenter", () => { pieceEl.style.transform = "scale(1.1) translateY(-5px)"; pieceEl.style.zIndex = "10"; });
                    pieceEl.addEventListener("mouseleave", () => { pieceEl.style.transform = "scale(1)"; pieceEl.style.zIndex = "1"; });
                    
                    pieceEl.addEventListener("dragstart", (e) => {
                        e.dataTransfer.setData("text/plain", p.id);
                        pieceEl.style.opacity = "0.5";
                        if(window.playSound) window.playSound('click');
                    });
                    pieceEl.addEventListener("dragend", () => { pieceEl.style.opacity = "1"; });
                    
                    wrapper.appendChild(pieceEl);
                    trayEl.appendChild(wrapper);
                });
            }

            function placePiece(id) {
                const piece = pieces.find(p => p.id === id);
                piece.placed = true;
                if(window.playSound) window.playSound('success');
                
                // Render perfectly snapped onto board
                const actualW = pieceW + 2 * tabSize;
                const actualH = pieceH + 2 * tabSize;
                
                const pieceEl = document.createElement("div");
                pieceEl.style.position = "absolute";
                pieceEl.style.left = `${(piece.c * pieceW) - tabSize}px`;
                pieceEl.style.top = `${(piece.r * pieceH) - tabSize}px`;
                pieceEl.style.width = `${actualW}px`;
                pieceEl.style.height = `${actualH}px`;
                pieceEl.style.clipPath = `path('${piece.path}')`;
                pieceEl.style.WebkitClipPath = `path('${piece.path}')`;
                
                const bgX = (piece.c * pieceW) - tabSize;
                const bgY = (piece.r * pieceH) - tabSize;
                pieceEl.style.backgroundImage = `url('${imgUri}')`;
                pieceEl.style.backgroundSize = `${cols * pieceW}px ${rows * pieceH}px`;
                pieceEl.style.backgroundPosition = `${-bgX}px ${-bgY}px`;
                pieceEl.style.zIndex = "5";
                
                // Add tiny border effect for 3D realism
                pieceEl.style.filter = "drop-shadow(0px 0px 1px rgba(0,0,0,0.8)) drop-shadow(2px 2px 3px rgba(0,0,0,0.5))";
                
                // Pop animation
                pieceEl.style.transform = "scale(1.2)";
                pieceEl.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                boardEl.appendChild(pieceEl);
                
                setTimeout(() => { pieceEl.style.transform = "scale(1)"; }, 50);
                
                placedCount++;
                renderTray();
                
                if (placedCount === totalPieces) {
                    setTimeout(() => {
                        if(window.playSound) window.playSound('success');
                        
                        let currentMax = parseInt(localStorage.getItem('minikio_game_28_unlocked_v3') || "1");
                        if (levelNumber === currentMax && levelNumber < LEVELS.length) {
                            localStorage.setItem('minikio_game_28_unlocked_v3', levelNumber + 1);
                        }
                        if (window.updateStats) window.updateStats(cfg.scoreBase, 1);
                        
                        const overlay = document.createElement("div");
                        overlay.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; flex-direction:column; align-items:center; justify-content:center; color:white; font-family:'Inter',sans-serif; z-index:100;";
                        
                        overlay.innerHTML = `
                            <h1 style="font-size:3rem; margin:0; color:#fbbf24; text-shadow: 0 4px 10px rgba(0,0,0,0.8);">🎉 MÜKEMMEL!</h1>
                            <p style="font-size:1.5rem; margin-bottom: 25px;">+${cfg.scoreBase} XP Kazandınız!</p>
                            <button id="btn-next-level" style="padding:15px 40px; font-size:1.3rem; font-weight:800; background:#3b82f6; color:white; border:none; border-radius:30px; cursor:pointer; box-shadow:0 8px 20px rgba(59,130,246,0.5); transition: 0.2s;">
                                ${levelNumber < LEVELS.length ? 'Sonraki Bölüme Geç ➡️' : 'Ana Menüye Dön 🏠'}
                            </button>
                        `;
                        
                        container.appendChild(overlay);
                        
                        container.querySelector("#btn-next-level").addEventListener("click", () => {
                            if(window.playSound) window.playSound('click');
                            if (levelNumber < LEVELS.length) {
                                window.startPuzzleGame(container, levelNumber + 1);
                            } else {
                                window.location.reload();
                            }
                        });
                    }, 500);
                }
            }

            renderTray();
        };
/* ============================================================
   OYUN 29: KIZMA BİRADER (LUDO)
   ============================================================ */
window.startLudoGame = function(container, levelNumber) {
    container.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; font-family: 'Inter', sans-serif; background: #F5EBE1; padding: 10px; box-sizing: border-box; overflow-y: auto; position: relative;">
            
            <div style="text-align: center; margin-bottom: 15px; z-index: 10; width: 100%; display: flex; flex-direction: column; align-items: center;">
                <h1 style="font-size: 2rem; font-weight: 900; color: #4b5563; text-shadow: 1px 1px 0px rgba(0,0,0,0.05); margin: 0 0 10px 0;">Kızma Birader</h1>
                
                <div style="display: flex; gap: 30px; align-items: center; justify-content: center;">
                    <div id="ludo-turn-indicator" style="padding: 12px 30px; border-radius: 25px; font-weight: 900; color: #fff; background: #FDE047; box-shadow: 0 6px 15px rgba(253, 224, 71, 0.5); transition: 0.3s; font-size: 1.1rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">
                        SARI OYUNCU (Zar Atınız)
                    </div>
                    
                    <!-- Zar (Dice) 3D Container -->
                    <div id="dice-container" style="perspective: 800px; width: 70px; height: 70px; cursor: pointer; z-index: 10;">
                        <div id="dice" style="width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform: rotateX(0deg) rotateY(0deg);">
                            <!-- Yüzeyler JS ile eklenecek -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Board Top-Down Container -->
            <div style="width: 100%; max-width: 700px; padding: 15px; background: transparent; position: relative; z-index: 5;">
                <div id="ludo-board-3d" style="width: 100%; aspect-ratio: 1; position: relative;">
                    <!-- Board Küreleri JS ile eklenecek -->
                </div>
            </div>
            
            <div id="ludo-info-msg" style="position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: rgba(31, 41, 55, 0.95); color: white; padding: 15px 30px; border-radius: 30px; font-weight: 800; font-size: 1.2rem; opacity: 0; transition: opacity 0.3s, bottom 0.3s; pointer-events: none; z-index: 100; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                Mesaj
            </div>
        </div>
    `;

    const diceEl = container.querySelector('#dice');
    const faces = [
        { rot: 'rotateY(0deg) translateZ(35px)', dots: [5] }, // 1
        { rot: 'rotateX(-90deg) translateZ(35px)', dots: [1, 9] }, // 2
        { rot: 'rotateY(90deg) translateZ(35px)', dots: [1, 5, 9] }, // 3
        { rot: 'rotateY(-90deg) translateZ(35px)', dots: [1, 3, 7, 9] }, // 4
        { rot: 'rotateX(90deg) translateZ(35px)', dots: [1, 3, 5, 7, 9] }, // 5
        { rot: 'rotateY(180deg) translateZ(35px)', dots: [1, 3, 4, 6, 7, 9] } // 6
    ];

    faces.forEach((face, idx) => {
        const f = document.createElement('div');
        f.style.position = 'absolute';
        f.style.width = '70px';
        f.style.height = '70px';
        f.style.background = 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)';
        f.style.border = '1px solid #d1d5db';
        f.style.borderRadius = '12px';
        f.style.transform = face.rot;
        f.style.display = 'grid';
        f.style.gridTemplateColumns = 'repeat(3, 1fr)';
        f.style.gridTemplateRows = 'repeat(3, 1fr)';
        f.style.padding = '8px';
        f.style.boxSizing = 'border-box';
        f.style.boxShadow = 'inset 0 0 15px rgba(0,0,0,0.1), 0 0 2px rgba(0,0,0,0.2)';

        for (let i = 1; i <= 9; i++) {
            const dot = document.createElement('div');
            dot.style.width = '100%';
            dot.style.height = '100%';
            if (face.dots.includes(i)) {
                dot.style.background = idx === 0 ? '#ef4444' : '#1f2937';
                dot.style.borderRadius = '50%';
                dot.style.boxShadow = 'inset 0 3px 5px rgba(0,0,0,0.6), 0 1px 1px rgba(255,255,255,0.8)';
                dot.style.transform = 'scale(0.7)';
            }
            f.appendChild(dot);
        }
        diceEl.appendChild(f);
    });

    const T_PINK = '#F48FB1';   const T_PINK_DARK = '#C2185B';
    const T_BLUE = '#90CAF9';   const T_BLUE_DARK = '#1565C0';
    const T_GREEN = '#A5D6A7';  const T_GREEN_DARK = '#2E7D32';
    const T_YELLOW = '#FFE082'; const T_YELLOW_DARK = '#FF8F00';
    const T_WHITE = '#ffffff';  const T_WHITE_DARK = '#9ba3af';

    const boardPath = [
        [1,5], [2,5], [3,5], [4,5], [5,5], 
        [5,4], [5,3], [5,2], [5,1], [6,1], 
        [7,1], [7,2], [7,3], [7,4], [7,5], 
        [8,5], [9,5], [10,5], [11,5], [11,6], 
        [11,7], [10,7], [9,7], [8,7], [7,7], 
        [7,8], [7,9], [7,10], [7,11], [6,11], 
        [5,11], [5,10], [5,9], [5,8], [5,7], 
        [4,7], [3,7], [2,7], [1,7], [1,6]
    ];

    const colors = [
        { id: 0, name: "PEMBE", hex: T_PINK, dark: T_PINK_DARK, homeStart: 0, base: [[1,1], [1,2], [2,1], [2,2]], stretch: [[2,6], [3,6], [4,6], [5,6]] },
        { id: 1, name: "MAVİ", hex: T_BLUE, dark: T_BLUE_DARK, homeStart: 10, base: [[10,1], [10,2], [11,1], [11,2]], stretch: [[6,2], [6,3], [6,4], [6,5]] },
        { id: 2, name: "YEŞİL", hex: T_GREEN, dark: T_GREEN_DARK, homeStart: 20, base: [[10,10], [10,11], [11,10], [11,11]], stretch: [[10,6], [9,6], [8,6], [7,6]] },
        { id: 3, name: "SARI", hex: T_YELLOW, dark: T_YELLOW_DARK, homeStart: 30, base: [[1,10], [1,11], [2,10], [2,11]], stretch: [[6,10], [6,9], [6,8], [6,7]] }
    ];

    const boardEl = container.querySelector('#ludo-board-3d');
    
    function getSphereCSS(color, darkColor) {
        return `radial-gradient(circle at 35% 35%, #ffffff 0%, ${color} 30%, ${darkColor} 85%, #000000 100%)`;
    }

    function createSphere(x, y, color, darkColor) {
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.width = 'calc(100% / 13 - 4px)';
        el.style.height = 'calc(100% / 13 - 4px)';
        el.style.left = `calc(${x * (100/13)}% + 2px)`;
        el.style.top = `calc(${y * (100/13)}% + 2px)`;
        el.style.borderRadius = '50%';
        el.style.background = getSphereCSS(color, darkColor);
        el.style.boxShadow = '2px 4px 6px rgba(0,0,0,0.2)';
        boardEl.appendChild(el);
    }

    function drawBoard() {
        // Draw path spheres
        boardPath.forEach((p, idx) => {
            if (idx === 0) createSphere(p[0], p[1], T_PINK, T_PINK_DARK);
            else if (idx === 10) createSphere(p[0], p[1], T_BLUE, T_BLUE_DARK);
            else if (idx === 20) createSphere(p[0], p[1], T_GREEN, T_GREEN_DARK);
            else if (idx === 30) createSphere(p[0], p[1], T_YELLOW, T_YELLOW_DARK);
            else createSphere(p[0], p[1], T_WHITE, T_WHITE_DARK);
        });

        // Draw home stretch spheres
        colors.forEach(c => {
            c.stretch.forEach(p => {
                createSphere(p[0], p[1], c.hex, c.dark);
            });
            // Draw bases
            c.base.forEach(p => {
                createSphere(p[0], p[1], c.hex, c.dark);
            });
        });

        // Draw arrows
        const arrowData = [
            { x: 0, y: 5, rot: 0, color: '#334155' },    // Pink arrow
            { x: 7, y: 0, rot: 90, color: '#334155' },   // Blue arrow
            { x: 12, y: 7, rot: 180, color: '#334155' }, // Green arrow
            { x: 5, y: 12, rot: -90, color: '#334155' }  // Yellow arrow
        ];

        arrowData.forEach(a => {
            const arrow = document.createElement('div');
            arrow.style.position = 'absolute';
            arrow.style.width = 'calc(100% / 13)';
            arrow.style.height = 'calc(100% / 13)';
            arrow.style.left = `calc(${a.x * (100/13)}%)`;
            arrow.style.top = `calc(${a.y * (100/13)}%)`;
            arrow.style.display = 'flex';
            arrow.style.alignItems = 'center';
            arrow.style.justifyContent = 'center';
            arrow.style.transform = `rotate(${a.rot}deg)`;
            arrow.style.fontSize = '2rem';
            arrow.style.color = a.color;
            arrow.style.fontWeight = '900';
            arrow.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';
            arrow.innerHTML = '➔';
            boardEl.appendChild(arrow);
        });
    }
    drawBoard();

    let players = colors.map(c => ({
        ...c,
        tokens: [
            { id: 0, state: -1, el: null },
            { id: 1, state: -1, el: null },
            { id: 2, state: -1, el: null },
            { id: 3, state: -1, el: null }
        ]
    }));

    function createTokenEl(color, darkColor) {
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.width = 'calc(100% / 13 - 2px)';
        el.style.height = 'calc(100% / 13 - 2px)';
        el.style.borderRadius = '50%';
        // Tokens have a slightly stronger highlight to pop out
        el.style.background = `radial-gradient(circle at 30% 30%, #ffffff 0%, ${color} 40%, ${darkColor} 90%, #000000 100%)`;
        el.style.boxShadow = '0 8px 12px rgba(0,0,0,0.5), inset 0 -4px 8px rgba(0,0,0,0.4)';
        el.style.transition = 'top 0.4s ease, left 0.4s ease, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        el.style.cursor = 'pointer';
        el.style.zIndex = '10';
        return el;
    }

    function updateTokenPos(pId, tId) {
        const p = players[pId];
        const t = p.tokens[tId];
        let targetX = 0, targetY = 0;

        if (t.state === -1) {
            targetX = p.base[t.id][0];
            targetY = p.base[t.id][1];
        } else if (t.state >= 0 && t.state < 40) {
            const pathIndex = (p.homeStart + t.state) % 40;
            targetX = boardPath[pathIndex][0];
            targetY = boardPath[pathIndex][1];
        } else if (t.state >= 40 && t.state < 44) {
            const stretchIndex = t.state - 40;
            targetX = p.stretch[stretchIndex][0];
            targetY = p.stretch[stretchIndex][1];
        } else if (t.state === 44) {
            targetX = 6; targetY = 6; // Center
        }

        t.el.style.left = `calc(${targetX * (100/13)}% + 1px)`;
        t.el.style.top = `calc(${targetY * (100/13)}% + 1px)`;
        
        t.el.style.transform = 'scale(1.2) translateY(-10px)';
        setTimeout(() => {
            if(t.el) t.el.style.transform = 'scale(1) translateY(0)';
        }, 250);
    }

    players.forEach((p, pId) => {
        p.tokens.forEach(t => {
            t.el = createTokenEl(p.hex, p.dark);
            boardEl.appendChild(t.el);
            updateTokenPos(pId, t.id);
            
            t.el.addEventListener('click', () => {
                handleTokenClick(pId, t.id);
            });
        });
    });

    let currentTurn = 0; // 0: Pink, 1: Blue, 2: Green, 3: Yellow
    let diceValue = 0;
    let hasRolled = false;
    let finishedPlayers = [];
    let turnInd = container.querySelector('#ludo-turn-indicator');
    let infoMsg = container.querySelector('#ludo-info-msg');

    function showMsg(msg) {
        infoMsg.innerText = msg;
        infoMsg.style.opacity = '1';
        infoMsg.style.bottom = '40px';
        setTimeout(() => { 
            infoMsg.style.opacity = '0'; 
            infoMsg.style.bottom = '20px';
        }, 2000);
    }

    function switchTurn(extraTurn = false) {
        if (finishedPlayers.length >= 3) return; // Oyun bitmişse dur
        
        if (!extraTurn) {
            do {
                currentTurn = (currentTurn + 1) % 4;
            } while (finishedPlayers.includes(currentTurn));
        }
        hasRolled = false;
        diceValue = 0;
        turnInd.innerText = `${players[currentTurn].name} OYUNCU (Zar Atınız)`;
        turnInd.style.background = players[currentTurn].hex;
        turnInd.style.color = '#1f2937'; 
        turnInd.style.boxShadow = `0 6px 15px ${players[currentTurn].hex}88`;
        
        diceEl.querySelectorAll('div').forEach(face => {
            face.style.border = `3px solid ${players[currentTurn].hex}`;
        });
        
        // Zarın rotasyonu sadece zaratıldığında değişir, sıra değiştiğinde değil.
    }
    switchTurn(true); 

    diceEl.parentElement.addEventListener('click', () => {
        if (hasRolled) return;
        if(window.playSound) window.playSound('click');
        hasRolled = true;
        
        let rx = Math.floor(Math.random() * 4 + 2) * 360; 
        let ry = Math.floor(Math.random() * 4 + 2) * 360;
        
        diceValue = Math.floor(Math.random() * 6) + 1;
        
        let finalRotX = rx;
        let finalRotY = ry;
        
        if(diceValue===1) { finalRotX += 0;   finalRotY += 0; }
        if(diceValue===2) { finalRotX += 90;  finalRotY += 0; }
        if(diceValue===3) { finalRotX += 0;   finalRotY += -90; }
        if(diceValue===4) { finalRotX += 0;   finalRotY += 90; }
        if(diceValue===5) { finalRotX += -90; finalRotY += 0; }
        if(diceValue===6) { finalRotX += 0;   finalRotY += 180; }

        diceEl.style.transform = `rotateX(${finalRotX}deg) rotateY(${finalRotY}deg)`;

        setTimeout(() => {
            if(window.playSound) window.playSound('success');
            turnInd.innerText = `${players[currentTurn].name} OYUNCU (${diceValue} attı)`;
            checkPossibleMoves();
        }, 850);
    });

    function checkPossibleMoves() {
        const p = players[currentTurn];
        let canMove = false;
        
        p.tokens.forEach(t => {
            if (t.state === -1 && diceValue === 6) canMove = true;
            if (t.state >= 0 && t.state + diceValue <= 44) canMove = true;
        });

        if (!canMove) {
            showMsg("Hamle yapılamıyor...");
            setTimeout(() => switchTurn(diceValue === 6), 1500); // 6 atan tekrar oynar
        } else {
            p.tokens.forEach(t => {
                if ((t.state === -1 && diceValue === 6) || (t.state >= 0 && t.state + diceValue <= 44)) {
                    t.el.style.boxShadow = `0 0 0 4px #fff, 0 0 15px ${p.hex}, 0 8px 12px rgba(0,0,0,0.6)`; 
                    t.el.style.transform = 'scale(1.15) translateY(-5px)'; 
                }
            });
        }
    }

    function checkKill(pId, tId) {
        const p = players[pId];
        const t = p.tokens[tId];
        if (t.state < 0 || t.state > 39) return false;

        const absPos = (p.homeStart + t.state) % 40;
        
        let killed = false;
        players.forEach((otherP, oId) => {
            if (oId === pId) return;
            otherP.tokens.forEach((otherT, otId) => {
                if (otherT.state >= 0 && otherT.state <= 39) {
                    const otherAbs = (otherP.homeStart + otherT.state) % 40;
                    if (absPos === otherAbs) {
                        otherT.state = -1;
                        updateTokenPos(oId, otId);
                        killed = true;
                        showMsg(`😲 ${otherP.name} eve gönderildi!`);
                        if(window.playSound) window.playSound('error');
                    }
                }
            });
        });
        return killed;
    }

    function handleTokenClick(pId, tId) {
        if (pId !== currentTurn || !hasRolled) return;
        const p = players[pId];
        const t = p.tokens[tId];
        
        let moved = false;

        if (t.state === -1) {
            if (diceValue === 6) {
                t.state = 0;
                moved = true;
            }
        } else if (t.state >= 0) {
            if (t.state + diceValue <= 44) {
                let steps = diceValue;
                let intv = setInterval(() => {
                    t.state++;
                    updateTokenPos(pId, tId);
                    if(window.playSound) window.playSound('click');
                    steps--;
                    if(steps === 0) {
                        clearInterval(intv);
                        finalizeMove(pId, tId);
                    }
                }, 200);
                
                hasRolled = false; 
                p.tokens.forEach(tk => {
                    tk.el.style.boxShadow = '0 8px 12px rgba(0,0,0,0.5), inset 0 -4px 8px rgba(0,0,0,0.4)';
                    tk.el.style.transform = 'scale(1) translateY(0)';
                });
                return;
            }
        }

        if (moved) {
            updateTokenPos(pId, tId);
            finalizeMove(pId, tId);
        }
    }

    function finalizeMove(pId, tId) {
        const p = players[pId];
        p.tokens.forEach(tk => {
            tk.el.style.boxShadow = '0 8px 12px rgba(0,0,0,0.5), inset 0 -4px 8px rgba(0,0,0,0.4)';
            tk.el.style.transform = 'scale(1) translateY(0)';
        });

        const killed = checkKill(pId, tId);
        const t = p.tokens[tId];
        
        let extraTurn = false;
        if (diceValue === 6 || killed || t.state === 44) {
            extraTurn = true;
            if(t.state === 44) showMsg(`✨ ${p.name} bir piyonu hedefe ulaştırdı! ✨`);
        }

        if (p.tokens.every(tk => tk.state === 44) && !finishedPlayers.includes(pId)) {
            finishedPlayers.push(pId);
            let rank = finishedPlayers.length;
            showMsg(`🏆 ${p.name} ${rank}. OLDU! 🏆`);
            if(window.playSound) window.playSound('success');
            
            let cx = (p.base[0][0] + p.base[3][0]) / 2;
            let cy = (p.base[0][1] + p.base[3][1]) / 2;
            let rankEl = document.createElement('div');
            rankEl.innerText = `${rank}. OLDU`;
            rankEl.style.position = 'absolute';
            rankEl.style.left = `calc(${cx * (100/13)}% + 2px)`;
            rankEl.style.top = `calc(${cy * (100/13)}% + 2px)`;
            rankEl.style.transform = 'translate(-50%, -50%)';
            rankEl.style.color = '#fff';
            rankEl.style.fontWeight = '900';
            rankEl.style.fontSize = '1.3rem';
            rankEl.style.textShadow = '0 3px 6px rgba(0,0,0,0.9)';
            rankEl.style.zIndex = '20';
            boardEl.appendChild(rankEl);
            
            if (finishedPlayers.length === 3) {
                let lastPlayerId = [0,1,2,3].find(id => !finishedPlayers.includes(id));
                finishedPlayers.push(lastPlayerId);
                const lastP = players[lastPlayerId];
                
                let lx = (lastP.base[0][0] + lastP.base[3][0]) / 2;
                let ly = (lastP.base[0][1] + lastP.base[3][1]) / 2;
                let lastRankEl = document.createElement('div');
                lastRankEl.innerText = `SONUNCU`;
                lastRankEl.style.position = 'absolute';
                lastRankEl.style.left = `calc(${lx * (100/13)}% + 2px)`;
                lastRankEl.style.top = `calc(${ly * (100/13)}% + 2px)`;
                lastRankEl.style.transform = 'translate(-50%, -50%)';
                lastRankEl.style.color = '#fff';
                lastRankEl.style.fontWeight = '900';
                lastRankEl.style.fontSize = '1.3rem';
                lastRankEl.style.textShadow = '0 3px 6px rgba(0,0,0,0.9)';
                lastRankEl.style.zIndex = '20';
                boardEl.appendChild(lastRankEl);
                
                setTimeout(() => {
                    showMsg(`🏁 OYUN BİTTİ! 🏁`);
                    turnInd.innerText = "OYUN BİTTİ";
                }, 2000);
                return;
            }
            extraTurn = false;
        }

        setTimeout(() => switchTurn(extraTurn), 1000);
    }

    window.addEventListener('resize', () => {
        players.forEach((p, pId) => {
            p.tokens.forEach(t => updateTokenPos(pId, t.id));
        });
    });
}

/* ============================================================
   OYUN 30: 2048
   ============================================================ */
window.start2048Game = function(container, levelNumber) {
    container.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #1e293b, #0f172a); padding: 15px; box-sizing: border-box; overflow-y: auto; color: white;">
            
            <div style="text-align: center; margin-bottom: 20px; width: 100%;">
                <h1 style="font-size: 2.2rem; font-weight: 900; color: #f59e0b; margin: 0 0 10px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Dokuz Taş</h1>
                <p style="color: #94a3b8; margin: 0 0 15px 0; font-size: 0.95rem;">Cız (3'lü) yap, +1 puan kazan. İlk 10 puan yapan kazanır!</p>
                
                <div style="display: flex; justify-content: center; gap: 30px; margin-bottom: 10px;">
                    <div id="p1-panel" style="background: rgba(59, 130, 246, 0.2); border: 2px solid #3b82f6; padding: 10px 20px; border-radius: 12px; text-align: center; width: 120px; transition: 0.3s;">
                        <div style="font-weight: bold; color: #60a5fa;">MAVİ</div>
                        <div id="p1-score" style="font-size: 2rem; font-weight: 900; color: white;">0</div>
                        <div id="p1-pieces" style="font-size: 0.8rem; color: #94a3b8;">Kalan Taş: 9</div>
                    </div>
                    
                    <div id="p2-panel" style="background: rgba(239, 68, 68, 0.2); border: 2px solid transparent; padding: 10px 20px; border-radius: 12px; text-align: center; width: 120px; transition: 0.3s;">
                        <div style="font-weight: bold; color: #f87171;">KIRMIZI</div>
                        <div id="p2-score" style="font-size: 2rem; font-weight: 900; color: white;">0</div>
                        <div id="p2-pieces" style="font-size: 0.8rem; color: #94a3b8;">Kalan Taş: 9</div>
                    </div>
                </div>
                <div id="dt-info" style="font-size: 1.1rem; font-weight: bold; color: #fbbf24; height: 24px;">Mavi Oyuncu: Taş yerleştirin.</div>
            </div>

            <div style="position: relative; width: 100%; max-width: 450px; aspect-ratio: 1; background: #d4a373; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.3); padding: 5%;">
                <div id="dt-board" style="position: relative; width: 100%; height: 100%;">
                    <!-- SVG Lines -->
                    <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; pointer-events: none;">
                        <g stroke="#5c4033" stroke-width="4" fill="none">
                            <rect x="5%" y="5%" width="90%" height="90%" />
                            <rect x="20%" y="20%" width="60%" height="60%" />
                            <rect x="35%" y="35%" width="30%" height="30%" />
                            <line x1="50%" y1="5%" x2="50%" y2="35%" />
                            <line x1="50%" y1="65%" x2="50%" y2="95%" />
                            <line x1="5%" y1="50%" x2="35%" y2="50%" />
                            <line x1="65%" y1="50%" x2="95%" y2="50%" />
                        </g>
                    </svg>
                    <!-- Points -->
                </div>
            </div>
        </div>
    `;

    const boardEl = container.querySelector('#dt-board');
    const infoEl = container.querySelector('#dt-info');
    const p1ScoreEl = container.querySelector('#p1-score');
    const p2ScoreEl = container.querySelector('#p2-score');
    const p1PiecesEl = container.querySelector('#p1-pieces');
    const p2PiecesEl = container.querySelector('#p2-pieces');
    const p1Panel = container.querySelector('#p1-panel');
    const p2Panel = container.querySelector('#p2-panel');

    const nodes = [
        { id: 0, x: 5, y: 5 }, { id: 1, x: 50, y: 5 }, { id: 2, x: 95, y: 5 },
        { id: 3, x: 95, y: 50 }, { id: 4, x: 95, y: 95 }, { id: 5, x: 50, y: 95 },
        { id: 6, x: 5, y: 95 }, { id: 7, x: 5, y: 50 },
        { id: 8, x: 20, y: 20 }, { id: 9, x: 50, y: 20 }, { id: 10, x: 80, y: 20 },
        { id: 11, x: 80, y: 50 }, { id: 12, x: 80, y: 80 }, { id: 13, x: 50, y: 80 },
        { id: 14, x: 20, y: 80 }, { id: 15, x: 20, y: 50 },
        { id: 16, x: 35, y: 35 }, { id: 17, x: 50, y: 35 }, { id: 18, x: 65, y: 35 },
        { id: 19, x: 65, y: 50 }, { id: 20, x: 65, y: 65 }, { id: 21, x: 50, y: 65 },
        { id: 22, x: 35, y: 65 }, { id: 23, x: 35, y: 50 }
    ];

    const edges = {
        0: [1,7], 1: [0,2,9], 2: [1,3], 3: [2,4,11], 4: [3,5], 5: [4,6,13], 6: [5,7], 7: [0,6,15],
        8: [9,15], 9: [8,10,1,17], 10: [9,11], 11: [10,12,3,19], 12: [11,13], 13: [12,14,5,21], 14: [13,15], 15: [14,8,7,23],
        16: [17,23], 17: [16,18,9], 18: [17,19], 19: [18,20,11], 20: [19,21], 21: [20,22,13], 22: [21,23], 23: [22,16,15]
    };

    const millLines = [
        [0,1,2], [8,9,10], [16,17,18], // Top horiz
        [7,15,23], [3,11,19], // Mid horiz
        [22,21,20], [14,13,12], [6,5,4], // Bot horiz
        [0,7,6], [8,15,14], [16,23,22], // Left vert
        [1,9,17], [5,13,21], // Mid vert
        [2,3,4], [10,11,12], [18,19,20] // Right vert
    ];

    let board = Array(24).fill(0); // 0: empty, 1: p1, 2: p2
    let pPieces = { 1: 9, 2: 9 };
    let scores = { 1: 0, 2: 0 };
    let currentTurn = 1;
    let phase = 1; // 1: Placing, 2: Moving
    let selectedNode = null;
    let activeMills = [];
    let gameOver = false;

    // Create UI Nodes
    let nodeEls = [];
    nodes.forEach(n => {
        let el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.left = `calc(${n.x}% - 12px)`;
        el.style.top = `calc(${n.y}% - 12px)`;
        el.style.borderRadius = '50%';
        el.style.background = '#8b5a2b';
        el.style.border = '2px solid #5c4033';
        el.style.cursor = 'pointer';
        el.style.transition = '0.2s';
        el.style.zIndex = '10';
        el.dataset.id = n.id;
        
        el.addEventListener('mouseover', () => { if(!gameOver) el.style.transform = 'scale(1.3)'; });
        el.addEventListener('mouseout', () => { el.style.transform = 'scale(1)'; });
        el.addEventListener('click', () => handleNodeClick(n.id));
        
        boardEl.appendChild(el);
        nodeEls.push(el);
    });

    function updateUI() {
        nodeEls.forEach((el, idx) => {
            let val = board[idx];
            if (val === 0) {
                el.style.background = (selectedNode !== null && edges[selectedNode].includes(idx)) ? 'rgba(255,255,255,0.8)' : '#8b5a2b';
                el.style.boxShadow = 'none';
            } else if (val === 1) {
                el.style.background = 'radial-gradient(circle at 30% 30%, #60a5fa, #2563eb)';
                el.style.boxShadow = '0 4px 6px rgba(0,0,0,0.5), inset 0 -2px 4px rgba(0,0,0,0.3)';
                if(selectedNode === idx) el.style.boxShadow = '0 0 15px 5px #60a5fa';
            } else if (val === 2) {
                el.style.background = 'radial-gradient(circle at 30% 30%, #f87171, #dc2626)';
                el.style.boxShadow = '0 4px 6px rgba(0,0,0,0.5), inset 0 -2px 4px rgba(0,0,0,0.3)';
                if(selectedNode === idx) el.style.boxShadow = '0 0 15px 5px #f87171';
            }
        });

        p1PiecesEl.innerText = phase === 1 ? `Kalan Taş: ${pPieces[1]}` : 'Tüm taşlar sahada';
        p2PiecesEl.innerText = phase === 1 ? `Kalan Taş: ${pPieces[2]}` : 'Tüm taşlar sahada';
        p1ScoreEl.innerText = scores[1];
        p2ScoreEl.innerText = scores[2];

        p1Panel.style.borderColor = currentTurn === 1 ? '#3b82f6' : 'transparent';
        p2Panel.style.borderColor = currentTurn === 2 ? '#ef4444' : 'transparent';
    }

    function checkMills() {
        let newActiveMills = [];
        let scored = false;
        
        millLines.forEach((line, index) => {
            if (board[line[0]] !== 0 && board[line[0]] === board[line[1]] && board[line[1]] === board[line[2]]) {
                newActiveMills.push(index);
                if (!activeMills.includes(index)) {
                    // New mill formed!
                    let player = board[line[0]];
                    scores[player]++;
                    scored = true;
                    if(window.playSound) window.playSound('success');
                    
                    // Mill animation
                    line.forEach(nId => {
                        let el = nodeEls[nId];
                        el.style.transform = 'scale(1.5)';
                        setTimeout(() => { if(el) el.style.transform = 'scale(1)'; }, 400);
                    });
                }
            }
        });
        activeMills = newActiveMills;
        
        if (scores[1] >= 10 || scores[2] >= 10) {
            gameOver = true;
            let winner = scores[1] >= 10 ? "MAVİ" : "KIRMIZI";
            infoEl.innerText = `🏆 ${winner} KAZANDI! 🏆`;
            infoEl.style.color = '#4ade80';
            if(window.playSound) window.playSound('success');
            return true;
        }
        
        if (scored) {
            infoEl.innerText = `💥 CIZ YAPILDI! +1 PUAN!`;
            setTimeout(() => {
                if(!gameOver) {
                    infoEl.innerText = `${currentTurn === 1 ? 'Mavi' : 'Kırmızı'} Oyuncu: Sıra sizde.`;
                }
            }, 1500);
        }
        return false;
    }

    function changeTurn() {
        if(gameOver) return;
        currentTurn = currentTurn === 1 ? 2 : 1;
        infoEl.innerText = `${currentTurn === 1 ? 'Mavi' : 'Kırmızı'} Oyuncu: ${phase === 1 ? 'Taş yerleştirin' : 'Taş kaydırın'}.`;
        updateUI();
    }

    function handleNodeClick(id) {
        if (gameOver) return;

        if (phase === 1) {
            // Placing phase
            if (board[id] !== 0) return; // Spot taken
            
            board[id] = currentTurn;
            pPieces[currentTurn]--;
            if(window.playSound) window.playSound('click');
            
            let gameEnded = checkMills();
            if (!gameEnded) {
                if (pPieces[1] === 0 && pPieces[2] === 0) {
                    phase = 2; // Moving phase
                    infoEl.innerText = "Yerleştirme bitti. Taşları kaydırın!";
                    setTimeout(changeTurn, 1500);
                } else {
                    changeTurn();
                }
            }
            updateUI();
            
        } else if (phase === 2) {
            // Moving phase
            if (board[id] === currentTurn) {
                // Select piece
                selectedNode = selectedNode === id ? null : id;
                if(window.playSound) window.playSound('click');
                updateUI();
            } else if (board[id] === 0 && selectedNode !== null) {
                // Move piece
                if (edges[selectedNode].includes(id)) {
                    board[id] = currentTurn;
                    board[selectedNode] = 0;
                    selectedNode = null;
                    if(window.playSound) window.playSound('click');
                    
                    let gameEnded = checkMills();
                    if (!gameEnded) changeTurn();
                    updateUI();
                }
            }
        }
    }

    updateUI();
}

