// Veritabanı kurulum ve test verisi oluşturma scripti
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Supabase bağlantı bilgileri
const PROJECT_ID = 'moeiyqdkstvohvhdqipt';
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || `https://${PROJECT_ID}.supabase.co`;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZWl5cWRrc3R2b2h2aGRxaXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDMwNzQsImV4cCI6MjA2NTkxOTA3NH0.VeXJt54vngZFn71BODTDGGlkjALDAlFiq-LjkXwZ62c';

// Supabase client oluştur
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Kullanıcı tipi tanımı
interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
  approval_status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  failed_login_attempts: number;
}

// Müşteri tipi tanımı
interface Client {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Görev tipi tanımı
interface Task {
  id?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  assigned_to: string | null;
  client_id: string | null;
  created_at: string;
  updated_at: string;
}

// Test kullanıcıları
const testUsers: User[] = [
  {
    name: 'Admin Kullanıcı',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    approval_status: 'approved',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: null,
    failed_login_attempts: 0
  },
  {
    name: 'Test Kullanıcı',
    email: 'test@example.com',
    password: '123456',
    role: 'user',
    status: 'active',
    approval_status: 'approved',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: null,
    failed_login_attempts: 0
  }
];

// Test müşterileri
const testClients: Client[] = [
  {
    name: 'ABC Şirketi',
    email: 'info@abccompany.com',
    phone: '+90 212 555 1234',
    address: 'İstanbul, Türkiye',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: 'XYZ Teknoloji',
    email: 'contact@xyztech.com',
    phone: '+90 216 444 5678',
    address: 'Ankara, Türkiye',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Test görevleri
const testTasks: Task[] = [
  {
    title: 'Web sitesi tasarımı',
    description: 'Müşteri için yeni web sitesi tasarımı yapılacak',
    status: 'todo',
    priority: 'high',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: null, // Kullanıcı ID'si daha sonra atanacak
    client_id: null, // Müşteri ID'si daha sonra atanacak
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    title: 'Mobil uygulama geliştirme',
    description: 'Android ve iOS için mobil uygulama geliştirilecek',
    status: 'in_progress',
    priority: 'medium',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: null, // Kullanıcı ID'si daha sonra atanacak
    client_id: null, // Müşteri ID'si daha sonra atanacak
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Veritabanını kur ve test verilerini ekle
export const setupDatabase = async (): Promise<boolean> => {
  try {
    console.log('Veritabanı kurulumu başlatılıyor...');
    
    // Tabloları kontrol et ve gerekirse oluştur
    await createTablesIfNotExist();
    
    // Test kullanıcılarını ekle
    const userIds = await addTestUsers();
    
    // Test müşterilerini ekle
    const clientIds = await addTestClients();
    
    // Test görevlerini ekle
    if (userIds.length > 0 && clientIds.length > 0) {
      await addTestTasks(userIds, clientIds);
    }
    
    console.log('Veritabanı kurulumu tamamlandı!');
    return true;
  } catch (error) {
    console.error('Veritabanı kurulumu sırasında hata:', error);
    return false;
  }
};

// Tabloları kontrol et ve gerekirse oluştur
const createTablesIfNotExist = async (): Promise<boolean> => {
  try {
    // users tablosunu kontrol et
    const { error: usersError } = await supabase.from('users').select('count').limit(1);
    if (usersError && usersError.code === '42P01') { // Tablo bulunamadı hatası
      console.log('users tablosu bulunamadı, oluşturuluyor...');
      await supabase.rpc('create_users_table');
    }
    
    // clients tablosunu kontrol et
    const { error: clientsError } = await supabase.from('clients').select('count').limit(1);
    if (clientsError && clientsError.code === '42P01') { // Tablo bulunamadı hatası
      console.log('clients tablosu bulunamadı, oluşturuluyor...');
      await supabase.rpc('create_clients_table');
    }
    
    // tasks tablosunu kontrol et
    const { error: tasksError } = await supabase.from('tasks').select('count').limit(1);
    if (tasksError && tasksError.code === '42P01') { // Tablo bulunamadı hatası
      console.log('tasks tablosu bulunamadı, oluşturuluyor...');
      await supabase.rpc('create_tasks_table');
    }
    
    return true;
  } catch (error) {
    console.error('Tablo kontrolü sırasında hata:', error);
    return false;
  }
};

// Test kullanıcılarını ekle
const addTestUsers = async (): Promise<string[]> => {
  try {
    // Önce mevcut kullanıcıları kontrol et
    const { data: existingUsers, error: selectError } = await supabase
      .from('users')
      .select('id, email');
      
    if (selectError) {
      console.error('Kullanıcılar sorgulanırken hata:', selectError);
      return [];
    }
    
    const userIds: string[] = [];
    
    // Her test kullanıcısı için
    for (const user of testUsers) {
      // Kullanıcı zaten var mı kontrol et
      const existingUser = existingUsers?.find(u => u.email === user.email);
      
      if (existingUser) {
        console.log(`Kullanıcı zaten mevcut: ${user.email}, ID: ${existingUser.id}`);
        userIds.push(existingUser.id);
      } else {
        // Şifreyi hash'le
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const userWithHashedPassword = {
          ...user,
          password: hashedPassword
        };
        
        // Yeni kullanıcı ekle
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([userWithHashedPassword])
          .select();
          
        if (insertError) {
          console.error(`Kullanıcı eklenirken hata: ${user.email}`, insertError);
        } else if (newUser && newUser.length > 0) {
          console.log(`Yeni kullanıcı eklendi: ${user.email}, ID: ${newUser[0].id}`);
          userIds.push(newUser[0].id);
        }
      }
    }
    
    return userIds;
  } catch (error) {
    console.error('Test kullanıcıları eklenirken hata:', error);
    return [];
  }
};

// Test müşterilerini ekle
const addTestClients = async (): Promise<string[]> => {
  try {
    // Önce mevcut müşterileri kontrol et
    const { data: existingClients, error: selectError } = await supabase
      .from('clients')
      .select('id, email');
      
    if (selectError) {
      console.error('Müşteriler sorgulanırken hata:', selectError);
      return [];
    }
    
    const clientIds: string[] = [];
    
    // Her test müşterisi için
    for (const client of testClients) {
      // Müşteri zaten var mı kontrol et
      const existingClient = existingClients?.find(c => c.email === client.email);
      
      if (existingClient) {
        console.log(`Müşteri zaten mevcut: ${client.name}, ID: ${existingClient.id}`);
        clientIds.push(existingClient.id);
      } else {
        // Yeni müşteri ekle
        const { data: newClient, error: insertError } = await supabase
          .from('clients')
          .insert([client])
          .select();
          
        if (insertError) {
          console.error(`Müşteri eklenirken hata: ${client.name}`, insertError);
        } else if (newClient && newClient.length > 0) {
          console.log(`Yeni müşteri eklendi: ${client.name}, ID: ${newClient[0].id}`);
          clientIds.push(newClient[0].id);
        }
      }
    }
    
    return clientIds;
  } catch (error) {
    console.error('Test müşterileri eklenirken hata:', error);
    return [];
  }
};

// Test görevlerini ekle
const addTestTasks = async (userIds: string[], clientIds: string[]): Promise<boolean> => {
  try {
    if (userIds.length === 0 || clientIds.length === 0) {
      console.warn('Kullanıcı veya müşteri ID\'leri bulunamadı, görevler eklenemiyor.');
      return false;
    }
    
    // Görevlere kullanıcı ve müşteri ID'lerini ata
    const tasksWithIds = testTasks.map((task, index) => ({
      ...task,
      assigned_to: userIds[index % userIds.length],
      client_id: clientIds[index % clientIds.length]
    }));
    
    // Görevleri ekle
    const { data: newTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(tasksWithIds)
      .select();
      
    if (insertError) {
      console.error('Görevler eklenirken hata:', insertError);
      return false;
    }
    
    console.log(`${newTasks?.length || 0} yeni görev eklendi.`);
    return true;
  } catch (error) {
    console.error('Test görevleri eklenirken hata:', error);
    return false;
  }
};

// Veritabanı kurulumunu başlat
setupDatabase().then(success => {
  if (success) {
    console.log('Veritabanı başarıyla kuruldu ve test verileri eklendi.');
  } else {
    console.error('Veritabanı kurulumu tamamlanamadı.');
  }
});
