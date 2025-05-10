"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRouter = void 0;
const express_1 = __importDefault(require("express"));
const memory_db_1 = __importDefault(require("../memory-db"));
const router = express_1.default.Router();
exports.taskRouter = router;
// Görev oluşturma
router.post('/create', (req, res) => {
    (async () => {
        const { title, description, assigned_to, due_date } = req.body;
        if (!title || !assigned_to || !due_date) {
            return res.status(400).json({ error: 'Başlık, atanan kullanıcı ve bitiş tarihi zorunlu.' });
        }
        try {
            const task = await memory_db_1.default.createTask(title, description, assigned_to, due_date);
            res.status(201).json(task);
        }
        catch (err) {
            console.error('Görev oluşturma hatası:', err);
            res.status(500).json({ error: `Görev oluşturulamadı: ${err.message}` });
        }
    })();
});
// Görevleri listeleme
router.get('/list', (req, res) => {
    (async () => {
        try {
            const tasks = await memory_db_1.default.listTasks();
            res.json(tasks);
        }
        catch (err) {
            console.error('Görev listeleme hatası:', err);
            res.status(500).json({ error: `Görevler alınamadı: ${err.message}` });
        }
    })();
});
