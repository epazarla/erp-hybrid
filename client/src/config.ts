// API yapılandırması

// Ortam değişkenlerini kontrol et ve uygun API URL'sini belirle
const isProduction = window.location.hostname !== 'localhost';

// Geliştirme ortamında localhost, üretim ortamında cPanel API URL'si
export const API_BASE_URL = isProduction 
  ? 'https://ahmetyagcioglu.info/erp-api' // cPanel'deki API endpoint'i
  : 'http://localhost:4000';

// Uygulama yapılandırması
export const APP_CONFIG = {
  appName: 'E-Pazarla ERP',
  version: '1.0.0',
  basePath: '/erp',
  apiTimeout: 30000, // 30 saniye
  defaultLanguage: 'tr-TR',
  debugMode: !isProduction
};
