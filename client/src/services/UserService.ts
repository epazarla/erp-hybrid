import { mockUsers } from '../data/mockData';

// Kullanıcı durumları
export enum USER_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  VACATION = 'vacation',
  PENDING_APPROVAL = 'pending_approval',
  REJECTED = 'rejected'
};

// LocalStorage anahtarı
export const USERS_STORAGE_KEY = 'erp_users_v2';
export const USERS_UPDATED_EVENT = 'usersUpdated';
export const CURRENT_USER_STORAGE_KEY = 'erp_current_user';
export const USER_SWITCHED_EVENT = 'userSwitched';
export const USER_APPROVAL_REQUESTED_EVENT = 'userApprovalRequested';
export const USER_APPROVED_EVENT = 'userApproved';
export const USER_REJECTED_EVENT = 'userRejected';

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
  password?: string; // Şifre (gerçek uygulamada hash'lenmelidir)
  teamId?: number; // Kullanıcının dahil olduğu ekip ID'si
  isAdmin?: boolean; // Yönetici yetkisi
  permissions?: string[]; // Kullanıcı izinleri
}

// LocalStorage'dan kullanıcıları yükle
export const loadUsersFromStorage = (): User[] => {
  try {
    // Önce mevcut kullanıcıyı kontrol et
    const currentUserStr = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    let currentUser = null;
    if (currentUserStr) {
      try {
        currentUser = JSON.parse(currentUserStr);
        console.log('Mevcut kullanıcı bulundu:', currentUser);
      } catch (parseError) {
        console.error('Mevcut kullanıcı parse hatası:', parseError);
      }
    }
    
    // Kullanıcı veritabanını kontrol et
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        if (Array.isArray(parsedUsers)) {
          console.log('LocalStorage\'dan yüklenen kullanıcılar:', parsedUsers.length);
          
          // Eğer mevcut kullanıcı varsa ve veritabanında yoksa, ekle
          if (currentUser && currentUser.id) {
            const userExists = parsedUsers.some(u => u.id === currentUser.id);
            if (!userExists) {
              console.log('Mevcut kullanıcı veritabanına ekleniyor:', currentUser);
              parsedUsers.push(currentUser);
              localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsedUsers));
            }
          }
          
          return parsedUsers;
        } else {
          console.error('Yüklenen kullanıcı verisi bir dizi değil, mock veriler kullanılıyor');
        }
      } catch (parseError) {
        console.error('JSON parse hatası:', parseError);
      }
    }
  } catch (error) {
    console.error('Kullanıcılar yüklenirken hata oluştu:', error);
  }
  
  // Hata durumunda veya ilk kez yükleniyorsa örnek kullanıcılar oluştur
  console.log('Örnek kullanıcılar oluşturuluyor...');
  
  // Örnek kullanıcılar
  const defaultUsers: User[] = [
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      phone: '+90 555 123 4567',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      role: 'Yönetici',
      department: 'Yönetim',
      isActive: true,
      status: 'active',
      approvalStatus: 'approved',
      registrationDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 gün önce
      approvalDate: Date.now() - 29 * 24 * 60 * 60 * 1000, // 29 gün önce
      tasks: 15,
      completedTasks: 12,
      password: 'ahmet123',
      isAdmin: true,
      teamId: 1,
      permissions: ['admin', 'manage_users', 'manage_teams', 'manage_tasks', 'manage_clients']
    },
    {
      id: 2,
      name: 'Ayşe Demir',
      email: 'ayse@example.com',
      phone: '+90 555 234 5678',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      role: 'Tasarımcı',
      department: 'Tasarım',
      isActive: true,
      status: 'active',
      approvalStatus: 'approved',
      registrationDate: Date.now() - 25 * 24 * 60 * 60 * 1000, // 25 gün önce
      approvalDate: Date.now() - 24 * 24 * 60 * 60 * 1000, // 24 gün önce
      tasks: 8,
      completedTasks: 5,
      password: 'ayse123',
      teamId: 2,
      permissions: ['view_tasks', 'manage_tasks', 'view_clients']
    },
    {
      id: 3,
      name: 'Mehmet Kaya',
      email: 'mehmet@example.com',
      phone: '+90 555 345 6789',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      role: 'Yazılım Geliştirici',
      department: 'Yazılım',
      isActive: true,
      status: 'active',
      approvalStatus: 'approved',
      registrationDate: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 gün önce
      approvalDate: Date.now() - 19 * 24 * 60 * 60 * 1000, // 19 gün önce
      tasks: 12,
      completedTasks: 10,
      password: 'mehmet123',
      teamId: 1,
      permissions: ['view_tasks', 'manage_tasks', 'view_clients', 'manage_clients']
    },
    {
      id: 4,
      name: 'Zeynep Şahin',
      email: 'zeynep@example.com',
      phone: '+90 555 456 7890',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      role: 'Pazarlama Uzmanı',
      department: 'Pazarlama',
      isActive: true,
      status: 'active',
      approvalStatus: 'approved',
      registrationDate: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 gün önce
      approvalDate: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 gün önce
      tasks: 6,
      completedTasks: 4,
      password: 'zeynep123',
      teamId: 2,
      permissions: ['view_tasks', 'view_clients']
    },
    {
      id: 5,
      name: 'Can Özkan',
      email: 'can@example.com',
      phone: '+90 555 567 8901',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      role: 'Müşteri Temsilcisi',
      department: 'Müşteri Hizmetleri',
      isActive: false,
      status: 'inactive',
      approvalStatus: 'approved',
      registrationDate: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 gün önce
      approvalDate: Date.now() - 9 * 24 * 60 * 60 * 1000, // 9 gün önce
      tasks: 4,
      completedTasks: 2,
      password: 'can123',
      teamId: 3,
      permissions: ['view_tasks', 'view_clients']
    }
  ];
  
  // Örnek kullanıcıları localStorage'a kaydet
  saveUsersToStorage(defaultUsers);
  return defaultUsers;
};

// LocalStorage'a kullanıcıları kaydet
export const saveUsersToStorage = (users: User[]): boolean => {
  if (!Array.isArray(users)) {
    console.error('Kaydedilmeye çalışılan kullanıcı verisi bir dizi değil:', users);
    return false;
  }

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
export const getAllUsers = (): User[] => {
  try {
    const users = loadUsersFromStorage();
    console.log(`Tüm kullanıcılar yüklendi. Kullanıcı sayısı: ${users.length}`);
    return users;
  } catch (error) {
    console.error('Tüm kullanıcılar yüklenirken hata oluştu:', error);
    return [];
  }
};

// Aktif kullanıcıları getir (sadece aktif çalışanlar)
export const getActiveUsers = (): User[] => {
  try {
    const users = loadUsersFromStorage();
    // Aktif kullanıcıları filtrele (status özelliği varsa ona göre, yoksa isActive kontrol et)
    const activeUsers = users.filter(user => 
      (user.status === USER_STATUS.ACTIVE) || 
      (user.status === undefined && user.isActive !== false)
    );
    console.log(`Aktif kullanıcılar yüklendi. Aktif kullanıcı sayısı: ${activeUsers.length}`);
    return activeUsers;
  } catch (error) {
    console.error('Aktif kullanıcılar yüklenirken hata oluştu:', error);
    return [];
  }
};

// Ekip üyelerini kaydet (TeamPage'den)
export const syncTeamMembers = (teamMembers: any[]): boolean => {
  try {
    if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
      console.error('Geçersiz ekip üyeleri verisi:', teamMembers);
      return false;
    }
    
    // Mevcut kullanıcıları yükle
    const currentUsers = loadUsersFromStorage();
    
    // Ekip üyelerini User formatına dönüştür
    const teamUsers: User[] = teamMembers.map(member => {
      const status: 'active' | 'inactive' | 'vacation' = 
        member.status === 'active' ? 'active' : 
        member.status === 'inactive' ? 'inactive' : 
        member.status === 'vacation' ? 'vacation' : 
        'active';
      
      return {
        id: member.id,
        name: member.name,
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
export const updateUserStatus = (userId: number, status: 'active' | 'inactive' | 'vacation'): boolean => {
  try {
    const users = loadUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      console.error(`ID'si ${userId} olan kullanıcı bulunamadı`);
      return false;
    }
    
    // Kullanıcı durumunu güncelle
    const updatedUser: User = {
      ...users[userIndex],
      status,
      isActive: status === USER_STATUS.ACTIVE // Geriye dönük uyumluluk için
    };
    
    users[userIndex] = updatedUser;
    
    // Güncellenmiş kullanıcıları kaydet
    return saveUsersToStorage(users);
  } catch (error) {
    console.error(`Kullanıcı durumu güncellenirken hata oluştu: ID=${userId}`, error);
    return false;
  }
};

// Kullanıcı ID'sine göre kullanıcı getir
export const getUserById = (userId: number): User | null => {
  try {
    const users = loadUsersFromStorage();
    const user = users.find(u => u.id === userId);
    return user || null;
  } catch (error) {
    console.error(`ID'si ${userId} olan kullanıcı yüklenirken hata oluştu:`, error);
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
export const getCurrentUser = (): User | null => {
  try {
    // Önce mevcut kullanıcıyı al
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
      
      // Kullanıcı veritabanını al
      const users = loadUsersFromStorage();
      if (!users || users.length === 0) {
        console.log('Kullanıcı veritabanı boş, mevcut kullanıcı kullanılıyor');
        return currentUser;
      }
      
      // Kullanıcı veritabanında mevcut kullanıcıyı bul
      const userFromDb = users.find(u => u.id === currentUser.id);
      if (!userFromDb) {
        console.log('Kullanıcı veritabanında mevcut kullanıcı bulunamadı, mevcut kullanıcı kullanılıyor');
        
        // Mevcut kullanıcıyı kullanıcı veritabanına ekle
        users.push(currentUser);
        saveUsersToStorage(users);
        console.log('Mevcut kullanıcı veritabanına eklendi');
        
        return currentUser;
      }
      
      // Mevcut kullanıcı bilgilerini güncelle
      const mergedUser = { ...userFromDb, ...currentUser, id: currentUser.id };
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(mergedUser));
      console.log('Mevcut kullanıcı güncellendi:', mergedUser);
      
      return mergedUser;
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Mevcut kullanıcı alınırken hata oluştu:', error);
    return null;
  }
};

/**
 * Kullanıcının onay durumunu kontrol eder
 * @param userId Kontrol edilecek kullanıcı ID'si
 * @returns Onay durumu
 */
export const checkUserApprovalStatus = (userId: number): 'pending' | 'approved' | 'rejected' | null => {
  try {
    const user = getUserById(userId);
    if (!user) return null;
    
    if (user.approvalStatus) {
      return user.approvalStatus;
    }
    
    // Eski kullanıcılar için status değerini kontrol et
    if (user.status === USER_STATUS.ACTIVE) {
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
export const getPendingApprovalUsers = (): User[] => {
  try {
    const users = loadUsersFromStorage();
    return users.filter(user => 
      user.status === USER_STATUS.PENDING_APPROVAL || 
      user.approvalStatus === 'pending'
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
export const registerUser = (user: Omit<User, 'id' | 'approvalStatus' | 'registrationDate'>): User | null => {
  try {
    const users = loadUsersFromStorage();
    
    // E-posta kontrolü
    const existingUser = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingUser) {
      console.error('Bu e-posta adresi zaten kullanılıyor');
      return null;
    }
    
    // Yeni kullanıcı ID'si
    const maxId = users.reduce((max, u) => Math.max(max, u.id), 0);
    const newId = maxId + 1;
    
    // Yeni kullanıcı
    const newUser: User = {
      ...user,
      id: newId,
      status: USER_STATUS.PENDING_APPROVAL,
      approvalStatus: 'pending',
      registrationDate: new Date().getTime()
    };
    
    // Kullanıcıyı kaydet
    users.push(newUser);
    saveUsersToStorage(users);
    
    // Onay olayını tetikle
    try {
      const event = new CustomEvent(USER_APPROVAL_REQUESTED_EVENT, { 
        detail: { user: newUser, timestamp: new Date().getTime() } 
      });
      window.dispatchEvent(event);
    } catch (eventError) {
      console.error('Kullanıcı onay olayı tetiklenirken hata oluştu:', eventError);
    }
    
    return newUser;
  } catch (error) {
    console.error('Kullanıcı kaydı oluşturulurken hata oluştu:', error);
    return null;
  }
}

/**
 * Kullanıcıyı onaylar
 * @param userId Onaylanacak kullanıcı ID'si
 * @param adminId Onaylayan yönetici ID'si
 * @returns Başarılı mı
 */
export const approveUser = (userId: number, adminId: number): boolean => {
  try {
    const users = loadUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      console.error(`ID'si ${userId} olan kullanıcı bulunamadı`);
      return false;
    }
    
    // Kullanıcıyı güncelle
    users[userIndex] = {
      ...users[userIndex],
      status: USER_STATUS.ACTIVE,
      approvalStatus: 'approved',
      approvalDate: new Date().getTime(),
      approvedBy: adminId
    };
    
    // Kaydet
    saveUsersToStorage(users);
    
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
export const rejectUser = (userId: number, adminId: number): boolean => {
  try {
    const users = loadUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      console.error(`ID'si ${userId} olan kullanıcı bulunamadı`);
      return false;
    }
    
    // Kullanıcıyı güncelle
    users[userIndex] = {
      ...users[userIndex],
      status: USER_STATUS.REJECTED,
      approvalStatus: 'rejected',
      approvalDate: new Date().getTime(),
      approvedBy: adminId
    };
    
    // Kaydet
    saveUsersToStorage(users);
    
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
export const updateUserProfile = (userId: number, userData: Partial<User>): User | null => {
  try {
    console.log(`Kullanıcı profili güncelleniyor: ID=${userId}`, userData);
    
    const users = loadUsersFromStorage();
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
    const success = saveUsersToStorage(users);
    
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
      console.error(`Kullanıcı profili güncellenirken kaydetme hatası: ID=${userId}`);
      return null;
    }
  } catch (error) {
    console.error('Kullanıcı profili güncellenirken hata oluştu:', error);
    return null;
  }
}

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
