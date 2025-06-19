import { createClient } from '@supabase/supabase-js';

// Supabase proje bilgileri
const PROJECT_ID = 'zapavervgikfsmgrvjtu';

// Supabase bağlantı bilgileri - Çeşitli ortam değişkeni isimlerini destekle
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.SUPABASE_URL ||
  `https://${PROJECT_ID}.supabase.co`; // Yedek olarak proje ID'sinden URL oluştur

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcGF2ZXJ2Z2lrZnNtZ3J2anR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MjMyNTYsImV4cCI6MjA2NDk5OTI1Nn0.Ys1c5V8UfIzGGZU1Kke4eJ7ibTypY2ILEAOXK-AZDaA'; // Yedek olarak doğrudan anahtarı ekledik

// PostgreSQL doğrudan bağlantı bilgileri (NOT: Bu bilgiler sadece sunucu tarafı uygulamalarda kullanılmalıdır!)
// Vercel ortam değişkenlerini kullan
// Önemli: Bu fonksiyon sadece sunucu tarafında çağrılmalıdır!
const getPostgresPassword = () => {
  return import.meta.env.POSTGRES_PASSWORD || 
         process.env.POSTGRES_PASSWORD || 
         // Yerel geliştirme için config dosyasını kullan
         (() => {
           try {
             // Dinamik import kullanarak sadece gerektiğinde yükle
             const { DB_PASSWORD } = require('../config/db-config');
             return DB_PASSWORD;
           } catch (error) {
             console.warn('db-config.ts bulunamadı, ortam değişkenleri kullanılacak');
             return '';
           }
         })();
};

// PostgreSQL bağlantı bilgilerini oluştur
export const getPostgresConnections = () => {
  const password = getPostgresPassword();
  
  return {
    // Doğrudan bağlantı
    directConnection: `postgresql://postgres:${password}@db.${PROJECT_ID}.supabase.co:5432/postgres`,
    // Transaction pooler
    transactionPooler: `postgresql://postgres.${PROJECT_ID}:${password}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
    // Session pooler
    sessionPooler: `postgresql://postgres.${PROJECT_ID}:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`
  };
};


// Supabase bilgilerini kontrol et ve logla
console.log('Supabase bağlantı bilgileri:');
console.log('URL:', supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'Tanımlı değil');
console.log('Anon Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'Tanımlı değil');
console.log('Project ID:', PROJECT_ID);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase bağlantı bilgileri eksik.');
  console.error('SUPABASE_URL ve SUPABASE_ANON_KEY değerleri tanımlanmalıdır.');
  console.error('Desteklenen önekler: VITE_, NEXT_PUBLIC_ veya öneksiz');
}

// Gerçek Supabase client oluştur
export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey
);

// Bağlantı durumunu test et
export const testSupabaseConnection = async () => {
  try {
    console.log('Supabase bağlantı testi başlatılıyor...');
    console.log('Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Tanımlı değil');
    console.log('Supabase Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'Tanımlı değil');
    
    // Önce ping testi yap
    const { data: pingData, error: pingError } = await supabase.from('tasks').select('count').limit(1).maybeSingle();
    
    if (pingError) {
      console.warn('Supabase ping sorgusu hatası:', pingError.message);
      console.warn('Ping hata detayları:', pingError);
      
      // Alternatif tablo dene
      console.log('Alternatif tablo ile bağlantı testi deneniyor...');
      const { data: altData, error: altError } = await supabase.from('users').select('count').limit(1).maybeSingle();
      
      if (altError) {
        console.error('Alternatif tablo sorgusu da başarısız:', altError.message);
        throw new Error(`İki farklı tablo sorgusu da başarısız oldu: ${pingError.message} ve ${altError.message}`);
      }
      
      console.log('Alternatif tablo ile bağlantı başarılı:', altData);
      return true;
    }
    
    console.log('Supabase bağlantısı başarılı!', pingData);
    
    // Başarılı bağlantı bilgisini localStorage'a kaydet
    try {
      localStorage.setItem('supabase_connection_status', JSON.stringify({
        connected: true,
        timestamp: new Date().toISOString(),
        url: supabaseUrl.substring(0, 20) + '...'
      }));
    } catch (storageError) {
      console.warn('Bağlantı durumu localStorage\'a kaydedilemedi:', storageError);
    }
    
    return true;
  } catch (error: any) {
    console.error('Supabase bağlantı hatası:', error?.message || error);
    console.error('Hata detayları:', error);
    
    // Başarısız bağlantı bilgisini localStorage'a kaydet
    try {
      localStorage.setItem('supabase_connection_status', JSON.stringify({
        connected: false,
        timestamp: new Date().toISOString(),
        error: error?.message || 'Bilinmeyen hata'
      }));
    } catch (storageError) {
      console.warn('Bağlantı hatası localStorage\'a kaydedilemedi:', storageError);
    }
    
    return false;
  }
};

// Uygulama başlangıcında bağlantıyı test et
testSupabaseConnection().then(isConnected => {
  if (isConnected) {
    console.log('✅ Supabase bağlantısı hazır');
  } else {
    console.error('❌ Supabase bağlantısı başarısız - Uygulamada hatalar oluşabilir');
    console.info('Uygulama localStorage yedekleme mekanizmasını kullanacak');
  }
});

// Supabase bağlantı durumunu kontrol eden yardımcı fonksiyon
export const isSupabaseConnected = () => {
  try {
    const connectionStatus = localStorage.getItem('supabase_connection_status');
    if (connectionStatus) {
      const status = JSON.parse(connectionStatus);
      // Son 5 dakika içinde bağlantı başarılıysa true dön
      const timestamp = new Date(status.timestamp);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return status.connected && timestamp > fiveMinutesAgo;
    }
    return false; // Bilgi yoksa bağlantı durumunu bilinmiyor kabul et
  } catch (error) {
    console.warn('Bağlantı durumu kontrol edilirken hata:', error);
    return false;
  }
};
