// Bu script, örnek veriler oluşturur
// Konsol üzerinden çalıştırılabilir

function generateSampleData() {
  console.log('Örnek veriler oluşturuluyor...');
  
  // Örnek kullanıcılar
  const users = [
    {
      id: 1,
      name: "Ahmet Yağcıoğlu",
      role: "Yönetici",
      email: "ahmet@epazarla.com",
      phone: "+90 555 123 4567",
      department: "Yönetim",
      status: "active",
      tasks: 0,
      completedTasks: 0,
      registrationDate: "2024-01-15T10:30:00.000Z",
      approvalStatus: "approved"
    },
    {
      id: 2,
      name: "Ayşe Demir",
      role: "Yazılım Geliştirici",
      email: "ayse@epazarla.com",
      phone: "+90 555 234 5678",
      department: "Yazılım",
      status: "active",
      tasks: 0,
      completedTasks: 0,
      registrationDate: "2024-01-20T09:15:00.000Z",
      approvalStatus: "approved"
    },
    {
      id: 3,
      name: "Mehmet Kaya",
      role: "Satış Uzmanı",
      email: "mehmet@epazarla.com",
      phone: "+90 555 345 6789",
      department: "Satış",
      status: "active",
      tasks: 0,
      completedTasks: 0,
      registrationDate: "2024-02-05T14:45:00.000Z",
      approvalStatus: "approved"
    },
    {
      id: 4,
      name: "Zeynep Yılmaz",
      role: "Müşteri Temsilcisi",
      email: "zeynep@epazarla.com",
      phone: "+90 555 456 7890",
      department: "Müşteri İlişkileri",
      status: "active",
      tasks: 0,
      completedTasks: 0,
      registrationDate: "2024-02-10T11:20:00.000Z",
      approvalStatus: "approved"
    },
    {
      id: 5,
      name: "Ali Öztürk",
      role: "Pazarlama Uzmanı",
      email: "ali@epazarla.com",
      phone: "+90 555 567 8901",
      department: "Pazarlama",
      status: "active",
      tasks: 0,
      completedTasks: 0,
      registrationDate: "2024-02-15T13:10:00.000Z",
      approvalStatus: "approved"
    }
  ];
  
  // Örnek müşteriler
  const clients = [
    {
      id: "c1",
      name: "TechSoft Bilişim A.Ş.",
      contactPerson: "Emre Şahin",
      email: "info@techsoft.com",
      phone: "+90 212 555 1234",
      address: "Levent, İstanbul",
      sector: "Teknoloji",
      taxNumber: "1234567890",
      website: "www.techsoft.com",
      notes: "Büyük kurumsal müşteri",
      createdAt: "2024-01-10T08:30:00.000Z",
      updatedAt: "2024-04-15T14:20:00.000Z",
      isActive: true,
      monthlyIncome: 15000,
      paymentStatus: "paid",
      lastPaymentDate: "2024-04-10T10:15:00.000Z"
    },
    {
      id: "c2",
      name: "MobiShop E-Ticaret",
      contactPerson: "Selin Yıldız",
      email: "info@mobishop.com",
      phone: "+90 216 555 2345",
      address: "Kadıköy, İstanbul",
      sector: "E-ticaret",
      taxNumber: "2345678901",
      website: "www.mobishop.com",
      notes: "Hızlı büyüyen e-ticaret şirketi",
      createdAt: "2024-01-15T09:45:00.000Z",
      updatedAt: "2024-04-12T11:30:00.000Z",
      isActive: true,
      monthlyIncome: 8500,
      paymentStatus: "pending",
      lastPaymentDate: "2024-03-15T14:30:00.000Z"
    },
    {
      id: "c3",
      name: "MediPlus Sağlık Hizmetleri",
      contactPerson: "Dr. Canan Aksoy",
      email: "info@mediplus.com",
      phone: "+90 312 555 3456",
      address: "Çankaya, Ankara",
      sector: "Sağlık",
      taxNumber: "3456789012",
      website: "www.mediplus.com",
      notes: "Özel sağlık kuruluşu",
      createdAt: "2024-01-20T10:15:00.000Z",
      updatedAt: "2024-04-05T09:20:00.000Z",
      isActive: true,
      monthlyIncome: 12000,
      paymentStatus: "paid",
      lastPaymentDate: "2024-04-05T09:15:00.000Z"
    },
    {
      id: "c4",
      name: "EduSmart Eğitim Kurumları",
      contactPerson: "Prof. Kemal Yılmaz",
      email: "info@edusmart.com",
      phone: "+90 232 555 4567",
      address: "Konak, İzmir",
      sector: "Eğitim",
      taxNumber: "4567890123",
      website: "www.edusmart.com",
      notes: "Özel okul ve kurslar zinciri",
      createdAt: "2024-01-25T11:30:00.000Z",
      updatedAt: "2024-03-28T15:45:00.000Z",
      isActive: true,
      monthlyIncome: 9500,
      paymentStatus: "overdue",
      lastPaymentDate: "2024-02-25T16:20:00.000Z"
    },
    {
      id: "c5",
      name: "FoodFast Gıda Dağıtım",
      contactPerson: "Murat Demir",
      email: "info@foodfast.com",
      phone: "+90 242 555 5678",
      address: "Muratpaşa, Antalya",
      sector: "Gıda",
      taxNumber: "5678901234",
      website: "www.foodfast.com",
      notes: "Gıda tedarik ve dağıtım şirketi",
      createdAt: "2024-01-30T13:45:00.000Z",
      updatedAt: "2024-04-18T10:10:00.000Z",
      isActive: true,
      monthlyIncome: 7500,
      paymentStatus: "paid",
      lastPaymentDate: "2024-04-18T10:05:00.000Z"
    },
    {
      id: "c6",
      name: "BuildPro İnşaat",
      contactPerson: "Hakan Yılmaz",
      email: "info@buildpro.com",
      phone: "+90 322 555 6789",
      address: "Seyhan, Adana",
      sector: "İnşaat",
      taxNumber: "6789012345",
      website: "www.buildpro.com",
      notes: "Konut ve ticari inşaat firması",
      createdAt: "2024-02-05T14:30:00.000Z",
      updatedAt: "2024-04-02T11:25:00.000Z",
      isActive: true,
      monthlyIncome: 18000,
      paymentStatus: "pending",
      lastPaymentDate: "2024-03-05T15:40:00.000Z"
    },
    {
      id: "c7",
      name: "FashionStyle Tekstil",
      contactPerson: "Elif Şahin",
      email: "info@fashionstyle.com",
      phone: "+90 224 555 7890",
      address: "Osmangazi, Bursa",
      sector: "Tekstil",
      taxNumber: "7890123456",
      website: "www.fashionstyle.com",
      notes: "Hazır giyim üreticisi",
      createdAt: "2024-02-10T15:15:00.000Z",
      updatedAt: "2024-04-08T14:35:00.000Z",
      isActive: true,
      monthlyIncome: 14000,
      paymentStatus: "paid",
      lastPaymentDate: "2024-04-08T14:30:00.000Z"
    },
    {
      id: "c8",
      name: "AutoDrive Otomotiv",
      contactPerson: "Serkan Kaya",
      email: "info@autodrive.com",
      phone: "+90 262 555 8901",
      address: "İzmit, Kocaeli",
      sector: "Otomotiv",
      taxNumber: "8901234567",
      website: "www.autodrive.com",
      notes: "Otomotiv yedek parça distribütörü",
      createdAt: "2024-02-15T16:00:00.000Z",
      updatedAt: "2024-03-20T09:50:00.000Z",
      isActive: true,
      monthlyIncome: 11000,
      paymentStatus: "overdue",
      lastPaymentDate: "2024-02-15T16:45:00.000Z"
    }
  ];
  
  // Örnek görevler
  const tasks = [
    {
      id: 1,
      title: "Web sitesi tasarımı",
      description: "TechSoft için yeni web sitesi tasarımı yapılacak",
      assigned_to: 2,
      status: "Tamamlandı",
      due_date: "2024-03-15",
      created_at: "2024-02-20T09:00:00.000Z",
      priority: "high",
      category: "TechSoft Bilişim A.Ş."
    },
    {
      id: 2,
      title: "Mobil uygulama geliştirme",
      description: "MobiShop için Android ve iOS uygulaması geliştirilecek",
      assigned_to: 2,
      status: "Devam Ediyor",
      due_date: "2024-05-10",
      created_at: "2024-03-01T10:30:00.000Z",
      priority: "high",
      category: "MobiShop E-Ticaret"
    },
    {
      id: 3,
      title: "Pazarlama stratejisi",
      description: "MediPlus için yeni pazarlama stratejisi oluşturulacak",
      assigned_to: 5,
      status: "Bekliyor",
      due_date: "2024-05-20",
      created_at: "2024-03-10T14:15:00.000Z",
      priority: "medium",
      category: "MediPlus Sağlık Hizmetleri"
    },
    {
      id: 4,
      title: "Müşteri memnuniyeti anketi",
      description: "EduSmart için müşteri memnuniyeti anketi hazırlanacak",
      assigned_to: 4,
      status: "Tamamlandı",
      due_date: "2024-03-25",
      created_at: "2024-03-05T11:45:00.000Z",
      priority: "medium",
      category: "EduSmart Eğitim Kurumları"
    },
    {
      id: 5,
      title: "Tedarik zinciri optimizasyonu",
      description: "FoodFast için tedarik zinciri süreçleri optimize edilecek",
      assigned_to: 3,
      status: "Devam Ediyor",
      due_date: "2024-05-15",
      created_at: "2024-03-15T13:30:00.000Z",
      priority: "high",
      category: "FoodFast Gıda Dağıtım"
    },
    {
      id: 6,
      title: "Proje yönetim sistemi kurulumu",
      description: "BuildPro için proje yönetim sistemi kurulacak",
      assigned_to: 1,
      status: "Tamamlandı",
      due_date: "2024-04-05",
      created_at: "2024-03-20T09:15:00.000Z",
      priority: "high",
      category: "BuildPro İnşaat"
    },
    {
      id: 7,
      title: "E-ticaret entegrasyonu",
      description: "FashionStyle için e-ticaret platformu entegrasyonu yapılacak",
      assigned_to: 2,
      status: "Bekliyor",
      due_date: "2024-06-01",
      created_at: "2024-03-25T15:45:00.000Z",
      priority: "medium",
      category: "FashionStyle Tekstil"
    },
    {
      id: 8,
      title: "CRM sistemi kurulumu",
      description: "AutoDrive için CRM sistemi kurulacak",
      assigned_to: 1,
      status: "Devam Ediyor",
      due_date: "2024-05-25",
      created_at: "2024-03-30T10:00:00.000Z",
      priority: "high",
      category: "AutoDrive Otomotiv"
    },
    {
      id: 9,
      title: "Sosyal medya kampanyası",
      description: "TechSoft için sosyal medya kampanyası hazırlanacak",
      assigned_to: 5,
      status: "Tamamlandı",
      due_date: "2024-04-10",
      created_at: "2024-03-15T11:30:00.000Z",
      priority: "medium",
      category: "TechSoft Bilişim A.Ş."
    },
    {
      id: 10,
      title: "Müşteri destek sistemi",
      description: "MobiShop için müşteri destek sistemi kurulacak",
      assigned_to: 4,
      status: "Bekliyor",
      due_date: "2024-05-30",
      created_at: "2024-04-01T14:00:00.000Z",
      priority: "medium",
      category: "MobiShop E-Ticaret"
    },
    {
      id: 11,
      title: "Sağlık portalı geliştirme",
      description: "MediPlus için online sağlık portalı geliştirilecek",
      assigned_to: 2,
      status: "Devam Ediyor",
      due_date: "2024-06-15",
      created_at: "2024-04-05T09:30:00.000Z",
      priority: "high",
      category: "MediPlus Sağlık Hizmetleri"
    },
    {
      id: 12,
      title: "Online eğitim platformu",
      description: "EduSmart için online eğitim platformu geliştirilecek",
      assigned_to: 2,
      status: "Bekliyor",
      due_date: "2024-06-30",
      created_at: "2024-04-10T13:15:00.000Z",
      priority: "high",
      category: "EduSmart Eğitim Kurumları"
    },
    {
      id: 13,
      title: "Mobil sipariş uygulaması",
      description: "FoodFast için mobil sipariş uygulaması geliştirilecek",
      assigned_to: 2,
      status: "Tamamlandı",
      due_date: "2024-04-20",
      created_at: "2024-03-25T10:45:00.000Z",
      priority: "high",
      category: "FoodFast Gıda Dağıtım"
    },
    {
      id: 14,
      title: "İş takip sistemi",
      description: "BuildPro için iş takip sistemi geliştirilecek",
      assigned_to: 1,
      status: "Devam Ediyor",
      due_date: "2024-05-20",
      created_at: "2024-04-15T11:00:00.000Z",
      priority: "medium",
      category: "BuildPro İnşaat"
    },
    {
      id: 15,
      title: "Stok yönetim sistemi",
      description: "FashionStyle için stok yönetim sistemi kurulacak",
      assigned_to: 3,
      status: "Bekliyor",
      due_date: "2024-06-10",
      created_at: "2024-04-20T14:30:00.000Z",
      priority: "medium",
      category: "FashionStyle Tekstil"
    }
  ];
  
  // Verileri localStorage'a kaydet
  localStorage.setItem('erp_users_v1', JSON.stringify(users));
  localStorage.setItem('erp_clients_v1', JSON.stringify(clients));
  localStorage.setItem('erp_tasks_v6', JSON.stringify(tasks));
  
  // Mevcut kullanıcıyı ayarla
  localStorage.setItem('CURRENT_USER', JSON.stringify(users[0]));
  
  console.log('Örnek veriler başarıyla oluşturuldu. Sayfayı yenileyerek yeni verileri görebilirsiniz.');
}

// Fonksiyonu çalıştır
generateSampleData();
