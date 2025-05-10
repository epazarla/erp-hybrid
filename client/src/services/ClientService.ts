// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import ApiService from './ApiService';

// Müşteri arayüzü
export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  sector: string;
  taxNumber?: string;
  logo?: string;
  website?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  monthlyIncome?: number; // Aylık gelir miktarı
  paymentStatus?: 'paid' | 'pending' | 'overdue' | 'none'; // Ödeme durumu
  lastPaymentDate?: string; // Son ödeme tarihi
}

// Sabitler
export const CLIENTS_STORAGE_KEY = 'erp_clients_v1';
export const CLIENTS_UPDATED_EVENT = 'clientsUpdated';

// Sektör listesi
export const SECTORS = [
  'Teknoloji',
  'E-ticaret',
  'Üretim',
  'Hizmet',
  'Sağlık',
  'Eğitim',
  'Gıda',
  'İnşaat',
  'Tekstil',
  'Otomotiv',
  'Finans',
  'Diğer'
];

/**
 * API'den müşterileri yükler
 * @returns Promise<Client[]> Müşteri dizisi
 */
export const loadClientsFromAPI = async (): Promise<Client[]> => {
  try {
    console.log(`[${new Date().toISOString()}] API'den müşteriler yükleniyor`);
    
    // API'den müşterileri getir
    const clients = await ApiService.get<Client[]>('/clients');
    
    console.log(`[${new Date().toISOString()}] API'den ${clients.length} müşteri yüklendi`);
    return clients;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Müşteriler yüklenirken hata oluştu:`, error);
    // Hata durumunda boş bir dizi döndür
    return [];
  }
};

/**
 * LocalStorage'dan müşterileri yükler (yedek yöntem)
 * @returns Client dizisi
 */
export const loadClientsFromStorage = (): Client[] => {
  try {
    // localStorage'dan veriyi oku
    const savedClients = localStorage.getItem(CLIENTS_STORAGE_KEY);
    console.log(`[${new Date().toISOString()}] LocalStorage okuma (yedek):`, { key: CLIENTS_STORAGE_KEY, data: savedClients ? 'Veri var' : 'Veri yok' });
    
    if (savedClients) {
      try {
        // JSON parse et
        const parsedClients = JSON.parse(savedClients);
        
        // Dizi olup olmadığını kontrol et
        if (Array.isArray(parsedClients)) {
          // Müşterilerin geçerli Client nesneleri olduğunu kontrol et
          const validClients = parsedClients.filter(client => {
            return (
              client && 
              typeof client === 'object' && 
              typeof client.id === 'string' && 
              typeof client.name === 'string' && 
              typeof client.email === 'string'
            );
          });
          
          console.log(`[${new Date().toISOString()}] LocalStorage'dan ${validClients.length} geçerli müşteri yüklendi (yedek)`);
          return validClients;
        } else {
          console.error(`[${new Date().toISOString()}] Yüklenen veri bir dizi değil:`, parsedClients);
          return [];
        }
      } catch (parseError) {
        console.error(`[${new Date().toISOString()}] JSON parse hatası:`, parseError);
        return [];
      }
    } else {
      console.log(`[${new Date().toISOString()}] LocalStorage'da müşteri verisi bulunamadı`);
      return [];
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Müşteriler yüklenirken hata oluştu:`, error);
    return [];
  }
};

/**
 * Müşterileri LocalStorage'a kaydeder (olay tetiklemeden)
 * @param clients Kaydedilecek müşteriler
 * @returns Başarılı mı
 */
const _saveClientsToStorageInternal = (clients: Client[]): boolean => {
  if (!Array.isArray(clients)) {
    console.error(`[${new Date().toISOString()}] Kaydedilmeye çalışılan veri bir dizi değil`);
    return false;
  }

  try {
    // Verileri JSON formatına dönüştür
    const clientsJson = JSON.stringify(clients);
    
    // Önce mevcut veriyi temizle
    localStorage.removeItem(CLIENTS_STORAGE_KEY);
    
    // Yeni verileri kaydet
    localStorage.setItem(CLIENTS_STORAGE_KEY, clientsJson);
    
    // Doğrulama
    const savedData = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!savedData) {
      console.error(`[${new Date().toISOString()}] Veriler kaydedildi ancak geri okunamadı!`);
      return false;
    }
    
    console.log(`[${new Date().toISOString()}] ${clients.length} müşteri LocalStorage'a kaydedildi (olay tetiklemeden)`);
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Müşteriler kaydedilirken hata oluştu:`, error);
    return false;
  }
};

/**
 * Müşterileri LocalStorage'a kaydeder ve olayları tetikler
 * @param clients Kaydedilecek müşteriler
 * @returns Başarılı mı
 */
export const saveClientsToStorage = (clients: Client[]): boolean => {
  if (!Array.isArray(clients)) {
    console.error(`[${new Date().toISOString()}] Kaydedilmeye çalışılan veri bir dizi değil`);
    return false;
  }

  try {
    // Önce verileri kaydet
    const saveResult = _saveClientsToStorageInternal(clients);
    if (!saveResult) {
      return false;
    }
    
    // Olayları tetikle
    triggerClientsUpdatedEvent(clients);
    
    console.log(`[${new Date().toISOString()}] ${clients.length} müşteri LocalStorage'a kaydedildi ve olaylar tetiklendi`);
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Müşteriler kaydedilirken hata oluştu:`, error);
    return false;
  }
};

/**
 * Müşteri güncellendiğinde olayları tetikler
 * @param clients Güncel müşteriler
 */
export const triggerClientsUpdatedEvent = (clients: Client[]): void => {
  try {
    // Özel olayı tetikle
    const event = new CustomEvent(CLIENTS_UPDATED_EVENT, { 
      detail: { clients, timestamp: new Date().toISOString() } 
    });
    window.dispatchEvent(event);
    
    // Storage olayını tetikle
    window.dispatchEvent(new Event('storage'));
    
    console.log(`[${new Date().toISOString()}] Müşteri güncelleme olayları tetiklendi, müşteri sayısı: ${clients.length}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Olaylar tetiklenirken hata oluştu:`, error);
  }
};

/**
 * Tüm müşterileri getirir (aktif/pasif filtresi opsiyonel)
 * @param onlyActive Sadece aktif müşterileri getir
 * @returns Promise<Client[]> Müşteriler listesi
 */
export const getAllClients = async (onlyActive: boolean = false): Promise<Client[]> => {
  try {
    // API'den müşterileri yükle
    let clients: Client[] = await loadClientsFromAPI();
    
    // API bağlantısı başarısız olursa localStorage'dan dene
    if (clients.length === 0) {
      console.log(`[${new Date().toISOString()}] API bağlantısı başarısız, localStorage'dan yükleniyor`);
      clients = loadClientsFromStorage();
    }
    
    // Aktif filtresi varsa uygula
    if (onlyActive) {
      return clients.filter(client => client.isActive);
    }
    
    return clients;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Müşteriler getirilirken hata oluştu:`, error);
    // Hata durumunda localStorage'dan dene
    try {
      const localClients = loadClientsFromStorage();
      if (onlyActive) {
        return localClients.filter(client => client.isActive);
      }
      return localClients;
    } catch (localError) {
      console.error(`[${new Date().toISOString()}] LocalStorage'dan müşteriler yüklenirken hata:`, localError);
      return [];
    }
  }
};

/**
 * Yeni müşteri ekler
 * @param client Eklenecek müşteri (id, createdAt ve updatedAt hariç)
 * @returns Promise<Client | null> Eklenen müşteri veya null (hata durumunda)
 */
export const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client | null> => {
  try {
    // Müşteri verilerini doğrula
    if (!client || typeof client !== 'object') {
      console.error(`[${new Date().toISOString()}] Geçersiz müşteri verisi:`, client);
      return null;
    }
    
    if (!client.name || client.name.trim() === '') {
      console.error(`[${new Date().toISOString()}] Müşteri adı boş olamaz`);
      return null;
    }
    
    if (!client.email || client.email.trim() === '') {
      console.error(`[${new Date().toISOString()}] Müşteri e-posta adresi boş olamaz`);
      return null;
    }
    
    console.log(`[${new Date().toISOString()}] API ile yeni müşteri ekleniyor: ${client.name}`);
    
    try {
      // API'ye POST isteği gönder
      const newClient = await ApiService.post<Client>('/clients', {
        name: client.name,
        contactPerson: client.contactPerson,
        email: client.email,
        phone: client.phone,
        address: client.address,
        sector: client.sector,
        taxNumber: client.taxNumber,
        website: client.website,
        notes: client.notes,
        isActive: client.isActive,
        logo: client.logo,
        monthlyIncome: client.monthlyIncome,
        paymentStatus: client.paymentStatus,
        lastPaymentDate: client.lastPaymentDate
      });
      
      console.log(`[${new Date().toISOString()}] Yeni müşteri API ile eklendi: ${newClient.name} (ID: ${newClient.id})`);
      
      // Yedek olarak localStorage'a da kaydet
      try {
        const localClients = loadClientsFromStorage();
        localClients.push(newClient);
        _saveClientsToStorageInternal(localClients);
      } catch (localError) {
        console.warn(`[${new Date().toISOString()}] Müşteri localStorage'a kaydedilemedi:`, localError);
      }
      
      return newClient;
    } catch (apiError) {
      console.error(`[${new Date().toISOString()}] API ile müşteri eklenirken hata:`, apiError);
      
      // API başarısız olursa localStorage'a kaydet
      console.log(`[${new Date().toISOString()}] Müşteri localStorage'a ekleniyor (yedek yöntem)`);
      
      // Mevcut müşterileri localStorage'dan oku
      const clients = loadClientsFromStorage();
      
      // Yeni ID oluştur (UUID)
      const newId = uuidv4();
      const timestamp = new Date().toISOString();
      
      // Yeni müşteri nesnesi oluştur
      const newClient: Client = {
        id: newId,
        ...client,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      // Müşteriyi listeye ekle
      clients.push(newClient);
      
      // Güncel listeyi kaydet
      const saveResult = _saveClientsToStorageInternal(clients);
      
      if (saveResult) {
        console.log(`[${new Date().toISOString()}] Yeni müşteri localStorage'a eklendi: ${newClient.name} (ID: ${newClient.id})`);
        return newClient;
      } else {
        console.error(`[${new Date().toISOString()}] Müşteri localStorage'a kaydedilemedi`);
        return null;
      }
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Müşteri eklenirken hata oluştu:`, error);
    return null;
  }
};

/**
 * Müşteri günceller
 * @param client Güncellenecek müşteri
 * @returns Promise<Client | null> Güncellenen müşteri veya null (hata durumunda)
 */
export const updateClient = async (client: Client): Promise<Client | null> => {
  try {
    // Müşteri verilerini doğrula
    if (!client || typeof client !== 'object' || !client.id) {
      console.error(`[${new Date().toISOString()}] Geçersiz müşteri verisi:`, client);
      return null;
    }
    
    console.log(`[${new Date().toISOString()}] API ile müşteri güncelleniyor: ID=${client.id}`);
    
    try {
      // API'ye PUT isteği gönder
      const updatedClient = await ApiService.put<Client>(`/clients/${client.id}`, {
        name: client.name,
        contactPerson: client.contactPerson,
        email: client.email,
        phone: client.phone,
        address: client.address,
        sector: client.sector,
        taxNumber: client.taxNumber,
        website: client.website,
        notes: client.notes,
        isActive: client.isActive,
        logo: client.logo,
        monthlyIncome: client.monthlyIncome,
        paymentStatus: client.paymentStatus,
        lastPaymentDate: client.lastPaymentDate
      });
      
      console.log(`[${new Date().toISOString()}] Müşteri API ile güncellendi: ${updatedClient.name} (ID: ${updatedClient.id})`);
      
      // Yedek olarak localStorage'a da kaydet
      try {
        const localClients = loadClientsFromStorage();
        const clientIndex = localClients.findIndex(c => c.id === client.id);
        
        if (clientIndex !== -1) {
          localClients[clientIndex] = updatedClient;
          _saveClientsToStorageInternal(localClients);
        }
      } catch (localError) {
        console.warn(`[${new Date().toISOString()}] Müşteri localStorage'da güncellenemedi:`, localError);
      }
      
      return updatedClient;
    } catch (apiError) {
      console.error(`[${new Date().toISOString()}] API ile müşteri güncellenirken hata:`, apiError);
      
      // API başarısız olursa localStorage'a kaydet
      console.log(`[${new Date().toISOString()}] Müşteri localStorage'da güncelleniyor (yedek yöntem)`);
      
      // Mevcut müşterileri yükle
      const clients = loadClientsFromStorage();
      
      // Güncellenecek müşteriyi bul
      const clientIndex = clients.findIndex(c => c.id === client.id);
      
      if (clientIndex === -1) {
        console.error(`[${new Date().toISOString()}] Güncellenecek müşteri bulunamadı: ID=${client.id}`);
        return null;
      }
      
      // Müşteriyi güncelle
      const updatedClient: Client = {
        ...client,
        updatedAt: new Date().toISOString()
      };
      
      const updatedClients = [...clients];
      updatedClients[clientIndex] = updatedClient;
      
      // LocalStorage'a kaydet
      const saveResult = _saveClientsToStorageInternal(updatedClients);
      
      if (saveResult) {
        console.log(`[${new Date().toISOString()}] Müşteri localStorage'da güncellendi: ID=${client.id}`);
        return updatedClient;
      } else {
        console.error(`[${new Date().toISOString()}] Müşteri localStorage'da güncellenemedi`);
        return null;
      }
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Müşteri güncellenirken hata oluştu:`, error);
    return null;
  }
};

/**
 * Müşteri siler
 * @param clientId Silinecek müşteri ID'si
 * @returns Promise<boolean> Silme başarılı mı
 */
export const deleteClient = async (clientId: string): Promise<boolean> => {
  try {
    console.log(`[${new Date().toISOString()}] API ile müşteri siliniyor: ID=${clientId}`);
    
    try {
      // API'ye DELETE isteği gönder
      const response = await ApiService.delete<{message: string, client: Client}>(`/clients/${clientId}`);
      
      console.log(`[${new Date().toISOString()}] Müşteri API ile silindi: ID=${clientId}`);
      
      // Yedek olarak localStorage'dan da sil
      try {
        const localClients = loadClientsFromStorage();
        const clientIndex = localClients.findIndex(c => c.id === clientId);
        
        if (clientIndex !== -1) {
          localClients.splice(clientIndex, 1);
          _saveClientsToStorageInternal(localClients);
        }
      } catch (localError) {
        console.warn(`[${new Date().toISOString()}] Müşteri localStorage'dan silinemedi:`, localError);
      }
      
      return true;
    } catch (apiError) {
      console.error(`[${new Date().toISOString()}] API ile müşteri silinirken hata:`, apiError);
      
      // API başarısız olursa localStorage'dan sil
      console.log(`[${new Date().toISOString()}] Müşteri localStorage'dan siliniyor (yedek yöntem)`);
      
      // Mevcut müşterileri yükle
      const clients = loadClientsFromStorage();
      
      // Silinecek müşteriyi bul
      const clientIndex = clients.findIndex(c => c.id === clientId);
      
      if (clientIndex === -1) {
        console.error(`[${new Date().toISOString()}] Silinecek müşteri bulunamadı: ID=${clientId}`);
        return false;
      }
      
      // Müşteriyi sil
      clients.splice(clientIndex, 1);
      
      // Güncel listeyi kaydet
      const saveResult = _saveClientsToStorageInternal(clients);
      
      if (saveResult) {
        console.log(`[${new Date().toISOString()}] Müşteri localStorage'dan silindi: ID=${clientId}`);
        return true;
      } else {
        console.error(`[${new Date().toISOString()}] Müşteri localStorage'dan silinemedi`);
        return false;
      }
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Müşteri silinirken hata oluştu:`, error);
    return false;
  }
};

/**
 * Müşteri durumunu değiştirir (aktif/pasif)
 * @param clientId Müşteri ID'si
 * @param isActive Aktif mi
 * @returns Güncellenen müşteri veya null (hata durumunda)
 */
export const toggleClientStatus = (clientId: string, isActive: boolean): Client | null => {
  try {
    // Mevcut müşterileri yükle
    const clients = loadClientsFromStorage();
    
    // Güncellenecek müşteriyi bul
    const clientIndex = clients.findIndex(c => c.id === clientId);
    
    if (clientIndex === -1) {
      console.error(`[${new Date().toISOString()}] Güncellenecek müşteri bulunamadı: ID=${clientId}`);
      return null;
    }
    
    // Müşteri durumunu güncelle
    const updatedClient: Client = {
      ...clients[clientIndex],
      isActive,
      updatedAt: new Date().toISOString()
    };
    
    const updatedClients = [...clients];
    updatedClients[clientIndex] = updatedClient;
    
    // LocalStorage'a kaydet ve olayları tetikle
    const saveResult = saveClientsToStorage(updatedClients);
    
    if (saveResult) {
      console.log(`[${new Date().toISOString()}] Müşteri durumu güncellendi: ID=${clientId}, isActive=${isActive}`);
      return updatedClient;
    } else {
      console.error(`[${new Date().toISOString()}] Müşteri durumu güncellenemedi: Kaydetme hatası`);
      return null;
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Müşteri durumu güncellenirken hata oluştu:`, error);
    return null;
  }
};

/**
 * Müşteri bilgilerini ID'ye göre getirir
 * @param clientId Müşteri ID'si
 * @returns Promise<Client | null> Müşteri veya null (bulunamadıysa)
 */
export const getClientById = async (clientId: string): Promise<Client | null> => {
  try {
    console.log(`[${new Date().toISOString()}] API'den müşteri getiriliyor: ID=${clientId}`);
    
    try {
      // API'den müşteriyi getir
      const client = await ApiService.get<Client>(`/clients/${clientId}`);
      console.log(`[${new Date().toISOString()}] Müşteri API'den getirildi: ${client.name} (ID: ${client.id})`);
      return client;
    } catch (apiError) {
      console.error(`[${new Date().toISOString()}] API'den müşteri getirilirken hata:`, apiError);
      
      // API başarısız olursa localStorage'dan dene
      console.log(`[${new Date().toISOString()}] Müşteri localStorage'dan getiriliyor (yedek yöntem)`);
      
      // Mevcut müşterileri yükle
      const clients = loadClientsFromStorage();
      
      // Müşteriyi bul
      const client = clients.find(c => c.id === clientId);
      
      if (!client) {
        console.error(`[${new Date().toISOString()}] Müşteri bulunamadı: ID=${clientId}`);
        return null;
      }
      
      return client;
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Müşteri getirilirken hata oluştu:`, error);
    return null;
  }
};

/**
 * Örnek müşteri verileri oluşturur
 * @returns Örnek müşteri dizisi
 */
export const createDemoClients = (): Client[] => {
  const now = new Date();
  const lastMonth = new Date(now);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  return [
    {
      id: uuidv4(),
      name: 'Teknoloji A.Ş.',
      contactPerson: 'Ahmet Yılmaz',
      email: 'info@teknoloji.com',
      phone: '0212 555 1234',
      address: 'İstanbul, Maslak',
      sector: 'Teknoloji',
      taxNumber: '1234567890',
      website: 'www.teknoloji.com',
      notes: 'Web sitesi ve mobil uygulama projeleri',
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      monthlyIncome: 15000,
      paymentStatus: 'paid',
      lastPaymentDate: lastMonth.toISOString()
    },
    {
      id: uuidv4(),
      name: 'E-Ticaret Ltd.',
      contactPerson: 'Ayşe Demir',
      email: 'iletisim@eticaret.com',
      phone: '0216 444 5678',
      address: 'İzmir, Alsancak',
      sector: 'E-ticaret',
      taxNumber: '9876543210',
      website: 'www.eticaret.com',
      notes: 'Online satış platformu',
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      monthlyIncome: 8500,
      paymentStatus: 'pending',
      lastPaymentDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      name: 'Üretim Sanayi',
      contactPerson: 'Mehmet Kaya',
      email: 'info@uretimsanayi.com',
      phone: '0224 333 9876',
      address: 'Bursa, Nilüfer',
      sector: 'Üretim',
      taxNumber: '5678901234',
      website: 'www.uretimsanayi.com',
      notes: 'Endüstriyel üretim takip sistemi',
      createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      monthlyIncome: 12000,
      paymentStatus: 'paid',
      lastPaymentDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      name: 'Sağlık Merkezi',
      contactPerson: 'Zeynep Şahin',
      email: 'iletisim@saglikmerkezi.com',
      phone: '0312 222 3456',
      address: 'Ankara, Çankaya',
      sector: 'Sağlık',
      taxNumber: '3456789012',
      website: 'www.saglikmerkezi.com',
      notes: 'Hasta takip sistemi',
      createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: false,
      monthlyIncome: 7500,
      paymentStatus: 'overdue',
      lastPaymentDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      name: 'Eğitim Kurumu',
      contactPerson: 'Ali Öztürk',
      email: 'info@egitimkurumu.com',
      phone: '0232 111 2345',
      address: 'İzmir, Karşıyaka',
      sector: 'Eğitim',
      taxNumber: '6789012345',
      website: 'www.egitimkurumu.com',
      notes: 'Öğrenci bilgi sistemi',
      createdAt: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      monthlyIncome: 9000,
      paymentStatus: 'paid',
      lastPaymentDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};
