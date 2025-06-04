// Müşteri verilerini geri yükleyen script
import { createDemoClients, saveClientsToStorage } from './services/ClientService';

// Örnek müşteri verilerini oluştur
const demoClients = createDemoClients();

// LocalStorage'a kaydet
const result = saveClientsToStorage(demoClients);

console.log(`Müşteri verileri ${result ? 'başarıyla' : 'başarısız'} yüklendi. ${demoClients.length} müşteri eklendi.`);
