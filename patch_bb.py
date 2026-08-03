import sys
import re

file_path = r'c:\Users\ASUMAN\Desktop\web game\js\newGames.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update text
content = content.replace(
    'Yerleştirmek istediğin bloğa dokun, ardından tahtada boş bir yere dokun!',
    'İstediğin bloğu tahtaya sürükle ve bırak!'
)

# 2. Remove old cell events & dock clicks in initGame
old_board_gen = '''        // Generate Board Slots
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
        });'''

new_board_gen = '''        // Drag State Variables
        window.bbDragState = {
            active: false,
            pieceIdx: null,
            grabRow: 0,
            grabCol: 0,
            clone: null,
            startX: 0,
            startY: 0,
            lastPreviewR: null,
            lastPreviewC: null
        };

        // Generate Board Slots
        const boardEl = container.querySelector('#bb-board');
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cell = document.createElement('div');
                cell.className = 'bb-board-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                boardEl.appendChild(cell);
            }
        }

        refillDockIfNeeded();

        // Global pointer move and up events for dragging
        document.addEventListener('pointermove', handlePointerMove, {passive: false});
        document.addEventListener('pointerup', handlePointerUp);
        document.addEventListener('touchmove', preventScrollWhenDragging, {passive: false});'''

content = content.replace(old_board_gen, new_board_gen)

# 3. Replace selectPiece, clearBoardPreviews, handleCellMouseEnter, handleCellClick
# with new Drag Logic

old_logic_pattern = r'    function selectPiece\(idx\) \{.*?(?=    const FURRY_BLOCK_IMAGES = \[)'
new_logic = '''    function preventScrollWhenDragging(e) {
        if (window.bbDragState && window.bbDragState.active) {
            e.preventDefault();
        }
    }

    function clearBoardPreviews() {
        container.querySelectorAll('.bb-board-cell').forEach(cell => {
            cell.classList.remove('preview-fit', 'preview-fail');
        });
    }

    function checkFit(piece, targetRow, targetCol) {
        const pr = piece.grid.length;
        const pc = piece.grid[0].length;
        if (targetRow < 0 || targetCol < 0) return false;
        if (targetRow + pr > 8 || targetCol + pc > 8) return false;
        
        for (let r = 0; r < pr; r++) {
            for (let c = 0; c < pc; c++) {
                if (piece.grid[r][c] === 1) {
                    if (board[targetRow + r][targetCol + c] !== null) return false;
                }
            }
        }
        return true;
    }

    function updatePreview(topLeftR, topLeftC) {
        clearBoardPreviews();
        if (topLeftR === null || topLeftC === null) return;
        const piece = activePieces[window.bbDragState.pieceIdx];
        if (!piece) return;

        const fits = checkFit(piece, topLeftR, topLeftC);
        const pr = piece.grid.length;
        const pc = piece.grid[0].length;

        for (let r = 0; r < pr; r++) {
            for (let c = 0; c < pc; c++) {
                if (piece.grid[r][c] === 1) {
                    const br = topLeftR + r;
                    const bc = topLeftC + c;
                    if (br >= 0 && br < 8 && bc >= 0 && bc < 8) {
                        const cellEl = container.querySelector(`[data-row="${br}"][data-col="${bc}"]`);
                        if (cellEl) cellEl.classList.add(fits ? 'preview-fit' : 'preview-fail');
                    }
                }
            }
        }
    }

    function handlePointerMove(e) {
        if (!window.bbDragState || !window.bbDragState.active) return;
        
        const state = window.bbDragState;
        const clone = state.clone;
        if (!clone) return;

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        if (clientX === undefined || clientY === undefined) return;

        // Apply visual offset (e.g. 50px above finger)
        clone.style.left = (clientX - clone.offsetWidth/2) + 'px';
        clone.style.top = (clientY - clone.offsetHeight - 20) + 'px'; // Float above finger!

        // Find cell under finger
        const els = document.elementsFromPoint(clientX, clientY);
        const cellEl = els.find(el => el.classList.contains('bb-board-cell'));
        
        if (cellEl) {
            const targetR = parseInt(cellEl.dataset.row);
            const targetC = parseInt(cellEl.dataset.col);
            const topLeftR = targetR - state.grabRow;
            const topLeftC = targetC - state.grabCol;
            
            if (state.lastPreviewR !== topLeftR || state.lastPreviewC !== topLeftC) {
                state.lastPreviewR = topLeftR;
                state.lastPreviewC = topLeftC;
                updatePreview(topLeftR, topLeftC);
            }
        } else {
            state.lastPreviewR = null;
            state.lastPreviewC = null;
            clearBoardPreviews();
        }
    }

    function handlePointerUp(e) {
        if (!window.bbDragState || !window.bbDragState.active) return;
        const state = window.bbDragState;
        state.active = false;
        
        if (state.clone) {
            state.clone.remove();
            state.clone = null;
        }

        const slotEl = container.querySelector(`#bb-dock-${state.pieceIdx}`);
        if (slotEl) slotEl.style.opacity = '1';

        const piece = activePieces[state.pieceIdx];
        const r = state.lastPreviewR;
        const c = state.lastPreviewC;
        
        clearBoardPreviews();

        if (r !== null && c !== null && piece && checkFit(piece, r, c)) {
            // Valid drop! Place piece
            playSynthSound('place');
            const pr = piece.grid.length;
            const pc = piece.grid[0].length;
            
            for (let ir = 0; ir < pr; ir++) {
                for (let ic = 0; ic < pc; ic++) {
                    if (piece.grid[ir][ic] === 1) {
                        board[r + ir][c + ic] = { colorIdx: piece.colorIdx };
                    }
                }
            }

            let pieceBlockCount = 0;
            piece.grid.forEach(row => row.forEach(val => { if (val === 1) pieceBlockCount++; }));
            score += pieceBlockCount * 2;

            activePieces[state.pieceIdx] = null;
            if (slotEl) {
                slotEl.innerHTML = '';
                slotEl.className = 'bb-dock-slot';
                slotEl.classList.remove('has-piece');
            }
            
            renderBoardCells();
            checkAndBlastLines();
        } else {
            // Invalid drop, play error
            playSynthSound('error');
        }
    }

'''

content = re.sub(old_logic_pattern, new_logic, content, flags=re.DOTALL)

# 4. Update renderDockPiece to add pointerdown event and data-p-row / data-p-col
old_render_dock = '''        for (let r = 0; r < pr; r++) {
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

        slotEl.appendChild(gridContainer);'''

new_render_dock = '''        for (let r = 0; r < pr; r++) {
            for (let c = 0; c < pc; c++) {
                if (shape.grid[r][c] === 1) {
                    const miniImg = createFluffyFurBlockImageElement(shape.colorIdx, 18);
                    miniImg.dataset.pRow = r;
                    miniImg.dataset.pCol = c;
                    miniImg.style.pointerEvents = 'auto'; // allow grab detection on cell
                    gridContainer.appendChild(miniImg);
                } else {
                    const empty = document.createElement('div');
                    empty.style.width = '18px';
                    empty.style.height = '18px';
                    gridContainer.appendChild(empty);
                }
            }
        }

        gridContainer.addEventListener('pointerdown', (e) => {
            if (!activePieces[slotIdx]) return;
            e.preventDefault();
            playSynthSound('click');
            
            // Setup dragging state
            window.bbDragState.active = true;
            window.bbDragState.pieceIdx = slotIdx;
            
            // Detect grab offset
            const t = e.target;
            window.bbDragState.grabRow = parseInt(t.dataset.pRow) || 0;
            window.bbDragState.grabCol = parseInt(t.dataset.pCol) || 0;
            
            // Create clone
            const clone = gridContainer.cloneNode(true);
            clone.style.position = 'fixed';
            clone.style.zIndex = '9999';
            clone.style.pointerEvents = 'none'; // so we can detect elements underneath!
            clone.style.transform = 'scale(2.2)'; // Scale it up to match board cell size roughly! 18px * 2 = 36px
            clone.style.transition = 'none';
            document.body.appendChild(clone);
            window.bbDragState.clone = clone;
            
            // Set initial position
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            if (clientX !== undefined) {
                clone.style.left = (clientX - clone.offsetWidth/2) + 'px';
                clone.style.top = (clientY - clone.offsetHeight - 20) + 'px';
            }
            
            slotEl.style.opacity = '0.2'; // fade original
        });

        slotEl.appendChild(gridContainer);'''

content = content.replace(old_render_dock, new_render_dock)

# 5. Cleanup function
old_cleanup = '''    function cleanup() {
    }'''

new_cleanup = '''    function cleanup() {
        if (window.bbDragState && window.bbDragState.clone) {
            window.bbDragState.clone.remove();
        }
        window.bbDragState = null;
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        document.removeEventListener('touchmove', preventScrollWhenDragging);
    }'''

content = content.replace(old_cleanup, new_cleanup)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('SUCCESS')
