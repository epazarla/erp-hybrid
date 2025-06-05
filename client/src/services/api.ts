// API temel URL'si
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// API istekleri için yardımcı fonksiyon
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Bir hata oluştu');
  }

  return response.json();
}

// Örnek API çağrıları
export const api = {
  // Kullanıcı işlemleri
  getCurrentUser: () => fetchAPI('/api/users/me'),
  
  // Görev işlemleri
  getTasks: () => fetchAPI('/api/tasks'),
  createTask: (taskData: any) => 
    fetchAPI('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),
  
  // Diğer API çağrıları...
};
