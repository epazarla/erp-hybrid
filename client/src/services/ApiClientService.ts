// ApiClientService.ts - API tabanlı müşteri servisi
import { Client, CLIENTS_UPDATED_EVENT, SECTORS } from './ClientService';

// API URL'i - Üretimde bu URL'i güncelleyin
// Örnek: 'https://erp-hybrid-api.vercel.app/api'
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// API'dan gelen müşteri verisini Client tipine dönüştürür
const mapApiClientToClient = (apiClient: any): Client => {
  return {
    id: apiClient.id.toString(),
    name: apiClient.name,
    contactPerson: apiClient.contact_person,
    email: apiClient.email,
    phone: apiClient.phone,
    address: apiClient.address,
    sector: apiClient.sector,
    taxNumber: apiClient.tax_number,
    website: apiClient.website,
    notes: apiClient.notes,
    isActive: apiClient.is_active,
    logo: apiClient.logo,
    monthlyIncome: apiClient.monthly_income,
    paymentStatus: apiClient.payment_status as any,
    lastPaymentDate: apiClient.last_payment_date,
    createdAt: apiClient.created_at,
    updatedAt: apiClient.updated_at
  };
};

// Client tipini API formatına dönüştürür
const mapClientToApiClient = (client: Client): any => {
  return {
    id: client.id,
    name: client.name,
    contact_person: client.contactPerson,
    email: client.email,
    phone: client.phone,
    address: client.address,
    sector: client.sector,
    tax_number: client.taxNumber,
    website: client.website,
    notes: client.notes,
    is_active: client.isActive,
    logo: client.logo,
    monthly_income: client.monthlyIncome,
    payment_status: client.paymentStatus,
    last_payment_date: client.lastPaymentDate,
    created_at: client.createdAt,
    updated_at: client.updatedAt
  };
};

/**
 * Müşteri güncellendiğinde olayları tetikler
 * @param clients Güncel müşteriler
 */
export const triggerClientsUpdatedEvent = (clients: Client[]): void => {
  try {
    // Özel olay oluştur ve tetikle
    const event = new CustomEvent(CLIENTS_UPDATED_EVENT, { detail: { clients } });
    window.dispatchEvent(event);
    console.log(`[${new Date().toISOString()}] Müşteri güncelleme olayı tetiklendi`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Olay tetiklenirken hata oluştu:`, error);
  }
};

/**
 * Tüm müşterileri API'dan getirir
 * @param onlyActive Sadece aktif müşterileri getir
 * @returns Promise<Client[]> Müşteriler listesi
 */
export const getAllClients = async (onlyActive: boolean = false): Promise<Client[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/client`);
    
    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }
    
    const apiClients = await response.json();
    let clients = apiClients.map(mapApiClientToClient);
    
    // Aktif filtresi uygulanacaksa
    if (onlyActive) {
      clients = clients.filter((client: Client) => client.isActive);
    }
    
    return clients;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Müşteriler getirilirken hata oluştu:`, error);
    return [];
  }
};

/**
 * Müşteri bilgilerini ID'ye göre API'dan getirir
 * @param clientId Müşteri ID'si
 * @returns Promise<Client | null> Müşteri veya null (bulunamadıysa)
 */
export const getClientById = async (clientId: string): Promise<Client | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/client/${clientId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API hatası: ${response.status}`);
    }
    
    const apiClient = await response.json();
    return mapApiClientToClient(apiClient);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Müşteri getirilirken hata oluştu:`, error);
    return null;
  }
};

/**
 * Yeni müşteri ekler
 * @param client Eklenecek müşteri (id, createdAt ve updatedAt hariç)
 * @returns Promise<Client | null> Eklenen müşteri veya null (hata durumunda)
 */
export const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/client`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: client.name,
        contact_person: client.contactPerson,
        email: client.email,
        phone: client.phone,
        address: client.address,
        sector: client.sector,
        tax_number: client.taxNumber,
        website: client.website,
        notes: client.notes,
        is_active: client.isActive,
        logo: client.logo,
        monthly_income: client.monthlyIncome,
        payment_status: client.paymentStatus,
        last_payment_date: client.lastPaymentDate
      })
    });
    
    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }
    
    const apiClient = await response.json();
    const newClient = mapApiClientToClient(apiClient);
    
    // Müşteri güncellendiğinde olayları tetikle
    const allClients = await getAllClients();
    triggerClientsUpdatedEvent(allClients);
    
    return newClient;
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
    const response = await fetch(`${API_BASE_URL}/client/${client.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: client.name,
        contact_person: client.contactPerson,
        email: client.email,
        phone: client.phone,
        address: client.address,
        sector: client.sector,
        tax_number: client.taxNumber,
        website: client.website,
        notes: client.notes,
        is_active: client.isActive,
        logo: client.logo,
        monthly_income: client.monthlyIncome,
        payment_status: client.paymentStatus,
        last_payment_date: client.lastPaymentDate
      })
    });
    
    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }
    
    const apiClient = await response.json();
    const updatedClient = mapApiClientToClient(apiClient);
    
    // Müşteri güncellendiğinde olayları tetikle
    const allClients = await getAllClients();
    triggerClientsUpdatedEvent(allClients);
    
    return updatedClient;
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
    const response = await fetch(`${API_BASE_URL}/client/${clientId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }
    
    // Müşteri güncellendiğinde olayları tetikle
    const allClients = await getAllClients();
    triggerClientsUpdatedEvent(allClients);
    
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Müşteri silinirken hata oluştu:`, error);
    return false;
  }
};

/**
 * Müşteri durumunu değiştirir (aktif/pasif)
 * @param clientId Müşteri ID'si
 * @param isActive Aktif mi
 * @returns Promise<Client | null> Güncellenen müşteri veya null (hata durumunda)
 */
export const toggleClientStatus = async (clientId: string, isActive: boolean): Promise<Client | null> => {
  try {
    // Önce müşteriyi getir
    const client = await getClientById(clientId);
    
    if (!client) {
      console.error(`[${new Date().toISOString()}] Müşteri bulunamadı: ID=${clientId}`);
      return null;
    }
    
    // Durumu güncelle
    client.isActive = isActive;
    
    // Müşteriyi güncelle
    return await updateClient(client);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Müşteri durumu güncellenirken hata oluştu:`, error);
    return null;
  }
};

/**
 * Örnek müşteri verilerini API'ya yükler
 * @returns Promise<boolean> Başarılı mı
 */
export const uploadDemoClients = async (): Promise<boolean> => {
  try {
    // Örnek müşterileri oluştur
    const demoClients = [
      {
        name: 'Teknoloji A.Ş.',
        contactPerson: 'Ahmet Yılmaz',
        email: 'info@teknoloji.com',
        phone: '0212 555 1234',
        address: 'İstanbul, Maslak',
        sector: 'Teknoloji',
        taxNumber: '1234567890',
        website: 'www.teknoloji.com',
        notes: 'Web sitesi ve mobil uygulama projeleri',
        isActive: true,
        monthlyIncome: 15000,
        paymentStatus: 'paid',
        lastPaymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'E-Ticaret Ltd.',
        contactPerson: 'Ayşe Demir',
        email: 'iletisim@eticaret.com',
        phone: '0216 444 5678',
        address: 'İzmir, Alsancak',
        sector: 'E-ticaret',
        taxNumber: '9876543210',
        website: 'www.eticaret.com',
        notes: 'Online satış platformu',
        isActive: true,
        monthlyIncome: 8500,
        paymentStatus: 'pending',
        lastPaymentDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Üretim Sanayi',
        contactPerson: 'Mehmet Kaya',
        email: 'info@uretimsanayi.com',
        phone: '0224 333 9876',
        address: 'Bursa, Nilüfer',
        sector: 'Üretim',
        taxNumber: '5678901234',
        website: 'www.uretimsanayi.com',
        notes: 'Endüstriyel üretim takip sistemi',
        isActive: true,
        monthlyIncome: 12000,
        paymentStatus: 'paid',
        lastPaymentDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    // Her bir müşteriyi ekle
    for (const client of demoClients) {
      await addClient(client as any);
    }
    
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Örnek müşteriler yüklenirken hata oluştu:`, error);
    return false;
  }
};
