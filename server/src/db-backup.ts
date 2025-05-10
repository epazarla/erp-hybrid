import fs from 'fs';
import path from 'path';
import memoryDB from './memory-db';

// Yedekleme klasörü
const BACKUP_DIR = path.join(__dirname, '../backups');

// Yedekleme fonksiyonu
export const backupDatabase = async () => {
  try {
    // Yedekleme klasörünü oluştur (yoksa)
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Tarih formatını ayarla
    const now = new Date();
    const dateStr = now.toISOString().replace(/:/g, '-').replace(/\..+/, '');
    
    // Verileri al
    const users = await memoryDB.listUsers();
    const tasks = await memoryDB.listTasks();
    const clients = await memoryDB.listClients();
    
    // Yedek dosya adı
    const backupFile = path.join(BACKUP_DIR, `backup-${dateStr}.json`);
    
    // Verileri JSON olarak kaydet
    const data = {
      users,
      tasks,
      clients,
      timestamp: now.toISOString(),
      version: '1.0'
    };
    
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
    console.log(`Veritabanı yedeklendi: ${backupFile}`);
    
    return backupFile;
  } catch (error) {
    console.error('Veritabanı yedekleme hatası:', error);
    throw error;
  }
};

// Yedekten geri yükleme fonksiyonu
export const restoreDatabase = async (backupFile: string) => {
  try {
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Yedek dosyası bulunamadı: ${backupFile}`);
    }
    
    // Yedek dosyasını oku
    const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    // Verileri geri yükle
    if (data.users && Array.isArray(data.users)) {
      await memoryDB.restoreUsers(data.users);
    }
    
    if (data.tasks && Array.isArray(data.tasks)) {
      await memoryDB.restoreTasks(data.tasks);
    }
    
    if (data.clients && Array.isArray(data.clients)) {
      await memoryDB.restoreClients(data.clients);
    }
    
    console.log(`Veritabanı geri yüklendi: ${backupFile}`);
    return true;
  } catch (error) {
    console.error('Veritabanı geri yükleme hatası:', error);
    throw error;
  }
};

// Son yedekleri listele
export const listBackups = () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return [];
    }
    
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .map(file => path.join(BACKUP_DIR, file));
    
    // Dosyaları tarihe göre sırala (en yeniden en eskiye)
    files.sort((a, b) => {
      const statA = fs.statSync(a);
      const statB = fs.statSync(b);
      return statB.mtime.getTime() - statA.mtime.getTime();
    });
    
    return files;
  } catch (error) {
    console.error('Yedek listeleme hatası:', error);
    return [];
  }
};

// Otomatik yedekleme zamanla
export const scheduleBackup = (intervalMinutes: number = 60) => {
  console.log(`Otomatik yedekleme her ${intervalMinutes} dakikada bir çalışacak`);
  
  // İlk yedeklemeyi hemen yap
  backupDatabase().catch(console.error);
  
  // Sonraki yedeklemeleri zamanla
  const interval = intervalMinutes * 60 * 1000; // milisaniye cinsinden
  return setInterval(() => {
    backupDatabase().catch(console.error);
  }, interval);
};
