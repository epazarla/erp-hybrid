// Kullanıcı verisini localStorage'a kaydet
localStorage.setItem('erp_current_user', JSON.stringify({
  id: 1,
  name: 'Admin Kullanıcı',
  email: 'admin@firma.com',
  role: 'admin',
  department: 'Yönetim',
  created_at: new Date().toISOString()
}));
