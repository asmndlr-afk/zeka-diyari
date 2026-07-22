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

// 3. Yükleme Butonuna Tıklama Olayı
document.addEventListener("DOMContentLoaded", () => {
  const installBtn = document.getElementById("btn-install-app");
  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;

      // Yükleme penceresini aç
      deferredPrompt.prompt();

      // Kullanıcının cevabını bekle
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] Kullanıcı yükleme tercihi: ${outcome}`);

      // İstem nesnesini sıfırla (tek kullanımlıktır)
      deferredPrompt = null;

      // Butonu gizle
      installBtn.style.display = "none";
    });
  }
});

// 4. Uygulama Başarıyla Yüklendiğinde Tetiklenen Olay
window.addEventListener("appinstalled", (evt) => {
  console.log("[PWA] Zeka Diyarı başarıyla cihaza yüklendi!");
  
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
