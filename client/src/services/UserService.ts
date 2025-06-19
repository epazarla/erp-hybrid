import { supabase, isSupabaseConnected } from '../lib/supabase';
import bcrypt from 'bcryptjs';
import { PostgrestError } from '@supabase/supabase-js';

// Kullanıcı durumları
export enum USER_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  VACATION = 'vacation',
  PENDING_APPROVAL = 'pending_approval',
  REJECTED = 'rejected'
};

// Kullanıcı rolleri
export enum USER_ROLE {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  HR = 'hr',
  FINANCE = 'finance',
  MARKETING = 'marketing',
  SALES = 'sales',
  DEVELOPER = 'developer',
  DESIGNER = 'designer'
};

// LocalStorage anahtarları (sadece geçici kullanım için)
export const CURRENT_USER_STORAGE_KEY = 'erp_current_user';
export const USERS_STORAGE_KEY = 'erp_users';

// Event anahtarları
export const USERS_UPDATED_EVENT = 'usersUpdated';
export const USER_SWITCHED_EVENT = 'userSwitched';
export const USER_APPROVAL_REQUESTED_EVENT = 'userApprovalRequested';
export const USER_UPDATED_EVENT = 'usersUpdated';
export const USER_APPROVED_EVENT = 'userApproved';
export const USER_REJECTED_EVENT = 'userRejected';

// Şifre hashleme için salt rounds
const SALT_ROUNDS = 10;

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phone?: string;
  avatar?: string;
  role?: string;
  department?: string;
  is_active?: boolean;
  status?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  registration_date?: string; // ISO tarih formatı
  approval_date?: string; // ISO tarih formatı
  approved_by?: number; // admin user id
  tasks_count?: number;
  completed_tasks_count?: number;
  password?: string; // Hash'lenmiş şifre
  team_id?: number;
  is_admin?: boolean;
  permissions?: string[];
  last_login?: string; // ISO tarih formatı
  failed_login_attempts?: number;
  password_reset_token?: string;
  password_reset_expires?: string; // ISO tarih formatı
}

// Frontend için kullanıcı arayüzü (camelCase)
export interface UserView {
  id: number;
  name: string;
  email: string;
  username: string;
  phone?: string;
  avatar?: string;
  role?: string;
  department?: string;
  isActive?: boolean;
  status?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  registrationDate?: Date;
  approvalDate?: Date;
  approvedBy?: number;
  tasks?: number;
  completedTasks?: number;
  teamId?: number;
  isAdmin?: boolean;
  permissions?: string[];
  lastLogin?: Date;
  failedLoginAttempts?: number;
}

/**
 * Supabase'den kullanıcı verisini UserView formatına dönüştürür
 */
const mapUserToUserView = (user: User): UserView => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    department: user.department,
    isActive: user.is_active,
    status: user.status,
    approvalStatus: user.approval_status,
    registrationDate: user.registration_date ? new Date(user.registration_date) : undefined,
    approvalDate: user.approval_date ? new Date(user.approval_date) : undefined,
    approvedBy: user.approved_by,
    tasks: user.tasks_count,
    completedTasks: user.completed_tasks_count,
    teamId: user.team_id,
    isAdmin: user.is_admin,
    permissions: user.permissions,
    lastLogin: user.last_login ? new Date(user.last_login) : undefined,
    failedLoginAttempts: user.failed_login_attempts
  };
};

/**
 * Tüm kullanıcıları Supabase'den yükler
 */
export const loadAllUsers = async (): Promise<UserView[]> => {
  try {
    console.log('UserService: Tüm kullanıcılar yükleniyor...');
    
    // Önce Supabase bağlantı durumunu kontrol et
    if (isSupabaseConnected()) {
      const { data, error } = await supabase
        .from('users')
        .select('*');
        
      if (error) {
        console.error('UserService: Kullanıcılar yüklenirken Supabase hatası:', error);
        // Hata durumunda localStorage'a bak
      } else if (data && data.length > 0) {
        console.log(`UserService: ${data.length} kullanıcı Supabase'den yüklendi`);
        
        // Başarılı veriyi localStorage'a yedekle
        try {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data));
          console.log('UserService: Kullanıcılar localStorage\'a yedeklendi');
        } catch (cacheError) {
          console.warn('UserService: Kullanıcılar localStorage\'a yedeklenemedi:', cacheError);
        }
        
        return (data as User[]).map(mapUserToUserView);
      }
    } else {
      console.warn('UserService: Supabase bağlantısı mevcut değil, localStorage\'dan yükleniyor');
    }
    
    // Supabase bağlantı hatası veya bağlantı yoksa localStorage'dan yedek veriyi yükle
    try {
      const cachedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (cachedUsers) {
        const users = JSON.parse(cachedUsers) as User[];
        console.log(`UserService: Yedekten ${users.length} kullanıcı yüklendi`);
        return users.map(mapUserToUserView);
      }
    } catch (cacheError) {
      console.error('UserService: Yedek kullanıcı verisi yüklenirken hata:', cacheError);
    }
    
    console.warn('UserService: Kullanıcı verisi bulunamadı');
    return [];
  } catch (error) {
    console.error('UserService: Kullanıcılar yüklenirken beklenmeyen hata:', error);
    return [];
  }
};

/**
 * Onay bekleyen kullanıcıları Supabase'den yükler
 */
export const loadPendingApprovalUsers = async (): Promise<UserView[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('approval_status', 'pending');
      
    if (error) {
      console.error('Onay bekleyen kullanıcılar yüklenirken hata oluştu:', error);
      return [];
    }
    
    return (data as User[]).map(mapUserToUserView);
  } catch (error) {
    console.error('Onay bekleyen kullanıcılar yüklenirken beklenmeyen hata:', error);
    return [];
  }
};

/**
 * Kullanıcıyı onaylar (Supabase versiyonu)
 * @param userId Onaylanacak kullanıcı ID'si
 * @param adminId Onaylayan yönetici ID'si
 * @returns Başarılı mı
 */
export const approveUserAsync = async (userId: number, adminId: number): Promise<boolean> => {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        approval_status: 'approved', 
        status: USER_STATUS.ACTIVE,
        is_active: true,
        approval_date: now,
        approved_by: adminId
      })
      .eq('id', userId)
      .select();
      
    if (error) {
      console.error(`Kullanıcı onaylanırken hata oluştu (ID=${userId}):`, error);
      return false;
    }
    
    // Onay olayını tetikle
    try {
      const event = new CustomEvent(USER_APPROVED_EVENT, { 
        detail: { user: data[0], timestamp: new Date().getTime() } 
      });
      window.dispatchEvent(event);
    } catch (eventError) {
      console.error('Kullanıcı onay olayı tetiklenirken hata oluştu:', eventError);
    }
    
    return true;
  } catch (error) {
    console.error('Kullanıcı onaylanırken beklenmeyen hata:', error);
    return false;
  }
};

/**
 * Kullanıcı onayını reddeder (Supabase versiyonu)
 * @param userId Reddedilecek kullanıcı ID'si
 * @param adminId Reddeden yönetici ID'si
 * @returns Başarılı mı
 */
export const rejectUserAsync = async (userId: number, adminId: number): Promise<boolean> => {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        approval_status: 'rejected', 
        status: USER_STATUS.REJECTED,
        is_active: false,
        approval_date: now,
        approved_by: adminId
      })
      .eq('id', userId)
      .select();
      
    if (error) {
      console.error(`Kullanıcı reddedilirken hata oluştu (ID=${userId}):`, error);
      return false;
    }
    
    // Red olayını tetikle
    try {
      const event = new CustomEvent(USER_REJECTED_EVENT, { 
        detail: { user: data[0], timestamp: new Date().getTime() } 
      });
      window.dispatchEvent(event);
    } catch (eventError) {
      console.error('Kullanıcı red olayı tetiklenirken hata oluştu:', eventError);
    }
    
    return true;
  } catch (error) {
    console.error('Kullanıcı reddedilirken beklenmeyen hata:', error);
    return false;
  }
};

/**
 * Kullanıcı girişi yapar
 * @param email Kullanıcı e-posta adresi
 * @param password Kullanıcı şifresi
 * @returns Giriş sonucu
 */
export const loginUser = async (email: string, password: string): Promise<{ success: boolean; message?: string; user?: UserView }> => {
  try {
    console.log('UserService: Kullanıcı girişi yapılıyor...');
    
    // E-posta ve şifre kontrolü
    if (!email.trim() || !password.trim()) {
      return { success: false, message: 'E-posta ve şifre gerekli' };
    }
    
    // Önce Supabase bağlantı durumunu kontrol et
    if (!isSupabaseConnected()) {
      console.warn('UserService: Supabase bağlantısı mevcut değil, çevrimdışı giriş denenecek');
      
      // Çevrimdışı giriş için localStorage'dan kullanıcıları yükle
      try {
        const cachedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (cachedUsers) {
          const users = JSON.parse(cachedUsers) as User[];
          const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
          
          if (!user) {
            return { success: false, message: 'Geçersiz e-posta veya şifre (offline)' };
          }
          
          // Şifre kontrolü
          if (user.password !== password) {
            console.warn('UserService: Çevrimdışı modda geçersiz şifre');
            return { success: false, message: 'Geçersiz e-posta veya şifre (offline)' };
          }
          
          // Kullanıcı aktif mi kontrol et
          if (user.status === USER_STATUS.INACTIVE || user.is_active === false) {
            return { success: false, message: 'Hesabınız aktif değil (offline)' };
          }
          
          // Son giriş tarihini güncelle (sadece localStorage'da)
          const now = new Date().toISOString();
          const updatedUser = { ...user, last_login: now };
          
          // Kullanıcıyı localStorage'a kaydet
          localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedUser));
          console.log('UserService: Çevrimdışı giriş başarılı');
          
          // Giriş başarılı
          return { 
            success: true, 
            user: mapUserToUserView(updatedUser),
            message: 'Offline modda giriş yapıldı. İnternet bağlantınızı kontrol edin.'
          };
        } else {
          return { success: false, message: 'Supabase bağlantısı yok ve önceden kaydedilmiş kullanıcı verisi bulunamadı' };
        }
      } catch (offlineError) {
        console.error('UserService: Çevrimdışı giriş sırasında hata:', offlineError);
        return { success: false, message: 'Çevrimdışı giriş sırasında hata oluştu' };
      }
    }
    
    // Çevrimiçi giriş işlemi
    try {
      // Kullanıcıyı e-posta adresine göre bul
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
        
      if (error || !data) {
        console.error('UserService: Kullanıcı bulunamadı:', error);
        return { success: false, message: 'Geçersiz e-posta veya şifre' };
      }
      
      const user = data as User;
      
      // Şifre kontrolü (gerçek uygulamada hash karşılaştırması yapılır)
      if (user.password !== password) {
        console.error('UserService: Geçersiz şifre');
        
        // Başarısız giriş sayısını artır
        try {
          const failedAttempts = (user.failed_login_attempts || 0) + 1;
          await supabase
            .from('users')
            .update({ failed_login_attempts: failedAttempts })
            .eq('id', user.id);
        } catch (updateError) {
          console.warn('UserService: Başarısız giriş sayısı güncellenemedi:', updateError);
        }
        
        return { success: false, message: 'Geçersiz e-posta veya şifre' };
      }
      
      // Kullanıcı aktif mi kontrol et
      if (user.status === USER_STATUS.INACTIVE || user.is_active === false) {
        return { success: false, message: 'Hesabınız aktif değil' };
      }
      
      // Kullanıcı onayı kontrol et
      if (user.status === USER_STATUS.PENDING_APPROVAL || user.approval_status === 'pending') {
        return { success: false, message: 'Hesabınız henüz onaylanmadı' };
      }
      
      // Son giriş tarihini güncelle
      const now = new Date().toISOString();
      try {
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            last_login: now,
            failed_login_attempts: 0 // Başarılı girişte sıfırla
          })
          .eq('id', user.id);
          
        if (updateError) {
          console.error('UserService: Son giriş tarihi güncellenirken hata oluştu:', updateError);
        }
      } catch (updateError) {
        console.warn('UserService: Son giriş tarihi güncellenemedi:', updateError);
      }
      
      // Kullanıcıyı localStorage'a kaydet
      const updatedUser = { ...user, last_login: now };
      try {
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedUser));
        
        // Kullanıcıları da güncelle
        const cachedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (cachedUsers) {
          const users = JSON.parse(cachedUsers) as User[];
          const userIndex = users.findIndex(u => u.id === user.id);
          
          if (userIndex >= 0) {
            users[userIndex] = updatedUser;
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
          }
        }
      } catch (storageError) {
        console.warn('UserService: Kullanıcı localStorage\'a kaydedilemedi:', storageError);
      }
      
      console.log('UserService: Giriş başarılı');
      
      // Giriş başarılı
      return { 
        success: true, 
        user: mapUserToUserView(updatedUser)
      };
    } catch (supabaseError) {
      console.error('UserService: Supabase sorgusu sırasında hata:', supabaseError);
      return { success: false, message: 'Giriş sırasında bir hata oluştu' };
    }
  } catch (error) {
    console.error('UserService: Giriş sırasında beklenmeyen hata:', error);
    return { success: false, message: 'Giriş sırasında bir hata oluştu' };
  }
};

/**
 * Mevcut kullanıcıyı Supabase'den getirir
 * @returns Mevcut kullanıcı veya null
 */
export const getCurrentUserAsync = async (): Promise<UserView | null> => {
  try {
    // Önce localStorage'dan kullanıcı ID'sini al
    const savedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!savedUser) {
      console.log('Mevcut kullanıcı bulunamadı');
      return null;
    }
    
    try {
      // Mevcut kullanıcıyı parse et
      const currentUser = JSON.parse(savedUser);
      if (!currentUser || !currentUser.id) {
        console.error('Geçersiz kullanıcı formatı');
        return null;
      }
      
      // Supabase'den güncel kullanıcı bilgilerini al
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();
        
      if (error) {
        console.error(`Kullanıcı yüklenirken hata oluştu (ID=${currentUser.id}):`, error);
        return mapUserToUserView(currentUser as User); // Hata durumunda localStorage'daki kullanıcıyı kullan
      }
      
      // Kullanıcı bilgilerini güncelle ve localStorage'a kaydet
      const updatedUser = {...data, last_login: new Date().toISOString()};
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedUser));
      
      return mapUserToUserView(updatedUser as User);
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Mevcut kullanıcı alınırken hata oluştu:', error);
    return null;
  }
};

// Bu fonksiyon aşağıda Supabase ile yeniden tanımlandı

/**
 * Kullanıcıyı e-posta veya kullanıcı adına göre yükler
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const users = await loadUsersFromStorage();
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (index === -1) {
      console.log(`Kullanıcı bulunamadı (E-posta=${email})`);
      return null;
    }
    return users[index];
  } catch (error) {
    console.error(`Kullanıcı yüklenirken hata oluştu (E-posta=${email}):`, error);
    return null;
  }
};

/**
 * Kullanıcıyı kullanıcı adına göre yükler
 */
export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const users = await loadUsersFromStorage();
    const index = users.findIndex(u => 
      u.username && u.username.toLowerCase() === username.toLowerCase()
    );
    if (index === -1) {
      console.log(`Kullanıcı bulunamadı (Kullanıcı adı=${username})`);
      return null;
    }
    return users[index];
  } catch (error) {
    console.error(`Kullanıcı yüklenirken hata oluştu (Kullanıcı adı=${username}):`, error);
    return null;
  }
};

// Bu fonksiyon kaldırıldı - 532. satırdaki loadUsersFromStorage fonksiyonu kullanılıyor

// LocalStorage'a kullanıcıları kaydet
export const saveUsersToStorage = async (users: User[]): Promise<boolean> => {
  try {
    // Kullanıcıları kaydet (mevcut verileri silmeden doğrudan güncelle)
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    console.log('Kullanıcılar LocalStorage\'a kaydedildi. Kullanıcı sayısı:', users.length);
    
    // Mevcut kullanıcıyı kontrol et ve güncelle
    const currentUserStr = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser && currentUser.id) {
          // Kullanıcı listesinde mevcut kullanıcıyı bul
          const updatedUser = users.find(u => u.id === currentUser.id);
          if (updatedUser) {
            // Mevcut kullanıcıyı güncelle
            localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedUser));
            console.log('Mevcut kullanıcı bilgileri güncellendi:', updatedUser);
          }
        }
      } catch (parseError) {
        console.error('Mevcut kullanıcı parse edilirken hata oluştu:', parseError);
      }
    }
    
    // Global bir olay tetikle
    try {
      const event = new CustomEvent(USERS_UPDATED_EVENT, { 
        detail: { users, timestamp: new Date().getTime() } 
      });
      window.dispatchEvent(event);
      console.log(`${USERS_UPDATED_EVENT} olayı tetiklendi`);
      return true;
    } catch (eventError) {
      console.error('Olay tetiklenirken hata oluştu:', eventError);
      return false;
    }
  } catch (error) {
    console.error('Kullanıcılar kaydedilirken hata oluştu:', error);
    return false;
  }
};

// Tüm kullanıcıları getir
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const users = await loadUsersFromStorage();
    console.log(`Tüm kullanıcılar yüklendi. Kullanıcı sayısı: ${users.length}`);
    return users;
  } catch (error) {
    console.error('Tüm kullanıcılar yüklenirken hata oluştu:', error);
    return [];
  }
};

// Aktif kullanıcıları getir (sadece aktif çalışanlar)
export const getActiveUsers = async (): Promise<User[]> => {
  try {
    console.log('UserService: Aktif kullanıcılar yükleniyor...');
    
    // Önce Supabase bağlantı durumunu kontrol et
    if (isSupabaseConnected()) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or('status.eq.active,is_active.eq.true');
        
      if (error) {
        console.error('UserService: Aktif kullanıcılar yüklenirken Supabase hatası:', error);
        // Hata durumunda localStorage'a bak
      } else if (data && data.length > 0) {
        console.log(`UserService: ${data.length} aktif kullanıcı Supabase'den yüklendi`);
        
        // Başarılı veriyi localStorage'a yedekle
        try {
          localStorage.setItem('erp_active_users_cache', JSON.stringify(data));
          console.log('UserService: Aktif kullanıcılar localStorage\'a yedeklendi');
        } catch (cacheError) {
          console.warn('UserService: Aktif kullanıcılar localStorage\'a yedeklenemedi:', cacheError);
        }
        
        return data as User[];
      }
    } else {
      console.warn('UserService: Supabase bağlantısı mevcut değil, localStorage\'dan yükleniyor');
    }
    
    // Supabase bağlantı hatası veya bağlantı yoksa localStorage'dan yedek veriyi yükle
    try {
      const cachedUsers = localStorage.getItem('erp_active_users_cache');
      if (cachedUsers) {
        const users = JSON.parse(cachedUsers) as User[];
        console.log(`UserService: Yedekten ${users.length} aktif kullanıcı yüklendi`);
        return users;
      }
      
      // Aktif kullanıcı özelliğine göre tüm kullanıcıları filtrele
      const allCachedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (allCachedUsers) {
        const allUsers = JSON.parse(allCachedUsers) as User[];
        const activeUsers = allUsers.filter(user => 
          user.status === USER_STATUS.ACTIVE || (user.status === undefined && user.is_active !== false)
        );
        console.log(`UserService: Tüm yedek kullanıcılardan ${activeUsers.length} aktif kullanıcı filtrelendi`);
        return activeUsers;
      }
    } catch (cacheError) {
      console.error('UserService: Yedek aktif kullanıcı verisi yüklenirken hata:', cacheError);
    }
    
    // Son çare olarak loadUsersFromStorage kullan
    try {
      const users = await loadUsersFromStorage();
      const activeUsers = users.filter((user: User) => 
        (user.status === USER_STATUS.ACTIVE) || 
        (user.status === undefined && user.is_active !== false)
      );
      console.log(`UserService: Aktif kullanıcılar yüklendi. Aktif kullanıcı sayısı: ${activeUsers.length}`);
      return activeUsers;
    } catch (loadError) {
      console.error('UserService: loadUsersFromStorage ile yükleme hatası:', loadError);
    }
    
    console.warn('UserService: Aktif kullanıcı verisi bulunamadı');
    return [];
  } catch (error) {
    console.error('UserService: Aktif kullanıcılar yüklenirken beklenmeyen hata:', error);
    return [];
  }
};

/**
 * Tüm kullanıcıları Supabase'den yükler ve localStorage'a kaydeder
 * Supabase bağlantısı yoksa localStorage'dan yükler
 * @returns Kullanıcı listesi
 */
export const loadUsersFromStorage = async (): Promise<User[]> => {
  try {
    console.log('UserService: Tüm kullanıcılar yükleniyor...');
    
    // Önce Supabase bağlantı durumunu kontrol et
    if (isSupabaseConnected()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*');
          
        if (error) {
          console.error('UserService: Kullanıcılar Supabase\'den yüklenirken hata oluştu:', error);
          // Hata durumunda localStorage'a bak
        } else if (data && data.length > 0) {
          console.log(`UserService: ${data.length} kullanıcı Supabase'den yüklendi`);
          
          // Başarılı veriyi localStorage'a yedekle
          try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data));
            console.log('UserService: Kullanıcılar localStorage\'a yedeklendi');
            return data as User[];
          } catch (cacheError) {
            console.warn('UserService: Kullanıcılar localStorage\'a yedeklenemedi:', cacheError);
            return data as User[];
          }
        }
      } catch (supabaseError) {
        console.error('UserService: Supabase sorgusu sırasında hata:', supabaseError);
      }
    } else {
      console.warn('UserService: Supabase bağlantısı mevcut değil, localStorage\'dan yükleniyor');
    }
    
    // Supabase bağlantı hatası veya bağlantı yoksa localStorage'dan yedek veriyi yükle
    try {
      const cachedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (cachedUsers) {
        const users = JSON.parse(cachedUsers) as User[];
        console.log(`UserService: ${users.length} kullanıcı localStorage'dan yüklendi`);
        return users;
      }
    } catch (cacheError) {
      console.error('UserService: Kullanıcılar localStorage\'dan yüklenirken hata:', cacheError);
    }
    
    console.warn('UserService: Kullanıcı verisi bulunamadı, boş dizi döndürülüyor');
    return [];
  } catch (error) {
    console.error('UserService: Kullanıcılar yüklenirken beklenmeyen hata:', error);
    return [];
  }
};

// Ekip üyelerini kaydet (TeamPage'den)
export const syncTeamMembers = async (teamMembers: any[]): Promise<boolean> => {
  try {
    if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
      console.error('Geçersiz ekip üyeleri verisi:', teamMembers);
      return false;
    }
    
    // Mevcut kullanıcıları yükle
    const currentUsers = await loadUsersFromStorage();
    
    // Ekip üyelerini User formatına dönüştür
    const teamUsers: User[] = teamMembers.map((member: any) => {
      const status: 'active' | 'inactive' | 'vacation' = 
        member.status === 'active' ? 'active' : 
        member.status === 'inactive' ? 'inactive' : 
        member.status === 'vacation' ? 'vacation' : 
        'active';
      
      return {
        id: member.id,
        name: member.name,
        username: member.username || `user_${member.id}`,
        email: member.email,
        role: member.role,
        department: member.department,
        avatar: member.avatar,
        phone: member.phone,
        status,
        isActive: status === USER_STATUS.ACTIVE
      };
    });
    
    // Mevcut kullanıcıları güncelle veya yenilerini ekle
    const updatedUsers = [...currentUsers];
    
    teamUsers.forEach(teamUser => {
      const existingIndex = updatedUsers.findIndex(u => u.id === teamUser.id);
      if (existingIndex >= 0) {
        // Mevcut kullanıcıyı güncelle
        updatedUsers[existingIndex] = {
          ...updatedUsers[existingIndex],
          ...teamUser
        };
      } else {
        // Yeni kullanıcı ekle
        updatedUsers.push(teamUser);
      }
    });
    
    // Güncellenmiş kullanıcıları kaydet
    return saveUsersToStorage(updatedUsers);
  } catch (error) {
    console.error('Ekip üyeleri senkronize edilirken hata oluştu:', error);
    return false;
  }
};

// Kullanıcı durumunu güncelle
export const updateUserStatus = async (userId: number, status: 'active' | 'inactive' | 'vacation'): Promise<boolean> => {
  try {
    const users = await loadUsersFromStorage();
    const userIndex = users.findIndex((u: User) => u.id === userId);
    
    if (userIndex === -1) {
      console.error(`ID'si ${userId} olan kullanıcı bulunamadı`);
      return false;
    }
    
    // Kullanıcı durumunu güncelle
    const updatedUser: User = {
      ...users[userIndex],
      status,
      is_active: status === USER_STATUS.ACTIVE // Geriye dönük uyumluluk için
    };
    
    users[userIndex] = updatedUser;
    
    // Güncellenmiş kullanıcıları kaydet
    return await saveUsersToStorage(users);
  } catch (error) {
    console.error(`Kullanıcı durumu güncellenirken hata oluştu: ID=${userId}`, error);
    return false;
  }
};

/**
 * Kullanıcı ID'sine göre kullanıcı getir
 * @param userId Kullanıcı ID'si
 * @returns Kullanıcı veya null
 */
export const getUserById = async (userId: number): Promise<User | null> => {
  try {
    console.log(`UserService: ID'si ${userId} olan kullanıcı yükleniyor...`);
    
    // Önce Supabase bağlantı durumunu kontrol et
    if (isSupabaseConnected()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error(`UserService: ID'si ${userId} olan kullanıcı Supabase'den yüklenirken hata:`, error);
          // Hata durumunda localStorage'a bak
        } else if (data) {
          console.log(`UserService: ID'si ${userId} olan kullanıcı Supabase'den yüklendi`);
          
          // Başarılı veriyi localStorage'a yedekle
          try {
            const cachedUsers = localStorage.getItem(USERS_STORAGE_KEY);
            if (cachedUsers) {
              const users = JSON.parse(cachedUsers) as User[];
              const existingIndex = users.findIndex(u => u.id === userId);
              
              if (existingIndex >= 0) {
                // Mevcut kullanıcıyı güncelle
                users[existingIndex] = data as User;
              } else {
                // Yeni kullanıcı ekle
                users.push(data as User);
              }
              
              localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
              console.log(`UserService: ID'si ${userId} olan kullanıcı localStorage'a yedeklendi`);
            }
          } catch (cacheError) {
            console.warn(`UserService: ID'si ${userId} olan kullanıcı localStorage'a yedeklenemedi:`, cacheError);
          }
          
          return data as User;
        }
      } catch (supabaseError) {
        console.error(`UserService: ID'si ${userId} olan kullanıcı için Supabase sorgusu sırasında hata:`, supabaseError);
      }
    } else {
      console.warn(`UserService: Supabase bağlantısı mevcut değil, ID'si ${userId} olan kullanıcı için localStorage'a bakılıyor`);
    }
    
    // Supabase bağlantı hatası veya bağlantı yoksa localStorage'dan yedek veriyi yükle
    try {
      const cachedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (cachedUsers) {
        const users = JSON.parse(cachedUsers) as User[];
        const user = users.find(u => u.id === userId);
        
        if (user) {
          console.log(`UserService: ID'si ${userId} olan kullanıcı localStorage'dan yüklendi`);
          return user;
        }
      }
    } catch (cacheError) {
      console.error(`UserService: ID'si ${userId} olan kullanıcı localStorage'dan yüklenirken hata:`, cacheError);
    }
    
    console.warn(`UserService: ID'si ${userId} olan kullanıcı bulunamadı`);
    return null;
  } catch (error) {
    console.error(`UserService: ID'si ${userId} olan kullanıcı yüklenirken beklenmeyen hata:`, error);
    return null;
  }
};

/**
 * Mevcut kullanıcıyı ayarlar
 * @param user Mevcut kullanıcı olarak ayarlanacak kullanıcı veya null (oturum kapatma için)
 * @returns Başarılı mı
 */
export const setCurrentUser = (user: User | null): boolean => {
  try {
    // Kullanıcı null ise (oturum kapatma)
    if (user === null) {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      console.log('Kullanıcı oturumu kapatıldı');
      
      // Oturum kapatma olayını tetikle
      try {
        const event = new CustomEvent('userLoggedOut', { 
          detail: { timestamp: new Date().getTime() } 
        });
        window.dispatchEvent(event);
        return true;
      } catch (eventError) {
        console.error('Kullanıcı oturum kapatma olayı tetiklenirken hata oluştu:', eventError);
        return false;
      }
    }
    
    // Kullanıcı geçerli mi kontrol et
    if (!user || !user.id) {
      console.error('Geçersiz kullanıcı bilgisi');
      return false;
    }
    
    // Kullanıcıyı localStorage'a kaydet
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    
    // Olay tetikle
    try {
      const event = new CustomEvent(USER_SWITCHED_EVENT, { 
        detail: { user, timestamp: new Date().getTime() } 
      });
      window.dispatchEvent(event);
      console.log(`${USER_SWITCHED_EVENT} olayı tetiklendi`, user);
      return true;
    } catch (eventError) {
      console.error('Kullanıcı değişikliği olayı tetiklenirken hata oluştu:', eventError);
      return false;
    }
  } catch (error) {
    console.error('Mevcut kullanıcı ayarlanırken hata oluştu:', error);
    return false;
  }
};

/**
 * Mevcut kullanıcıyı getirir
 * @returns Mevcut kullanıcı veya null
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    console.log('UserService: Mevcut kullanıcı bilgisi alınıyor...');
    
    // Önce mevcut kullanıcıyı localStorage'dan al
    const savedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!savedUser) {
      console.log('UserService: Mevcut kullanıcı bulunamadı');
      return null;
    }
    
    try {
      // Mevcut kullanıcıyı parse et
      const currentUser = JSON.parse(savedUser);
      if (!currentUser || !currentUser.id) {
        console.error('UserService: Geçersiz kullanıcı formatı');
        return null;
      }
      
      // Supabase bağlantı durumunu kontrol et
      if (isSupabaseConnected()) {
        try {
          // Supabase'den güncel kullanıcı bilgisini al
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
          if (error) {
            console.warn('UserService: Mevcut kullanıcı Supabase\'den alınırken hata:', error);
            console.log('UserService: Mevcut kullanıcı için localStorage verisi kullanılıyor');
            return currentUser;
          }
          
          if (data) {
            // Güncel kullanıcı bilgisini localStorage'a kaydet
            try {
              localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(data));
              console.log('UserService: Mevcut kullanıcı Supabase\'den güncellendi');
              
              // Son giriş tarihini güncelle
              try {
                const now = new Date().toISOString();
                await supabase
                  .from('users')
                  .update({ last_login: now })
                  .eq('id', currentUser.id);
              } catch (loginUpdateError) {
                console.warn('UserService: Son giriş tarihi güncellenemedi:', loginUpdateError);
              }
              
              return data as User;
            } catch (storageError) {
              console.warn('UserService: Kullanıcı localStorage\'a kaydedilemedi:', storageError);
              return data as User;
            }
          }
        } catch (supabaseError) {
          console.error('UserService: Supabase sorgusu sırasında hata:', supabaseError);
        }
      } else {
        console.warn('UserService: Supabase bağlantısı mevcut değil, localStorage\'dan kullanıcı kullanılıyor');
      }
      
      // Supabase bağlantısı yoksa veya hata oluştuysa localStorage'daki kullanıcıyı kullan
      console.log('UserService: localStorage\'dan mevcut kullanıcı kullanılıyor');
      return currentUser;
    } catch (parseError) {
      console.error('UserService: JSON parse hatası:', parseError);
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY); // Bozuk veriyi temizle
      return null;
    }
  } catch (error) {
    console.error('UserService: Mevcut kullanıcı alınırken beklenmeyen hata:', error);
    return null;
  }
};

/**
 * Kullanıcının onay durumunu kontrol eder
 * @param userId Kontrol edilecek kullanıcı ID'si
 * @returns Onay durumu
 */
export const checkUserApprovalStatus = async (userId: number): Promise<'pending' | 'approved' | 'rejected' | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      console.error('Kullanıcı bulunamadı:', error);
      return null;
    }
    
    const user = data as User;
    
    if (user.approval_status) {
      return user.approval_status as 'pending' | 'approved' | 'rejected';
    }
    
    // Eski kullanıcılar için status değerini kontrol et
    if (user.status === USER_STATUS.ACTIVE || user.is_active === true) {
      return 'approved';
    } else if (user.status === USER_STATUS.PENDING_APPROVAL) {
      return 'pending';
    } else if (user.status === USER_STATUS.REJECTED) {
      return 'rejected';
    }
    
    // Varsayılan olarak onaylanmış kabul et (eski kullanıcılar için)
    return 'approved';
  } catch (error) {
    console.error('Kullanıcı onay durumu kontrol edilirken hata oluştu:', error);
    return null;
  }
};

/**
 * Onay bekleyen kullanıcıları getirir
 * @returns Onay bekleyen kullanıcılar
 */
export const getPendingApprovalUsers = async (): Promise<User[]> => {
  try {
    const users = await loadUsersFromStorage();
    return users.filter((user: User) => 
      user.status === USER_STATUS.PENDING_APPROVAL || 
      user.approval_status === 'pending'
    );
  } catch (error) {
    console.error('Onay bekleyen kullanıcılar yüklenirken hata oluştu:', error);
    return [];
  }
}

/**
 * Kullanıcı kaydı oluşturur
 * @param user Yeni kullanıcı bilgileri
 * @returns Oluşturulan kullanıcı veya null
 */
export const registerUser = async (user: Omit<User, 'id' | 'approval_status' | 'registration_date'>): Promise<User | null> => {
  try {
    // E-posta kontrolü
    const { data: existingEmailUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email.toLowerCase())
      .single();
      
    if (existingEmailUser) {
      console.error(`${user.email} e-posta adresi zaten kullanılıyor`);
      return null;
    }
    
    // Kullanıcı adı kontrolü
    if (user.username) {
      const { data: existingUsernameUser } = await supabase
        .from('users')
        .select('*')
        .eq('username', user.username.toLowerCase())
        .single();
        
      if (existingUsernameUser) {
        console.error(`${user.username} kullanıcı adı zaten kullanılıyor`);
        return null;
      }
    }
    
    // Admin sayısını kontrol et
    const { data: users } = await supabase
      .from('users')
      .select('*');
      
    const adminCount = users ? users.filter((u: User) => u.is_admin === true).length : 0;
    
    // Eğer hiç admin yoksa ve bu ilk kullanıcıysa, otomatik admin ve onaylı yap
    const isFirstAdmin = adminCount === 0 && (user.is_admin === true || user.role === USER_ROLE.ADMIN);
    
    // Yeni kullanıcı
    const newUser: Partial<User> = {
      ...user,
      approval_status: isFirstAdmin ? 'approved' : 'pending',
      registration_date: new Date().toISOString(),
      status: isFirstAdmin ? USER_STATUS.ACTIVE : USER_STATUS.PENDING_APPROVAL,
      is_admin: isFirstAdmin ? true : user.is_admin || false,
      is_active: isFirstAdmin
    };
    
    // Kullanıcıyı ekle
    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();
      
    if (error) {
      console.error('Kullanıcı kaydı oluşturulurken hata:', error);
      return null;
    }
    
    // Onay isteği olayını tetikle (ilk admin değilse)
    if (!isFirstAdmin) {
      try {
        const event = new CustomEvent(USER_APPROVAL_REQUESTED_EVENT, { 
          detail: { user: data, timestamp: new Date().getTime() } 
        });
        window.dispatchEvent(event);
      } catch (eventError) {
        console.error('Kullanıcı onay isteği olayı tetiklenirken hata oluştu:', eventError);
      }
    }
    
    return data as User;
  } catch (error) {
    console.error('Kullanıcı kaydı sırasında beklenmeyen hata:', error);
    return null;
  }
}

/**
 * Kullanıcıyı onaylar
 * @param userId Onaylanacak kullanıcı ID'si
 * @param adminId Onaylayan yönetici ID'si
 * @returns Başarılı mı
 */
export const approveUser = async (userId: number, adminId: number): Promise<boolean> => {
  try {
    const users = await loadUsersFromStorage();
    const userIndex = users.findIndex((u: User) => u.id === userId);
    
    if (userIndex === -1) {
      console.error(`ID'si ${userId} olan kullanıcı bulunamadı`);
      return false;
    }
    
    // Kullanıcıyı güncelle
    users[userIndex] = {
      ...users[userIndex],
      status: USER_STATUS.ACTIVE,
      approval_status: 'approved',
      approval_date: new Date().toISOString(),
      approved_by: adminId,
      is_active: true
    };
    
    // Kaydet
    await saveUsersToStorage(users);
    
    // Onay olayını tetikle
    try {
      const event = new CustomEvent(USER_APPROVED_EVENT, { 
        detail: { user: users[userIndex], timestamp: new Date().getTime() } 
      });
      window.dispatchEvent(event);
    } catch (eventError) {
      console.error('Kullanıcı onay olayı tetiklenirken hata oluştu:', eventError);
    }
    
    return true;
  } catch (error) {
    console.error('Kullanıcı onaylanırken hata oluştu:', error);
    return false;
  }
}

/**
 * Kullanıcı onayını reddeder
 * @param userId Reddedilecek kullanıcı ID'si
 * @param adminId Reddeden yönetici ID'si
 * @returns Başarılı mı
 */
export const rejectUser = async (userId: number, adminId: number): Promise<boolean> => {
  try {
    const users = await loadUsersFromStorage();
    const userIndex = users.findIndex((u: User) => u.id === userId);
    
    if (userIndex === -1) {
      console.error(`ID'si ${userId} olan kullanıcı bulunamadı`);
      return false;
    }
    
    // Kullanıcıyı güncelle
    users[userIndex] = {
      ...users[userIndex],
      status: USER_STATUS.REJECTED,
      approval_status: 'rejected',
      approval_date: new Date().toISOString(),
      approved_by: adminId
    };
    
    // Kaydet
    await saveUsersToStorage(users);
    
    // Red olayını tetikle
    try {
      const event = new CustomEvent(USER_REJECTED_EVENT, { 
        detail: { user: users[userIndex], timestamp: new Date().getTime() } 
      });
      window.dispatchEvent(event);
    } catch (eventError) {
      console.error('Kullanıcı red olayı tetiklenirken hata oluştu:', eventError);
    }
    
    return true;
  } catch (error) {
    console.error('Kullanıcı reddedilirken hata oluştu:', error);
    return false;
  }
}

/**
 * Kullanıcı profilini günceller
 * @param userId Güncellenecek kullanıcı ID'si
 * @param userData Güncellenecek kullanıcı verileri
 * @returns Güncellenen kullanıcı veya null
 */
export const updateUserProfile = async (userId: number, userData: Partial<User>): Promise<User | null> => {
  try {
    console.log(`Kullanıcı profili güncelleniyor: ID=${userId}`, userData);
    
    const users = await loadUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      console.error(`ID'si ${userId} olan kullanıcı bulunamadı`);
      return null;
    }
    
    // Güncellenecek alanları kontrol et
    const updatedUser = {
      ...users[userIndex],
      ...userData,
      // ID'nin değişmemesini sağla
      id: users[userIndex].id
    };
    
    // Kullanıcıyı güncelle
    users[userIndex] = updatedUser;
    
    // Kaydet
    const success = await saveUsersToStorage(users);
    
    if (success) {
      console.log(`Kullanıcı profili başarıyla güncellendi: ID=${userId}`);
      
      // Mevcut kullanıcıyı doğrudan güncelle
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedUser));
      
      // Güncelleme olayını tetikle
      try {
        const event = new CustomEvent(USERS_UPDATED_EVENT, { 
          detail: { user: updatedUser, timestamp: new Date().getTime() } 
        });
        window.dispatchEvent(event);
        
        // Kullanıcı değişikliği olayını da tetikle
        const switchEvent = new CustomEvent(USER_SWITCHED_EVENT, { 
          detail: { user: updatedUser, timestamp: new Date().getTime() } 
        });
        window.dispatchEvent(switchEvent);
      } catch (eventError) {
        console.error('Kullanıcı güncelleme olayı tetiklenirken hata oluştu:', eventError);
      }
      
      return updatedUser;
    } else {
      console.error(`Kullanıcı profili güncellenemedi: ID=${userId}`);
      return null;
    }
  } catch (error) {
    console.error(`Kullanıcı profili güncellenirken hata oluştu: ID=${userId}`, error);
    return null;
  }
};

/**
 * Kullanıcı oturumunu kapatır
 * @returns Başarılı mı
 */
export const logout = (): boolean => {
  try {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    console.log('Kullanıcı oturumu kapatıldı');
    
    // Oturum kapatma olayını tetikle
    try {
      const event = new CustomEvent('userLoggedOut', { 
        detail: { timestamp: new Date().getTime() } 
      });
      window.dispatchEvent(event);
    } catch (eventError) {
      console.error('Kullanıcı oturum kapatma olayı tetiklenirken hata oluştu:', eventError);
    }
    
    return true;
  } catch (error) {
    console.error('Kullanıcı oturumu kapatılırken hata oluştu:', error);
    return false;
  }
}

// Legacy loginUser function has been replaced with async Supabase version above

/**
 * Kullanıcının yönetici olup olmadığını kontrol eder
 * @param userId Kontrol edilecek kullanıcı ID'si
 * @returns Yönetici mi
 */
export const isUserAdmin = async (userId: number): Promise<boolean> => {
  try {
    const user = await getUserById(userId);
    return user?.is_admin === true;
  } catch (error) {
    console.error('Kullanıcı yönetici kontrolü yapılırken hata oluştu:', error);
    return false;
  }
}

/**
 * Kullanıcının belirli bir izne sahip olup olmadığını kontrol eder
 * @param userId Kontrol edilecek kullanıcı ID'si
 * @param permission Kontrol edilecek izin
 * @returns İzne sahip mi
 */
export const hasPermission = async (userId: number, permission: string): Promise<boolean> => {
  try {
    const user = await getUserById(userId);
    if (!user) return false;
    
    // Admin her zaman tüm izinlere sahiptir
    if (user.is_admin === true) return true;
    
    // İzinleri kontrol et
    return user.permissions?.includes(permission) || false;
  } catch (error) {
    console.error('Kullanıcı izin kontrolü yapılırken hata oluştu:', error);
    return false;
  }
}
