// Ana Uygulama Mantığı (App Logic)

document.addEventListener("DOMContentLoaded", () => {
    // Profil Avatarını Yükleme (Restore Avatar)
    const savedAvatar = localStorage.getItem('selectedAvatar') || 'assets/images/kids_avatar.jpg';
    window.updateAvatarUI = function(val) {
        document.querySelectorAll('.nav-avatar-btn').forEach(btn => {
            btn.innerHTML = `<img src="${val}" alt="Profil">`;
        });
    };
    window.updateAvatarUI(savedAvatar);

    // Global İstatistik Güncelleyici (new games support)
    window.updateStats = function(score, completedCount) {
        const ach = window.achievementsData;
        if (!ach) return;
        if (score) ach.userStats.totalScore += score;
        if (completedCount) ach.userStats.completedGames += completedCount;
        
        const starsAwarded = score ? Math.max(5, Math.min(25, Math.ceil(score / 10))) : 10;
        ach.userStats.stars += starsAwarded;
        
        const task1 = ach.dailyTasks.find(t => t.id === 1);
        if (task1 && !task1.completed) {
            task1.completed = true;
            ach.userStats.stars += task1.reward;
        }
        
        const done = ach.dailyTasks.filter(t => t.completed).length;
        ach.userStats.progressPercentage = Math.round((done / ach.dailyTasks.length) * 100);
        if (typeof scoreAwarded !== 'undefined' && window.CURRENT_ACTIVE_GAME_ID) {
            if(window.recordGameScore) window.recordGameScore(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
            if(window.achievementsData && window.achievementsData.addScoreToGame) window.achievementsData.addScoreToGame(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
        }
        if(window.achievementsData && window.achievementsData.saveAchievements) window.achievementsData.saveAchievements();
        
        renderAchievements();
    };

    // 1. Durum Yönetimi (State Management)
    let isSoundEnabled = true;
    let activeCategory = null;
    let searchQuery = "";
    let audioCtx = null;
    let activeGameTimer = null; // Aktif oyun süre sayacı
    // Global Can (Hearts) Durumu
    // Oyun Bazlı Can (Hearts) Durumu
    function getGameHeartsState(gameId) {
        const allStates = JSON.parse(localStorage.getItem("minikio_game_hearts") || "{}");
        return allStates[gameId] || { lockedUntil: 0 };
    }

    function saveGameHeartsState(gameId, state) {
        const allStates = JSON.parse(localStorage.getItem("minikio_game_hearts") || "{}");
        allStates[gameId] = state;
        localStorage.setItem("minikio_game_hearts", JSON.stringify(allStates));
    }

    function lockGame(gameId) {
        saveGameHeartsState(gameId, { lockedUntil: Date.now() + 5 * 60 * 1000 });
    }

    function isLevelUnlocked(gameId, level) {
        if (level === 1) return true;
        const maxUnlocked = parseInt(localStorage.getItem(`minikio_game_${gameId}_unlocked_v3`) || "1");
        return level <= maxUnlocked;
    }

    function unlockNextLevel(gameId, currentLevel) {
        const nextLevel = currentLevel + 1;
        const currentMax = parseInt(localStorage.getItem(`minikio_game_${gameId}_unlocked_v3`) || "1");
        if (nextLevel > currentMax) {
            localStorage.setItem(`minikio_game_${gameId}_unlocked_v3`, nextLevel);
        }
    }


    // 2. DOM Elemanları (DOM Elements)
    const splashScreen = document.getElementById("splash-screen");
    const btnStart = document.getElementById("btn-start");
    
    const body = document.body;
    const btnThemeToggle = document.getElementById("btn-theme-toggle");
    const btnSoundToggle = document.getElementById("btn-sound-toggle");
    const btnFullscreenToggle = document.getElementById("btn-fullscreen-toggle");
    
    const gamesGrid = document.getElementById("games-grid");
    const categoriesContainer = document.getElementById("categories-container");
    const searchInput = document.getElementById("search-input");
    
    const tasksList = document.getElementById("tasks-list");
    const badgeCabinet = document.getElementById("badge-cabinet");
    const statStars = document.getElementById("stat-stars");
    const statCompleted = document.getElementById("stat-completed");
    const statScore = document.getElementById("stat-score");
    const statStreak = document.getElementById("stat-streak");
    const progressFill = document.getElementById("progress-fill");
    const progressPercent = document.getElementById("progress-percent");

    const modalOverlay = document.getElementById("modal-overlay");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const btnCloseModal = document.getElementById("btn-close-modal");
    
    const btnHeroAction = document.getElementById("btn-hero-action");
    const promoSection = document.querySelector(".promo-section");
    // 3. Web Audio API Ses Sentezleyici (Dynamic Sound Engine)
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playSound(type) {
        if (!isSoundEnabled) return;
        try {
            initAudio();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const now = audioCtx.currentTime;

            if (type === 'click') {
                // Tatlı bir tık sesi
                osc.type = 'sine';
                osc.frequency.setValueAtTime(450, now);
                osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            } else if (type === 'success') {
                // Başarı melodisi (Melodik çan arpeji)
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
                osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
                osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
            } else if (type === 'locked') {
                // Hata veya kilitli öge uyarısı (Yumuşak bas vızıltısı)
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.linearRampToValueAtTime(110, now + 0.12);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.12);
            }
        } catch (e) {
            console.log("Audio play blocked/failed: ", e);
        }
    }
    window.playSound = playSound;

    // 4. Parçacık Animasyon Sistemi (Micro Particle System)
    function createBackgroundParticles() {
        const container = document.getElementById("particles-container");
        if (!container) return;
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement("div");
            particle.classList.add("particle");
            
            // Rastgele boyut, konum ve gecikme süresi
            const size = Math.random() * 8 + 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.animationDelay = `${Math.random() * 15}s`;
            particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
            
            // Rastgele pastel gradyan renkleri
            const colors = ['#A0C4FF', '#CAFFBF', '#FDFFB6', '#FFD6A5', '#FFC6FF', '#FFADAD'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.opacity = Math.random() * 0.4 + 0.2;
            
            container.appendChild(particle);
        }
    }

    // 5. Karşılama Ekranı Kapatma (Exit Splash Screen)
    function closeSplashScreen() {
        if (!splashScreen || splashScreen.style.display === "none") return;
        initAudio();
        playSound('success');
        splashScreen.classList.add("fade-out");
        
        setTimeout(() => {
            splashScreen.style.display = "none";
        }, 600);
    }

    if (btnStart) btnStart.addEventListener("click", closeSplashScreen);
    if (splashScreen) splashScreen.addEventListener("click", closeSplashScreen);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") closeSplashScreen();
    });

    // 6. Tema Seçici (Theme Toggle)
    btnThemeToggle.addEventListener("click", () => {
        playSound('click');
        const currentTheme = body.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        body.setAttribute("data-theme", newTheme);
        
        // İkonu güncelleme
        if (newTheme === "dark") {
            btnThemeToggle.innerHTML = `<i data-lucide="moon"></i>`;
        } else {
            btnThemeToggle.innerHTML = `<i data-lucide="sun"></i>`;
        }
        lucide.createIcons();
    });

    // 7. Ses Kontrolü (Sound Toggle)
    btnSoundToggle.addEventListener("click", () => {
        isSoundEnabled = !isSoundEnabled;
        if (isSoundEnabled) {
            btnSoundToggle.innerHTML = `<i data-lucide="volume-2"></i>`;
            playSound('click');
        } else {
            btnSoundToggle.innerHTML = `<i data-lucide="volume-x"></i>`;
        }
        lucide.createIcons();
    });

    // 8. Tam Ekran (Fullscreen Mode)
    btnFullscreenToggle.addEventListener("click", () => {
        playSound('click');
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                btnFullscreenToggle.innerHTML = `<i data-lucide="minimize"></i>`;
            }).catch(err => {
                console.error("Tam ekran başlatılamadı:", err);
            });
        } else {
            document.exitFullscreen().then(() => {
                btnFullscreenToggle.innerHTML = `<i data-lucide="maximize"></i>`;
            });
        }
        setTimeout(() => lucide.createIcons(), 100);
    });

    // 8.5 Profil İsim & Avatar Özelleştirme (Player Profile System)
    const navAvatarBtn = document.querySelector(".nav-avatar-btn");
    if (navAvatarBtn) {
        navAvatarBtn.addEventListener("click", () => {
            playSound('click');
            openAvatarSelectionModal(false);
        });
    }

    function updatePlayerProfileUI() {
        const playerName = localStorage.getItem('user_name') || 'Oyuncu';
        const playerAvatar = localStorage.getItem('selectedAvatar') || 'assets/images/kids_avatar.jpg';

        const navNameEl = document.getElementById('nav-player-name');
        if (navNameEl) navNameEl.innerText = playerName;

        document.querySelectorAll('.nav-avatar-btn img').forEach(img => {
            img.src = playerAvatar;
        });

        updateChampionBanner();
    }

    function openAvatarSelectionModal(isFirstTime = false) {
        const avatars = [
            { name: "Tavşan", path: "assets/images/avatars/rabbit.png" },
            { name: "Kedi", path: "assets/images/avatars/cat.png" },
            { name: "Köpek", path: "assets/images/avatars/dog.png" },
            { name: "Ayıcık", path: "assets/images/avatars/bear.png" },
            { name: "Panda", path: "assets/images/avatars/panda.png" },
            { name: "Aslan", path: "assets/images/avatars/lion.png" },
            { name: "Tilki", path: "assets/images/avatars/fox.png" },
            { name: "Penguen", path: "assets/images/avatars/penguin.png" },
            { name: "Baykuş", path: "assets/images/avatars/owl.png" },
            { name: "Unicorn", path: "assets/images/avatars/unicorn.png" },
            { name: "Maymun", path: "assets/images/avatars/monkey.png" },
            { name: "Ahtapot", path: "assets/images/avatars/octopus.png" }
        ];

        let selectedAvatarPath = localStorage.getItem('selectedAvatar') || avatars[0].path;
        let currentName = localStorage.getItem('user_name') || '';

        let contentHTML = `
            <div style="text-align:center; padding: 5px 0; user-select:none;">
                <div style="font-size: 1rem; font-weight: 800; color: #475569; margin-bottom: 12px;">
                    ${isFirstTime ? '🎉 MİNİKİO\'na Hoş Geldin! Lütfen ismini yaz ve karakterini seç:' : 'İsmini ve Profil Karakterini Düzenle:'}
                </div>
                
                <!-- Player Name Input -->
                <div style="margin-bottom: 18px; max-width: 320px; margin-left: auto; margin-right: auto;">
                    <label style="display:block; font-weight:900; font-size:0.85rem; color:#64748b; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">İSMİNİZ / NICKNAME</label>
                    <input id="profile-name-input" type="text" value="${currentName}" placeholder="Örn: Ayşe, Ali, Efe..." style="width:100%; padding:12px 18px; border-radius:16px; border:2.5px solid #c084fc; font-size:1.15rem; font-weight:800; text-align:center; box-sizing:border-box; box-shadow:0 4px 12px rgba(192,132,252,0.2); outline:none; color:#1e293b; background:#ffffff;">
                </div>

                <div style="font-weight:900; font-size:0.85rem; color:#64748b; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px;">KARAKTERİNİ SEÇ (DOKUN)</div>

                <!-- Avatar Selection Grid -->
                <div class="avatar-selection-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(85px, 1fr)); gap: 10px; padding: 10px; max-height:240px; overflow-y:auto; border-radius: 18px; background: rgba(248,250,252,0.9); border: 2px solid #cbd5e1;">
        `;

        avatars.forEach(av => {
            const isSelected = av.path === selectedAvatarPath;
            contentHTML += `
                <div class="avatar-option-card ${isSelected ? 'selected-avatar' : ''}" data-val="${av.path}" style="border: 3.5px solid ${isSelected ? '#f43f5e' : 'transparent'}; background: #ffffff; border-radius: 18px; padding: 6px; text-align: center; cursor: pointer; transition: transform 0.15s ease, border-color 0.15s ease; box-shadow: ${isSelected ? '0 0 14px rgba(244,63,94,0.45)' : '0 2px 6px rgba(0,0,0,0.06)'}; transform: ${isSelected ? 'scale(1.05)' : 'scale(1)'};">
                    <img src="${av.path}" alt="${av.name}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid #cbd5e1; margin-bottom: 2px; background:#e2e8f0; pointer-events:none;">
                    <div style="font-size: 0.75rem; font-weight: 800; color: #334155; pointer-events:none;">${av.name}</div>
                </div>
            `;
        });
        contentHTML += `
                </div>

                <!-- Save / Start Button -->
                <button id="btn-save-profile" type="button" style="width: 100%; max-width: 320px; margin-top: 20px; padding: 14px; border-radius: 18px; font-size: 1.15rem; font-weight: 900; background: linear-gradient(135deg, #f43f5e, #e11d48); border: none; color: white; box-shadow: 0 8px 20px rgba(244,63,94,0.45); cursor: pointer; transition: transform 0.15s ease;">
                    🚀 Kaydet ve Maceraya Başla!
                </button>
        `;

        if (!isFirstTime) {
            contentHTML += `
                <button id="btn-delete-account" type="button" style="width: 100%; max-width: 320px; margin-top: 12px; padding: 12px; border-radius: 14px; font-size: 1rem; font-weight: 800; background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; color: #ef4444; cursor: pointer; transition: all 0.15s ease;">
                    🗑️ Hesabı Sil ve Sıfırla
                </button>
            `;
        }

        contentHTML += `
            </div>
        `;

        showModal(isFirstTime ? "🎉 Profilini Oluştur" : "Profil & Karakter Düzenle", contentHTML);

        const modalContainer = document.getElementById("modal-body");
        if (!modalContainer) return;

        const options = modalContainer.querySelectorAll(".avatar-option-card");
        options.forEach(opt => {
            const selectThisAvatar = (e) => {
                if (e) e.preventDefault();
                selectedAvatarPath = opt.getAttribute("data-val");
                options.forEach(o => {
                    o.style.borderColor = "transparent";
                    o.style.boxShadow = "0 2px 6px rgba(0,0,0,0.06)";
                    o.style.transform = "scale(1)";
                });
                opt.style.borderColor = "#f43f5e";
                opt.style.boxShadow = "0 0 14px rgba(244,63,94,0.45)";
                opt.style.transform = "scale(1.05)";
                if (window.playSound) window.playSound('click');
            };

            opt.addEventListener("click", selectThisAvatar);
        });

        const saveBtn = modalContainer.querySelector('#btn-save-profile');
        if (saveBtn) {
            const handleSave = (e) => {
                if (e) e.preventDefault();
                const nameInput = modalContainer.querySelector('#profile-name-input');
                let finalName = (nameInput ? nameInput.value.trim() : '') || 'Oyuncu';
                
                localStorage.setItem('user_name', finalName);
                localStorage.setItem('selectedAvatar', selectedAvatarPath);
                localStorage.setItem('user_profile_setup', 'true');

                updatePlayerProfileUI();
                renderCategories();
                filterAndRenderGames();

                if (window.playSound) window.playSound('success');
                closeModal();
            };

            saveBtn.addEventListener('click', handleSave);
        }

        const deleteBtn = modalContainer.querySelector('#btn-delete-account');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm("Tüm oyun kayıtların, yıldızların ve başarıların kalıcı olarak silinecek. Hesabını sıfırlamak istediğine emin misin?")) {
                    localStorage.clear();
                    window.location.reload();
                }
            });
        }
    }

    // 8.6 LİDERLİK TABLOSU VE İSTATİSTİKLER MOTORU (Pure Dynamic Player Leaderboards)
    function getGameLeaderboard(gameId) {
        try {
            const dataStr = localStorage.getItem(`game_${gameId}_leaderboard`);
            if (dataStr) {
                const data = JSON.parse(dataStr);
                if (data && Array.isArray(data) && data.length > 0) {
                    // Daha önce kaydedilmiş sanal botları filtrele
                    const realData = data.filter(item => 
                        item.name !== "Ayşe K." && 
                        item.name !== "Mehmet Y." && 
                        item.name !== "Zeynep T."
                    );
                    return realData;
                }
            }
        } catch(e) {}
        
        return [];
    }

    function recordGameScore(gameId, newScore) {
        if (!newScore || newScore <= 0) return;

        const userName = localStorage.getItem('user_name') || 'Oyuncu';
        const userAvatar = localStorage.getItem('selectedAvatar') || 'assets/images/kids_avatar.jpg';

        let list = getGameLeaderboard(gameId);
        
        const cleanUserName = userName.replace(' (Sen)', '').trim();
        list = list.filter(item => {
            const itemClean = item.name.replace(' (Sen)', '').trim();
            return itemClean !== cleanUserName;
        });

        list.push({
            name: cleanUserName + ' (Sen)',
            avatar: userAvatar,
            score: newScore,
            isUser: true,
            date: new Date().toLocaleDateString('tr-TR')
        });

        list.sort((a, b) => b.score - a.score);
        list = list.slice(0, 5);

        localStorage.setItem(`game_${gameId}_leaderboard`, JSON.stringify(list));
        localStorage.setItem(`minikio_game_${gameId}_highscore`, newScore);

        updateChampionBanner();

        if (activeCategory === 'LEADERBOARD') {
            renderLeaderboardDashboard();
        }
    }

    window.recordGameScore = recordGameScore;
    window.updateLeaderboardForGame = recordGameScore;

    function getOverallChampion() {
        let topItem = null;

        if (window.gamesData) {
            window.gamesData.forEach(game => {
                const board = getGameLeaderboard(game.id);
                if (board && board.length > 0) {
                    if (!topItem || board[0].score > topItem.score) {
                        topItem = {
                            name: board[0].name.replace(' (Sen)', '').trim(),
                            avatar: board[0].avatar,
                            score: board[0].score,
                            gameName: game.name
                        };
                    }
                }
            });
        }

        if (!topItem) {
            const currentName = localStorage.getItem('user_name') || 'Şampiyon Adayı';
            const currentAvatar = localStorage.getItem('selectedAvatar') || 'assets/images/avatars/lion.png';
            topItem = {
                name: currentName,
                avatar: currentAvatar,
                score: 0,
                gameName: 'MİNİKİO'
            };
        }

        return topItem;
    }

    function updateChampionBanner() {
        const champ = getOverallChampion();
        const champImg = document.getElementById('champion-avatar-img');
        const champName = document.getElementById('champion-name');
        const champScoreVal = document.getElementById('champion-score-val');

        if (champImg) champImg.src = champ.avatar;
        if (champName) champName.innerHTML = `${champ.name} 🏆`;
        if (champScoreVal) {
            if (champ.score > 0) {
                champScoreVal.innerHTML = `<span style="color:#d97706; font-size: 1.1rem; font-weight:900;">${champ.score.toLocaleString('tr-TR')} Puan</span> <span style="font-size:0.8rem; color:#64748b;">(${champ.gameName})</span>`;
            } else {
                champScoreVal.innerHTML = `<span style="color:#f59e0b; font-size: 0.9rem; font-weight:800;">Oyun oyna ve 1. sıraya yerleş! 🚀</span>`;
            }
        }
    }

    function renderLeaderboardDashboard() {
        let html = `
            <div style="grid-column: 1 / -1; width: 100%; max-width: 1000px; margin: 0 auto; user-select: none;">
                <!-- Header Dashboard Card -->
                <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 24px; padding: 25px 20px; text-align: center; color: white; border: 3.5px solid #f59e0b; box-shadow: 0 12px 32px rgba(245,158,11,0.3); margin-bottom: 25px; position: relative; overflow: hidden;">
                    <div style="font-size: 2.1rem; font-weight: 900; color: #fef08a; margin-bottom: 6px; letter-spacing: 0.5px; text-shadow: 0 4px 10px rgba(0,0,0,0.5);">🏆 LİDERLİK TABLOSU & İSTATİSTİKLER 📊</div>
                    <div style="font-size: 0.95rem; color: #cbd5e1; font-weight: 700;">Her oyun oynandıkça anlık güncellenen rekorlar ve şampiyonlar!</div>
                </div>

                <!-- Per-Game Leaderboard Cards Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 18px;">
        `;

        window.gamesData.forEach(game => {
            const board = getGameLeaderboard(game.id);
            const ranks = ['🥇', '🥈', '🥉'];
            const rankColors = ['#d97706', '#64748b', '#b45309'];

            let rowsHTML = '';
            if (board.length === 0) {
                rowsHTML = `
                    <div style="text-align: center; padding: 16px 8px; color: #64748b; font-weight: 700; font-size: 0.85rem; background: rgba(248,250,252,0.6); border-radius: 14px; border: 1.5px dashed #cbd5e1;">
                        🏆 Henüz rekor kırılmadı!<br><span style="color:#d97706; font-weight:800; display:inline-block; margin-top:4px;">İlk rekoru sen kır! 🚀</span>
                    </div>
                `;
            } else {
                board.forEach((player, idx) => {
                    rowsHTML += `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 14px; background: ${player.isUser ? 'rgba(254,243,199,0.92)' : 'rgba(248,250,252,0.95)'}; border: 1.5px solid ${player.isUser ? '#f59e0b' : '#e2e8f0'}; margin-bottom: 6px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.15rem;">${ranks[idx] || '🎖️'}</span>
                                <img src="${player.avatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1.5px solid #cbd5e1; background:#ffffff;">
                                <span style="font-weight: ${player.isUser ? '900' : '700'}; font-size: 0.88rem; color: ${player.isUser ? '#b45309' : '#1e293b'};">${player.name}</span>
                            </div>
                            <span style="font-weight: 900; font-size: 0.92rem; color: ${rankColors[idx] || '#475569'};">${player.score.toLocaleString('tr-TR')} Puan</span>
                        </div>
                    `;
                });
            }

            html += `
                <div class="glass" style="border-radius: 20px; padding: 16px; border: 2.5px solid rgba(255,255,255,0.9); box-shadow: 0 8px 20px rgba(0,0,0,0.06); background: rgba(255,255,255,0.85);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 2px dashed #e2e8f0;">
                        <img src="${game.image}" style="width: 44px; height: 44px; border-radius: 12px; object-fit: cover; border: 2px solid ${game.color};">
                        <div>
                            <div style="font-weight: 900; font-size: 0.95rem; color: #0f172a;">${game.name}</div>
                            <div style="font-size: 0.75rem; color: #64748b; font-weight: 700;">${game.category}</div>
                        </div>
                    </div>
                    ${rowsHTML}
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        gamesGrid.innerHTML = html;
    }

    // 8.7 FAVORİ YÖNETİMİ (Favorites System)
    function getFavorites() {
        try {
            return JSON.parse(localStorage.getItem('minikio_favorites') || '[]');
        } catch(e) {
            return [];
        }
    }

    function isFavorite(gameId) {
        return getFavorites().includes(gameId);
    }

    function toggleFavorite(gameId, event) {
        if (event) event.stopPropagation();
        let favs = getFavorites();
        if (favs.includes(gameId)) {
            favs = favs.filter(id => id !== gameId);
            if (window.playSound) window.playSound('click');
        } else {
            favs.push(gameId);
            if (window.playSound) window.playSound('pop');
        }
        localStorage.setItem('minikio_favorites', JSON.stringify(favs));
        renderCategories();
        filterAndRenderGames();
    }

    // 9. Ana Menü Kategorilerini Render Etme (Render ONLY 3 Main Navigation Cards)
    function renderCategories() {
        categoriesContainer.innerHTML = "";
        categoriesContainer.style.display = "flex";
        categoriesContainer.style.flexWrap = "wrap";
        categoriesContainer.style.justifyContent = "center";
        categoriesContainer.style.alignItems = "center";
        categoriesContainer.style.gap = "18px";
        categoriesContainer.style.maxWidth = "960px";
        categoriesContainer.style.margin = "0 auto";
        categoriesContainer.style.padding = "5px 0";
        
        // 1. "Tüm Oyunlar" 🎮
        const allCard = document.createElement("div");
        allCard.className = `main-nav-card glass ${activeCategory === null ? 'active' : ''}`;
        allCard.style.setProperty("--accent-color", "#6366f1");
        allCard.style.setProperty("--accent-glow", "rgba(99, 102, 241, 0.35)");
        allCard.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <div class="nav-card-icon" style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #a855f7, #6366f1); display:flex; align-items:center; justify-content:center; color:white; font-size:1.2rem; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);">
                    🎮
                </div>
                <div class="nav-card-text">
                    <div style="font-size: 1rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.3px;">Tüm Oyunlar</div>
                    <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-top:2px;">Keşfet ve Oyna</div>
                </div>
            </div>
            <div class="nav-card-badge" style="font-size: 0.75rem; font-weight: 800; color: #6366f1; background: rgba(99, 102, 241, 0.1); padding: 4px 10px; border-radius: 10px; letter-spacing: 0.5px;">
                ${window.gamesData.length} Oyun
            </div>
        `;
        allCard.addEventListener("click", () => {
            selectCategory(null, allCard);
        });
        categoriesContainer.appendChild(allCard);

        // 2. "Favorilerim" ❤️
        const favsCount = getFavorites().length;
        const favCard = document.createElement("div");
        favCard.className = `main-nav-card glass ${activeCategory === 'FAVORITES' ? 'active' : ''}`;
        favCard.style.setProperty("--accent-color", "#f43f5e");
        favCard.style.setProperty("--accent-glow", "rgba(244, 63, 94, 0.35)");
        favCard.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <div class="nav-card-icon" style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #f43f5e, #fb7185); display:flex; align-items:center; justify-content:center; color:white; font-size:1.2rem; box-shadow: 0 4px 10px rgba(244, 63, 94, 0.3);">
                    ❤️
                </div>
                <div class="nav-card-text">
                    <div style="font-size: 1rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.3px;">Favorilerim</div>
                    <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-top:2px;">Sevdiklerin Burada</div>
                </div>
            </div>
            <div class="nav-card-badge" style="font-size: 0.75rem; font-weight: 800; color: #f43f5e; background: rgba(244, 63, 94, 0.1); padding: 4px 10px; border-radius: 10px; letter-spacing: 0.5px;">
                ${favsCount} Oyun
            </div>
        `;
        favCard.addEventListener("click", () => {
            selectCategory('FAVORITES', favCard);
        });
        categoriesContainer.appendChild(favCard);

        // 3. "İstatistikler" 📊
        const statsCard = document.createElement("div");
        statsCard.className = `main-nav-card glass ${activeCategory === 'LEADERBOARD' ? 'active' : ''}`;
        statsCard.style.setProperty("--accent-color", "#f59e0b");
        statsCard.style.setProperty("--accent-glow", "rgba(245, 158, 11, 0.35)");
        statsCard.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <div class="nav-card-icon" style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #f59e0b, #d97706); display:flex; align-items:center; justify-content:center; color:white; font-size:1.2rem; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);">
                    📊
                </div>
                <div class="nav-card-text">
                    <div style="font-size: 1rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.3px;">İstatistikler</div>
                    <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-top:2px;">Liderlik Tablosu</div>
                </div>
            </div>
            <div class="nav-card-badge" style="font-size: 0.75rem; font-weight: 800; color: #d97706; background: rgba(245, 158, 11, 0.1); padding: 4px 10px; border-radius: 10px; letter-spacing: 0.5px;">
                Sıralama 🏆
            </div>
        `;
        statsCard.addEventListener("click", () => {
            selectCategory('LEADERBOARD', statsCard);
        });
        categoriesContainer.appendChild(statsCard);

        // 4. "Başarılarım & İlerlemem" 🏆
        const achCard = document.createElement("div");
        achCard.className = `main-nav-card glass ${activeCategory === 'ACHIEVEMENTS' ? 'active' : ''}`;
        achCard.style.setProperty("--accent-color", "#10b981");
        achCard.style.setProperty("--accent-glow", "rgba(16, 185, 129, 0.35)");
        achCard.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <div class="nav-card-icon" style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #10b981, #059669); display:flex; align-items:center; justify-content:center; color:white; font-size:1.2rem; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);">
                    🏆
                </div>
                <div class="nav-card-text">
                    <div style="font-size: 1rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.3px;">Başarılarım & İlerlemem</div>
                    <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-top:2px;">Görevler & Rozetler</div>
                </div>
            </div>
            <div class="nav-card-badge" style="font-size: 0.75rem; font-weight: 800; color: #059669; background: rgba(16, 185, 129, 0.1); padding: 4px 10px; border-radius: 10px; letter-spacing: 0.5px;">
                Panel 🎖️
            </div>
        `;
        achCard.addEventListener("click", () => {
            selectCategory('ACHIEVEMENTS', achCard);
        });
        categoriesContainer.appendChild(achCard);

        lucide.createIcons();
    }

    function selectCategory(categoryName, cardElement) {
        playSound('click');
        document.querySelectorAll(".main-nav-card").forEach(c => c.classList.remove("active"));
        if (cardElement) cardElement.classList.add("active");
        
        activeCategory = categoryName;
        filterAndRenderGames();
    }

    // 10. Oyunları Render Etme (Render Games or Leaderboard Dashboard)
    function filterAndRenderGames() {
        gamesGrid.innerHTML = "";
        
        if (promoSection) {
            promoSection.style.display = (activeCategory === 'ACHIEVEMENTS') ? "block" : "none";
        }

        if (activeCategory === 'LEADERBOARD') {
            renderLeaderboardDashboard();
            lucide.createIcons();
            return;
        }

        if (activeCategory === 'ACHIEVEMENTS') {
            renderAchievementsCategoryView();
            return;
        }
        
        const filteredGames = window.gamesData.filter(game => {
            let matchesCategory = true;
            if (activeCategory === 'FAVORITES') {
                matchesCategory = isFavorite(game.id);
            } else if (activeCategory) {
                matchesCategory = game.category === activeCategory;
            }
            const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  game.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  game.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCategory && matchesSearch;
        });

        if (filteredGames.length === 0) {
            if (activeCategory === 'FAVORITES') {
                gamesGrid.innerHTML = `
                    <div class="no-results glass" style="grid-column: 1 / -1; padding: 45px 20px; text-align: center; border-radius: var(--radius-md); background: rgba(255, 241, 242, 0.85); border: 2.5px dashed #f43f5e;">
                        <div style="font-size: 3.5rem; margin-bottom: 8px;">❤️</div>
                        <h3 style="color: #e11d48; font-weight: 900; font-size: 1.4rem;">Henüz Favori Oyunun Yok!</h3>
                        <p style="color: #9f1239; margin-top: 10px; font-weight: 600; max-width: 450px; margin-left: auto; margin-right: auto; line-height: 1.6;">
                            Beğendiğin oyunların kapaklarının sağ üst köşesindeki kalp 🤍 butonuna dokunarak kendi özel favori oyun listenizi hemen oluşturabilirsin!
                        </p>
                    </div>
                `;
            } else {
                gamesGrid.innerHTML = `
                    <div class="no-results glass" style="grid-column: 1 / -1; padding: 40px; text-align: center; border-radius: var(--radius-md);">
                        <i data-lucide="frown" style="width: 48px; height: 48px; margin: 0 auto 15px; color: var(--text-muted);"></i>
                        <h3>Aradığın oyunu bulamadık!</h3>
                        <p style="color: var(--text-muted); margin-top: 10px;">Farklı bir kelimeyle aramayı dene veya diğer kategorilere göz at.</p>
                    </div>
                `;
            }
            lucide.createIcons();
            return;
        }

        filteredGames.forEach(game => {
            const card = document.createElement("div");
            card.className = `game-card glass ${game.locked ? 'locked' : ''}`;
            
            const fav = isFavorite(game.id);
            const favBtnHTML = `<button class="game-fav-btn ${fav ? 'active' : ''}" data-id="${game.id}" title="${fav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}">${fav ? '❤️' : '🤍'}</button>`;

            let ribbonHTML = "";
            let btnHTML = "";
            let imageHTML = "";
            
            if (game.locked) {
                ribbonHTML = `<div class="ribbon-locked">Çok Yakında</div>`;
                btnHTML = `<button class="btn btn-locked game-play-btn" data-id="${game.id}">Yakında</button>`;
                imageHTML = `<div class="game-card-img" style="background: linear-gradient(135deg, ${game.color}50 0%, ${game.color} 100%); display:flex; align-items:center; justify-content:center; height: 100%; width: 100%;">
                                <div style="font-size: 3rem; opacity: 0.25;">✨</div>
                             </div>`;
            } else {
                ribbonHTML = ``;
                btnHTML = `<button class="btn btn-success game-play-btn" data-id="${game.id}">Oyna</button>`;
                imageHTML = `<img src="${game.image}" alt="${game.name}" class="game-card-img">`;
            }

            const skillsHTML = game.skills.map(s => `<span class="skill-tag">${s}</span>`).join('');

            card.innerHTML = `
                <div class="game-card-img-wrapper">
                    ${imageHTML}
                    ${favBtnHTML}
                    ${ribbonHTML}
                    ${game.locked ? `<div class="lock-overlay"><i data-lucide="lock"></i></div>` : ''}
                </div>
                <div class="game-card-content">
                    <h3 class="game-card-title">${game.name}</h3>
                    <div class="game-card-meta">
                        <span class="meta-item">${game.category}</span>
                    </div>
                    <p class="game-card-desc">${game.desc}</p>
                    <div class="game-card-skills">
                        ${skillsHTML}
                    </div>
                    ${btnHTML}
                </div>
            `;
            
            const favBtn = card.querySelector('.game-fav-btn');
            if (favBtn) {
                favBtn.addEventListener("click", (e) => {
                    toggleFavorite(game.id, e);
                });
            }

            card.style.cursor = "pointer";
            card.addEventListener("click", (e) => {
                if (e.target.closest('.game-fav-btn')) return;
                handleGameLaunch(game);
            });

            gamesGrid.appendChild(card);
        });

        lucide.createIcons();
    }

    // 11. Arama Çubuğu (Search Filtering)
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        filterAndRenderGames();
    });

    // Hero maceraya başla butonu
    btnHeroAction.addEventListener("click", () => {
        playSound('click');
        document.getElementById("categories-section").scrollIntoView({ behavior: 'smooth' });
    });

    // 12. İlerleme ve Başarıları Render Etme (Render Achievements Panel)
    function renderAchievementsCategoryView() {
        const data = window.achievementsData;

        gamesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; width: 100%;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    <!-- Sol Kart: Günlük Görevler -->
                    <div class="widget-card glass" style="padding: 24px; border-radius: 24px; background: rgba(255,255,255,0.85); border: 2px solid rgba(255,255,255,0.9); box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                        <h3 class="widget-title" style="margin-bottom: 18px; font-weight: 900; font-size: 1.25rem; display: flex; align-items: center; gap: 10px; color: var(--text-main);">
                            <i data-lucide="check-square" style="color: #3b82f6;"></i> Günlük Görevler
                        </h3>
                        <div id="tasks-list-grid" class="tasks-list" style="display: flex; flex-direction: column; gap: 10px;"></div>
                    </div>

                    <!-- Orta Kart: Gelişim Durumum -->
                    <div class="widget-card glass" style="padding: 24px; border-radius: 24px; background: rgba(255,255,255,0.85); border: 2px solid rgba(255,255,255,0.9); box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                        <h3 class="widget-title" style="margin-bottom: 18px; font-weight: 900; font-size: 1.25rem; display: flex; align-items: center; gap: 10px; color: var(--text-main);">
                            <i data-lucide="sparkles" style="color: #eab308;"></i> Gelişim Durumum
                        </h3>
                        <div class="stats-container">
                            <div class="stats-summary" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                                <div class="stat-box stars" style="background: rgba(254, 240, 138, 0.45); padding: 14px; border-radius: 18px; text-align: center; border: 1.5px solid #fde047;">
                                    <div class="stat-val" style="font-size: 1.8rem; font-weight: 900; color: #ca8a04;">${data.userStats.stars}</div>
                                    <div class="stat-lbl" style="font-size: 0.78rem; font-weight: 700; color: #854d0e;">Toplanan Yıldız</div>
                                </div>
                                <div class="stat-box" style="background: rgba(191, 219, 254, 0.45); padding: 14px; border-radius: 18px; text-align: center; border: 1.5px solid #93c5fd;">
                                    <div class="stat-val" style="font-size: 1.8rem; font-weight: 900; color: #2563eb;">${data.userStats.completedGames}</div>
                                    <div class="stat-lbl" style="font-size: 0.78rem; font-weight: 700; color: #1e40af;">Biten Oyun</div>
                                </div>
                                <div class="stat-box" style="background: rgba(187, 247, 208, 0.45); padding: 14px; border-radius: 18px; text-align: center; border: 1.5px solid #86efac;">
                                    <div class="stat-val" style="font-size: 1.8rem; font-weight: 900; color: #16a34a;">${data.userStats.totalScore}</div>
                                    <div class="stat-lbl" style="font-size: 0.78rem; font-weight: 700; color: #166534;">Toplam Puan</div>
                                </div>
                                <div class="stat-box" style="background: rgba(245, 208, 254, 0.45); padding: 14px; border-radius: 18px; text-align: center; border: 1.5px solid #f5d0fe;">
                                    <div class="stat-val" style="font-size: 1.8rem; font-weight: 900; color: #9333ea;">${data.userStats.highestStreak} Gün</div>
                                    <div class="stat-lbl" style="font-size: 0.78rem; font-weight: 700; color: #6b21a8;">Aktif Seri</div>
                                </div>
                            </div>
                            
                            <div class="progress-container" style="background: rgba(241, 245, 249, 0.8); padding: 14px; border-radius: 16px; border: 1px solid #e2e8f0;">
                                <div class="progress-header" style="display:flex; justify-content:space-between; font-weight:800; font-size:0.88rem; margin-bottom:8px; color: var(--text-main);">
                                    <span>Günlük Görev İlerlemesi</span>
                                    <span style="color: #10b981;">%${data.userStats.progressPercentage}</span>
                                </div>
                                <div class="progress-bar-bg" style="height: 14px; background: rgba(0,0,0,0.08); border-radius: 10px; overflow: hidden;">
                                    <div class="progress-bar-fill" style="width: ${data.userStats.progressPercentage}%; height: 100%; background: linear-gradient(90deg, #10b981, #3b82f6); border-radius: 10px; transition: width 0.4s ease;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sağ Kart: Rozet Dolabı -->
                    <div class="widget-card glass" style="padding: 24px; border-radius: 24px; background: rgba(255,255,255,0.85); border: 2px solid rgba(255,255,255,0.9); box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                        <h3 class="widget-title" style="margin-bottom: 18px; font-weight: 900; font-size: 1.25rem; display: flex; align-items: center; gap: 10px; color: var(--text-main);">
                            <i data-lucide="award" style="color: #ec4899;"></i> Rozet Dolabı
                        </h3>
                        <div id="badge-cabinet-grid" class="badge-cabinet" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)); gap: 12px;"></div>
                    </div>
                </div>
            </div>
        `;

        // Render tasks into tasks-list-grid
        const tasksGrid = gamesGrid.querySelector("#tasks-list-grid");
        if (tasksGrid) {
            data.dailyTasks.forEach(task => {
                const li = document.createElement("div");
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.style.cssText = `display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 14px; background: ${task.completed ? 'rgba(220, 252, 231, 0.8)' : 'rgba(248, 250, 252, 0.9)'}; border: 1.5px solid ${task.completed ? '#86efac' : '#e2e8f0'}; cursor: pointer; transition: all 0.2s ease;`;
                
                li.innerHTML = `
                    <div class="task-info" style="display: flex; align-items: center; gap: 10px;">
                        <div class="task-checkbox-custom" style="width: 22px; height: 22px; border-radius: 6px; border: 2px solid ${task.completed ? '#16a34a' : '#cbd5e1'}; background: ${task.completed ? '#16a34a' : 'white'}; display: flex; align-items: center; justify-content: center; color: white;">
                            ${task.completed ? '<i data-lucide="check" style="width: 14px; height: 14px;"></i>' : ''}
                        </div>
                        <span class="task-name" style="font-weight: 700; font-size: 0.9rem; color: ${task.completed ? '#15803d' : 'var(--text-main)'}; ${task.completed ? 'text-decoration: line-through;' : ''}">${task.name}</span>
                    </div>
                    <div class="task-reward" style="display: flex; align-items: center; gap: 4px; font-weight: 900; font-size: 0.85rem; color: #d97706; background: #fef3c7; padding: 4px 10px; border-radius: 10px; border: 1px solid #fde68a;">
                        <span>+${task.reward}</span>
                        <i data-lucide="star" style="width: 14px; height: 14px; fill: #D97706;"></i>
                    </div>
                `;
                li.addEventListener("click", () => {
                    playSound('click');
                    task.completed = !task.completed;
                    if (task.completed) {
                        data.userStats.stars += task.reward;
                        playSound('success');
                    } else {
                        data.userStats.stars -= task.reward;
                    }
                    const completedCount = data.dailyTasks.filter(t => t.completed).length;
                    data.userStats.progressPercentage = Math.round((completedCount / data.dailyTasks.length) * 100);
                    renderAchievementsCategoryView();
                    renderAchievements();
                });
                tasksGrid.appendChild(li);
            });
        }

        // Render badges into badge-cabinet-grid
        const badgeGrid = gamesGrid.querySelector("#badge-cabinet-grid");
        if (badgeGrid) {
            data.badges.forEach(badge => {
                const item = document.createElement("div");
                item.className = `badge-item ${badge.unlocked ? '' : 'locked'}`;
                item.style.cssText = `display: flex; flex-direction: column; align-items: center; padding: 10px 6px; border-radius: 16px; background: ${badge.unlocked ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : '#f1f5f9'}; border: 1.5px solid ${badge.unlocked ? '#f59e0b' : '#cbd5e1'}; cursor: pointer; text-align: center; opacity: ${badge.unlocked ? '1' : '0.55'}; transition: transform 0.2s ease;`;
                item.innerHTML = `
                    <div class="badge-icon-wrapper" style="font-size: 2.2rem; margin-bottom: 4px;">${badge.icon}</div>
                    <div class="badge-name" style="font-size: 0.72rem; font-weight: 800; color: var(--text-main); line-height: 1.2;">${badge.name}</div>
                `;
                item.addEventListener("click", () => {
                    if (badge.unlocked) {
                        playSound('success');
                        showModal("Rozet Detayı", `
                            <div style="text-align:center; padding: 10px 0;">
                                <div style="font-size: 4rem; margin-bottom: 15px; animation: bounce-loop 2s infinite ease-in-out;">${badge.icon}</div>
                                <h3>${badge.name}</h3>
                                <p style="margin-top:10px; color:var(--text-muted);">${badge.desc}</p>
                                <div style="margin-top:20px; background: rgba(202, 255, 191, 0.2); border: 1px solid rgba(202, 255, 191, 0.5); padding:10px; border-radius:12px; display:inline-block; font-weight:700; color:#15803d;">🎉 Bu başarıyı kazandın!</div>
                            </div>
                        `);
                    } else {
                        playSound('locked');
                        showModal("Kilitli Rozet", `
                            <div style="text-align:center; padding: 10px 0; opacity: 0.8;">
                                <div style="font-size: 4rem; margin-bottom: 15px; filter: grayscale(100%);">🔒</div>
                                <h3>${badge.name}</h3>
                                <p style="margin-top:10px; color:var(--text-muted);">${badge.desc}</p>
                            </div>
                        `);
                    }
                });
                badgeGrid.appendChild(item);
            });
        }

        lucide.createIcons();
    }

    // 13. İlerleme ve Başarıları Render Etme (Render Achievements)
    function renderAchievements() {
        const data = window.achievementsData;
        
        // Yıldızlar ve İstatistikler
        statStars.innerText = data.userStats.stars;
        statCompleted.innerText = data.userStats.completedGames;
        statScore.innerText = data.userStats.totalScore;
        statStreak.innerText = `${data.userStats.highestStreak} Gün`;
        
        // İlerleme Çubuğu
        progressFill.style.width = `${data.userStats.progressPercentage}%`;
        progressPercent.innerText = `%${data.userStats.progressPercentage}`;

        // Görevler Listesi
        tasksList.innerHTML = "";
        data.dailyTasks.forEach(task => {
            const li = document.createElement("div");
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div class="task-info">
                    <div class="task-checkbox-custom">
                        <i data-lucide="check" style="width: 14px; height: 14px;"></i>
                    </div>
                    <span class="task-name">${task.name}</span>
                </div>
                <div class="task-reward">
                    <span>+${task.reward}</span>
                    <i data-lucide="star" style="width: 16px; height: 16px; fill: #D97706;"></i>
                </div>
            `;
            
            // Görev tamamlama simülasyonu
            li.addEventListener("click", () => {
                playSound('click');
                task.completed = !task.completed;
                
                // Puan/Yıldız Güncelleme
                if (task.completed) {
                    data.userStats.stars += task.reward;
                    playSound('success');
                } else {
                    data.userStats.stars -= task.reward;
                }
                
                // Görev tamamlama yüzdesi yeniden hesaplama
                const completedCount = data.dailyTasks.filter(t => t.completed).length;
                data.userStats.progressPercentage = Math.round((completedCount / data.dailyTasks.length) * 100);
                
                renderAchievements();
            });

            tasksList.appendChild(li);
        });

        // Rozet Dolabı
        badgeCabinet.innerHTML = "";
        data.badges.forEach(badge => {
            const item = document.createElement("div");
            item.className = `badge-item ${badge.unlocked ? '' : 'locked'}`;
            item.setAttribute("data-tooltip", badge.tooltip);
            
            item.innerHTML = `
                <div class="badge-icon-wrapper">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
            `;
            
            item.addEventListener("click", () => {
                if (badge.unlocked) {
                    playSound('success');
                    showModal("Rozet Detayı", `
                        <div style="text-align:center; padding: 10px 0;">
                            <div style="font-size: 4rem; margin-bottom: 15px; animation: bounce-loop 2s infinite ease-in-out;">${badge.icon}</div>
                            <h3>${badge.name}</h3>
                            <p style="margin-top:10px; color:var(--text-muted);">${badge.desc}</p>
                            <div style="margin-top:20px; background: rgba(202, 255, 191, 0.2); border: 1px solid rgba(202, 255, 191, 0.5); padding:10px; border-radius:12px; display:inline-block; font-weight:700; color:#15803d;">🎉 Bu başarıyı kazandın!</div>
                        </div>
                    `);
                } else {
                    playSound('locked');
                    showModal("Kilitli Rozet", `
                        <div style="text-align:center; padding: 10px 0; opacity: 0.8;">
                            <div style="font-size: 4rem; margin-bottom: 15px; filter: grayscale(100%);">🔒</div>
                            <h3>${badge.name}</h3>
                            <p style="margin-top:10px; color:var(--text-muted);">${badge.desc}</p>
                            <p style="margin-top:20px; font-weight:600; color:#b91c1c;">Bu rozeti açmak için görevi tamamlamalısın!</p>
                        </div>
                    `);
                }
            });

            badgeCabinet.appendChild(item);
        });

        lucide.createIcons();
    }

    // 13. Oyun Başlatma / Kilitli Oyun Simülasyonu ve Gerçek Oyun Mantığı
    function handleGameLaunch(game) {
        window.CURRENT_ACTIVE_GAME_ID = game.id;
        if(window.achievementsData) {
             window.achievementsData.completeTask(1);
        }
        // Can Kontrolü (Oyuna Özel)
        const heartsState = getGameHeartsState(game.id);
        const now = Date.now();
        if (heartsState.lockedUntil && heartsState.lockedUntil > now) {
            playSound('locked');
            const nextHeartMs = heartsState.lockedUntil - now;
            const mins = Math.max(0, Math.floor(nextHeartMs / (60 * 1000)));
            const secs = Math.max(0, Math.floor((nextHeartMs % (60 * 1000)) / 1000));
            const timerStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            
            showModal("Canların Tükendi! 😢", `
                <div style="text-align:center; padding:20px 10px; user-select:none;">
                    <div style="font-size:4.5rem; margin-bottom:15px; animation:bounce-loop 2s infinite ease-in-out;">❤️⏳</div>
                    <h3 style="font-size:1.4rem; color:var(--text-main); margin-bottom:10px;">Bu Oyun İçin Canının Dolması Gerekiyor!</h3>
                    <p style="color:var(--text-muted); font-size:0.92rem; margin-bottom:20px; line-height:1.6; max-width:320px; margin-left:auto; margin-right:auto;">
                        Bu oyundaki tüm canların bitti. Canların 5 dakika içinde yenilenecektir. Bu sırada diğer oyunlarimizi oynayabilirsin!
                    </p>
                    <div style="display:inline-block; font-size:1.6rem; font-family:var(--font-heading); color:#ef4444; background:rgba(239, 68, 68, 0.1); padding:8px 20px; border-radius:15px; border:2px solid #ef4444; margin-bottom:20px; user-select:none;">
                        Canların Yenilenmesine: <span id="modal-regen-timer">${timerStr}</span>
                    </div>
                    
                    <div style="margin-bottom: 20px; max-width:300px; margin-left:auto; margin-right:auto;">
                        <button class="btn btn-success" id="btn-modal-watch-ad" style="width:100%; padding:12px; font-weight:bold; font-size:1.05rem; display:flex; align-items:center; justify-content:center; gap:8px; border-radius:16px; background:linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color:white; border:none; box-shadow:var(--shadow-medium); cursor:pointer;">
                            🎬 Reklam İzle & Canları Doldur
                        </button>
                    </div>
                    
                    <button class="btn btn-primary" id="btn-close-hearts-modal" style="width:100%; border-radius:16px;">Kapat</button>
                </div>
            `);
            
            const watchAdBtn = document.getElementById("btn-modal-watch-ad");
            if (watchAdBtn) {
                watchAdBtn.addEventListener("click", () => {
                    playSound('success');
                    saveGameHeartsState(game.id, { lockedUntil: 0 });
                    closeModal();
                    handleGameLaunch(game);
                });
            }

            const modalClose = document.getElementById("btn-close-hearts-modal");
            if (modalClose) {
                modalClose.addEventListener("click", () => {
                    closeModal();
                });
            }
            
            const modalTimerInterval = setInterval(() => {
                const modalTimerEl = document.getElementById("modal-regen-timer");
                if (modalTimerEl) {
                    const next = heartsState.lockedUntil - Date.now();
                    if (next <= 0) {
                        clearInterval(modalTimerInterval);
                        closeModal();
                    } else {
                        const m = Math.max(0, Math.floor(next / (60 * 1000)));
                        const s = Math.max(0, Math.floor((next % (60 * 1000)) / 1000));
                        modalTimerEl.innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                    }
                } else {
                    clearInterval(modalTimerInterval);
                }
            }, 1000);
            
            return;
        }        if (game.locked) {
            playSound('locked');
            const targetCard = Array.from(document.querySelectorAll(".game-card")).find(c => {
                return c.querySelector(".game-play-btn").getAttribute("data-id") == game.id;
            });
            if (targetCard) {
                targetCard.style.animation = "shake 0.4s ease";
                setTimeout(() => { targetCard.style.animation = ""; }, 400);
            }
            showModal("Çok Yakında Açılacak!", `
                <div style="text-align:center; padding: 15px 0;">
                    <div style="font-size: 4.5rem; margin-bottom: 20px; animation: float-balloon 4s infinite ease-in-out;">🎈</div>
                    <h3 style="color:var(--text-main); font-size:1.6rem; margin-bottom:10px;">${game.name}</h3>
                    <p style="color:var(--text-muted); font-size:1rem; line-height:1.6;">
                        Bu harika oyun şu an hazırlık aşamasında. Çok yakında zeka dünyamıza eklenecek ve oynamaya başlayabileceksin!
                    </p>
                    <div style="margin-top:25px; padding:15px; border-radius:16px; background:var(--pastel-yellow); color:#1F2937; font-weight:700; border:2px dashed #D97706; display:inline-block;">
                        💡 İpucu: Aktif oyunları oynayarak puan biriktirebilirsin!
                    </div>
                </div>
            `);
            return;
        }

        // Yükleme ekranını göster, ardından oyunu başlat
        playSound('success');
        showModal(`${game.name} Oyunu`, `
            <div class="game-loader-modal">
                <img src="${game.image}" alt="Loading" class="game-loader-logo"
                    style="border-radius:24px; border:3px solid #FFFFFF; box-shadow:var(--shadow-medium); width:120px; height:120px; object-fit:cover; animation: bounce-loop 2s infinite ease-in-out;">
                <h3 style="font-size:1.6rem; color:#1F2937;">Oyun Yükleniyor...</h3>
                <p style="color:var(--text-muted); font-size:0.95rem;">Zihnini hazırla, seviye seçin!</p>
                <div class="game-loader-bar"><div class="game-loader-bar-fill"></div></div>
            </div>
        `);
        setTimeout(() => {
            const modalBodyElement = document.getElementById("modal-body");
            if (!modalBodyElement) return;
            if (game.id === 1) {
                startMemoryGame(modalBodyElement, 1);
            } else if (game.id === 2) {
                startBalloonGame(modalBodyElement, 1);
            } else if (game.id === 3) {
                startMathGame(modalBodyElement, 1);
            } else if (game.id === 4) {
                startWordGame(modalBodyElement, 1);
            } else if (game.id === 5) {
                startFastFingersGame(modalBodyElement, 1);
            } else if (game.id === 6) {
                startMazeGame(modalBodyElement, 1);
            } else if (game.id === 7) {
                startShadowGame(modalBodyElement, 1);
            } else if (game.id === 8) {
                startTrueFalseGame(modalBodyElement, 1);
            } else if (game.id === 9) {
                startNumberChaseGame(modalBodyElement, 1);
            } else if (game.id === 10) {
                startRhythmicMemoryGame(modalBodyElement, 1);
            } else if (game.id === 11) {
                startHiddenObjectGame(modalBodyElement, 1);
            } else if (game.id === 12) {
                startLogicBridgeGame(modalBodyElement, 1);
            } else if (game.id === 13) {
                startNumberPuzzleGame(modalBodyElement, 1);
            } else if (game.id === 14) {
                startColoringBookGame(modalBodyElement, 1);
            } else if (game.id === 15) {
                startTowerStackerGame(modalBodyElement, 1);
            } else if (game.id === 16) {
                startConnectDotsGame(modalBodyElement, 1);
            } else if (game.id === 17) {
                if (window.startColorSortGame) window.startColorSortGame(modalBodyElement, 1);
            } else if (game.id === 18) {
                if (window.startCodingRobotGame) window.startCodingRobotGame(modalBodyElement, 1);
            } else if (game.id === 19) {
                if (window.startSymmetryMirrorGame) window.startSymmetryMirrorGame(modalBodyElement, 1);
            } else if (game.id === 20) {
                if (window.startRhythmDanceGame) window.startRhythmDanceGame(modalBodyElement, 1);
            } else if (game.id === 21) {
                if (window.startBlockBlastGame) window.startBlockBlastGame(modalBodyElement, 1);
            } else if (game.id === 22) {
                if (window.startTargetShooterGame) window.startTargetShooterGame(modalBodyElement, 1);
            } else if (game.id === 23) {
                if (window.startGalacticCandyGame) window.startGalacticCandyGame(modalBodyElement, 1);
            } else if (game.id === 24) {
                if (window.startLaserOpticsGame) window.startLaserOpticsGame(modalBodyElement, 1);
            } else if (game.id === 25) {
                if (window.startGardenFarmGame) window.startGardenFarmGame(modalBodyElement, 1);
                else if (window.startPipeFlowGame) window.startPipeFlowGame(modalBodyElement, 1);
            } else if (game.id === 26) {
                if (window.startChessGame) window.startChessGame(modalBodyElement, 1);
                else if (window.startMastermindCodeGame) window.startMastermindCodeGame(modalBodyElement, 1);
            } else if (game.id === 27) {
                if (window.startUnoCardGame) window.startUnoCardGame(modalBodyElement, 1);
                else if (window.startGravitySlingshotGame) window.startGravitySlingshotGame(modalBodyElement, 1);
            } else if (game.id === 28) {
                if (window.startPuzzleGame) window.startPuzzleGame(modalBodyElement, 1);
                else if (window.startSoundPitchGame) window.startSoundPitchGame(modalBodyElement, 1);
            } else if (game.id === 29) {
                if (window.startLudoGame) window.startLudoGame(modalBodyElement, 1);
            } else if (game.id === 30) {
                if (window.start2048Game) window.start2048Game(modalBodyElement, 1);
            }
        }, 500);
    }

    // ============================================================
    // HAFIZA OYUNU ANA MOTORU — 5 SEVİYE, SIFIR MANTIK HATASI
    // ============================================================
    function startMemoryGame(container, levelNumber) {
        const LEVELS = [
            { level: 1, name: "Başlangıç", emoji: "⭐", pairs: 3, cols: 3, gridClass: "cols-3", timeBonus: [15, 20, 25], scoreBase: 50, color: "#CAFFBF", pool: ["🐼","🦊","🦁","🐰","🐵","🐻"] },
            { level: 2, name: "Minik Patiler", emoji: "🐾", pairs: 4, cols: 4, gridClass: "cols-4", timeBonus: [18, 25, 30], scoreBase: 70, color: "#CAFFBF", pool: ["🐼","🦊","🦁","🐰","🐵","🐻","🐧"] },
            { level: 3, name: "Kolay", emoji: "🌟", pairs: 6, cols: 4, gridClass: "cols-4", timeBonus: [20, 30, 40], scoreBase: 100, color: "#A0C4FF", pool: ["🐼","🦊","🦁","🐰","🐵","🐻","🐧","🦄","🐙"] },
            { level: 4, name: "Dikkatli Gözler", emoji: "👀", pairs: 8, cols: 4, gridClass: "cols-4", timeBonus: [25, 40, 55], scoreBase: 150, color: "#A0C4FF", pool: ["🐼","🦊","🦁","🐰","🐵","🐻","🐧","🦄","🐙","🦉"] },
            { level: 5, name: "Orta", emoji: "🏆", pairs: 10, cols: 5, gridClass: "cols-5", timeBonus: [30, 50, 70], scoreBase: 200, color: "#FFD6A5", pool: ["🐼","🦊","🦁","🐰","🐵","🐻","🐧","🦄","🐙","🦉","🐱","🐶"] },
            { level: 6, name: "Zihin Egzersizi", emoji: "🧠", pairs: 10, cols: 5, gridClass: "cols-5", timeBonus: [35, 60, 85], scoreBase: 250, color: "#FFD6A5", pool: ["🐼","🦊","🦁","🐰","🐵","🐻","🐧","🦄","🐙","🦉","🐱","🐶","🐨"] },
            { level: 7, name: "Zor", emoji: "🔥", pairs: 12, cols: 6, gridClass: "cols-6", timeBonus: [40, 70, 100], scoreBase: 300, color: "#D8BBFF", pool: ["🐼","🦊","🦁","🐰","🐵","🐻","🐧","🦄","🐙","🦉","🐱","🐶","🐨","🐯","🦋"] },
            { level: 8, name: "Hafıza Ustası", emoji: "🎖️", pairs: 12, cols: 6, gridClass: "cols-6", timeBonus: [45, 80, 115], scoreBase: 350, color: "#D8BBFF", pool: ["🐼","🦊","🦁","🐰","🐵","🐻","🐧","🦄","🐙","🦉","🐱","🐶","🐨","🐯","🦋","🦒"] },
            { level: 9, name: "Efsane", emoji: "👑", pairs: 15, cols: 6, gridClass: "cols-6", timeBonus: [50, 100, 150], scoreBase: 500, color: "#FFADAD", pool: ["🐼","🦊","🦁","🐰","🐵","🐻","🐧","🦄","🐙","🦉","🐱","🐶","🐨","🐯","🦋","🦒","🐮"] },
            { level: 10, name: "MİNİKİO Kralı", emoji: "🔮", pairs: 18, cols: 6, gridClass: "cols-6", timeBonus: [60, 120, 180], scoreBase: 700, color: "#FFADAD", pool: ["🐼","🦊","🦁","🐰","🐵","🐻","🐧","🦄","🐙","🦉","🐱","🐶","🐨","🐯","🦋","🦒","🐮"] }
        ];

        const cfg = LEVELS[levelNumber - 1];

        function shuffle(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        const chosen  = shuffle([...cfg.pool]).slice(0, cfg.pairs);
        const cardPool = shuffle([...chosen, ...chosen]);

        let flippedCards = [];
        let matchedPairs = 0;
        let movesCount   = 0;
        let timeElapsed  = 0;
        let lives        = 3;
        let isChecking   = false;

        const tabsHTML = LEVELS.map(l => {
            const isUnlocked = isLevelUnlocked(1, l.level);
            return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" ' + (isUnlocked ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"') + '>' + (isUnlocked ? l.emoji + ' ' + l.level : '🔒 ' + l.level) + '</button>';
        }).join('');

        const cardsHTML = cardPool.map((emoji, idx) => `
            <div class="memory-card" data-emoji="${emoji}" data-idx="${idx}">
                <div class="memory-card-inner">
                    <div class="memory-card-back">
                        ${window.getPixarCardBackHTML ? window.getPixarCardBackHTML() : '❓'}
                    </div>
                    <div class="memory-card-front">
                        ${window.getPixarAnimalGraphic ? window.getPixarAnimalGraphic(emoji) : `<span style="font-size:1.8rem;">${emoji}</span>`}
                    </div>
                </div>
            </div>`).join('');

        container.innerHTML = `
            <div class="memory-game" style="max-width:520px; user-select:none;">
                <div class="level-tabs">${tabsHTML}</div>
                <div style="text-align:center; margin-bottom:12px;">
                    <span style="font-size:0.82rem; font-weight:700; padding:4px 14px;
                        background:${cfg.color}; border-radius:999px; color:#1F2937;">
                        ${cfg.emoji} ${cfg.name} — ${cfg.pairs} çift (${cfg.pairs * 2} kart)
                    </span>
                </div>
                <div class="game-stats">
                    <div class="stat-item">
                        <i data-lucide="timer" style="width:16px;height:16px;"></i>
                        <span id="game-timer">0</span>sn
                    </div>
                    <div class="stat-item" id="memory-lives" style="display:flex; gap:4px;">
                        <!-- Hearts -->
                    </div>
                    <div class="stat-item">
                        <i data-lucide="move" style="width:16px;height:16px;"></i>
                        <span id="game-moves">0</span> hamle
                    </div>
                    <div class="stat-item">
                        <i data-lucide="check-circle" style="width:16px;height:16px;"></i>
                        <span id="game-matches">0</span>/${cfg.pairs}
                    </div>
                </div>
                <div class="memory-grid ${cfg.gridClass}" id="memory-grid">${cardsHTML}</div>
                <button class="btn btn-locked" id="btn-give-up"
                    style="width:100%; margin-top:8px; font-size:0.82rem;">
                    🏳️ Vazgeç
                </button>
            </div>`;

        lucide.createIcons();
        updateLivesDisplay();

        container.querySelectorAll(".level-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                if (tab.hasAttribute("disabled")) return;
                const next = parseInt(tab.dataset.level);
                if (next === levelNumber) return;
                playSound('click');
                if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
                startMemoryGame(container, next);
            });
        });

        container.querySelector("#btn-give-up").addEventListener("click", () => {
            playSound('locked');
            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
            closeModal();
        });

        function updateLivesDisplay() {
            const livesEl = container.querySelector("#memory-lives");
            if (!livesEl) return;
            livesEl.innerHTML = "";
            for (let i = 0; i < 3; i++) {
                const heart = document.createElement("i");
                heart.style.width = "16px";
                heart.style.height = "16px";
                heart.setAttribute("data-lucide", "heart");
                if (i < lives) {
                    heart.style.fill = "#ef4444";
                    heart.style.color = "#ef4444";
                } else {
                    heart.style.fill = "none";
                    heart.style.color = "var(--text-muted)";
                    heart.style.opacity = "0.3";
                }
                livesEl.appendChild(heart);
            }
            lucide.createIcons();
        }

        container.querySelectorAll(".memory-card").forEach(card => {
            card.addEventListener("click", () => {
                if (isChecking)                          return;
                if (card.classList.contains("flipped"))  return;
                if (card.classList.contains("matched"))  return;
                if (flippedCards.length >= 2)            return;

                playSound('click');
                card.classList.add("flipped");
                flippedCards.push(card);

                if (flippedCards.length < 2) return;

                isChecking = true;
                movesCount++;
                document.getElementById("game-moves").innerText = movesCount;

                const [c1, c2] = flippedCards;

                if (c1.dataset.emoji === c2.dataset.emoji) {
                    setTimeout(() => {
                        playSound('success');
                        c1.classList.add("matched");
                        c2.classList.add("matched");
                        matchedPairs++;
                        document.getElementById("game-matches").innerText = matchedPairs;
                        flippedCards = [];
                        isChecking   = false;

                        if (matchedPairs === cfg.pairs) {
                            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
                            unlockNextLevel(1, levelNumber);
                            showWinScreen(container, levelNumber, cfg, timeElapsed, movesCount);
                        }
                    }, 450);
                } else {
                    lives--;
                    updateLivesDisplay();
                    if (lives <= 0) {
                        if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
                        lockGame(1);
                        playSound('locked');
                        setTimeout(() => {
                            container.innerHTML = `
                                <div style="text-align:center; padding:16px 8px;">
                                    <div style="font-size:4.5rem; margin-bottom:12px; animation:shake 0.5s ease-in-out;">😢💥</div>
                                    <h2 style="font-size:1.6rem; margin-bottom:6px; color:#ef4444;">Canların Tükendi!</h2>
                                    <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                        Eşleşmeyen çok fazla kart açtın. 1 global can kaybettin!
                                    </p>
                                    <div style="display:flex; gap:10px; justify-content:center;">
                                        <button class="btn btn-primary" id="btn-replay-fail" style="padding:10px 24px;">🔄 Tekrar Dene</button>
                                        <button class="btn btn-locked" id="btn-close-fail" style="padding:10px 24px;">❌ Kapat</button>
                                    </div>
                                </div>`;
                            container.querySelector("#btn-replay-fail").addEventListener("click", () => {
                                playSound('click');
                                startMemoryGame(container, levelNumber);
                            });
                            container.querySelector("#btn-close-fail").addEventListener("click", () => {
                                playSound('click');
                                closeModal();
                            });
                        }, 500);
                        return;
                    }
                    setTimeout(() => {
                        c1.classList.remove("flipped");
                        c2.classList.remove("flipped");
                        flippedCards = [];
                        isChecking   = false;
                    }, 900);
                }
            });
        });

        // Başlangıçta tüm kartları gösterip 1.8 saniye sonra kapatma (Ezberleme Süresi)
        isChecking = true;
        container.querySelectorAll(".memory-card").forEach(card => card.classList.add("flipped"));

        setTimeout(() => {
            container.querySelectorAll(".memory-card").forEach(card => card.classList.remove("flipped"));
            isChecking = false;
            
            // Zamanlayıcıyı kartlar kapandıktan sonra başlatıyoruz
            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
            activeGameTimer = setInterval(() => {
                timeElapsed++;
                const el = document.getElementById("game-timer");
                if (el) el.innerText = timeElapsed;
                else { clearInterval(activeGameTimer); activeGameTimer = null; }
            }, 1000);
        }, 1800);
    }

    function showWinScreen(container, levelNumber, cfg, time, moves) {
        const hasNext = levelNumber < 10;
        const [base, mid, top] = cfg.timeBonus;
        const fastThresh  = cfg.pairs * 4;
        const superThresh = cfg.pairs * 2;
        let starsAwarded;
        let perfBadge, perfColor;

        if (time <= superThresh) {
            starsAwarded = top; perfBadge = "⚡ Şimşek Hızı!"; perfColor = "#D97706";
        } else if (time <= fastThresh) {
            starsAwarded = mid; perfBadge = "🚀 Süper!"; perfColor = "#15803d";
        } else {
            starsAwarded = base; perfBadge = "👍 Tamamlandı!"; perfColor = "#1E40AF";
        }

        const scoreAwarded = cfg.scoreBase + Math.max(0, 300 - time * 3 - moves * 2);

        const ach = window.achievementsData;
        ach.userStats.stars        += starsAwarded;
        ach.userStats.totalScore   += scoreAwarded;
        ach.userStats.completedGames += 1;
        const task2 = ach.dailyTasks.find(t => t.id === 2);
        if (task2 && !task2.completed) { task2.completed = true; ach.userStats.stars += task2.reward; }
        const done = ach.dailyTasks.filter(t => t.completed).length;
        ach.userStats.progressPercentage = Math.round((done / ach.dailyTasks.length) * 100);
        if (typeof scoreAwarded !== 'undefined' && window.CURRENT_ACTIVE_GAME_ID) {
            if(window.recordGameScore) window.recordGameScore(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
            if(window.achievementsData && window.achievementsData.addScoreToGame) window.achievementsData.addScoreToGame(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
        }
        if(window.achievementsData && window.achievementsData.saveAchievements) window.achievementsData.saveAchievements();
        const badge = ach.badges.find(b => b.id === "memory_apprentice");
        if (badge) badge.unlocked = true;
        setTimeout(() => {
            playSound('success');
            container.innerHTML = `
                <div style="text-align:center; padding:16px 8px;">
                    <div style="font-size:4.5rem; margin-bottom:12px;
                        animation:bounce-loop 2s infinite ease-in-out;">🎉🏆</div>

                    <div style="display:inline-block; padding:6px 18px; border-radius:999px;
                        background:${cfg.color}; font-weight:700; font-size:0.95rem;
                        color:#1F2937; margin-bottom:10px;">${perfBadge}</div>

                    <h2 style="font-size:1.6rem; margin-bottom:6px;">
                        Seveceğin Seviye ${levelNumber} Tamamlandı!
                    </h2>
                    <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                        ${cfg.name} seviyesini <strong>${time}sn</strong>'de
                        <strong>${moves}</strong> hamlede bitirdin!
                    </p>

                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr;
                        gap:10px; max-width:300px; margin:0 auto 18px;">
                        <div style="padding:10px 4px; border-radius:12px;
                            background:rgba(0,0,0,0.04); text-align:center;">
                            <div style="font-size:1.1rem; font-family:var(--font-heading);">${moves}</div>
                            <div style="font-size:0.62rem; color:var(--text-muted); font-weight:700;">HAMLE</div>
                        </div>
                        <div style="padding:10px 4px; border-radius:12px;
                            background:var(--pastel-yellow); border:1px solid #D97706; text-align:center;">
                            <div style="font-size:1.1rem; font-family:var(--font-heading); color:#D97706;">+${starsAwarded}</div>
                            <div style="font-size:0.62rem; color:#78350F; font-weight:700;">YILDIZ</div>
                        </div>
                        <div style="padding:10px 4px; border-radius:12px;
                            background:rgba(0,0,0,0.04); text-align:center;">
                            <div style="font-size:1.1rem; font-family:var(--font-heading);">${time}sn</div>
                            <div style="font-size:0.62rem; color:var(--text-muted); font-weight:700;">SÜRE</div>
                        </div>
                    </div>

                    <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                        <button class="btn btn-success" id="btn-replay"
                            style="flex:1; min-width:120px;">🔄 Tekrar Oyna</button>
                        ${hasNext ? `<button class="btn btn-primary" id="btn-next-level"
                            style="flex:1; min-width:120px;">➡️ Seviye ${levelNumber + 1}</button>` : ''}
                        <button class="btn btn-locked" id="btn-finish-win"
                            style="flex:1; min-width:120px;">✅ Kaydet & Kapat</button>
                    </div>
                </div>`;

            container.querySelector("#btn-replay").addEventListener("click", () => {
                playSound('click');
                startMemoryGame(container, levelNumber);
            });
            if (hasNext) {
                container.querySelector("#btn-next-level").addEventListener("click", () => {
                    playSound('click');
                    startMemoryGame(container, levelNumber + 1);
                });
            }
            container.querySelector("#btn-finish-win").addEventListener("click", () => {
                playSound('click');
                closeModal();
                renderAchievements();
            });
        }, 600);
    }
    // ============================================================
    // BALON PATLATMA OYUN MOTORU
    // ============================================================
    function startBalloonGame(container, levelNumber) {
        const LEVELS = [
            { level: 1, name: "Kırmızı Balonlar", emoji: "🎈", targetCount: 5, targetColor: "kırmızı", targetColorHex: "#ef4444", speedMin: 3.5, speedMax: 4.8, spawnInterval: 1400, color: "#FFADAD", scoreBase: 50, balloonColors: [{ name: "kırmızı", hex: "#ef4444" }, { name: "mavi", hex: "#3b82f6" }, { name: "yeşil", hex: "#10b981" }] },
            { level: 2, name: "Minik Uçuşlar", emoji: "🎈", targetCount: 6, targetColor: "kırmızı", targetColorHex: "#ef4444", speedMin: 3.2, speedMax: 4.5, spawnInterval: 1300, color: "#FFADAD", scoreBase: 70, balloonColors: [{ name: "kırmızı", hex: "#ef4444" }, { name: "mavi", hex: "#3b82f6" }, { name: "yeşil", hex: "#10b981" }] },
            { level: 3, name: "Mavi Avcı", emoji: "🌊", targetCount: 8, targetColor: "mavi", targetColorHex: "#3b82f6", speedMin: 3.0, speedMax: 4.2, spawnInterval: 1200, color: "#A0C4FF", scoreBase: 100, balloonColors: [{ name: "kırmızı", hex: "#ef4444" }, { name: "mavi", hex: "#3b82f6" }, { name: "yeşil", hex: "#10b981" }, { name: "sarı", hex: "#eab308" }] },
            { level: 4, name: "Gök Rüzgarı", emoji: "🌊", targetCount: 9, targetColor: "mavi", targetColorHex: "#3b82f6", speedMin: 2.8, speedMax: 4.0, spawnInterval: 1100, color: "#A0C4FF", scoreBase: 120, balloonColors: [{ name: "kırmızı", hex: "#ef4444" }, { name: "mavi", hex: "#3b82f6" }, { name: "yeşil", hex: "#10b981" }, { name: "sarı", hex: "#eab308" }] },
            { level: 5, name: "Sarı Rüzgar", emoji: "☀️", targetCount: 10, targetColor: "sarı", targetColorHex: "#eab308", speedMin: 2.5, speedMax: 3.8, spawnInterval: 1000, color: "#FDFFB6", scoreBase: 150, balloonColors: [{ name: "kırmızı", hex: "#ef4444" }, { name: "mavi", hex: "#3b82f6" }, { name: "yeşil", hex: "#10b981" }, { name: "sarı", hex: "#eab308" }, { name: "mor", hex: "#a855f7" }] },
            { level: 6, name: "Altın Güneş", emoji: "☀️", targetCount: 11, targetColor: "sarı", targetColorHex: "#eab308", speedMin: 2.3, speedMax: 3.6, spawnInterval: 950, color: "#FDFFB6", scoreBase: 180, balloonColors: [{ name: "kırmızı", hex: "#ef4444" }, { name: "mavi", hex: "#3b82f6" }, { name: "yeşil", hex: "#10b981" }, { name: "sarı", hex: "#eab308" }, { name: "mor", hex: "#a855f7" }] },
            { level: 7, name: "Yeşil Orman", emoji: "🌲", targetCount: 12, targetColor: "yeşil", targetColorHex: "#10b981", speedMin: 2.2, speedMax: 3.4, spawnInterval: 850, color: "#CAFFBF", scoreBase: 250, balloonColors: [{ name: "kırmızı", hex: "#ef4444" }, { name: "mavi", hex: "#3b82f6" }, { name: "yeşil", hex: "#10b981" }, { name: "sarı", hex: "#eab308" }, { name: "mor", hex: "#a855f7" }] },
            { level: 8, name: "Doğa Yolu", emoji: "🌲", targetCount: 13, targetColor: "yeşil", targetColorHex: "#10b981", speedMin: 2.0, speedMax: 3.2, spawnInterval: 800, color: "#CAFFBF", scoreBase: 300, balloonColors: [{ name: "kırmızı", hex: "#ef4444" }, { name: "mavi", hex: "#3b82f6" }, { name: "yeşil", hex: "#10b981" }, { name: "sarı", hex: "#eab308" }, { name: "mor", hex: "#a855f7" }] },
            { level: 9, name: "Mor Bulutlar", emoji: "🔮", targetCount: 14, targetColor: "mor", targetColorHex: "#a855f7", speedMin: 1.8, speedMax: 3.0, spawnInterval: 750, color: "#D8BBFF", scoreBase: 350, balloonColors: [{ name: "kırmızı", hex: "#ef4444" }, { name: "mavi", hex: "#3b82f6" }, { name: "yeşil", hex: "#10b981" }, { name: "sarı", hex: "#eab308" }, { name: "mor", hex: "#a855f7" }] },
            { level: 10, name: "Balon Fırtınası", emoji: "👑", targetCount: 15, targetColor: "mor", targetColorHex: "#a855f7", speedMin: 1.5, speedMax: 2.6, spawnInterval: 650, color: "#FFC6FF", scoreBase: 500, balloonColors: [{ name: "kırmızı", hex: "#ef4444" }, { name: "mavi", hex: "#3b82f6" }, { name: "yeşil", hex: "#10b981" }, { name: "sarı", hex: "#eab308" }, { name: "mor", hex: "#a855f7" }] }
        ];

        const cfg = LEVELS[levelNumber - 1];

        // Şaşırmaç: Balon çıkış hızını (spawn) artırmak için aralığı daraltıyoruz
        cfg.spawnInterval = Math.floor(cfg.spawnInterval * 0.65);
        
        // Her seviyede farklı/rastgele renk hedefi
        const randomTarget = cfg.balloonColors[Math.floor(Math.random() * cfg.balloonColors.length)];
        cfg.targetColor = randomTarget.name;
        cfg.targetColorHex = randomTarget.hex;

        let poppedCount = 0;
        let lastColorName = "";
        let consecutiveColorCount = 0;
        let lives = 3;
        let gameTime = 0;
        let spawnTimer = null;
        let balloonElements = [];

        const tabsHTML = LEVELS.map(l => {
            const isUnlocked = isLevelUnlocked(2, l.level);
            return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" ' + (isUnlocked ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"') + '>' + (isUnlocked ? l.emoji + ' ' + l.level : '🔒 ' + l.level) + '</button>';
        }).join('');

        container.innerHTML = `
            <div class="balloon-game-container" style="user-select:none;">
                <div class="level-tabs">${tabsHTML}</div>
                <div class="balloon-target-card" style="background:rgba(255,255,255,0.7); border:1px solid rgba(0,0,0,0.06); border-radius:14px; padding:8px 12px; margin-bottom:12px; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:var(--shadow-small);">
                    <span style="font-size:0.95rem; font-weight:700; color:var(--text-muted);">🎯 Hedef:</span>
                    <strong style="color:${cfg.targetColorHex}; font-size:1.1rem; text-transform:uppercase; background:${cfg.targetColorHex}12; padding:3px 10px; border-radius:999px;">
                        ${cfg.targetColor} (${cfg.targetCount} Adet)
                    </strong>
                </div>
                <div class="game-stats">
                    <div class="stat-item">
                        <i data-lucide="timer" style="width:16px;height:16px;"></i>
                        <span id="game-timer">0</span>sn
                    </div>
                    <div class="stat-item" id="balloon-lives" style="display:flex; gap:4px;">
                        <!-- Hearts -->
                    </div>
                    <div class="stat-item">
                        <i data-lucide="check-circle" style="width:16px;height:16px;"></i>
                        İlerleme: <span id="popped-count">0</span>/${cfg.targetCount}
                    </div>
                </div>
                <div class="balloon-playfield" id="balloon-playfield"></div>
                <button class="btn btn-locked" id="btn-give-up" style="width:100%; font-size:0.82rem;">
                    🏳️ Vazgeç & Kapat
                </button>
            </div>
        `;

        lucide.createIcons();
        updateLivesDisplay();

        container.querySelectorAll(".level-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                if (tab.hasAttribute("disabled")) return;
                const next = parseInt(tab.dataset.level);
                if (next === levelNumber) return;
                playSound('click');
                cleanUp();
                startBalloonGame(container, next);
            });
        });

        container.querySelector("#btn-give-up").addEventListener("click", () => {
            playSound('locked');
            cleanUp();
            closeModal();
        });

        function cleanUp() {
            if (spawnTimer) clearInterval(spawnTimer);
            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
            balloonElements.forEach(b => b.remove());
            balloonElements = [];
        }

        function updateLivesDisplay() {
            const livesEl = document.getElementById("balloon-lives");
            if (!livesEl) return;
            livesEl.innerHTML = "";
            for (let i = 0; i < 3; i++) {
                const heart = document.createElement("i");
                heart.style.width = "16px";
                heart.style.height = "16px";
                heart.setAttribute("data-lucide", "heart");
                if (i < lives) {
                    heart.style.fill = "#ef4444";
                    heart.style.color = "#ef4444";
                } else {
                    heart.style.fill = "none";
                    heart.style.color = "var(--text-muted)";
                    heart.style.opacity = "0.3";
                }
                livesEl.appendChild(heart);
            }
            lucide.createIcons();
        }

        function createBalloon() {
            const playfield = document.getElementById("balloon-playfield");
            if (!playfield) return;

            let selectedColor;
            let attempts = 0;
            do {
                if (Math.random() < 0.45) {
                    selectedColor = cfg.balloonColors.find(c => c.name === cfg.targetColor) || cfg.balloonColors[0];
                } else {
                    selectedColor = cfg.balloonColors[Math.floor(Math.random() * cfg.balloonColors.length)];
                }
                attempts++;
            } while (selectedColor.name === lastColorName && consecutiveColorCount >= 2 && attempts < 15);

            if (selectedColor.name === lastColorName) {
                consecutiveColorCount++;
            } else {
                lastColorName = selectedColor.name;
                consecutiveColorCount = 1;
            }

            const balloon = document.createElement("div");
            balloon.className = "game-balloon";
            balloon.dataset.color = selectedColor.name;
            
            const floatDuration = Math.random() * (cfg.speedMax - cfg.speedMin) + cfg.speedMin;
            balloon.style.setProperty("--duration", `${floatDuration}s`);
            balloon.style.left = `${Math.random() * 80 + 10}%`;
            
            // Şaşırmaç: %30 ihtimalle zigzag hareketi yapan balon
            const isTricky = Math.random() < 0.30;
            const svgClass = isTricky ? "balloon-svg-element zigzag-animation" : "balloon-svg-element";

            balloon.innerHTML = `
                <svg class="${svgClass}" viewBox="0 0 50 70" style="width:100%; height:100%; filter: drop-shadow(0 5px 8px rgba(0,0,0,0.15)); transition: transform 0.1s ease, fill 0.3s ease;">
                    <path class="balloon-body-path" d="M25,0 C11,0 0,11 0,25 C0,39 15,50 25,55 C35,50 50,39 50,25 C50,11 39,0 25,0 Z" fill="${selectedColor.hex}" />
                    <ellipse cx="15" cy="15" rx="4" ry="7" fill="#FFFFFF" opacity="0.4" transform="rotate(-30 15 15)" />
                    <path class="balloon-knot-path" d="M25,55 L22,60 L28,60 Z" fill="${selectedColor.hex}" />
                    <path d="M25,60 C25,64 22,67 25,72" fill="none" stroke="#CBD5E1" stroke-width="2" />
                </svg>
            `;

            // Şaşırmaç: %25 ihtimalle havada rengi değişen balon!
            let currentColorName = selectedColor.name;
            if (Math.random() < 0.25) {
                const swapTime = Math.random() * (floatDuration * 1000 * 0.4) + (floatDuration * 1000 * 0.2);
                setTimeout(() => {
                    if (balloonElements.includes(balloon)) {
                        const otherColors = cfg.balloonColors.filter(c => c.name !== currentColorName);
                        if (otherColors.length > 0) {
                            const newColor = otherColors[Math.floor(Math.random() * otherColors.length)];
                            currentColorName = newColor.name;
                            balloon.dataset.color = newColor.name;
                            const body = balloon.querySelector('.balloon-body-path');
                            const knot = balloon.querySelector('.balloon-knot-path');
                            if (body && knot) {
                                body.style.transition = "fill 0.4s";
                                knot.style.transition = "fill 0.4s";
                                body.setAttribute('fill', newColor.hex);
                                knot.setAttribute('fill', newColor.hex);
                            }
                        }
                    }
                }, swapTime);
            }

            balloon.addEventListener("mousedown", (e) => {
                e.stopPropagation();
                popBalloon(balloon, currentColorName);
            });
            balloon.addEventListener("touchstart", (e) => {
                e.stopPropagation();
                e.preventDefault();
                popBalloon(balloon, currentColorName);
            }, { passive: false });

            playfield.appendChild(balloon);
            balloonElements.push(balloon);

            balloon.addEventListener("animationend", () => {
                if (selectedColor.name === cfg.targetColor) {
                    lives--;
                    updateLivesDisplay();
                    triggerShakePlayfield();
                    playSound('locked');
                    if (lives <= 0) {
                        gameOver();
                    }
                }
                removeBalloon(balloon);
            });
        }

        function triggerShakePlayfield() {
            const playfield = document.getElementById("balloon-playfield");
            if (playfield) {
                playfield.style.animation = "shake 0.35s ease";
                setTimeout(() => { playfield.style.animation = ""; }, 350);
            }
        }

        function popBalloon(balloon, balloonColor) {
            if (balloon.classList.contains("popped")) return;
            balloon.classList.add("popped");

            if (balloonColor === cfg.targetColor) {
                poppedCount++;
                const countEl = document.getElementById("popped-count");
                if (countEl) countEl.innerText = poppedCount;
                playSound('success');

                const particleCount = 10;
                for (let i = 0; i < particleCount; i++) {
                    const particle = document.createElement("div");
                    particle.className = "balloon-particle";
                    particle.style.background = balloon.style.borderColor;
                    particle.style.left = `${balloon.offsetLeft + balloon.clientWidth / 2}px`;
                    particle.style.top = `${balloon.offsetTop + balloon.clientHeight / 2}px`;
                    balloon.parentElement.appendChild(particle);
                    setTimeout(() => particle.remove(), 750);
                }

                if (poppedCount >= cfg.targetCount) {
                    gameWin();
                }
            } else {
                lives--;
                updateLivesDisplay();
                triggerShakePlayfield();
                playSound('locked');
                if (lives <= 0) {
                    gameOver();
                }
            }

            balloon.style.transform = "scale(1.2)";
            balloon.style.opacity = "0";
            setTimeout(() => removeBalloon(balloon), 150);
        }

        function removeBalloon(balloon) {
            balloon.remove();
            balloonElements = balloonElements.filter(b => b !== balloon);
        }

        function gameOver() {
            cleanUp();
            lockGame(2);
            playSound('locked');

            setTimeout(() => {
                container.innerHTML = `
                    <div style="text-align:center; padding:16px 8px;">
                        <div style="font-size:4.5rem; margin-bottom:12px; animation:shake 0.5s ease-in-out;">😢🎈💥</div>
                        <h2 style="font-size:1.6rem; margin-bottom:6px; color:#ef4444;">Canların Tükendi!</h2>
                        <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                            Çok fazla can kaybettin ve seviyeyi tamamlayamadın. 1 global can kaybettin!
                        </p>
                        <div style="display:flex; gap:10px; justify-content:center;">
                            <button class="btn btn-primary" id="btn-restart" style="flex:1; max-width:160px;">🔄 Tekrar Dene</button>
                            <button class="btn btn-locked" id="btn-close-fail" style="flex:1; max-width:160px;">❌ Kapat</button>
                        </div>
                    </div>
                `;

                container.querySelector("#btn-restart").addEventListener("click", () => {
                    playSound('click');
                    startBalloonGame(container, levelNumber);
                });
                container.querySelector("#btn-close-fail").addEventListener("click", () => {
                    playSound('click');
                    closeModal();
                });
            }, 600);
        }

        function gameWin() {
            cleanUp();
            unlockNextLevel(2, levelNumber);
            playSound('success');

            const scoreAwarded = cfg.scoreBase + Math.max(0, 300 - gameTime * 5 + lives * 30);
            const starsAwarded = lives === 3 ? 20 : (lives === 2 ? 15 : 10);

            const ach = window.achievementsData;
            ach.userStats.stars += starsAwarded;
            ach.userStats.totalScore += scoreAwarded;
            ach.userStats.completedGames += 1;

            const explorerBadge = ach.badges.find(b => b.id === "balloon_master");
            if (explorerBadge) {
                explorerBadge.unlocked = true;
                explorerBadge.tooltip = "Balon Avcısı: Balon Patlatma oyununda ustalaştın!";
            }

            const done = ach.dailyTasks.filter(t => t.completed).length;
            ach.userStats.progressPercentage = Math.round((done / ach.dailyTasks.length) * 100);
        if (typeof scoreAwarded !== 'undefined' && window.CURRENT_ACTIVE_GAME_ID) {
            if(window.recordGameScore) window.recordGameScore(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
            if(window.achievementsData && window.achievementsData.addScoreToGame) window.achievementsData.addScoreToGame(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
        }
        if(window.achievementsData && window.achievementsData.saveAchievements) window.achievementsData.saveAchievements();

            setTimeout(() => {
                container.innerHTML = `
                    <div style="text-align:center; padding:16px 8px;">
                        <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">🎈🏆🎉</div>
                        <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:${cfg.color}; font-weight:700; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">🌟 Harika Patlatıcı!</div>
                        <h2 style="font-size:1.6rem; margin-bottom:6px;">Seviye ${levelNumber} Tamamlandı!</h2>
                        <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                            ${cfg.name} etabını <strong>${gameTime} saniyede</strong> ve <strong>${3 - lives} hata</strong> ile tamamladın!
                        </p>
                        
                        <div style="display:flex; justify-content:center; gap:14px; margin-bottom:22px;">
                            <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-yellow); border:2px solid #D97706; text-align:center; min-width:90px;">
                                <div style="font-size:1.5rem; font-family:var(--font-heading); color:#D97706;">+${starsAwarded}</div>
                                <div style="font-size:0.7rem; font-weight:700; color:#78350F;">YILDIZ</div>
                            </div>
                            <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-green); border:2px solid #166534; text-align:center; min-width:90px;">
                                <div style="font-size:1.5rem; font-family:var(--font-heading); color:#166534;">+${scoreAwarded}</div>
                                <div style="font-size:0.7rem; font-weight:700; color:#14532D;">PUAN</div>
                            </div>
                        </div>

                        <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                            <button class="btn btn-success" id="btn-replay" style="flex:1; min-width:120px;">🔄 Tekrar Oyna</button>
                            ${levelNumber < 10 ? `<button class="btn btn-primary" id="btn-next-level" style="flex:1; min-width:120px;">➡️ Seviye ${levelNumber + 1}</button>` : ''}
                            <button class="btn btn-locked" id="btn-finish-win" style="flex:1; min-width:120px;">✅ Kaydet & Kapat</button>
                        </div>
                    </div>
                `;

                container.querySelector("#btn-replay").addEventListener("click", () => {
                    playSound('click');
                    startBalloonGame(container, levelNumber);
                });
                if (levelNumber < 10) {
                    container.querySelector("#btn-next-level").addEventListener("click", () => {
                        playSound('click');
                        startBalloonGame(container, levelNumber + 1);
                    });
                }
                container.querySelector("#btn-finish-win").addEventListener("click", () => {
                    playSound('click');
                    closeModal();
                    renderAchievements();
                });
            }, 600);
        }

        spawnTimer = setInterval(createBalloon, cfg.spawnInterval);

        if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
        activeGameTimer = setInterval(() => {
            gameTime++;
            const timerEl = document.getElementById("game-timer");
            if (timerEl) timerEl.innerText = gameTime;
            else { cleanUp(); }
        }, 1000);
    }
    // ============================================================
    // MATEMATİK DEHASI OYUN MOTORU
    // ============================================================
    function startMathGame(container, levelNumber) {
        const LEVELS = [
            { level: 1, name: "Küçük Sayılar", emoji: "🍎", targetCorrect: 5, scoreBase: 50, color: "#CAFFBF", type: "addition", maxNum: 10 },
            { level: 2, name: "Minik Eksiler", emoji: "🌱", targetCorrect: 5, scoreBase: 70, color: "#CAFFBF", type: "subtraction", maxNum: 10 },
            { level: 3, name: "Sayılar Büyüyor", emoji: "🚀", targetCorrect: 6, scoreBase: 100, color: "#A0C4FF", type: "subtraction", maxNum: 20 },
            { level: 4, name: "Hızlı Toplamlar", emoji: "⚡", targetCorrect: 6, scoreBase: 120, color: "#A0C4FF", type: "addition", maxNum: 20 },
            { level: 5, name: "Çarpım Tablosu", emoji: "✖️", targetCorrect: 6, scoreBase: 150, color: "#FDFFB6", type: "multiplication", maxNum: 5 },
            { level: 6, name: "Çarpım Ustası", emoji: "💎", targetCorrect: 7, scoreBase: 180, color: "#FDFFB6", type: "multiplication", maxNum: 9 },
            { level: 7, name: "Akıl Oyunları", emoji: "🧠", targetCorrect: 8, scoreBase: 250, color: "#D8BBFF", type: "mixed", maxNum: 30 },
            { level: 8, name: "Karışık Matriks", emoji: "📊", targetCorrect: 8, scoreBase: 300, color: "#D8BBFF", type: "mixed", maxNum: 40 },
            { level: 9, name: "Matematik Kralı", emoji: "👑", targetCorrect: 9, scoreBase: 400, color: "#FFADAD", type: "challenge", maxNum: 50 },
            { level: 10, name: "Süper Matematik", emoji: "🔮", targetCorrect: 10, scoreBase: 600, color: "#FFADAD", type: "challenge", maxNum: 80 }
        ];

        const cfg = LEVELS[levelNumber - 1];

        let correctAnswers = 0;
        let totalQuestions = 0;
        let lives = 3;
        let incorrectCount = 0;
        let gameTime = 0;
        let currentQuestion = null;
        let isAnswering = false;

        const tabsHTML = LEVELS.map(l => {
            const isUnlocked = isLevelUnlocked(3, l.level);
            return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" ' + (isUnlocked ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"') + '>' + (isUnlocked ? l.emoji + ' ' + l.level : '🔒 ' + l.level) + '</button>';
        }).join('');

        container.innerHTML = `
            <div class="math-game-container" style="user-select:none;">
                <div class="level-tabs">${tabsHTML}</div>
                <div class="math-card">
                    <div style="display:flex; align-items:center; justify-content:center; gap:20px; width: 100%;">
                        <svg viewBox="0 0 200 200" class="math-mascot-img" id="math-mascot">
                            <path d="M70,80 C50,80 35,95 35,115 C35,135 55,150 75,150 C80,150 85,145 90,140 C95,145 100,150 105,150 C125,150 145,135 145,115 C145,95 130,80 110,80 C105,80 100,85 95,90 C90,85 85,80 70,80 Z" fill="#FFC6FF" stroke="#1F2937" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
                            <circle cx="72" cy="115" r="8" fill="#1F2937" id="math-eye-l" />
                            <circle cx="72" cy="112" r="3" fill="#FFFFFF" />
                            <circle cx="108" cy="115" r="8" fill="#1F2937" id="math-eye-r" />
                            <circle cx="108" cy="112" r="3" fill="#FFFFFF" />
                            <circle cx="58" cy="125" r="6" fill="#FFADAD" opacity="0.8" />
                            <circle cx="122" cy="125" r="6" fill="#FFADAD" opacity="0.8" />
                            <path d="M83,124 Q90,131 97,124" fill="none" stroke="#1F2937" stroke-width="3" stroke-linecap="round" id="math-mouth" />
                            <polygon points="90,45 130,60 90,75 50,60" fill="#4F46E5" stroke="#1F2937" stroke-width="5" stroke-linejoin="round" />
                            <rect x="85" y="60" width="10" height="25" fill="#4F46E5" stroke="#1F2937" stroke-width="5" />
                        </svg>
                    </div>
                    <div class="math-question" id="math-question-text">? + ? = ?</div>
                </div>
                <div class="game-stats">
                    <div class="stat-item">
                        <i data-lucide="timer" style="width:16px;height:16px;"></i>
                        <span id="game-timer">0</span>sn
                    </div>
                    <div class="stat-item" id="math-lives" style="display:flex; gap:4px;">
                        <!-- Hearts -->
                    </div>
                    <div class="stat-item">
                        <i data-lucide="help-circle" style="width:16px;height:16px;"></i>
                        Soru: <span id="math-question-count">1</span>
                    </div>
                    <div class="stat-item">
                        <i data-lucide="check-circle" style="width:16px;height:16px;"></i>
                        Doğru: <span id="math-correct-count">0</span>/${cfg.targetCorrect}
                    </div>
                </div>
                <div class="math-answers-grid" id="math-answers"></div>
                <button class="btn btn-locked" id="btn-give-up" style="width:100%; font-size:0.82rem;">
                    🏳️ Vazgeç & Kapat
                </button>
            </div>
        `;

        lucide.createIcons();
        updateLivesDisplay();

        container.querySelectorAll(".level-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                if (tab.hasAttribute("disabled")) return;
                const next = parseInt(tab.dataset.level);
                if (next === levelNumber) return;
                playSound('click');
                cleanUp();
                startMathGame(container, next);
            });
        });

        container.querySelector("#btn-give-up").addEventListener("click", () => {
            playSound('locked');
            cleanUp();
            closeModal();
        });

        function cleanUp() {
            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
        }

        function updateLivesDisplay() {
            const livesEl = document.getElementById("math-lives");
            if (!livesEl) return;
            livesEl.innerHTML = "";
            for (let i = 0; i < 3; i++) {
                const heart = document.createElement("i");
                heart.style.width = "16px";
                heart.style.height = "16px";
                heart.setAttribute("data-lucide", "heart");
                if (i < lives) {
                    heart.style.fill = "#ef4444";
                    heart.style.color = "#ef4444";
                } else {
                    heart.style.fill = "none";
                    heart.style.color = "var(--text-muted)";
                    heart.style.opacity = "0.3";
                }
                livesEl.appendChild(heart);
            }
            lucide.createIcons();
        }

        function generateQuestion() {
            let num1 = 0;
            let num2 = 0;
            let op = "+";
            let equationText = "";
            let answer = 0;
            let isChallenge = false;

            let type = cfg.type;
            if (type === "mixed") {
                const types = ["addition", "subtraction", "multiplication"];
                type = types[Math.floor(Math.random() * types.length)];
            } else if (type === "challenge") {
                isChallenge = true;
                const types = ["addition", "subtraction", "multiplication"];
                type = types[Math.floor(Math.random() * types.length)];
            }

            if (type === "addition") {
                num1 = Math.floor(Math.random() * (cfg.maxNum - 2)) + 2;
                num2 = Math.floor(Math.random() * (cfg.maxNum - 2)) + 2;
                op = "+";
                answer = num1 + num2;
            } else if (type === "subtraction") {
                num1 = Math.floor(Math.random() * (cfg.maxNum - 5)) + 5;
                num2 = Math.floor(Math.random() * (num1 - 2)) + 2;
                op = "-";
                answer = num1 - num2;
            } else if (type === "multiplication") {
                num1 = Math.floor(Math.random() * 5) + 2;
                num2 = Math.floor(Math.random() * 9) + 2;
                op = "×";
                answer = num1 * num2;
            }

            if (isChallenge) {
                const blankChoice = ["num1", "num2"][Math.floor(Math.random() * 2)];
                if (blankChoice === "num1") {
                    equationText = `? ${op} ${num2} = ${answer}`;
                    currentQuestion = { display: equationText, answer: num1, choices: generateChoices(num1) };
                } else {
                    equationText = `${num1} ${op} ? = ${answer}`;
                    currentQuestion = { display: equationText, answer: num2, choices: generateChoices(num2) };
                }
            } else {
                equationText = `${num1} ${op} ${num2} = ?`;
                currentQuestion = { display: equationText, answer: answer, choices: generateChoices(answer) };
            }

            const qEl = document.getElementById("math-question-text");
            if (qEl) qEl.innerText = currentQuestion.display;

            const answersGrid = document.getElementById("math-answers");
            if (!answersGrid) return;
            answersGrid.innerHTML = "";
            
            currentQuestion.choices.forEach(choice => {
                const btn = document.createElement("button");
                btn.className = "math-answer-btn";
                btn.innerText = choice;
                btn.addEventListener("click", () => handleAnswer(choice, btn));
                answersGrid.appendChild(btn);
            });

            setMascotState("normal");
            isAnswering = false;
        }

        function generateChoices(correctAns) {
            const choices = new Set([correctAns]);
            while (choices.size < 4) {
                const dev = Math.floor(Math.random() * 9) - 4;
                const c = correctAns + dev;
                if (c >= 0) choices.add(c);
            }
            return shuffleArray(Array.from(choices));
        }

        function shuffleArray(arr) {
            return arr.sort(() => Math.random() - 0.5);
        }

        function setMascotState(state) {
            const mascot = document.getElementById("math-mascot");
            const eyeL = document.getElementById("math-eye-l");
            const eyeR = document.getElementById("math-eye-r");
            const mouth = document.getElementById("math-mouth");
            if (!mascot || !eyeL || !eyeR || !mouth) return;

            if (state === "happy") {
                mascot.style.transform = "scale(1.08) rotate(5deg)";
                eyeL.setAttribute("cy", "112");
                eyeR.setAttribute("cy", "112");
                mouth.setAttribute("d", "M80,125 Q90,138 100,125");
                mouth.setAttribute("stroke-width", "5");
            } else if (state === "sad") {
                mascot.style.transform = "scale(0.95) rotate(-5deg)";
                eyeL.setAttribute("cy", "118");
                eyeR.setAttribute("cy", "118");
                mouth.setAttribute("d", "M83,128 Q90,120 97,128");
                mouth.setAttribute("stroke-width", "3");
            } else {
                mascot.style.transform = "";
                eyeL.setAttribute("cy", "115");
                eyeR.setAttribute("cy", "115");
                mouth.setAttribute("d", "M83,124 Q90,131 97,124");
                mouth.setAttribute("stroke-width", "3");
            }
        }

        function handleAnswer(selectedChoice, selectedBtn) {
            if (isAnswering) return;
            isAnswering = true;

            const allBtns = container.querySelectorAll(".math-answer-btn");
            allBtns.forEach(btn => btn.style.pointerEvents = "none");

            if (selectedChoice === currentQuestion.answer) {
                playSound('success');
                setMascotState("happy");
                selectedBtn.classList.add("correct-glow");
                correctAnswers++;
                
                const correctEl = document.getElementById("math-correct-count");
                if (correctEl) correctEl.innerText = correctAnswers;

                setTimeout(() => {
                    if (correctAnswers >= cfg.targetCorrect) {
                        gameWin();
                    } else {
                        totalQuestions++;
                        const countEl = document.getElementById("math-question-count");
                        if (countEl) countEl.innerText = totalQuestions + 1;
                        generateQuestion();
                    }
                }, 1300);
            } else {
                lives--;
                updateLivesDisplay();
                playSound('locked');
                setMascotState("sad");
                selectedBtn.classList.add("wrong-glow");
                incorrectCount++;

                allBtns.forEach(btn => {
                    if (parseInt(btn.innerText) === currentQuestion.answer) {
                        btn.classList.add("correct-glow");
                    }
                });

                setTimeout(() => {
                    if (lives <= 0) {
                        gameOver();
                    } else {
                        totalQuestions++;
                        const countEl = document.getElementById("math-question-count");
                        if (countEl) countEl.innerText = totalQuestions + 1;
                        generateQuestion();
                    }
                }, 1500);
            }
        }

        function gameOver() {
            cleanUp();
            lockGame(3);
            playSound('locked');

            setTimeout(() => {
                container.innerHTML = `
                    <div style="text-align:center; padding:16px 8px;">
                        <div style="font-size:4.5rem; margin-bottom:12px; animation:shake 0.5s ease-in-out;">😢💥🔢</div>
                        <h2 style="font-size:1.6rem; margin-bottom:6px; color:#ef4444;">Canların Tükendi!</h2>
                        <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                            Matematik sorularında canların bitti. 1 global can kaybettin!
                        </p>
                        <div style="display:flex; gap:10px; justify-content:center;">
                            <button class="btn btn-primary" id="btn-restart" style="flex:1; max-width:160px;">🔄 Tekrar Dene</button>
                            <button class="btn btn-locked" id="btn-close-fail" style="flex:1; max-width:160px;">❌ Kapat</button>
                        </div>
                    </div>
                `;

                container.querySelector("#btn-restart").addEventListener("click", () => {
                    playSound('click');
                    startMathGame(container, levelNumber);
                });
                container.querySelector("#btn-close-fail").addEventListener("click", () => {
                    playSound('click');
                    closeModal();
                });
            }, 600);
        }

        function gameWin() {
            cleanUp();
            unlockNextLevel(3, levelNumber);
            playSound('success');

            const scoreAwarded = cfg.scoreBase + Math.max(0, 300 - gameTime * 4 - incorrectCount * 10);
            const starsAwarded = incorrectCount === 0 ? 25 : (incorrectCount <= 2 ? 15 : 10);

            const ach = window.achievementsData;
            ach.userStats.stars += starsAwarded;
            ach.userStats.totalScore += scoreAwarded;
            ach.userStats.completedGames += 1;

            const task4 = ach.dailyTasks.find(t => t.id === 4);
            if (task4 && !task4.completed) {
                task4.completed = true;
                ach.userStats.stars += task4.reward;
            }

            const task1 = ach.dailyTasks.find(t => t.id === 1);
            if (task1 && !task1.completed) {
                task1.completed = true;
                ach.userStats.stars += task1.reward;
            }

            const done = ach.dailyTasks.filter(t => t.completed).length;
            ach.userStats.progressPercentage = Math.round((done / ach.dailyTasks.length) * 100);
        if (typeof scoreAwarded !== 'undefined' && window.CURRENT_ACTIVE_GAME_ID) {
            if(window.recordGameScore) window.recordGameScore(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
            if(window.achievementsData && window.achievementsData.addScoreToGame) window.achievementsData.addScoreToGame(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
        }
        if(window.achievementsData && window.achievementsData.saveAchievements) window.achievementsData.saveAchievements();

            const badge = ach.badges.find(b => b.id === "math_wizard");
            if (badge) {
                badge.unlocked = true;
                badge.tooltip = "Sayı Sihirbazı: Matematik oyununda seviye tamamladın!";
            }

            setTimeout(() => {
                container.innerHTML = `
                    <div style="text-align:center; padding:16px 8px;">
                        <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">🧙‍♂️🏆</div>
                        <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:${cfg.color}; font-weight:700; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">🌟 Matematik Dehası!</div>
                        <h2 style="font-size:1.6rem; margin-bottom:6px;">${cfg.emoji} Seviye ${levelNumber} Tamamlandı!</h2>
                        <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                            Etabı <strong>${gameTime} saniyede</strong> ve <strong>${incorrectCount} hata</strong> ile tamamladın!
                        </p>
                        
                        <div style="display:flex; justify-content:center; gap:14px; margin-bottom:22px;">
                            <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-yellow); border:2px solid #D97706; text-align:center; min-width:90px;">
                                <div style="font-size:1.5rem; font-family:var(--font-heading); color:#D97706;">+${starsAwarded}</div>
                                <div style="font-size:0.7rem; font-weight:700; color:#78350F;">YILDIZ</div>
                            </div>
                            <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-green); border:2px solid #166534; text-align:center; min-width:90px;">
                                <div style="font-size:1.5rem; font-family:var(--font-heading); color:#166534;">+${scoreAwarded}</div>
                                <div style="font-size:0.7rem; font-weight:700; color:#14532D;">PUAN</div>
                            </div>
                        </div>

                        <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                            <button class="btn btn-success" id="btn-replay" style="flex:1; min-width:120px;">🔄 Tekrar Oyna</button>
                            ${levelNumber < 10 ? `<button class="btn btn-primary" id="btn-next-level" style="flex:1; min-width:120px;">➡️ Seviye ${levelNumber + 1}</button>` : ''}
                            <button class="btn btn-locked" id="btn-finish-win" style="flex:1; min-width:120px;">✅ Kaydet & Kapat</button>
                        </div>
                    </div>
                `;

                container.querySelector("#btn-replay").addEventListener("click", () => {
                    playSound('click');
                    startMathGame(container, levelNumber);
                });
                if (levelNumber < 10) {
                    container.querySelector("#btn-next-level").addEventListener("click", () => {
                        playSound('click');
                        startMathGame(container, levelNumber + 1);
                    });
                }
                container.querySelector("#btn-finish-win").addEventListener("click", () => {
                    playSound('click');
                    closeModal();
                    renderAchievements();
                });
            }, 600);
        }

        generateQuestion();

        if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
        activeGameTimer = setInterval(() => {
            gameTime++;
            const timerEl = document.getElementById("game-timer");
            if (timerEl) timerEl.innerText = gameTime;
            else { cleanUp(); }
        }, 1000);
    }
    // ============================================================
    // KELİMELERİ AVLA OYUN MOTORU
    // ============================================================
    function startWordGame(container, levelNumber) {
        const LEVELS = [
            {
                level: 1, name: "Sevimli Ev", emoji: "🏠", targetCorrect: 3, scoreBase: 50, color: "#CAFFBF",
                words: [
                    { word: "SÜT", clue: "Kemiklerimizi güçlendiren yararlı beyaz içecek" },
                    { word: "KUŞ", clue: "Göklerde uçan, cik cik ötüşen dostumuz" },
                    { word: "BAL", clue: "Arıların çiçeklerden toplayıp yaptığı tatlı yiyecek" },
                    { word: "MUZ", clue: "Sarı renkli, maymunların çok sevdiği tatlı meyve" },
                    { word: "DUT", clue: "Ağaçta yetişen, tatlı, küçük kırmızı veya beyaz meyve" },
                    { word: "GÜL", clue: "Bahçede yetişen, mis kokulu kırmızı veya pembe çiçek" },
                    { word: "YOL", clue: "Arabaların veya yayaların üzerinde yürüdüğü zemin" },
                    { word: "BOT", clue: "Kışın giydiğimiz su geçirmeyen kalın ayakkabı" }
                ]
            },
            {
                level: 2, name: "Tatlı Bahçe", emoji: "🌸", targetCorrect: 3, scoreBase: 70, color: "#CAFFBF",
                words: [
                    { word: "KEDİ", clue: "Miyav diyen, evde beslediğimiz sevimli tüylü dostumuz" },
                    { word: "ELMA", clue: "Kırmızı veya yeşil renkli, ısırdığımızda çıtırdayan meyve" },
                    { word: "AĞAÇ", clue: "Gövdesi odunsu, dallarında yapraklar olan yeşil bitki" },
                    { word: "KUZU", clue: "Koyunların sevimli, beyaz ve kıvırcık tüylü yavrusu" },
                    { word: "KAPI", clue: "Odalara girmek için açıp kapattığımız tahta veya metal bölme" },
                    { word: "MASA", clue: "Üzerinde yemek yediğimiz veya ders çalıştığımız ayaklı eşya" },
                    { word: "UÇAK", clue: "Gökyüzünde bulutların arasında uçan büyük yolcu taşıtı" },
                    { word: "SARI", clue: "Muzun, limonun ve Güneş'in rengi olan canlı renk" }
                ]
            },
            {
                level: 3, name: "Doğa Gezisi", emoji: "🌲", targetCorrect: 3, scoreBase: 100, color: "#A0C4FF",
                words: [
                    { word: "BULUT", clue: "Mavi gökyüzünde süzülen beyaz pamuksu su buharı" },
                    { word: "BALIK", clue: "Denizlerde, göllerde pullarıyla süzülerek yüzen canlı" },
                    { word: "ÖRDEK", clue: "Suda vak vak diye yüzen, paytak yürüyen sarı gagalı dost" },
                    { word: "KÖPEK", clue: "Hav hav diyerek evimizi bekleyen sadık dostumuz" },
                    { word: "LİMON", clue: "Sarı renkli, salatalara sıktığımız ekşi meyve" },
                    { word: "ÇİÇEK", clue: "Mis kokulu, renkli yaprakları olan bitki süsü" },
                    { word: "SEPET", clue: "İçine meyve veya oyuncak koyduğumuz sevimli örgü kap" },
                    { word: "YONCA", clue: "Uğur getirdiğine inanılan sevimli yeşil yapraklı bitki" }
                ]
            },
            {
                level: 4, name: "Şirin Dere", emoji: "💧", targetCorrect: 3, scoreBase: 120, color: "#A0C4FF",
                words: [
                    { word: "GÜNEŞ", clue: "Gündüzleri dünyamızı aydınlatan ve ısıtan dev yıldız" },
                    { word: "YILDIZ", clue: "Geceleri gökyüzünde ışıl ışıl parıldayan minik noktalar" },
                    { word: "TAVŞAN", clue: "Havuç yiyen, uzun kulaklı ve çok hızlı zıplayan sevimli hayvan" },
                    { word: "KİTAP", clue: "İçinde resimler ve güzel hikayeler olan okuma dostu" },
                    { word: "KALEM", clue: "Defterimize resim çizmek ve yazı yazmak için kullandığımız araç" },
                    { word: "KAŞIK", clue: "Çorbamızı içmek için kullandığımız metal veya tahta mutfak aleti" },
                    { word: "DOLAP", clue: "Elbiselerimizi veya oyuncaklarımızı içine koyduğumuz kapaklı mobilya" },
                    { word: "DEFTER", clue: "Okulda ders notları aldığımız boş çizgili sayfalar bütünü" }
                ]
            },
            {
                level: 5, name: "Gökyüzü", emoji: "🌤️", targetCorrect: 3, scoreBase: 150, color: "#FDFFB6",
                words: [
                    { word: "ARILAR", clue: "Çiçekten çiçeğe uçup kovanlarında bal yapan vızvızlar" },
                    { word: "ROKET", clue: "Uzay boşluğuna fırlatılan, arkasından ateşler çıkaran hızlı taşıt" },
                    { word: "FENER", clue: "Karanlık gecelerde önümüzü aydınlatan el ışığı" },
                    { word: "BAYKUŞ", clue: "Geceleri uyanık duran, kocaman gözleri olan bilge kuş" },
                    { word: "DENİZ", clue: "Ucu bucağı görünmeyen, mavi renkli dev tuzlu su kütlesi" },
                    { word: "MERCAN", clue: "Denizlerin altında yaşayan renkli, sert deniz bitkisi" },
                    { word: "YUNUS", clue: "Denizde taklalar atan, insan dostu akıllı yüzücü canlı" },
                    { word: "AYDEDE", clue: "Geceleri gökyüzünde bize gülümseyen parlak ışık" }
                ]
            },
            {
                level: 6, name: "Gizemli Gece", emoji: "🌙", targetCorrect: 3, scoreBase: 180, color: "#FDFFB6",
                words: [
                    { word: "SİNCAP", clue: "Meşe palamudu yiyen, ağaçlarda hızlıca tırmanan sevimli kemirgen" },
                    { word: "KAPLAN", clue: "Sarı-siyah çizgili tüyleri olan büyük ve güçlü kedi" },
                    { word: "LEOPAR", clue: "Benekli tüyleri olan, ağaç dallarında dinlenen hızlı yırtıcı" },
                    { word: "ZÜRAFA", clue: "Uzun boynu sayesinde yüksek ağaç dallarındaki yaprakları yiyen canlı" },
                    { word: "ORMANLAR", clue: "Binlerce ağacın ve vahşi hayvanın bir arada yaşadığı dev yeşil alan" },
                    { word: "TOPRAK", clue: "Bitkilerin büyümesini sağlayan, üzerinde yürüdüğümüz kahverengi yeryüzü" },
                    { word: "GÖZLÜK", clue: "Daha iyi görebilmek veya Güneş'ten korunmak için gözümüze taktığımız araç" },
                    { word: "AYNA", clue: "Karşısına geçtiğimizde kendimizi gördüğümüz parlak cam" }
                ]
            },
            {
                level: 7, name: "Deniz Altı", emoji: "🐙", targetCorrect: 3, scoreBase: 250, color: "#D8BBFF",
                words: [
                    { word: "YENGEÇ", clue: "Kıskaçları olan ve deniz kıyısında yan yan yürüyen canlı" },
                    { word: "KUMSAL", clue: "Deniz kıyısındaki sıcacık, sarı ve yumuşacık kumlu alan" },
                    { word: "GEZEGEN", clue: "Güneş'in etrafında dönen Dünya gibi yuvarlak gök cisimleri" },
                    { word: "PENGUEN", clue: "Kutuplarda yaşayan, uçamayan ama çok iyi yüzen fraklı kuş" },
                    { word: "PANDALAR", clue: "Bambu yemeyi çok sevdeki, siyah-beyaz renkli sevimli ayılar" },
                    { word: "PAPATYA", clue: "Sarı göbekli, beyaz yapraklı sevimli kırlangıç çiçeği" },
                    { word: "KELEBEK", clue: "Renkli kanatlarıyla çiçeklerin üzerinde dans eden sevimli böcek" },
                    { word: "KANGURU", clue: "Karnındaki kesesinde yavrusunu taşıyarak zıplayan hayvan" }
                ]
            },
            {
                level: 8, name: "Okyanus Kaşifi", emoji: "🐳", targetCorrect: 3, scoreBase: 300, color: "#D8BBFF",
                words: [
                    { word: "PİLOTLAR", clue: "Gökyüzünde uçan uçakları ve helikopterleri güvenle kullanan kişiler" },
                    { word: "DOKTORLAR", clue: "Hastalandığımızda bizi muayene edip iyileştiren beyaz önlüklü kahramanlar" },
                    { word: "İTFAİYE", clue: "Yangın çıktığında kırmızı arabasıyla gelip söndüren cesur ekip" },
                    { word: "PİYANO", clue: "Tuşlarına basarak harika melodiler çaldığımız büyük müzik aleti" },
                    { word: "ÇİKOLATA", clue: "Kakao çekirdeklerinden yapılan, tatlı ve kahverengi sevimli yiyecek" },
                    { word: "IŞINLAR", clue: "Güneş'ten veya el fenerinden çıkan düz çizgi şeklindeki ışıklar" },
                    { word: "ZAMANLAR", clue: "Saatlerin ve günlerin akıp gitmesini belirten kavram" },
                    { word: "OYUNLAR", clue: "Arkadaşlarımızla eğlenmek için oynadığımız kurallı aktiviteler" }
                ]
            },
            {
                level: 9, name: "Uzay Yolu", emoji: "🪐", targetCorrect: 3, scoreBase: 400, color: "#FFADAD",
                words: [
                    { word: "ASTRONOT", clue: "Uzay giysisi giyerek uzayda araştırmalar yapan cesur insan" },
                    { word: "UYDULAR", clue: "Dünya'nın etrafında dönerek televizyon ve internet yayını sağlayan araçlar" },
                    { word: "AHTAPOT", clue: "Denizin derinliklerinde yaşayan sekiz kollu vantuzlu canlı" },
                    { word: "DİNOZOR", clue: "Milyonlarca yıl önce yaşamış dev gövdeli eski çağ canlıları" },
                    { word: "OYUNCAK", clue: "Evde eğlenerek oynadığımız bebek, araba veya lego gibi eşyalar" },
                    { word: "BİLGİSAYAR", clue: "Ödev yaptığımız, oyun oynadığımız ve araştırma yaptığımız ekranlı makine" },
                    { word: "GÖKKUŞAĞI", clue: "Yağmurdan sonra gökyüzünde beliren yedi renkli sihirli köprü" },
                    { word: "KARTOPU", clue: "Kışın kar yağdığında ellerimizle yuvarlayıp fırlattığımız kar yuvarlağı" }
                ]
            },
            {
                level: 10, name: "Zeka Galaksisi", emoji: "🛸", targetCorrect: 3, scoreBase: 600, color: "#FFC6FF",
                words: [
                    { word: "TELESKOP", clue: "Gökyüzündeki çok uzaktaki yıldızları ve gezegenleri görmemizi sağlayan araç" },
                    { word: "KAPLUMBAĞA", clue: "Sırtındaki sert kabuğunu evi gibi taşıyan, yavaş yürüyen canlı" },
                    { word: "KÖPEKBALIĞI", clue: "Denizlerde yaşayan, keskin dişleri olan büyük ve hızlı balık" },
                    { word: "KUYRUKLUYILDIZ", clue: "Uzayda arkasından toz ve gaz saçarak parlayan buz kütlesi" },
                    { word: "KARADELİK", clue: "Uzayda yerçekimi o kadar güçlü olan ve her şeyi içine çeken gizemli yapı" },
                    { word: "HELİKOPTER", clue: "Tepesindeki pervanesi dönerek dikey uçabilen hava taşıtı" },
                    { word: "KÜTÜPHANE", clue: "İçinde binlerce hikaye ve bilgi kitabının bulunduğu sessiz oda" },
                    { word: "BUZDAĞLARI", clue: "Kuzey kutbunda denizin üzerinde yüzen dev buz kütleleri" }
                ]
            }
        ];
        const cfg = LEVELS[levelNumber - 1];

        let correctWordsCount = 0;
        let lives = 3;
        let incorrectGuesses = 0;
        let gameTime = 0;
        
        let currentWordObj = null;
        let spellingProgress = "";
        let usedWordIndices = [];
        const shuffledWordPool = [...cfg.words].sort(() => Math.random() - 0.5).slice(0, cfg.targetCorrect);

        const tabsHTML = LEVELS.map(l => {
            const isUnlocked = isLevelUnlocked(4, l.level);
            return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" ' + (isUnlocked ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"') + '>' + (isUnlocked ? l.emoji + ' ' + l.level : '🔒 ' + l.level) + '</button>';
        }).join('');

        container.innerHTML = `
            <div class="word-game-container" style="user-select:none;">
                <div class="level-tabs">${tabsHTML}</div>
                <div class="word-target-card">
                    <div class="word-clue-bubble" id="word-clue">Yükleniyor...</div>
                    <div class="word-slots" id="word-slots-container"></div>
                </div>
                <div class="game-stats">
                    <div class="stat-item">
                        <i data-lucide="timer" style="width:16px;height:16px;"></i>
                        <span id="game-timer">0</span>sn
                    </div>
                    <div class="stat-item" id="word-lives" style="display:flex; gap:4px;">
                        <!-- Hearts -->
                    </div>
                    <div class="stat-item">
                        <i data-lucide="book-open" style="width:16px;height:16px;"></i>
                        İlerleme: <span id="word-progress-count">0</span>/${cfg.targetCorrect}
                    </div>
                </div>
                <div class="word-letter-field" id="word-letter-field"></div>
                <button class="btn btn-locked" id="btn-give-up" style="width:100%; font-size:0.82rem;">
                    🏳️ Vazgeç & Kapat
                </button>
            </div>
        `;

        lucide.createIcons();
        updateLivesDisplay();

        container.querySelectorAll(".level-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                if (tab.hasAttribute("disabled")) return;
                const next = parseInt(tab.dataset.level);
                if (next === levelNumber) return;
                playSound('click');
                cleanUp();
                startWordGame(container, next);
            });
        });

        container.querySelector("#btn-give-up").addEventListener("click", () => {
            playSound('locked');
            cleanUp();
            closeModal();
        });

        function cleanUp() {
            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
        }

        function updateLivesDisplay() {
            const livesEl = document.getElementById("word-lives");
            if (!livesEl) return;
            livesEl.innerHTML = "";
            for (let i = 0; i < 3; i++) {
                const heart = document.createElement("i");
                heart.style.width = "16px";
                heart.style.height = "16px";
                heart.setAttribute("data-lucide", "heart");
                if (i < lives) {
                    heart.style.fill = "#ef4444";
                    heart.style.color = "#ef4444";
                } else {
                    heart.style.fill = "none";
                    heart.style.color = "var(--text-muted)";
                    heart.style.opacity = "0.3";
                }
                livesEl.appendChild(heart);
            }
            lucide.createIcons();
        }

        function loadNextWord() {
            let chosenIdx = -1;
            for (let i = 0; i < shuffledWordPool.length; i++) {
                if (!usedWordIndices.includes(i)) {
                    chosenIdx = i;
                    break;
                }
            }

            if (chosenIdx === -1) {
                usedWordIndices = [];
                chosenIdx = 0;
            }

            usedWordIndices.push(chosenIdx);
            currentWordObj = shuffledWordPool[chosenIdx];
            spellingProgress = "";

            const cl = document.getElementById("word-clue");
            if (cl) cl.innerText = `💡 İpucu: ${currentWordObj.clue}`;

            const slotsContainer = document.getElementById("word-slots-container");
            if (!slotsContainer) return;
            slotsContainer.innerHTML = "";
            for (let i = 0; i < currentWordObj.word.length; i++) {
                const box = document.createElement("div");
                box.className = "word-slot-box";
                slotsContainer.appendChild(box);
            }

            const originalLetters = currentWordObj.word.split("");
            const alphabet = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";
            const distractorsCount = Math.min(2, Math.max(1, 6 - originalLetters.length));
            for (let i = 0; i < distractorsCount; i++) {
                originalLetters.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
            }

            const shuffledLetters = originalLetters.sort(() => Math.random() - 0.5);

            const playfield = document.getElementById("word-letter-field");
            if (!playfield) return;
            playfield.innerHTML = "";

            const width = playfield.clientWidth || 450;
            const height = playfield.clientHeight || 240;

            shuffledLetters.forEach((letter, index) => {
                const bubble = document.createElement("div");
                bubble.className = "word-letter-bubble";
                bubble.innerText = letter;

                const animDuration = Math.random() * 1.5 + 2.5;
                bubble.style.setProperty("--anim-duration", `${animDuration}s`);

                const colCount = Math.ceil(Math.sqrt(shuffledLetters.length));
                const r = Math.floor(index / colCount);
                const c = index % colCount;

                const left = (c * (width / colCount)) + (Math.random() * 15 + 10);
                const top = (r * (height / colCount)) + (Math.random() * 15 + 10);

                bubble.style.left = `${Math.min(width - 55, Math.max(5, left))}px`;
                bubble.style.top = `${Math.min(height - 55, Math.max(5, top))}px`;

                bubble.addEventListener("click", () => handleLetterClick(letter, bubble));
                playfield.appendChild(bubble);
            });
        }

        function handleLetterClick(letter, bubbleEl) {
            const targetWord = currentWordObj.word;
            const targetLetter = targetWord[spellingProgress.length];

            if (letter === targetLetter) {
                playSound('click');
                spellingProgress += letter;

                bubbleEl.classList.add("correct-pop");
                setTimeout(() => bubbleEl.remove(), 200);

                const slotBoxes = container.querySelectorAll(".word-slot-box");
                const currentSlot = slotBoxes[spellingProgress.length - 1];
                if (currentSlot) {
                    currentSlot.innerText = letter;
                    currentSlot.classList.add("filled");
                }

                if (spellingProgress === targetWord) {
                    playSound('success');
                    correctWordsCount++;
                    const progressEl = document.getElementById("word-progress-count");
                    if (progressEl) progressEl.innerText = correctWordsCount;

                    slotBoxes.forEach(box => {
                        box.style.background = "var(--pastel-green)";
                        box.style.borderColor = "#16a34a";
                    });

                    setTimeout(() => {
                        if (correctWordsCount >= cfg.targetCorrect) {
                            gameWin();
                        } else {
                            loadNextWord();
                        }
                    }, 1400);
                }
            } else {
                lives--;
                updateLivesDisplay();
                playSound('locked');
                incorrectGuesses++;
                bubbleEl.style.animation = "shake-wrong 0.4s ease";
                setTimeout(() => {
                    bubbleEl.style.animation = `float-letter var(--anim-duration) infinite ease-in-out`;
                }, 400);

                if (lives <= 0) {
                    gameOver();
                }
            }
        }

        function gameOver() {
            cleanUp();
            lockGame(4);
            playSound('locked');

            setTimeout(() => {
                container.innerHTML = `
                    <div style="text-align:center; padding:16px 8px;">
                        <div style="font-size:4.5rem; margin-bottom:12px; animation:shake 0.5s ease-in-out;">😢📝💥</div>
                        <h2 style="font-size:1.6rem; margin-bottom:6px; color:#ef4444;">Canların Tükendi!</h2>
                        <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                            Harfleri yanlış sıraladın ve canların bitti. 1 global can kaybettin!
                        </p>
                        <div style="display:flex; gap:10px; justify-content:center;">
                            <button class="btn btn-primary" id="btn-restart" style="flex:1; max-width:160px;">🔄 Tekrar Dene</button>
                            <button class="btn btn-locked" id="btn-close-fail" style="flex:1; max-width:160px;">❌ Kapat</button>
                        </div>
                    </div>
                `;

                container.querySelector("#btn-restart").addEventListener("click", () => {
                    playSound('click');
                    startWordGame(container, levelNumber);
                });
                container.querySelector("#btn-close-fail").addEventListener("click", () => {
                    playSound('click');
                    closeModal();
                });
            }, 600);
        }

        function gameWin() {
            cleanUp();
            unlockNextLevel(4, levelNumber);
            playSound('success');

            const scoreAwarded = cfg.scoreBase + Math.max(0, 300 - gameTime * 4 - incorrectGuesses * 8);
            const starsAwarded = incorrectGuesses === 0 ? 25 : (incorrectGuesses <= 3 ? 15 : 10);

            const ach = window.achievementsData;
            ach.userStats.stars += starsAwarded;
            ach.userStats.totalScore += scoreAwarded;
            ach.userStats.completedGames += 1;

            const task1 = ach.dailyTasks.find(t => t.id === 1);
            if (task1 && !task1.completed) {
                task1.completed = true;
                ach.userStats.stars += task1.reward;
            }

            const done = ach.dailyTasks.filter(t => t.completed).length;
            ach.userStats.progressPercentage = Math.round((done / ach.dailyTasks.length) * 100);
        if (typeof scoreAwarded !== 'undefined' && window.CURRENT_ACTIVE_GAME_ID) {
            if(window.recordGameScore) window.recordGameScore(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
            if(window.achievementsData && window.achievementsData.addScoreToGame) window.achievementsData.addScoreToGame(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
        }
        if(window.achievementsData && window.achievementsData.saveAchievements) window.achievementsData.saveAchievements();

            const badge = ach.badges.find(b => b.id === "bookworm");
            if (badge) {
                badge.unlocked = true;
                badge.tooltip = "Bilge Kitap: Kelime oyununda seviye tamamladın!";
            }

            setTimeout(() => {
                container.innerHTML = `
                    <div style="text-align:center; padding:16px 8px;">
                        <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">📚🏆</div>
                        <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:${cfg.color}; font-weight:700; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">🌟 Harf Avcısı!</div>
                        <h2 style="font-size:1.6rem; margin-bottom:6px;">${cfg.emoji} Seviye ${levelNumber} Tamamlandı!</h2>
                        <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                            Kelimeleri <strong>${gameTime} saniyede</strong> ve <strong>${incorrectGuesses} hata</strong> ile buldun!
                        </p>
                        
                        <div style="display:flex; justify-content:center; gap:14px; margin-bottom:22px;">
                            <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-yellow); border:2px solid #D97706; text-align:center; min-width:90px;">
                                <div style="font-size:1.5rem; font-family:var(--font-heading); color:#D97706;">+${starsAwarded}</div>
                                <div style="font-size:0.7rem; font-weight:700; color:#78350F;">YILDIZ</div>
                            </div>
                            <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-green); border:2px solid #166534; text-align:center; min-width:90px;">
                                <div style="font-size:1.5rem; font-family:var(--font-heading); color:#166534;">+${scoreAwarded}</div>
                                <div style="font-size:0.7rem; font-weight:700; color:#14532D;">PUAN</div>
                            </div>
                        </div>

                        <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                            <button class="btn btn-success" id="btn-replay" style="flex:1; min-width:120px;">🔄 Tekrar Oyna</button>
                            ${levelNumber < 10 ? `<button class="btn btn-primary" id="btn-next-level" style="flex:1; min-width:120px;">➡️ Seviye ${levelNumber + 1}</button>` : ''}
                            <button class="btn btn-locked" id="btn-finish-win" style="flex:1; min-width:120px;">✅ Kaydet & Kapat</button>
                        </div>
                    </div>
                `;

                container.querySelector("#btn-replay").addEventListener("click", () => {
                    playSound('click');
                    startWordGame(container, levelNumber);
                });
                if (levelNumber < 10) {
                    container.querySelector("#btn-next-level").addEventListener("click", () => {
                        playSound('click');
                        startWordGame(container, levelNumber + 1);
                    });
                }
                container.querySelector("#btn-finish-win").addEventListener("click", () => {
                    playSound('click');
                    closeModal();
                    renderAchievements();
                });
            }, 600);
        }

        loadNextWord();

        if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
        activeGameTimer = setInterval(() => {
            gameTime++;
            const el = document.getElementById("game-timer");
            if (el) el.innerText = gameTime;
            else { cleanUp(); }
        }, 1000);
    }
    // ============================================================
    // HIZLI PARMAKLAR (REFLEKS) OYUN MOTORU
    // ============================================================
    function startFastFingersGame(container, levelNumber) {
        if (window.currentGameCleanup) {
            window.currentGameCleanup();
            window.currentGameCleanup = null;
        }
        if (activeGameTimer) {
            clearInterval(activeGameTimer);
        }

        const LEVELS = [
            { level: 1, name: "Başlangıç", emoji: "⭐", targetScore: 10, speed: 1800, scoreBase: 50, color: "#CAFFBF", animals: ["🐼", "🐨", "🐸"] },
            { level: 2, name: "Minik Adımlar", emoji: "🌱", targetScore: 11, speed: 1700, scoreBase: 70, color: "#CAFFBF", animals: ["🐼", "🐨", "🐸", "🐱"] },
            { level: 3, name: "Kolay", emoji: "🌟", targetScore: 12, speed: 1600, scoreBase: 100, color: "#A0C4FF", animals: ["🐼", "🐨", "🐸", "🐱", "🐶"] },
            { level: 4, name: "Dikkatli Parmaklar", emoji: "⚡", targetScore: 13, speed: 1500, scoreBase: 120, color: "#A0C4FF", animals: ["🐼", "🐨", "🐸", "🐱", "🐶"] },
            { level: 5, name: "Orta", emoji: "🏆", targetScore: 15, speed: 1400, scoreBase: 150, color: "#FFD6A5", animals: ["🐼", "🐨", "🐸", "🐱", "🐶", "🦊", "🦁"] },
            { level: 6, name: "Refleks Okulu", emoji: "🎒", targetScore: 16, speed: 1350, scoreBase: 180, color: "#FFD6A5", animals: ["🐼", "🐨", "🐸", "🐱", "🐶", "🦊", "🦁"] },
            { level: 7, name: "Zor", emoji: "🔥", targetScore: 18, speed: 1250, scoreBase: 200, color: "#D8BBFF", animals: ["🐼", "🐨", "🐸", "🐱", "🐶", "🦊", "🦁", "🐰", "🐵"] },
            { level: 8, name: "Şimşek Hızı", emoji: "⚡", targetScore: 19, speed: 1200, scoreBase: 250, color: "#D8BBFF", animals: ["🐼", "🐨", "🐸", "🐱", "🐶", "🦊", "🦁", "🐰", "🐵"] },
            { level: 9, name: "Şampiyon", emoji: "👑", targetScore: 20, speed: 1100, scoreBase: 300, color: "#FFC6FF", animals: ["🐼", "🐨", "🐸", "🐱", "🐶", "🦊", "🦁", "🐰", "🐵", "🐙", "🦄"] },
            { level: 10, name: "Efsanevi Tıklayıcı", emoji: "🔮", targetScore: 25, speed: 1000, scoreBase: 500, color: "#FFC6FF", animals: ["🐼", "🐨", "🐸", "🐱", "🐶", "🦊", "🦁", "🐰", "🐵", "🐙", "🦄","🦋","🦀"] }
        ];

        const cfg = LEVELS[levelNumber - 1];
        let score = 0;
        let lives = 3;
        let gameActive = true;
        let lastHole = -1;
        let popTimeout = null;
        
        // Hayvan isimleri eşleştirmesi
        const animalNames = {
            "🐼": "Panda", "🐨": "Koala", "🐸": "Kurbağa", "🐱": "Kedi", "🐶": "Köpek",
            "🦊": "Tilki", "🦁": "Aslan", "🐰": "Tavşan", "🐵": "Maymun", "🐙": "Ahtapot",
            "🦄": "Tekboynuz", "🦋": "Kelebek", "🦀": "Yengeç"
        };
        
        // Oyun için tek bir hedef hayvan belirliyoruz
        const targetAnimal = cfg.animals[Math.floor(Math.random() * cfg.animals.length)];
        let currentPoppedAnimal = "";

        const tabsHTML = LEVELS.map(l => {
            const isUnlocked = isLevelUnlocked(5, l.level);
            return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" ' + (isUnlocked ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"') + '>' + (isUnlocked ? l.emoji + ' ' + l.level : '🔒 ' + l.level) + '</button>';
        }).join('');

        container.innerHTML = `
            <div class="fast-fingers-game" style="text-align:center; padding:10px 0; user-select:none;">
                <div class="level-tabs">${tabsHTML}</div>
                <div class="game-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; background:rgba(0,0,0,0.03); padding:10px 15px; border-radius:16px;">
                    <div style="font-weight:700; color:var(--text-main); font-size:0.85rem;">
                        Seviye ${cfg.level}: <span style="color:var(--color-primary);">${cfg.name}</span>
                    </div>
                    <div class="game-lives" style="display:flex; gap:4px;">
                        <i class="heart-icon" data-lucide="heart" style="fill:#ef4444; color:#ef4444; width:18px; height:18px;"></i>
                        <i class="heart-icon" data-lucide="heart" style="fill:#ef4444; color:#ef4444; width:18px; height:18px;"></i>
                        <i class="heart-icon" data-lucide="heart" style="fill:#ef4444; color:#ef4444; width:18px; height:18px;"></i>
                    </div>
                    <div style="font-weight:700; color:var(--text-main); font-size:0.85rem;">
                        Hedef: <span id="score-counter" style="color:#D97706;">0</span>/${cfg.targetScore}
                    </div>
                </div>

                <div id="instruction-bar" style="margin-bottom:15px; background:linear-gradient(135deg, #FEF08A, #FDE047); padding:15px; border-radius:12px; border:3px solid #F59E0B; text-align:center; box-shadow: 0 6px 12px -2px rgba(217, 119, 6, 0.4);">
                    <div style="font-weight:800; font-size:1.2rem; color:#B45309; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">SADECE BU HAYVANI YAKALA!</div>
                    <div style="font-weight:900; font-size:3.5rem; color:#991B1B; text-transform:uppercase; letter-spacing:2px; line-height:1; display:flex; align-items:center; justify-content:center; gap:15px; text-shadow: 2px 2px 0px #FEF08A, 4px 4px 0px rgba(180, 83, 9, 0.2);">
                        <span style="font-size:4rem; animation:bounce-loop 1.5s infinite;">${targetAnimal}</span> 
                        <span>${animalNames[targetAnimal]}</span>
                    </div>
                </div>

                <div class="mole-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; max-width:280px; margin:0 auto 15px;">
                    ${[0,1,2,3,4,5,6,7,8].map(i => `
                        <div class="mole-hole" data-id="${i}" style="aspect-ratio:1; background:rgba(0,0,0,0.05); border:2px dashed var(--text-muted); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; position:relative; overflow:visible; transition:all 0.15s ease;">
                            <div class="mole-animal" style="font-size:2.4rem; position:absolute; bottom:-10px; opacity:0; transform:translateY(20px) scale(0.5); transition:all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275); pointer-events:none; user-select:none;"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        lucide.createIcons();

        const holes = container.querySelectorAll(".mole-hole");
        const scoreCounter = container.querySelector("#score-counter");
        const hearts = container.querySelectorAll(".heart-icon");
        const instructionBar = container.querySelector("#instruction-bar");

        container.querySelectorAll(".level-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                if (tab.hasAttribute("disabled")) return;
                const next = parseInt(tab.dataset.level);
                if (next === levelNumber) return;
                playSound('click');
                cleanUp();
                startFastFingersGame(container, next);
            });
        });

        let countInterval = null;
        function cleanUp() {
            gameActive = false;
            if (popTimeout) clearTimeout(popTimeout);
            if (countInterval) clearInterval(countInterval);
        }
        window.currentGameCleanup = cleanUp;

        function updateLivesUI() {
            hearts.forEach((heart, idx) => {
                if (idx < lives) {
                    heart.style.fill = "#ef4444";
                    heart.style.color = "#ef4444";
                    heart.style.opacity = "1";
                } else {
                    heart.style.fill = "none";
                    heart.style.color = "var(--text-muted)";
                    heart.style.opacity = "0.3";
                }
            });
        }

        function randomHole() {
            const idx = Math.floor(Math.random() * holes.length);
            if (idx === lastHole) return randomHole();
            lastHole = idx;
            return holes[idx];
        }

        let currentlyActiveHole = -1;
        let tappedThisTurn = false;

        function popAnimal() {
            if (!gameActive) return;
            
            holes.forEach(h => {
                const animalEl = h.querySelector(".mole-animal");
                if (animalEl) {
                    animalEl.style.opacity = "0";
                    animalEl.style.transform = "translateY(20px) scale(0.5)";
                }
                h.style.background = "rgba(0,0,0,0.05)";
                h.style.borderColor = "var(--text-muted)";
            });

            // Yalnızca çıkan hayvan hedefse ve ona TIKLANMADIYSA can düşeriz.
            if (!tappedThisTurn && currentlyActiveHole !== -1 && currentPoppedAnimal === targetAnimal) {
                lives--;
                updateLivesUI();
                playSound('locked');
                if (lives <= 0) {
                    endGame(false);
                    return;
                }
            }

            tappedThisTurn = false;

            const hole = randomHole();
            currentlyActiveHole = parseInt(hole.dataset.id);

            // %50 ihtimalle hedef hayvanı, %50 ihtimalle rastgele şaşırtmaca hayvanı çıkart.
            if (Math.random() < 0.5) {
                currentPoppedAnimal = targetAnimal;
            } else {
                let distractor = cfg.animals[Math.floor(Math.random() * cfg.animals.length)];
                // Rastgele seçilen şaşırtmacanın aynısı gelirse de sıkıntı yok ama farklı olsa daha iyi olur
                currentPoppedAnimal = distractor;
            }

            const animalEl = hole.querySelector(".mole-animal");
            
            if (animalEl) {
                animalEl.innerText = currentPoppedAnimal;
                animalEl.style.opacity = "1";
                animalEl.style.transform = "translateY(-10px) scale(1)";
            }

            hole.style.background = "rgba(253, 255, 182, 0.3)";
            hole.style.borderColor = "#D97706";

            popTimeout = setTimeout(popAnimal, cfg.speed);
        }

        holes.forEach(hole => {
            hole.addEventListener("click", () => {
                if (!gameActive) return;
                const holeId = parseInt(hole.dataset.id);

                if (holeId === currentlyActiveHole && !tappedThisTurn) {
                    if (currentPoppedAnimal === targetAnimal) {
                        playSound('success');
                        score++;
                        if (scoreCounter) scoreCounter.innerText = score;
                        tappedThisTurn = true;
                        showFloatingText(hole, "+1", "var(--color-primary)");

                        hole.style.background = "rgba(160, 196, 255, 0.4)";
                        const animalEl = hole.querySelector(".mole-animal");
                        if (animalEl) {
                            animalEl.style.transform = "translateY(-15px) scale(1.2)";
                            setTimeout(() => {
                                animalEl.style.opacity = "0";
                                animalEl.style.transform = "translateY(20px) scale(0.5)";
                            }, 150);
                        }

                        if (score >= cfg.targetScore) {
                            endGame(true);
                        }
                    } else {
                        // Yanlış hedefe tıklandı
                        lives--;
                        updateLivesUI();
                        playSound('locked');
                        tappedThisTurn = true;
                        showFloatingText(hole, "❌", "#ef4444");
                        
                        hole.style.animation = "shake 0.3s ease";
                        setTimeout(() => { hole.style.animation = ""; }, 300);

                        if (lives <= 0) {
                            endGame(false);
                        }
                    }
                }
            });
        });

        function showFloatingText(element, text, color) {
            const span = document.createElement("span");
            span.innerText = text;
            span.style.position = "absolute";
            span.style.color = color;
            span.style.fontWeight = "800";
            span.style.fontSize = "1.5rem";
            span.style.top = "-20px";
            span.style.animation = "float-balloon 0.8s ease-out forwards";
            span.style.pointerEvents = "none";
            element.appendChild(span);
            setTimeout(() => span.remove(), 800);
        }

        function endGame(isWin) {
            gameActive = false;
            currentlyActiveHole = -1;
            tappedThisTurn = true;
            cleanUp();

            if (isWin) {
                playSound('success');
                unlockNextLevel(5, levelNumber);
                
                const scoreAwarded = cfg.scoreBase + (lives * 30);
                const starsAwarded = lives === 3 ? 25 : (lives === 2 ? 15 : 10);

                const ach = window.achievementsData;
                ach.userStats.stars += starsAwarded;
                ach.userStats.totalScore += scoreAwarded;
                ach.userStats.completedGames += 1;

                const speedyBadge = ach.badges.find(b => b.id === "speedy");
                if (speedyBadge) {
                    speedyBadge.unlocked = true;
                    speedyBadge.tooltip = "Şimşek Refleks: Hızlı Parmaklar refleks oyununda seviye tamamladın!";
                }

                const task1 = ach.dailyTasks.find(t => t.id === 1);
                if (task1 && !task1.completed) {
                    task1.completed = true;
                    ach.userStats.stars += task1.reward;
                }

                const done = ach.dailyTasks.filter(t => t.completed).length;
                ach.userStats.progressPercentage = Math.round((done / ach.dailyTasks.length) * 100);
        if (typeof scoreAwarded !== 'undefined' && window.CURRENT_ACTIVE_GAME_ID) {
            if(window.recordGameScore) window.recordGameScore(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
            if(window.achievementsData && window.achievementsData.addScoreToGame) window.achievementsData.addScoreToGame(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
        }
        if(window.achievementsData && window.achievementsData.saveAchievements) window.achievementsData.saveAchievements();

                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">⚡🏆</div>
                            <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:${cfg.color}; font-weight:700; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">⚡ Şimşek Hızında!</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px;">Seviye ${levelNumber} Tamamlandı!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Seviyeyi başarıyla bitirdin ve <strong>${lives} canını</strong> korudun!
                            </p>
                            
                            <div style="display:flex; justify-content:center; gap:14px; margin-bottom:22px;">
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-yellow); border:2px solid #D97706; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#D97706;">+${starsAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#78350F;">YILDIZ</div>
                                </div>
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-green); border:2px solid #166534; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#166534;">+${scoreAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#14532D;">PUAN</div>
                                </div>
                            </div>

                            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                                <button class="btn btn-success" id="btn-replay" style="flex:1; min-width:120px;">🔄 Tekrar Oyna</button>
                                ${levelNumber < 10 ? `<button class="btn btn-primary" id="btn-next-level" style="flex:1; min-width:120px;">➡️ Seviye ${levelNumber + 1}</button>` : ''}
                                <button class="btn btn-locked" id="btn-finish-win" style="flex:1; min-width:120px;">✅ Kaydet & Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay").addEventListener("click", () => {
                        playSound('click');
                        startFastFingersGame(container, levelNumber);
                    });
                    if (levelNumber < 10) {
                        container.querySelector("#btn-next-level").addEventListener("click", () => {
                            playSound('click');
                            startFastFingersGame(container, levelNumber + 1);
                        });
                    }
                    container.querySelector("#btn-finish-win").addEventListener("click", () => {
                        playSound('click');
                        closeModal();
                        renderAchievements();
                    });
                }, 600);

            } else {
                lockGame(5);
                playSound('locked');
        setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:shake 0.5s ease-in-out;">😢💥</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px; color:#ef4444;">Oyun Bitti!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Seviyeyi tamamlayamadın. 3 canının hepsi bitti. 1 global can kaybettin!
                            </p>
                            
                            <div style="display:flex; gap:10px; justify-content:center;">
                                <button class="btn btn-primary" id="btn-replay-fail" style="padding:10px 24px;">🔄 Tekrar Dene</button>
                                <button class="btn btn-locked" id="btn-close-fail" style="padding:10px 24px;">❌ Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay-fail").addEventListener("click", () => {
                        playSound('click');
                        startFastFingersGame(container, levelNumber);
                    });
                    container.querySelector("#btn-close-fail").addEventListener("click", () => {
                        playSound('click');
                        closeModal();
                    });
                }, 600);
            }
        }

        let countdown = 3;
        let instructionTitle = null;
        if (instructionBar) {
            instructionTitle = instructionBar.querySelector('div:first-child');
            if (instructionTitle) instructionTitle.innerText = `Oyun başlıyor: ${countdown}`;
        }
        
        countInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                if (instructionTitle) instructionTitle.innerText = `Oyun başlıyor: ${countdown}`;
            } else {
                clearInterval(countInterval);
                if (instructionTitle) instructionTitle.innerText = "Hadi yakala! ⚡";
                popAnimal();
            }
        }, 1000);
    }
    // ============================================================
    // LABİRENT MACERASI — 3D PIXAR BOBBY CARROT STİLİ BULMACA MOTORU
    // ============================================================
    function startMazeGame(container, levelNumber) {
        if (activeGameTimer) {
            clearInterval(activeGameTimer);
            activeGameTimer = null;
        }

        const LEVELS = [
            {
                level: 1,
                name: "Çayır Bahçesi",
                speed: 550,
                scoreBase: 100,
                map: [
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#"],
                    ["#", "P", ".", ".", ".", ".", ".", "E1", "#"],
                    ["#", ".", "#", "#", ".", "#", "#", ".", "#"],
                    ["#", ".", ".", "S", ".", ".", ".", ".", "#"],
                    ["#", ".", "#", "#", ".", "#", "#", ".", "#"],
                    ["#", "E2", ".", ".", ".", ".", ".", ".", "#"],
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#"]
                ]
            },
            {
                level: 2,
                name: "Elma Tarlası",
                speed: 500,
                scoreBase: 140,
                map: [
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#"],
                    ["#", "P", ".", ".", "#", ".", ".", "E1", "#"],
                    ["#", ".", "#", ".", ".", ".", "#", ".", "#"],
                    ["#", ".", "#", ".", "S", ".", "#", ".", "#"],
                    ["#", ".", ".", ".", "#", ".", ".", ".", "#"],
                    ["#", "E2", ".", ".", "#", ".", ".", ".", "#"],
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#"]
                ]
            },
            {
                level: 3,
                name: "Sihirli Bostan",
                speed: 460,
                scoreBase: 180,
                map: [
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#"],
                    ["#", "P", ".", ".", ".", ".", ".", "E1", "#"],
                    ["#", "#", ".", "#", "#", "#", ".", "#", "#"],
                    ["#", "S", ".", ".", "E2", ".", ".", "S", "#"],
                    ["#", "#", ".", "#", "#", "#", ".", "#", "#"],
                    ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#"]
                ]
            },
            {
                level: 4,
                name: "Gizemli Dolambaç",
                speed: 420,
                scoreBase: 220,
                map: [
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
                    ["#", "P", ".", ".", ".", "#", ".", ".", "E1", "#"],
                    ["#", ".", "#", "#", ".", ".", ".", "#", ".", "#"],
                    ["#", ".", ".", "S", ".", "#", ".", ".", ".", "#"],
                    ["#", ".", "#", ".", ".", ".", "#", "#", ".", "#"],
                    ["#", "E2", ".", ".", "#", ".", ".", "S", ".", "#"],
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]
                ]
            },
            {
                level: 5,
                name: "Köstebek Tüneli",
                speed: 390,
                scoreBase: 260,
                map: [
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
                    ["#", "P", ".", ".", ".", ".", ".", ".", "E1", "#"],
                    ["#", ".", "#", "#", ".", "#", "#", ".", ".", "#"],
                    ["#", ".", ".", "S", ".", ".", "S", ".", ".", "#"],
                    ["#", ".", ".", "#", "#", ".", "#", "#", ".", "#"],
                    ["#", "E2", ".", ".", ".", ".", ".", ".", "E3", "#"],
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]
                ]
            },
            {
                level: 6,
                name: "Gölge Bahçesi",
                speed: 360,
                scoreBase: 300,
                map: [
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
                    ["#", "P", ".", ".", "#", ".", ".", ".", "E1", "#"],
                    ["#", ".", "#", ".", "#", ".", "#", "#", ".", "#"],
                    ["#", ".", ".", ".", "S", ".", ".", ".", ".", "#"],
                    ["#", ".", "#", "#", ".", "#", ".", "#", ".", "#"],
                    ["#", "E2", ".", ".", ".", "#", ".", ".", "E3", "#"],
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]
                ]
            },
            {
                level: 7,
                name: "Hızlı Tilkiler",
                speed: 330,
                scoreBase: 350,
                map: [
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
                    ["#", "P", ".", "S", ".", ".", "S", ".", "E1", "#"],
                    ["#", "#", ".", "#", "#", "#", "#", ".", "#", "#"],
                    ["#", ".", ".", ".", ".", ".", ".", ".", ".", "#"],
                    ["#", "#", ".", "#", "#", "#", "#", ".", "#", "#"],
                    ["#", "E2", ".", ".", ".", ".", ".", ".", "E3", "#"],
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]
                ]
            },
            {
                level: 8,
                name: "Büyük Av",
                speed: 300,
                scoreBase: 400,
                map: [
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
                    ["#", "P", ".", ".", ".", ".", ".", ".", "E1", "#"],
                    ["#", ".", "#", "#", ".", "#", "#", ".", ".", "#"],
                    ["#", ".", "S", ".", ".", ".", ".", "S", ".", "#"],
                    ["#", ".", ".", "#", "#", ".", "#", "#", ".", "#"],
                    ["#", "E2", ".", ".", ".", ".", ".", ".", "E3", "#"],
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]
                ]
            },
            {
                level: 9,
                name: "Altın Bostan",
                speed: 280,
                scoreBase: 450,
                map: [
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
                    ["#", "P", ".", "S", ".", ".", "S", ".", "E1", "#"],
                    ["#", ".", "#", "#", ".", "#", "#", ".", ".", "#"],
                    ["#", ".", ".", ".", "E2", ".", ".", ".", ".", "#"],
                    ["#", ".", ".", "#", "#", ".", "#", "#", ".", "#"],
                    ["#", "E3", ".", ".", "S", ".", ".", ".", "E4", "#"],
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]
                ]
            },
            {
                level: 10,
                name: "Havuç Avcısı Şampiyonu",
                speed: 250,
                scoreBase: 500,
                map: [
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
                    ["#", "P", ".", ".", "S", ".", ".", ".", "E1", "#"],
                    ["#", ".", "#", "#", ".", "#", "#", ".", ".", "#"],
                    ["#", ".", "S", ".", "E2", ".", ".", "S", ".", "#"],
                    ["#", ".", ".", "#", "#", ".", "#", "#", ".", "#"],
                    ["#", "E3", ".", ".", ".", ".", ".", ".", "E4", "#"],
                    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]
                ]
            }
        ];

        const cfg = LEVELS[levelNumber - 1] || LEVELS[LEVELS.length - 1];

        const tabsHTML = LEVELS.map(l => {
            const isUnlocked = isLevelUnlocked(6, l.level);
            return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" style="padding: 5px 10px; font-size: 0.75rem; border-radius:12px; font-weight:700; border:none; background:' + (l.level === levelNumber ? 'var(--color-primary)' : 'rgba(0,0,0,0.06)') + '; color:' + (l.level === levelNumber ? '#fff' : 'inherit') + '; cursor:pointer; ' + (isUnlocked ? '' : 'opacity:0.5; cursor:not-allowed;') + '" ' + (isUnlocked ? '' : 'disabled') + '>' + (isUnlocked ? 'Svy ' + l.level : '🔒') + '</button>';
        }).join('');

        let mapGrid = cfg.map.map(row => [...row]);
        const rows = mapGrid.length;
        const cols = mapGrid[0].length;

        let startR = 0, startC = 0;
        let pR = 0, pC = 0;
        let lives = 3;
        let score = 0;
        let totalCarrots = 0;
        let eatenCarrots = 0;
        let timeElapsed = 0;
        let powerTimer = 0;
        let gameActive = true;
        let enemyTimer = null;

        // Düşman Nesneleri (Tilkiler, Köstebekler)
        let enemies = [];

        const ENEMY_EMOJIS = ["🦊", "🦡", "🐻", "🐺"];

        // Haritayı Tara ve Nesneleri Kur
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = mapGrid[r][c];
                if (cell === "P") {
                    startR = r;
                    startC = c;
                    pR = r;
                    pC = c;
                    mapGrid[r][c] = " ";
                } else if (cell === "." || cell === "S") {
                    totalCarrots++;
                } else if (cell.startsWith("E")) {
                    const idx = enemies.length;
                    const emoji = ENEMY_EMOJIS[idx % ENEMY_EMOJIS.length];
                    enemies.push({
                        id: cell,
                        emoji: emoji,
                        startR: r,
                        startC: c,
                        r: r,
                        c: c
                    });
                    mapGrid[r][c] = "."; // Düşmanın altında havuç olsun
                    totalCarrots++;
                }
            }
        }

        function renderHeartsHTML() {
            let h = "";
            for (let i = 0; i < 3; i++) {
                h += i < lives ? "❤️" : "🖤";
            }
            return h;
        }

        container.innerHTML = `
            <div class="bobby-maze-container" style="text-align:center; padding:4px 0; user-select:none; font-family:var(--font-main);">
                <div class="level-tabs" style="display:flex; gap:6px; overflow-x:auto; margin-bottom:8px; padding-bottom:4px; justify-content:start;">
                    ${tabsHTML}
                </div>

                <div class="maze-hud" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; background:rgba(248,250,252,0.92); padding:8px 14px; border-radius:14px; border:1px solid #cbd5e1; box-shadow:0 4px 12px rgba(0,0,0,0.04);">
                    <div style="text-align:left;">
                        <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Bölüm ${cfg.level}</span>
                        <div style="font-weight:800; font-size:1.02rem; color:var(--text-main);">${cfg.name}</div>
                    </div>

                    <div style="display:flex; align-items:center; gap:8px;">
                        <!-- Güç Modu Durumu -->
                        <div id="power-hud" style="display:${powerTimer > 0 ? 'flex' : 'none'}; align-items:center; gap:4px; font-weight:800; background:#fef08a; padding:5px 9px; border-radius:12px; border:1px solid #fde047; font-size:0.8rem; color:#854d0e;">
                            ⚡ <span id="power-timer">${powerTimer}s</span>
                        </div>

                        <!-- Havuç Sayacı -->
                        <div style="display:flex; align-items:center; gap:4px; font-weight:800; color:#d97706; background:#fef3c7; padding:5px 9px; border-radius:12px; border:1px solid #fde68a; font-size:0.85rem;">
                            <span>🥕</span> <span id="muncher-carrots">0</span>/${totalCarrots}
                        </div>

                        <!-- Canlar -->
                        <div style="display:flex; align-items:center; gap:3px; font-weight:800; background:#fee2e2; padding:5px 9px; border-radius:12px; border:1px solid #fca5a5; font-size:0.85rem;">
                            <span id="bobby-lives">${renderHeartsHTML()}</span>
                        </div>
                    </div>
                </div>

                <div id="bobby-board" style="display:grid; grid-template-columns:repeat(${cols}, 1fr); gap:3px; max-width:360px; margin:0 auto 10px; background:#cbd5e1; padding:8px; border-radius:18px; border:3px solid #94a3b8; box-shadow:0 8px 24px rgba(0,0,0,0.08); transition: background 0.2s;">
                </div>

                <div class="dpad-wrapper" style="display:flex; justify-content:center; align-items:center; gap:16px; margin-top:4px;">
                    <button id="btn-reset-level" style="background:#f1f5f9; color:#475569; border:2px solid #cbd5e1; padding:8px 12px; border-radius:12px; font-weight:700; cursor:pointer; font-size:0.82rem; display:flex; align-items:center; gap:4px;">
                        🔄 Yeniden Başlat
                    </button>

                    <div class="dpad-grid" style="display:inline-grid; grid-template-columns: repeat(3, 44px); grid-template-rows: repeat(3, 44px); gap:6px;">
                        <div></div>
                        <button class="btn-dpad" id="btn-up" style="background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; border:none; border-radius:12px; font-size:1.2rem; cursor:pointer; box-shadow:0 4px 10px rgba(79,70,229,0.3);">⬆️</button>
                        <div></div>
                        <button class="btn-dpad" id="btn-left" style="background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; border:none; border-radius:12px; font-size:1.2rem; cursor:pointer; box-shadow:0 4px 10px rgba(79,70,229,0.3);">⬅️</button>
                        <div></div>
                        <button class="btn-dpad" id="btn-right" style="background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; border:none; border-radius:12px; font-size:1.2rem; cursor:pointer; box-shadow:0 4px 10px rgba(79,70,229,0.3);">➡️</button>
                        <div></div>
                        <button class="btn-dpad" id="btn-down" style="background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; border:none; border-radius:12px; font-size:1.2rem; cursor:pointer; box-shadow:0 4px 10px rgba(79,70,229,0.3);">⬇️</button>
                        <div></div>
                    </div>
                </div>
            </div>`;

        lucide.createIcons();

        function cleanupEvents() {
            gameActive = false;
            window.removeEventListener("keydown", handleKeyDown);
            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
            if (enemyTimer) { clearInterval(enemyTimer); enemyTimer = null; }
        }

        container.querySelectorAll(".level-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                if (tab.hasAttribute("disabled")) return;
                const next = parseInt(tab.dataset.level);
                if (next === levelNumber) return;
                playSound('click');
                cleanupEvents();
                startMazeGame(container, next);
            });
        });

        const btnReset = container.querySelector("#btn-reset-level");
        if (btnReset) {
            btnReset.addEventListener("click", () => {
                playSound('click');
                cleanupEvents();
                startMazeGame(container, levelNumber);
            });
        }

        const boardEl = container.querySelector("#bobby-board");

        function renderBoard() {
            if (!boardEl) return;
            let html = "";

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const tile = mapGrid[r][c];
                    const isPlayer = (r === pR && c === pC);
                    const enemyHere = enemies.find(e => e.r === r && e.c === c);

                    let bg = "#ffffff";
                    let border = "1px solid #e2e8f0";
                    let content = "";

                    if (tile === "#") {
                        bg = "#475569";
                        border = "1px solid #334155";
                    } else if (tile === ".") {
                        content = "<span style='font-size:0.85rem; opacity:0.9;'>🥕</span>";
                    } else if (tile === "S") {
                        bg = "#fef08a";
                        border = "1px solid #fde047";
                        content = "<span style='font-size:1.15rem; animation:pulse 0.8s infinite;'>🌟</span>";
                    }

                    if (enemyHere && !isPlayer) {
                        content = powerTimer > 0 ? "😱" : enemyHere.emoji;
                        bg = powerTimer > 0 ? "#bfdbfe" : "#fee2e2";
                    }

                    if (isPlayer) {
                        bg = powerTimer > 0 ? "#fef08a" : "#e0e7ff";
                        content = `<img src="assets/images/pixar_heads/rabbit.jpg" style="width:88%; height:88%; border-radius:50%; object-fit:cover; filter:drop-shadow(0 3px 6px rgba(0,0,0,0.25)); transform:scale(1.05); z-index:2;" />`;
                    }

                    html += `<div class="maze-cell" data-r="${r}" data-c="${c}" style="aspect-ratio:1; display:flex; align-items:center; justify-content:center; background:${bg}; border:${border}; border-radius:6px; font-size:${cols > 8 ? '0.9rem' : '1.15rem'}; box-shadow:inset 0 1px 3px rgba(255,255,255,0.8); cursor:pointer; position:relative;">${content}</div>`;
                }
            }
            boardEl.innerHTML = html;

            boardEl.querySelectorAll(".maze-cell").forEach(cell => {
                cell.addEventListener("click", () => {
                    const cR = parseInt(cell.dataset.r);
                    const cC = parseInt(cell.dataset.c);
                    const dR = cR - pR;
                    const dC = cC - pC;

                    if (Math.abs(dR) + Math.abs(dC) === 1) {
                        tryStep(dR, dC);
                    } else if (Math.abs(dR) > 0 && dC === 0) {
                        tryStep(Math.sign(dR), 0);
                    } else if (Math.abs(dC) > 0 && dR === 0) {
                        tryStep(0, Math.sign(dC));
                    }
                });
            });
        }

        renderBoard();

        // 1 Saniyelik Oyun Zamanlayıcısı (Süre ve Güç Modu Geri Sayımı)
        activeGameTimer = setInterval(() => {
            if (!gameActive) return;
            timeElapsed++;
            const tEl = container.querySelector("#bobby-timer");
            if (tEl) tEl.innerText = timeElapsed;

            if (powerTimer > 0) {
                powerTimer--;
                const pEl = container.querySelector("#power-timer");
                const pHud = container.querySelector("#power-hud");
                if (pEl) pEl.innerText = powerTimer + "s";
                if (powerTimer <= 0 && pHud) {
                    pHud.style.display = "none";
                }
                renderBoard();
            }
        }, 1000);

        // Düşman Yapay Zeka Hareketi (Pac-Man Düşman Motoru)
        enemyTimer = setInterval(() => {
            if (!gameActive) return;

            enemies.forEach(enemy => {
                const possibleMoves = [];
                const dirs = [[-1,0], [1,0], [0,-1], [0,1]];

                dirs.forEach(([dr, dc]) => {
                    const nR = enemy.r + dr;
                    const nC = enemy.c + dc;
                    if (nR >= 0 && nR < rows && nC >= 0 && nC < cols) {
                        if (mapGrid[nR][nC] !== "#") {
                            possibleMoves.push({ r: nR, c: nC });
                        }
                    }
                });

                if (possibleMoves.length > 0) {
                    // Rastgele veya Tavşana doğru adım at
                    const choice = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                    enemy.r = choice.r;
                    enemy.c = choice.c;
                }

                // Çarpışma Kontrolü
                checkCollision(enemy);
            });

            renderBoard();
        }, cfg.speed);

        // Çarpışma Kontrolü (Düşmana Dokunma)
        function checkCollision(enemy) {
            if (enemy.r === pR && enemy.c === pC) {
                if (powerTimer > 0) {
                    // Güç Modu: Düşman Yenir!
                    score += 100;
                    playSound('pop');
                    enemy.r = enemy.startR;
                    enemy.c = enemy.startC;
                } else {
                    // Normal Mod: Can Kaybı!
                    lives--;
                    playSound('locked');

                    const lEl = container.querySelector("#bobby-lives");
                    if (lEl) lEl.innerHTML = renderHeartsHTML();

                    if (boardEl) {
                        boardEl.style.background = "#fca5a5";
                        setTimeout(() => { if (boardEl) boardEl.style.background = "#cbd5e1"; }, 300);
                    }

                    if (lives <= 0) {
                        triggerGameOver();
                        return;
                    }

                    // Tavşan başlangıç noktasına döner
                    pR = startR;
                    pC = startC;
                }
            }
        }

        function tryStep(dr, dc) {
            if (!gameActive) return false;

            const nR = pR + dr;
            const nC = pC + dc;

            if (nR < 0 || nR >= rows || nC < 0 || nC >= cols) return false;

            const targetTile = mapGrid[nR][nC];

            if (targetTile === "#") {
                playSound('locked');
                return false;
            }

            pR = nR;
            pC = nC;
            playSound('click');

            // Havuç Yeme 🥕
            if (targetTile === ".") {
                mapGrid[pR][pC] = " ";
                eatenCarrots++;
                score += 10;
                playSound('pop');

                const cEl = container.querySelector("#muncher-carrots");
                if (cEl) cEl.innerText = eatenCarrots;
            }
            // Süper Havuç Yeme 🌟 (Güç Modu)
            else if (targetTile === "S") {
                mapGrid[pR][pC] = " ";
                eatenCarrots++;
                score += 50;
                powerTimer = 7;
                playSound('success');

                const cEl = container.querySelector("#muncher-carrots");
                if (cEl) cEl.innerText = eatenCarrots;

                const pHud = container.querySelector("#power-hud");
                const pEl = container.querySelector("#power-timer");
                if (pHud) pHud.style.display = "flex";
                if (pEl) pEl.innerText = "7s";
            }

            // Tavşanın gittiği hücrede düşman var mı kontrol et
            enemies.forEach(enemy => checkCollision(enemy));

            renderBoard();

            // Tüm Havuçlar Yenince Bölüm Geçilir! 🏆
            if (eatenCarrots >= totalCarrots) {
                triggerVictory();
                return true;
            }

            return true;
        }

        function triggerGameOver() {
            cleanupEvents();
            playSound('fail');

            container.innerHTML = `
                <div style="text-align:center; padding:24px 12px; font-family:var(--font-main);">
                    <div style="font-size:4.5rem; margin-bottom:12px; animation: pulse 1s infinite;">💔🦊</div>
                    <h2 style="font-size:1.8rem; color:#ef4444; font-weight:800; margin-bottom:8px;">Canın Bitti!</h2>
                    <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:20px;">
                        Tarladaki hayvanlara yakalandın. Pes etme, tekrar dene!
                    </p>

                    <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
                        <button class="btn btn-primary" id="btn-maze-retry" style="padding:12px 24px; font-weight:800; font-size:1rem; border-radius:14px; background:linear-gradient(135deg, #ef4444, #dc2626); color:#fff; border:none; cursor:pointer; box-shadow:0 4px 12px rgba(239,68,68,0.3);">
                            🔄 Tekrar Dene
                        </button>
                        <button class="btn btn-locked" id="btn-maze-close" style="padding:12px 20px; font-weight:700; border-radius:14px; background:#cbd5e1; color:#475569; border:none; cursor:pointer;">
                            ❌ Çıkış
                        </button>
                    </div>
                </div>`;

            const btnRetry = container.querySelector("#btn-maze-retry");
            if (btnRetry) {
                btnRetry.addEventListener("click", () => {
                    playSound('click');
                    startMazeGame(container, levelNumber);
                });
            }

            const btnClose = container.querySelector("#btn-maze-close");
            if (btnClose) {
                btnClose.addEventListener("click", () => {
                    playSound('click');
                    closeModal();
                });
            }
        }

        function triggerVictory() {
            cleanupEvents();
            playSound('win');
            unlockNextLevel(6, levelNumber);

            const finalScore = cfg.scoreBase + score + lives * 50;
            const hasNext = levelNumber < 10;

            container.innerHTML = `
                <div style="text-align:center; padding:20px 10px; font-family:var(--font-main);">
                    <div style="font-size:4.2rem; margin-bottom:12px; animation: bounce-loop 1.5s infinite;">🎉🥕🏆</div>
                    <h2 style="font-size:1.7rem; color:var(--color-primary); margin-bottom:6px; font-weight:800;">Harika! Tüm Havuçları Topladın!</h2>
                    <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                        <strong>${cfg.name}</strong> tarlasındaki tüm havuçları başarıyla yedin!
                    </p>
                    
                    <div style="display:flex; justify-content:center; gap:16px; margin-bottom:22px; background:rgba(248,250,252,0.95); padding:14px 20px; border-radius:18px; border:1px solid #cbd5e1; box-shadow:0 6px 16px rgba(0,0,0,0.04);">
                        <div><div style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">Süre</div><div style="font-weight:800; font-size:1.25rem; color:#6366f1;">${timeElapsed}s</div></div>
                        <div><div style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">Toplanan Havuç</div><div style="font-weight:800; font-size:1.25rem; color:#d97706;">${eatenCarrots}/${totalCarrots}</div></div>
                        <div><div style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">Toplam Puan</div><div style="font-weight:800; font-size:1.25rem; color:#166534;">+${finalScore}</div></div>
                    </div>

                    <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
                        ${hasNext ? `<button class="btn btn-primary" id="btn-maze-next-level" style="padding:12px 24px; font-weight:800; font-size:1rem; border-radius:14px; background:linear-gradient(135deg, #10b981, #059669); color:#fff; border:none; box-shadow:0 4px 12px rgba(16,185,129,0.3); cursor:pointer;">Sonraki Seviye (Svy ${levelNumber + 1}) ➔</button>` : ''}
                        <button class="btn btn-success" id="btn-maze-replay" style="padding:12px 20px; font-weight:700; border-radius:14px; background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; cursor:pointer;">🔄 Tekrar Oyna</button>
                        <button class="btn btn-locked" id="btn-maze-close" style="padding:12px 20px; font-weight:700; border-radius:14px; background:#f87171; color:#fff; border:none; cursor:pointer;">❌ Kapat</button>
                    </div>
                </div>`;

            if (hasNext) {
                const btnNext = container.querySelector("#btn-maze-next-level");
                if (btnNext) {
                    btnNext.addEventListener("click", () => {
                        playSound('click');
                        startMazeGame(container, levelNumber + 1);
                    });
                }
            }

            const btnReplay = container.querySelector("#btn-maze-replay");
            if (btnReplay) {
                btnReplay.addEventListener("click", () => {
                    playSound('click');
                    startMazeGame(container, levelNumber);
                });
            }

            const btnClose = container.querySelector("#btn-maze-close");
            if (btnClose) {
                btnClose.addEventListener("click", () => {
                    playSound('click');
                    closeModal();
                });
            }
        }

        const btnUp = container.querySelector("#btn-up");
        const btnDown = container.querySelector("#btn-down");
        const btnLeft = container.querySelector("#btn-left");
        const btnRight = container.querySelector("#btn-right");

        if (btnUp) btnUp.addEventListener("click", () => tryStep(-1, 0));
        if (btnDown) btnDown.addEventListener("click", () => tryStep(1, 0));
        if (btnLeft) btnLeft.addEventListener("click", () => tryStep(0, -1));
        if (btnRight) btnRight.addEventListener("click", () => tryStep(0, 1));

        function handleKeyDown(e) {
            if (!gameActive) return;
            if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { e.preventDefault(); tryStep(-1, 0); }
            else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { e.preventDefault(); tryStep(1, 0); }
            else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { e.preventDefault(); tryStep(0, -1); }
            else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { e.preventDefault(); tryStep(0, 1); }
        }

        window.addEventListener("keydown", handleKeyDown);
    }
    // ============================================================
    // GÖLGE EŞLEME (GÖRSEL ALGI) OYUN MOTORU
    // ============================================================
    function startShadowGame(container, levelNumber) {
        const LEVELS = [
            { level: 1, name: "Başlangıç", emoji: "⭐", targetScore: 3, timeLimit: 25, color: "#CAFFBF", pool: ["🐱","🐶","🦁","🐸","🐵","🐰","🦊"] },
            { level: 2, name: "Minik Gölgeler", emoji: "🌱", targetScore: 3, timeLimit: 22, color: "#CAFFBF", pool: ["🐱","🐶","🦁","🐸","🐵","🐰","🦊"] },
            { level: 3, name: "Kolay Gölgeler", emoji: "🌟", targetScore: 4, timeLimit: 20, color: "#A0C4FF", pool: ["🐱","🐶","🦁","🐸","🐵","🐰","🦊","🐼","🦁","🐻"] },
            { level: 4, name: "Doğa Yolu", emoji: "🌳", targetScore: 4, timeLimit: 18, color: "#A0C4FF", pool: ["🐱","🐶","🦁","🐸","🐵","🐰","🦊","🐼","🦁","🐻"] },
            { level: 5, name: "Dikkatli Gözler", emoji: "🏆", targetScore: 5, timeLimit: 15, color: "#FFD6A5", pool: ["🐱","🐶","🦁","🐸","🐵","🐰","🦊","🐼","🦁","🐻","🐙","🐬"] },
            { level: 6, name: "Gölge Avcısı", emoji: "🕵️", targetScore: 5, timeLimit: 14, color: "#FFD6A5", pool: ["🐱","🐶","🦁","🐸","🐵","🐰","🦊","🐼","🦁","🐻","🐙","🐬"] },
            { level: 7, name: "Zor Eşleme", emoji: "🔥", targetScore: 6, timeLimit: 12, color: "#D8BBFF", pool: ["🐱","🐶","🦁","🐸","🐵","🐰","🦊","🐼","🦁","🐻","🐙","🐬","🦈","🦖"] },
            { level: 8, name: "Gölge Dedektifi", emoji: "🔍", targetScore: 6, timeLimit: 10, color: "#D8BBFF", pool: ["🐱","🐶","🦁","🐸","🐵","🐰","🦊","🐼","🦁","🐻","🐙","🐬","🦈","🦖"] },
            { level: 9, name: "Efsane", emoji: "👑", targetScore: 8, timeLimit: 8, color: "#FFADAD", pool: ["🐱","🐶","🦁","🐸","🐵","🐰","🦊","🐼","🦁","🐻","🐙","🐬","🦈","🦖","🦄","🦅"] },
            { level: 10, name: "Gölge Kralı", emoji: "🔮", targetScore: 10, timeLimit: 6, color: "#FFC6FF", pool: ["🐱","🐶","🦁","🐸","🐵","🐰","🦊","🐼","🦁","🐻","🐙","🐬","🦈","🦖","🦄","🦅","🤖","👽"] }
        ];

        const cfg = LEVELS[levelNumber - 1];

        let score = 0;
        let lives = 3;
        let incorrectCount = 0;
        let gameTime = 0;
        let currentTarget = "";
        let choices = [];

        const tabsHTML = LEVELS.map(l => {
            const isUnlocked = isLevelUnlocked(7, l.level);
            return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" ' + (isUnlocked ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"') + '>' + (isUnlocked ? l.emoji + ' ' + l.level : '🔒 ' + l.level) + '</button>';
        }).join('');

        container.innerHTML = `
            <div class="shadow-game-container" style="user-select:none;">
                <div class="level-tabs">${tabsHTML}</div>
                <div class="shadow-playfield" id="shadow-playfield"></div>
                <div class="game-stats">
                    <div class="stat-item">
                        <i data-lucide="timer" style="width:16px;height:16px;"></i>
                        <span id="game-timer">0</span>sn
                    </div>
                    <div class="stat-item" id="shadow-lives" style="display:flex; gap:4px;">
                        <!-- Hearts -->
                    </div>
                    <div class="stat-item">
                        <i data-lucide="check-circle" style="width:16px;height:16px;"></i>
                        Puan: <span id="shadow-score">0</span>/${cfg.targetScore}
                    </div>
                </div>
                <div class="shadow-choices-container" id="shadow-choices-container"></div>
                <button class="btn btn-locked" id="btn-give-up" style="width:100%; font-size:0.82rem; margin-top:10px;">
                    🏳️ Vazgeç & Kapat
                </button>
            </div>
        `;

        lucide.createIcons();
        updateLivesDisplay();

        container.querySelectorAll(".level-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                if (tab.hasAttribute("disabled")) return;
                const next = parseInt(tab.dataset.level);
                if (next === levelNumber) return;
                playSound('click');
                cleanUp();
                startShadowGame(container, next);
            });
        });

        container.querySelector("#btn-give-up").addEventListener("click", () => {
            playSound('locked');
            cleanUp();
            closeModal();
        });

        function cleanUp() {
            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
        }

        function updateLivesDisplay() {
            const livesEl = document.getElementById("shadow-lives");
            if (!livesEl) return;
            livesEl.innerHTML = "";
            for (let i = 0; i < 3; i++) {
                const heart = document.createElement("i");
                heart.style.width = "16px";
                heart.style.height = "16px";
                heart.setAttribute("data-lucide", "heart");
                if (i < lives) {
                    heart.style.fill = "#ef4444";
                    heart.style.color = "#ef4444";
                } else {
                    heart.style.fill = "none";
                    heart.style.color = "var(--text-muted)";
                    heart.style.opacity = "0.3";
                }
                livesEl.appendChild(heart);
            }
            lucide.createIcons();
        }

        function generateRound() {
            const pool = [...cfg.pool];
            const shuffled = pool.sort(() => Math.random() - 0.5);
            currentTarget = shuffled[0];

            const optionSet = new Set([currentTarget]);
            while (optionSet.size < 4) {
                optionSet.add(pool[Math.floor(Math.random() * pool.length)]);
            }
            choices = Array.from(optionSet).sort(() => Math.random() - 0.5);

            renderRound();
        }

        function renderRound() {
            const playfield = document.getElementById("shadow-playfield");
            const choicesContainer = document.getElementById("shadow-choices-container");
            if (!playfield || !choicesContainer) return;

            playfield.innerHTML = `
                <div class="shadow-card" style="position:relative; width: 140px; height: 140px; margin: 0 auto; display:flex; align-items:center; justify-content:center;">
                    <div class="shadow-icon" style="font-size: 5rem; filter: brightness(0); transition: all 0.3s ease;">
                        ${currentTarget}
                    </div>
                </div>
            `;

            choicesContainer.innerHTML = `
                <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; max-width:280px; margin:0 auto;">
                    ${choices.map(emoji => `
                        <button class="choice-btn" data-emoji="${emoji}" style="padding:15px; font-size:2rem; border-radius:18px; border:2.5px solid var(--border-color); background:var(--bg-card); cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-small); transition:all 0.15s ease;">
                            ${emoji}
                        </button>
                    `).join('')}
                </div>
            `;

            container.querySelectorAll(".choice-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const chosen = btn.getAttribute("data-emoji");
                    handleSelection(chosen, btn);
                });
                btn.addEventListener("mouseenter", () => {
                    btn.style.transform = "scale(1.08)";
                });
                btn.addEventListener("mouseleave", () => {
                    btn.style.transform = "scale(1)";
                });
            });
        }

        function handleSelection(chosen, btn) {
            if (chosen === currentTarget) {
                score++;
                playSound('success');
                btn.style.background = "var(--pastel-green)";
                btn.style.borderColor = "#166534";
                
                const scoreEl = document.getElementById("shadow-score");
                if (scoreEl) scoreEl.innerText = score;

                const shadowIcon = container.querySelector(".shadow-icon");
                if (shadowIcon) {
                    shadowIcon.style.filter = "none";
                    shadowIcon.style.transform = "scale(1.2) rotate(360deg)";
                    shadowIcon.style.transition = "all 0.5s ease";
                }

                setTimeout(() => {
                    if (score >= cfg.targetScore) {
                        endGame(true);
                    } else {
                        generateRound();
                    }
                }, 750);

            } else {
                lives--;
                updateLivesDisplay();
                incorrectCount++;
                playSound('locked');
                btn.style.background = "var(--pastel-red)";
                btn.style.borderColor = "#ef4444";
                btn.style.animation = "shake 0.3s ease";
                setTimeout(() => { btn.style.animation = ""; }, 300);

                setTimeout(() => {
                    if (lives <= 0) {
                        endGame(false);
                    }
                }, 400);
            }
        }

        function endGame(isWin) {
            cleanUp();

            if (isWin) {
                unlockNextLevel(7, levelNumber);
                playSound('success');

                const scoreBase = 50 * levelNumber;
                const scoreAwarded = scoreBase + Math.max(0, 150 - gameTime * 3);
                const starsAwarded = incorrectCount === 0 ? 25 : (incorrectCount <= 2 ? 15 : 10);

                const ach = window.achievementsData;
                ach.userStats.stars += starsAwarded;
                ach.userStats.totalScore += scoreAwarded;
                ach.userStats.completedGames += 1;

                const task1 = ach.dailyTasks.find(t => t.id === 1);
                if (task1 && !task1.completed) {
                    task1.completed = true;
                    ach.userStats.stars += task1.reward;
                }

                const done = ach.dailyTasks.filter(t => t.completed).length;
                ach.userStats.progressPercentage = Math.round((done / ach.dailyTasks.length) * 100);
        if (typeof scoreAwarded !== 'undefined' && window.CURRENT_ACTIVE_GAME_ID) {
            if(window.recordGameScore) window.recordGameScore(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
            if(window.achievementsData && window.achievementsData.addScoreToGame) window.achievementsData.addScoreToGame(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
        }
        if(window.achievementsData && window.achievementsData.saveAchievements) window.achievementsData.saveAchievements();

                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">🎨🏆</div>
                            <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:${cfg.color}; font-weight:700; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">🌟 Gölge Avcısı!</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px;">Seviye ${levelNumber} Tamamlandı!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Gölgeleri <strong>${gameTime} saniyede</strong> ve <strong>${incorrectCount} hata</strong> ile eşleştirdin!
                            </p>
                            
                            <div style="display:flex; justify-content:center; gap:14px; margin-bottom:22px;">
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-yellow); border:2px solid #D97706; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#D97706;">+${starsAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#78350F;">YILDIZ</div>
                                </div>
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-green); border:2px solid #166534; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#166534;">+${scoreAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#14532D;">PUAN</div>
                                </div>
                            </div>

                            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                                <button class="btn btn-success" id="btn-replay" style="flex:1; min-width:120px;">🔄 Tekrar Oyna</button>
                                ${levelNumber < 10 ? `<button class="btn btn-primary" id="btn-next-level" style="flex:1; min-width:120px;">➡️ Seviye ${levelNumber + 1}</button>` : ''}
                                <button class="btn btn-locked" id="btn-finish-win" style="flex:1; min-width:120px;">✅ Kaydet & Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay").addEventListener("click", () => {
                        playSound('click');
                        startShadowGame(container, levelNumber);
                    });
                    if (levelNumber < 10) {
                        container.querySelector("#btn-next-level").addEventListener("click", () => {
                            playSound('click');
                            startShadowGame(container, levelNumber + 1);
                        });
                    }
                    container.querySelector("#btn-finish-win").addEventListener("click", () => {
                        playSound('click');
                        closeModal();
                        renderAchievements();
                    });
                }, 600);
            } else {
                lockGame(7);
                playSound('locked');
                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:shake 0.5s ease-in-out;">😢💥👥</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px; color:#ef4444;">Canların Tükendi!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Yanlış gölgeleri eşleştirdin ve canların bitti. 1 global can kaybettin!
                            </p>
                            <div style="display:flex; gap:10px; justify-content:center;">
                                <button class="btn btn-primary" id="btn-replay-fail" style="flex:1; max-width:160px;">🔄 Tekrar Dene</button>
                                <button class="btn btn-locked" id="btn-close-fail" style="flex:1; max-width:160px;">❌ Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay-fail").addEventListener("click", () => {
                        playSound('click');
                        startShadowGame(container, levelNumber);
                    });
                    container.querySelector("#btn-close-fail").addEventListener("click", () => {
                        playSound('click');
                        closeModal();
                    });
                }, 600);
            }
        }

        generateRound();

        if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
        activeGameTimer = setInterval(() => {
            gameTime++;
            const el = document.getElementById("game-timer");
            if (el) el.innerText = gameTime;
            else { cleanUp(); }
        }, 1000);
    }
    // ============================================================
    // DOĞRU MU YANLIŞ MI? (DİKKAT) OYUN MOTORU
    // ============================================================
    function startTrueFalseGame(container, levelNumber) {
        if (window.currentGameCleanup) {
            window.currentGameCleanup();
            window.currentGameCleanup = null;
        }
        if (activeGameTimer) {
            clearInterval(activeGameTimer);
        }

        const LEVELS = [
            { 
                level: 1, name: "Kolay Sorular", targetScore: 5, speed: 15, color: "#CAFFBF",
                questions: [
                    { q: "İnekler bize süt verir. 🐄", a: true },
                    { q: "Güneş geceleri dünyamızı aydınlatır. ☀️", a: false },
                    { q: "Kuşların kanatları vardır ve uçarlar. 🐦", a: true },
                    { q: "Kediler 'Miyav' diyerek ses çıkarır. 🐱", a: true },
                    { q: "Balıklar gökyüzünde uçar. 🐟", a: false },
                    { q: "Limon tatlı bir meyvedir. 🍋", a: false },
                    { q: "Muz sarı renkli bir meyvedir. 🍌", a: true },
                    { q: "Arabaların direksiyonu yoktur. 🚗", a: false }
                ]
            },
            { 
                level: 2, name: "Minik Dahiler", targetScore: 6, speed: 14, color: "#CAFFBF",
                questions: [
                    { q: "Bir yılda 12 ay vardır. 📅", a: true },
                    { q: "Kış mevsiminde havalar çok sıcaktır. ⛄", a: false },
                    { q: "Elma ve armut meyvedir. 🍎", a: true },
                    { q: "Köpekler sadece ot yer. 🐶", a: false },
                    { q: "İnsanların iki kolu ve iki bacağı vardır. 🏃", a: true },
                    { q: "Gökkuşağı siyah beyaz renklerden oluşur. 🌈", a: false },
                    { q: "Ateş sıcaktır ve yakıcıdır. 🔥", a: true },
                    { q: "Gemiler karada tekerleklerle gider. 🚢", a: false }
                ]
            },
            { 
                level: 3, name: "Meraklı Kaşif", targetScore: 7, speed: 13, color: "#A0C4FF",
                questions: [
                    { q: "Dünyamızın şekli bir küreye (topa) benzer. 🌍", a: true },
                    { q: "Kurbağalar havlayarak haberleşir. 🐸", a: false },
                    { q: "Suyu dondurursak buz elde ederiz. 🧊", a: true },
                    { q: "Kelebekler tırtıllardan dönüşür. 🦋", a: true },
                    { q: "Arılar yuvalarına petek değil, kutu yaparlar. 🐝", a: false },
                    { q: "Uçaklar gökyüzünde kuşlardan daha yükseğe uçabilir. ✈️", a: true },
                    { q: "Bir haftada 10 gün vardır. 📆", a: false },
                    { q: "Karpuz yaz aylarında yenen sulu bir meyvedir. 🍉", a: true }
                ]
            },
            { 
                level: 4, name: "Bilgi Yolcusu", targetScore: 8, speed: 12, color: "#A0C4FF",
                questions: [
                    { q: "Kangurular karınlarında yavrularını taşıdıkları bir keseye sahiptir. 🦘", a: true },
                    { q: "Devekuşları çok hızlı koşarlar ve çok yüksekten uçarlar. 🦅", a: false },
                    { q: "Zürafaların boyunları çok uzundur, ağaç dallarına yetişir. 🦒", a: true },
                    { q: "Ağaçların yaprakları sonbaharda dökülmez, sadece ilkbaharda dökülür. 🍂", a: false },
                    { q: "Yunuslar denizlerde yaşayan, akıllı canlılardır. 🐬", a: true },
                    { q: "İnsanlar su altında balıklar gibi nefes alabilirler. 🤿", a: false },
                    { q: "Kütüphaneler sadece oyun oynamak içindir, kitap okunmaz. 📚", a: false },
                    { q: "Kaktüs bitkisi genellikle sıcak çöllerde yetişir. 🌵", a: true }
                ]
            },
            { 
                level: 5, name: "Zihin Egzersizi", targetScore: 9, speed: 11, color: "#FFD6A5",
                questions: [
                    { q: "Kare şeklinin tam olarak dört köşesi ve dört kenarı vardır. 🟦", a: true },
                    { q: "5 sayısına 3 eklersek 10 buluruz. 🔢", a: false },
                    { q: "Güneş sistemimizde Dünya dışında başka gezegenler de vardır. 🪐", a: true },
                    { q: "Mıknatıslar tahtayı çeker. 🧲", a: false },
                    { q: "Ahtapotların sekiz tane kolu vardır. 🐙", a: true },
                    { q: "Penguenler sıcak çöllerde yaşamayı çok severler. 🐧", a: false },
                    { q: "Dinozorlar günümüzde hala yaşamaktadır ve sokakta dolaşırlar. 🦕", a: false },
                    { q: "Teleskop kullanarak uzaktaki yıldızları görebiliriz. 🔭", a: true }
                ]
            },
            { 
                level: 6, name: "Mantık Avcısı", targetScore: 10, speed: 10, color: "#FFD6A5",
                questions: [
                    { q: "Ormanlar, dünyamızın daha temiz hava üretmesine yardımcı olur. 🌲", a: true },
                    { q: "Sütün içine kakao katarsak pembe renkli çilekli süt olur. 🥛", a: false },
                    { q: "Baykuşlar geceleri uyur, gündüzleri avlanırlar. 🦉", a: false },
                    { q: "Bütün kuşlar uçabilir, örneğin tavuklar kartallar kadar yükseğe uçar. 🐔", a: false },
                    { q: "Üçgen şeklinin üç tane köşesi vardır. 🔺", a: true },
                    { q: "Güneş aslında devasa ve çok sıcak bir yıldızdır. ⭐", a: true },
                    { q: "Demir çok hafif bir maddedir, suyun üstünde batmadan yüzer. ⚓", a: false },
                    { q: "Kutup ayıları sadece Kuzey Kutbu çevresinde yaşar. 🐻‍❄️", a: true }
                ]
            },
            { 
                level: 7, name: "Hızlı Düşünür", targetScore: 11, speed: 9.5, color: "#D8BBFF",
                questions: [
                    { q: "Ay'ın kendi ışığı yoktur, sadece Güneş'in ışığını yansıtır. 🌕", a: true },
                    { q: "Örümcekler böcek değildir, çünkü 8 bacakları vardır (böceklerin 6 bacağı olur). 🕷️", a: true },
                    { q: "Balinalar balık değildir, suda yaşayan memeli hayvanlardır. 🐳", a: true },
                    { q: "Deniz suyu çok tatlıdır ve çaya şeker gibi katılır. 🌊", a: false },
                    { q: "Deve hörgücünde su değil, enerji için yağ depolar. 🐪", a: true },
                    { q: "Çikolatanın ana maddesi çikolata ağacı değil, kakao çekirdeğidir. 🍫", a: true },
                    { q: "1 dakika tam olarak 100 saniyeden oluşur. ⏱️", a: false },
                    { q: "Yarasalar karanlıkta yönlerini bulmak için ses dalgalarını kullanır. 🦇", a: true }
                ]
            },
            { 
                level: 8, name: "Süper Odak", targetScore: 12, speed: 9, color: "#D8BBFF",
                questions: [
                    { q: "Köpek balıklarının iskeletleri kemikten değil, kıkırdaktan oluşur. 🦈", a: true },
                    { q: "Güneş sistemi içerisindeki en büyük gezegen Dünya'dır. 🌍", a: false },
                    { q: "Domates aslında bilimsel olarak bir sebze değil, meyvedir. 🍅", a: true },
                    { q: "Bukalemunlar ruh hallerine veya ısıya göre renk değiştirebilirler. 🦎", a: true },
                    { q: "Elmas dünyadaki en yumuşak taşlardan biridir. 💎", a: false },
                    { q: "Salyangozların evleri sırtlarında taşıdıkları kabuklarıdır. 🐌", a: true },
                    { q: "Arılar bir kraliçe arı önderliğinde çok düzenli koloniler kurarlar. 🐝", a: true },
                    { q: "Kaktüsler suyu gövdelerinde aylarca depolayamazlar, hemen kururlar. 🌵", a: false }
                ]
            },
            { 
                level: 9, name: "Zeka Ustası", targetScore: 13, speed: 8.5, color: "#FFC6FF",
                questions: [
                    { q: "Kar tanelerinin hiçbiri diğerine tamamen benzemez. ❄️", a: true },
                    { q: "Ayçiçekleri büyürken yüzlerini sürekli olarak Güneş'e doğru çevirirler. 🌻", a: true },
                    { q: "Uzayda yerçekimi Dünya'daki ile aynıdır, her şey yere düşer. 🚀", a: false },
                    { q: "Pandaların diyeti (yedikleri yemek) sadece etten oluşur. 🐼", a: false },
                    { q: "Dünya kendi etrafında dönmesini 24 saatte (1 günde) tamamlar. 🔄", a: true },
                    { q: "Tırtılların ayak sayısı insanlarınkinden daha fazladır. 🐛", a: true },
                    { q: "Cam ağaçların yapraklarından üretilir. 🪟", a: false },
                    { q: "Venüs gezegeni Güneş sisteminin en sıcak gezegenidir. 🔥", a: true }
                ]
            },
            { 
                level: 10, name: "Bilgi Şampiyonu", targetScore: 15, speed: 8, color: "#FFC6FF",
                questions: [
                    { q: "Dünya üzerinde en hızlı koşan kara hayvanı çitadır. 🐆", a: true },
                    { q: "Okyanuslardaki suların derinliklerinde hiçbir canlı yaşayamaz. 🌊", a: false },
                    { q: "İnsan beyni de bilgisayarlar gibi elektrik sinyalleri ile çalışır. 🧠", a: true },
                    { q: "Mısır piramitleri uzaylılar tarafından inşa edilmiştir. 🇪🇬", a: false },
                    { q: "Bambu bitkisi dünyadaki en hızlı büyüyen bitkilerden biridir, günde 1 metreye kadar uzayabilir. 🎋", a: true },
                    { q: "Zürafaların dili mavi veya morumsu siyah bir renktedir. 🦒", a: true },
                    { q: "Kutup bölgelerinde altı ay boyunca sadece gündüz veya sadece gece yaşanabilir. ☀️", a: true },
                    { q: "Tarihteki ilk bilgisayarlar cebimize sığacak kadar küçüktü. 💻", a: false },
                    { q: "Plüton artık gezegen değil, 'cüce gezegen' olarak kabul edilmektedir. 🌌", a: true },
                    { q: "Güneş, gezegenler gibi katı kayalardan oluşur, üzerine basabiliriz. ☀️", a: false }
                ]
            }
        ];

        const cfg = LEVELS[levelNumber - 1];
        const questionsPool = cfg.questions;
        let score = 0;
        let lives = 3;
        let incorrectCount = 0;
        let gameTime = 0;
        let currentQuestion = null;
        let questionTimer = null;
        let remainingTime = cfg.speed;
        let shuffledQuestions = [];
        let questionIndex = 0;
        let isProcessingAnswer = false;

        const tabsHTML = LEVELS.map(l => {
            const isUnlocked = isLevelUnlocked(8, l.level);
            return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" style="padding: 4px 8px; font-size: 0.72rem; min-width: 32px; ' + (isUnlocked ? '' : 'opacity:0.5; cursor:not-allowed;') + '" ' + (isUnlocked ? '' : 'disabled') + '>' + (isUnlocked ? l.level : '🔒') + '</button>';
        }).join('');

        function loadQuestion() {
            isProcessingAnswer = false;
            remainingTime = cfg.speed;
            if (shuffledQuestions.length === 0 || questionIndex >= shuffledQuestions.length) {
                shuffledQuestions = [...questionsPool].sort(() => Math.random() - 0.5);
                questionIndex = 0;
            }
            currentQuestion = shuffledQuestions[questionIndex];
            questionIndex++;
            renderQuestion();
            startQuestionCountdown();
        }

        function renderQuestion() {
            container.innerHTML = `
                <div class="true-false-game" style="text-align:center; padding:10px 0; user-select:none;">
                    <div class="level-tabs" style="display:flex; gap:4px; overflow-x:auto; margin-bottom:10px; padding-bottom:4px; justify-content:start;">
                        ${tabsHTML}
                    </div>
                    <div class="game-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background:rgba(0,0,0,0.03); padding:10px 15px; border-radius:16px;">
                        <div style="font-weight:700; color:var(--text-main); font-size:0.85rem;">
                            Seviye ${cfg.level}: <span style="color:var(--color-primary);">${cfg.name}</span>
                        </div>
                        <div class="game-lives" id="tf-lives" style="display:flex; gap:4px;">
                            <!-- Hearts -->
                        </div>
                        <div style="font-weight:700; color:var(--text-main); font-size:0.85rem;">
                            Skor: <span style="color:#D97706;">${score}/${cfg.targetScore}</span>
                        </div>
                    </div>

                    <div class="progress-bar-bg" style="height:10px; border-radius:5px; background:rgba(0,0,0,0.08); margin-bottom:20px; overflow:hidden;">
                        <div id="time-bar" style="height:100%; background:var(--pastel-green); width:100%; transition:width 0.1s linear;"></div>
                    </div>

                    <div class="question-display card glass" style="margin-bottom:30px; padding:30px 15px; border-radius:24px; border:2px solid rgba(0,0,0,0.05); min-height:120px; display:flex; align-items:center; justify-content:center;">
                        <h3 style="font-size:1.6rem; color:var(--text-main); line-height:1.5;">${currentQuestion.q}</h3>
                    </div>

                    <div class="decision-container" style="display:grid; grid-template-columns:1fr 1fr; gap:15px; max-width:280px; margin:0 auto 10px;">
                        <button class="btn" id="btn-true" style="padding:15px 0; border-radius:20px; font-size:1.2rem; font-weight:700; background:#6366f1; color:white; border:none; cursor:pointer;"><i data-lucide="check"></i> DOĞRU</button>
                        <button class="btn" id="btn-false" style="padding:15px 0; border-radius:20px; font-size:1.2rem; font-weight:700; background:#6366f1; color:white; border:none; cursor:pointer;"><i data-lucide="x"></i> YANLIŞ</button>
                    </div>
                </div>
            `;

            lucide.createIcons();
            updateLivesDisplay();

            container.querySelectorAll(".level-tab").forEach(tab => {
                tab.addEventListener("click", () => {
                    if (tab.hasAttribute("disabled")) return;
                    const next = parseInt(tab.dataset.level);
                    if (next === levelNumber) return;
                    playSound('click');
                    cleanUp();
                    startTrueFalseGame(container, next);
                });
            });

            container.querySelector("#btn-true").addEventListener("click", () => evaluateAnswer(true));
            container.querySelector("#btn-false").addEventListener("click", () => evaluateAnswer(false));
        }

        function updateLivesDisplay() {
            const livesEl = container.querySelector("#tf-lives");
            if (!livesEl) return;
            livesEl.innerHTML = "";
            for (let i = 0; i < 3; i++) {
                const heart = document.createElement("i");
                heart.style.width = "16px";
                heart.style.height = "16px";
                heart.setAttribute("data-lucide", "heart");
                if (i < lives) {
                    heart.style.fill = "#ef4444";
                    heart.style.color = "#ef4444";
                } else {
                    heart.style.fill = "none";
                    heart.style.color = "var(--text-muted)";
                    heart.style.opacity = "0.3";
                }
                livesEl.appendChild(heart);
            }
            lucide.createIcons();
        }

        function startQuestionCountdown() {
            if (questionTimer) clearInterval(questionTimer);
            
            const timeBar = container.querySelector("#time-bar");
            questionTimer = setInterval(() => {
                remainingTime -= 0.1;
                if (timeBar) {
                    const percentage = (remainingTime / cfg.speed) * 100;
                    timeBar.style.width = `${percentage}%`;
                    if (percentage < 30) {
                        timeBar.style.background = "#ef4444";
                    }
                }
                
                if (remainingTime <= 0) {
                    if (isProcessingAnswer) return;
                    isProcessingAnswer = true;
                    clearInterval(questionTimer);
                    lives--;
                    updateLivesDisplay();
                    incorrectCount++;
                    playSound('locked');
                    shakeScreen();
                    setTimeout(() => {
                        if (lives <= 0) {
                            endGame(false);
                        } else {
                            loadQuestion();
                        }
                    }, 500);
                }
            }, 100);
        }

        function evaluateAnswer(userAnswer) {
            if (isProcessingAnswer) return;
            isProcessingAnswer = true;

            if (questionTimer) clearInterval(questionTimer);

            const isCorrect = userAnswer === currentQuestion.a;
            
            const btnTrue = container.querySelector("#btn-true");
            const btnFalse = container.querySelector("#btn-false");
            
            if (btnTrue) btnTrue.disabled = true;
            if (btnFalse) btnFalse.disabled = true;

            const clickedBtn = userAnswer ? btnTrue : btnFalse;
            const display = container.querySelector(".question-display");
            
            if (isCorrect) {
                score++;
                playSound('success');
                display.style.background = "var(--pastel-green)";
                display.style.borderColor = "#166534";
                if (clickedBtn) {
                    clickedBtn.style.background = "#22c55e";
                }
            } else {
                lives--;
                updateLivesDisplay();
                incorrectCount++;
                playSound('locked');
                display.style.background = "var(--pastel-red)";
                display.style.borderColor = "#ef4444";
                if (clickedBtn) {
                    clickedBtn.style.background = "#ef4444";
                }
                shakeScreen();
            }

            setTimeout(() => {
                if (lives <= 0) {
                    endGame(false);
                } else if (score >= cfg.targetScore) {
                    endGame(true);
                } else {
                    loadQuestion();
                }
            }, 600);
        }

        function shakeScreen() {
            const display = container.querySelector(".question-display");
            if (display) {
                display.style.animation = "shake 0.35s ease";
                setTimeout(() => { display.style.animation = ""; }, 350);
            }
        }

        activeGameTimer = setInterval(() => {
            gameTime++;
        }, 1000);

        function cleanUp() {
            if (questionTimer) clearInterval(questionTimer);
            clearInterval(activeGameTimer);
        }
        window.currentGameCleanup = cleanUp;

        function endGame(isWin) {
            cleanUp();

            if (isWin) {
                unlockNextLevel(8, levelNumber);
                playSound('success');

                const scoreBase = 50 * levelNumber;
                const scoreAwarded = scoreBase + Math.max(0, 150 - gameTime * 3);
                const starsAwarded = incorrectCount === 0 ? 25 : (incorrectCount <= 2 ? 15 : 10);

                const ach = window.achievementsData;
                ach.userStats.stars += starsAwarded;
                ach.userStats.totalScore += scoreAwarded;
                ach.userStats.completedGames += 1;

                const task1 = ach.dailyTasks.find(t => t.id === 1);
                if (task1 && !task1.completed) {
                    task1.completed = true;
                    ach.userStats.stars += task1.reward;
                }

                const done = ach.dailyTasks.filter(t => t.completed).length;
                ach.userStats.progressPercentage = Math.round((done / ach.dailyTasks.length) * 100);
        if (typeof scoreAwarded !== 'undefined' && window.CURRENT_ACTIVE_GAME_ID) {
            if(window.recordGameScore) window.recordGameScore(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
            if(window.achievementsData && window.achievementsData.addScoreToGame) window.achievementsData.addScoreToGame(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
        }
        if(window.achievementsData && window.achievementsData.saveAchievements) window.achievementsData.saveAchievements();

                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">✅🏆❌</div>
                            <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:${cfg.color}; font-weight:700; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">🌟 Zeka Küpü!</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px;">Seviye ${levelNumber} Tamamlandı!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Soruları <strong>${gameTime} saniyede</strong> ve <strong>${incorrectCount} hata</strong> ile tamamladın!
                            </p>
                            
                            <div style="display:flex; justify-content:center; gap:14px; margin-bottom:22px;">
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-yellow); border:2px solid #D97706; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#D97706;">+${starsAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#78350F;">YILDIZ</div>
                                </div>
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-green); border:2px solid #166534; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#166534;">+${scoreAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#14532D;">PUAN</div>
                                </div>
                            </div>

                            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                                <button class="btn btn-success" id="btn-replay" style="flex:1; min-width:120px;">🔄 Tekrar Oyna</button>
                                ${levelNumber < 10 ? '<button class="btn btn-primary" id="btn-next-level" style="flex:1; min-width:120px;">➡️ Seviye ' + (levelNumber + 1) + '</button>' : ''}
                                <button class="btn btn-locked" id="btn-finish-win" style="flex:1; min-width:120px;">✅ Kaydet & Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay").addEventListener("click", () => {
                        playSound('click');
                        startTrueFalseGame(container, levelNumber);
                    });
                    if (levelNumber < 10) {
                        container.querySelector("#btn-next-level").addEventListener("click", () => {
                            playSound('click');
                            startTrueFalseGame(container, levelNumber + 1);
                        });
                    }
                    container.querySelector("#btn-finish-win").addEventListener("click", () => {
                        playSound('click');
                        closeModal();
                        renderAchievements();
                    });
                }, 600);
            } else {
                lockGame(8);
                playSound('locked');

                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:shake 0.5s ease-in-out;">😢💥❌</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px; color:#ef4444;">Canların Tükendi!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Seviyeyi tamamlayamadın. 3 canının hepsi bitti. 1 global can kaybettin!
                            </p>
                            
                            <div style="display:flex; gap:10px; justify-content:center;">
                                <button class="btn btn-primary" id="btn-replay-fail" style="padding:10px 24px;">🔄 Tekrar Dene</button>
                                <button class="btn btn-locked" id="btn-close-fail" style="padding:10px 24px;">❌ Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay-fail").addEventListener("click", () => {
                        playSound('click');
                        startTrueFalseGame(container, levelNumber);
                    });
                    container.querySelector("#btn-close-fail").addEventListener("click", () => {
                        playSound('click');
                        closeModal();
                    });
                }, 600);
            }
        }

        loadQuestion();
    }
    // ============================================================
    // HIZLI SAYMA (MATEMATİK) OYUN MOTORU
    // ============================================================
    function startNumberChaseGame(container, levelNumber) {
        if (window.currentGameCleanup) { window.currentGameCleanup(); window.currentGameCleanup = null; }
        if (activeGameTimer) { clearInterval(activeGameTimer); }

        const LEVELS = [
            { level: 1, name: "5'ten küçükleri yakala!", check: (n) => n < 5, min: 1, max: 9, target: 5, speed: 4500, spawnRate: 1500, color: "#CAFFBF" },
            { level: 2, name: "5'ten büyükleri yakala!", check: (n) => n > 5, min: 1, max: 10, target: 6, speed: 4000, spawnRate: 1400, color: "#CAFFBF" },
            { level: 3, name: "Çift sayıları yakala!", check: (n) => n % 2 === 0, min: 1, max: 10, target: 8, speed: 4000, spawnRate: 1300, color: "#A0C4FF" },
            { level: 4, name: "Tek sayıları yakala!", check: (n) => n % 2 !== 0, min: 1, max: 10, target: 8, speed: 3800, spawnRate: 1200, color: "#A0C4FF" },
            { level: 5, name: "10'dan büyükleri yakala!", check: (n) => n > 10, min: 1, max: 20, target: 10, speed: 3800, spawnRate: 1100, color: "#FFD6A5" },
            { level: 6, name: "10-20 arasındakileri yakala!", check: (n) => n > 10 && n < 20, min: 5, max: 25, target: 10, speed: 3500, spawnRate: 1100, color: "#FFD6A5" },
            { level: 7, name: "10'un katlarını yakala!", check: (n) => n % 10 === 0, min: 5, max: 50, target: 12, speed: 3500, spawnRate: 1000, color: "#D8BBFF" },
            { level: 8, name: "Sonu 5 olanları yakala!", check: (n) => n % 10 === 5, min: 5, max: 50, target: 12, speed: 3200, spawnRate: 1000, color: "#D8BBFF" },
            { level: 9, name: "Çiftleri yakala (Hızlı!)", check: (n) => n % 2 === 0, min: 10, max: 50, target: 15, speed: 3000, spawnRate: 900, color: "#FFADAD" },
            { level: 10, name: "Tekleri yakala (Şimşek Hızı!)", check: (n) => n % 2 !== 0, min: 10, max: 99, target: 15, speed: 2800, spawnRate: 800, color: "#FFC6FF" }
        ];

        const cfg = LEVELS[levelNumber - 1];
        let lives = 3;
        let progress = 0;
        let timeElapsed = 0;
        let incorrectCount = 0;
        let gameActive = true;
        let spawnInterval = null;

        const tabsHTML = LEVELS.map(l => {
            const isUnlocked = isLevelUnlocked(9, l.level);
            return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" ' + (isUnlocked ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"') + '>' + (isUnlocked ? l.level : '🔒') + '</button>';
        }).join('');

        container.innerHTML = `
            <div class="number-chase-game" style="text-align:center; padding:10px 0; user-select:none; display:flex; flex-direction:column; height:450px;">
                <div class="level-tabs" style="display:flex; gap:8px; overflow-x:auto; padding-bottom:10px; margin-bottom:10px; border-bottom:2px solid var(--border-color);" class="scroll-hide">${tabsHTML}</div>
                <div style="font-size:1.1rem; font-weight:800; margin-bottom:8px; color:#92400e; background:${cfg.color}; padding:8px; border-radius:12px; border:2px solid #b45309;">
                    🎯 Görev: <span>${cfg.name}</span>
                </div>
                <div class="game-stats" style="display:flex; justify-content:space-between; margin-bottom:10px; font-weight:700;">
                    <div class="stat-item" id="chase-lives" style="display:flex; gap:4px; align-items:center;"></div>
                    <div class="stat-item"><span id="game-timer">0</span>sn</div>
                    <div class="stat-item">İlerleme: <span id="chase-progress">0</span>/${cfg.target}</div>
                </div>
                <div id="game-area" style="position:relative; flex:1; background:linear-gradient(to bottom, #bae6fd, #e0f2fe); border-radius:12px; border:2px solid #0284c7; overflow:hidden;">
                    <!-- Yağmur damlaları buraya düşecek -->
                </div>
                <button class="btn btn-locked" id="btn-give-up" style="width:100%; font-size:0.82rem; margin-top:12px; padding:10px;">
                    🏳️ Vazgeç & Kapat
                </button>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        updateLivesDisplay();

        const gameArea = container.querySelector("#game-area");

        function updateLivesDisplay() {
            const livesEl = document.getElementById("chase-lives");
            if (!livesEl) return;
            livesEl.innerHTML = "";
            for (let i = 0; i < 3; i++) {
                const heart = document.createElement("div");
                heart.innerHTML = i < lives ? "❤️" : "🖤";
                livesEl.appendChild(heart);
            }
        }

        function cleanUp() {
            gameActive = false;
            if (spawnInterval) clearInterval(spawnInterval);
            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
        }
        window.currentGameCleanup = cleanUp;

        function spawnDrop() {
            if (!gameActive) return;
            
            // %50 ihtimalle doğru sayı, %50 ihtimalle yanlış sayı
            let isCorrectTarget = Math.random() < 0.5;
            let num;
            let attempts = 0;
            do {
                num = Math.floor(Math.random() * (cfg.max - cfg.min + 1)) + cfg.min;
                attempts++;
            } while (cfg.check(num) !== isCorrectTarget && attempts < 50);

            const drop = document.createElement("div");
            drop.innerText = num;
            drop.style.position = "absolute";
            const startX = 5 + Math.random() * 75; // Genişlikten taşmaması için %5 ile %80 arası
            drop.style.left = startX + "%";
            drop.style.top = "-50px";
            drop.style.width = "46px";
            drop.style.height = "46px";
            drop.style.display = "flex";
            drop.style.alignItems = "center";
            drop.style.justifyContent = "center";
            drop.style.fontWeight = "900";
            drop.style.fontSize = "1.3rem";
            drop.style.color = "#0c4a6e";
            drop.style.background = "#fff";
            drop.style.border = "3px solid #38bdf8";
            drop.style.borderRadius = "50%"; 
            drop.style.boxShadow = "0 4px 6px rgba(0,0,0,0.15)";
            drop.style.cursor = "pointer";
            drop.style.zIndex = "10";

            gameArea.appendChild(drop);

            const animation = drop.animate([
                { top: '-50px' },
                { top: '100%' }
            ], {
                duration: cfg.speed,
                easing: 'linear',
                fill: 'forwards'
            });

            let clicked = false;

            drop.addEventListener("click", () => {
                if (!gameActive || clicked) return;
                clicked = true;
                animation.pause();
                
                if (cfg.check(num)) {
                    // DOĞRU!
                    playSound('success');
                    drop.style.background = "#4ade80"; // yeşil
                    drop.style.borderColor = "#166534";
                    drop.style.color = "#166534";
                    drop.style.transform = "scale(1.3)";
                    progress++;
                    const progEl = container.querySelector("#chase-progress");
                    if (progEl) progEl.innerText = progress;
                    
                    setTimeout(() => { if(drop.parentNode) drop.remove(); }, 200);

                    if (progress >= cfg.target) {
                        endGame(true);
                    }
                } else {
                    // YANLIŞ!
                    playSound('locked');
                    drop.style.background = "#ef4444"; // kırmızı
                    drop.style.borderColor = "#7f1d1d";
                    drop.style.color = "#fff";
                    drop.style.animation = "shake 0.3s ease";
                    lives--;
                    incorrectCount++;
                    updateLivesDisplay();
                    
                    setTimeout(() => { if(drop.parentNode) drop.remove(); }, 300);

                    if (lives <= 0) {
                        endGame(false);
                    }
                }
            });

            animation.onfinish = () => {
                if (!gameActive || clicked) return;
                // Damla yere düştü (tıklanamadı)
                if (cfg.check(num)) {
                    // Doğru sayıyı KAÇIRDI! Can gider.
                    lives--;
                    updateLivesDisplay();
                    playSound('locked');
                    if (lives <= 0) {
                        endGame(false);
                    }
                }
                if(drop.parentNode) drop.remove();
            };
        }

        // Geri sayım
        const countdownEl = document.createElement("div");
        countdownEl.style.position = "absolute";
        countdownEl.style.top = "50%";
        countdownEl.style.left = "50%";
        countdownEl.style.transform = "translate(-50%, -50%)";
        countdownEl.style.fontSize = "5rem";
        countdownEl.style.fontWeight = "900";
        countdownEl.style.color = "#ea580c";
        countdownEl.style.textShadow = "2px 2px 0px #fff, -2px -2px 0px #fff, 2px -2px 0px #fff, -2px 2px 0px #fff";
        countdownEl.style.zIndex = "100";
        gameArea.appendChild(countdownEl);

        let count = 3;
        countdownEl.innerText = count;
        playSound('click');
        
        let countInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownEl.innerText = count;
                playSound('click');
            } else {
                clearInterval(countInterval);
                countdownEl.innerText = "BAŞLA!";
                setTimeout(() => {
                    if (countdownEl.parentNode) countdownEl.remove();
                    if (gameActive) {
                        spawnInterval = setInterval(spawnDrop, cfg.spawnRate);
                        
                        activeGameTimer = setInterval(() => {
                            if (!gameActive) return;
                            timeElapsed++;
                            const timerEl = document.getElementById("game-timer");
                            if (timerEl) timerEl.innerText = timeElapsed;
                        }, 1000);
                    }
                }, 800);
            }
        }, 1000);

        container.querySelectorAll(".level-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                if (tab.hasAttribute("disabled")) return;
                const next = parseInt(tab.dataset.level);
                if (next === levelNumber) return;
                playSound('click');
                cleanUp();
                clearInterval(countInterval);
                startNumberChaseGame(container, next);
            });
        });

        container.querySelector("#btn-give-up").addEventListener("click", () => {
            playSound('locked');
            cleanUp();
            clearInterval(countInterval);
            closeModal();
        });

        function endGame(isWin) {
            gameActive = false;
            cleanUp();
            clearInterval(countInterval);

            if (isWin) {
                unlockNextLevel(9, levelNumber);
                playSound('success');

                const scoreBase = 60 * levelNumber;
                const scoreAwarded = scoreBase + Math.max(0, 200 - timeElapsed * 4);
                const starsAwarded = incorrectCount === 0 ? 25 : (incorrectCount <= 2 ? 15 : 10);

                const ach = window.achievementsData;
                ach.userStats.stars += starsAwarded;
                ach.userStats.totalScore += scoreAwarded;
                ach.userStats.completedGames += 1;
                
                const task1 = ach.dailyTasks.find(t => t.id === 1);
                if (task1 && !task1.completed) {
                    task1.completed = true;
                    ach.userStats.stars += task1.reward;
                }
                const done = ach.dailyTasks.filter(t => t.completed).length;
                ach.userStats.progressPercentage = Math.round((done / ach.dailyTasks.length) * 100);
        if (typeof scoreAwarded !== 'undefined' && window.CURRENT_ACTIVE_GAME_ID) {
            if(window.recordGameScore) window.recordGameScore(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
            if(window.achievementsData && window.achievementsData.addScoreToGame) window.achievementsData.addScoreToGame(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
        }
        if(window.achievementsData && window.achievementsData.saveAchievements) window.achievementsData.saveAchievements();

                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">💧🏆</div>
                            <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:${cfg.color}; font-weight:700; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">🌟 Sayı Avcısı!</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px;">Seviye ${levelNumber} Tamamlandı!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Görevi <strong>${timeElapsed} saniyede</strong> ve <strong>${incorrectCount} hata</strong> ile başardın!
                            </p>
                            
                            <div style="display:flex; justify-content:center; gap:14px; margin-bottom:22px;">
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-yellow); border:2px solid #D97706; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#D97706;">+${starsAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#78350F;">YILDIZ</div>
                                </div>
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-green); border:2px solid #166534; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#166534;">+${scoreAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#14532D;">PUAN</div>
                                </div>
                            </div>

                            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                                <button class="btn btn-success" id="btn-replay" style="flex:1; min-width:120px;">🔄 Tekrar Oyna</button>
                                ${levelNumber < 10 ? `<button class="btn btn-primary" id="btn-next-level" style="flex:1; min-width:120px;">➡️ Seviye ${levelNumber + 1}</button>` : ''}
                                <button class="btn btn-locked" id="btn-finish-win" style="flex:1; min-width:120px;">✅ Kaydet & Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay").addEventListener("click", () => {
                        playSound('click');
                        startNumberChaseGame(container, levelNumber);
                    });
                    if (levelNumber < 10) {
                        container.querySelector("#btn-next-level").addEventListener("click", () => {
                            playSound('click');
                            startNumberChaseGame(container, levelNumber + 1);
                        });
                    }
                    container.querySelector("#btn-finish-win").addEventListener("click", () => {
                        playSound('click');
                        closeModal();
                        renderAchievements();
                    });
                }, 600);
            } else {
                lockGame(9);
                playSound('locked');
                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:shake 0.5s ease-in-out;">😢💥💧</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px; color:#ef4444;">Canların Tükendi!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Yanlış damlalara bastın ya da doğru olanları kaçırdın. 3 canın bitti! 1 global can kaybettin!
                            </p>
                            <div style="display:flex; gap:10px; justify-content:center;">
                                <button class="btn btn-primary" id="btn-replay-fail" style="flex:1; max-width:160px;">🔄 Tekrar Dene</button>
                                <button class="btn btn-locked" id="btn-close-fail" style="flex:1; max-width:160px;">❌ Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay-fail").addEventListener("click", () => {
                        playSound('click');
                        startNumberChaseGame(container, levelNumber);
                    });
                    container.querySelector("#btn-close-fail").addEventListener("click", () => {
                        playSound('click');
                        closeModal();
                    });
                }, 600);
            }
        }
    }

    // ============================================================
    // RİTMİK HAFIZA (HAFIZA/DİKKAT) OYUN MOTORU - SİMLİ & PARILTILI 3D KARELER
    // ============================================================
    function startRhythmicMemoryGame(container, levelNumber) {
        if (activeGameTimer) {
            clearInterval(activeGameTimer);
            activeGameTimer = null;
        }

        const render3DCrystalGemSVG = (t) => {
            if (t.id === 0) {
                // 3D Pembe Elmas (Pink Diamond)
                return `<svg viewBox="0 0 100 100" style="width:85%; height:85%; filter:drop-shadow(0 6px 12px rgba(0,0,0,0.35));">
                    <defs>
                        <radialGradient id="pinkCore" cx="50%" cy="35%" r="60%">
                            <stop offset="0%" stop-color="#ffe4e6"/>
                            <stop offset="50%" stop-color="#fb7185"/>
                            <stop offset="100%" stop-color="#be123c"/>
                        </radialGradient>
                        <linearGradient id="facetTop" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
                            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.2"/>
                        </linearGradient>
                    </defs>
                    <polygon points="30,20 70,20 90,45 50,85 10,45" fill="url(#pinkCore)" stroke="#ffe4e6" stroke-width="2.5"/>
                    <polygon points="30,20 50,45 10,45" fill="rgba(255,255,255,0.4)"/>
                    <polygon points="70,20 50,45 90,45" fill="rgba(255,255,255,0.15)"/>
                    <polygon points="30,20 70,20 50,45" fill="url(#facetTop)"/>
                    <polygon points="50,45 90,45 50,85" fill="rgba(0,0,0,0.15)"/>
                    <polygon points="50,45 10,45 50,85" fill="rgba(255,255,255,0.25)"/>
                    <circle cx="35" cy="28" r="3" fill="#ffffff"/>
                    <path d="M 35 20 L 35 36 M 27 28 L 43 28" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
                </svg>`;
            }
            if (t.id === 1) {
                // 3D Safir Mavi Kristal (Sapphire Crystal)
                return `<svg viewBox="0 0 100 100" style="width:85%; height:85%; filter:drop-shadow(0 6px 12px rgba(0,0,0,0.35));">
                    <defs>
                        <radialGradient id="blueCore" cx="45%" cy="30%" r="65%">
                            <stop offset="0%" stop-color="#bfdbfe"/>
                            <stop offset="55%" stop-color="#3b82f6"/>
                            <stop offset="100%" stop-color="#1e3a8a"/>
                        </radialGradient>
                    </defs>
                    <polygon points="50,12 82,32 82,68 50,88 18,68 18,32" fill="url(#blueCore)" stroke="#93c5fd" stroke-width="3"/>
                    <polygon points="50,12 82,32 50,45" fill="rgba(255,255,255,0.45)"/>
                    <polygon points="18,32 50,12 50,45" fill="rgba(255,255,255,0.6)"/>
                    <polygon points="18,32 18,68 50,45" fill="rgba(255,255,255,0.25)"/>
                    <polygon points="82,32 82,68 50,45" fill="rgba(0,0,0,0.2)"/>
                    <polygon points="18,68 50,88 50,45" fill="rgba(255,255,255,0.15)"/>
                    <polygon points="82,68 50,88 50,45" fill="rgba(0,0,0,0.3)"/>
                    <circle cx="34" cy="26" r="3" fill="#ffffff"/>
                </svg>`;
            }
            if (t.id === 2) {
                // 3D Altın Yıldız Kristal (Gold Star Crystal)
                return `<svg viewBox="0 0 100 100" style="width:85%; height:85%; filter:drop-shadow(0 6px 12px rgba(0,0,0,0.35));">
                    <defs>
                        <radialGradient id="goldCore" cx="45%" cy="30%" r="65%">
                            <stop offset="0%" stop-color="#fef08a"/>
                            <stop offset="55%" stop-color="#eab308"/>
                            <stop offset="100%" stop-color="#854d0e"/>
                        </radialGradient>
                    </defs>
                    <path d="M 50 10 L 63 35 L 90 38 L 70 57 L 76 85 L 50 70 L 24 85 L 30 57 L 10 38 L 37 35 Z" fill="url(#goldCore)" stroke="#fef08a" stroke-width="2.5"/>
                    <path d="M 50 10 L 50 70 L 63 35 Z M 50 70 L 76 85 L 70 57 Z M 50 70 L 24 85 L 30 57 Z" fill="rgba(255,255,255,0.35)"/>
                    <path d="M 50 10 L 50 70 L 37 35 Z M 50 70 L 10 38 L 30 57 Z" fill="rgba(255,255,255,0.55)"/>
                    <circle cx="50" cy="35" r="3" fill="#ffffff"/>
                </svg>`;
            }
            if (t.id === 3) {
                // 3D Zümrüt (Emerald Cut Gemstone)
                return `<svg viewBox="0 0 100 100" style="width:85%; height:85%; filter:drop-shadow(0 6px 12px rgba(0,0,0,0.35));">
                    <defs>
                        <radialGradient id="emCore" cx="45%" cy="30%" r="65%">
                            <stop offset="0%" stop-color="#a7f3d0"/>
                            <stop offset="55%" stop-color="#10b981"/>
                            <stop offset="100%" stop-color="#064e3b"/>
                        </radialGradient>
                    </defs>
                    <rect x="18" y="22" width="64" height="56" rx="8" fill="url(#emCore)" stroke="#6ee7b7" stroke-width="3"/>
                    <rect x="28" y="30" width="44" height="40" rx="4" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2.5"/>
                    <line x1="18" y1="22" x2="28" y2="30" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
                    <line x1="82" y1="22" x2="72" y2="30" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
                    <line x1="18" y1="78" x2="28" y2="70" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
                    <line x1="82" y1="78" x2="72" y2="70" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
                    <polygon points="18,22 82,22 72,30 28,30" fill="rgba(255,255,255,0.4)"/>
                    <polygon points="18,22 28,30 28,70 18,78" fill="rgba(255,255,255,0.25)"/>
                </svg>`;
            }
            if (t.id === 4) {
                // 3D Galaksi Mor Kristal Küre (Amethyst Sphere)
                return `<svg viewBox="0 0 100 100" style="width:85%; height:85%; filter:drop-shadow(0 6px 12px rgba(0,0,0,0.35));">
                    <defs>
                        <radialGradient id="purpCore" cx="35%" cy="30%" r="70%">
                            <stop offset="0%" stop-color="#f5d0fe"/>
                            <stop offset="45%" stop-color="#c084fc"/>
                            <stop offset="80%" stop-color="#7e22ce"/>
                            <stop offset="100%" stop-color="#3b0764"/>
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="38" fill="url(#purpCore)" stroke="#e9d5ff" stroke-width="3"/>
                    <ellipse cx="40" cy="35" rx="16" ry="8" fill="rgba(255,255,255,0.45)" transform="rotate(-30 40 35)"/>
                    <circle cx="32" cy="28" r="4" fill="#ffffff"/>
                </svg>`;
            }
            if (t.id === 5) {
                // 3D Kehribar Ateş Kristali (Amber Fire Crystal)
                return `<svg viewBox="0 0 100 100" style="width:85%; height:85%; filter:drop-shadow(0 6px 12px rgba(0,0,0,0.35));">
                    <defs>
                        <radialGradient id="ambCore" cx="45%" cy="30%" r="65%">
                            <stop offset="0%" stop-color="#ffedd5"/>
                            <stop offset="55%" stop-color="#f97316"/>
                            <stop offset="100%" stop-color="#7c2d12"/>
                        </radialGradient>
                    </defs>
                    <polygon points="50,10 78,35 68,85 32,85 22,35" fill="url(#ambCore)" stroke="#fed7aa" stroke-width="3"/>
                    <polygon points="50,10 78,35 50,48" fill="rgba(255,255,255,0.5)"/>
                    <polygon points="50,10 22,35 50,48" fill="rgba(255,255,255,0.7)"/>
                    <polygon points="22,35 32,85 50,48" fill="rgba(255,255,255,0.2)"/>
                    <circle cx="36" cy="26" r="3" fill="#ffffff"/>
                </svg>`;
            }
            if (t.id === 6) {
                // 3D Turkuaz Su Kristali (Turquoise Tear Drop Gem)
                return `<svg viewBox="0 0 100 100" style="width:85%; height:85%; filter:drop-shadow(0 6px 12px rgba(0,0,0,0.35));">
                    <defs>
                        <radialGradient id="turqCore" cx="45%" cy="35%" r="65%">
                            <stop offset="0%" stop-color="#cffafe"/>
                            <stop offset="55%" stop-color="#06b6d4"/>
                            <stop offset="100%" stop-color="#164e63"/>
                        </radialGradient>
                    </defs>
                    <path d="M 50 12 C 75 45 82 65 68 82 C 54 94 36 90 24 76 C 14 60 25 45 50 12 Z" fill="url(#turqCore)" stroke="#a5f3fc" stroke-width="3"/>
                    <path d="M 50 12 C 60 35 65 50 50 78 Z" fill="rgba(255,255,255,0.4)"/>
                    <circle cx="42" cy="35" r="3.5" fill="#ffffff"/>
                </svg>`;
            }
            if (t.id === 7) {
                // 3D Gül Altın Çiçek Kristal (Rose Gold Gem)
                return `<svg viewBox="0 0 100 100" style="width:85%; height:85%; filter:drop-shadow(0 6px 12px rgba(0,0,0,0.35));">
                    <defs>
                        <radialGradient id="roseCore" cx="45%" cy="30%" r="65%">
                            <stop offset="0%" stop-color="#fce7f3"/>
                            <stop offset="55%" stop-color="#f43f5e"/>
                            <stop offset="100%" stop-color="#881337"/>
                        </radialGradient>
                    </defs>
                    <path d="M 50 12 L 62 30 L 85 30 L 72 48 L 82 70 L 60 65 L 50 88 L 40 65 L 18 70 L 28 48 L 15 30 L 38 30 Z" fill="url(#roseCore)" stroke="#fbcfe8" stroke-width="3"/>
                    <circle cx="50" cy="48" r="16" fill="rgba(255,255,255,0.35)"/>
                    <circle cx="44" cy="42" r="3" fill="#ffffff"/>
                </svg>`;
            }
            if (t.id === 8) {
                // 3D Gökkuşağı Prizma Pırlanta (Rainbow Prism Crystal)
                return `<svg viewBox="0 0 100 100" style="width:85%; height:85%; filter:drop-shadow(0 6px 12px rgba(0,0,0,0.35));">
                    <defs>
                        <linearGradient id="rbCore" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stop-color="#f43f5e"/>
                            <stop offset="25%" stop-color="#f59e0b"/>
                            <stop offset="50%" stop-color="#10b981"/>
                            <stop offset="75%" stop-color="#3b82f6"/>
                            <stop offset="100%" stop-color="#8b5cf6"/>
                        </linearGradient>
                    </defs>
                    <polygon points="50,10 88,40 70,88 30,88 12,40" fill="url(#rbCore)" stroke="#ffffff" stroke-width="3.5"/>
                    <polygon points="50,10 88,40 50,50" fill="rgba(255,255,255,0.45)"/>
                    <polygon points="50,10 12,40 50,50" fill="rgba(255,255,255,0.65)"/>
                    <polygon points="12,40 30,88 50,50" fill="rgba(255,255,255,0.25)"/>
                    <circle cx="38" cy="28" r="4" fill="#ffffff"/>
                </svg>`;
            }
            return '';
        };

        const SPARKLE_TILES = [
            { id: 0, name: "Elmas Pembe", bg: "linear-gradient(135deg, #f43f5e, #be123c)", border: "#fda4af", glow: "#f43f5e", shadow: "rgba(244, 63, 94, 0.45)" },
            { id: 1, name: "Safir Mavi", bg: "linear-gradient(135deg, #3b82f6, #1d4ed8)", border: "#93c5fd", glow: "#3b82f6", shadow: "rgba(59, 130, 246, 0.45)" },
            { id: 2, name: "Altın Işıltı", bg: "linear-gradient(135deg, #eab308, #ca8a04)", border: "#fef08a", glow: "#eab308", shadow: "rgba(234, 179, 8, 0.45)" },
            { id: 3, name: "Zümrüt Yeşil", bg: "linear-gradient(135deg, #10b981, #047857)", border: "#6ee7b7", glow: "#10b981", shadow: "rgba(16, 185, 129, 0.45)" },
            { id: 4, name: "Galaksi Mor", bg: "linear-gradient(135deg, #a855f7, #6b21a8)", border: "#e9d5ff", glow: "#a855f7", shadow: "rgba(168, 85, 247, 0.45)" },
            { id: 5, name: "Kehribar Turuncu", bg: "linear-gradient(135deg, #f97316, #c2410c)", border: "#fed7aa", glow: "#f97316", shadow: "rgba(249, 115, 22, 0.45)" },
            { id: 6, name: "Turkuaz Kristal", bg: "linear-gradient(135deg, #06b6d4, #0e7490)", border: "#a5f3fc", glow: "#06b6d4", shadow: "rgba(6, 182, 212, 0.45)" },
            { id: 7, name: "Gül Altın", bg: "linear-gradient(135deg, #ec4899, #9d174d)", border: "#fbcfe8", glow: "#ec4899", shadow: "rgba(236, 72, 153, 0.45)" },
            { id: 8, name: "Gökkuşağı Pırıltı", bg: "linear-gradient(135deg, #8b5cf6, #ec4899, #f59e0b)", border: "#ffffff", glow: "#8b5cf6", shadow: "rgba(139, 92, 246, 0.5)" }
        ];

        const LEVELS = [
            { level: 1, name: "Pembe & Safir Işıltısı", tileCount: 4, targetLength: 4, speed: 650, color: "#CAFFBF" },
            { level: 2, name: "Kristal Başlangıç", tileCount: 4, targetLength: 5, speed: 600, color: "#CAFFBF" },
            { level: 3, name: "Zümrüt Sürprizi", tileCount: 5, targetLength: 5, speed: 550, color: "#A0C4FF" },
            { level: 4, name: "Işıl Işıl Kareler", tileCount: 5, targetLength: 6, speed: 500, color: "#A0C4FF" },
            { level: 5, name: "Galaksi Ritiği", tileCount: 6, targetLength: 6, speed: 450, color: "#FFD6A5" },
            { level: 6, name: "Simli Şenlik", tileCount: 6, targetLength: 7, speed: 400, color: "#FFD6A5" },
            { level: 7, name: "Gül Altın & Turkuaz", tileCount: 8, targetLength: 7, speed: 350, color: "#D8BBFF" },
            { level: 8, name: "Derin Kristal Ritim", tileCount: 8, targetLength: 8, speed: 300, color: "#D8BBFF" },
            { level: 9, name: "Pırlanta Dünyası", tileCount: 9, targetLength: 8, speed: 270, color: "#FFADAD" },
            { level: 10, name: "Büyük 3D Kristal Şampiyonu", tileCount: 9, targetLength: 10, speed: 240, color: "#FFC6FF" }
        ];

        const cfg = LEVELS[levelNumber - 1];
        const activeTiles = SPARKLE_TILES.slice(0, cfg.tileCount);

        let sequence = [];
        let playerIndex = 0;
        let gameActive = false;
        let isShowingSequence = false;
        let roundsWon = 0;
        let lives = 3;

        const tabsHTML = LEVELS.map(l => {
            const isUnlocked = isLevelUnlocked(10, l.level);
            return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" ' + (isUnlocked ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"') + '>' + (isUnlocked ? l.level : '🔒') + '</button>';
        }).join('');

        let gridCols = 2;
        let maxW = "310px";
        if (cfg.tileCount === 5 || cfg.tileCount === 6) {
            gridCols = 3;
            maxW = "350px";
        } else if (cfg.tileCount === 8) {
            gridCols = 4;
            maxW = "380px";
        } else if (cfg.tileCount === 9) {
            gridCols = 3;
            maxW = "350px";
        }

        container.innerHTML = `
            <div class="rhythmic-memory-game" style="text-align:center; padding:8px 0; user-select:none; font-family:var(--font-main);">
                <div class="level-tabs" style="display:flex; gap:6px; overflow-x:auto; margin-bottom:10px; padding-bottom:4px;">${tabsHTML}</div>
                
                <div class="game-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; background:rgba(248,250,252,0.92); padding:10px 16px; border-radius:16px; border:1px solid #cbd5e1; box-shadow:0 4px 12px rgba(0,0,0,0.04);">
                    <div style="text-align:left;">
                        <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Svy ${cfg.level} (${cfg.tileCount} Simli Kare)</span>
                        <div style="font-weight:800; font-size:1.02rem; color:var(--color-primary);">${cfg.name}</div>
                    </div>
                    
                    <div class="game-lives" style="display:flex; gap:4px; background:#fee2e2; padding:5px 10px; border-radius:12px; border:1px solid #fca5a5;">
                        <i class="heart-icon" data-lucide="heart" style="fill:#ef4444; color:#ef4444; width:18px; height:18px;"></i>
                        <i class="heart-icon" data-lucide="heart" style="fill:#ef4444; color:#ef4444; width:18px; height:18px;"></i>
                        <i class="heart-icon" data-lucide="heart" style="fill:#ef4444; color:#ef4444; width:18px; height:18px;"></i>
                    </div>

                    <div style="font-weight:800; color:#d97706; background:#fef3c7; padding:5px 10px; border-radius:12px; border:1px solid #fde68a; font-size:0.88rem;">
                        🎯 <span id="rhythm-progress">0</span>/${cfg.targetLength}
                    </div>
                </div>

                <div id="rhythm-prompt" style="margin-bottom:14px; font-weight:800; font-size:1.15rem; color:var(--text-main); min-height:28px; background:rgba(255,255,255,0.7); padding:6px 14px; border-radius:14px; border:1px solid #e2e8f0; display:inline-block;">
                    Hazırlan... ✨💎
                </div>

                <div class="simon-board" style="display:grid; grid-template-columns: repeat(${gridCols}, 1fr); gap:14px; max-width:${maxW}; margin:0 auto 14px;">
                    ${activeTiles.map(t => `
                        <button class="simon-pad" data-id="${t.id}" style="aspect-ratio:1; background:${t.bg}; border:4px solid ${t.border}; border-bottom:7px solid rgba(0,0,0,0.3); border-radius:24px; cursor:pointer; transition:transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s; box-shadow:0 10px 24px ${t.shadow}, inset 0 3px 6px rgba(255,255,255,0.7); display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;">
                            <div style="position:absolute; inset:0; background:radial-gradient(circle at 30% 20%, rgba(255,255,255,0.55) 0%, transparent 60%), repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 3px, transparent 3px, transparent 6px); pointer-events:none;"></div>
                            ${render3DCrystalGemSVG(t)}
                        </button>
                    `).join('')}
                </div>

                <button class="btn btn-locked" id="btn-give-up" style="width:100%; font-size:0.85rem; padding:8px 14px; border-radius:12px;">
                    🏳️ Vazgeç & Kapat
                </button>
            </div>
        `;

        lucide.createIcons();

        const pads = container.querySelectorAll(".simon-pad");
        const promptEl = container.querySelector("#rhythm-prompt");
        const hearts = container.querySelectorAll(".heart-icon");
        const progressEl = container.querySelector("#rhythm-progress");

        container.querySelectorAll(".level-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                if (tab.hasAttribute("disabled")) return;
                const next = parseInt(tab.dataset.level);
                if (next === levelNumber) return;
                playSound('click');
                cleanUp();
                startRhythmicMemoryGame(container, next);
            });
        });

        container.querySelector("#btn-give-up").addEventListener("click", () => {
            playSound('locked');
            cleanUp();
            closeModal();
        });

        let countInterval = null;
        let sequenceInterval = null;

        function cleanUp() {
            gameActive = false;
            isShowingSequence = false;
            if (countInterval) clearInterval(countInterval);
            if (sequenceInterval) clearInterval(sequenceInterval);
            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
        }
        window.currentGameCleanup = cleanUp;

        function updateLivesUI() {
            hearts.forEach((heart, idx) => {
                if (idx < lives) {
                    heart.style.fill = "#ef4444";
                    heart.style.color = "#ef4444";
                    heart.style.opacity = "1";
                } else {
                    heart.style.fill = "none";
                    heart.style.color = "var(--text-muted)";
                    heart.style.opacity = "0.3";
                }
            });
        }

        function handlePadClick(id, pad) {
            if (!gameActive || isShowingSequence) return;

            flashPad(pad, id);

            if (id === sequence[playerIndex]) {
                playerIndex++;
                if (playerIndex === sequence.length) {
                    gameActive = false;
                    roundsWon++;
                    if (progressEl) progressEl.innerText = roundsWon;

                    if (roundsWon >= cfg.targetLength) {
                        endGame(true);
                    } else {
                        setTimeout(() => {
                            addNewStep();
                            showSequence();
                        }, 900);
                    }
                }
            } else {
                lives--;
                updateLivesUI();
                playSound('locked');
                
                if (lives <= 0) {
                    endGame(false);
                } else {
                    gameActive = false;
                    promptEl.innerText = "Hata! Tekrar İzle... ✨👀";
                    setTimeout(() => {
                        playerIndex = 0;
                        showSequence();
                    }, 1200);
                }
            }
        }

        pads.forEach(pad => {
            pad.addEventListener("click", () => {
                const id = parseInt(pad.dataset.id);
                handlePadClick(id, pad);
            });
        });

        const CRYSTAL_FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33];

        function playCrystalTone(id) {
            if (!isSoundEnabled) return;
            try {
                initAudio();
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }

                const freq = CRYSTAL_FREQUENCIES[id % CRYSTAL_FREQUENCIES.length] || 440;
                const now = audioCtx.currentTime;

                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);

                const overtone = audioCtx.createOscillator();
                const overtoneGain = audioCtx.createGain();
                overtone.type = 'triangle';
                overtone.frequency.setValueAtTime(freq * 2.0, now);

                osc.connect(gain);
                overtone.connect(overtoneGain);
                gain.connect(audioCtx.destination);
                overtoneGain.connect(audioCtx.destination);

                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

                overtoneGain.gain.setValueAtTime(0.08, now);
                overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

                osc.start(now);
                overtone.start(now);
                osc.stop(now + 0.38);
                overtone.stop(now + 0.38);
            } catch (e) {
                console.log("Crystal tone play error:", e);
            }
        }

        function flashPad(pad, id) {
            const t = SPARKLE_TILES.find(item => item.id === id);
            if (!t || !pad) return;

            playCrystalTone(id);
            pad.style.transform = "translateY(-8px) scale(1.12)";
            pad.style.border = "4px solid #ffffff";
            pad.style.boxShadow = `0 16px 36px ${t.shadow}, 0 0 35px ${t.glow}, inset 0 0 20px rgba(255,255,255,0.95)`;

            setTimeout(() => {
                pad.style.transform = "";
                pad.style.border = `4px solid ${t.border}`;
                pad.style.boxShadow = `0 10px 24px ${t.shadow}, inset 0 3px 6px rgba(255,255,255,0.7)`;
            }, 280);
        }

        function addNewStep() {
            const randomIdx = Math.floor(Math.random() * activeTiles.length);
            sequence.push(activeTiles[randomIdx].id);
        }

        function showSequence() {
            isShowingSequence = true;
            promptEl.innerText = "İZLE VE DİNLE... ✨👂";
            playerIndex = 0;

            let idx = 0;
            sequenceInterval = setInterval(() => {
                if (!isShowingSequence) {
                    clearInterval(sequenceInterval);
                    return;
                }

                if (idx < sequence.length) {
                    const tileId = sequence[idx];
                    const pad = container.querySelector('[data-id="' + tileId + '"]');
                    flashPad(pad, tileId);
                    idx++;
                } else {
                    clearInterval(sequenceInterval);
                    isShowingSequence = false;
                    promptEl.innerText = "ŞİMDİ SEN DENE! 🫵✨";
                    gameActive = true;
                }
            }, cfg.speed + 180);
        }

        function endGame(isWin) {
            gameActive = false;
            cleanUp();
            
            if (isWin) {
                unlockNextLevel(10, levelNumber);
                playSound('win');
                const scoreAwarded = cfg.level * 120 + (lives * 40);
                const starsAwarded = lives === 3 ? 25 : (lives === 2 ? 15 : 10);

                const ach = window.achievementsData;
                ach.userStats.stars += starsAwarded;
                ach.userStats.totalScore += scoreAwarded;
                ach.userStats.completedGames += 1;

                const task1 = ach.dailyTasks.find(t => t.id === 1);
                if (task1 && !task1.completed) {
                    task1.completed = true;
                    ach.userStats.stars += task1.reward;
                }

                const done = ach.dailyTasks.filter(t => t.completed).length;
                ach.userStats.progressPercentage = Math.round((done / ach.dailyTasks.length) * 100);
        if (typeof scoreAwarded !== 'undefined' && window.CURRENT_ACTIVE_GAME_ID) {
            if(window.recordGameScore) window.recordGameScore(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
            if(window.achievementsData && window.achievementsData.addScoreToGame) window.achievementsData.addScoreToGame(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
        }
        if(window.achievementsData && window.achievementsData.saveAchievements) window.achievementsData.saveAchievements();

                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px; font-family:var(--font-main);">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">💎🏆✨</div>
                            <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:${cfg.color}; font-weight:800; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">🌟 3D Kristal Ustası!</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px; font-weight:800; color:var(--color-primary);">Seviye ${levelNumber} Tamamlandı!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                <strong>${cfg.name}</strong> 3D kristal ritmini mükemmel hatırladın!
                            </p>
                            
                            <div style="display:flex; justify-content:center; gap:14px; margin-bottom:22px;">
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-yellow); border:2px solid #D97706; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#D97706;">+${starsAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#78350F;">YILDIZ</div>
                                </div>
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-green); border:2px solid #166534; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#166534;">+${scoreAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#14532D;">PUAN</div>
                                </div>
                            </div>

                            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                                <button class="btn btn-success" id="btn-replay" style="flex:1; min-width:120px; font-weight:800;">🔄 Tekrar Oyna</button>
                                ${levelNumber < 10 ? `<button class="btn btn-primary" id="btn-next-level" style="flex:1; min-width:120px; font-weight:800;">➡️ Seviye ${levelNumber + 1}</button>` : ''}
                                <button class="btn btn-locked" id="btn-finish-win" style="flex:1; min-width:120px; font-weight:700;">✅ Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay").addEventListener("click", () => {
                        playSound('click');
                        startRhythmicMemoryGame(container, levelNumber);
                    });
                    if (levelNumber < 10) {
                        container.querySelector("#btn-next-level").addEventListener("click", () => {
                            playSound('click');
                            startRhythmicMemoryGame(container, levelNumber + 1);
                        });
                    }
                    container.querySelector("#btn-finish-win").addEventListener("click", () => {
                        playSound('click');
                        closeModal();
                        renderAchievements();
                    });
                }, 600);

            } else {
                lockGame(10);
                playSound('fail');
                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px; font-family:var(--font-main);">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:shake 0.5s ease-in-out;">💔💎✨</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px; color:#ef4444; font-weight:800;">Oyun Bitti!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Kristal ritmini karıştırdın. Pes etme, tekrar dene!
                            </p>
                            
                            <div style="display:flex; gap:10px; justify-content:center;">
                                <button class="btn btn-primary" id="btn-replay-fail" style="padding:10px 24px; font-weight:800;">🔄 Tekrar Dene</button>
                                <button class="btn btn-locked" id="btn-close-fail" style="padding:10px 24px; font-weight:700;">❌ Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay-fail").addEventListener("click", () => {
                        playSound('click');
                        startRhythmicMemoryGame(container, levelNumber);
                    });
                    container.querySelector("#btn-close-fail").addEventListener("click", () => {
                        playSound('click');
                        closeModal();
                    });
                }, 600);
            }
        }

        // Başlangıç Dizilimi
        setTimeout(() => {
            addNewStep();
            showSequence();
        }, 800);
    }
    // ============================================================
    // GİZLİ OBJE AVI (OYUN 11) OYUN MOTORU
    // ============================================================
    function startHiddenObjectGame(container, levelNumber) {
        if (window.currentGameCleanup) { window.currentGameCleanup(); window.currentGameCleanup = null; }
        if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }

        const LEVELS = [
            { level: 1, name: "Tanışma Turu", targetEmoji: "🍎", distractors: ["🍓", "🍒", "🍅"], distractorCount: 30, targetCount: 3, speed: 20, color: "#CAFFBF" },
            { level: 2, name: "Kolay Arama", targetEmoji: "🐶", distractors: ["🐱", "🐭", "🐹"], distractorCount: 50, targetCount: 4, speed: 25, color: "#CAFFBF" },
            { level: 3, name: "Dikkatli Gözler", targetEmoji: "🏀", distractors: ["⚾", "🥎", "🏐"], distractorCount: 80, targetCount: 5, speed: 30, color: "#A0C4FF" },
            { level: 4, name: "Kalabalık", targetEmoji: "🌻", distractors: ["🌼", "🌸", "🌺", "🏵️"], distractorCount: 120, targetCount: 5, speed: 35, color: "#A0C4FF" },
            { level: 5, name: "Karışık Zihin", targetEmoji: "🍕", distractors: ["🍔", "🌭", "🌮", "🥪"], distractorCount: 160, targetCount: 6, speed: 40, color: "#FFD6A5" },
            { level: 6, name: "Hız Şart", targetEmoji: "🚗", distractors: ["🚕", "🚙", "🚐", "🚓"], distractorCount: 200, targetCount: 6, speed: 45, color: "#FFD6A5" },
            { level: 7, name: "İkiz Kardeşler", targetEmoji: "🐼", distractors: ["🐨", "🐻", "🐮", "🐷"], distractorCount: 250, targetCount: 7, speed: 50, color: "#D8BBFF" },
            { level: 8, name: "Gölgelerin Gücü", targetEmoji: "🦉", distractors: ["🦅", "🦆", "🦢", "🦜"], distractorCount: 300, targetCount: 7, speed: 55, color: "#D8BBFF" },
            { level: 9, name: "Kaos Başlıyor", targetEmoji: "💎", distractors: ["💍", "👑", "🔮", "🧿"], distractorCount: 350, targetCount: 8, speed: 60, color: "#FFC6FF" },
            { level: 10, name: "Dedektif", targetEmoji: "🦁", distractors: ["🐯", "🐻", "🐱", "🦊", "🐶", "🐺"], distractorCount: 450, targetCount: 1, speed: 60, color: "#FFC6FF" }
        ];

        const cfg = LEVELS[levelNumber - 1];
        let gameActive = true;
        let lives = 3;
        let foundCount = 0;
        let timeElapsed = 0;
        let remainingTime = cfg.speed;
        let countdownTimer = null;

        function cleanUp() {
            gameActive = false;
            if (countdownTimer) clearInterval(countdownTimer);
            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
        }
        window.currentGameCleanup = cleanUp;

        const tabsHTML = LEVELS.map(l => {
            const isUnlocked = isLevelUnlocked(11, l.level);
            return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" style="padding: 4px 8px; font-size: 0.72rem; min-width: 32px; ' + (isUnlocked ? '' : 'opacity:0.5; cursor:not-allowed;') + '" ' + (isUnlocked ? '' : 'disabled') + '>' + (isUnlocked ? l.level : '🔒') + '</button>';
        }).join('');

        container.innerHTML = `
            <div class="hidden-object-game" style="text-align:center; padding:10px 0; user-select:none; display:flex; flex-direction:column; height:480px;">
                <div class="level-tabs" style="display:flex; gap:4px; overflow-x:auto; margin-bottom:10px; padding-bottom:4px; justify-content:start;">
                    ${tabsHTML}
                </div>
                <div class="game-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; background:rgba(0,0,0,0.03); padding:8px 12px; border-radius:12px;">
                    <div style="font-weight:700; color:var(--text-main); font-size:0.85rem;">
                        Seviye ${cfg.level}: <span style="color:var(--color-primary);">${cfg.name}</span>
                    </div>
                    <div class="game-lives" id="ho-lives" style="display:flex; gap:4px;"></div>
                    <div style="font-weight:700; color:var(--text-main); font-size:0.85rem;">
                        Süre: <span id="ho-timer" style="color:#ef4444;">${remainingTime}</span>sn
                    </div>
                </div>
                <div style="font-size:1.1rem; font-weight:800; margin-bottom:8px; color:#166534; background:${cfg.color}; padding:8px; border-radius:12px; border:2px solid #14532D;">
                    Hedef: Hepsini Bul! <span style="font-size:1.5rem; vertical-align:middle; margin-left:10px;">${cfg.targetEmoji}</span> (<span id="ho-progress">0</span>/${cfg.targetCount})
                </div>
                <div id="ho-area" style="position:relative; flex:1; background:linear-gradient(135deg, #f3f4f6, #e5e7eb); border-radius:12px; border:2px solid rgba(0,0,0,0.1); overflow:hidden; box-shadow:inset 0 4px 6px rgba(0,0,0,0.05);">
                </div>
            </div>
        `;

        const area = container.querySelector("#ho-area");
        
        function updateLivesDisplay() {
            const livesEl = container.querySelector("#ho-lives");
            if (!livesEl) return;
            livesEl.innerHTML = "";
            for (let i = 0; i < 3; i++) {
                const heart = document.createElement("i");
                heart.style.width = "16px";
                heart.style.height = "16px";
                heart.setAttribute("data-lucide", "heart");
                if (i < lives) {
                    heart.style.fill = "#ef4444";
                    heart.style.color = "#ef4444";
                } else {
                    heart.style.fill = "none";
                    heart.style.color = "var(--text-muted)";
                    heart.style.opacity = "0.3";
                }
                livesEl.appendChild(heart);
            }
            if (window.lucide) window.lucide.createIcons();
        }

        updateLivesDisplay();

        container.querySelectorAll(".level-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                if (tab.hasAttribute("disabled")) return;
                const next = parseInt(tab.dataset.level);
                if (next === levelNumber) return;
                playSound('click');
                cleanUp();
                startHiddenObjectGame(container, next);
            });
        });

        // Objeleri oluştur
        const objects = [];
        for(let i=0; i<cfg.targetCount; i++) {
            objects.push({ emoji: cfg.targetEmoji, isTarget: true });
        }
        for(let i=0; i<cfg.distractorCount; i++) {
            const randomDistractor = cfg.distractors[Math.floor(Math.random() * cfg.distractors.length)];
            objects.push({ emoji: randomDistractor, isTarget: false });
        }
        
        // Rastgele karıştır
        objects.sort(() => Math.random() - 0.5);

        // Ekran boyutları render olduktan sonra belli olur, küçük bir timeout veriyoruz
        setTimeout(() => {
            if(!gameActive) return;
            const areaW = area.clientWidth;
            const areaH = area.clientHeight;

            objects.forEach((obj) => {
                const el = document.createElement("div");
                el.innerText = obj.emoji;
                el.style.position = "absolute";
                el.style.fontSize = (Math.random() * 0.8 + 1.2) + "rem";
                el.style.cursor = "pointer";
                el.style.transition = "transform 0.2s, opacity 0.3s";
                
                // Rotation
                const rot = Math.random() * 360;
                el.style.transform = `rotate(${rot}deg)`;
                
                // Konum (60px padding/margin payı)
                const left = 20 + Math.random() * (areaW - 70);
                const top = 20 + Math.random() * (areaH - 70);
                el.style.left = left + "px";
                el.style.top = top + "px";
                
                // Hedeflerin üstte kalmasını sağla
                if (obj.isTarget) {
                    el.style.zIndex = "999";
                } else {
                    el.style.zIndex = Math.floor(Math.random() * 100).toString();
                }

                // Tıklama event'i
                el.addEventListener("click", (e) => {
                    if (!gameActive) return;
                    e.stopPropagation();
                    
                    if (obj.isTarget) {
                        playSound('click');
                        el.style.transform = "scale(2)";
                        el.style.opacity = "0";
                        el.style.pointerEvents = "none";
                        foundCount++;
                        document.getElementById("ho-progress").innerText = foundCount;
                        
                        if (foundCount >= cfg.targetCount) {
                            endGame(true);
                        }
                    } else {
                        playSound('locked');
                        lives--;
                        updateLivesDisplay();
                        area.style.animation = "shake 0.3s ease";
                        setTimeout(() => { area.style.animation = ""; }, 300);
                        
                        if (lives <= 0) {
                            endGame(false);
                        }
                    }
                });
                area.appendChild(el);
            });
            
            // Başla
            countdownTimer = setInterval(() => {
                if (!gameActive) return;
                remainingTime--;
                document.getElementById("ho-timer").innerText = remainingTime;
                
                if (remainingTime <= 0) {
                    lives = 0;
                    updateLivesDisplay();
                    endGame(false);
                }
            }, 1000);
            
            activeGameTimer = setInterval(() => {
                if (!gameActive) return;
                timeElapsed++;
            }, 1000);
            
        }, 50);

        function endGame(isWin) {
            cleanUp();
            
            if (isWin) {
                unlockNextLevel(11, levelNumber);
                playSound('success');

                const scoreBase = 70 * levelNumber;
                const scoreAwarded = scoreBase + Math.max(0, remainingTime * 5);
                const starsAwarded = remainingTime > (cfg.speed * 0.6) ? 25 : (remainingTime > (cfg.speed * 0.3) ? 15 : 10);

                const ach = window.achievementsData;
                ach.userStats.stars += starsAwarded;
                ach.userStats.totalScore += scoreAwarded;
                ach.userStats.completedGames += 1;

                const task1 = ach.dailyTasks.find(t => t.id === 1);
                if (task1 && !task1.completed) {
                    task1.completed = true;
                    ach.userStats.stars += task1.reward;
                }

                const done = ach.dailyTasks.filter(t => t.completed).length;
                ach.userStats.progressPercentage = Math.round((done / ach.dailyTasks.length) * 100);
        if (typeof scoreAwarded !== 'undefined' && window.CURRENT_ACTIVE_GAME_ID) {
            if(window.recordGameScore) window.recordGameScore(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
            if(window.achievementsData && window.achievementsData.addScoreToGame) window.achievementsData.addScoreToGame(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
        }
        if(window.achievementsData && window.achievementsData.saveAchievements) window.achievementsData.saveAchievements();

                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">🎯🏆</div>
                            <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:${cfg.color}; font-weight:700; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">🌟 Keskin Gözler!</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px;">Seviye ${levelNumber} Tamamlandı!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Objeleri <strong>${timeElapsed} saniyede</strong> buldun! Kalan Süre: ${remainingTime}
                            </p>
                            
                            <div style="display:flex; justify-content:center; gap:14px; margin-bottom:22px;">
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-yellow); border:2px solid #D97706; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#D97706;">+${starsAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#78350F;">YILDIZ</div>
                                </div>
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-green); border:2px solid #166534; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#166534;">+${scoreAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#14532D;">PUAN</div>
                                </div>
                            </div>

                            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                                <button class="btn btn-success" id="btn-replay" style="flex:1; min-width:120px;">🔄 Tekrar</button>
                                ${levelNumber < 10 ? `<button class="btn btn-primary" id="btn-next-level" style="flex:1; min-width:120px;">➡️ Svy ${levelNumber + 1}</button>` : ''}
                                <button class="btn btn-locked" id="btn-finish-win" style="flex:1; min-width:120px;">✅ Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay").addEventListener("click", () => { playSound('click'); startHiddenObjectGame(container, levelNumber); });
                    if (levelNumber < 10) {
                        container.querySelector("#btn-next-level").addEventListener("click", () => { playSound('click'); startHiddenObjectGame(container, levelNumber + 1); });
                    }
                    container.querySelector("#btn-finish-win").addEventListener("click", () => { playSound('click'); closeModal(); renderAchievements(); });
                }, 400);
            } else {
                lockGame(11);
                playSound('locked');
                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:shake 0.5s ease-in-out;">😢💥</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px; color:#ef4444;">Canlar veya Süre Bitti!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">Görev başarısız oldu. 1 global can kaybettin!</p>
                            <div style="display:flex; gap:10px; justify-content:center;">
                                <button class="btn btn-primary" id="btn-replay-fail" style="padding:10px 24px;">🔄 Tekrar Dene</button>
                                <button class="btn btn-locked" id="btn-close-fail" style="padding:10px 24px;">❌ Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay-fail").addEventListener("click", () => { playSound('click'); startHiddenObjectGame(container, levelNumber); });
                    container.querySelector("#btn-close-fail").addEventListener("click", () => { playSound('click'); closeModal(); });
                }, 400);
            }
        }
    }

    // ============================================================
    // MANTIK KÖPRÜSÜ (OYUN 12) OYUN MOTORU
    // ============================================================
    function startLogicBridgeGame(container, levelNumber) {
        if (window.currentGameCleanup) { window.currentGameCleanup(); window.currentGameCleanup = null; }
        if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }

        const LEVELS = [
            { level: 1, name: "Renk Örüntüsü", q: "🔴 🔵 🔴 🔵 ?", options: ["🔴", "🔵", "🟢", "🟡"], answer: "🔴", speed: 30 },
            { level: 2, name: "Şekil Örüntüsü", q: "⭐ 🌙 ⭐ 🌙 ⭐ ?", options: ["⭐", "☀️", "🌙", "☁️"], answer: "🌙", speed: 30 },
            { level: 3, name: "Sayılar", q: "1, 2, 3, 4, ?", options: ["4", "5", "6", "7"], answer: "5", speed: 30 },
            { level: 4, name: "Çifter Çifter", q: "2, 4, 6, 8, ?", options: ["9", "10", "11", "12"], answer: "10", speed: 30 },
            { level: 5, name: "Meyve Sepeti", q: "🍎 🍌 🍎 🍌 ?", options: ["🍇", "🍎", "🍌", "🍉"], answer: "🍎", speed: 40 },
            { level: 6, name: "Hayvan Eşleştirme", q: "🐶:🦴 | 🐱:🐟 | 🐰:?", options: ["🥕", "🥩", "🍎", "🧀"], answer: "🥕", speed: 40 },
            { level: 7, name: "Geri Sayım", q: "20, 15, 10, ?", options: ["0", "5", "10", "1"], answer: "5", speed: 40 },
            { level: 8, name: "Geometrik", q: "🔺 🟩 ⚪ 🔺 🟩 ?", options: ["🔺", "🟩", "⚪", "⭐"], answer: "⚪", speed: 40 },
            { level: 9, name: "Katlanarak Büyüme", q: "1, 2, 4, 8, ?", options: ["10", "12", "14", "16"], answer: "16", speed: 40 },
            { level: 10, name: "Zihin Fırtınası", q: "A, C, E, G, ?", options: ["H", "I", "J", "K"], answer: "I", speed: 40 }
        ];

        const cfg = LEVELS[levelNumber - 1];
        let gameActive = true;
        let lives = 3;
        let timeElapsed = 0;
        let remainingTime = cfg.speed;
        let countdownTimer = null;

        function cleanUp() {
            gameActive = false;
            if (countdownTimer) clearInterval(countdownTimer);
            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
        }
        window.currentGameCleanup = cleanUp;

        const tabsHTML = LEVELS.map(l => {
            const isUnlocked = isLevelUnlocked(12, l.level);
            return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" style="padding: 4px 8px; font-size: 0.72rem; min-width: 32px; ' + (isUnlocked ? '' : 'opacity:0.5; cursor:not-allowed;') + '" ' + (isUnlocked ? '' : 'disabled') + '>' + (isUnlocked ? l.level : '🔒') + '</button>';
        }).join('');

        // Seçenekleri rastgele karıştırıyoruz (referansı bozmamak için kopyala)
        const opts = [...cfg.options].sort(() => Math.random() - 0.5);

        container.innerHTML = `
            <div class="logic-bridge-game" style="text-align:center; padding:10px 0; user-select:none; display:flex; flex-direction:column; height:480px;">
                <div class="level-tabs" style="display:flex; gap:4px; overflow-x:auto; margin-bottom:10px; padding-bottom:4px; justify-content:start;">
                    ${tabsHTML}
                </div>
                <div class="game-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; background:rgba(0,0,0,0.03); padding:8px 12px; border-radius:12px;">
                    <div style="font-weight:700; color:var(--text-main); font-size:0.85rem;">
                        Seviye ${cfg.level}: <span style="color:var(--color-primary);">${cfg.name}</span>
                    </div>
                    <div class="game-lives" id="lb-lives" style="display:flex; gap:4px;"></div>
                    <div style="font-weight:700; color:var(--text-main); font-size:0.85rem;">
                        Süre: <span id="lb-timer" style="color:#ef4444;">${remainingTime}</span>sn
                    </div>
                </div>
                
                <div style="font-size:1.8rem; font-weight:800; margin-bottom:15px; color:#1e3a8a; background:#bfdbfe; padding:15px; border-radius:12px; border:3px solid #1e40af; letter-spacing: 2px;">
                    ${cfg.q}
                </div>
                
                <div id="lb-scene" style="position:relative; flex:1; background:linear-gradient(to bottom, #7dd3fc, #bae6fd); border-radius:12px; border:2px solid rgba(0,0,0,0.1); overflow:hidden; box-shadow:inset 0 4px 6px rgba(0,0,0,0.05); margin-bottom:15px;">
                    <!-- Nehir -->
                    <div style="position:absolute; bottom:0; left:0; right:0; height:40%; background:linear-gradient(to right, #0284c7, #38bdf8); opacity:0.8;"></div>
                    <!-- Sol Toprak -->
                    <div style="position:absolute; bottom:0; left:0; width:25%; height:55%; background:#a3e635; border-right:4px solid #4d7c0f; border-radius:0 20px 0 0;"></div>
                    <!-- Sağ Toprak -->
                    <div style="position:absolute; bottom:0; right:0; width:25%; height:55%; background:#a3e635; border-left:4px solid #4d7c0f; border-radius:20px 0 0 0;"></div>
                    
                    <!-- Kırık Köprü Sol -->
                    <div style="position:absolute; bottom:40%; left:20%; width:15%; height:10px; background:#8b5a2b; border-radius:5px;"></div>
                    <!-- Kırık Köprü Sağ -->
                    <div style="position:absolute; bottom:40%; right:20%; width:15%; height:10px; background:#8b5a2b; border-radius:5px;"></div>
                    
                    <!-- Ortadaki Eksik Boşluk -->
                    <div id="lb-plank" style="position:absolute; bottom:40%; left:35%; width:30%; height:10px; background:rgba(255,255,255,0.4); border:2px dashed #ffffff; border-radius:5px; transition:all 0.5s;"></div>

                    <!-- Tavşan -->
                    <div id="lb-rabbit" style="position:absolute; bottom:43%; left:10%; font-size:3rem; transition:all 1s cubic-bezier(0.25, 1, 0.5, 1); z-index:10;">🐰</div>
                    <!-- Ödül (Havuç) -->
                    <div id="lb-carrot" style="position:absolute; bottom:43%; right:8%; font-size:3rem; z-index:10;">🥕</div>
                </div>

                <div class="lb-options" style="display:flex; justify-content:center; gap:15px;">
                    ${opts.map((opt, i) => `
                        <button class="btn btn-primary lb-opt-btn" data-val="${opt}" style="font-size:1.5rem; padding:10px 20px; border-radius:12px; background:#f59e0b; border-color:#d97706; color:white; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.1); flex:1; max-width:80px;">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `;

        function updateLivesDisplay() {
            const livesEl = container.querySelector("#lb-lives");
            if (!livesEl) return;
            livesEl.innerHTML = "";
            for (let i = 0; i < 3; i++) {
                const heart = document.createElement("i");
                heart.style.width = "16px";
                heart.style.height = "16px";
                heart.setAttribute("data-lucide", "heart");
                if (i < lives) {
                    heart.style.fill = "#ef4444";
                    heart.style.color = "#ef4444";
                } else {
                    heart.style.fill = "none";
                    heart.style.color = "var(--text-muted)";
                    heart.style.opacity = "0.3";
                }
                livesEl.appendChild(heart);
            }
            if (window.lucide) window.lucide.createIcons();
        }

        updateLivesDisplay();

        container.querySelectorAll(".level-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                if (tab.hasAttribute("disabled")) return;
                const next = parseInt(tab.dataset.level);
                if (next === levelNumber) return;
                playSound('click');
                cleanUp();
                startLogicBridgeGame(container, next);
            });
        });

        // Oyunu başlat
        countdownTimer = setInterval(() => {
            if (!gameActive) return;
            remainingTime--;
            document.getElementById("lb-timer").innerText = remainingTime;
            
            if (remainingTime <= 0) {
                lives = 0;
                updateLivesDisplay();
                endGame(false);
            }
        }, 1000);
        
        activeGameTimer = setInterval(() => {
            if (!gameActive) return;
            timeElapsed++;
        }, 1000);

        let processing = false;
        container.querySelectorAll(".lb-opt-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                if (!gameActive || processing) return;
                const val = btn.getAttribute("data-val");
                
                if (val === cfg.answer) {
                    processing = true;
                    gameActive = false; // Süreyi durdur
                    playSound('success');
                    
                    // Köprüyü tamamla
                    const plank = document.getElementById("lb-plank");
                    plank.style.background = "#8b5a2b";
                    plank.style.border = "none";
                    plank.innerHTML = `<div style="text-align:center; color:white; font-size:1rem; line-height:10px; font-weight:bold;">${val}</div>`;
                    
                    // Tavşanı zıplat
                    const rabbit = document.getElementById("lb-rabbit");
                    setTimeout(() => {
                        rabbit.style.left = "45%";
                        rabbit.style.bottom = "50%"; // Havadayken
                    }, 200);
                    setTimeout(() => {
                        rabbit.style.left = "75%";
                        rabbit.style.bottom = "43%"; // Karşıya geçti
                        document.getElementById("lb-carrot").style.opacity = "0"; // Havucu yedi
                        rabbit.innerText = "🐰😋";
                    }, 700);

                    setTimeout(() => {
                        endGame(true);
                    }, 1500);

                } else {
                    playSound('locked');
                    lives--;
                    updateLivesDisplay();
                    
                    // Butonu kırmızı yap ve titret
                    btn.style.background = "#ef4444";
                    btn.style.borderColor = "#b91c1c";
                    btn.style.animation = "shake 0.3s ease";
                    setTimeout(() => { btn.style.animation = ""; }, 300);
                    
                    if (lives <= 0) {
                        processing = true;
                        // Tavşan düşme efekti
                        const rabbit = document.getElementById("lb-rabbit");
                        rabbit.innerText = "🐰💦";
                        rabbit.style.left = "40%";
                        rabbit.style.bottom = "10%";
                        rabbit.style.transform = "rotate(180deg)";
                        setTimeout(() => { endGame(false); }, 1000);
                    }
                }
            });
        });

        function endGame(isWin) {
            cleanUp();
            
            if (isWin) {
                unlockNextLevel(12, levelNumber);
                playSound('success');

                const scoreBase = 80 * levelNumber;
                const scoreAwarded = scoreBase + Math.max(0, remainingTime * 5);
                const starsAwarded = remainingTime > (cfg.speed * 0.6) ? 25 : (remainingTime > (cfg.speed * 0.3) ? 15 : 10);

                const ach = window.achievementsData;
                ach.userStats.stars += starsAwarded;
                ach.userStats.totalScore += scoreAwarded;
                ach.userStats.completedGames += 1;

                const done = ach.dailyTasks.filter(t => t.completed).length;
                ach.userStats.progressPercentage = Math.round((done / ach.dailyTasks.length) * 100);
        if (typeof scoreAwarded !== 'undefined' && window.CURRENT_ACTIVE_GAME_ID) {
            if(window.recordGameScore) window.recordGameScore(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
            if(window.achievementsData && window.achievementsData.addScoreToGame) window.achievementsData.addScoreToGame(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
        }
        if(window.achievementsData && window.achievementsData.saveAchievements) window.achievementsData.saveAchievements();

                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">🧠🌉</div>
                            <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:#D8BBFF; font-weight:700; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">🌟 Harika Zeka!</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px;">Seviye ${levelNumber} Tamamlandı!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Örüntüyü <strong>${timeElapsed} saniyede</strong> çözdün!
                            </p>
                            
                            <div style="display:flex; justify-content:center; gap:14px; margin-bottom:22px;">
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-yellow); border:2px solid #D97706; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#D97706;">+${starsAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#78350F;">YILDIZ</div>
                                </div>
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-green); border:2px solid #166534; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#166534;">+${scoreAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#14532D;">PUAN</div>
                                </div>
                            </div>

                            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                                <button class="btn btn-success" id="btn-replay" style="flex:1; min-width:120px;">🔄 Tekrar</button>
                                ${levelNumber < 10 ? `<button class="btn btn-primary" id="btn-next-level" style="flex:1; min-width:120px;">➡️ Svy ${levelNumber + 1}</button>` : ''}
                                <button class="btn btn-locked" id="btn-finish-win" style="flex:1; min-width:120px;">✅ Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay").addEventListener("click", () => { playSound('click'); startLogicBridgeGame(container, levelNumber); });
                    if (levelNumber < 10) {
                        container.querySelector("#btn-next-level").addEventListener("click", () => { playSound('click'); startLogicBridgeGame(container, levelNumber + 1); });
                    }
                    container.querySelector("#btn-finish-win").addEventListener("click", () => { playSound('click'); closeModal(); renderAchievements(); });
                }, 400);
            } else {
                lockGame(12);
                playSound('locked');
                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:shake 0.5s ease-in-out;">😢💦</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px; color:#ef4444;">Canlar veya Süre Bitti!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">Tavşan suya düştü. 1 global can kaybettin!</p>
                            <div style="display:flex; gap:10px; justify-content:center;">
                                <button class="btn btn-primary" id="btn-replay-fail" style="padding:10px 24px;">🔄 Tekrar Dene</button>
                                <button class="btn btn-locked" id="btn-close-fail" style="padding:10px 24px;">❌ Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay-fail").addEventListener("click", () => { playSound('click'); startLogicBridgeGame(container, levelNumber); });
                    container.querySelector("#btn-close-fail").addEventListener("click", () => { playSound('click'); closeModal(); });
                }, 400);
            }
        }
    }

    // 14. Genel Modal Penceresi Kontrolü (Modal Utility Functions)
    function showModal(title, bodyHTML) {
        if (window.currentGameCleanup) {
            window.currentGameCleanup();
            window.currentGameCleanup = null;
        }
        modalTitle.innerText = title;
        modalBody.innerHTML = bodyHTML;
        modalOverlay.classList.add("active");
        body.style.overflow = "hidden"; // Scroll engelleme
    }

    function closeModal() {
        modalOverlay.classList.remove("active");
        body.style.overflow = ""; // Scroll serbest
        
        // Aktif oyun süre sayacını durdur
        if (activeGameTimer) {
            clearInterval(activeGameTimer);
            activeGameTimer = null;
        }

        if (window.currentGameCleanup) {
            window.currentGameCleanup();
            window.currentGameCleanup = null;
        }

        // 300ms sonra (transition bitince) modalı temizleme
        setTimeout(() => {
            modalBody.innerHTML = "";
        }, 300);
    }

    btnCloseModal.addEventListener("click", () => {
        playSound('click');
        closeModal();
    });

    // Dışarı tıklama ile modal kapatma
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            playSound('click');
            closeModal();
        }
    });

    // Klavye ESC tuşu ile kapatma
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
            playSound('click');
            closeModal();
        }
    });

    // 15. Uygulama Başlatma Adımları (Initialize Application)
    createBackgroundParticles();
    renderCategories();
    filterAndRenderGames();
    renderAchievements();
    updatePlayerProfileUI();

    // İlk Girişte İsim ve Karakter Seçim Ekranı Açılışı
    if (!localStorage.getItem('user_profile_setup')) {
        setTimeout(() => {
            openAvatarSelectionModal(true);
        }, 500);
    }

    // Kategori Linkleri (Footer)
    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const cat = link.getAttribute('data-category');
            activeCategory = cat;
            
            renderCategories(); 
            filterAndRenderGames();
        });
    });

    // Destek & Bilgi Linkleri (Footer)
    const infoLinks = document.querySelectorAll('.info-link');
    infoLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const infoType = link.getAttribute('data-info');
            openInfoModal(infoType);
        });
    });

    function openInfoModal(type) {
        let title = "";
        let content = "";
        
        switch(type) {
            case 'sss':
                title = "Sıkça Sorulan Sorular";
                content = "<div style='padding:15px;'><p style='margin-bottom:20px; font-size:1.05rem; color:var(--text-main); line-height:1.5; font-weight:500;'>Aklınıza takılan soruların yanıtlarını sizin için aşağıda derledik. Daha fazlası için iletişim bölümünden bize ulaşabilirsiniz.</p><h4 style='color:#6366f1; margin-bottom:5px;'>1. Oyunlar ücretli mi?</h4><p style='margin-bottom:15px; color:var(--text-muted);'>Hayır, MİNİKİO platformundaki tüm oyunlar tamamen ücretsizdir.</p><h4 style='color:#6366f1; margin-bottom:5px;'>2. Nasıl yıldız kazanırım?</h4><p style='margin-bottom:15px; color:var(--text-muted);'>Oyunları tamamlayarak ve günlük görevleri yerine getirerek yıldız ve puan kazanabilirsiniz.</p><h4 style='color:#6366f1; margin-bottom:5px;'>3. İlerlemem nasıl kaydediliyor?</h4><p style='color:var(--text-muted);'>İlerlemeniz ve topladığınız yıldızlar tarayıcınızın hafızasında güvenle saklanmaktadır.</p></div>";
                break;
            case 'terms':
                title = "Kullanım Şartları";
                content = "<div style='padding:15px;'><p style='margin-bottom:10px; color:var(--text-muted);'>MİNİKİO'yu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız:</p><ul style='list-style:disc; margin-left:20px; color:var(--text-muted); line-height:1.6;'><li>MİNİKİO'daki tüm grafikler ve oyun kodları platforma aittir, kopyalanamaz.</li><li>Platform tamamen eğitsel amaçlıdır.</li><li>Kullanıcılar birbirleriyle rekabet ederken platformun kurallarına uymak zorundadır.</li></ul></div>";
                break;
            case 'privacy':
                title = "Gizlilik Politikası";
                content = "<div style='padding:15px;'><p style='color:var(--text-muted); line-height:1.6;'>MİNİKİO olarak gizliliğinize büyük önem veriyoruz. Herhangi bir kişisel verinizi toplamıyor, saklamıyor veya üçüncü şahıslarla paylaşmıyoruz. Tüm ilerlemeniz ve başarı rozetleriniz sadece sizin cihazınızda (tarayıcı belleğinde) yerel olarak saklanmaktadır.</p></div>";
                break;
            case 'contact':
                title = "İletişim";
                content = "<div style='padding:15px; text-align:center;'><div style='font-size:3rem; margin-bottom:10px;'>💌</div><p style='color:var(--text-muted); line-height:1.6; margin-bottom:15px;'>Soru, görüş ve önerileriniz için bizimle dilediğiniz zaman iletişime geçebilirsiniz.</p><p style='font-weight:bold; font-size:1.1rem; color:#6366f1;'>E-Posta: destek@zekadiyari.com</p></div>";
                break;
        }
        
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        
        modalOverlay.style.display = "flex";
        requestAnimationFrame(() => {
            modalOverlay.style.opacity = "1";
        });
    }

    // Gerçek zamanlı UI güncellemesi
    window.addEventListener('achievementsUpdated', () => {
        if (typeof activeCategory !== 'undefined') {
            if (activeCategory === 'ACHIEVEMENTS' && typeof renderAchievementsCategoryView === 'function') {
                renderAchievementsCategoryView();
            } else if (activeCategory === 'LEADERBOARD' && typeof renderLeaderboardDashboard === 'function') {
                renderLeaderboardDashboard();
            }
        }
        if (typeof updateChampionBanner === 'function') {
            updateChampionBanner();
        }
    });
});
