// Bu script, profil bilgilerinin kalıcı olarak saklanmasını sağlar
// HTML'de doğrudan çalıştırılır, React uygulamasından bağımsızdır

// Sayfa yüklendiğinde çalışacak fonksiyon
function fixProfile() {
  console.log('Profile Fixer çalışıyor...');
  
  try {
    // Mevcut kullanıcıyı al
    const currentUserStr = localStorage.getItem('erp_current_user');
    if (!currentUserStr) {
      console.log('Mevcut kullanıcı bulunamadı');
      return;
    }
    
    // Kullanıcı veritabanını al
    const usersStr = localStorage.getItem('erp_users_v2');
    if (!usersStr) {
      console.log('Kullanıcı veritabanı bulunamadı');
      return;
    }
    
    // Verileri parse et
    const currentUser = JSON.parse(currentUserStr);
    const users = JSON.parse(usersStr);
    
    if (!Array.isArray(users)) {
      console.error('Kullanıcı veritabanı bir dizi değil');
      return;
    }
    
    if (!currentUser || !currentUser.id) {
      console.error('Geçersiz kullanıcı formatı');
      return;
    }
    
    // Kullanıcı veritabanında mevcut kullanıcıyı bul
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) {
      // Kullanıcı veritabanında mevcut kullanıcı yoksa, ekle
      console.log('Kullanıcı veritabanında mevcut kullanıcı bulunamadı, ekleniyor...');
      users.push(currentUser);
      localStorage.setItem('erp_users_v2', JSON.stringify(users));
      console.log('Mevcut kullanıcı veritabanına eklendi');
    } else {
      // Kullanıcı veritabanında mevcut kullanıcıyı güncelle
      console.log('Kullanıcı veritabanında mevcut kullanıcı bulundu, güncelleniyor...');
      
      // Profil bilgilerini birleştir (mevcut kullanıcı öncelikli)
      const mergedUser = {
        ...users[userIndex],
        ...currentUser,
        // ID'nin değişmemesini sağla
        id: currentUser.id
      };
      
      // Kullanıcı veritabanını güncelle
      users[userIndex] = mergedUser;
      localStorage.setItem('erp_users_v2', JSON.stringify(users));
      
      // Mevcut kullanıcıyı da güncelle
      localStorage.setItem('erp_current_user', JSON.stringify(mergedUser));
      
      console.log('Profil bilgileri senkronize edildi');
    }
  } catch (error) {
    console.error('Profile Fixer hatası:', error);
  }
}

// localStorage değişikliklerini dinle
window.addEventListener('storage', function(event) {
  if (event.key === 'erp_current_user' || event.key === 'erp_users_v2') {
    console.log('localStorage değişti, profil bilgileri senkronize ediliyor...');
    fixProfile();
  }
});

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', fixProfile);

// Hemen çalıştır
fixProfile();

// localStorage.setItem metodunu override et
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  // Orijinal metodu çağır
  originalSetItem.call(this, key, value);
  
  // erp_current_user veya erp_users_v2 güncellendiğinde, profil bilgilerini senkronize et
  if (key === 'erp_current_user' || key === 'erp_users_v2') {
    console.log(`${key} güncellendi, profil bilgileri senkronize ediliyor...`);
    setTimeout(fixProfile, 0); // Asenkron olarak çalıştır
  }
};
