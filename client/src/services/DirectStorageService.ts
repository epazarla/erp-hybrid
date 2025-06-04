/**
 * DirectStorageService
 * Bu servis, localStorage işlemlerini doğrudan yönetir ve veri tutarlılığını sağlar.
 * Diğer servislerden bağımsız olarak çalışır.
 */

// LocalStorage anahtarları
const USERS_STORAGE_KEY = 'erp_users_v2';
const CURRENT_USER_STORAGE_KEY = 'erp_current_user';

// Kullanıcı arayüzü
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  department?: string;
  isActive?: boolean;
  status?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  registrationDate?: number; // timestamp
  approvalDate?: number; // timestamp
  approvedBy?: number; // admin user id
  tasks?: number;
  completedTasks?: number;
  password?: string;
}

/**
 * Mevcut kullanıcıyı doğrudan localStorage'dan alır
 * @returns Mevcut kullanıcı veya null
 */
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!userStr) {
      console.log('Mevcut kullanıcı bulunamadı');
      return null;
    }
    
    const user = JSON.parse(userStr);
    console.log('Mevcut kullanıcı yüklendi:', user);
    return user;
  } catch (error) {
    console.error('Mevcut kullanıcı yüklenirken hata oluştu:', error);
    return null;
  }
};

/**
 * Mevcut kullanıcıyı doğrudan localStorage'a kaydeder
 * @param user Kaydedilecek kullanıcı
 * @returns Başarılı mı
 */
export const saveCurrentUser = (user: User): boolean => {
  try {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    console.log('Mevcut kullanıcı kaydedildi:', user);
    return true;
  } catch (error) {
    console.error('Mevcut kullanıcı kaydedilirken hata oluştu:', error);
    return false;
  }
};

/**
 * Kullanıcı veritabanını doğrudan localStorage'dan alır
 * @returns Kullanıcı veritabanı veya boş dizi
 */
export const getUsersDatabase = (): User[] => {
  try {
    const usersStr = localStorage.getItem(USERS_STORAGE_KEY);
    if (!usersStr) {
      console.log('Kullanıcı veritabanı bulunamadı');
      return [];
    }
    
    const users = JSON.parse(usersStr);
    if (!Array.isArray(users)) {
      console.error('Kullanıcı veritabanı bir dizi değil');
      return [];
    }
    
    console.log('Kullanıcı veritabanı yüklendi:', users.length);
    return users;
  } catch (error) {
    console.error('Kullanıcı veritabanı yüklenirken hata oluştu:', error);
    return [];
  }
};

/**
 * Kullanıcı veritabanını doğrudan localStorage'a kaydeder
 * @param users Kaydedilecek kullanıcı veritabanı
 * @returns Başarılı mı
 */
export const saveUsersDatabase = (users: User[]): boolean => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    console.log('Kullanıcı veritabanı kaydedildi:', users.length);
    return true;
  } catch (error) {
    console.error('Kullanıcı veritabanı kaydedilirken hata oluştu:', error);
    return false;
  }
};

/**
 * Profil bilgilerini günceller
 * @param userData Güncellenecek profil bilgileri
 * @returns Güncellenmiş kullanıcı veya null
 */
export const updateProfile = (userData: Partial<User>): User | null => {
  try {
    // 1. Mevcut kullanıcıyı al
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.error('Güncellenecek mevcut kullanıcı bulunamadı');
      return null;
    }
    
    // 2. Kullanıcı veritabanını al
    const users = getUsersDatabase();
    
    // 3. Kullanıcı veritabanında mevcut kullanıcıyı bul
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) {
      console.error('Kullanıcı veritabanında mevcut kullanıcı bulunamadı');
      return null;
    }
    
    // 4. Kullanıcı bilgilerini güncelle
    const updatedUser = {
      ...currentUser,
      ...userData,
      // ID'nin değişmemesini sağla
      id: currentUser.id
    };
    
    // 5. Mevcut kullanıcıyı güncelle
    saveCurrentUser(updatedUser);
    
    // 6. Kullanıcı veritabanını güncelle
    users[userIndex] = updatedUser;
    saveUsersDatabase(users);
    
    console.log('Profil bilgileri güncellendi:', updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Profil bilgileri güncellenirken hata oluştu:', error);
    return null;
  }
};

/**
 * Sayfa yenilendiğinde mevcut kullanıcıyı günceller
 * @returns Güncellenmiş kullanıcı veya null
 */
export const syncCurrentUser = (): User | null => {
  try {
    // 1. Mevcut kullanıcıyı al
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.log('Senkronize edilecek mevcut kullanıcı bulunamadı');
      return null;
    }
    
    // 2. Kullanıcı veritabanını al
    const users = getUsersDatabase();
    
    // 3. Kullanıcı veritabanında mevcut kullanıcıyı bul
    const userInDb = users.find(u => u.id === currentUser.id);
    if (!userInDb) {
      console.error('Kullanıcı veritabanında mevcut kullanıcı bulunamadı');
      return currentUser; // Mevcut kullanıcıyı koru
    }
    
    // 4. Mevcut kullanıcıyı güncelle
    saveCurrentUser(userInDb);
    
    console.log('Mevcut kullanıcı senkronize edildi:', userInDb);
    return userInDb;
  } catch (error) {
    console.error('Mevcut kullanıcı senkronize edilirken hata oluştu:', error);
    return null;
  }
};

// DirectStorageService
const directStorageService = {
  getCurrentUser,
  saveCurrentUser,
  getUsersDatabase,
  saveUsersDatabase,
  updateProfile,
  syncCurrentUser
};

export default directStorageService;
