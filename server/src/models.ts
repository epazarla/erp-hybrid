// Kullanıcı modeli
export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  created_at: Date;
}

// Görev modeli
export interface Task {
  id: number;
  title: string;
  description: string;
  assigned_to: number; // user id
  status: 'yeni' | 'devam' | 'tamamlandı';
  due_date: Date;
  created_at: Date;
}

// Bildirim modeli
export interface Notification {
  id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  created_at: Date;
}

// Müşteri modeli
export interface Client {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  sector: string;
  taxNumber: string;
  website: string;
  notes: string;
  isActive: boolean;
  logo?: string;
  monthlyIncome?: number;
  paymentStatus?: 'paid' | 'pending' | 'overdue';
  lastPaymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
