import express, { Request, Response } from 'express';
import { backupDatabase, restoreDatabase, listBackups } from '../db-backup';

const router = express.Router();

// Yedekleme işlemi
router.post('/', (req: Request, res: Response) => {
  (async () => {
    try {
      const backupFile = await backupDatabase();
      res.json({ 
        success: true, 
        message: 'Veritabanı başarıyla yedeklendi', 
        backupFile 
      });
    } catch (error) {
      console.error('Yedekleme hatası:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Yedekleme sırasında bir hata oluştu' 
      });
    }
  })();
});

// Yedekleri listele
router.get('/', (req: Request, res: Response) => {
  (async () => {
    try {
      const backups = listBackups();
      res.json({ 
        success: true, 
        backups: backups.map(file => {
          const parts = file.split('\\');
          return {
            path: file,
            filename: parts[parts.length - 1],
            date: parts[parts.length - 1].replace('backup-', '').replace('.json', '')
          };
        })
      });
    } catch (error) {
      console.error('Yedek listeleme hatası:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Yedekler listelenirken bir hata oluştu' 
      });
    }
  })();
});

// Yedekten geri yükle
router.post('/restore', (req: Request, res: Response) => {
  (async () => {
    try {
      const { backupFile } = req.body;
      
      if (!backupFile) {
        return res.status(400).json({ 
          success: false, 
          message: 'Yedek dosyası belirtilmedi' 
        });
      }
      
      await restoreDatabase(backupFile);
      
      res.json({ 
        success: true, 
        message: 'Veritabanı başarıyla geri yüklendi' 
      });
    } catch (error) {
      console.error('Geri yükleme hatası:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Geri yükleme sırasında bir hata oluştu' 
      });
    }
  })();
});

export { router as backupRouter };
