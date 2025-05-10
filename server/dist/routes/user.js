"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const memory_db_1 = __importDefault(require("../memory-db"));
const router = express_1.default.Router();
exports.userRouter = router;
// Kullanıcı kaydı
router.post('/register', (req, res) => {
    (async () => {
        const { email, password, name, role } = req.body;
        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
        }
        try {
            const hash = await bcryptjs_1.default.hash(password, 10);
            const user = await memory_db_1.default.createUser(email, hash, name, role);
            // Şifreyi döndürme
            const { password_hash, ...userWithoutPassword } = user;
            res.status(201).json(userWithoutPassword);
        }
        catch (err) {
            console.error('Kayıt hatası:', err);
            res.status(500).json({ error: `Kayıt sırasında hata oluştu: ${err.message}` });
        }
    })();
});
// Kullanıcı girişi
router.post('/login', (req, res) => {
    (async () => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'E-posta ve şifre zorunludur.' });
        }
        try {
            const user = await memory_db_1.default.getUserByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Kullanıcı bulunamadı.' });
            }
            const valid = await bcryptjs_1.default.compare(password, user.password_hash);
            if (!valid) {
                return res.status(401).json({ error: 'Şifre yanlış.' });
            }
            // Şifreyi döndürme
            const { password_hash, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        }
        catch (err) {
            console.error('Giriş hatası:', err);
            res.status(500).json({ error: `Giriş sırasında hata oluştu: ${err.message}` });
        }
    })();
});
