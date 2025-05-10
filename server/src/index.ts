import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRouter } from './routes/user';
import { taskRouter } from './routes/task';
import { clientRouter } from './routes/client';
import { backupRouter } from './routes/backup';
import { scheduleBackup, listBackups, restoreDatabase } from './db-backup';
// MongoDB bağlantısını kullan
import mongoDB from './db-mongo';
// Yedek olarak memory-db'yi de import et
import memoryDB from './memory-db';

// Ortam değişkenlerini yükle
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: '*', // Tüm kaynaklardan gelen isteklere izin ver
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API route'ları
app.use('/api/user', userRouter);
app.use('/api/task', taskRouter);
app.use('/api/client', clientRouter);
app.use('/api/backup', backupRouter);

// Sağlık kontrolü endpoint'i
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ERP Hybrid API çalışıyor!' });
});

// Geçici: Ana endpoint
app.get('/', (req, res) => {
  res.send('E-Pazarla ERP Hybrid Backend API');
});

// MongoDB bağlantısını başlat
mongoDB.connect()
  .then(() => {
    // Sunucuyu başlat
    app.listen(PORT, () => {
      console.log(`Backend API ${PORT} portunda çalışıyor...`);
      console.log('MongoDB bağlantısı kuruldu');
      
      // Otomatik yedeklemeyi başlat (her 30 dakikada bir)
      const backupInterval = scheduleBackup(30);
      
      // Uygulama kapanırken yedekleme zamanlayıcısını temizle
      process.on('SIGINT', async () => {
        console.log('Uygulama kapanıyor, yedekleme zamanlayıcısı durduruluyor...');
        clearInterval(backupInterval);
        await mongoDB.close();
        process.exit(0);
      });
    });
  })
  .catch(error => {
    console.error('MongoDB bağlantı hatası:', error);
    console.log('MongoDB bağlantısı başarısız, Memory-DB kullanılıyor...');
    
    // MongoDB bağlantısı başarısız olursa memory-db ile devam et
    app.listen(PORT, () => {
      console.log(`Backend API ${PORT} portunda çalışıyor...`);
      console.log('Memory-DB kullanılıyor (yedek yöntem)');
      
      // Otomatik yedeklemeyi başlat (her 30 dakikada bir)
      const backupInterval = scheduleBackup(30);
      
      // Uygulama kapanırken yedekleme zamanlayıcısını temizle
      process.on('SIGINT', () => {
        console.log('Uygulama kapanıyor, yedekleme zamanlayıcısı durduruluyor...');
        clearInterval(backupInterval);
        process.exit(0);
      });
    });
  });
