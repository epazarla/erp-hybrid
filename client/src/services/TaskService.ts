import { mockTasks } from '../data/mockData';
import { getActiveUsers } from './UserService';

// Task arayüzü
export interface Task {
  id: number;
  title: string;
  description: string;
  assigned_to: number;
  status: string;
  due_date: string;
  created_at: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  deleted_at?: string | null;
  // Yeni eklenen alanlar
  tags?: string[];
  progress?: number; // 0-100 arası ilerleme yüzdesi
  estimated_hours?: number; // Tahmini tamamlanma süresi (saat)
  actual_hours?: number; // Gerçek tamamlanma süresi (saat)
  dependencies?: number[]; // Bağımlı olunan görev ID'leri
  comments?: TaskComment[];
  reminder_date?: string; // Hatırlatma tarihi
  start_date?: string; // Başlangıç tarihi
  client_id?: string; // Müşteri ID'si
}

// Görev yorumları için arayüz
export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  comment: string;
  created_at: string;
}

// Sabitler
export const TASKS_STORAGE_KEY = 'erp_tasks_v7'; // Versiyon numarasını artırdık, yeni durum
// Olaylar
export const TASKS_UPDATED_EVENT = 'tasks-updated';
export const TASK_COMPLETION_UPDATE_EVENT = 'task-completion-update';
export const UPCOMING_TASKS_UPDATE_EVENT = 'upcoming-tasks-update'; // Görev tamamlama oranı güncelleme olayı

// Görev durumları - İngilizce kodlar ve Türkçe karşılıkları
export const TASK_STATUSES = ['pending', 'in_progress', 'on_hold', 'completed', 'cancelled'];
export const TASK_STATUS_LABELS: Record<string, string> = {
  'pending': 'Bekliyor',
  'in_progress': 'Devam Ediyor',
  'on_hold': 'Beklemede',
  'completed': 'Tamamlandı',
  'cancelled': 'İptal Edildi'
};
export const TASK_TAGS = [
  'Acil',
  'Bug',
  'Geliştirme',
  'Tasarım',
  'Dokümantasyon',
  'Test',
  'Araştırma',
  'Toplantı',
  'Destek',
  'Pazarlama'
];

// Görev öncelikleri
export const TASK_PRIORITIES = ['low', 'medium', 'high'];

/**
 * Tüm görevleri getirir
 * @returns Tüm görevler
 */
export const getAllTasks = (): Task[] => {
  try {
    const tasks = loadTasksFromStorage();
    // Silinmemiş görevleri filtrele
    const activeTasks = tasks.filter(task => !task.deleted_at);
    console.log(`[${new Date().toISOString()}] ${activeTasks.length} aktif görev filtrelendi (toplam: ${tasks.length})`);
    return activeTasks;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görevler getirilirken hata oluştu:`, error);
    return [];
  }
};

/**
 * LocalStorage'dan görevleri yükler
 * @returns Yüklenen görevler
 */
export const loadTasksFromStorage = (): Task[] => {
  try {
    // localStorage'dan veriyi oku
    const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    console.log(`[${new Date().toISOString()}] LocalStorage okuma:`, { key: TASKS_STORAGE_KEY, data: savedTasks ? 'Veri var' : 'Veri yok' });
    
    if (savedTasks) {
      try {
        // JSON parse et
        const parsedTasks = JSON.parse(savedTasks);
        
        // Dizi olup olmadığını kontrol et
        if (Array.isArray(parsedTasks)) {
          console.log(`[${new Date().toISOString()}] ${parsedTasks.length} görev localStorage'dan yüklendi`);
          return parsedTasks;
        } else {
          console.error(`[${new Date().toISOString()}] Yüklenen veri bir dizi değil:`, parsedTasks);
          // Geçersiz veriyi temizle ve örnek görevler oluştur
          localStorage.removeItem(TASKS_STORAGE_KEY);
        }
      } catch (parseError) {
        console.error(`[${new Date().toISOString()}] JSON parse hatası:`, parseError);
        // Geçersiz veriyi temizle ve örnek görevler oluştur
        localStorage.removeItem(TASKS_STORAGE_KEY);
      }
    }
    
    console.log(`[${new Date().toISOString()}] LocalStorage'da görev verisi bulunamadı, örnek veriler oluşturuluyor`);
    
    // Örnek görevler oluşturalım
    const demoTasks: Task[] = [
      {
        id: 1,
        title: 'Web sitesi tasarımı',
        description: 'Firma web sitesinin yeniden tasarlanması',
        assigned_to: 1,
        status: 'in_progress',
        due_date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        priority: 'high',
        category: 'Tasarım',
        tags: ['Web', 'Tasarım'],
        progress: 60,
        estimated_hours: 40,
        actual_hours: 25,
        start_date: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        title: 'API entegrasyonu',
        description: 'Ödeme sistemi API entegrasyonu',
        assigned_to: 2,
        status: 'pending',
        due_date: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        priority: 'medium',
        category: 'Geliştirme',
        tags: ['API', 'Backend'],
        progress: 0,
        estimated_hours: 20,
        start_date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        title: 'Mobil uygulama testi',
        description: 'iOS ve Android uygulamalarının test edilmesi',
        assigned_to: 3,
        status: 'completed',
        due_date: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        category: 'Test',
        tags: ['Mobil', 'Test'],
        progress: 100,
        estimated_hours: 15,
        actual_hours: 12,
        start_date: new Date(new Date().getTime() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        title: 'SEO optimizasyonu',
        description: 'Web sitesi SEO çalışması',
        assigned_to: 1,
        status: 'on_hold',
        due_date: new Date(new Date().getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'low',
        category: 'Pazarlama',
        tags: ['SEO', 'Pazarlama'],
        progress: 30,
        estimated_hours: 10,
        actual_hours: 3,
        start_date: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 5,
        title: 'Sosyal medya kampanyası',
        description: 'Yeni ürün için sosyal medya kampanyası hazırlanması',
        assigned_to: 4,
        status: 'cancelled',
        due_date: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        category: 'Pazarlama',
        tags: ['Sosyal Medya', 'Pazarlama'],
        progress: 0,
        estimated_hours: 25,
        start_date: new Date(new Date().getTime() - 35 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    // Örnek görevleri localStorage'a kaydet
    _saveTasksToStorageInternal(demoTasks);
    
    console.log(`[${new Date().toISOString()}] ${demoTasks.length} örnek görev oluşturuldu ve kaydedildi`);
    return demoTasks;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görevler yüklenirken hata oluştu:`, error);
    // Hata durumunda boş bir dizi döndür
    return [];
  }
};

/**
 * Görevleri LocalStorage'a kaydeder (olay tetiklemeden)
 * @param tasks Kaydedilecek görevler
 * @returns Başarılı mı
 */
const _saveTasksToStorageInternal = (tasks: Task[]): boolean => {
  if (!Array.isArray(tasks)) {
    console.error(`[${new Date().toISOString()}] Kaydedilmeye çalışılan veri bir dizi değil`);
    return false;
  }

  try {
    // Verileri JSON formatına dönüştür
    const tasksJson = JSON.stringify(tasks);
    
    // Önce mevcut veriyi temizle
    localStorage.removeItem(TASKS_STORAGE_KEY);
    
    // Yeni verileri kaydet
    localStorage.setItem(TASKS_STORAGE_KEY, tasksJson);
    
    console.log(`[${new Date().toISOString()}] ${tasks.length} görev localStorage'a kaydedildi`);
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görevler kaydedilirken hata oluştu:`, error);
    return false;
  }
};

/**
 * Görevleri LocalStorage'a kaydeder ve olay tetikler
 * @param tasks Kaydedilecek görevler
 * @returns Başarılı mı
 */
export const saveTasksToStorage = (tasks: Task[]): boolean => {
  try {
    // Görevleri kaydet
    const success = _saveTasksToStorageInternal(tasks);
    
    if (success) {
      console.log(`[${new Date().toISOString()}] Görevler başarıyla kaydedildi ve olay tetikleniyor...`);
      
      // Görevler güncellendi olayını tetikle - detaylı bilgilerle
      try {
        // Sadece silinmemiş görevleri filtrele
        const activeTasks = tasks.filter(t => !t.deleted_at);
        
        // Görev durumlarına göre sayıları hesapla
        const statusCounts = {
          pending: activeTasks.filter(t => t.status === 'pending').length,
          in_progress: activeTasks.filter(t => t.status === 'in_progress').length,
          on_hold: activeTasks.filter(t => t.status === 'on_hold').length,
          completed: activeTasks.filter(t => t.status === 'completed').length,
          cancelled: activeTasks.filter(t => t.status === 'cancelled').length,
          total: activeTasks.length
        };
        
        // Tamamlanma oranını hesapla
        const totalTasks = activeTasks.length;
        const completedTasks = activeTasks.filter(t => t.status === 'completed').length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Detaylı bilgilerle event oluştur
        const event = new CustomEvent(TASKS_UPDATED_EVENT, {
          detail: {
            timestamp: new Date().toISOString(),
            counts: statusCounts,
            totalTasks: totalTasks,
            completedTasks: completedTasks,
            pendingTasks: statusCounts.pending,
            inProgressTasks: statusCounts.in_progress,
            completionRate: completionRate
          }
        });
        
        // Görev tamamlama güncelleme olayını da tetikle
        const completionEvent = new CustomEvent(TASK_COMPLETION_UPDATE_EVENT, {
          detail: {
            timestamp: new Date().toISOString(),
            source: 'task-service',
            counts: statusCounts,
            totalTasks: totalTasks,
            completedTasks: completedTasks,
            completionRate: completionRate,
            taskList: activeTasks.map(t => ({
              id: t.id,
              title: t.title,
              status: t.status,
              priority: t.priority,
              due_date: t.due_date,
              assigned_to: t.assigned_to
            }))
          }
        });
        
        // Yakın zamanda bitiş tarihi olan görevleri hesapla
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const upcomingTasks = activeTasks
          .filter(task => {
            const dueDate = new Date(task.due_date);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate >= today && dueDate <= nextWeek && 
                  task.status !== 'completed' && task.status !== 'cancelled';
          })
          .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        
        // Yakın görevler event'ini oluştur
        const upcomingEvent = new CustomEvent(UPCOMING_TASKS_UPDATE_EVENT, {
          detail: {
            timestamp: new Date().toISOString(),
            source: 'task-service',
            upcomingTasks: upcomingTasks.map(t => ({
              id: t.id,
              title: t.title,
              status: t.status,
              priority: t.priority,
              due_date: t.due_date,
              assigned_to: t.assigned_to,
              description: t.description,
              category: t.category
            })),
            upcomingTasksCount: upcomingTasks.length
          }
        });
        
        // Event'leri tetikle
        window.dispatchEvent(event);
        window.dispatchEvent(completionEvent);
        window.dispatchEvent(upcomingEvent);
        
        console.log(`[${new Date().toISOString()}] Görev güncelleme olayları tetiklendi:`, {
          statusCounts,
          completionRate: `%${completionRate} (${completedTasks}/${totalTasks})`
        });
      } catch (eventError) {
        console.error(`[${new Date().toISOString()}] Görev güncelleme olayı tetiklenirken hata oluştu:`, eventError);
      }
    }
    
    return success;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görevler kaydedilirken hata oluştu:`, error);
    return false;
  }
};

/**
 * Görev tamamlama oranlarını hesaplar ve güncelleme olayı tetikler
 * Bu fonksiyon TasksPage'den çağrılabilir
 * @param source Olayı tetikleyen kaynak ('tasks-page', 'dashboard', vb.)
 * @param tasks Görev listesi (verilmezse localStorage'dan alınır)
 */
export const updateTaskCompletionStats = (source: string = 'manual-update', tasks?: Task[]): void => {
  try {
    // Görevleri al (verilmemişse localStorage'dan)
    const allTasks = tasks || getAllTasks();
    
    // Sadece silinmemiş görevleri filtrele
    const activeTasks = allTasks.filter(t => !t.deleted_at);
    
    // Görev durumlarına göre sayıları hesapla
    const statusCounts = {
      pending: activeTasks.filter(t => t.status === 'pending').length,
      in_progress: activeTasks.filter(t => t.status === 'in_progress').length,
      on_hold: activeTasks.filter(t => t.status === 'on_hold').length,
      completed: activeTasks.filter(t => t.status === 'completed').length,
      cancelled: activeTasks.filter(t => t.status === 'cancelled').length,
      total: activeTasks.length
    };
    
    // Tamamlanma oranını hesapla
    const totalTasks = activeTasks.length;
    const completedTasks = activeTasks.filter(t => t.status === 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Görev tamamlama güncelleme olayını tetikle
    const completionEvent = new CustomEvent(TASK_COMPLETION_UPDATE_EVENT, {
      detail: {
        timestamp: new Date().toISOString(),
        source: source,
        counts: statusCounts,
        totalTasks: totalTasks,
        completedTasks: completedTasks,
        completionRate: completionRate,
        taskList: activeTasks.map(t => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          due_date: t.due_date,
          assigned_to: t.assigned_to
        }))
      }
    });
    
    // Event'i tetikle
    window.dispatchEvent(completionEvent);
    
    console.log(`[${new Date().toISOString()}] Görev tamamlama istatistikleri güncellendi (${source}):`, {
      statusCounts,
      completionRate: `%${completionRate} (${completedTasks}/${totalTasks})`
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görev tamamlama istatistikleri güncellenirken hata oluştu:`, error);
  }
};

/**
 * Belirli bir görevi getirir
 * @param taskId Görev ID'si
 * @returns Görev veya null
 */
export const getTaskById = (taskId: number): Task | null => {
  try {
    const tasks = loadTasksFromStorage();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.error(`[${new Date().toISOString()}] Görev bulunamadı: ID=${taskId}`);
      return null;
    }
    
    return task;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görev (ID: ${taskId}) getirilirken hata oluştu:`, error);
    return null;
  }
};

/**
 * Yeni bir görev ekler
 * @param task Eklenecek görev (ID hariç)
 * @returns Eklenen görev veya null
 */
export const addTask = (task: Omit<Task, 'id' | 'created_at'>): Task | null => {
  try {
    const tasks = loadTasksFromStorage();
    
    // Yeni ID oluştur (mevcut en yüksek ID + 1)
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    
    // Yeni görevi oluştur
    const newTask: Task = {
      ...task,
      id: newId,
      created_at: new Date().toISOString()
    };
    
    // Yeni görevi ekle ve kaydet
    tasks.push(newTask);
    saveTasksToStorage(tasks);
    
    console.log(`[${new Date().toISOString()}] Yeni görev eklendi: ID=${newId}`);
    return newTask;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görev eklenirken hata oluştu:`, error);
    return null;
  }
};

/**
 * Bir görevi günceller
 * @param taskId Güncellenecek görev ID'si
 * @param updates Güncellenecek alanlar
 * @returns Güncellenen görev veya null
 */
export const updateTask = (taskId: number, updates: Partial<Omit<Task, 'id' | 'created_at'>>): Task | null => {
  try {
    const tasks = loadTasksFromStorage();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      console.error(`[${new Date().toISOString()}] Güncellenecek görev bulunamadı: ID=${taskId}`);
      return null;
    }
    
    // Görevi güncelle
    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...updates
    };
    
    // Güncellenen görevi diziye ekle ve kaydet
    tasks[taskIndex] = updatedTask;
    saveTasksToStorage(tasks);
    
    console.log(`[${new Date().toISOString()}] Görev güncellendi: ID=${taskId}`);
    return updatedTask;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görev (ID: ${taskId}) güncellenirken hata oluştu:`, error);
    return null;
  }
};

/**
 * Bir görevi siler (soft delete)
 * @param taskId Silinecek görev ID'si
 * @returns Başarılı mı
 */
export const deleteTask = (taskId: number): boolean => {
  try {
    console.log(`[${new Date().toISOString()}] Görev silme işlemi başlatıldı: ID=${taskId}`);
    const tasks = loadTasksFromStorage();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      console.error(`[${new Date().toISOString()}] Silinecek görev bulunamadı: ID=${taskId}`);
      return false;
    }
    
    // Görevi soft delete yap
    tasks[taskIndex].deleted_at = new Date().toISOString();
    
    // Değişiklikleri kaydet
    const result = saveTasksToStorage(tasks);
    
    if (result) {
      console.log(`[${new Date().toISOString()}] Görev başarıyla silindi: ID=${taskId}`);
      return true;
    } else {
      console.error(`[${new Date().toISOString()}] Görev silinirken kaydetme hatası: ID=${taskId}`);
      return false;
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görev (ID: ${taskId}) silinirken hata oluştu:`, error);
    return false;
  }
};

/**
 * Silinen bir görevi geri getirir
 * @param taskId Geri getirilecek görev ID'si
 * @returns Başarılı mı
 */
export const restoreTask = (taskId: number): boolean => {
  try {
    const tasks = loadTasksFromStorage();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      console.error(`[${new Date().toISOString()}] Geri getirilecek görev bulunamadı: ID=${taskId}`);
      return false;
    }
    
    // Görevi geri getir
    tasks[taskIndex].deleted_at = undefined;
    saveTasksToStorage(tasks);
    
    console.log(`[${new Date().toISOString()}] Görev başarıyla geri getirildi: ID=${taskId}`);
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görev (ID: ${taskId}) geri getirilirken hata oluştu:`, error);
    return false;
  }
};

/**
 * Bir göreve etiket ekler
 * @param taskId Görev ID'si
 * @param tag Eklenecek etiket
 * @returns Güncellenen görev veya null
 */
export const addTagToTask = (taskId: number, tag: string): Task | null => {
  try {
    const task = getTaskById(taskId);
    if (!task) return null;
    
    // Etiketleri oluştur veya mevcut etiketleri kullan
    const tags = task.tags || [];
    
    // Etiket zaten varsa ekleme
    if (tags.includes(tag)) return task;
    
    // Etiketi ekle
    tags.push(tag);
    
    // Görevi güncelle
    return updateTask(taskId, { tags });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Göreve (ID: ${taskId}) etiket eklenirken hata oluştu:`, error);
    return null;
  }
};

/**
 * Bir görevden etiket kaldırır
 * @param taskId Görev ID'si
 * @param tag Kaldırılacak etiket
 * @returns Güncellenen görev veya null
 */
export const removeTagFromTask = (taskId: number, tag: string): Task | null => {
  try {
    const task = getTaskById(taskId);
    if (!task || !task.tags) return null;
    
    // Etiketi kaldır
    const tags = task.tags.filter(t => t !== tag);
    
    // Görevi güncelle
    return updateTask(taskId, { tags });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görevden (ID: ${taskId}) etiket kaldırılırken hata oluştu:`, error);
    return null;
  }
};

/**
 * Bir göreve bağımlılık ekler
 * @param taskId Görev ID'si
 * @param dependencyId Bağımlılık ID'si
 * @returns Güncellenen görev veya null
 */
export const addTaskDependency = (taskId: number, dependencyId: number): Task | null => {
  try {
    const task = getTaskById(taskId);
    if (!task) return null;
    
    // Bağımlılıkları oluştur veya mevcut bağımlılıkları kullan
    const dependencies = task.dependencies || [];
    
    // Bağımlılık zaten varsa ekleme
    if (dependencies.includes(dependencyId)) return task;
    
    // Bağımlılığı ekle
    dependencies.push(dependencyId);
    
    // Görevi güncelle
    return updateTask(taskId, { dependencies });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Göreve (ID: ${taskId}) bağımlılık eklenirken hata oluştu:`, error);
    return null;
  }
};

/**
 * Bir görevden bağımlılık kaldırır
 * @param taskId Görev ID'si
 * @param dependencyId Bağımlılık ID'si
 * @returns Güncellenen görev veya null
 */
export const removeTaskDependency = (taskId: number, dependencyId: number): Task | null => {
  try {
    const task = getTaskById(taskId);
    if (!task || !task.dependencies) return null;
    
    // Bağımlılığı kaldır
    const dependencies = task.dependencies.filter(d => d !== dependencyId);
    
    // Görevi güncelle
    return updateTask(taskId, { dependencies });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görevden (ID: ${taskId}) bağımlılık kaldırılırken hata oluştu:`, error);
    return null;
  }
};

/**
 * Görev ilerleme durumunu günceller
 * @param taskId Görev ID'si
 * @param progress İlerleme yüzdesi (0-100)
 * @returns Güncellenen görev veya null
 */
export const updateTaskProgress = (taskId: number, progress: number): Task | null => {
  try {
    // İlerleme yüzdesini sınırla (0-100)
    const validProgress = Math.min(Math.max(0, progress), 100);
    
    // Görevi güncelle
    return updateTask(taskId, { progress: validProgress });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görev (ID: ${taskId}) ilerleme durumu güncellenirken hata oluştu:`, error);
    return null;
  }
};

/**
 * Göreve yorum ekler
 * @param taskId Görev ID'si
 * @param userId Kullanıcı ID'si
 * @param comment Yorum metni
 * @returns Güncellenen görev veya null
 */
export const addCommentToTask = (taskId: number, userId: number, comment: string): Task | null => {
  try {
    const task = getTaskById(taskId);
    if (!task) return null;
    
    // Yorumları oluştur veya mevcut yorumları kullan
    const comments = task.comments || [];
    
    // Yeni yorum ID'si oluştur
    const commentId = comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1;
    
    // Yeni yorumu oluştur
    const newComment: TaskComment = {
      id: commentId,
      task_id: taskId,
      user_id: userId,
      comment: comment,
      created_at: new Date().toISOString()
    };
    
    // Yorumu ekle
    comments.push(newComment);
    
    // Görevi güncelle
    return updateTask(taskId, { comments });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Göreve (ID: ${taskId}) yorum eklenirken hata oluştu:`, error);
    return null;
  }
};

/**
 * Görevden yorum kaldırır
 * @param taskId Görev ID'si
 * @param commentId Yorum ID'si
 * @returns Güncellenen görev veya null
 */
export const removeCommentFromTask = (taskId: number, commentId: number): Task | null => {
  try {
    const task = getTaskById(taskId);
    if (!task || !task.comments) return null;
    
    // Yorumu kaldır
    const comments = task.comments.filter(c => c.id !== commentId);
    
    // Görevi güncelle
    return updateTask(taskId, { comments });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görevden (ID: ${taskId}) yorum kaldırılırken hata oluştu:`, error);
    return null;
  }
};

/**
 * Göreve hatırlatıcı ekler
 * @param taskId Görev ID'si
 * @param reminderDate Hatırlatma tarihi
 * @returns Güncellenen görev veya null
 */
export const setTaskReminder = (taskId: number, reminderDate: string | undefined): Task | null => {
  try {
    // Görevi güncelle
    return updateTask(taskId, { reminder_date: reminderDate });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görev (ID: ${taskId}) hatırlatıcısı ayarlanırken hata oluştu:`, error);
    return null;
  }
};

/**
 * Görev başlangıç tarihini ayarlar
 * @param taskId Görev ID'si
 * @param startDate Başlangıç tarihi
 * @returns Güncellenen görev veya null
 */
export const setTaskStartDate = (taskId: number, startDate: string): Task | null => {
  try {
    // Görevi güncelle
    return updateTask(taskId, { start_date: startDate });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görev (ID: ${taskId}) başlangıç tarihi ayarlanırken hata oluştu:`, error);
    return null;
  }
};

/**
 * Görev tahmini süresini ayarlar
 * @param taskId Görev ID'si
 * @param hours Tahmini saat
 * @returns Güncellenen görev veya null
 */
export const setTaskEstimatedHours = (taskId: number, hours: number): Task | null => {
  try {
    // Görevi güncelle
    return updateTask(taskId, { estimated_hours: hours });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görev (ID: ${taskId}) tahmini süresi ayarlanırken hata oluştu:`, error);
    return null;
  }
};

/**
 * Görev gerçek süresini ayarlar
 * @param taskId Görev ID'si
 * @param hours Gerçek saat
 * @returns Güncellenen görev veya null
 */
export const setTaskActualHours = (taskId: number, hours: number): Task | null => {
  try {
    // Görevi güncelle
    return updateTask(taskId, { actual_hours: hours });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görev (ID: ${taskId}) gerçek süresi ayarlanırken hata oluştu:`, error);
    return null;
  }
};
