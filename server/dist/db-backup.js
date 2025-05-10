"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleBackup = exports.listBackups = exports.restoreDatabase = exports.backupDatabase = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const memory_db_1 = __importDefault(require("./memory-db"));
// Yedekleme klasörü
const BACKUP_DIR = path_1.default.join(__dirname, '../backups');
// Yedekleme fonksiyonu
const backupDatabase = async () => {
    try {
        // Yedekleme klasörünü oluştur (yoksa)
        if (!fs_1.default.existsSync(BACKUP_DIR)) {
            fs_1.default.mkdirSync(BACKUP_DIR, { recursive: true });
        }
        // Tarih formatını ayarla
        const now = new Date();
        const dateStr = now.toISOString().replace(/:/g, '-').replace(/\..+/, '');
        // Verileri al
        const users = await memory_db_1.default.listUsers();
        const tasks = await memory_db_1.default.listTasks();
        const clients = await memory_db_1.default.listClients();
        // Yedek dosya adı
        const backupFile = path_1.default.join(BACKUP_DIR, `backup-${dateStr}.json`);
        // Verileri JSON olarak kaydet
        const data = {
            users,
            tasks,
            clients,
            timestamp: now.toISOString(),
            version: '1.0'
        };
        fs_1.default.writeFileSync(backupFile, JSON.stringify(data, null, 2));
        console.log(`Veritabanı yedeklendi: ${backupFile}`);
        return backupFile;
    }
    catch (error) {
        console.error('Veritabanı yedekleme hatası:', error);
        throw error;
    }
};
exports.backupDatabase = backupDatabase;
// Yedekten geri yükleme fonksiyonu
const restoreDatabase = async (backupFile) => {
    try {
        if (!fs_1.default.existsSync(backupFile)) {
            throw new Error(`Yedek dosyası bulunamadı: ${backupFile}`);
        }
        // Yedek dosyasını oku
        const data = JSON.parse(fs_1.default.readFileSync(backupFile, 'utf8'));
        // Verileri geri yükle
        if (data.users && Array.isArray(data.users)) {
            await memory_db_1.default.restoreUsers(data.users);
        }
        if (data.tasks && Array.isArray(data.tasks)) {
            await memory_db_1.default.restoreTasks(data.tasks);
        }
        if (data.clients && Array.isArray(data.clients)) {
            await memory_db_1.default.restoreClients(data.clients);
        }
        console.log(`Veritabanı geri yüklendi: ${backupFile}`);
        return true;
    }
    catch (error) {
        console.error('Veritabanı geri yükleme hatası:', error);
        throw error;
    }
};
exports.restoreDatabase = restoreDatabase;
// Son yedekleri listele
const listBackups = () => {
    try {
        if (!fs_1.default.existsSync(BACKUP_DIR)) {
            return [];
        }
        const files = fs_1.default.readdirSync(BACKUP_DIR)
            .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
            .map(file => path_1.default.join(BACKUP_DIR, file));
        // Dosyaları tarihe göre sırala (en yeniden en eskiye)
        files.sort((a, b) => {
            const statA = fs_1.default.statSync(a);
            const statB = fs_1.default.statSync(b);
            return statB.mtime.getTime() - statA.mtime.getTime();
        });
        return files;
    }
    catch (error) {
        console.error('Yedek listeleme hatası:', error);
        return [];
    }
};
exports.listBackups = listBackups;
// Otomatik yedekleme zamanla
const scheduleBackup = (intervalMinutes = 60) => {
    console.log(`Otomatik yedekleme her ${intervalMinutes} dakikada bir çalışacak`);
    // İlk yedeklemeyi hemen yap
    (0, exports.backupDatabase)().catch(console.error);
    // Sonraki yedeklemeleri zamanla
    const interval = intervalMinutes * 60 * 1000; // milisaniye cinsinden
    return setInterval(() => {
        (0, exports.backupDatabase)().catch(console.error);
    }, interval);
};
exports.scheduleBackup = scheduleBackup;
