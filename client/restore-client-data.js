// Müşteri verilerini geri yükleme scripti
// Bu dosyayı tarayıcı konsolunda çalıştırmak için kopyalayıp yapıştırabilirsiniz

// Örnek müşteri verilerini oluştur
function createDemoClients() {
  const now = new Date();
  const lastMonth = new Date(now);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  return [
    {
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
}

// Müşteri verilerini localStorage'a kaydet
function restoreClientData() {
  try {
    const clients = createDemoClients();
    localStorage.setItem('erp_clients_v1', JSON.stringify(clients));
    console.log('✅ Müşteri verileri başarıyla geri yüklendi:', clients.length);
    return {
      success: true,
      message: `${clients.length} müşteri başarıyla geri yüklendi.`,
      clients: clients
    };
  } catch (error) {
    console.error('❌ Müşteri verileri geri yüklenirken bir hata oluştu:', error);
    return {
      success: false,
      message: `Hata: ${error.message}`,
      clients: []
    };
  }
}

// Müşteri verilerini geri yükle
const result = restoreClientData();
console.log('Sonuç:', result);
console.log('Sayfayı yenileyerek müşteri verilerinin yüklendiğini görebilirsiniz.');
