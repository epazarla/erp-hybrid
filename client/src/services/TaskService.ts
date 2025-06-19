import { supabase } from '../lib/supabase';
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

// Veritabanı tablo adı
const TASKS_TABLE = 'tasks';

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
export const UPCOMING_TASKS_UPDATE_EVENT = 'upcoming-tasks-update';
export const TASK_STATUS_UPDATE_EVENT = 'task-status-update';
export const RECENT_TASKS_UPDATE_EVENT = 'recent-tasks-update';
export const TASK_WIDGET_UPDATE_EVENT = 'task-widget-update';

// Olay yönetimi yardımcı fonksiyonları
export const dispatchTaskEvent = (eventName: string, data: any) => {
  console.log(`${eventName} olayı tetikleniyor:`, data);
  const event = new CustomEvent(eventName, { detail: data });
  window.dispatchEvent(event);
};

export const dispatchAllTaskEvents = (tasks: Task[], source: string): void => {
  // Tüm görev olaylarını tek bir fonksiyonla tetikle
  
  // 1. Görev tamamlama istatistikleri
  const completedTasksCount = tasks.filter((task: Task) => task.status === 'completed').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;
  
  // Durum sayılarını hesapla
  const statusCounts: Record<string, number> = {};
  TASK_STATUSES.forEach((status: string) => {
    statusCounts[status] = tasks.filter((task: Task) => task.status === status).length;
  });
  
  // Görev tamamlama olayını gönder
  dispatchTaskEvent(TASK_COMPLETION_UPDATE_EVENT, {
    source,
    completionRate,
    counts: statusCounts,
    totalTasks: tasks.length,
    completedTasks: completedTasksCount,
    timestamp: new Date().toISOString()
  });
  
  // 2. Yaklaşan görevleri hesapla
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingTasksList = tasks
    .filter((task: Task) => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate <= nextWeek && 
            task.status !== 'completed' && task.status !== 'cancelled';
    })
    .sort((a: Task, b: Task) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  
  // Yaklaşan görevler olayını gönder
  dispatchTaskEvent(UPCOMING_TASKS_UPDATE_EVENT, {
    source,
    tasks: upcomingTasksList,
    count: upcomingTasksList.length,
    timestamp: new Date().toISOString()
  });
  
  // 3. Son görevleri gönder
  const recentTasks = [...tasks]
    .sort((a: Task, b: Task) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  
  dispatchTaskEvent(RECENT_TASKS_UPDATE_EVENT, {
    source,
    tasks: recentTasks,
    timestamp: new Date().toISOString()
  });
  
  // 4. Genel güncelleme olayını gönder
  dispatchTaskEvent(TASKS_UPDATED_EVENT, {
    source,
    timestamp: new Date().toISOString()
  });
  
  // 5. Tüm widget'ları güncelleme olayı
  dispatchTaskEvent(TASK_WIDGET_UPDATE_EVENT, {
    source,
    tasks,
    statusCounts,
    completionRate,
    upcomingTasks: upcomingTasksList,
    recentTasks,
    timestamp: new Date().toISOString()
  });
};

// Görev durumları - İngilizce kodlar ve Türkçe karşılıkları
export const TASK_STATUSES = ['completed', 'pending', 'in-progress', 'on-hold', 'cancelled'];
export const TASK_STATUS_LABELS: Record<string, string> = {
  'completed': 'Tamamlandı',
  'pending': 'Bekliyor',
  'in-progress': 'Devam Ediyor',
  'on-hold': 'Beklemede',
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
 * Tüm görevleri veritabanından getirir
 * @returns Tüm görevler
 */
export const getAllTasks = async (): Promise<Task[]> => {
  try {
    // Bağlantı durumunu kontrol et
    if (!supabase) {
      console.error(`[${new Date().toISOString()}] Supabase bağlantısı mevcut değil`);
      // LocalStorage'dan yükle
      return loadTasksFromStorage();
    }
    
    // Veritabanından görevleri getir
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .is('deleted_at', null);
      
    if (error) {
      console.error(`[${new Date().toISOString()}] Supabase sorgu hatası:`, error.message);
      console.error('Hata detayları:', error);
      // Hata durumunda localStorage'dan yükle
      return loadTasksFromStorage();
    }
    
    // Başarılı sonuç
    console.log(`[${new Date().toISOString()}] ${data?.length || 0} aktif görev veritabanından getirildi`);
    
    // Veriyi localStorage'a da kaydet (yedek olarak)
    if (data && data.length > 0) {
      _saveTasksToStorageInternal(data);
    }
    
    return data || [];
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Görevler veritabanından getirilirken hata oluştu:`, error?.message || error);
    console.error('Hata detayları:', error);
    
    // Hata durumunda localStorage'dan yükle
    return loadTasksFromStorage();
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
        return parsedTasks;
      } catch (e) {
        console.error('Görevler parse edilirken hata oluştu:', e);
        return [];
      }
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görevler yüklenirken hata oluştu:`, error);
  }
  
  // İlk kez yükleniyorsa boş dizi döndür
  const initialTasks: Task[] = [];
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(initialTasks));
  return initialTasks;
};

/**
 * Tüm görevleri getir ve olayları tetikle
 * @param source Olayı tetikleyen kaynak ('tasks-page', 'dashboard', vb.)
 * @returns Tüm görevler Promise'i
 */
export const getAllTasksAndNotify = async (source: string = 'service-call'): Promise<Task[]> => {
  const tasks = await getAllTasks();
  dispatchAllTaskEvents(tasks, source);
  return tasks;
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
            upcomingTasks: upcomingTasks.map((t: Task) => ({
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
export const updateTaskCompletionStats = async (source: string = 'manual-update', tasks?: Task[]): Promise<void> => {
  try {
    // Görevleri al (verilmemişse localStorage'dan)
    const allTasks = tasks || await getAllTasks();
    
    // Sadece silinmemiş görevleri filtrele
    const activeTasks = allTasks.filter((t: Task) => !t.deleted_at);
    
    // Görev durumlarına göre sayıları hesapla
    const statusCounts = {
      pending: activeTasks.filter((t: Task) => t.status === 'pending').length,
      in_progress: activeTasks.filter((t: Task) => t.status === 'in_progress').length,
      on_hold: activeTasks.filter((t: Task) => t.status === 'on_hold').length,
      completed: activeTasks.filter((t: Task) => t.status === 'completed').length,
      cancelled: activeTasks.filter((t: Task) => t.status === 'cancelled').length,
      total: activeTasks.length
    };
    
    // Tamamlanma oranını hesapla
    const totalTasks = activeTasks.length;
    const completedTasks = activeTasks.filter((t: Task) => t.status === 'completed').length;
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
        taskList: activeTasks.map((t: Task) => ({
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
 * @returns Görev veya null Promise'i
 */
export const getTaskById = async (taskId: number): Promise<Task | null> => {
  try {
    const tasks = await getAllTasks();
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
export const addTask = async (task: Omit<Task, 'id' | 'created_at'>): Promise<Task | null> => {
  try {
    const tasks = await getAllTasks();
    
    // Yeni ID oluştur
    const maxId = tasks.length > 0 ? Math.max(...tasks.map((t: Task) => t.id)) : 0;
    const newTask: Task = {
      ...task,
      id: maxId + 1,
      created_at: new Date().toISOString()
    };
    
    tasks.push(newTask);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    
    // Tüm olayları tetikle
    dispatchAllTaskEvents(tasks, 'task-add');
    
    return newTask;
  } catch (e) {
    console.error('Görev eklenirken hata oluştu:', e);
    return null;
  }
};

/**
 * Bir görevi günceller
 * @param taskId Güncellenecek görev ID'si
 * @param updatedFields Güncellenecek alanlar
 * @returns Güncellenen görev veya null Promise'i
 */
export const updateTask = async (taskId: number, updatedFields: Partial<Task>): Promise<Task | null> => {
  try {
    const tasks = await getAllTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      console.error(`ID=${taskId} olan görev bulunamadı`);
      return null;
    }
    
    // Güncellenen görev
    const updatedTask = { ...tasks[taskIndex], ...updatedFields };
    tasks[taskIndex] = updatedTask;
    
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    
    // Tüm olayları tetikle
    dispatchAllTaskEvents(tasks, 'task-update');
    
    return updatedTask;
  } catch (e) {
    console.error('Görev güncellenirken hata oluştu:', e);
    return null;
  }
};

/**
 * Silinen bir görevi geri getirir
 * @param taskId Geri getirilecek görev ID'si
 * @returns Başarılı mı olduğunu belirten Promise
 */
export const restoreTask = async (taskId: number): Promise<boolean> => {
  try {
    const tasks = await getAllTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      console.error(`ID=${taskId} olan görev bulunamadı`);
      return false;
    }
    
    // Görevi geri getir
    tasks[taskIndex].deleted_at = undefined;
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    
    // Tüm olayları tetikle
    dispatchAllTaskEvents(tasks, 'task-restore');
    
    return true;
  } catch (e) {
    console.error('Görev geri getirilirken hata oluştu:', e);
    return false;
  }
};

/**
 * Görev sil (soft delete)
 * @param taskId Silinecek görev ID'si
 * @returns Başarılı mı olduğunu belirten Promise
 */
export const deleteTask = async (taskId: number): Promise<boolean> => {
  try {
    // loadTasksFromStorage zaten senkron olduğu için await gerekmiyor
    const tasks = loadTasksFromStorage();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      console.error(`ID=${taskId} olan görev bulunamadı`);
      return false;
    }
    
    // Soft delete - deleted_at alanını güncelle
    tasks[taskIndex].deleted_at = new Date().toISOString();
    
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    
    // Tüm olayları tetikle
    dispatchAllTaskEvents(tasks.filter(t => !t.deleted_at), 'task-delete');
    
    return true;
  } catch (e) {
    console.error('Görev silinirken hata oluştu:', e);
    return false;
  }
};

/**
 * Bir göreve etiket ekler
 * @param taskId Görev ID'si
 * @param tag Eklenecek etiket
 * @returns Güncellenen görev veya null Promise'i
 */
export const addTagToTask = async (taskId: number, tag: string): Promise<Task | null> => {
  try {
    const task = await getTaskById(taskId);
    if (!task) return null;
    
    // Etiketleri oluştur veya mevcut etiketleri kullan
    const tags = task.tags || [];
    
    // Etiket zaten varsa ekleme
    if (tags.includes(tag)) return task;
    
    // Etiketi ekle
    tags.push(tag);
    
    // Görevi güncelle
    return await updateTask(taskId, { tags });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Göreve (ID: ${taskId}) etiket eklenirken hata oluştu:`, error);
    return null;
  }
};

/**
 * Bir görevden etiket kaldırır
 * @param taskId Görev ID'si
 * @param tag Kaldırılacak etiket
 * @returns Güncellenen görev veya null Promise'i
 */
export const removeTagFromTask = async (taskId: number, tag: string): Promise<Task | null> => {
  try {
    const task = await getTaskById(taskId);
    if (!task || !task.tags) return null;
    
    // Etiketi kaldır
    const tags = task.tags.filter(t => t !== tag);
    
    // Görevi güncelle
    return await updateTask(taskId, { tags });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görevden (ID: ${taskId}) etiket kaldırılırken hata oluştu:`, error);
    return null;
  }
};

/**
 * Bir göreve bağımlılık ekler
 * @param taskId Görev ID'si
 * @param dependencyId Bağımlılık ID'si
 * @returns Güncellenen görev veya null Promise'i
 */
export const addTaskDependency = async (taskId: number, dependencyId: number): Promise<Task | null> => {
  try {
    const task = await getTaskById(taskId);
    if (!task) return null;
    
    // Bağımlılıkları oluştur veya mevcut bağımlılıkları kullan
    const dependencies = task.dependencies || [];
    
    // Bağımlılık zaten varsa ekleme
    if (dependencies.includes(dependencyId)) return task;
    
    // Kendisine bağımlılık eklemeyi önle
    if (taskId === dependencyId) {
      console.error(`Bir görev kendisine bağımlı olamaz: ${taskId}`);
      return null;
    }
    
    // Bağımlılığı ekle
    dependencies.push(dependencyId);
    
    // Görevi güncelle
    return await updateTask(taskId, { dependencies });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Göreve (ID: ${taskId}) bağımlılık eklenirken hata oluştu:`, error);
    return null;
  }
};

/**
 * Bir görevden bağımlılık kaldırır
 * @param taskId Görev ID'si
 * @param dependencyId Bağımlılık ID'si
 * @returns Güncellenen görev veya null Promise'i
 */
export const removeTaskDependency = async (taskId: number, dependencyId: number): Promise<Task | null> => {
  try {
    const task = await getTaskById(taskId);
    if (!task || !task.dependencies) return null;
    
    // Bağımlılığı kaldır
    const dependencies = task.dependencies.filter(d => d !== dependencyId);
    
    // Görevi güncelle
    return await updateTask(taskId, { dependencies });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görevden (ID: ${taskId}) bağımlılık kaldırılırken hata oluştu:`, error);
    return null;
  }
};

/**
 * Görev ilerleme durumunu günceller
 * @param taskId Görev ID'si
 * @param progress İlerleme yüzdesi (0-100)
 * @returns Güncellenen görev veya null Promise'i
 */
export const updateTaskProgress = async (taskId: number, progress: number): Promise<Task | null> => {
  try {
    // İlerleme yüzdesini 0-100 aralığında sınırla
    const validProgress = Math.min(Math.max(0, progress), 100);
    
    // Görevi güncelle
    return await updateTask(taskId, { progress: validProgress });
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
 * @returns Güncellenen görev veya null Promise'i
 */
export const addCommentToTask = async (taskId: number, userId: number, comment: string): Promise<Task | null> => {
  try {
    const task = await getTaskById(taskId);
    if (!task) return null;
    
    // Yorumları oluştur veya mevcut yorumları kullan
    const comments = task.comments || [];
    
    // Yeni yorum ID'si oluştur
    const commentId = comments.length > 0 ? Math.max(...comments.map((c: TaskComment) => c.id)) + 1 : 1;
    
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
    return await updateTask(taskId, { comments });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Göreve (ID: ${taskId}) yorum eklenirken hata oluştu:`, error);
    return null;
  }
};

/**
 * Görevden yorum kaldırır
 * @param taskId Görev ID'si
 * @param commentId Yorum ID'si
 * @returns Güncellenen görev veya null Promise'i
 */
export const removeCommentFromTask = async (taskId: number, commentId: number): Promise<Task | null> => {
  try {
    const task = await getTaskById(taskId);
    if (!task || !task.comments) return null;
    
    // Yorumu kaldır
    const comments = task.comments.filter((c: TaskComment) => c.id !== commentId);
    
    // Görevi güncelle
    return await updateTask(taskId, { comments });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görevden (ID: ${taskId}) yorum kaldırılırken hata oluştu:`, error);
    return null;
  }
};

/**
 * Göreve hatırlatıcı ekler
 * @param taskId Görev ID'si
 * @param reminderDate Hatırlatma tarihi
 * @returns Güncellenen görev veya null Promise'i
 */
export const setTaskReminder = async (taskId: number, reminderDate: string | undefined): Promise<Task | null> => {
  try {
    // Görevi güncelle
    return await updateTask(taskId, { reminder_date: reminderDate });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görev (ID: ${taskId}) hatırlatıcısı ayarlanırken hata oluştu:`, error);
    return null;
  }
};

/**
 * Görev başlangıç tarihini ayarlar
 * @param taskId Görev ID'si
 * @param startDate Başlangıç tarihi
 * @returns Güncellenen görev veya null Promise'i
 */
export const setTaskStartDate = async (taskId: number, startDate: string): Promise<Task | null> => {
  try {
    // Görevi güncelle
    return await updateTask(taskId, { start_date: startDate });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görev (ID: ${taskId}) başlangıç tarihi ayarlanırken hata oluştu:`, error);
    return null;
  }
};

/**
 * Görev tahmini süresini ayarlar
 * @param taskId Görev ID'si
 * @param hours Tahmini saat
 * @returns Güncellenen görev veya null Promise'i
 */
export const setTaskEstimatedHours = async (taskId: number, hours: number): Promise<Task | null> => {
  try {
    // Görevi güncelle
    return await updateTask(taskId, { estimated_hours: hours });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görev (ID: ${taskId}) tahmini süresi ayarlanırken hata oluştu:`, error);
    return null;
  }
};

/**
 * Görev gerçek süresini ayarlar
 * @param taskId Görev ID'si
 * @param hours Gerçek saat
 * @returns Güncellenen görev veya null Promise'i
 */
export const setTaskActualHours = async (taskId: number, hours: number): Promise<Task | null> => {
  try {
    // Görevi güncelle
    return await updateTask(taskId, { actual_hours: hours });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Görev (ID: ${taskId}) gerçek süresi ayarlanırken hata oluştu:`, error);
    return null;
  }
};
