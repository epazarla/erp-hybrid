interface Task {
  id: number;
  title: string;
  description: string;
  assigned_to: number;
  status: string;
  due_date: string;
  created_at: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

export const mockTasks: Task[] = [
  {
    id: 1,
    title: "Yeni web sitesi tasarımı",
    description: "E-Pazarla için yeni web sitesi tasarımı yapılacak",
    assigned_to: 1, // Aktif kullanıcıya atanmış
    status: "in progress",
    due_date: "2025-04-25T10:00:00Z",
    created_at: "2025-04-10T09:00:00Z",
    priority: 'high' as 'high',
    category: "design"
  },
  {
    id: 2,
    title: "SEO optimizasyonu",
    description: "Mevcut web sitesi için SEO optimizasyonu yapılacak",
    assigned_to: 2, // Başka bir kullanıcıya atanmış
    status: "pending",
    due_date: "2025-04-30T14:00:00Z",
    created_at: "2025-04-12T11:30:00Z",
    priority: 'medium' as 'medium',
    category: "marketing"
  },
  {
    id: 3,
    title: "Sosyal medya kampanyası",
    description: "Yeni ürün lansmanı için sosyal medya kampanyası hazırlanacak",
    assigned_to: 1, // Aktif kullanıcıya atanmış
    status: "pending",
    due_date: "2025-05-05T09:00:00Z",
    created_at: "2025-04-15T13:45:00Z",
    priority: 'high' as 'high',
    category: "marketing"
  },
  {
    id: 4,
    title: "Müşteri raporları",
    description: "Aylık müşteri raporları hazırlanacak",
    assigned_to: 3, // Başka bir kullanıcıya atanmış
    status: "completed",
    due_date: "2025-04-15T17:00:00Z",
    created_at: "2025-04-05T10:20:00Z",
    priority: 'low' as 'low',
    category: "analytics"
  },
  {
    id: 5,
    title: "E-posta pazarlama",
    description: "Haftalık e-posta bülteni hazırlanacak",
    assigned_to: 1, // Aktif kullanıcıya atanmış
    status: "in progress",
    due_date: "2025-04-20T11:00:00Z",
    created_at: "2025-04-17T08:30:00Z",
    priority: 'medium' as 'medium',
    category: "marketing"
  },
  {
    id: 6,
    title: "Ürün fotoğrafları",
    description: "Yeni ürünler için fotoğraf çekimi yapılacak",
    assigned_to: 2, // Başka bir kullanıcıya atanmış
    status: "pending",
    due_date: "2025-04-28T15:30:00Z",
    created_at: "2025-04-16T14:15:00Z",
    priority: 'high' as 'high',
    category: "design"
  },
  {
    id: 7,
    title: "İçerik yazımı",
    description: "Blog için 5 yeni makale yazılacak",
    assigned_to: 1, // Aktif kullanıcıya atanmış
    status: "pending",
    due_date: "2025-05-10T16:00:00Z",
    created_at: "2025-04-18T09:45:00Z",
    priority: 'medium' as 'medium',
    category: "content"
  },
  {
    id: 8,
    title: "Analiz raporu",
    description: "Geçen ayın satış analizi raporu hazırlanacak",
    assigned_to: 3, // Başka bir kullanıcıya atanmış
    status: "completed",
    due_date: "2025-04-10T13:00:00Z",
    created_at: "2025-04-03T11:20:00Z",
    priority: 'high' as 'high',
    category: "analytics"
  }
];

export const mockUsers = [
  {
    id: 1,
    name: "Ahmet Yılmaz",
    email: "ahmet@epazarla.com",
    role: "admin"
  },
  {
    id: 2,
    name: "Ayşe Demir",
    email: "ayse@epazarla.com",
    role: "manager"
  },
  {
    id: 3,
    name: "Mehmet Kaya",
    email: "mehmet@epazarla.com",
    role: "user"
  }
];
