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

// 5. Oyun: Hızlı Parmaklar
gamesList.push({
    id: 5,
    name: "Hızlı Parmaklar",
    category: "Refleks Oyunları",
    categoryClass: "refleks",
    color: "#FFC6FF",
    icon: "zap",
    age: "6-12 yaş",
    difficulty: "Kolay",
    skills: ["El-Göz Koordinasyonu", "Tepki Süresi", "Odaklanma"],
    desc: "Ekranda sırayla parlayan sevimli hayvanlara en hızlı şekilde tıkla, reflekslerini konuştur!",
    image: "assets/images/hizli_parmaklar.jpg",
    locked: false
});

// 6. Oyun: Labirent Macerası
gamesList.push({
    id: 6,
    name: "Labirent Macerası",
    category: "Mantık Oyunları",
    categoryClass: "mantik",
    color: "#D8BBFF",
    icon: "puzzle",
    age: "6-12 yaş",
    difficulty: "Orta",
    skills: ["Akıl Yürütme", "Problem Çözme", "Planlama"],
    desc: "Sevimli tavşanı yön tuşlarıyla labirentin sonundaki lezzetli havuca ulaştır!",
    image: "assets/images/labirent_macerasi.jpg",
    locked: false
});

// 7. Oyun: Gölge Eşleme
gamesList.push({
    id: 7,
    name: "Gölge Eşleme",
    category: "Görsel Algı",
    categoryClass: "gorsel",
    color: "#CAFFBF",
    icon: "eye",
    age: "6-10 yaş",
    difficulty: "Kolay",
    skills: ["Şekil Zemin Ayrımı", "Renk Algısı", "Görsel Bütünleme"],
    desc: "Üstte gösterilen sevimli nesnenin gölgesini alttaki kartlar arasından bul ve eşleştir!",
    image: "assets/images/golge_esleme.jpg",
    locked: false
});

// 8. Oyun: Doğru mu Yanlış mı?
gamesList.push({
    id: 8,
    name: "Doğru mu Yanlış mı?",
    category: "Dikkat Oyunları",
    categoryClass: "dikkat",
    color: "#FFD6A5",
    icon: "search",
    age: "6-12 yaş",
    difficulty: "Kolay",
    skills: ["Hızlı Karar Verme", "Odaklanma", "Seçici Dikkat"],
    desc: "Ekrana gelen resim ve cümlenin birbiriyle uyumlu olup olmadığını doğru/yanlış butonlarıyla bil!",
    image: "assets/images/dogru_mu_yanlis_mi.jpg",
    locked: false
});

// 9. Oyun: Hızlı Sayma
gamesList.push({
    id: 9,
    name: "Hızlı Sayma",
    category: "Matematik Oyunları",
    categoryClass: "matematik",
    color: "#FDFFB6",
    icon: "calculator",
    age: "7-12 yaş",
    difficulty: "Orta",
    skills: ["Sayı Sıralama", "Zihinden İşlem", "Hızlı Odaklanma"],
    desc: "Ekranda karışık halde duran sayıları en hızlı şekilde 1'den başlayarak sırasıyla tıklayıp topla!",
    image: "assets/images/sayi_avi.jpg",
    locked: false
});

// 10. Oyun: Ritmik Hafıza
gamesList.push({
    id: 10,
    name: "Ritmik Hafıza",
    category: "Hafıza Oyunları",
    categoryClass: "hafiza",
    color: "#A0C4FF",
    icon: "brain",
    age: "6-12 yaş",
    difficulty: "Orta",
    skills: ["Sıralı Hatırlama", "Kısa Süreli Bellek", "Ses/Işık Takibi"],
    desc: "4 renkli sevimli butonun çıkardığı ritmi ve ışık sırasını aklında tut, sırayla basarak tekrarla!",
    image: "assets/images/ritmik_hafiza.jpg",
    locked: false
});

// 11 - 100. Oyunlar (Çok Yakında / Kilitli)
const categoriesKeys = Object.keys(categoriesConfig);
const ages = ["6-8 yaş", "8-10 yaş", "10-12 yaş", "6-12 yaş"];
const difficulties = ["Kolay", "Orta", "Zor"];

for (let i = 11; i <= 100; i++) {
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
