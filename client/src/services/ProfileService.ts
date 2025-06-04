// Profil servisi - Kullanıcı profil bilgilerini yönetmek için özel bir servis
import { User } from './UserService';

// LocalStorage anahtarı
export const PROFILE_STORAGE_KEY = 'erp_user_profile';
export const PROFILE_UPDATED_EVENT = 'profileUpdated';

/**
 * Profil bilgilerini localStorage'a kaydet
 * @param profileData Kaydedilecek profil bilgileri
 * @returns Başarılı mı
 */
export const saveProfile = (profileData: Partial<User>): boolean => {
  try {
    // Mevcut profil bilgilerini al
    const existingProfile = getProfile();
    
    // Profil bilgilerini güncelle
    const updatedProfile = {
      ...existingProfile,
      ...profileData,
      // ID değişmemeli
      id: existingProfile?.id || profileData.id
    };
    
    // Profil bilgilerini kaydet
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    console.log('Profil bilgileri kaydedildi:', updatedProfile);
    
    // Profil güncelleme olayını tetikle
    try {
      const event = new CustomEvent(PROFILE_UPDATED_EVENT, {
        detail: { profile: updatedProfile, timestamp: new Date().getTime() }
      });
      window.dispatchEvent(event);
      console.log(`${PROFILE_UPDATED_EVENT} olayı tetiklendi`);
    } catch (eventError) {
      console.error('Profil güncelleme olayı tetiklenirken hata oluştu:', eventError);
    }
    
    return true;
  } catch (error) {
    console.error('Profil bilgileri kaydedilirken hata oluştu:', error);
    return false;
  }
};

/**
 * Profil bilgilerini localStorage'dan al
 * @returns Profil bilgileri veya null
 */
export const getProfile = (): User | null => {
  try {
    const profileData = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (profileData) {
      return JSON.parse(profileData);
    }
    return null;
  } catch (error) {
    console.error('Profil bilgileri yüklenirken hata oluştu:', error);
    return null;
  }
};

/**
 * Profil bilgilerini güncelle
 * @param profileData Güncellenecek profil bilgileri
 * @returns Güncellenmiş profil bilgileri veya null
 */
export const updateProfile = (profileData: Partial<User>): User | null => {
  try {
    // Mevcut profil bilgilerini al
    const existingProfile = getProfile();
    if (!existingProfile) {
      console.error('Güncellenecek profil bulunamadı');
      return null;
    }
    
    // Profil bilgilerini güncelle
    const updatedProfile = {
      ...existingProfile,
      ...profileData,
      // ID değişmemeli
      id: existingProfile.id
    };
    
    // Profil bilgilerini kaydet
    const success = saveProfile(updatedProfile);
    if (success) {
      return updatedProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Profil bilgileri güncellenirken hata oluştu:', error);
    return null;
  }
};

/**
 * Profil bilgilerini sil
 * @returns Başarılı mı
 */
export const clearProfile = (): boolean => {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    console.log('Profil bilgileri silindi');
    return true;
  } catch (error) {
    console.error('Profil bilgileri silinirken hata oluştu:', error);
    return false;
  }
};

// Profil servisi
const profileService = {
  saveProfile,
  getProfile,
  updateProfile,
  clearProfile
};

export default profileService;
