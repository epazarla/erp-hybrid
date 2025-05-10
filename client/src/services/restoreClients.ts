// Müşteri verilerini geri yükleme scripti
import { createDemoClients, saveClientsToStorage } from './ClientService';

/**
 * Örnek müşteri verilerini oluşturup localStorage'a kaydeder
 */
export const restoreClientData = () => {
  try {
    // Örnek müşteri verilerini oluştur
    const demoClients = createDemoClients();
    
    // LocalStorage'a kaydet
    const success = saveClientsToStorage(demoClients);
    
    if (success) {
      console.log('Müşteri verileri başarıyla geri yüklendi:', demoClients.length);
      return {
        success: true,
        message: `${demoClients.length} müşteri başarıyla geri yüklendi.`,
        clients: demoClients
      };
    } else {
      console.error('Müşteri verileri geri yüklenirken bir hata oluştu');
      return {
        success: false,
        message: 'Müşteri verileri geri yüklenirken bir hata oluştu.',
        clients: []
      };
    }
  } catch (error) {
    console.error('Müşteri verileri geri yüklenirken bir hata oluştu:', error);
    return {
      success: false,
      message: `Hata: ${(error as Error).message}`,
      clients: []
    };
  }
};

// Otomatik olarak çalıştır - bu satırı kaldırabilirsiniz
restoreClientData();

export default restoreClientData;
