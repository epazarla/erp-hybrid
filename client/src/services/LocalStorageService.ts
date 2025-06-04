/**
 * LocalStorage Servisi
 * Bu servis, localStorage işlemlerini yönetir ve veri tutarlılığını sağlar.
 */

// LocalStorage anahtarları
export const USERS_STORAGE_KEY = 'erp_users_v2';
export const CURRENT_USER_STORAGE_KEY = 'erp_current_user';
export const PROFILE_STORAGE_KEY = 'erp_user_profile';

// Event isimleri
export const STORAGE_UPDATED_EVENT = 'storageUpdated';

/**
 * LocalStorage'dan veri okur
 * @param key LocalStorage anahtarı
 * @returns Okunan veri veya null
 */
export const getItem = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as T;
    }
    return null;
  } catch (error) {
    console.error(`LocalStorage'dan veri okunurken hata oluştu (${key}):`, error);
    return null;
  }
};

/**
 * LocalStorage'a veri yazar
 * @param key LocalStorage anahtarı
 * @param data Yazılacak veri
 * @param triggerEvent Event tetiklensin mi
 * @returns Başarılı mı
 */
export const setItem = <T>(key: string, data: T, triggerEvent = true): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`LocalStorage'a veri yazıldı (${key}):`, data);
    
    if (triggerEvent) {
      // Storage güncelleme olayını tetikle
      try {
        const event = new CustomEvent(STORAGE_UPDATED_EVENT, {
          detail: { key, data, timestamp: new Date().getTime() }
        });
        window.dispatchEvent(event);
        console.log(`${STORAGE_UPDATED_EVENT} olayı tetiklendi (${key})`);
      } catch (eventError) {
        console.error(`Storage güncelleme olayı tetiklenirken hata oluştu (${key}):`, eventError);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`LocalStorage'a veri yazılırken hata oluştu (${key}):`, error);
    return false;
  }
};

/**
 * LocalStorage'dan veri siler
 * @param key LocalStorage anahtarı
 * @param triggerEvent Event tetiklensin mi
 * @returns Başarılı mı
 */
export const removeItem = (key: string, triggerEvent = true): boolean => {
  try {
    localStorage.removeItem(key);
    console.log(`LocalStorage'dan veri silindi (${key})`);
    
    if (triggerEvent) {
      // Storage güncelleme olayını tetikle
      try {
        const event = new CustomEvent(STORAGE_UPDATED_EVENT, {
          detail: { key, data: null, timestamp: new Date().getTime() }
        });
        window.dispatchEvent(event);
        console.log(`${STORAGE_UPDATED_EVENT} olayı tetiklendi (${key})`);
      } catch (eventError) {
        console.error(`Storage güncelleme olayı tetiklenirken hata oluştu (${key}):`, eventError);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`LocalStorage'dan veri silinirken hata oluştu (${key}):`, error);
    return false;
  }
};

/**
 * LocalStorage'ı temizler
 * @returns Başarılı mı
 */
export const clear = (): boolean => {
  try {
    localStorage.clear();
    console.log('LocalStorage temizlendi');
    return true;
  } catch (error) {
    console.error('LocalStorage temizlenirken hata oluştu:', error);
    return false;
  }
};

// LocalStorage servisi
const localStorageService = {
  getItem,
  setItem,
  removeItem,
  clear,
  USERS_STORAGE_KEY,
  CURRENT_USER_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  STORAGE_UPDATED_EVENT
};

export default localStorageService;
