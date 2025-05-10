"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupRouter = void 0;
const express_1 = __importDefault(require("express"));
const db_backup_1 = require("../db-backup");
const router = express_1.default.Router();
exports.backupRouter = router;
// Yedekleme işlemi
router.post('/', (req, res) => {
    (async () => {
        try {
            const backupFile = await (0, db_backup_1.backupDatabase)();
            res.json({
                success: true,
                message: 'Veritabanı başarıyla yedeklendi',
                backupFile
            });
        }
        catch (error) {
            console.error('Yedekleme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Yedekleme sırasında bir hata oluştu'
            });
        }
    })();
});
// Yedekleri listele
router.get('/', (req, res) => {
    (async () => {
        try {
            const backups = (0, db_backup_1.listBackups)();
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
        }
        catch (error) {
            console.error('Yedek listeleme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Yedekler listelenirken bir hata oluştu'
            });
        }
    })();
});
// Yedekten geri yükle
router.post('/restore', (req, res) => {
    (async () => {
        try {
            const { backupFile } = req.body;
            if (!backupFile) {
                return res.status(400).json({
                    success: false,
                    message: 'Yedek dosyası belirtilmedi'
                });
            }
            await (0, db_backup_1.restoreDatabase)(backupFile);
            res.json({
                success: true,
                message: 'Veritabanı başarıyla geri yüklendi'
            });
        }
        catch (error) {
            console.error('Geri yükleme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Geri yükleme sırasında bir hata oluştu'
            });
        }
    })();
});
