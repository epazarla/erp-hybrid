import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import memoryDB from '../memory-db';

const router = express.Router();

// Kullanıcı kaydı
router.post('/register', (req: Request, res: Response) => {
  (async () => {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
    }
    try {
      const hash = await bcrypt.hash(password, 10);
      const user = await memoryDB.createUser(email, hash, name, role);
      
      // Şifreyi döndürme
      const { password_hash, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (err: any) {
      console.error('Kayıt hatası:', err);
      res.status(500).json({ error: `Kayıt sırasında hata oluştu: ${err.message}` });
    }
  })();
});

// Kullanıcı girişi
router.post('/login', (req: Request, res: Response) => {
  (async () => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre zorunludur.' });
    }
    try {
      const user = await memoryDB.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Kullanıcı bulunamadı.' });
      }
      
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Şifre yanlış.' });
      }
      
      // Şifreyi döndürme
      const { password_hash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err: any) {
      console.error('Giriş hatası:', err);
      res.status(500).json({ error: `Giriş sırasında hata oluştu: ${err.message}` });
    }
  })();
});

export { router as userRouter };

