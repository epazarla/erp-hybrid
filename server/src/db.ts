import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Veritabanı tipine göre bağlantı oluştur
const dbType = process.env.DATABASE_TYPE || 'postgresql';

// MySQL bağlantısı (cPanel için)
const createMySQLConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });
};

// PostgreSQL bağlantısı (yedek olarak saklıyoruz)
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Veritabanı bağlantısını dışa aktar
const db = {
  mysql: createMySQLConnection,
  pg: pgPool,
  type: dbType
};

export default db;
