import express from 'express';
import type { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import apiRouter from './routes/api';
import { userRouter } from './routes/user';
import { User } from './models/User';

// Extend Express types
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Eski rotalar (yedek olarak tutuyoruz)
// import { userRouter } from './routes/user';
// Ortam değişkenlerini yükle
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api', apiRouter);
app.use('/api/users', userRouter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'ERP Hybrid API çalışıyor!',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'E-Pazarla ERP Hybrid Backend API',
    status: 'running',
    documentation: '/api-docs',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
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
const server = app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Listening on http://localhost:${PORT}`);
  
  // Veritabanı bağlantı bilgilerini kontrol et
  if (checkDatabaseConfig()) {
    console.log(`✅ Veritabanı bağlantı bilgileri doğru görünüyor.`);
    console.log(`ℹ️ Veritabanı: ${process.env.DATABASE_TYPE} - ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`);
  }
  
  console.log(`ℹ️ API Endpoint: http://localhost:${PORT}/api`);
  console.log(`ℹ️ Sağlık Kontrolü: http://localhost:${PORT}/api/health`);
});
