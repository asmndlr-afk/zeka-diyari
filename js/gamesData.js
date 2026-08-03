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

// 6. Oyun: Tavşan Havuç Avcısı
gamesList.push({
    id: 6,
    name: "Tavşan Havuç Avcısı",
    category: "Refleks & Mantık",
    categoryClass: "refleks",
    color: "#D8BBFF",
    icon: "sparkles",
    age: "6-12 yaş",
    difficulty: "Orta",
    skills: ["Hızlı Karar Verme", "Refleks", "Odaklanma"],
    desc: "Tarladaki tüm lezzetli havuçları ve süper yıldız havuçları topla, hayvanlara yakalanmadan bölümleri geç!",
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

// 11. Oyun: Gizli Obje Avı
gamesList.push({
    id: 11,
    name: "Gizli Obje Avı",
    category: "Görsel Algı",
    categoryClass: "gorsel",
    color: "#CAFFBF",
    icon: "eye",
    age: "6-12 yaş",
    difficulty: "Orta",
    skills: ["Seçici Dikkat", "Görsel Tarama", "Odaklanma"],
    desc: "Karmaşık şekiller arasından istenen gizli objeleri bul ve süren dolmadan tüm hedefleri topla!",
    image: "assets/images/gizli_obje.jpg",
    locked: false
});

// 12. Oyun: Mantık Köprüsü
gamesList.push({
    id: 12,
    name: "Mantık Köprüsü",
    category: "Mantık Oyunları",
    categoryClass: "mantik",
    color: "#D8BBFF",
    icon: "puzzle",
    age: "7-12 yaş",
    difficulty: "Orta",
    skills: ["Akıl Yürütme", "Örüntü Tanıma", "Problem Çözme"],
    desc: "Örüntüleri çözerek köprüyü tamamla ve sevimli tavşanı karşıya geçir!",
    image: "assets/images/mantik_koprusu.jpg",
    locked: false
});

// 13. Oyun: Sayı Yapbozu
gamesList.push({
    id: 13,
    name: "Sayı Yapbozu",
    category: "Matematik Oyunları",
    categoryClass: "matematik",
    color: "#FDFFB6",
    icon: "calculator",
    age: "7-12 yaş",
    difficulty: "Orta",
    skills: ["Sayı Sıralama", "Mantık", "Problem Çözme"],
    desc: "Karışık halde verilen sayı bloklarını doğru sıraya dizerek yapbozu tamamla!",
    image: "assets/images/sayi_yapbozu.jpg",
    locked: false
});

// 14. Oyun: Sevimli Boyama Kitabı
gamesList.push({
    id: 14,
    name: "Sevimli Boyama Kitabı",
    category: "Görsel Algı",
    categoryClass: "gorsel",
    color: "#CAFFBF",
    icon: "eye",
    age: "4-10 yaş",
    difficulty: "Kolay",
    skills: ["Yaratıcılık", "Renk Algısı", "İnce Motor Becerileri"],
    desc: "Renksiz sevimli çizimleri kendi zevkine göre boya ve harika eserler ortaya çıkar!",
    image: "assets/images/boyama_kitabi.jpg",
    locked: false
});

// 15. Oyun: Yapboz Kulesi
gamesList.push({
    id: 15,
    name: "Yapboz Kulesi",
    category: "Refleks Oyunları",
    categoryClass: "refleks",
    color: "#FFC6FF",
    icon: "zap",
    age: "6-12 yaş",
    difficulty: "Zor",
    skills: ["Zamanlama", "Odaklanma", "El-Göz Koordinasyonu"],
    desc: "Hareket eden blokları tam üst üste düşürerek dünyanın en yüksek kulesini inşa et!",
    image: "assets/images/yapboz_kulesi.jpg",
    locked: false
});

// 16. Oyun: Noktaları Birleştir
gamesList.push({
    id: 16,
    name: "Noktaları Birleştir",
    category: "Dikkat Oyunları",
    categoryClass: "dikkat",
    color: "#FFD6A5",
    icon: "search",
    age: "5-10 yaş",
    difficulty: "Kolay",
    skills: ["Sayı Takibi", "Görsel Bütünleme", "Odaklanma"],
    desc: "Numaralı noktaları sırayla birleştirerek gizli ve sevimli resmi ortaya çıkar!",
    image: "assets/images/noktalari_birlestir.jpg",
    locked: false
});

// 17. Oyun: Büyülü Taşlar
gamesList.push({
    id: 17,
    name: "Büyülü Taşlar",
    category: "Mantık Oyunları",
    categoryClass: "mantik",
    color: "#D8BBFF",
    icon: "puzzle",
    age: "7-12 yaş",
    difficulty: "Orta",
    skills: ["Problem Çözme", "Strateji", "Görsel Algı"],
    desc: "Antik sütunlardaki fantastik büyü taşlarını aynı renklere göre doğru şekilde sırala!",
    image: "assets/images/buyulu_taslar_cover.jpg",
    locked: false
});

// 18. Oyun: Kodlama Robotu
gamesList.push({
    id: 18,
    name: "Kodlama Robotu",
    category: "Problem Çözme",
    categoryClass: "problem",
    color: "#FFADAD",
    icon: "key",
    age: "6-12 yaş",
    difficulty: "Orta",
    skills: ["Algoritmik Düşünme", "Problem Çözme", "Planlama"],
    desc: "Sevimli robotu yön komutlarıyla hedefe ulaştır, kodlama mantığını eğlenerek öğren!",
    image: "assets/images/kodlama_robotu.jpg",
    locked: false
});

// 19. Oyun: Simetri Aynası
gamesList.push({
    id: 19,
    name: "Simetri Aynası",
    category: "Görsel Algı",
    categoryClass: "gorsel",
    color: "#CAFFBF",
    icon: "eye",
    age: "6-12 yaş",
    difficulty: "Orta",
    skills: ["Şekil Zemin Ayrımı", "Uzamsal İlişkiler", "Görsel Bütünleme"],
    desc: "Dikey simetri çizgisine göre sol taraftaki çizimin ayna yansımasını sağ tarafa çizerek şekli tamamla!",
    image: "assets/images/sekil_esleme.jpg",
    locked: false
});

// 20. Oyun: Ritim ve Dans
gamesList.push({
    id: 20,
    name: "Ritim ve Dans",
    category: "Refleks Oyunları",
    categoryClass: "refleks",
    color: "#FFC6FF",
    icon: "zap",
    age: "6-12 yaş",
    difficulty: "Orta",
    skills: ["El-Göz Koordinasyonu", "Ritim Algısı", "Yaratıcılık"],
    desc: "Müzikal ızgarayı doldurarak kendi ritmini yarat, sevimli hayvanların senin melodinle dans etmesini izle!",
    image: "assets/images/ritim_ve_dans.jpg",
    locked: false
});

// 21. Oyun: Pofuduk Blok Eşleme (Block Blast)
gamesList.push({
    id: 21,
    name: "Pofuduk Blok Eşleme",
    category: "Mantık Oyunları",
    categoryClass: "mantik",
    color: "#D8BBFF",
    icon: "puzzle",
    age: "6-12 yaş",
    difficulty: "Orta",
    skills: ["Strateji Geliştirme", "Planlama", "Görsel Algı"],
    desc: "Sevimli pofuduk blokları 8x8 alana yerleştir, satır ve sütunları doldurarak tatlı blokları patlat!",
    image: "assets/images/blok_blast.jpg",
    locked: false
});

// 22. Oyun: Hedef Vurma (Okçuluk)
gamesList.push({
    id: 22,
    name: "Hedef Vurma",
    category: "Refleks Oyunları",
    categoryClass: "refleks",
    color: "#FFC6FF",
    icon: "target",
    age: "6-12 yaş",
    difficulty: "Orta",
    skills: ["El-Göz Koordinasyonu", "Odaklanma", "Fizik Hissiyatı"],
    desc: "Yayı ger, açıyı ayarla ve hareket eden hedef tahtasının tam ortasını (Tam İsabet!) vurmak için oku fırlat!",
    image: "assets/images/hedef_vurma.jpg",
    locked: false
});

// 23. Oyun: Galaktik Kristal Şekerler (Cosmic Match-3)
gamesList.push({
    id: 23,
    name: "Galaktik Kristal Şekerler",
    category: "Mantık Oyunları",
    categoryClass: "mantik",
    color: "#D8BBFF",
    icon: "star",
    age: "6-12 yaş",
    difficulty: "Orta",
    skills: ["Strateji Geliştirme", "Görsel Algı", "Planlama"],
    desc: "Renkli galaktik kristal şekerleri 3'lü eşleştir, süper lazer kombolarını patlat ve hedef skora ulaş!",
    image: "assets/images/galaktik_sekerler.jpg",
    locked: false
});

// 24. Oyun: Işık & Ayna Lazer Yansıtma
gamesList.push({
    id: 24,
    name: "Işık & Ayna Yansıtma",
    category: "Görsel Algı",
    categoryClass: "gorsel",
    color: "#CAFFBF",
    icon: "sun",
    age: "7-12 yaş",
    difficulty: "Orta",
    skills: ["Görsel Bütünleme", "Akıl Yürütme", "Uzamsal İlişkiler"],
    desc: "Aynaları tıklayarak yönlendir, lazer ışığını kırarak hedef kristali aydınlat ve bulmacayı çöz!",
    image: "assets/images/lazer_ayna.jpg",
    locked: false
});

// 25. Oyun: Bahçe & Çiftlik Sulama (Hay Day Mantığı)
gamesList.push({
    id: 25,
    name: "Bahçe & Çiftlik Sulama",
    category: "Mantık Oyunları",
    categoryClass: "mantik",
    color: "#86EFAC",
    icon: "sprout",
    age: "6-12 yaş",
    difficulty: "Orta",
    skills: ["Planlama", "Zaman Yönetimi", "Kaynak Kullanımı"],
    desc: "Tarlana dilediğin tohumu ek, sula, lezzetli ürünleri yetiştir ve biçerek çiftliğini büyüt!",
    image: "assets/images/bahce_sulama.jpg",
    locked: false
});

// 26. Oyun: Satranç & Akıl Hamleleri (2 Kişilik & Bilgisayar AI)
gamesList.push({
    id: 26,
    name: "Satranç & Akıl Hamleleri",
    category: "Problem Çözme",
    categoryClass: "problem",
    color: "#93C5FD",
    icon: "chess",
    age: "7-12 yaş",
    difficulty: "Orta / Zor",
    skills: ["Stratejik Düşünme", "Öngörü", "Planlama"],
    desc: "Klasik satranç oyunu! İster bir arkadaşınla 2 kişilik oyna, ister akıllı bilgisayara karşı hamlelerini yarıştır!",
    image: "assets/images/satranc.jpg",
    locked: false
});

// 27. Oyun: UNO Renkli Kartlar (Strateji & Eğlence)
gamesList.push({
    id: 27,
    name: "UNO Renkli Kartlar",
    category: "Problem Çözme",
    categoryClass: "problem",
    color: "#F87171",
    icon: "cards",
    age: "6-12 yaş",
    difficulty: "Kolay / Orta",
    skills: ["Strateji", "Hızlı Karar Verme", "Renk & Sayı Eşleme"],
    desc: "Klasik UNO kart oyunu! Renge veya sayıya göre kartları eşleştir, Pas, +2 ve Joker kartlarını kullanıp elini ilk sen bitir!",
    image: "assets/images/uno_kartlar.jpg",
    locked: false
});

// 28. Oyun: Renkli Yapboz
gamesList.push({
    id: 28,
    name: "Renkli Yapboz",
    category: "Görsel Zeka",
    categoryClass: "gorsel",
    color: "#F59E0B",
    icon: "puzzle",
    age: "5-12 yaş",
    difficulty: "Kolay -> Zor (10 Level)",
    skills: ["Görsel Algı", "Parça-Bütün İlişkisi", "Odaklanma"],
    desc: "10 farklı seviyeden oluşan harika yapboz! İlk seviyede 4 basit parçayı birleştir, 36 parçalı usta seviyelerine kadar ilerle!",
    image: "assets/images/puzzle_yapboz.jpg",
    locked: false
});



// 29. Oyun: Kızma Birader (4 Kişilik Ludo)
gamesList.push({
    id: 29,
    name: "Kızma Birader (Ludo)",
    category: "Problem Çözme",
    categoryClass: "problem",
    color: "#F87171",
    icon: "users",
    age: "6-12 yaş",
    difficulty: "Orta",
    skills: ["Strateji", "Problem Çözme", "Planlama", "Şans"],
    desc: "3D Pixar tarzı görsellerle hazırlanmış harika bir Ludo macerası! Arkadaşlarınla veya bilgisayara karşı 4 kişilik strateji savaşına katıl.",
    image: "assets/images/kizma_birader.jpg",
    locked: false
});

// 30. Oyun: Dokuz Taş (Nine Men's Morris)
gamesList.push({
    id: 30,
    name: "Dokuz Taş (Nine Men's Morris)",
    category: "Matematik Oyunları",
    categoryClass: "matematik",
    color: "#FDFFB6",
    icon: "calculator",
    age: "7-12 yaş",
    difficulty: "Zor",
    skills: ["Matematik Becerisi", "İleri Görüşlülük", "Mantık", "Sabır"],
    desc: "Zeka ve strateji klasiği! Taşlarını diz, kaydır, üçlüleri oluştur (cız yap) ve rakibinden önce 10 puana ulaş!",
    image: "assets/images/dokuz_tas.jpg",
    locked: false
});

// Global olarak erişilebilir kılalım
window.gamesData = gamesList;
window.categoriesConfig = categoriesConfig;
