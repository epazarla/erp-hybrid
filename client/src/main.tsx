import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './services/ProfileFixer';

// Profil bilgilerinin kalıcı olarak saklanmasını sağlayan kod
const syncUserProfile = () => {
  try {
    // Mevcut kullanıcıyı al
    const currentUserStr = localStorage.getItem('erp_current_user');
    if (!currentUserStr) {
      console.log('Mevcut kullanıcı bulunamadı, senkronizasyon yapılmayacak');
      return;
    }
    
    // Kullanıcı veritabanını al
    const usersStr = localStorage.getItem('erp_users_v2');
    if (!usersStr) {
      console.log('Kullanıcı veritabanı bulunamadı, senkronizasyon yapılmayacak');
      return;
    }
    
    // Verileri parse et
    const currentUser = JSON.parse(currentUserStr);
    const users = JSON.parse(usersStr);
    
    if (!Array.isArray(users)) {
      console.error('Kullanıcı veritabanı bir dizi değil');
      return;
    }
    
    // Kullanıcı veritabanında mevcut kullanıcıyı bul
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) {
      console.log('Kullanıcı veritabanında mevcut kullanıcı bulunamadı');
      return;
    }
    
    // Kullanıcı veritabanını güncelle
    users[userIndex] = { ...users[userIndex], ...currentUser, id: currentUser.id };
    localStorage.setItem('erp_users_v2', JSON.stringify(users));
    
    // Mevcut kullanıcıyı da güncelle (tam senkronizasyon için)
    localStorage.setItem('erp_current_user', JSON.stringify(users[userIndex]));
    
    console.log('Profil bilgileri senkronize edildi');
  } catch (error) {
    console.error('Profil senkronizasyonu sırasında hata oluştu:', error);
  }
};

// Sayfa yüklenirken profil bilgilerini senkronize et
syncUserProfile();

// localStorage değişikliklerini dinle
window.addEventListener('storage', (event) => {
  if (event.key === 'erp_users_v2' || event.key === 'erp_current_user') {
    console.log('localStorage değişti, profil bilgileri senkronize ediliyor...');
    syncUserProfile();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
