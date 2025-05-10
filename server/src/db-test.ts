import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Veritabanı bağlantısı başarılı!');
    console.log('Veritabanı bağlantısı başarılı!');
    
    // Bağlantı bilgilerini almak için sorgu çalıştır
    const connectionInfo = await client.query('SELECT current_database() as database, current_user as user');
    console.log('Bağlantı bilgileri:', connectionInfo.rows[0]);
    
    // Mevcut tabloları listele
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Mevcut tablolar:', tablesResult.rows);
    
    client.release();
  } catch (error) {
    console.error('Veritabanı bağlantısı sırasında hata:', error);
  } finally {
    pool.end();
  }
};

testConnection();
