/**
 * API servis sınıfı
 * Tüm API isteklerini yönetir
 */

// API URL'ini ortam değişkeninden al
// @ts-ignore - Vite ortam değişkenleri için tip tanımı eklenmedi
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * API istekleri için temel fonksiyonlar
 */
export const ApiService = {
  /**
   * GET isteği gönderir
   * @param endpoint - API endpoint'i
   * @returns Promise<T> - API yanıtı
   */
  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`API isteği başarısız: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`GET ${endpoint} isteği sırasında hata:`, error);
      throw error;
    }
  },
  
  /**
   * POST isteği gönderir
   * @param endpoint - API endpoint'i
   * @param data - Gönderilecek veri
   * @returns Promise<T> - API yanıtı
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API isteği başarısız: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`POST ${endpoint} isteği sırasında hata:`, error);
      throw error;
    }
  },
  
  /**
   * PUT isteği gönderir
   * @param endpoint - API endpoint'i
   * @param data - Gönderilecek veri
   * @returns Promise<T> - API yanıtı
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API isteği başarısız: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`PUT ${endpoint} isteği sırasında hata:`, error);
      throw error;
    }
  },
  
  /**
   * DELETE isteği gönderir
   * @param endpoint - API endpoint'i
   * @returns Promise<T> - API yanıtı
   */
  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`API isteği başarısız: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`DELETE ${endpoint} isteği sırasında hata:`, error);
      throw error;
    }
  },
};

export default ApiService;
