import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import apiRouter from './routes/api';

// Eski rotalar (yedek olarak tutuyoruz)
// import { userRouter } from './routes/user';
// import { taskRouter } from './routes/task';
// import { clientRouter } from './routes/client';

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
app.use('/api', apiRouter);

// Eski rotalar (yedek olarak tutuyoruz)
// app.use('/api/user', userRouter);
// app.use('/api/task', taskRouter);
// app.use('/api/client', clientRouter);

// Sağlık kontrolü endpoint'i
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', message: 'ERP Hybrid API çalışıyor!' });
});

// Geçici: Ana endpoint
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('E-Pazarla ERP Hybrid Backend API');
});

// Veritabanı bağlantı bilgilerini kontrol et
const checkDatabaseConfig = () => {
  const dbHost = process.env.DATABASE_HOST;
  const dbUser = process.env.DATABASE_USER;
  const dbPass = process.env.DATABASE_PASSWORD;
  const dbName = process.env.DATABASE_NAME;
  
  if (!dbHost || !dbUser || !dbPass || !dbName) {
    console.warn('⚠️ Veritabanı bağlantı bilgileri eksik! .env dosyasını kontrol edin.');
    console.warn('⚠️ Örnek: DATABASE_HOST=localhost DATABASE_USER=kullanici DATABASE_PASSWORD=sifre DATABASE_NAME=veritabani');
    return false;
  }
  
  return true;
};

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`✅ Backend API ${PORT} portunda çalışıyor...`);
  
  // Veritabanı bağlantı bilgilerini kontrol et
  if (checkDatabaseConfig()) {
    console.log(`✅ Veritabanı bağlantı bilgileri doğru görünüyor.`);
    console.log(`ℹ️ Veritabanı: ${process.env.DATABASE_TYPE} - ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`);
  }
  
  console.log(`ℹ️ API Endpoint: http://localhost:${PORT}/api`);
  console.log(`ℹ️ Sağlık Kontrolü: http://localhost:${PORT}/api/health`);
});
