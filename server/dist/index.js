"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = require("./routes/user");
const task_1 = require("./routes/task");
const client_1 = require("./routes/client");
const backup_1 = require("./routes/backup");
const db_backup_1 = require("./db-backup");
const db_mongo_1 = __importDefault(require("./db-mongo"));
// Ortam değişkenlerini yükle
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)({
    origin: '*', // Tüm kaynaklardan gelen isteklere izin ver
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// API route'ları
app.use('/api/user', user_1.userRouter);
app.use('/api/task', task_1.taskRouter);
app.use('/api/client', client_1.clientRouter);
app.use('/api/backup', backup_1.backupRouter);
// Sağlık kontrolü endpoint'i
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ERP Hybrid API çalışıyor!' });
});
// Geçici: Ana endpoint
app.get('/', (req, res) => {
    res.send('E-Pazarla ERP Hybrid Backend API');
});
// MongoDB bağlantısını başlat
db_mongo_1.default.connect()
    .then(() => {
    // Sunucuyu başlat
    app.listen(PORT, () => {
        console.log(`Backend API ${PORT} portunda çalışıyor...`);
        console.log('MongoDB bağlantısı kuruldu');
        // Otomatik yedeklemeyi başlat (her 30 dakikada bir)
        const backupInterval = (0, db_backup_1.scheduleBackup)(30);
        // Uygulama kapanırken yedekleme zamanlayıcısını temizle
        process.on('SIGINT', async () => {
            console.log('Uygulama kapanıyor, yedekleme zamanlayıcısı durduruluyor...');
            clearInterval(backupInterval);
            await db_mongo_1.default.close();
            process.exit(0);
        });
    });
})
    .catch(error => {
    console.error('MongoDB bağlantı hatası:', error);
    process.exit(1);
});
