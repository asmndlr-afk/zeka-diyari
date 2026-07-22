// Ana Uygulama Mantığı (App Logic)

document.addEventListener("DOMContentLoaded", () => {
    // Profil Avatarını Yükleme (Restore Avatar)
    const savedAvatar = localStorage.getItem('selectedAvatar') || 'assets/images/kids_avatar.jpg';
    document.querySelectorAll('.nav-avatar-btn img').forEach(img => img.src = savedAvatar);

    // 1. Durum Yönetimi (State Management)
    let isSoundEnabled = true;
    let activeCategory = null;
    let searchQuery = "";
    let audioCtx = null;
    let activeGameTimer = null; // Aktif oyun süre sayacı
    // Global Can (Hearts) Durumu
    // Oyun Bazlı Can (Hearts) Durumu
    function getGameHeartsState(gameId) {
        const allStates = JSON.parse(localStorage.getItem("zeka_diyari_game_hearts") || "{}");
        return allStates[gameId] || { lockedUntil: 0 };
    }

    function saveGameHeartsState(gameId, state) {
        const allStates = JSON.parse(localStorage.getItem("zeka_diyari_game_hearts") || "{}");
        allStates[gameId] = state;
        localStorage.setItem("zeka_diyari_game_hearts", JSON.stringify(allStates));
    }

    function lockGame(gameId) {
        saveGameHeartsState(gameId, { lockedUntil: Date.now() + 5 * 60 * 1000 });
    }

    function isLevelUnlocked(gameId, level) {
        if (level === 1) return true;
        const maxUnlocked = parseInt(localStorage.getItem(`zeka_diyari_game_${gameId}_max_unlocked`) || "1");
        return level <= maxUnlocked;
    }

    function unlockNextLevel(gameId, currentLevel) {
        const nextLevel = currentLevel + 1;
        const currentMax = parseInt(localStorage.getItem(`zeka_diyari_game_${gameId}_max_unlocked`) || "1");
        if (nextLevel > currentMax) {
            localStorage.setItem(`zeka_diyari_game_${gameId}_max_unlocked`, nextLevel);
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
    btnStart.addEventListener("click", () => {
        initAudio();
        playSound('success');
        splashScreen.classList.add("fade-out");
        
        // Splash bittikten sonra DOM'dan gizleyelim
        setTimeout(() => {
            splashScreen.style.display = "none";
        }, 800);
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

    // 8.5 Profil Avatarı Özelleştirme (Avatar Customization)
    const navAvatarBtn = document.querySelector(".nav-avatar-btn");
    if (navAvatarBtn) {
        navAvatarBtn.addEventListener("click", () => {
            playSound('click');
            openAvatarSelectionModal();
        });
    }

    function openAvatarSelectionModal() {
        const avatars = [
            { name: "Panda (Varsayılan)", path: "assets/images/kids_avatar.jpg" },
            { name: "Sevimli Panda", path: "assets/images/avatars/panda.png" },
            { name: "Sevimli Kedi", path: "assets/images/avatars/cat.png" },
            { name: "Sevimli Köpek", path: "assets/images/avatars/dog.png" },
            { name: "Sevimli Tavşan", path: "assets/images/avatars/rabbit.png" }
        ];
        
        let avatarsHTML = `
            <div class="avatar-selection-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 15px; padding: 15px 0;">
        `;
        
        const currentAvatar = localStorage.getItem('selectedAvatar') || 'assets/images/kids_avatar.jpg';
        
        avatars.forEach(av => {
            const isSelected = av.path === currentAvatar;
            avatarsHTML += `
                <div class="avatar-option-card" data-path="${av.path}" style="border: 3px solid ${isSelected ? 'var(--pastel-purple)' : 'transparent'}; background: var(--bg-card); border-radius: 20px; padding: 10px; text-align: center; cursor: pointer; transition: all 0.2s ease; box-shadow: var(--shadow-small);">
                    <img src="${av.path}" alt="${av.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--text-muted); margin-bottom: 8px;">
                    <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">${av.name}</div>
                </div>
            `;
        });
        
        avatarsHTML += `</div>`;
        
        showModal("Profil Karakterini Seç", avatarsHTML);
        
        // Dinamik tıklama ve hover dinleyicileri
        const options = document.querySelectorAll(".avatar-option-card");
        options.forEach(opt => {
            opt.addEventListener("click", () => {
                const selectedPath = opt.getAttribute("data-path");
                localStorage.setItem('selectedAvatar', selectedPath);
                document.querySelectorAll('.nav-avatar-btn img').forEach(img => img.src = selectedPath);
                playSound('success');
                closeModal();
            });
            opt.addEventListener("mouseenter", () => {
                opt.style.transform = "scale(1.05)";
            });
            opt.addEventListener("mouseleave", () => {
                opt.style.transform = "scale(1)";
            });
        });
    }

    // 9. Kategorileri Render Etme (Render Categories)
    function renderCategories() {
        categoriesContainer.innerHTML = "";
        
        // Kategorileri döngüyle ekleme
        const categoriesList = Object.keys(window.categoriesConfig);
        
        // "Tümü" seçeneği
        const allCard = document.createElement("div");
        allCard.className = "category-card glass active";
        allCard.style.setProperty("--accent-color", "var(--pastel-blue)");
        allCard.innerHTML = `
            <div class="category-icon-wrapper">
                <i data-lucide="layout-grid"></i>
            </div>
            <div class="category-title">Tüm Oyunlar</div>
            <div class="category-count">100 Oyun</div>
        `;
        allCard.addEventListener("click", () => {
            selectCategory(null, allCard);
        });
        categoriesContainer.appendChild(allCard);

        categoriesList.forEach(cat => {
            const config = window.categoriesConfig[cat];
            const card = document.createElement("div");
            card.className = "category-card glass";
            card.style.setProperty("--accent-color", config.color);
            
            // Bu kategoride kaç oyun var bulalım
            const count = window.gamesData.filter(g => g.category === cat).length;

            card.innerHTML = `
                <div class="category-icon-wrapper">
                    <i data-lucide="${config.icon}"></i>
                </div>
                <div class="category-title">${cat}</div>
                <div class="category-count">${count} Oyun</div>
            `;
            
            card.addEventListener("click", () => {
                selectCategory(cat, card);
            });
            
            categoriesContainer.appendChild(card);
        });
        
        lucide.createIcons();
    }

    function selectCategory(categoryName, cardElement) {
        playSound('click');
        // Aktif sınıfını düzenleme
        document.querySelectorAll(".category-card").forEach(c => c.classList.remove("active"));
        cardElement.classList.add("active");
        
        activeCategory = categoryName;
        filterAndRenderGames();
    }

    // 10. Oyunları Render Etme (Render 100 Games Grid)
    function filterAndRenderGames() {
        gamesGrid.innerHTML = "";
        
        // Filtreleme
        const filteredGames = window.gamesData.filter(game => {
            const matchesCategory = activeCategory ? game.category === activeCategory : true;
            const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  game.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  game.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCategory && matchesSearch;
        });

        if (filteredGames.length === 0) {
            gamesGrid.innerHTML = `
                <div class="no-results glass" style="grid-column: 1 / -1; padding: 40px; text-align: center; border-radius: var(--radius-md);">
                    <i data-lucide="frown" style="width: 48px; height: 48px; margin: 0 auto 15px; color: var(--text-muted);"></i>
                    <h3>Aradığın oyunu bulamadık!</h3>
                    <p style="color: var(--text-muted); margin-top: 10px;">Farklı bir kelimeyle aramayı dene veya diğer kategorilere göz at.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        filteredGames.forEach(game => {
            const card = document.createElement("div");
            card.className = `game-card glass ${game.locked ? 'locked' : ''}`;
            
            // Kilit durumuna göre badge ve buton yapısı
            let ribbonHTML = "";
            let btnHTML = "";
            let imageHTML = "";
            
            if (game.locked) {
                ribbonHTML = `<div class="ribbon-locked">Çok Yakında</div>`;
                btnHTML = `<button class="btn btn-locked game-play-btn" data-id="${game.id}">Yakında</button>`;
                // Locked oyunlar için sevimli bir pastel gradyan kapak
                imageHTML = `<div class="game-card-img" style="background: linear-gradient(135deg, ${game.color}50 0%, ${game.color} 100%); display:flex; align-items:center; justify-content:center; height: 100%; width: 100%;">
                                <div style="font-size: 3rem; opacity: 0.25;">✨</div>
                             </div>`;
            } else {
                ribbonHTML = `<div class="game-card-badge" style="background: var(--pastel-green);">Yeni Oyun</div>`;
                btnHTML = `<button class="btn btn-success game-play-btn" data-id="${game.id}">Oyna</button>`;
                imageHTML = `<img src="${game.image}" alt="${game.name}" class="game-card-img">`;
            }

            // Beceri etiketleri
            const skillsHTML = game.skills.map(s => `<span class="skill-tag">${s}</span>`).join('');

            card.innerHTML = `
                <div class="game-card-img-wrapper">
                    ${imageHTML}
                    ${ribbonHTML}
                    <div class="game-card-difficulty">${game.difficulty}</div>
                    ${game.locked ? `<div class="lock-overlay"><i data-lucide="lock"></i></div>` : ''}
                </div>
                <div class="game-card-content">
                    <h3 class="game-card-title">${game.name}</h3>
                    <div class="game-card-meta">
                        <span class="meta-item">${game.category}</span>
                        <span class="meta-item">${game.age}</span>
                    </div>
                    <p class="game-card-desc">${game.desc}</p>
                    <div class="game-card-skills">
                        ${skillsHTML}
                    </div>
                    ${btnHTML}
                </div>
            `;
            
            // Oyna / Yakında Buton Etkileşimi
            const btnPlay = card.querySelector(".game-play-btn");
            btnPlay.addEventListener("click", () => {
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

    // 12. İlerleme ve Başarıları Render Etme (Render Achievements)
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
            }
        }, 2200);
    }

    // ============================================================
    // HAFIZA OYUNU ANA MOTORU — 5 SEVİYE, SIFIR MANTIK HATASI
    // ============================================================
    function startMemoryGame(container, levelNumber) {
        const LEVELS = [
            { level: 1, name: "Başlangıç", emoji: "⭐", pairs: 3, cols: 3, gridClass: "cols-3", timeBonus: [15, 20, 25], scoreBase: 50, color: "#CAFFBF", pool: ["🐼","🦊","🦁","🐰","🐵","🐸","🐧","🦄","🐙"] },
            { level: 2, name: "Minik Patiler", emoji: "🐾", pairs: 4, cols: 4, gridClass: "cols-4", timeBonus: [18, 25, 30], scoreBase: 70, color: "#CAFFBF", pool: ["🐼","🦊","🦁","🐰","🐵","🐸","🐧","🦄","🐙"] },
            { level: 3, name: "Kolay", emoji: "🌟", pairs: 6, cols: 4, gridClass: "cols-4", timeBonus: [20, 30, 40], scoreBase: 100, color: "#A0C4FF", pool: ["🐼","🦊","🦁","🐰","🐵","🐸","🐧","🦄","🐙","🦋","🦀","🐬"] },
            { level: 4, name: "Dikkatli Gözler", emoji: "👀", pairs: 8, cols: 4, gridClass: "cols-4", timeBonus: [25, 40, 55], scoreBase: 150, color: "#A0C4FF", pool: ["🐼","🦊","🦁","🐰","🐵","🐸","🐧","🦄","🐙","🦋","🦀","🐬"] },
            { level: 5, name: "Orta", emoji: "🏆", pairs: 10, cols: 5, gridClass: "cols-5", timeBonus: [30, 50, 70], scoreBase: 200, color: "#FFD6A5", pool: ["🐼","🦊","🦁","🐰","🐵","🐸","🐧","🦄","🐙","🦋","🦀","🐬","🦉","🐺","🦓","🐘","🦒","🦚","🦜","🐊"] },
            { level: 6, name: "Zihin Egzersizi", emoji: "🧠", pairs: 10, cols: 5, gridClass: "cols-5", timeBonus: [35, 60, 85], scoreBase: 250, color: "#FFD6A5", pool: ["🐼","🦊","🦁","🐰","🐵","🐸","🐧","🦄","🐙","🦋","🦀","🐬","🦉","🐺","🦓","🐘","🦒","🦚","🦜","🐊"] },
            { level: 7, name: "Zor", emoji: "🔥", pairs: 12, cols: 6, gridClass: "cols-6", timeBonus: [40, 70, 100], scoreBase: 300, color: "#D8BBFF", pool: ["🐼","🦊","🦁","🐰","🐵","🐸","🐧","🦄","🐙","🦋","🦀","🐬","🦉","🐺","🦓","🐘","🦒","🦚","🦜","🐊","🦈","🦭","🐿","🦩"] },
            { level: 8, name: "Hafıza Ustası", emoji: "🎖️", pairs: 12, cols: 6, gridClass: "cols-6", timeBonus: [45, 80, 115], scoreBase: 350, color: "#D8BBFF", pool: ["🐼","🦊","🦁","🐰","🐵","🐸","🐧","🦄","🐙","🦋","🦀","🐬","🦉","🐺","🦓","🐘","🦒","🦚","🦜","🐊","🦈","🦭","🐿","🦩"] },
            { level: 9, name: "Efsane", emoji: "👑", pairs: 15, cols: 6, gridClass: "cols-6", timeBonus: [50, 100, 150], scoreBase: 500, color: "#FFADAD", pool: ["🐼","🦊","🦁","🐰","🐵","🐸","🐧","🦄","🐙","🦋","🦀","🐬","🦉","🐺","🦓","🐘","🦒","🦚","🦜","🐊","🦈","🦭","🐿","🦩","🦏","🦛","🐆","🦬","🐂","🦤"] },
            { level: 10, name: "Zeka Diyarı Kralı", emoji: "🔮", pairs: 18, cols: 6, gridClass: "cols-6", timeBonus: [60, 120, 180], scoreBase: 700, color: "#FFADAD", pool: ["🐼","🦊","🦁","🐰","🐵","🐸","🐧","🦄","🐙","🦋","🦀","🐬","🦉","🐺","🦓","🐘","🦒","🦚","🦜","🐊","🦈","🦭","🐿","🦩","🦏","🦛","🐆","🦬","🐂","🦤","🍎","🍌","🍒","🍇","🍉","🍊"] }
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
                    <div class="memory-card-back">❓</div>
                    <div class="memory-card-front">${emoji}</div>
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

        if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
        activeGameTimer = setInterval(() => {
            timeElapsed++;
            const el = document.getElementById("game-timer");
            if (el) el.innerText = timeElapsed;
            else { clearInterval(activeGameTimer); activeGameTimer = null; }
        }, 1000);
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
            
            balloon.innerHTML = `
                <svg class="balloon-svg-element" viewBox="0 0 50 70" style="width:100%; height:100%; filter: drop-shadow(0 5px 8px rgba(0,0,0,0.15)); transition: transform 0.1s ease;">
                    <path d="M25,0 C11,0 0,11 0,25 C0,39 15,50 25,55 C35,50 50,39 50,25 C50,11 39,0 25,0 Z" fill="${selectedColor.hex}" />
                    <ellipse cx="15" cy="15" rx="4" ry="7" fill="#FFFFFF" opacity="0.4" transform="rotate(-30 15 15)" />
                    <path d="M25,55 L22,60 L28,60 Z" fill="${selectedColor.hex}" />
                    <path d="M25,60 C25,64 22,67 25,72" fill="none" stroke="#CBD5E1" stroke-width="2" />
                </svg>
            `;

            balloon.addEventListener("mousedown", (e) => {
                e.stopPropagation();
                popBalloon(balloon, selectedColor.name);
            });
            balloon.addEventListener("touchstart", (e) => {
                e.stopPropagation();
                e.preventDefault();
                popBalloon(balloon, selectedColor.name);
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
                <div class="math-answers" id="math-answers"></div>
                <button class="btn btn-locked" id="btn-give-up" style="width:100%; font-size:0.82rem;">
                    🏳️ Vazgeç & Kapat
                </button>
            </div>
        `;

        lucide.createIcons();
        updateLivesDisplay();

        container.querySelectorAll(".level-tab").forEach(tab => {
            tab.addEventListener("click", () => {
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
            { level: 1, name: "Sevimli Ev", emoji: "🏠", targetCorrect: 3, scoreBase: 50, color: "#CAFFBF", words: [{ word: "KEDİ", clue: "Miyav diyen tüylü evcil dostumuz" }, { word: "KUŞ", clue: "Göklerde uçan, cik cik ötüşen dostumuz" }, { word: "SÜT", clue: "Kemiklerimizi güçlendiren yararlı beyaz içecek" }] },
            { level: 2, name: "Tatlı Bahçe", emoji: "🌸", targetCorrect: 3, scoreBase: 70, color: "#CAFFBF", words: [{ word: "ARILAR", clue: "Çiçekten çiçeğe uçup bal yapan vızvızlar" }, { word: "GÜL", clue: "Mis kokulu sevimli bahçe çiçeği" }, { word: "AĞAÇ", clue: "Yeşil yapraklı gölge dostumuz" }] },
            { level: 3, name: "Doğa Gezisi", emoji: "🌲", targetCorrect: 3, scoreBase: 100, color: "#A0C4FF", words: [{ word: "ELMA", clue: "Kırmızı veya yeşil renkli vitaminli ağaç meyvesi" }, { word: "BULUT", clue: "Mavi gökyüzünde süzülen beyaz pamuksu yapılar" }, { word: "KUZU", clue: "Koyunların sevimli, beyaz ve tüylü yavrusu" }] },
            { level: 4, name: "Şirin Dere", emoji: "💧", targetCorrect: 3, scoreBase: 120, color: "#A0C4FF", words: [{ word: "BALIK", clue: "Derelerde pullarıyla yüzen sevimli dostumuz" }, { word: "ÖRDEK", clue: "Suda vak vak diye yüzen sarı gagalı dost" }, { word: "KAPLUMBAĞA", clue: "Evini sırtında taşıyan yavaş yürüyen dost" }] },
            { level: 5, name: "Gökyüzü", emoji: "🌤️", targetCorrect: 3, scoreBase: 150, color: "#FDFFB6", words: [{ word: "GÜNEŞ", clue: "Gündüzleri dünyamızı aydınlatan ve ısıtan yıldız" }, { word: "YILDIZ", clue: "Geceleri gökyüzünde ışıl ışıl parıldayan noktalar" }, { word: "ROKET", clue: "Uzay boşluğuna fırlatılan çok hızlı hava taşıtı" }] },
            { level: 6, name: "Gizemli Gece", emoji: "🌙", targetCorrect: 3, scoreBase: 180, color: "#FDFFB6", words: [{ word: "AYDEDE", clue: "Geceleri gökte gülümseyen parlak tepsi" }, { word: "Fener", clue: "Karanlığı aydınlatan taşınabilir ışık" }, { word: "BAYKUŞ", clue: "Geceleri uyanık durup hu hu diyen kuş" }] },
            { level: 7, name: "Deniz Altı", emoji: "🐙", targetCorrect: 3, scoreBase: 250, color: "#D8BBFF", words: [{ word: "DENİZ", clue: "Ucu bucağı görünmeyen çok büyük tuzlu su kütlesi" }, { word: "YENGEÇ", clue: "Kıskaçları olan ve yan yan yürüyen deniz kabuklusu" }, { word: "KUMSAL", clue: "Deniz kıyısındaki sıcacık, sarı kumlu alan" }] },
            { level: 8, name: "Okyanus Kaşifi", emoji: "🐳", targetCorrect: 3, scoreBase: 300, color: "#D8BBFF", words: [{ word: "YUNUS", clue: "Okyanusta neşeyle zıplayan sevimli memeli dost" }, { word: "KÖPEKBALIĞI", clue: "Keskin dişleri olan hızlı yüzücü deniz canlısı" }, { word: "MERCAN", clue: "Denizin altındaki renkli kayalık bitkiler" }] },
            { level: 9, name: "Uzay Yolu", emoji: "🪐", targetCorrect: 3, scoreBase: 400, color: "#FFADAD", words: [{ word: "GEZEGEN", clue: "Uzayda bir yıldızın etrafında dönen yuvarlak gökcismi" }, { word: "ASTRONOT", clue: "Uzay giysileri giyerek uzayda araştırmalar yapan kaşif" }, { word: "UYDU", clue: "Gezegenlerin çevresinde dönen veya uzaya yollanan araç" }] },
            { level: 10, name: "Zeka Galaksisi", emoji: "🛸", targetCorrect: 3, scoreBase: 600, color: "#FFC6FF", words: [{ word: "TELESKOP", clue: "Uzaktaki yıldızları yakınlaştıran büyülü mercekli boru" }, { word: "KUYRUKLUYILDIZ", clue: "Uzayda arkasında ışıklı iz bırakarak kayan buz kütlesi" }, { word: "KARADELİK", clue: "Her şeyi içine çeken uzaydaki gizemli boşluk" }] }
        ];

        const cfg = LEVELS[levelNumber - 1];

        let correctWordsCount = 0;
        let lives = 3;
        let incorrectGuesses = 0;
        let gameTime = 0;
        
        let currentWordObj = null;
        let spellingProgress = "";
        let usedWordIndices = [];

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
            for (let i = 0; i < cfg.words.length; i++) {
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
            currentWordObj = cfg.words[chosenIdx];
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
        if (activeGameTimer) {
            clearInterval(activeGameTimer);
        }

        const LEVELS = [
            { level: 1, name: "Başlangıç", emoji: "⭐", targetScore: 10, speed: 1300, scoreBase: 50, color: "#CAFFBF", animals: ["🐼", "🐨", "🐸"] },
            { level: 2, name: "Minik Adımlar", emoji: "🌱", targetScore: 11, speed: 1200, scoreBase: 70, color: "#CAFFBF", animals: ["🐼", "🐨", "🐸", "🐱"] },
            { level: 3, name: "Kolay", emoji: "🌟", targetScore: 12, speed: 1100, scoreBase: 100, color: "#A0C4FF", animals: ["🐼", "🐨", "🐸", "🐱", "🐶"] },
            { level: 4, name: "Dikkatli Parmaklar", emoji: "⚡", targetScore: 13, speed: 1000, scoreBase: 120, color: "#A0C4FF", animals: ["🐼", "🐨", "🐸", "🐱", "🐶"] },
            { level: 5, name: "Orta", emoji: "🏆", targetScore: 15, speed: 900, scoreBase: 150, color: "#FFD6A5", animals: ["🐼", "🐨", "🐸", "🐱", "🐶", "🦊", "🦁"] },
            { level: 6, name: "Refleks Okulu", emoji: "🎒", targetScore: 16, speed: 850, scoreBase: 180, color: "#FFD6A5", animals: ["🐼", "🐨", "🐸", "🐱", "🐶", "🦊", "🦁"] },
            { level: 7, name: "Zor", emoji: "🔥", targetScore: 18, speed: 750, scoreBase: 200, color: "#D8BBFF", animals: ["🐼", "🐨", "🐸", "🐱", "🐶", "🦊", "🦁", "🐰", "🐵"] },
            { level: 8, name: "Şimşek Hızı", emoji: "⚡", targetScore: 19, speed: 700, scoreBase: 250, color: "#D8BBFF", animals: ["🐼", "🐨", "🐸", "🐱", "🐶", "🦊", "🦁", "🐰", "🐵"] },
            { level: 9, name: "Şampiyon", emoji: "👑", targetScore: 20, speed: 600, scoreBase: 300, color: "#FFC6FF", animals: ["🐼", "🐨", "🐸", "🐱", "🐶", "🦊", "🦁", "🐰", "🐵", "🐙", "🦄"] },
            { level: 10, name: "Efsanevi Tıklayıcı", emoji: "🔮", targetScore: 25, speed: 500, scoreBase: 500, color: "#FFC6FF", animals: ["🐼", "🐨", "🐸", "🐱", "🐶", "🦊", "🦁", "🐰", "🐵", "🐙", "🦄","🦋","🦀"] }
        ];

        const cfg = LEVELS[levelNumber - 1];
        let score = 0;
        let lives = 3;
        let gameActive = true;
        let lastHole = -1;
        let popTimeout = null;

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

                <div id="instruction-bar" style="margin-bottom:15px; font-weight:700; font-size:0.95rem; color:var(--text-main); min-height:24px;">
                    Parlayan sevimli hayvanı yakala! ⚡
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
                const next = parseInt(tab.dataset.level);
                if (next === levelNumber) return;
                playSound('click');
                cleanUp();
                startFastFingersGame(container, next);
            });
        });

        function cleanUp() {
            if (popTimeout) clearTimeout(popTimeout);
        }

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

            if (!tappedThisTurn && currentlyActiveHole !== -1) {
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

            const animalEl = hole.querySelector(".mole-animal");
            const animalEmoji = cfg.animals[Math.floor(Math.random() * cfg.animals.length)];
            
            if (animalEl) {
                animalEl.innerText = animalEmoji;
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
                } else if (holeId !== currentlyActiveHole) {
                    lives--;
                    updateLivesUI();
                    playSound('locked');
                    showFloatingText(hole, "❌", "#ef4444");
                    
                    hole.style.animation = "shake 0.3s ease";
                    setTimeout(() => { hole.style.animation = ""; }, 300);

                    if (lives <= 0) {
                        endGame(false);
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
        if (instructionBar) instructionBar.innerText = `Oyun başlıyor: ${countdown}`;
        
        const countInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                if (instructionBar) instructionBar.innerText = `Oyun başlıyor: ${countdown}`;
            } else {
                clearInterval(countInterval);
                if (instructionBar) instructionBar.innerText = "Hadi yakala! ⚡";
                popAnimal();
            }
        }, 1000);
    }
    // ============================================================
    // LABİRENT MACERASI (MANTIK) OYUN MOTORU
    // ============================================================
    function startMazeGame(container, levelNumber) {
        if (activeGameTimer) {
            clearInterval(activeGameTimer);
        }

        const LEVELS = [
            { level: 1, name: "Tavşanın Bahçesi", emoji: "🐰", size: 5, scoreBase: 50, color: "#CAFFBF" },
            { level: 2, name: "Minik Patika", emoji: "🌱", size: 5, scoreBase: 70, color: "#CAFFBF" },
            { level: 3, name: "Gizli Geçit", emoji: "🥕", size: 6, scoreBase: 100, color: "#A0C4FF" },
            { level: 4, name: "Yeşil Labirent", emoji: "🌲", size: 6, scoreBase: 120, color: "#A0C4FF" },
            { level: 5, name: "Büyük Macera", emoji: "🌟", size: 7, scoreBase: 150, color: "#FFD6A5" },
            { level: 6, name: "Gizemli Yol", emoji: "💎", size: 7, scoreBase: 180, color: "#FFD6A5" },
            { level: 7, name: "Karışık Patika", emoji: "🔥", size: 8, scoreBase: 200, color: "#D8BBFF" },
            { level: 8, name: "Kayıp Şehir", emoji: "🏛️", size: 8, scoreBase: 250, color: "#D8BBFF" },
            { level: 9, name: "Sihirli Geçit", emoji: "⚡", size: 9, scoreBase: 300, color: "#FFC6FF" },
            { level: 10, name: "Labirent Kralı", emoji: "👑", size: 10, scoreBase: 400, color: "#FFC6FF" }
        ];

        const cfg = LEVELS[levelNumber - 1];
        const N = cfg.size;
        let playerPos = { r: 0, c: 0 };
        let targetPos = { r: N - 1, c: N - 1 };
        let gameActive = true;
        let timeElapsed = 0;
        let lives = 3;
        let grid = [];
        
        function generateSolvableMaze() {
            while (true) {
                grid = [];
                for (let r = 0; r < N; r++) {
                    grid.push([]);
                    for (let c = 0; c < N; c++) {
                        if ((r === 0 && c === 0) || (r === N - 1 && c === N - 1)) {
                            grid[r].push(0);
                        } else {
                            grid[r].push(Math.random() < 0.28 ? 1 : 0);
                        }
                    }
                }
                
                let queue = [[0, 0]];
                let visited = new Set(["0,0"]);
                let solvable = false;
                
                while (queue.length > 0) {
                    let [currR, currC] = queue.shift();
                    if (currR === N - 1 && currC === N - 1) {
                        solvable = true;
                        break;
                    }
                    
                    const dirs = [[-1,0], [1,0], [0,-1], [0,1]];
                    for (let [dr, dc] of dirs) {
                        let nr = currR + dr;
                        let nc = currC + dc;
                        if (nr >= 0 && nr < N && nc >= 0 && nc < N && grid[nr][nc] === 0) {
                            let key = `${nr},${nc}`;
                            if (!visited.has(key)) {
                                visited.add(key);
                                queue.push([nr, nc]);
                            }
                        }
                    }
                }
                
                if (solvable) break;
            }
        }
        
        generateSolvableMaze();

        const tabsHTML = LEVELS.map(l => {
            const isUnlocked = isLevelUnlocked(6, l.level);
            return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" style="padding: 4px 8px; font-size: 0.72rem; min-width: 32px; ' + (isUnlocked ? '' : 'opacity:0.5; cursor:not-allowed;') + '" ' + (isUnlocked ? '' : 'disabled') + '>' + (isUnlocked ? l.level : '🔒') + '</button>';
        }).join('');

        container.innerHTML = `
            <div class="maze-game" style="text-align:center; padding:10px 0; user-select:none;">
                <div class="level-tabs" style="display:flex; gap:4px; overflow-x:auto; margin-bottom:10px; padding-bottom:4px; justify-content:start;">
                    ${tabsHTML}
                </div>
                <div class="game-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; background:rgba(0,0,0,0.03); padding:8px 12px; border-radius:12px;">
                    <div style="font-weight:700; color:var(--text-main); font-size:0.85rem;">
                        Seviye ${cfg.level}: <span style="color:var(--color-primary);">${cfg.name}</span>
                    </div>
                    <div class="game-lives" id="maze-lives" style="display:flex; gap:4px;">
                        <!-- Hearts -->
                    </div>
                    <div style="font-weight:700; color:var(--text-main); font-size:0.85rem;">
                        Süre: <span id="maze-timer" style="color:#ef4444;">0</span>sn
                    </div>
                </div>

                <div class="maze-board-wrapper" style="padding:10px; background:rgba(0,0,0,0.02); border-radius:20px; display:inline-block; border:2px solid rgba(0,0,0,0.05);">
                    <div class="maze-board" style="display:grid; grid-template-columns:repeat(${N}, 1fr); grid-template-rows:repeat(${N}, 1fr); gap:4px; width:280px; height:280px; margin:0 auto;">
                        ${Array.from({ length: N * N }).map((_, idx) => {
                            const r = Math.floor(idx / N);
                            const c = idx % N;
                            let cellBg = "var(--bg-card)";
                            let content = "";
                            
                            if (grid[r][c] === 1) {
                                cellBg = "#374151";
                            } else if (r === playerPos.r && c === playerPos.c) {
                                content = "🐰";
                            } else if (r === targetPos.r && c === targetPos.c) {
                                content = "🥕";
                            }
                            
                            return '<div class="maze-cell" data-r="' + r + '" data-c="' + c + '" style="background:' + cellBg + '; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; border: 1px solid rgba(0,0,0,0.03); aspect-ratio:1; box-sizing:border-box; width:100%; height:100%; overflow:hidden;">' + content + '</div>';
                        }).join('')}
                    </div>
                </div>

                <div class="maze-controls" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; max-width:180px; margin:15px auto 5px;">
                    <div></div>
                    <button class="btn btn-primary btn-icon" id="maze-up" style="width:48px; height:48px; border-radius:50%; margin:0 auto;"><i data-lucide="chevron-up"></i></button>
                    <div></div>
                    <button class="btn btn-primary btn-icon" id="maze-left" style="width:48px; height:48px; border-radius:50%; margin:0 auto;"><i data-lucide="chevron-left"></i></button>
                    <button class="btn btn-success btn-icon" id="maze-center" style="width:48px; height:48px; border-radius:50%; margin:0 auto; cursor:default; pointer-events:none;"><i data-lucide="smile"></i></button>
                    <button class="btn btn-primary btn-icon" id="maze-right" style="width:48px; height:48px; border-radius:50%; margin:0 auto;"><i data-lucide="chevron-right"></i></button>
                    <div></div>
                    <button class="btn btn-primary btn-icon" id="maze-down" style="width:48px; height:48px; border-radius:50%; margin:0 auto;"><i data-lucide="chevron-down"></i></button>
                    <div></div>
                </div>
            </div>
        `;

        lucide.createIcons();
        updateLivesDisplay();

        container.querySelectorAll(".level-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                const next = parseInt(tab.dataset.level);
                if (next === levelNumber) return;
                playSound('click');
                cleanUp();
                startMazeGame(container, next);
            });
        });

        const handleKeyDown = (e) => {
            if (!gameActive) return;
            let dr = 0, dc = 0;
            if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") dr = -1;
            else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") dr = 1;
            else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") dc = -1;
            else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") dc = 1;
            
            if (dr !== 0 || dc !== 0) {
                e.preventDefault();
                movePlayer(dr, dc);
            }
        };
        document.addEventListener("keydown", handleKeyDown);

        container.querySelector("#maze-up").addEventListener("click", () => movePlayer(-1, 0));
        container.querySelector("#maze-down").addEventListener("click", () => movePlayer(1, 0));
        container.querySelector("#maze-left").addEventListener("click", () => movePlayer(0, -1));
        container.querySelector("#maze-right").addEventListener("click", () => movePlayer(0, 1));

        function updateLivesDisplay() {
            const livesEl = container.querySelector("#maze-lives");
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

        function movePlayer(dr, dc) {
            if (!gameActive) return;
            
            const nr = playerPos.r + dr;
            const nc = playerPos.c + dc;
            
            if (nr >= 0 && nr < N && nc >= 0 && nc < N && grid[nr][nc] === 0) {
                const oldCell = container.querySelector(`.maze-cell[data-r="${playerPos.r}"][data-c="${playerPos.c}"]`);
                if (oldCell) oldCell.innerHTML = "";
                
                playerPos.r = nr;
                playerPos.c = nc;
                
                const newCell = container.querySelector(`.maze-cell[data-r="${playerPos.r}"][data-c="${playerPos.c}"]`);
                if (newCell) {
                    newCell.innerHTML = "🐰";
                }
                
                playSound('click');
                
                if (playerPos.r === targetPos.r && playerPos.c === targetPos.c) {
                    endGame(true);
                }
            } else {
                lives--;
                updateLivesDisplay();
                playSound('locked');
                
                const board = container.querySelector(".maze-board");
                if (board) {
                    board.style.animation = "shake 0.3s ease";
                    setTimeout(() => { board.style.animation = ""; }, 300);
                }

                if (lives <= 0) {
                    endGame(false);
                }
            }
        }

        activeGameTimer = setInterval(() => {
            timeElapsed++;
            const timerEl = container.querySelector("#maze-timer");
            if (timerEl) timerEl.innerText = timeElapsed;
            else {
                document.removeEventListener("keydown", handleKeyDown);
                clearInterval(activeGameTimer);
            }
        }, 1000);

        function cleanUp() {
            document.removeEventListener("keydown", handleKeyDown);
            if (activeGameTimer) {
                clearInterval(activeGameTimer);
                activeGameTimer = null;
            }
        }

        function endGame(isWin) {
            gameActive = false;
            cleanUp();

            if (isWin) {
                unlockNextLevel(6, levelNumber);
                playSound('success');

                const scoreAwarded = cfg.scoreBase + Math.max(0, 200 - timeElapsed * 4);
                const starsAwarded = timeElapsed < 15 ? 25 : (timeElapsed < 30 ? 15 : 10);

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

                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">🥕🐰🏆</div>
                            <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:${cfg.color}; font-weight:700; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">🌟 Labirent Kaşifi!</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px;">Seviye \${levelNumber} Tamamlandı!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Labirenti <strong>\${timeElapsed} saniyede</strong> bitirdin!
                            </p>
                            
                            <div style="display:flex; justify-content:center; gap:14px; margin-bottom:22px;">
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-yellow); border:2px solid #D97706; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#D97706;">+\${starsAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#78350F;">YILDIZ</div>
                                </div>
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-green); border:2px solid #166534; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#166534;">+\${scoreAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#14532D;">PUAN</div>
                                </div>
                            </div>

                            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                                <button class="btn btn-success" id="btn-replay" style="flex:1; min-width:120px;">🔄 Tekrar Oyna</button>
                                \${levelNumber < 10 ? \`<button class="btn btn-primary" id="btn-next-level" style="flex:1; min-width:120px;">➡️ Seviye \${levelNumber + 1}</button>\` : ''}
                                <button class="btn btn-locked" id="btn-finish-win" style="flex:1; min-width:120px;">✅ Kaydet & Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay").addEventListener("click", () => {
                        playSound('click');
                        startMazeGame(container, levelNumber);
                    });
                    if (levelNumber < 10) {
                        container.querySelector("#btn-next-level").addEventListener("click", () => {
                            playSound('click');
                            startMazeGame(container, levelNumber + 1);
                        });
                    }
                    container.querySelector("#btn-finish-win").addEventListener("click", () => {
                        playSound('click');
                        closeModal();
                        renderAchievements();
                    });
                }, 600);
            } else {
                lockGame(6);
                playSound('locked');
                
                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:shake 0.5s ease-in-out;">😢🐰💥</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px; color:#ef4444;">Canların Tükendi!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Duvarlara çok fazla çarptın ve seviyeyi tamamlayamadın. 1 global can kaybettin!
                            </p>
                            
                            <div style="display:flex; gap:10px; justify-content:center;">
                                <button class="btn btn-primary" id="btn-replay-fail" style="padding:10px 24px;">🔄 Tekrar Dene</button>
                                <button class="btn btn-locked" id="btn-close-fail" style="padding:10px 24px;">❌ Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay-fail").addEventListener("click", () => {
                        playSound('click');
                        startMazeGame(container, levelNumber);
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
        if (activeGameTimer) {
            clearInterval(activeGameTimer);
        }

        const LEVELS = [
            { level: 1, name: "Kolay Sorular", targetScore: 5, speed: 8, color: "#CAFFBF" },
            { level: 2, name: "Minik Dahiler", targetScore: 6, speed: 7.5, color: "#CAFFBF" },
            { level: 3, name: "Meraklı Kaşif", targetScore: 7, speed: 7, color: "#A0C4FF" },
            { level: 4, name: "Bilgi Yolcusu", targetScore: 8, speed: 6.5, color: "#A0C4FF" },
            { level: 5, name: "Zihin Egzersizi", targetScore: 9, speed: 6, color: "#FFD6A5" },
            { level: 6, name: "Mantık Avcısı", targetScore: 10, speed: 5.5, color: "#FFD6A5" },
            { level: 7, name: "Hızlı Düşünür", targetScore: 11, speed: 5, color: "#D8BBFF" },
            { level: 8, name: "Süper Odak", targetScore: 12, speed: 4.5, color: "#D8BBFF" },
            { level: 9, name: "Zeka Ustası", targetScore: 13, speed: 4, color: "#FFC6FF" },
            { level: 10, name: "Bilgi Şampiyonu", targetScore: 15, speed: 3.5, color: "#FFC6FF" }
        ];

        const questionsPool = [
            { q: "Muz sarı renklidir. 🍌", a: true },
            { q: "Kediler havlar. 🐱", a: false },
            { q: "Elma bir meyvedir. 🍎", a: true },
            { q: "Balıklar uçabilir. 🐟", a: false },
            { q: "Güneş yeşil renklidir. ☀️", a: false },
            { q: "Kurbağalar zıplar. 🐸", a: true },
            { q: "Araba suyun altında sürülür. 🚗", a: false },
            { q: "Karpuz yuvarlaktır. 🍉", a: true },
            { q: "Uçaklar gökyüzünde uçar. ✈️", a: true },
            { q: "İnekler süt verir. 🐄", a: true },
            { q: "5 + 3 = 8 eder. 🔢", a: true },
            { q: "4 - 1 = 2 eder. 🔢", a: false },
            { q: "Filler uçabilir. 🐘", a: false },
            { q: "Limon ekşidir. 🍋", a: true },
            { q: "Kuşların kanatları vardır. 🐦", a: true },
            { q: "Ateş soğuktur. 🔥", a: false },
            { q: "Dondurma sıcaktır. 🍦", a: false },
            { q: "Geceleri gökyüzünde Ay görünür. 🌙", a: true }
        ];

        const cfg = LEVELS[levelNumber - 1];
        let score = 0;
        let lives = 3;
        let incorrectCount = 0;
        let gameTime = 0;
        let currentQuestion = null;
        let questionTimer = null;
        let remainingTime = cfg.speed;
        let shuffledQuestions = [];
        let questionIndex = 0;

        const tabsHTML = LEVELS.map(l => {
            const isUnlocked = isLevelUnlocked(8, l.level);
            return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" style="padding: 4px 8px; font-size: 0.72rem; min-width: 32px; ' + (isUnlocked ? '' : 'opacity:0.5; cursor:not-allowed;') + '" ' + (isUnlocked ? '' : 'disabled') + '>' + (isUnlocked ? l.level : '🔒') + '</button>';
        }).join('');

        function loadQuestion() {
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
                        \${tabsHTML}
                    </div>
                    <div class="game-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background:rgba(0,0,0,0.03); padding:10px 15px; border-radius:16px;">
                        <div style="font-weight:700; color:var(--text-main); font-size:0.85rem;">
                            Seviye \${cfg.level}: <span style="color:var(--color-primary);">\${cfg.name}</span>
                        </div>
                        <div class="game-lives" id="tf-lives" style="display:flex; gap:4px;">
                            <!-- Hearts -->
                        </div>
                        <div style="font-weight:700; color:var(--text-main); font-size:0.85rem;">
                            Skor: <span style="color:#D97706;">\${score}/\${cfg.targetScore}</span>
                        </div>
                    </div>

                    <div class="progress-bar-bg" style="height:10px; border-radius:5px; background:rgba(0,0,0,0.08); margin-bottom:20px; overflow:hidden;">
                        <div id="time-bar" style="height:100%; background:var(--pastel-green); width:100%; transition:width 0.1s linear;"></div>
                    </div>

                    <div class="question-display card glass" style="margin-bottom:30px; padding:30px 15px; border-radius:24px; border:2px solid rgba(0,0,0,0.05); min-height:120px; display:flex; align-items:center; justify-content:center;">
                        <h3 style="font-size:1.6rem; color:var(--text-main); line-height:1.5;">\${currentQuestion.q}</h3>
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

                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">✅🏆❌</div>
                            <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:\${cfg.color}; font-weight:700; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">🌟 Zeka Küpü!</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px;">Seviye \${levelNumber} Tamamlandı!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Soruları <strong>\${gameTime} saniyede</strong> ve <strong>\${incorrectCount} hata</strong> ile tamamladın!
                            </p>
                            
                            <div style="display:flex; justify-content:center; gap:14px; margin-bottom:22px;">
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-yellow); border:2px solid #D97706; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#D97706;">+\${starsAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#78350F;">YILDIZ</div>
                                </div>
                                <div style="padding:12px 16px; border-radius:14px; background:var(--pastel-green); border:2px solid #166534; text-align:center; min-width:90px;">
                                    <div style="font-size:1.5rem; font-family:var(--font-heading); color:#166534;">+\${scoreAwarded}</div>
                                    <div style="font-size:0.7rem; font-weight:700; color:#14532D;">PUAN</div>
                                </div>
                            </div>

                            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                                <button class="btn btn-success" id="btn-replay" style="flex:1; min-width:120px;">🔄 Tekrar Oyna</button>
                                \${levelNumber < 10 ? \`<button class="btn btn-primary" id="btn-next-level" style="flex:1; min-width:120px;">➡️ Seviye \${levelNumber + 1}</button>\` : ''}
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
        if (activeGameTimer) {
            clearInterval(activeGameTimer);
        }

        const LEVELS = [
            { level: 1, name: "1'den 9'a Kadar", size: 3, maxVal: 9, color: "#CAFFBF" },
            { level: 2, name: "Sayı Dedektifi", size: 3, maxVal: 9, color: "#CAFFBF" },
            { level: 3, name: "1'den 12'ye Saymaca", size: 4, maxVal: 12, color: "#A0C4FF" },
            { level: 4, name: "Kolay Kaçış", size: 4, maxVal: 12, color: "#A0C4FF" },
            { level: 5, name: "1'den 16'ya Saymaca", size: 4, maxVal: 16, color: "#FFD6A5" },
            { level: 6, name: "Odaklanma Ustası", size: 4, maxVal: 16, color: "#FFD6A5" },
            { level: 7, name: "Sayı Şampiyonu", size: 5, maxVal: 20, color: "#D8BBFF" },
            { level: 8, name: "Hızlı Kovalamaca", size: 5, maxVal: 20, color: "#D8BBFF" },
            { level: 9, name: "Sayı Kralı", size: 5, maxVal: 25, color: "#FFADAD" },
            { level: 10, name: "Efsanevi Sayıcı", size: 5, maxVal: 25, color: "#FFC6FF" }
        ];

        const cfg = LEVELS[levelNumber - 1];
        let nextTarget = 1;
        let lives = 3;
        let timeElapsed = 0;
        let incorrectCount = 0;
        let gameActive = true;

        let numbers = Array.from({ length: cfg.maxVal }, (_, idx) => idx + 1);
        
        function shuffle(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }
        numbers = shuffle(numbers);

        const tabsHTML = LEVELS.map(l => {
            const isUnlocked = isLevelUnlocked(9, l.level);
            return '<button class="level-tab ' + (l.level === levelNumber ? 'active' : '') + '" data-level="' + l.level + '" ' + (isUnlocked ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"') + '>' + (isUnlocked ? l.level : '🔒') + '</button>';
        }).join('');

        container.innerHTML = `
            <div class="number-chase-game" style="text-align:center; padding:10px 0; user-select:none;">
                <div class="level-tabs">${tabsHTML}</div>
                <div style="font-size:1.1rem; font-weight:800; margin-bottom:12px; color:var(--text-main);">
                    🎯 Sıradaki Sayı: <span id="number-chase-target" style="font-size:1.7rem; color:#ef4444;">1</span>
                </div>
                <div class="game-stats">
                    <div class="stat-item">
                        <i data-lucide="timer" style="width:16px;height:16px;"></i>
                        <span id="game-timer">0</span>sn
                    </div>
                    <div class="stat-item" id="chase-lives" style="display:flex; gap:4px;">
                        <!-- Hearts -->
                    </div>
                    <div class="stat-item">
                        <i data-lucide="check-circle" style="width:16px;height:16px;"></i>
                        İlerleme: <span id="chase-progress">0</span>/${cfg.maxVal}
                    </div>
                </div>
                <div class="number-grid-chase" id="chase-grid" style="display:grid; grid-template-columns:repeat(${cfg.size}, 1fr); gap:8px; max-width:300px; margin:0 auto;">
                    ${numbers.map(n => `
                        <button class="chase-cell" data-val="${n}" style="aspect-ratio:1; font-size:1.6rem; font-weight:800; border-radius:14px; border:2px solid var(--border-color); background:var(--bg-card); cursor:pointer; transition:all 0.1s ease; box-shadow:var(--shadow-small); color:var(--text-main);">${n}</button>
                    `).join('')}
                </div>
                <button class="btn btn-locked" id="btn-give-up" style="width:100%; font-size:0.82rem; margin-top:12px;">
                    🏳️ Vazgeç & Kapat
                </button>
            </div>
        `;

        lucide.createIcons();
        updateLivesDisplay();

        container.querySelectorAll(".level-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                const next = parseInt(tab.dataset.level);
                if (next === levelNumber) return;
                playSound('click');
                cleanUp();
                startNumberChaseGame(container, next);
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
            const livesEl = document.getElementById("chase-lives");
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

        container.querySelectorAll(".chase-cell").forEach(cell => {
            cell.addEventListener("click", () => {
                if (!gameActive) return;
                const val = parseInt(cell.getAttribute("data-val"));

                if (val === nextTarget) {
                    playSound('success');
                    cell.style.background = "var(--pastel-green)";
                    cell.style.borderColor = "#166534";
                    cell.style.color = "#166534";
                    cell.style.opacity = "0.4";
                    cell.style.pointerEvents = "none";

                    const progressEl = document.getElementById("chase-progress");
                    if (progressEl) progressEl.innerText = nextTarget;

                    nextTarget++;
                    const targetEl = document.getElementById("number-chase-target");
                    if (targetEl) targetEl.innerText = nextTarget <= cfg.maxVal ? nextTarget : "Bitti!";

                    if (nextTarget > cfg.maxVal) {
                        endGame(true);
                    }
                } else {
                    lives--;
                    updateLivesDisplay();
                    incorrectCount++;
                    playSound('locked');
                    cell.style.animation = "shake 0.3s ease";
                    cell.style.background = "var(--pastel-red)";
                    cell.style.borderColor = "#ef4444";
                    setTimeout(() => {
                        cell.style.animation = "";
                        cell.style.background = "var(--bg-card)";
                        cell.style.borderColor = "var(--border-color)";
                    }, 400);

                    if (lives <= 0) {
                        endGame(false);
                    }
                }
            });
        });

        function endGame(isWin) {
            cleanUp();

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

                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">⚡🏆</div>
                            <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:${cfg.color}; font-weight:700; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">🌟 Sayı Canavarı!</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px;">Seviye ${levelNumber} Tamamlandı!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Sayıları <strong>${timeElapsed} saniyede</strong> ve <strong>${incorrectCount} hata</strong> ile kovaladın!
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
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:shake 0.5s ease-in-out;">😢💥🔢</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px; color:#ef4444;">Canların Tükendi!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Yanlış sayılara bastın ve canların bitti. 1 global can kaybettin!
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

        activeGameTimer = setInterval(() => {
            timeElapsed++;
            const timerEl = document.getElementById("game-timer");
            if (timerEl) timerEl.innerText = timeElapsed;
            else { cleanUp(); }
        }, 1000);
    }
    // ============================================================
    // RİTMİK HAFIZA (HAFIZA/DİKKAT) OYUN MOTORU
    // ============================================================
    function startRhythmicMemoryGame(container, levelNumber) {
        if (activeGameTimer) {
            clearInterval(activeGameTimer);
        }

        const LEVELS = [
            { level: 1, name: "Basit Ritimler", targetLength: 4, speed: 700, color: "#CAFFBF" },
            { level: 2, name: "Minik Ritimler", targetLength: 4, speed: 650, color: "#CAFFBF" },
            { level: 3, name: "Melodik Kulak", targetLength: 5, speed: 600, color: "#A0C4FF" },
            { level: 4, name: "Ritim Kulak", targetLength: 5, speed: 550, color: "#A0C4FF" },
            { level: 5, name: "Ritim Takibi", targetLength: 6, speed: 500, color: "#FFD6A5" },
            { level: 6, name: "Melodi Takibi", targetLength: 6, speed: 450, color: "#FFD6A5" },
            { level: 7, name: "Konsantrasyon", targetLength: 7, speed: 400, color: "#D8BBFF" },
            { level: 8, name: "Derin Ritim", targetLength: 7, speed: 350, color: "#D8BBFF" },
            { level: 9, name: "Ritim Üstadı", targetLength: 8, speed: 300, color: "#FFADAD" },
            { level: 10, name: "Efsane Ritimci", targetLength: 10, speed: 250, color: "#FFC6FF" }
        ];

        const cfg = LEVELS[levelNumber - 1];
        const colors = [
            { id: 0, color: "red", hex: "#f87171", lightHex: "#fca5a5" },
            { id: 1, color: "blue", hex: "#60a5fa", lightHex: "#93c5fd" },
            { id: 2, color: "green", hex: "#4ade80", lightHex: "#86efac" },
            { id: 3, color: "yellow", hex: "#facc15", lightHex: "#fde047" }
        ];

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

        container.innerHTML = `
            <div class="rhythmic-memory-game" style="text-align:center; padding:10px 0; user-select:none;">
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
                        Uzunluk: <span id="rhythm-progress" style="color:#D97706;">0</span>/${cfg.targetLength}
                    </div>
                </div>

                <div id="rhythm-prompt" style="margin-bottom:20px; font-weight:800; font-size:1.1rem; color:var(--text-main); min-height:24px;">
                    Hazırlan... 🥁
                </div>

                <div class="simon-board" style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; max-width:260px; margin:0 auto 10px;">
                    ${colors.map(c => `
                        <button class="simon-pad" data-id="${c.id}" style="aspect-ratio:1; background:${c.hex}; border:4px solid rgba(0,0,0,0.1); border-radius:24px; cursor:pointer; transition:all 0.1s ease; box-shadow:var(--shadow-medium);"></button>
                    `).join('')}
                </div>
                <button class="btn btn-locked" id="btn-give-up" style="width:100%; font-size:0.82rem; margin-top:12px;">
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

        function cleanUp() {
            gameActive = false;
        }

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
                        }, 1000);
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
                    promptEl.innerText = "Hata! Tekrar izle... 👀";
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

        function flashPad(pad, id) {
            const c = colors[id];
            playSound('click');
            pad.style.background = c.lightHex;
            pad.style.transform = "scale(0.96)";
            setTimeout(() => {
                pad.style.background = c.hex;
                pad.style.transform = "";
            }, 250);
        }

        function addNewStep() {
            const randomId = Math.floor(Math.random() * 4);
            sequence.push(randomId);
        }

        function showSequence() {
            isShowingSequence = true;
            promptEl.innerText = "İZLE VE DİNLE... 👂";
            playerIndex = 0;

            let idx = 0;
            const interval = setInterval(() => {
                if (!isShowingSequence) {
                    clearInterval(interval);
                    return;
                }

                if (idx < sequence.length) {
                    const padId = sequence[idx];
                    const pad = container.querySelector('[data-id="' + padId + '"]');
                    flashPad(pad, padId);
                    idx++;
                } else {
                    clearInterval(interval);
                    isShowingSequence = false;
                    promptEl.innerText = "ŞİMDİ SEN DENE! 🫵";
                    gameActive = true;
                }
            }, cfg.speed + 200);
        }

        function endGame(isWin) {
            gameActive = false;
            cleanUp();
            
            if (isWin) {
                unlockNextLevel(10, levelNumber);
                playSound('success');
                const scoreAwarded = cfg.level * 100 + (lives * 40);
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

                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">🧠🥁🏆</div>
                            <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:${cfg.color}; font-weight:700; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">🌟 Ritim Ustası!</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px;">Seviye ${levelNumber} Tamamlandı!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Örüntüyü başarıyla tamamladın ve <strong>${lives} canını</strong> korudun!
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
                playSound('locked');
                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:shake 0.5s ease-in-out;">😢💥🥁</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px; color:#ef4444;">Oyun Bitti!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Ritimleri karıştırdın ve canların tükendi. 1 global can kaybettin!
                            </p>
                            
                            <div style="display:flex; gap:10px; justify-content:center;">
                                <button class="btn btn-primary" id="btn-replay-fail" style="padding:10px 24px;">🔄 Tekrar Dene</button>
                                <button class="btn btn-locked" id="btn-close-fail" style="padding:10px 24px;">❌ Kapat</button>
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

        let countdown = 3;
        promptEl.innerText = `Hazırlan: ${countdown}`;
        const countInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                promptEl.innerText = `Hazırlan: ${countdown}`;
                playSound('click');
            } else {
                clearInterval(countInterval);
                gameActive = true;
                addNewStep();
                showSequence();
            }
        }, 1000);

        activeGameTimer = setInterval(() => {
            if (!gameActive) {
                clearInterval(activeGameTimer);
                clearInterval(countInterval);
            }
        }, 100);
    }
    // 14. Genel Modal Penceresi Kontrolü (Modal Utility Functions)
    function showModal(title, bodyHTML) {
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
});
