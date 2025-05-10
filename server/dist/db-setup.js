"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});
const createTables = async () => {
    try {
        // Users tablosunu oluştur
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Users tablosu oluşturuldu veya zaten var.');
        // Tasks tablosunu oluştur
        await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assigned_to INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'yeni',
        due_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Tasks tablosu oluşturuldu veya zaten var.');
        // Clients tablosunu oluştur
        await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        sector VARCHAR(100),
        tax_number VARCHAR(50),
        website VARCHAR(255),
        notes TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        logo TEXT,
        monthly_income NUMERIC,
        payment_status VARCHAR(50),
        last_payment_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Clients tablosu oluşturuldu veya zaten var.');
        console.log('Veritabanı tabloları başarıyla oluşturuldu!');
    }
    catch (error) {
        console.error('Veritabanı tabloları oluşturulurken hata:', error);
    }
    finally {
        // Bağlantıyı kapat
        pool.end();
    }
};
// Tabloları oluştur
createTables();
