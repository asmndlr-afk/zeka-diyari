// 100 Oyun Verisi Üreticisi
const categoriesConfig = {
    "Hafıza Oyunları": { class: "hafiza", color: "#A0C4FF", icon: "brain" },
    "Dikkat Oyunları": { class: "dikkat", color: "#FFD6A5", icon: "search" },
    "Mantık Oyunları": { class: "mantik", color: "#D8BBFF", icon: "puzzle" },
    "Problem Çözme": { class: "problem", color: "#FFADAD", icon: "key" },
    "Görsel Algı": { class: "gorsel", color: "#CAFFBF", icon: "eye" },
    "Matematik Oyunları": { class: "matematik", color: "#FDFFB6", icon: "calculator" },
    "Kelime Oyunları": { class: "kelime", color: "#9BF6FF", icon: "book-open" },
    "Refleks Oyunları": { class: "refleks", color: "#FFC6FF", icon: "zap" }
};

const gameTitles = [
    "Renkli Balonlar Patlatmaca", "Matematik Dehası", "Kelimeleri Avla", "Labirent Macerası", "Ritim ve Dans", 
    "Uzay Yolu Keşfi", "Gizli Objeleri Bul", "Mantık Köprüsü", "Kelime Bulmaca", "Sayı Yapbozu", 
    "Sevimli Boyama Kitabı", "Hızlı Parmaklar", "Şekil Eşleme", "Gölge Bulucu Ustası", "Yapboz Kulesi",
    "Kodlama Robotu", "Ses Eşleştirme", "Hedef Vurma", "Doğru mu Yanlış mı?", "Hızlı Sayma Macerası",
    "Desen Tamamlama Dünyası", "Kelime Zinciri", "Labirent Kaçışı", "Hafıza Küpleri", "Ritmik Sayılar",
    "Resim Bulmaca Parkı", "Zıt Anlamlı Kelimeler", "Hız Testi Parkuru", "Denge Oyunu", "Simetri Çizimi",
    "Gizemli Harita", "Eşini Bul", "Matematik Koşusu", "Kelime Çarkı", "Kutu Kırma Macerası",
    "Gölge Eşleme", "Sıra Takibi Ustası", "Labirent Ustası", "Hafıza Sayıları", "Renk Eşleştirme",
    "Hızlı Refleks Çemberi", "Sayı Avı", "Kelime Sandığı", "Kelime Bulucu", "Yapboz Dünyası",
    "Yön Bulmaca", "Sayı Piramidi", "Harf Sıralama Oyunu", "Şekil Sayma Şenliği", "Gözlem Yeteneği"
];

const skillsPool = {
    "Hafıza Oyunları": ["Görsel Hafıza", "Kısa Süreli Bellek", "Sıralı Hatırlama", "Uzamsal Hafıza"],
    "Dikkat Oyunları": ["Odaklanma", "Seçici Dikkat", "Detay Ayrıntısı", "Görsel Tarama"],
    "Mantık Oyunları": ["Akıl Yürütme", "Sebep-Sonuç İlişkisi", "Strateji Geliştirme", "Gruplama"],
    "Problem Çözme": ["Planlama", "Esnek Düşünme", "Çözüm Üretme", "Analitik Düşünme"],
    "Görsel Algı": ["Şekil Zemin Ayrımı", "Uzamsal İlişkiler", "Görsel Bütünleme", "Renk Algısı"],
    "Matematik Oyunları": ["Zihinden İşlem", "Sayı Hissiyatı", "Dört İşlem", "Örüntü Tanıma"],
    "Kelime Oyunları": ["Kelime Dağarcığı", "Harf Farkındalığı", "Okuma Hızı", "Dil Becerisi"],
    "Refleks Oyunları": ["El-Göz Koordinasyonu", "Tepki Süresi", "Hızlı Karar Verme", "Motor Becerisi"]
};

const descsPool = [
    "Eğlenceli zeka geliştirici oyunumuz ile zihnini test et, rekorları kır!",
    "Harika renkler ve sevimli karakterlerle dolu bu macerada en yüksek skora ulaş!",
    "Arkadaşlarınla paylaşabileceğin harika başarılar kazanmak için oyna!",
    "Eğlenirken öğren, dikkatini topla ve seviyeleri birer birer geç!",
    "Bilişsel becerilerini geliştirirken eğlencenin tadını çıkar!",
    "Bu macera seni bekliyor! Zekanı konuştur ve yıldızları topla!"
];

const gamesList = [];

// 1. Oyun: Hafıza Kartları
gamesList.push({
    id: 1,
    name: "Hafıza Kartları",
    category: "Hafıza Oyunları",
    categoryClass: "hafiza",
    color: "#A0C4FF",
    icon: "brain",
    age: "6-10 yaş",
    difficulty: "Kolay",
    skills: ["Görsel Hafıza", "Odaklanma", "Eşleştirme"],
    desc: "Sevimli hayvan çiftlerini bul, hafızanı test et ve en yüksek puanı kazan!",
    image: "assets/images/hafiza_kartlari.jpg",
    locked: false
});

// 2. Oyun: Renkli Balonlar Patlatmaca
gamesList.push({
    id: 2,
    name: "Renkli Balonlar Patlatmaca",
    category: "Refleks Oyunları",
    categoryClass: "refleks",
    color: "#FFC6FF",
    icon: "zap",
    age: "6-10 yaş",
    difficulty: "Kolay",
    skills: ["El-Göz Koordinasyonu", "Tepki Süresi", "Odaklanma"],
    desc: "Ekranda uçuşan sevimli balonları renklerine göre yakala, reflekslerini ve dikkatini geliştir!",
    image: "assets/images/balon_patlatmaca.jpg",
    locked: false
});

// 3. Oyun: Matematik Dehası
gamesList.push({
    id: 3,
    name: "Matematik Dehası",
    category: "Matematik Oyunları",
    categoryClass: "matematik",
    color: "#FDFFB6",
    icon: "calculator",
    age: "7-12 yaş",
    difficulty: "Orta",
    skills: ["Zihinden İşlem", "Hızlı Karar Verme", "Matematik Becerisi"],
    desc: "Sevimli sayı canavarlarının sorularını cevapla, toplama, çıkarma ve çarpma işlemlerinde rekor kır!",
    image: "assets/images/matematik_dehasi.jpg",
    locked: false
});

// 4. Oyun: Kelimeleri Avla
gamesList.push({
    id: 4,
    name: "Kelimeleri Avla",
    category: "Kelime Oyunları",
    categoryClass: "kelime",
    color: "#9BF6FF",
    icon: "book-open",
    age: "6-12 yaş",
    difficulty: "Kolay",
    skills: ["Kelime Dağarcığı", "Harf Farkındalığı", "Heceleme"],
    desc: "Karışık harflerin arasından gizli kelimeleri sırasıyla bul, kelime hazneni genişlet!",
    image: "assets/images/kelimeleri_avla.jpg",
    locked: false
});

// 5 - 100. Oyunlar (Çok Yakında / Kilitli)
const categoriesKeys = Object.keys(categoriesConfig);
const ages = ["6-8 yaş", "8-10 yaş", "10-12 yaş", "6-12 yaş"];
const difficulties = ["Kolay", "Orta", "Zor"];

for (let i = 5; i <= 100; i++) {
    const category = categoriesKeys[i % categoriesKeys.length];
    const categoryInfo = categoriesConfig[category];
    const titleBase = gameTitles[(i - 5) % gameTitles.length];
    const title = `${titleBase} #${Math.ceil(i / gameTitles.length)}`;
    const age = ages[i % ages.length];
    const difficulty = difficulties[i % difficulties.length];
    
    // Rastgele 2-3 beceri seçme
    const skillsSrc = skillsPool[category];
    const skills = [skillsSrc[i % skillsSrc.length], skillsSrc[(i + 2) % skillsSrc.length]];
    
    const desc = descsPool[i % descsPool.length];
    
    // placeholder SVG'ler veya gradyan renkleri kapak görseli olarak kullanacağız
    const image = `gradient-${i % 8}`; 

    gamesList.push({
        id: i,
        name: title,
        category: category,
        categoryClass: categoryInfo.class,
        color: categoryInfo.color,
        icon: categoryInfo.icon,
        age: age,
        difficulty: difficulty,
        skills: skills,
        desc: desc,
        image: image,
        locked: true
    });
}

// Global olarak erişilebilir kılalım
window.gamesData = gamesList;
window.categoriesConfig = categoriesConfig;
