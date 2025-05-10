"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientRouter = void 0;
const express_1 = __importDefault(require("express"));
// MongoDB kullanımı için import
const db_mongo_1 = __importDefault(require("../db-mongo"));
const router = express_1.default.Router();
exports.clientRouter = router;
// Tüm müşterileri getir
router.get('/', (req, res) => {
    (async () => {
        try {
            // MongoDB bağlantısını sağla
            await db_mongo_1.default.connect();
            const clients = await db_mongo_1.default.listClients();
            res.json(clients);
        }
        catch (error) {
            console.error('Müşteriler getirilirken hata oluştu:', error);
            res.status(500).json({ error: 'Müşteriler getirilirken bir hata oluştu' });
        }
    })();
});
// ID'ye göre müşteri getir
router.get('/:id', (req, res) => {
    (async () => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'Geçersiz ID formatı' });
            }
            // MongoDB bağlantısını sağla
            await db_mongo_1.default.connect();
            const client = await db_mongo_1.default.getClientById(id);
            if (!client) {
                return res.status(404).json({ error: 'Müşteri bulunamadı' });
            }
            res.json(client);
        }
        catch (error) {
            console.error('Müşteri getirilirken hata oluştu:', error);
            res.status(500).json({ error: 'Müşteri getirilirken bir hata oluştu' });
        }
    })();
});
// Yeni müşteri ekle
router.post('/', (req, res) => {
    (async () => {
        try {
            const { name, contactPerson, email, phone, address, sector, taxNumber, website, notes, isActive, logo, monthlyIncome, paymentStatus, lastPaymentDate } = req.body;
            // MongoDB bağlantısını sağla
            await db_mongo_1.default.connect();
            const newClient = await db_mongo_1.default.createClient({
                name,
                contactPerson,
                email,
                phone,
                address,
                sector,
                taxNumber,
                website,
                notes,
                isActive,
                logo,
                monthlyIncome,
                paymentStatus,
                lastPaymentDate
            });
            res.status(201).json(newClient);
        }
        catch (error) {
            console.error('Müşteri eklenirken hata oluştu:', error);
            res.status(500).json({ error: 'Müşteri eklenirken bir hata oluştu' });
        }
    })();
});
// Müşteri güncelle
router.put('/:id', (req, res) => {
    (async () => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'Geçersiz ID formatı' });
            }
            const { name, contactPerson, email, phone, address, sector, taxNumber, website, notes, isActive, logo, monthlyIncome, paymentStatus, lastPaymentDate } = req.body;
            // MongoDB bağlantısını sağla
            await db_mongo_1.default.connect();
            const updatedClient = await db_mongo_1.default.updateClient(id, {
                name,
                contactPerson,
                email,
                phone,
                address,
                sector,
                taxNumber,
                website,
                notes,
                isActive,
                logo,
                monthlyIncome,
                paymentStatus,
                lastPaymentDate
            });
            if (!updatedClient) {
                return res.status(404).json({ error: 'Müşteri bulunamadı' });
            }
            res.json(updatedClient);
        }
        catch (error) {
            console.error('Müşteri güncellenirken hata oluştu:', error);
            res.status(500).json({ error: 'Müşteri güncellenirken bir hata oluştu' });
        }
    })();
});
// Müşteri sil
router.delete('/:id', (req, res) => {
    (async () => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'Geçersiz ID formatı' });
            }
            // MongoDB bağlantısını sağla
            await db_mongo_1.default.connect();
            const deletedClient = await db_mongo_1.default.deleteClient(id);
            if (!deletedClient) {
                return res.status(404).json({ error: 'Müşteri bulunamadı' });
            }
            res.json({ message: 'Müşteri başarıyla silindi', client: deletedClient });
        }
        catch (error) {
            console.error('Müşteri silinirken hata oluştu:', error);
            res.status(500).json({ error: 'Müşteri silinirken bir hata oluştu' });
        }
    })();
});
// Sektörlere göre müşteri sayısını getir
// Not: Bu endpoint'in diğer GET /:id endpoint'inden önce tanımlanması gerekiyor
router.get('/stats/by-sector', (req, res) => {
    (async () => {
        try {
            // MongoDB bağlantısını sağla
            await db_mongo_1.default.connect();
            const clients = await db_mongo_1.default.listClients();
            // Sektörlere göre grupla
            const sectorCounts = {};
            clients.forEach((client) => {
                const sector = client.sector || 'Diğer';
                sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
            });
            // Sonuçları dönüştür
            const result = Object.entries(sectorCounts).map(([sector, count]) => ({
                sector,
                count
            }));
            // Azalan sıraya göre sırala
            result.sort((a, b) => b.count - a.count);
            res.json(result);
        }
        catch (error) {
            console.error('Sektör istatistikleri getirilirken hata oluştu:', error);
            res.status(500).json({ error: 'Sektör istatistikleri getirilirken bir hata oluştu' });
        }
    })();
});
