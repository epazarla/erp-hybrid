import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Veritabanı kurulum scriptini import et
import { setupDatabase } from './db/setup-database';

// Veritabanını yenile
setupDatabase().then(success => {
  if (success) {
    console.log('✅ Veritabanı başarıyla güncellendi');
  } else {
    console.warn('⚠️ Veritabanı güncellenemedi, uygulama mevcut verilerle devam edecek');
  }
});

// Uygulamayı başlat
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element bulunamadı');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
