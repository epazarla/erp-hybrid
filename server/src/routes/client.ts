import express, { Request, Response } from 'express';
import { Client } from '../models';
// MongoDB kullanımı için import
import mongoDB from '../db-mongo';
// Yedek olarak memory-db'yi de import et
import memoryDB from '../memory-db';

const router = express.Router();

// Tüm müşterileri getir
router.get('/', (req: Request, res: Response) => {
  (async () => {
  try {
    // MongoDB bağlantısını sağla
    await mongoDB.connect();
    
    const clients = await mongoDB.listClients();
    res.json(clients);
  } catch (error) {
    console.error('Müşteriler getirilirken hata oluştu:', error);
    res.status(500).json({ error: 'Müşteriler getirilirken bir hata oluştu' });
  }
  })();
});

// ID'ye göre müşteri getir
router.get('/:id', (req: Request, res: Response) => {
  (async () => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Geçersiz ID formatı' });
    }
    
    // MongoDB bağlantısını sağla
    await mongoDB.connect();
    
    const client = await mongoDB.getClientById(id);
    
    if (!client) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Müşteri getirilirken hata oluştu:', error);
    res.status(500).json({ error: 'Müşteri getirilirken bir hata oluştu' });
  }
  })();
});

// Yeni müşteri ekle
router.post('/', (req: Request, res: Response) => {
  (async () => {
  try {
    const { 
      name, contactPerson, email, phone, address, sector, 
      taxNumber, website, notes, isActive, logo, 
      monthlyIncome, paymentStatus, lastPaymentDate 
    } = req.body;
    
    // MongoDB bağlantısını sağla
    await mongoDB.connect();
    
    const newClient = await mongoDB.createClient({
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
  } catch (error) {
    console.error('Müşteri eklenirken hata oluştu:', error);
    res.status(500).json({ error: 'Müşteri eklenirken bir hata oluştu' });
  }
  })();
});

// Müşteri güncelle
router.put('/:id', (req: Request, res: Response) => {
  (async () => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Geçersiz ID formatı' });
    }
    
    const { 
      name, contactPerson, email, phone, address, sector, 
      taxNumber, website, notes, isActive, logo, 
      monthlyIncome, paymentStatus, lastPaymentDate 
    } = req.body;
    
    // MongoDB bağlantısını sağla
    await mongoDB.connect();
    
    const updatedClient = await mongoDB.updateClient(id, {
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
  } catch (error) {
    console.error('Müşteri güncellenirken hata oluştu:', error);
    res.status(500).json({ error: 'Müşteri güncellenirken bir hata oluştu' });
  }
  })();
});

// Müşteri sil
router.delete('/:id', (req: Request, res: Response) => {
  (async () => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Geçersiz ID formatı' });
    }
    
    // MongoDB bağlantısını sağla
    await mongoDB.connect();
    
    const deletedClient = await mongoDB.deleteClient(id);
    
    if (!deletedClient) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    
    res.json({ message: 'Müşteri başarıyla silindi', client: deletedClient });
  } catch (error) {
    console.error('Müşteri silinirken hata oluştu:', error);
    res.status(500).json({ error: 'Müşteri silinirken bir hata oluştu' });
  }
  })();
});

// Sektörlere göre müşteri sayısını getir
// Not: Bu endpoint'in diğer GET /:id endpoint'inden önce tanımlanması gerekiyor
router.get('/stats/by-sector', (req: Request, res: Response) => {
  (async () => {
  try {
    // MongoDB bağlantısını sağla
    await mongoDB.connect();
    
    const clients = await mongoDB.listClients();
    
    // Sektörlere göre grupla
    const sectorCounts: {[key: string]: number} = {};
    
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
  } catch (error) {
    console.error('Sektör istatistikleri getirilirken hata oluştu:', error);
    res.status(500).json({ error: 'Sektör istatistikleri getirilirken bir hata oluştu' });
  }
  })();
});

export { router as clientRouter };
