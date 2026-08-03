// PWA (Progressive Web App) Servis Kaydı ve Yükleme Mantığı

let deferredPrompt;

// 1. Service Worker Kaydı
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then((registration) => {
        console.log("[PWA] Service Worker başarıyla kaydedildi. Kapsam:", registration.scope);
      })
      .catch((error) => {
        console.error("[PWA] Service Worker kaydı başarısız oldu:", error);
      });
  });
}

// 2. Tarayıcı "Ana Ekrana Ekle" İsteğini Yakalama
window.addEventListener("beforeinstallprompt", (e) => {
  // Varsayılan tarayıcı banner'ını engelle
  e.preventDefault();
  // İstem bilgisini daha sonra tetiklemek üzere sakla
  deferredPrompt = e;

  // Navigasyondaki Yükleme Butonunu Görünür Yap
  const installBtn = document.getElementById("btn-install-app");
  if (installBtn) {
    installBtn.style.display = "inline-flex";
    
    // Lucide ikonunu yeniden yükle (ikonun görünmesi için)
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
});

// 3. Yükleme Butonuna Tıklama Olayı ve iOS Desteği
document.addEventListener("DOMContentLoaded", () => {
  const installBtn = document.getElementById("btn-install-app");
  if (!installBtn) return;

  // iOS Tespiti
  const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };
  const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

  // iOS cihaz ise ve uygulama olarak açılmadıysa butonu göster
  if (isIos() && !isInStandaloneMode()) {
    installBtn.style.display = "inline-flex";
    if (window.lucide) window.lucide.createIcons();
    
    installBtn.addEventListener("click", () => {
      alert("iPhone veya iPad'e yüklemek için:\n\n1. Ekranın altındaki 'Paylaş' (Kare içinden çıkan ok) simgesine dokunun.\n2. Menüyü aşağı kaydırıp 'Ana Ekrana Ekle' (Add to Home Screen) seçeneğine tıklayın.");
    });
    return; // Normal PWA yükleme mantığına girme
  }

  // Normal Android/Desktop PWA Yükleme Mantığı
  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    // Yükleme penceresini aç
    deferredPrompt.prompt();

    // Kullanıcının cevabını bekle
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Kullanıcı yükleme tercihi: ${outcome}`);

    // İstem nesnesini sıfırla
    deferredPrompt = null;
    installBtn.style.display = "none";
  });
});

// 4. Uygulama Başarıyla Yüklendiğinde Tetiklenen Olay
window.addEventListener("appinstalled", (evt) => {
  console.log("[PWA] MİNİKİO başarıyla cihaza yüklendi!");
  
  // Butonu gizle
  const installBtn = document.getElementById("btn-install-app");
  if (installBtn) {
    installBtn.style.display = "none";
  }
  
  // Eğlenceli bir tıklama ve başarı sesi çaldırabiliriz (opsiyonel)
  if (window.playSound) {
    window.playSound("success");
  }
});
