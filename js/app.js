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
        if (game.locked) {
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
            }
        }, 2200);
    }

    // ============================================================
    // HAFIZA OYUNU ANA MOTORU — 5 SEVİYE, SIFIR MANTIK HATASI
    // ============================================================
    function startMemoryGame(container, levelNumber) {

        // --- SEVİYE KONFİGÜRASYONLARI ---
        const LEVELS = [
            {
                level: 1, name: "Başlangıç", emoji: "⭐",
                pairs: 3, cols: 3, gridClass: "cols-3",
                timeBonus: [15, 20, 25], scoreBase: 50,
                color: "#CAFFBF",
                pool: ["🐼","🦊","🦁","🐰","🐵","🐸","🐧","🦄","🐙"]
            },
            {
                level: 2, name: "Kolay", emoji: "🌟",
                pairs: 6, cols: 4, gridClass: "cols-4",
                timeBonus: [20, 30, 40], scoreBase: 100,
                color: "#A0C4FF",
                pool: ["🐼","🦊","🦁","🐰","🐵","🐸","🐧","🦄","🐙","🦋","🦀","🐬"]
            },
            {
                level: 3, name: "Orta", emoji: "🏆",
                pairs: 10, cols: 5, gridClass: "cols-5",
                timeBonus: [30, 50, 70], scoreBase: 200,
                color: "#FFD6A5",
                pool: ["🐼","🦊","🦁","🐰","🐵","🐸","🐧","🦄","🐙","🦋",
                       "🦀","🐬","🦉","🐺","🦓","🐘","🦒","🦚","🦜","🐊"]
            },
            {
                level: 4, name: "Zor", emoji: "🔥",
                pairs: 12, cols: 4, gridClass: "cols-4",
                timeBonus: [40, 70, 100], scoreBase: 300,
                color: "#D8BBFF",
                pool: ["🐼","🦊","🦁","🐰","🐵","🐸","🐧","🦄","🐙","🦋",
                       "🦀","🐬","🦉","🐺","🦓","🐘","🦒","🦚","🦜","🐊",
                       "🦈","🦭","🐿","🦩"]
            },
            {
                level: 5, name: "Efsane", emoji: "👑",
                pairs: 15, cols: 5, gridClass: "cols-5",
                timeBonus: [50, 100, 150], scoreBase: 500,
                color: "#FFADAD",
                pool: ["🐼","🦊","🦁","🐰","🐵","🐸","🐧","🦄","🐙","🦋",
                       "🦀","🐬","🦉","🐺","🦓","🐘","🦒","🦚","🦜","🐊",
                       "🦈","🦭","🐿","🦩","🦏","🦛","🐆","🦬","🐂","🦤"]
            }
        ];

        const cfg = LEVELS[levelNumber - 1];

        // --- FISHER-YATES SHUFFLE (doğrulıkla test edilmiş) ---
        function shuffle(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        // Havuzdan tam olarak cfg.pairs kadar emoji seç → çift yap → karıştır
        const chosen  = shuffle([...cfg.pool]).slice(0, cfg.pairs);
        const cardPool = shuffle([...chosen, ...chosen]);

        // --- OYUN DURUMU ---
        let flippedCards = [];
        let matchedPairs = 0;
        let movesCount   = 0;
        let timeElapsed  = 0;
        let isChecking   = false; // Üçüncü tıklama önleme kilidi

        // --- SEKME HTML ---
        const tabsHTML = LEVELS.map(l => `
            <button class="level-tab ${l.level === levelNumber ? 'active' : ''}"
                    data-level="${l.level}">
                ${l.emoji} ${l.level}
            </button>`).join('');

        // --- KART HTML ---
        const cardsHTML = cardPool.map((emoji, idx) => `
            <div class="memory-card" data-emoji="${emoji}" data-idx="${idx}">
                <div class="memory-card-inner">
                    <div class="memory-card-back">❓</div>
                    <div class="memory-card-front">${emoji}</div>
                </div>
            </div>`).join('');

        // --- ARAYÜZ ---
        container.innerHTML = `
            <div class="memory-game" style="max-width:520px;">
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

        // --- SÜRE SAYACI ---
        if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
        activeGameTimer = setInterval(() => {
            timeElapsed++;
            const el = document.getElementById("game-timer");
            if (el) el.innerText = timeElapsed;
            else { clearInterval(activeGameTimer); activeGameTimer = null; }
        }, 1000);

        // --- SEKME GEÇİŞİ ---
        container.querySelectorAll(".level-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                const next = parseInt(tab.dataset.level);
                if (next === levelNumber) return;
                playSound('click');
                if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
                startMemoryGame(container, next);
            });
        });

        // --- VAZGEÇ ---
        container.querySelector("#btn-give-up").addEventListener("click", () => {
            playSound('locked');
            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
            closeModal();
        });

        // --- KART TIKLAMALARI ---
        container.querySelectorAll(".memory-card").forEach(card => {
            card.addEventListener("click", () => {
                // Tüm engelleme koşulları tek noktada → mantık hatası SIFIR
                if (isChecking)                          return;
                if (card.classList.contains("flipped"))  return;
                if (card.classList.contains("matched"))  return;
                if (flippedCards.length >= 2)            return;

                playSound('click');
                card.classList.add("flipped");
                flippedCards.push(card);

                if (flippedCards.length < 2) return; // İlk kart, bekle

                // İkinci kart açıldı → kilitle, sayacı artır
                isChecking = true;
                movesCount++;
                document.getElementById("game-moves").innerText = movesCount;

                const [c1, c2] = flippedCards;

                if (c1.dataset.emoji === c2.dataset.emoji) {
                    // ✅ EŞLEŞTİ
                    setTimeout(() => {
                        playSound('success');
                        c1.classList.add("matched");
                        c2.classList.add("matched");
                        matchedPairs++;
                        document.getElementById("game-matches").innerText = matchedPairs;
                        flippedCards = [];
                        isChecking   = false;

                        if (matchedPairs === cfg.pairs) {
                            // Tüm çiftler → KAZAN
                            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
                            showWinScreen(container, levelNumber, cfg, timeElapsed, movesCount);
                        }
                    }, 450);

                } else {
                    // ❌ EŞLEŞMEDİ → Geri çevir
                    setTimeout(() => {
                        c1.classList.remove("flipped");
                        c2.classList.remove("flipped");
                        flippedCards = [];
                        isChecking   = false;
                    }, 900);
                }
            });
        });
    }

    // ============================================================
    // KAZANMA EKRANI
    // ============================================================
    function showWinScreen(container, levelNumber, cfg, time, moves) {

        const hasNext = levelNumber < 5;

        // Süreye göre yıldız: [base, hızlı, çok hızlı]
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

        // Başarıları güncelle
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
                        ${cfg.emoji} Seviye ${levelNumber} Tamamlandı!
                    </h2>
                    <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                        ${cfg.name} seviyesini <strong>${time}sn</strong>'de
                        <strong>${moves}</strong> hamlede bitirdin!
                    </p>

                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr;
                        gap:10px; max-width:300px; margin:0 auto 18px;">
                        <div style="padding:10px 4px; border-radius:12px;
                            background:rgba(0,0,0,0.04); text-align:center;">
                            <div style="font-size:1.1rem; font-family:var(--font-heading);">${time}sn</div>
                            <div style="font-size:0.62rem; color:var(--text-muted); font-weight:700;">SÜRE</div>
                        </div>
                        <div style="padding:10px 4px; border-radius:12px;
                            background:rgba(0,0,0,0.04); text-align:center;">
                            <div style="font-size:1.1rem; font-family:var(--font-heading);">${moves}</div>
                            <div style="font-size:0.62rem; color:var(--text-muted); font-weight:700;">HAMLE</div>
                        </div>
                        <div style="padding:10px 4px; border-radius:12px;
                            background:rgba(0,0,0,0.04); text-align:center;">
                            <div style="font-size:1.1rem; font-family:var(--font-heading);">${cfg.pairs}</div>
                            <div style="font-size:0.62rem; color:var(--text-muted); font-weight:700;">ÇİFT</div>
                        </div>
                    </div>

                    <div style="display:flex; justify-content:center; gap:14px; margin-bottom:22px;">
                        <div style="padding:12px 16px; border-radius:14px;
                            background:var(--pastel-yellow); border:2px solid #D97706;
                            text-align:center; min-width:90px;">
                            <div style="font-size:1.5rem; font-family:var(--font-heading);
                                color:#D97706;">+${starsAwarded}</div>
                            <div style="font-size:0.7rem; font-weight:700; color:#78350F;">YILDIZ</div>
                        </div>
                        <div style="padding:12px 16px; border-radius:14px;
                            background:var(--pastel-green); border:2px solid #166534;
                            text-align:center; min-width:90px;">
                            <div style="font-size:1.5rem; font-family:var(--font-heading);
                                color:#166534;">+${scoreAwarded}</div>
                            <div style="font-size:0.7rem; font-weight:700; color:#14532D;">PUAN</div>
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
            {
                level: 1, name: "Kırmızı Balonlar", emoji: "🎈",
                targetCount: 5, targetColor: "kırmızı", targetColorHex: "#ef4444",
                speedMin: 3.5, speedMax: 4.8, spawnInterval: 1400,
                color: "#FFADAD", scoreBase: 50,
                balloonColors: [
                    { name: "kırmızı", hex: "#ef4444" },
                    { name: "mavi", hex: "#3b82f6" },
                    { name: "yeşil", hex: "#10b981" }
                ]
            },
            {
                level: 2, name: "Mavi Avcı", emoji: "🌊",
                targetCount: 8, targetColor: "mavi", targetColorHex: "#3b82f6",
                speedMin: 3.0, speedMax: 4.2, spawnInterval: 1200,
                color: "#A0C4FF", scoreBase: 100,
                balloonColors: [
                    { name: "kırmızı", hex: "#ef4444" },
                    { name: "mavi", hex: "#3b82f6" },
                    { name: "yeşil", hex: "#10b981" },
                    { name: "sarı", hex: "#eab308" }
                ]
            },
            {
                level: 3, name: "Sarı Rüzgar", emoji: "☀️",
                targetCount: 10, targetColor: "sarı", targetColorHex: "#eab308",
                speedMin: 2.5, speedMax: 3.8, spawnInterval: 1000,
                color: "#FDFFB6", scoreBase: 150,
                balloonColors: [
                    { name: "kırmızı", hex: "#ef4444" },
                    { name: "mavi", hex: "#3b82f6" },
                    { name: "yeşil", hex: "#10b981" },
                    { name: "sarı", hex: "#eab308" },
                    { name: "mor", hex: "#a855f7" }
                ]
            },
            {
                level: 4, name: "Yeşil Orman", emoji: "🌲",
                targetCount: 12, targetColor: "yeşil", targetColorHex: "#10b981",
                speedMin: 2.2, speedMax: 3.4, spawnInterval: 850,
                color: "#CAFFBF", scoreBase: 250,
                balloonColors: [
                    { name: "kırmızı", hex: "#ef4444" },
                    { name: "mavi", hex: "#3b82f6" },
                    { name: "yeşil", hex: "#10b981" },
                    { name: "sarı", hex: "#eab308" },
                    { name: "mor", hex: "#a855f7" }
                ]
            },
            {
                level: 5, name: "Mor Fırtına", emoji: "⚡",
                targetCount: 15, targetColor: "mor", targetColorHex: "#a855f7",
                speedMin: 1.6, speedMax: 2.8, spawnInterval: 700,
                color: "#FFC6FF", scoreBase: 400,
                balloonColors: [
                    { name: "kırmızı", hex: "#ef4444" },
                    { name: "mavi", hex: "#3b82f6" },
                    { name: "yeşil", hex: "#10b981" },
                    { name: "sarı", hex: "#eab308" },
                    { name: "mor", hex: "#a855f7" }
                ]
            }
        ];

        const cfg = LEVELS[levelNumber - 1];

        let score = 0;
        let lives = 3;
        let spawnedCount = 0;
        let activeBalloons = [];
        let spawnTimer = null;
        let gameTime = 0;

        const tabsHTML = LEVELS.map(l => `
            <button class="level-tab ${l.level === levelNumber ? 'active' : ''}"
                    data-level="${l.level}">
                ${l.emoji} ${l.level}
            </button>`).join('');

        container.innerHTML = `
            <div class="balloon-game-container">
                <div class="level-tabs">${tabsHTML}</div>
                <div class="balloon-target-bar" style="border-left: 6px solid ${cfg.targetColorHex};">
                    🎯 Hedef: Sadece <span style="color: ${cfg.targetColorHex}; font-weight: 800;">${cfg.targetColor.toUpperCase()}</span> renkli balonları patlat!
                </div>
                <div class="game-stats">
                    <div class="stat-item">
                        <i data-lucide="timer" style="width:16px;height:16px;"></i>
                        <span id="game-timer">0</span>sn
                    </div>
                    <div class="stat-item">
                        <i data-lucide="award" style="width:16px;height:16px;"></i>
                        <span id="balloon-score">0</span>/${cfg.targetCount}
                    </div>
                    <div class="stat-item" id="balloon-lives">
                        <i class="heart-icon" data-lucide="heart" style="fill: #ef4444; width:16px;height:16px;"></i>
                        <i class="heart-icon" data-lucide="heart" style="fill: #ef4444; width:16px;height:16px;"></i>
                        <i class="heart-icon" data-lucide="heart" style="fill: #ef4444; width:16px;height:16px;"></i>
                    </div>
                </div>
                <div class="balloon-playfield" id="balloon-playfield"></div>
                <button class="btn btn-locked" id="btn-give-up" style="width:100%; font-size:0.82rem;">
                    🏳️ Oyunu Kapat
                </button>
            </div>
        `;

        lucide.createIcons();

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

        const playfield = document.getElementById("balloon-playfield");

        if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
        activeGameTimer = setInterval(() => {
            gameTime++;
            const timerEl = document.getElementById("game-timer");
            if (timerEl) timerEl.innerText = gameTime;
            else { cleanUp(); }
        }, 1000);

        function cleanUp() {
            if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; }
            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
            activeBalloons.forEach(b => b.remove());
            activeBalloons = [];
        }

        function updateLivesDisplay() {
            const livesEl = document.getElementById("balloon-lives");
            if (!livesEl) return;
            livesEl.innerHTML = "";
            for (let i = 0; i < 3; i++) {
                const heart = document.createElement("i");
                heart.classList.add("heart-icon");
                heart.setAttribute("data-lucide", "heart");
                if (i < lives) {
                    heart.style.fill = "#ef4444";
                } else {
                    heart.style.fill = "none";
                    heart.style.opacity = "0.3";
                }
                livesEl.appendChild(heart);
            }
            lucide.createIcons();
        }

        function createBalloon() {
            if (!playfield) return;
            const balloonColor = cfg.balloonColors[Math.floor(Math.random() * cfg.balloonColors.length)];
            const balloon = document.createElement("div");
            balloon.className = "game-balloon";
            
            const duration = Math.random() * (cfg.speedMax - cfg.speedMin) + cfg.speedMin;
            balloon.style.setProperty("--duration", `${duration}s`);
            balloon.style.left = `${Math.random() * 80 + 10}%`;
            
            balloon.innerHTML = `
                <svg class="balloon-svg-element" viewBox="0 0 50 70">
                    <path d="M25,0 C11,0 0,11 0,25 C0,39 15,50 25,55 C35,50 50,39 50,25 C50,11 39,0 25,0 Z" fill="${balloonColor.hex}" />
                    <ellipse cx="15" cy="15" rx="4" ry="7" fill="#FFFFFF" opacity="0.4" transform="rotate(-30 15 15)" />
                    <path d="M25,55 L22,60 L28,60 Z" fill="${balloonColor.hex}" />
                    <path d="M25,60 C25,64 22,67 25,72" fill="none" stroke="#CBD5E1" stroke-width="2" />
                </svg>
            `;

            playfield.appendChild(balloon);
            activeBalloons.push(balloon);

            balloon.addEventListener("mousedown", (e) => {
                e.stopPropagation();
                popBalloon(balloon, balloonColor);
            });
            balloon.addEventListener("touchstart", (e) => {
                e.stopPropagation();
                e.preventDefault();
                popBalloon(balloon, balloonColor);
            }, { passive: false });

            balloon.addEventListener("animationend", () => {
                if (balloonColor.name === cfg.targetColor) {
                    playSound('locked');
                    lives--;
                    updateLivesDisplay();
                    triggerShakePlayfield();
                    if (lives <= 0) {
                        gameOver();
                    }
                }
                removeBalloon(balloon);
            });
        }

        function triggerShakePlayfield() {
            if (playfield) {
                playfield.style.animation = "shake-wrong 0.4s ease";
                setTimeout(() => { playfield.style.animation = ""; }, 400);
            }
        }

        function popBalloon(balloon, balloonColor) {
            const rect = balloon.getBoundingClientRect();
            const pfRect = playfield.getBoundingClientRect();
            const popX = rect.left - pfRect.left;
            const popY = rect.top - pfRect.top;

            const popEffect = document.createElement("div");
            popEffect.className = "balloon-pop-effect";
            popEffect.style.left = `${popX}px`;
            popEffect.style.top = `${popY}px`;
            popEffect.style.setProperty("--pop-color", balloonColor.hex);
            playfield.appendChild(popEffect);
            setTimeout(() => popEffect.remove(), 300);

            if (balloonColor.name === cfg.targetColor) {
                playSound('click');
                score++;
                const scoreEl = document.getElementById("balloon-score");
                if (scoreEl) scoreEl.innerText = score;

                if (score >= cfg.targetCount) {
                    gameWin();
                }
            } else {
                playSound('locked');
                lives--;
                updateLivesDisplay();
                triggerShakePlayfield();
                if (lives <= 0) {
                    gameOver();
                }
            }

            removeBalloon(balloon);
        }

        function removeBalloon(balloon) {
            balloon.remove();
            activeBalloons = activeBalloons.filter(b => b !== balloon);
        }

        function gameOver() {
            cleanUp();
            playSound('locked');
            container.innerHTML = `
                <div style="text-align:center; padding:24px 8px;">
                    <div style="font-size:4.5rem; margin-bottom:12px;">😢💔</div>
                    <h2 style="font-size:1.6rem; margin-bottom:10px; color:#ef4444;">Canların Tükendi!</h2>
                    <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:20px; line-height:1.6;">
                        Üzülme! Tekrar deneyerek kendini geliştirebilirsin. Her deneme seni daha da hızlandıracak!
                    </p>
                    <div style="display:flex; gap:10px; justify-content:center;">
                        <button class="btn btn-primary" id="btn-restart" style="flex:1; max-width:160px;">🔄 Tekrar Dene</button>
                        <button class="btn btn-locked" id="btn-close-fail" style="flex:1; max-width:160px;">Kapat</button>
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
        }

        function gameWin() {
            cleanUp();
            playSound('success');

            const hasNext = levelNumber < 5;
            const scoreAwarded = cfg.scoreBase + Math.max(0, 200 - gameTime * 3);
            const starsAwarded = lives === 3 ? 20 : (lives === 2 ? 15 : 10);

            const ach = window.achievementsData;
            ach.userStats.stars += starsAwarded;
            ach.userStats.totalScore += scoreAwarded;
            ach.userStats.completedGames += 1;

            const task3 = ach.dailyTasks.find(t => t.id === 3);
            if (task3 && !task3.completed) {
                task3.completed = true;
                ach.userStats.stars += task3.reward;
            }

            const task1 = ach.dailyTasks.find(t => t.id === 1);
            if (task1 && !task1.completed) {
                task1.completed = true;
                ach.userStats.stars += task1.reward;
            }

            const done = ach.dailyTasks.filter(t => t.completed).length;
            ach.userStats.progressPercentage = Math.round((done / ach.dailyTasks.length) * 100);

            const badge = ach.badges.find(b => b.id === "speedy");
            if (badge) {
                badge.unlocked = true;
                badge.tooltip = "Şimşek Refleks: Refleks oyununda seviye bitirdin!";
            }

            setTimeout(() => {
                container.innerHTML = `
                    <div style="text-align:center; padding:16px 8px;">
                        <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">⚡🏆</div>
                        <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:${cfg.color}; font-weight:700; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">🌟 Harika Hız!</div>
                        <h2 style="font-size:1.6rem; margin-bottom:6px;">${cfg.emoji} Seviye ${levelNumber} Tamamlandı!</h2>
                        <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                            ${cfg.name} etabını <strong>${gameTime} saniyede</strong> ve <strong>${3 - lives} hata</strong> ile tamamladın!
                        </p>
                        
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; max-width:260px; margin:0 auto 18px;">
                            <div style="padding:10px 4px; border-radius:12px; background:rgba(0,0,0,0.04); text-align:center;">
                                <div style="font-size:1.1rem; font-family:var(--font-heading);">${gameTime}sn</div>
                                <div style="font-size:0.62rem; color:var(--text-muted); font-weight:700;">SÜRE</div>
                            </div>
                            <div style="padding:10px 4px; border-radius:12px; background:rgba(0,0,0,0.04); text-align:center;">
                                <div style="font-size:1.1rem; font-family:var(--font-heading);">${lives} / 3</div>
                                <div style="font-size:0.62rem; color:var(--text-muted); font-weight:700;">KALAN CAN</div>
                            </div>
                        </div>

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
                            ${hasNext ? `<button class="btn btn-primary" id="btn-next-level" style="flex:1; min-width:120px;">➡️ Seviye ${levelNumber + 1}</button>` : ''}
                            <button class="btn btn-locked" id="btn-finish-win" style="flex:1; min-width:120px;">✅ Kaydet & Kapat</button>
                        </div>
                    </div>
                `;

                container.querySelector("#btn-replay").addEventListener("click", () => {
                    playSound('click');
                    startBalloonGame(container, levelNumber);
                });
                if (hasNext) {
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

        spawnTimer = setInterval(() => {
            createBalloon();
        }, cfg.spawnInterval);
    }

    // ============================================================
    // MATEMATİK DEHASI OYUN MOTORU
    // ============================================================
    function startMathGame(container, levelNumber) {
        const LEVELS = [
            {
                level: 1, name: "Küçük Sayılar", emoji: "🍎",
                targetCorrect: 5, scoreBase: 50, color: "#CAFFBF",
                type: "addition", maxNum: 10
            },
            {
                level: 2, name: "Sayılar Büyüyor", emoji: "🚀",
                targetCorrect: 6, scoreBase: 100, color: "#A0C4FF",
                type: "subtraction", maxNum: 20
            },
            {
                level: 3, name: "Çarpım Tablosu", emoji: "✖️",
                targetCorrect: 6, scoreBase: 150, color: "#FDFFB6",
                type: "multiplication", maxNum: 5
            },
            {
                level: 4, name: "Akıl Oyunları", emoji: "🧠",
                targetCorrect: 7, scoreBase: 250, color: "#D8BBFF",
                type: "mixed", maxNum: 30
            },
            {
                level: 5, name: "Matematik Kralı", emoji: "👑",
                targetCorrect: 8, scoreBase: 400, color: "#FFADAD",
                type: "challenge", maxNum: 50
            }
        ];

        const cfg = LEVELS[levelNumber - 1];

        let correctAnswers = 0;
        let totalQuestions = 0;
        let incorrectCount = 0;
        let gameTime = 0;
        let currentQuestion = null;
        let isAnswering = false;

        const tabsHTML = LEVELS.map(l => `
            <button class="level-tab ${l.level === levelNumber ? 'active' : ''}"
                    data-level="${l.level}">
                ${l.emoji} ${l.level}
            </button>`).join('');

        container.innerHTML = `
            <div class="math-game-container">
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
                <button class="btn btn-locked" id="btn-give-up" style="width:100%; margin-top:12px; font-size:0.82rem;">
                    🏳️ Vazgeç & Kapat
                </button>
            </div>
        `;

        lucide.createIcons();

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

        if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
        activeGameTimer = setInterval(() => {
            gameTime++;
            const el = document.getElementById("game-timer");
            if (el) el.innerText = gameTime;
            else { cleanUp(); }
        }, 1000);

        function cleanUp() {
            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
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
                const offset = Math.floor(Math.random() * 10) - 5;
                const fake = correctAns + offset;
                if (fake >= 0 && fake !== correctAns) {
                    choices.add(fake);
                }
            }
            return shuffleArray(Array.from(choices));
        }

        function shuffleArray(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        function setMascotState(state) {
            const mascot = document.getElementById("math-mascot");
            const mouth = document.getElementById("math-mouth");
            if (!mascot) return;

            mascot.setAttribute("class", "math-mascot-img");
            
            if (state === "happy") {
                mascot.classList.add("happy");
                mouth.setAttribute("d", "M80,120 Q90,135 100,120");
                mouth.setAttribute("stroke-width", "4");
            } else if (state === "sad") {
                mascot.classList.add("sad");
                mouth.setAttribute("d", "M85,130 Q90,118 95,130");
                mouth.setAttribute("stroke-width", "4");
            } else {
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
                    totalQuestions++;
                    const countEl = document.getElementById("math-question-count");
                    if (countEl) countEl.innerText = totalQuestions + 1;
                    generateQuestion();
                }, 1500);
            }
        }

        function gameWin() {
            cleanUp();
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
                badge.tooltip = "Sayı Sihirbazı: Matematik oyununda 10 soruyu doğru yanıtladın!";
            }

            setTimeout(() => {
                container.innerHTML = `
                    <div style="text-align:center; padding:16px 8px;">
                        <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">🧙‍♂️🏆</div>
                        <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:${cfg.color}; font-weight:700; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">🌟 Matematik Dehası!</div>
                        <h2 style="font-size:1.6rem; margin-bottom:6px;">${cfg.emoji} Seviye ${levelNumber} Tamamlandı!</h2>
                        <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                            ${cfg.name} seviyesini <strong>${gameTime}sn</strong> sürede ve <strong>${incorrectCount} hata</strong> ile bitirdin!
                        </p>
                        
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; max-width:260px; margin:0 auto 18px;">
                            <div style="padding:10px 4px; border-radius:12px; background:rgba(0,0,0,0.04); text-align:center;">
                                <div style="font-size:1.1rem; font-family:var(--font-heading);">${gameTime}sn</div>
                                <div style="font-size:0.62rem; color:var(--text-muted); font-weight:700;">SÜRE</div>
                            </div>
                            <div style="padding:10px 4px; border-radius:12px; background:rgba(0,0,0,0.04); text-align:center;">
                                <div style="font-size:1.1rem; font-family:var(--font-heading);">${incorrectCount}</div>
                                <div style="font-size:0.62rem; color:var(--text-muted); font-weight:700;">HATA SAYISI</div>
                            </div>
                        </div>

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
                            ${levelNumber < 5 ? `<button class="btn btn-primary" id="btn-next-level" style="flex:1; min-width:120px;">➡️ Seviye ${levelNumber + 1}</button>` : ''}
                            <button class="btn btn-locked" id="btn-finish-win" style="flex:1; min-width:120px;">✅ Kaydet & Kapat</button>
                        </div>
                    </div>
                `;

                container.querySelector("#btn-replay").addEventListener("click", () => {
                    playSound('click');
                    startMathGame(container, levelNumber);
                });
                if (levelNumber < 5) {
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
    }

    // ============================================================
    // KELİMELERİ AVLA OYUN MOTORU
    // ============================================================
    function startWordGame(container, levelNumber) {
        const LEVELS = [
            {
                level: 1, name: "Sevimli Ev", emoji: "🏠",
                targetCorrect: 3, scoreBase: 50, color: "#CAFFBF",
                words: [
                    { word: "KEDİ", clue: "Miyav diyen tüylü evcil dostumuz" },
                    { word: "KUŞ", clue: "Göklerde uçan, cik cik ötüşen dostumuz" },
                    { word: "SÜT", clue: "Kemiklerimizi güçlendiren yararlı beyaz içecek" },
                    { word: "BAL", clue: "Sevimli arıların peteklerde yaptığı tatlı yiyecek" }
                ]
            },
            {
                level: 2, name: "Doğa Gezisi", emoji: "🌲",
                targetCorrect: 3, scoreBase: 100, color: "#A0C4FF",
                words: [
                    { word: "ELMA", clue: "Kırmızı veya yeşil renkli vitaminli ağaç meyvesi" },
                    { word: "BULUT", clue: "Mavi gökyüzünde süzülen beyaz pamuksu yapılar" },
                    { word: "AĞAÇ", clue: "Kocaman dalları ve yaprakları olan odunsu bitki" },
                    { word: "KUZU", clue: "Koyunların sevimli, beyaz ve tüylü yavrusu" }
                ]
            },
            {
                level: 3, name: "Gökyüzü", emoji: "🌤️",
                targetCorrect: 3, scoreBase: 150, color: "#FDFFB6",
                words: [
                    { word: "GÜNEŞ", clue: "Gündüzleri dünyamızı aydınlatan ve ısıtan yıldız" },
                    { word: "YILDIZ", clue: "Geceleri gökyüzünde ışıl ışıl parıldayan noktalar" },
                    { word: "BALON", clue: "İçine hava üflenerek şişirilen sevimli oyuncak" },
                    { word: "ROKET", clue: "Uzay boşluğuna fırlatılan çok hızlı hava taşıtı" }
                ]
            },
            {
                level: 4, name: "Deniz Altı", emoji: "🐙",
                targetCorrect: 3, scoreBase: 250, color: "#D8BBFF",
                words: [
                    { word: "BALIK", clue: "Denizlerde ve göllerde yüzgeçleriyle yüzen canlı" },
                    { word: "DENİZ", clue: "Ucu bucağı görünmeyen çok büyük tuzlu su kütlesi" },
                    { word: "YENGEÇ", clue: "Kıskaçları olan ve yan yan yürüyen deniz kabuklusu" },
                    { word: "KUMSAL", clue: "Deniz kıyısındaki sıcacık, sarı kumlu alan" }
                ]
            },
            {
                level: 5, name: "Uzay Yolu", emoji: "🪐",
                targetCorrect: 3, scoreBase: 400, color: "#FFADAD",
                words: [
                    { word: "GEZEGEN", clue: "Uzayda bir yıldızın etrafında dönen yuvarlak gökcismi" },
                    { word: "ASTRONOT", clue: "Uzay giysileri giyerek uzayda araştırmalar yapan kaşif" },
                    { word: "UYDU", clue: "Gezegenlerin çevresinde dönen veya uzaya yollanan araç" },
                    { word: "UYKU", clue: "Zihnimizi ve bedenimizi dinlendirdiğimiz gece molası" }
                ]
            }
        ];

        const cfg = LEVELS[levelNumber - 1];

        let correctWordsCount = 0;
        let incorrectGuesses = 0;
        let gameTime = 0;
        
        let currentWordObj = null;
        let spellingProgress = "";
        let usedWordIndices = [];

        const tabsHTML = LEVELS.map(l => `
            <button class="level-tab ${l.level === levelNumber ? 'active' : ''}"
                    data-level="${l.level}">
                ${l.emoji} ${l.level}
            </button>`).join('');

        container.innerHTML = `
            <div class="word-game-container">
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

        if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
        activeGameTimer = setInterval(() => {
            gameTime++;
            const el = document.getElementById("game-timer");
            if (el) el.innerText = gameTime;
            else { cleanUp(); }
        }, 1000);

        function cleanUp() {
            if (activeGameTimer) { clearInterval(activeGameTimer); activeGameTimer = null; }
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

            document.getElementById("word-clue").innerText = `💡 İpucu: ${currentWordObj.clue}`;

            const slotsContainer = document.getElementById("word-slots-container");
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
                    document.getElementById("word-progress-count").innerText = correctWordsCount;

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
                playSound('locked');
                incorrectGuesses++;
                bubbleEl.style.animation = "shake-wrong 0.4s ease";
                setTimeout(() => {
                    bubbleEl.style.animation = `float-letter var(--anim-duration) infinite ease-in-out`;
                }, 400);
            }
        }

        function gameWin() {
            cleanUp();
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
                badge.tooltip = "Bilge Kitap: Kelime oyununda 20 farklı harf/kelime keşfettin!";
            }

            const explorerBadge = ach.badges.find(b => b.id === "explorer");
            if (explorerBadge) {
                explorerBadge.unlocked = true;
                explorerBadge.tooltip = "Kaşif Sincap: Kelimeleri Avla oyununu başarıyla tamamladın!";
            }

            setTimeout(() => {
                container.innerHTML = `
                    <div style="text-align:center; padding:16px 8px;">
                        <div style="font-size:4.5rem; margin-bottom:12px; animation:bounce-loop 2s infinite ease-in-out;">🐿️🏆</div>
                        <div style="display:inline-block; padding:6px 18px; border-radius:999px; background:${cfg.color}; font-weight:700; font-size:0.95rem; color:#1F2937; margin-bottom:10px;">🌟 Kelime Avcısı!</div>
                        <h2 style="font-size:1.6rem; margin-bottom:6px;">${cfg.emoji} Seviye ${levelNumber} Tamamlandı!</h2>
                        <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                            ${cfg.name} seviyesini <strong>${gameTime}sn</strong> sürede ve <strong>${incorrectGuesses} yanlış tıklama</strong> ile bitirdin!
                        </p>
                        
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; max-width:260px; margin:0 auto 18px;">
                            <div style="padding:10px 4px; border-radius:12px; background:rgba(0,0,0,0.04); text-align:center;">
                                <div style="font-size:1.1rem; font-family:var(--font-heading);">${gameTime}sn</div>
                                <div style="font-size:0.62rem; color:var(--text-muted); font-weight:700;">SÜRE</div>
                            </div>
                            <div style="padding:10px 4px; border-radius:12px; background:rgba(0,0,0,0.04); text-align:center;">
                                <div style="font-size:1.1rem; font-family:var(--font-heading);">${incorrectGuesses}</div>
                                <div style="font-size:0.62rem; color:var(--text-muted); font-weight:700;">HATA SAYISI</div>
                            </div>
                        </div>

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
                            ${levelNumber < 5 ? `<button class="btn btn-primary" id="btn-next-level" style="flex:1; min-width:120px;">➡️ Seviye ${levelNumber + 1}</button>` : ''}
                            <button class="btn btn-locked" id="btn-finish-win" style="flex:1; min-width:120px;">✅ Kaydet & Kapat</button>
                        </div>
                    </div>
                `;

                container.querySelector("#btn-replay").addEventListener("click", () => {
                    playSound('click');
                    startWordGame(container, levelNumber);
                });
                if (levelNumber < 5) {
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
            { level: 2, name: "Kolay", emoji: "🌟", targetScore: 12, speed: 1100, scoreBase: 100, color: "#A0C4FF", animals: ["🐼", "🐨", "🐸", "🐱", "🐶"] },
            { level: 3, name: "Orta", emoji: "🏆", targetScore: 15, speed: 900, scoreBase: 150, color: "#FFD6A5", animals: ["🐼", "🐨", "🐸", "🐱", "🐶", "🦊", "🦁"] },
            { level: 4, name: "Zor", emoji: "🔥", targetScore: 18, speed: 750, scoreBase: 200, color: "#D8BBFF", animals: ["🐼", "🐨", "🐸", "🐱", "🐶", "🦊", "🦁", "🐰", "🐵"] },
            { level: 5, name: "Şampiyon", emoji: "👑", targetScore: 20, speed: 600, scoreBase: 300, color: "#FFC6FF", animals: ["🐼", "🐨", "🐸", "🐱", "🐶", "🦊", "🦁", "🐰", "🐵", "🐙", "🦄"] }
        ];

        const cfg = LEVELS[levelNumber - 1];
        let score = 0;
        let lives = 3;
        let gameActive = true;
        let lastHole = -1;
        let popTimeout = null;

        container.innerHTML = `
            <div class="fast-fingers-game" style="text-align:center; padding:10px 0;">
                <div class="game-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; background:rgba(0,0,0,0.03); padding:10px 15px; border-radius:16px;">
                    <div style="font-weight:700; color:var(--text-main); font-size:0.95rem;">
                        Seviye ${cfg.level}: <span style="color:var(--color-primary);">${cfg.name}</span>
                    </div>
                    <div class="game-lives" style="display:flex; gap:4px;">
                        <i class="heart-icon" data-lucide="heart" style="fill:#ef4444; color:#ef4444; width:18px; height:18px;"></i>
                        <i class="heart-icon" data-lucide="heart" style="fill:#ef4444; color:#ef4444; width:18px; height:18px;"></i>
                        <i class="heart-icon" data-lucide="heart" style="fill:#ef4444; color:#ef4444; width:18px; height:18px;"></i>
                    </div>
                    <div style="font-weight:700; color:var(--text-main); font-size:0.95rem;">
                        Hedef: <span id="score-counter" style="color:#D97706;">0</span>/${cfg.targetScore}
                    </div>
                </div>

                <div id="instruction-bar" style="margin-bottom:15px; font-weight:700; font-size:1rem; color:var(--text-main); min-height:24px;">
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

        function updateLivesUI() {
            hearts.forEach((heart, idx) => {
                if (idx < lives) {
                    heart.style.fill = "#ef4444";
                    heart.style.color = "#ef4444";
                } else {
                    heart.style.fill = "none";
                    heart.style.color = "var(--text-muted)";
                }
            });
        }

        function randomHole() {
            let h;
            do {
                h = Math.floor(Math.random() * holes.length);
            } while (h === lastHole);
            lastHole = h;
            return h;
        }

        let currentlyActiveHole = -1;
        let tappedThisTurn = false;

        function popAnimal() {
            if (!gameActive) return;

            if (currentlyActiveHole !== -1 && !tappedThisTurn) {
                lives--;
                updateLivesUI();
                playSound('locked');
                
                showFloatingText(holes[currentlyActiveHole], "Kaçırdın! 😢", "red");

                if (lives <= 0) {
                    endGame(false);
                    return;
                }
            }

            tappedThisTurn = false;
            
            holes.forEach(hole => {
                hole.style.background = "rgba(0,0,0,0.05)";
                hole.style.borderColor = "var(--text-muted)";
                const animalEl = hole.querySelector(".mole-animal");
                animalEl.style.opacity = "0";
                animalEl.style.transform = "translateY(20px) scale(0.5)";
            });

            const activeIdx = randomHole();
            currentlyActiveHole = activeIdx;
            const targetHole = holes[activeIdx];
            
            const randomAnimal = cfg.animals[Math.floor(Math.random() * cfg.animals.length)];
            const animalEl = targetHole.querySelector(".mole-animal");
            animalEl.innerText = randomAnimal;
            
            targetHole.style.background = "var(--pastel-yellow)";
            targetHole.style.borderColor = "#D97706";
            
            setTimeout(() => {
                animalEl.style.opacity = "1";
                animalEl.style.transform = "translateY(0) scale(1)";
            }, 20);

            popTimeout = setTimeout(() => {
                popAnimal();
            }, cfg.speed);
        }

        holes.forEach(hole => {
            hole.addEventListener("click", () => {
                if (!gameActive) return;
                
                const id = parseInt(hole.getAttribute("data-id"));
                
                if (id === currentlyActiveHole && !tappedThisTurn) {
                    tappedThisTurn = true;
                    score++;
                    scoreCounter.innerText = score;
                    playSound('click');
                    
                    showFloatingText(hole, "+10 ⚡", "green");
                    
                    const animalEl = hole.querySelector(".mole-animal");
                    animalEl.style.transform = "scale(1.2) rotate(10deg)";
                    setTimeout(() => {
                        animalEl.style.opacity = "0";
                    }, 100);

                    if (score >= cfg.targetScore) {
                        endGame(true);
                    }
                } else if (id !== currentlyActiveHole) {
                    lives--;
                    updateLivesUI();
                    playSound('locked');
                    showFloatingText(hole, "Boş! ❌", "red");
                    
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
            span.style.top = "-10px";
            span.style.left = "50%";
            span.style.transform = "translateX(-50%)";
            span.style.fontWeight = "bold";
            span.style.fontSize = "0.9rem";
            span.style.color = color === "green" ? "#166534" : "#ef4444";
            span.style.animation = "float-balloon 0.8s ease-out forwards";
            span.style.pointerEvents = "none";
            element.appendChild(span);
            setTimeout(() => span.remove(), 800);
        }

        function endGame(isWin) {
            gameActive = false;
            currentlyActiveHole = -1;
            tappedThisTurn = true;
            if (popTimeout) clearTimeout(popTimeout);

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
                    speedyBadge.tooltip = "Şimşek Refleks: Hızlı Parmaklar refleks oyununda seviye bitirdin!";
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
                            <h2 style="font-size:1.6rem; margin-bottom:6px;">${cfg.emoji} Seviye ${levelNumber} Tamamlandı!</h2>
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
                                ${levelNumber < 5 ? `<button class="btn btn-primary" id="btn-next-level" style="flex:1; min-width:120px;">➡️ Seviye ${levelNumber + 1}</button>` : ''}
                                <button class="btn btn-locked" id="btn-finish-win" style="flex:1; min-width:120px;">✅ Kaydet & Kapat</button>
                            </div>
                        </div>
                    `;

                    container.querySelector("#btn-replay").addEventListener("click", () => {
                        playSound('click');
                        startFastFingersGame(container, levelNumber);
                    });
                    if (levelNumber < 5) {
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
                playSound('locked');
                setTimeout(() => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px 8px;">
                            <div style="font-size:4.5rem; margin-bottom:12px; animation:shake 0.5s ease-in-out;">😢💥</div>
                            <h2 style="font-size:1.6rem; margin-bottom:6px; color:#ef4444;">Oyun Bitti!</h2>
                            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:18px;">
                                Seviyeyi tamamlayamadın. 3 canının hepsi bitti.
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
        instructionBar.innerText = `Oyun başlıyor: ${countdown}`;
        
        const countInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                instructionBar.innerText = `Oyun başlıyor: ${countdown}`;
                playSound('click');
            } else {
                clearInterval(countInterval);
                instructionBar.innerText = "YAKALA! ⚡";
                playSound('success');
                popAnimal();
            }
        }, 1000);

        activeGameTimer = setInterval(() => {
            if (!gameActive) {
                clearInterval(activeGameTimer);
                clearInterval(countInterval);
                if (popTimeout) clearTimeout(popTimeout);
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
