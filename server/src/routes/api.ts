import { Router, Request, Response } from 'express';
import db from '../db';

const router = Router();

// Kullanıcıları getir
router.get('/users', async (req: Request, res: Response) => {
  try {
    let result;
    
    if (db.type === 'mysql') {
      const connection = await db.mysql();
      const [rows] = await connection.execute('SELECT id, email, name, role, department, phone, avatar_url, status, permissions, last_login, created_at, updated_at FROM users');
      result = rows;
      await connection.end();
    } else {
      const { rows } = await db.pg.query('SELECT id, email, name, role, department, phone, avatar_url, status, permissions, last_login, created_at, updated_at FROM users');
      result = rows;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Kullanıcılar getirilirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Müşterileri getir
router.get('/clients', async (req: Request, res: Response) => {
  try {
    let result;
    
    if (db.type === 'mysql') {
      const connection = await db.mysql();
      const [rows] = await connection.execute('SELECT * FROM clients');
      result = rows;
      await connection.end();
    } else {
      const { rows } = await db.pg.query('SELECT * FROM clients');
      result = rows;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Müşteriler getirilirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Görevleri getir
router.get('/tasks', async (req: Request, res: Response) => {
  try {
    let result;
    
    if (db.type === 'mysql') {
      const connection = await db.mysql();
      const [rows] = await connection.execute('SELECT * FROM tasks');
      result = rows;
      await connection.end();
    } else {
      const { rows } = await db.pg.query('SELECT * FROM tasks');
      result = rows;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Görevler getirilirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı girişi
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email ve şifre gerekli' });
  }
  
  try {
    let user: any = null;
    
    if (db.type === 'mysql') {
      const connection = await db.mysql();
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE email = ? LIMIT 1', 
        [email]
      ) as [any[], any];
      
      if (Array.isArray(users) && users.length > 0) {
        user = users[0];
      }
      await connection.end();
    } else {
      const result = await db.pg.query(
        'SELECT * FROM users WHERE email = $1 LIMIT 1',
        [email]
      );
      
      if (result.rows.length > 0) {
        user = result.rows[0];
      }
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }
    
    // Şifre kontrolü (gerçek uygulamada bcrypt kullanılmalı)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }
    
    // Şifreyi yanıttan çıkar
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    
    // Son giriş tarihini güncelle
    if (db.type === 'mysql') {
      const connection = await db.mysql();
      await connection.execute(
        'UPDATE users SET last_login = NOW() WHERE id = ?',
        [user.id]
      );
      await connection.end();
    } else {
      await db.pg.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );
    }
    
    return res.json(userWithoutPassword);
  } catch (error) {
    console.error('Giriş yapılırken hata:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
});

export default router;
