import express, { Request, Response } from 'express';
import memoryDB from '../memory-db';

const router = express.Router();

// Görev oluşturma
router.post('/create', (req: Request, res: Response) => {
  (async () => {
    const { title, description, assigned_to, due_date } = req.body;
    if (!title || !assigned_to || !due_date) {
      return res.status(400).json({ error: 'Başlık, atanan kullanıcı ve bitiş tarihi zorunlu.' });
    }
    try {
      const task = await memoryDB.createTask(title, description, assigned_to, due_date);
      res.status(201).json(task);
    } catch (err: any) {
      console.error('Görev oluşturma hatası:', err);
      res.status(500).json({ error: `Görev oluşturulamadı: ${err.message}` });
    }
  })();
});

// Görevleri listeleme
router.get('/list', (req: Request, res: Response) => {
  (async () => {
    try {
      const tasks = await memoryDB.listTasks();
      res.json(tasks);
    } catch (err: any) {
      console.error('Görev listeleme hatası:', err);
      res.status(500).json({ error: `Görevler alınamadı: ${err.message}` });
    }
  })();
});

export { router as taskRouter };

