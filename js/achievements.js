// Çocuk Başarı ve İlerleme Verileri
const dailyTasks = [
    { id: 1, name: "Günün ilk oyununu oyna", completed: false, reward: 10, rewardType: "star" },
    { id: 2, name: "Hafıza Kartları oyununda 3 çift eşle", completed: false, reward: 15, rewardType: "star" },
    { id: 3, name: "Renkli Balonlar oyununu tamamla", completed: false, reward: 15, rewardType: "star" },
    { id: 4, name: "Matematik Dehası oyununda seviye geç", completed: false, reward: 15, rewardType: "star" }
];

const badges = [
    {
        id: "welcomer",
        name: "İlk Adım",
        desc: "Zeka Diyarı kapısından ilk kez içeri girdin!",
        icon: "🏆",
        unlocked: true,
        tooltip: "İlk Adım: Zeka Diyarı kapısından ilk kez içeri girdin!"
    },
    {
        id: "memory_apprentice",
        name: "Hafıza Çırağı",
        desc: "Hafıza kartları oyununda ilk çifti eşledin.",
        icon: "🧠",
        unlocked: false,
        tooltip: "Kilitli - Hafıza Çırağı: Hafıza kartları oyununda ilk çifti eşledin."
    },
    {
        id: "explorer",
        name: "Kaşif Sincap",
        desc: "Kelimeleri Avla oyununda kelimeleri tamamla.",
        icon: "🐿️",
        unlocked: false,
        tooltip: "Kilitli - Kaşif Sincap: Kelimeleri Avla oyununda kelimeleri tamamla."
    },
    {
        id: "math_wizard",
        name: "Sayı Sihirbazı",
        desc: "Matematik oyununda 10 soruyu doğru yanıtla.",
        icon: "🧙‍♂️",
        unlocked: false,
        tooltip: "Kilitli - Sayı Sihirbazı: Matematik oyununda 10 soruyu doğru yanıtla."
    },
    {
        id: "speedy",
        name: "Şimşek Refleks",
        desc: "Refleks oyununda seviye bitir.",
        icon: "⚡",
        unlocked: false,
        tooltip: "Kilitli - Şimşek Refleks: Refleks oyununda seviye bitir."
    },
    {
        id: "bookworm",
        name: "Bilge Kitap",
        desc: "Kelime oyunlarında 20 farklı kelime bul.",
        icon: "📚",
        unlocked: false,
        tooltip: "Kilitli - Bilge Kitap: Kelime oyunlarında 20 farklı kelime bul."
    }
];

const userStats = {
    stars: 10, // İlk adım rozetinden gelen başlangıç yıldızı
    completedGames: 0,
    totalScore: 0,
    highestStreak: 1, // 1. gün
    progressPercentage: 0 // Görev tamamlama oranı
};

// Global erişim
window.achievementsData = {
    dailyTasks,
    badges,
    userStats
};
