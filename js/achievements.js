// Çocuk Başarı ve İlerleme Verileri (LocalStorage Entegrasyonlu)

const DEFAULT_DAILY_TASKS = [
    { id: 1, name: "Günün ilk oyununu oyna", completed: false, reward: 10, rewardType: "star" },
    { id: 2, name: "Hafıza Kartları oyununda 3 çift eşle", completed: false, reward: 15, rewardType: "star" },
    { id: 3, name: "Renkli Balonlar oyununu tamamla", completed: false, reward: 15, rewardType: "star" },
    { id: 4, name: "Matematik Dehası oyununda seviye geç", completed: false, reward: 15, rewardType: "star" }
];

const DEFAULT_BADGES = [
    { id: "welcomer", name: "İlk Adım", desc: "MİNİKİO kapısından ilk kez içeri girdin!", icon: "🏆", unlocked: false, tooltip: "İlk Adım: MİNİKİO kapısından ilk kez içeri girdin!" },
    { id: "memory_apprentice", name: "Hafıza Çırağı", desc: "Hafıza kartları oyununda ilk çifti eşledin.", icon: "🧠", unlocked: false, tooltip: "Kilitli - Hafıza Çırağı: Hafıza kartları oyununda ilk çifti eşledin." },
    { id: "explorer", name: "Kaşif Sincap", desc: "Kelimeleri Avla oyununda kelimeleri tamamla.", icon: "🐿️", unlocked: false, tooltip: "Kilitli - Kaşif Sincap: Kelimeleri Avla oyununda kelimeleri tamamla." },
    { id: "math_wizard", name: "Sayı Sihirbazı", desc: "Matematik oyununda 10 soruyu doğru yanıtla.", icon: "🧙‍♂️", unlocked: false, tooltip: "Kilitli - Sayı Sihirbazı: Matematik oyununda 10 soruyu doğru yanıtla." },
    { id: "speedy", name: "Şimşek Refleks", desc: "Refleks oyununda seviye bitir.", icon: "⚡", unlocked: false, tooltip: "Kilitli - Şimşek Refleks: Refleks oyununda seviye bitir." },
    { id: "bookworm", name: "Bilge Kitap", desc: "Kelime oyunlarında 20 farklı kelime bul.", icon: "📚", unlocked: false, tooltip: "Kilitli - Bilge Kitap: Kelime oyunlarında 20 farklı kelime bul." }
];

const DEFAULT_USER_STATS = {
    stars: 0,
    completedGames: 0,
    totalScore: 0,
    highestStreak: 1,
    progressPercentage: 0,
    lastLoginDate: null,
    gameScores: {} // { gameId: maxScore }
};

window.achievementsData = {
    dailyTasks: [],
    badges: [],
    userStats: {},

    initAchievements: function() {
        const savedData = localStorage.getItem('minikio_achievements_v1');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                this.dailyTasks = parsed.dailyTasks || JSON.parse(JSON.stringify(DEFAULT_DAILY_TASKS));
                this.badges = parsed.badges || JSON.parse(JSON.stringify(DEFAULT_BADGES));
                this.userStats = parsed.userStats || JSON.parse(JSON.stringify(DEFAULT_USER_STATS));
                
                // Eğer gameScores eksikse ekle
                if(!this.userStats.gameScores) this.userStats.gameScores = {};
            } catch (e) {
                console.error("Localstorage okuma hatası", e);
                this.loadDefaults();
            }
        } else {
            this.loadDefaults();
        }
        
        this.checkAndAddStreak();
        
        // "İlk Adım" rozetini hemen açalım (İlk kez girdiğinde veya yüklemesinde)
        this.unlockBadge("welcomer");
    },
    
    loadDefaults: function() {
        this.dailyTasks = JSON.parse(JSON.stringify(DEFAULT_DAILY_TASKS));
        this.badges = JSON.parse(JSON.stringify(DEFAULT_BADGES));
        this.userStats = JSON.parse(JSON.stringify(DEFAULT_USER_STATS));
        this.saveAchievements();
    },

    saveAchievements: function() {
        // İlerleme yüzdesini hesapla
        const completedCount = this.dailyTasks.filter(t => t.completed).length;
        this.userStats.progressPercentage = Math.round((completedCount / this.dailyTasks.length) * 100);
        
        const dataToSave = {
            dailyTasks: this.dailyTasks,
            badges: this.badges,
            userStats: this.userStats
        };
        localStorage.setItem('minikio_achievements_v1', JSON.stringify(dataToSave));
        
        // Custom event fırlatarak UI güncellemelerini tetikleyebiliriz
        window.dispatchEvent(new Event('achievementsUpdated'));
    },

    checkAndAddStreak: function() {
        const todayStr = new Date().toDateString();
        
        if (!this.userStats.lastLoginDate) {
            this.userStats.lastLoginDate = todayStr;
            this.userStats.highestStreak = 1;
        } else if (this.userStats.lastLoginDate !== todayStr) {
            // Gün farkını kontrol edelim
            const lastDate = new Date(this.userStats.lastLoginDate);
            const today = new Date(todayStr);
            const diffTime = Math.abs(today - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (diffDays === 1) {
                // Ardışık gün
                this.userStats.highestStreak += 1;
            } else if (diffDays > 1) {
                // Seri bozuldu
                this.userStats.highestStreak = 1;
            }
            
            this.userStats.lastLoginDate = todayStr;
            
            // Yeni gün, görevleri sıfırla
            this.dailyTasks = JSON.parse(JSON.stringify(DEFAULT_DAILY_TASKS));
        }
        
        this.saveAchievements();
    },

    completeTask: function(taskId) {
        const task = this.dailyTasks.find(t => t.id === taskId);
        if (task && !task.completed) {
            task.completed = true;
            if (task.rewardType === 'star') {
                this.userStats.stars += task.reward;
            }
            this.saveAchievements();
            return true; 
        }
        return false;
    },

    unlockBadge: function(badgeId) {
        const badge = this.badges.find(b => b.id === badgeId);
        if (badge && !badge.unlocked) {
            badge.unlocked = true;
            badge.tooltip = badge.tooltip.replace("Kilitli - ", "");
            this.userStats.stars += 50; 
            this.saveAchievements();
            return true;
        }
        return false;
    },
    
    addScoreToGame: function(gameId, score) {
        if(!this.userStats.gameScores[gameId] || score > this.userStats.gameScores[gameId]) {
            this.userStats.gameScores[gameId] = score;
        }
        this.userStats.totalScore += score; 
        this.userStats.completedGames += 1;
        
        if (this.userStats.totalScore > 1000) {
            this.unlockBadge("explorer");
        }
        if (this.userStats.completedGames >= 5) {
            this.unlockBadge("speedy");
        }
        
        // Matematik Dehası (id=3) oynandıysa rozet 
        if(gameId === 3 && score >= 100) {
             this.unlockBadge("math_wizard");
        }
        // Hafıza Kartları (id=1) 
        if(gameId === 1) {
             this.unlockBadge("memory_apprentice");
             this.completeTask(2); // 2 nolu görev "Hafıza Kartlarında eşle"
        }
        // Balon patlatmaca (id=2)
        if(gameId === 2) {
             this.completeTask(3); 
        }
        
        this.saveAchievements();
    },
    
    getUserScoreForGame: function(gameId) {
        return this.userStats.gameScores[gameId] || 0;
    }
};

// Sayfa yüklenince başlat
window.achievementsData.initAchievements();
