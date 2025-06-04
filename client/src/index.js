// Profil bilgilerinin kalıcı olarak saklanmasını sağlayan özel kod
// Bu dosya, uygulamanın başlangıcında çalışır ve profil bilgilerinin kaybolmasını önler

// localStorage'dan mevcut kullanıcıyı al
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('erp_current_user');
    if (!userStr) {
      console.log('Mevcut kullanıcı bulunamadı');
      return null;
    }
    
    const user = JSON.parse(userStr);
    console.log('Mevcut kullanıcı yüklendi:', user);
    return user;
  } catch (error) {
    console.error('Mevcut kullanıcı yüklenirken hata oluştu:', error);
    return null;
  }
};

// localStorage'dan kullanıcı veritabanını al
const getUsersDatabase = () => {
  try {
    const usersStr = localStorage.getItem('erp_users_v2');
    if (!usersStr) {
      console.log('Kullanıcı veritabanı bulunamadı');
      return [];
    }
    
    const users = JSON.parse(usersStr);
    if (!Array.isArray(users)) {
      console.error('Kullanıcı veritabanı bir dizi değil');
      return [];
    }
    
    console.log('Kullanıcı veritabanı yüklendi:', users.length);
    return users;
  } catch (error) {
    console.error('Kullanıcı veritabanı yüklenirken hata oluştu:', error);
    return [];
  }
};

// Sayfa yüklendiğinde çalışacak kod
window.addEventListener('load', () => {
  // Mevcut kullanıcıyı al
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.log('Mevcut kullanıcı bulunamadı, senkronizasyon yapılmayacak');
    return;
  }
  
  // Kullanıcı veritabanını al
  const users = getUsersDatabase();
  if (!users || users.length === 0) {
    console.log('Kullanıcı veritabanı bulunamadı, senkronizasyon yapılmayacak');
    return;
  }
  
  // Kullanıcı veritabanında mevcut kullanıcıyı bul
  const userInDb = users.find(u => u.id === currentUser.id);
  if (!userInDb) {
    console.log('Kullanıcı veritabanında mevcut kullanıcı bulunamadı, senkronizasyon yapılmayacak');
    return;
  }
  
  // Mevcut kullanıcıyı güncelle
  localStorage.setItem('erp_current_user', JSON.stringify(userInDb));
  console.log('Mevcut kullanıcı senkronize edildi:', userInDb);
});

// localStorage değişikliklerini dinle
window.addEventListener('storage', (event) => {
  if (event.key === 'erp_users_v2' && event.newValue) {
    try {
      const users = JSON.parse(event.newValue);
      if (!Array.isArray(users)) {
        console.error('Kullanıcı veritabanı bir dizi değil');
        return;
      }
      
      // Mevcut kullanıcıyı al
      const currentUser = getCurrentUser();
      if (!currentUser) {
        console.log('Mevcut kullanıcı bulunamadı, senkronizasyon yapılmayacak');
        return;
      }
      
      // Kullanıcı veritabanında mevcut kullanıcıyı bul
      const userInDb = users.find(u => u.id === currentUser.id);
      if (!userInDb) {
        console.log('Kullanıcı veritabanında mevcut kullanıcı bulunamadı, senkronizasyon yapılmayacak');
        return;
      }
      
      // Mevcut kullanıcıyı güncelle
      localStorage.setItem('erp_current_user', JSON.stringify(userInDb));
      console.log('Mevcut kullanıcı senkronize edildi:', userInDb);
    } catch (error) {
      console.error('Kullanıcı veritabanı ayrıştırılırken hata oluştu:', error);
    }
  }
});
