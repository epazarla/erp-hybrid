# E-Pazarla ERP Hybrid

Bu proje, E-Pazarla için hibrit (masaüstü + web) çalışan, modern ve ücretsiz bir ERP sistemidir.

## Temel Teknolojiler
- React + TypeScript (arayüz)
- Tauri (masaüstü paketleme)
- Node.js (Express.js, backend)
- Memory-DB (geliştirme için bellek tabanlı veritabanı)
- Web Audio API & masaüstü bildirimler

## Modüller
1. Kullanıcı ve Rol Yönetimi
2. Görev Atama ve Takibi
3. Bildirim Sistemi (anlık & sesli)
4. Dashboard & Raporlama
5. Müşteri Yönetimi

## Kurulum ve Çalıştırma

### Ön Koşullar
- Node.js 16+ yüklü olmalıdır
- npm veya yarn paket yöneticisi yüklü olmalıdır

### Backend Kurulumu

```bash
# Server klasörüne git
cd server

# Bağımlılıkları yükle
npm install

# Geliştirme modunda çalıştır
npm run dev
```

Backend API varsayılan olarak http://localhost:4000 adresinde çalışacaktır.

### Frontend Kurulumu

```bash
# Client klasörüne git
cd client

# Bağımlılıkları yükle
npm install

# Geliştirme modunda çalıştır
npm run dev
```

Frontend uygulaması varsayılan olarak http://localhost:5177 adresinde çalışacaktır.

## Yedekleme ve Veri Güvenliği

Uygulama, bellek tabanlı veritabanı kullandığı için sunucu yeniden başlatıldığında veriler kaybolabilir. Bu nedenle otomatik yedekleme özelliği eklenmiştir.

### Otomatik Yedekleme

Sunucu çalıştığında, her 30 dakikada bir otomatik olarak veritabanı yedeklenir. Yedekler `server/backups` klasöründe saklanır.

### Manuel Yedekleme ve Geri Yükleme

Yedekleme API'si üzerinden manuel yedekleme ve geri yükleme işlemleri yapılabilir:

- **Yedekleme**: `POST /api/backup`
- **Yedekleri Listeleme**: `GET /api/backup`
- **Geri Yükleme**: `POST /api/backup/restore` (body: `{ "backupFile": "yedek/dosya/yolu.json" }`)

## Çevrimiçi Kullanım

Uygulamanın ekip arkadaşlarınızla çevrimiçi kullanımı için:

1. Backend API'yi bir sunucuya deploy edin (Render, Vercel, Railway vb.)
2. Frontend uygulamasını bir hosting servisine deploy edin (Vercel, Netlify vb.)
3. Frontend'de API_BASE_URL değişkenini güncelleyin

### Hızlı Paylaşım

Geliştirme aşamasında hızlı paylaşım için [ngrok](https://ngrok.com/) kullanabilirsiniz:

```bash
ngrok http 4000
```

## Yedekleme Stratejisi

1. **Otomatik Yedekleme**: Sunucu her 30 dakikada bir veritabanını otomatik olarak yedekler
2. **Manuel Yedekleme**: API üzerinden manuel yedekleme yapılabilir
3. **Proje Yedeği**: Tüm proje dosyalarının düzenli olarak yedeklenmesi önerilir
