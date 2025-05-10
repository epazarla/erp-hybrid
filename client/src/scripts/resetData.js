// Bu script, tüm localStorage verilerini temizleyip yeniden başlatır
// Konsol üzerinden çalıştırılabilir

function resetAllData() {
  console.log('Tüm verileri temizleme işlemi başlatılıyor...');
  
  // Tüm localStorage anahtarlarını temizle
  const keysToRemove = [
    // Görev anahtarları
    'erp_tasks_v6',
    'erp_tasks_v5',
    'erp_tasks_v4',
    'erp_tasks_v3',
    'erp_tasks_v2',
    'erp_tasks',
    'TASKS_INITIALIZED_V2',
    
    // Kullanıcı anahtarları
    'erp_users_v1',
    'erp_users',
    'USERS_INITIALIZED',
    'CURRENT_USER',
    
    // Müşteri anahtarları
    'erp_clients_v1',
    'erp_clients',
    'CLIENTS_INITIALIZED',
    
    // Diğer anahtarlar
    'erp_team_members',
    'erp_notifications'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`${key} anahtarı silindi`);
  });
  
  console.log('Tüm veriler temizlendi. Sayfayı yenileyerek yeni veriler oluşturulacak.');
  
  // Sayfayı yenile (isteğe bağlı)
  // window.location.reload();
}

// Fonksiyonu çalıştır
resetAllData();
