/**
 * ProfileFixer
 * Bu servis, profil bilgilerinin kalıcı olarak saklanmasını sağlar.
 * Doğrudan localStorage'a erişerek, profil bilgilerinin kaybolmasını önler.
 */

// Orijinal localStorage metodunu yedekle
const originalSetItem = localStorage.setItem;

// localStorage.setItem metodunu override et
localStorage.setItem = function(key: string, value: string) {
  // Orijinal metodu çağır
  originalSetItem.call(this, key, value);
  
  // erp_current_user güncellendiğinde, erp_users_v2'yi de güncelle
  if (key === 'erp_current_user') {
    try {
      const currentUser = JSON.parse(value);
      const usersStr = localStorage.getItem('erp_users_v2');
      
      if (usersStr) {
        const users = JSON.parse(usersStr);
        if (Array.isArray(users) && currentUser && currentUser.id) {
          const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
          
          if (userIndex !== -1) {
            // Kullanıcı veritabanını güncelle
            users[userIndex] = { ...users[userIndex], ...currentUser, id: currentUser.id };
            originalSetItem.call(localStorage, 'erp_users_v2', JSON.stringify(users));
            console.log('Kullanıcı veritabanı otomatik olarak güncellendi');
          }
        }
      }
    } catch (error) {
      console.error('Profil otomatik güncelleme hatası:', error);
    }
  }
  
  // erp_users_v2 güncellendiğinde, erp_current_user'ı da güncelle
  if (key === 'erp_users_v2') {
    try {
      const users = JSON.parse(value);
      const currentUserStr = localStorage.getItem('erp_current_user');
      
      if (currentUserStr && Array.isArray(users)) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser && currentUser.id) {
          const userInDb = users.find((u: any) => u.id === currentUser.id);
          
          if (userInDb) {
            // Mevcut kullanıcıyı güncelle
            originalSetItem.call(localStorage, 'erp_current_user', JSON.stringify(userInDb));
            console.log('Mevcut kullanıcı otomatik olarak güncellendi');
          }
        }
      }
    } catch (error) {
      console.error('Kullanıcı otomatik güncelleme hatası:', error);
    }
  }
};

/**
 * Profil bilgilerini senkronize et
 * Bu fonksiyon, sayfa yüklendiğinde çağrılır ve profil bilgilerinin senkronize olmasını sağlar.
 */
export const syncProfiles = (): void => {
  try {
    const currentUserStr = localStorage.getItem('erp_current_user');
    const usersStr = localStorage.getItem('erp_users_v2');
    
    if (!currentUserStr || !usersStr) {
      console.log('Senkronize edilecek veri bulunamadı');
      return;
    }
    
    const currentUser = JSON.parse(currentUserStr);
    const users = JSON.parse(usersStr);
    
    if (!Array.isArray(users) || !currentUser || !currentUser.id) {
      console.log('Geçersiz veri formatı');
      return;
    }
    
    const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
    
    if (userIndex !== -1) {
      // Her iki yöne de senkronize et
      const mergedUser = { ...users[userIndex], ...currentUser, id: currentUser.id };
      
      // Kullanıcı veritabanını güncelle
      users[userIndex] = mergedUser;
      originalSetItem.call(localStorage, 'erp_users_v2', JSON.stringify(users));
      
      // Mevcut kullanıcıyı güncelle
      originalSetItem.call(localStorage, 'erp_current_user', JSON.stringify(mergedUser));
      
      console.log('Profil bilgileri başarıyla senkronize edildi');
    }
  } catch (error) {
    console.error('Profil senkronizasyon hatası:', error);
  }
};

// Sayfa yüklendiğinde profil bilgilerini senkronize et
syncProfiles();

export default {
  syncProfiles
};
