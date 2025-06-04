// Mock veri tanımlamaları
import { Task } from '../services/TaskService';
import { User } from '../services/UserService';

// Örnek kullanıcılar
export const mockUsers: User[] = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    email: 'ahmet@epazarla.com',
    role: 'Yönetici',
    department: 'Yönetim',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: 2,
    name: 'Ayşe Demir',
    email: 'ayse@epazarla.com',
    role: 'Pazarlama Uzmanı',
    department: 'Pazarlama',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
  },
  {
    id: 3,
    name: 'Mehmet Kaya',
    email: 'mehmet@epazarla.com',
    role: 'Yazılım Geliştirici',
    department: 'IT',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    id: 4,
    name: 'Zeynep Çelik',
    email: 'zeynep@epazarla.com',
    role: 'Grafik Tasarımcı',
    department: 'Tasarım',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg'
  },
  {
    id: 5,
    name: 'Mustafa Şahin',
    email: 'mustafa@epazarla.com',
    role: 'Müşteri Temsilcisi',
    department: 'Müşteri Hizmetleri',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg'
  }
];

// Örnek görevler - Boş dizi olarak tanımlandı, kullanıcının eklediği görevler localStorage'da tutulacak
export const mockTasks: Task[] = [];
