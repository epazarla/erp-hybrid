import { supabase } from '../lib/supabase';

// Müşteri arayüzü
export type PaymentStatus = 'none' | 'partial' | 'paid' | 'overdue';

export interface Client {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  sector: string;
  tax_number?: string;
  logo?: string;
  website?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  monthly_income?: number;
  payment_status: PaymentStatus;
  last_payment_date?: string;
}

// Sabitler
export const CLIENTS_UPDATED_EVENT = 'clientsUpdated';

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
] as const;

// Tablo adı
const CLIENTS_TABLE = 'clients';

/**
 * Tüm müşterileri getirir (aktif/pasif filtresi opsiyonel)
 * @param onlyActive Sadece aktif müşterileri getir
 * @returns Müşteriler listesi
 */
export const getAllClients = async (onlyActive: boolean = false): Promise<Client[]> => {
  try {
    let query = supabase
      .from(CLIENTS_TABLE)
      .select('*');
    
    if (onlyActive) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Müşteriler getirilirken hata oluştu:', error);
    return [];
  }
};

/**
 * Yeni müşteri ekler
 * @param client Eklenecek müşteri verileri
 * @returns Eklenen müşteri
 */
export const addClient = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client | null> => {
  try {
    const newClient = {
      ...client,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(CLIENTS_TABLE)
      .insert([newClient])
      .select()
      .single();

    if (error) throw error;
    
    // Müşteri güncellendi olayını tetikle
    triggerClientsUpdatedEvent(await getAllClients());
    
    return data;
  } catch (error) {
    console.error('Müşteri eklenirken hata oluştu:', error);
    return null;
  }
};

/**
 * Müşteri günceller
 * @param client Güncellenecek müşteri
 * @returns Güncellenen müşteri
 */
export const updateClient = async (client: Client): Promise<Client | null> => {
  try {
    const updatedClient = {
      ...client,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(CLIENTS_TABLE)
      .update(updatedClient)
      .eq('id', client.id)
      .select()
      .single();

    if (error) throw error;
    
    // Müşteri güncellendi olayını tetikle
    triggerClientsUpdatedEvent(await getAllClients());
    
    return data;
  } catch (error) {
    console.error('Müşteri güncellenirken hata oluştu:', error);
    return null;
  }
};

/**
 * Müşteri siler
 * @param clientId Silinecek müşteri ID'si
 * @returns Silme işlemi başarılı mı
 */
export const deleteClient = async (clientId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(CLIENTS_TABLE)
      .delete()
      .eq('id', clientId);

    if (error) throw error;
    
    // Müşteri güncellendi olayını tetikle
    triggerClientsUpdatedEvent(await getAllClients());
    
    return true;
  } catch (error) {
    console.error('Müşteri silinirken hata oluştu:', error);
    return false;
  }
};

/**
 * Müşteri durumunu değiştirir (aktif/pasif)
 * @param clientId Müşteri ID'si
 * @param isActive Yeni durum
 * @returns Güncellenen müşteri
 */
export const toggleClientStatus = async (clientId: string, isActive: boolean): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from(CLIENTS_TABLE)
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString() 
      })
      .eq('id', clientId)
      .select()
      .single();

    if (error) throw error;
    
    // Müşteri güncellendi olayını tetikle
    triggerClientsUpdatedEvent(await getAllClients());
    
    return data;
  } catch (error) {
    console.error('Müşteri durumu değiştirilirken hata oluştu:', error);
    return null;
  }
};

/**
 * Müşteri güncellendiğinde olay tetikler
 * @param clients Güncel müşteri listesi
 */
const triggerClientsUpdatedEvent = (clients: Client[]): void => {
  const event = new CustomEvent(CLIENTS_UPDATED_EVENT, { detail: { clients } });
  window.dispatchEvent(event);
};
