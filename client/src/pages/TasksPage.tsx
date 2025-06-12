import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  TextField, 
  MenuItem, 
  IconButton, 
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Checkbox,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  Tabs,
  Tab,
  Badge,
  Fade,
  Collapse,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  ListItemAvatar,
  ListSubheader,
  CircularProgress,
  LinearProgress,
  Stack,
  Menu,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  FilterList as FilterListIcon, 
  Person as PersonIcon,
  AccountCircle as AccountCircleIcon,
  Assignment as AssignmentIcon,
  Restore as RestoreIcon,
  PriorityHigh as PriorityHighIcon,
  Business as BusinessIcon,
  AccessTime as AccessTimeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  WarningAmber as WarningAmberIcon,
  Done as DoneIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Category as CategoryIcon,
  Sort as SortIcon,
  Comment as CommentIcon,
  Link as LinkIcon,
  Notifications as NotificationsIcon,
  Label as LabelIcon,
  Flag as FlagIcon
} from '@mui/icons-material';

import { 
  Task, 
  addTask, 
  deleteTask, 
  updateTask, 
  getAllTasks, 
  restoreTask,
  getTaskById,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_PRIORITIES,
  TASKS_UPDATED_EVENT,
  updateTaskCompletionStats,
  TASK_COMPLETION_UPDATE_EVENT,
  UPCOMING_TASKS_UPDATE_EVENT
} from '../services/TaskService';
import { User, getActiveUsers, getUserById, getCurrentUser, USERS_UPDATED_EVENT, USER_SWITCHED_EVENT } from '../services/UserService';
import { Client, getAllClients, CLIENTS_UPDATED_EVENT } from '../services/ClientService';

/**
 * Görev Yönetimi Sayfası
 * 
 * Bu sayfa görev yönetim sisteminin giriş noktasıdır.
 */
// Yardımcı fonksiyonlar
// Görev durumuna göre renk döndür
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return '#FFA000'; // Amber
    case 'in_progress': return '#1976D2'; // Mavi
    case 'completed': return '#43A047'; // Yeşil
    case 'cancelled': return '#E53935'; // Kırmızı
    case 'on_hold': return '#757575'; // Gri
    default: return '#757575'; // Gri
  }
};

// Görev bitiş tarihine göre kalan gün sayısını döndür
const getRemainingDays = (dueDate: string): string => {
  const today = new Date();
  const due = new Date(dueDate);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `${Math.abs(diffDays)} gün gecikti`;
  } else if (diffDays === 0) {
    return 'Bugün';
  } else {
    return `${diffDays} gün kaldı`;
  }
};

const TasksPage: React.FC = () => {
  // State tanımlamaları
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersByDepartment, setUsersByDepartment] = useState<Record<string, User[]>>({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState(0);
  const [filterClient, setFilterClient] = useState('');
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeClients, setActiveClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  
  // Görev tamamlama istatistiklerini ve yakın görevleri güncelle ve dashboard'a ilet
  const updateTaskCompletionStats = (source: string, tasksData?: Task[]) => {
    console.log(`Görev istatistikleri güncelleniyor (${source})...`);
    const allTasks = tasksData || getAllTasks();
    
    if (allTasks.length > 0) {
      const completedTasksCount = allTasks.filter(task => task.status === 'completed').length;
      const completionRate = Math.round((completedTasksCount / allTasks.length) * 100);
      
      // Görev durumlarına göre sayıları hesapla
      const statusCounts: Record<string, number> = {};
      TASK_STATUSES.forEach(status => {
        statusCounts[status] = allTasks.filter(task => task.status === status).length;
      });
      
      // Görev tamamlama bildirimini gönder
      const completionEvent = new CustomEvent(TASK_COMPLETION_UPDATE_EVENT, {
        detail: {
          source: source,
          completionRate: completionRate,
          counts: statusCounts,
          totalTasks: allTasks.length,
          completedTasks: completedTasksCount,
          timestamp: new Date().toISOString()
        }
      });
      
      // Yakın zamanda bitiş tarihi olan görevleri hesapla
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const upcomingTasksList = allTasks
        .filter(task => {
          const dueDate = new Date(task.due_date);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate >= today && dueDate <= nextWeek && 
                task.status !== 'completed' && task.status !== 'cancelled';
        })
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      
      // Yakın görevler bildirimini gönder
      const upcomingEvent = new CustomEvent(UPCOMING_TASKS_UPDATE_EVENT, {
        detail: {
          source: source,
          upcomingTasks: upcomingTasksList,
          upcomingTasksCount: upcomingTasksList.length,
          timestamp: new Date().toISOString()
        }
      });
      
      // Event'leri tetikle
      window.dispatchEvent(completionEvent);
      window.dispatchEvent(upcomingEvent);
      
      console.log(`Görev istatistikleri dashboard'a iletildi: Tamamlanma: %${completionRate}, Yakın görevler: ${upcomingTasksList.length}`);
    }
  };
  const [taskCompletionRate, setTaskCompletionRate] = useState<number>(0);
  const [tasksByStatus, setTasksByStatus] = useState<Record<string, number>>({});
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'created_at'>>({ 
    title: '', 
    description: '', 
    assigned_to: 0, 
    status: 'pending', 
    due_date: new Date().toISOString().split('T')[0], 
    priority: 'medium',
    category: '',
    client_id: ''
  });
  
  // Görev düzenleme için state'ler
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Proje kategorileri
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error' | 'info'}>({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });
  const [deletedTaskId, setDeletedTaskId] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  
  // Görev listesi görünüm tipi için state
  const [viewType, setViewType] = useState<'cards' | 'list'>('cards');
  
  // Durum menüsü için state
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // Görevleri, kullanıcıları ve müşterileri yükle
  useEffect(() => {
    loadTasks();
    loadUsers();
    
    // loadClients asenkron olduğu için async IIFE kullanıyoruz
    (async () => {
      try {
        await loadClients();
      } catch (error) {
        console.error('Müşteriler yüklenirken hata:', error);
      }
    })();
    
    // Varsayılan olarak ilk kullanıcıyı mevcut kullanıcı olarak ayarla
    // Gerçek uygulamada bu, oturum açma sisteminden gelecektir
    
    // Görev güncellemelerini dinle
    const handleTasksUpdated = () => {
      console.log('Görevler güncellendi, yeniden yükleniyor...');
      loadTasks();
    };
    
    // Müşteri güncellemelerini dinle
    const handleClientsUpdated = () => {
      console.log('Müşteriler güncellendi, yeniden yükleniyor...');
      loadClients();
    };
    
    // Kullanıcı güncellemelerini dinle
    const handleUsersUpdated = () => {
      console.log('Kullanıcılar güncellendi, aktif kullanıcılar yeniden yükleniyor...');
      loadUsers();
    };

    // Kullanıcı değişikliklerini dinle
    const handleUserSwitched = (event: Event) => {
      const customEvent = event as CustomEvent;
      const user = customEvent.detail?.user;
      if (user) {
        setCurrentUser(user);
        console.log('Kullanıcı değişti:', user);
      }
    };
    
    window.addEventListener(TASKS_UPDATED_EVENT, handleTasksUpdated);
    window.addEventListener(CLIENTS_UPDATED_EVENT, handleClientsUpdated);
    window.addEventListener(USERS_UPDATED_EVENT, handleUsersUpdated);
    window.addEventListener(USER_SWITCHED_EVENT, handleUserSwitched);
    
    return () => {
      window.removeEventListener(TASKS_UPDATED_EVENT, handleTasksUpdated);
      window.removeEventListener(CLIENTS_UPDATED_EVENT, handleClientsUpdated);
      window.removeEventListener(USERS_UPDATED_EVENT, handleUsersUpdated);
      window.removeEventListener(USER_SWITCHED_EVENT, handleUserSwitched);
    };
  }, []);

  // Görevleri yükle
  const loadTasks = () => {
    try {
      console.log('Görevler yükleniyor...');
      
      // Doğrudan localStorage'dan en güncel görevleri al
      const allTasks = getAllTasks();
      console.log(`Yüklenen görev sayısı: ${allTasks.length}`);
      setTasks(allTasks);
      
      // Görev durumlarına göre sayıları hesapla
      const statusCounts: Record<string, number> = {};
      TASK_STATUSES.forEach(status => {
        statusCounts[status] = allTasks.filter(task => task.status === status).length;
      });
      setTasksByStatus(statusCounts);
      console.log('Görev durumları sayıldı:', statusCounts);
      
      // Yakın zamanda bitiş tarihi olan görevleri filtrele
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const upcomingTasksList = allTasks
        .filter(task => {
          const dueDate = new Date(task.due_date);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate >= today && dueDate <= nextWeek && task.status !== 'completed' && task.status !== 'cancelled';
        })
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      
      setUpcomingTasks(upcomingTasksList);
      console.log(`Yaklaşan görev sayısı: ${upcomingTasksList.length}`);
      
      // Tamamlanan görevleri filtrele
      const completedTasksList = allTasks
        .filter(task => task.status === 'completed')
        .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());
      
      setCompletedTasks(completedTasksList);
      console.log(`Tamamlanan görev sayısı: ${completedTasksList.length}`);
      
      // Görev tamamlanma oranını hesapla
      if (allTasks.length > 0) {
        const completionRate = Math.round((completedTasksList.length / allTasks.length) * 100);
        setTaskCompletionRate(completionRate);
        console.log(`Görev tamamlanma oranı: %${completionRate}`);
        
        // Görev tamamlama verilerini dashboard'a ilet
        updateTaskCompletionStats('tasks-page-load', allTasks);
        console.log(`Görev tamamlama verileri dashboard'a iletildi.`);
      } else {
        setTaskCompletionRate(0);
      }
      
      // Kategorileri topla
      const uniqueCategories2 = Array.from(new Set(allTasks.filter(task => task.category).map(task => task.category as string)));
      setCategories(uniqueCategories2);
      console.log(`Kategori sayısı: ${uniqueCategories2.length}`);
      
      // Yeni görev için varsayılan değerleri ayarla
      if (currentUser) {
        setNewTask({
          ...newTask,
          assigned_to: currentUser.id,
          status: 'pending',
          priority: 'medium',
          due_date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }
      
      console.log('Görevler başarıyla yüklendi');
    } catch (error) {
      console.error('Görevler yüklenirken hata oluştu:', error);
    }
  };

  // Kullanıcıları yükle
  const loadUsers = () => {
    try {
      // Tüm kullanıcıları getir (ekip sayfasından senkronize edilmiş veriler)
      const allUsers = getActiveUsers();
      
      // Departmanlara göre kullanıcıları grupla
      const departmentUsers: Record<string, User[]> = {};
      
      // Aktif kullanıcıları filtrele
      const users = allUsers.filter(user => {
        // Sadece aktif kullanıcıları al
        const isActive = user.status === 'active' || (user.status === undefined && user.isActive !== false);
        
        // Departman bilgisine göre grupla
        if (user.department && isActive) {
          if (!departmentUsers[user.department]) {
            departmentUsers[user.department] = [];
          }
          departmentUsers[user.department].push(user);
        }
        
        return isActive;
      });
      
      // Aktif kullanıcıları ve departman gruplarını ayarla
      setUsers(users);
      setUsersByDepartment(departmentUsers);
      console.log(`${users.length} aktif kullanıcı yüklendi`);
      console.log('Departmanlara göre kullanıcılar:', departmentUsers);
      
      // Eğer mevcut kullanıcı henüz ayarlanmamışsa ve kullanıcı listesi doluysa
      // ilk kullanıcıyı mevcut kullanıcı olarak ayarla
      if (!currentUser && users.length > 0) {
        setCurrentUser(users[0]);
      }
      
      // Yeni kullanıcı yoksa ve görev atanacak kişi seçilmişse, seçimi sıfırla
      if (users.length === 0 && newTask.assigned_to !== 0) {
        setNewTask({...newTask, assigned_to: 0});
      } else if (newTask.assigned_to !== 0) {
        // Seçili kullanıcı hala aktif mi kontrol et
        const isAssignedUserStillActive = users.some(user => user.id === newTask.assigned_to);
        if (!isAssignedUserStillActive) {
          setNewTask({...newTask, assigned_to: 0});
          setSnackbar({
            open: true,
            message: 'Seçili kullanıcı artık aktif değil, lütfen başka bir kullanıcı seçin',
            severity: 'info'
          });
        }
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata oluştu:', error);
    }
  };

  // Müşterileri yükle
  const loadClients = async () => {
    try {
      const clients = await getAllClients(true); // Sadece aktif müşterileri getir
      setActiveClients(clients);
      console.log(`Görev sayfası için ${clients.length} aktif müşteri yüklendi`);
    } catch (error) {
      console.error('Müşteriler yüklenirken hata oluştu:', error);
      // Hata durumunda boş dizi atayalım ki map hatası oluşmasın
      setActiveClients([]);
    }
  };
  
  // Kategori değiştiğinde
  const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    
    if (value === 'new') {
      // Yeni kategori ekleme diyaloğunu aç
      setOpenCategoryDialog(true);
    } else {
      // Seçilen kategoriyi ayarla
      setNewTask({...newTask, category: value});
    }
  };
  
  // Yeni kategori ekle
  const handleAddCategory = () => {
    if (newCategory.trim() === '') {
      setSnackbar({
        open: true,
        message: 'Kategori adı boş olamaz',
        severity: 'error'
      });
      return;
    }
    
    // Kategori zaten var mı kontrol et
    if (categories.includes(newCategory)) {
      setSnackbar({
        open: true,
        message: 'Bu kategori zaten mevcut',
        severity: 'error'
      });
      return;
    }
    
    // Yeni kategoriyi ekle
    const updatedCategories = [...categories, newCategory].sort();
    setCategories(updatedCategories);
    
    // Görev formunda yeni kategoriyi seç
    setNewTask({...newTask, category: newCategory});
    
    // Diyaloğu kapat ve formu temizle
    setOpenCategoryDialog(false);
    setNewCategory('');
    
    setSnackbar({
      open: true,
      message: `"${newCategory}" kategorisi eklendi`,
      severity: 'success'
    });
  };

  // Yeni görev ekle
  const handleAddTask = () => {
    if (!newTask.title || !newTask.assigned_to || !newTask.due_date) {
      setSnackbar({
        open: true,
        message: 'Lütfen zorunlu alanları doldurun',
        severity: 'error'
      });
      return;
    }
    
    try {
      // Eğer bir müşteri seçilmişse ve kategori boşsa, müşteri adını kategori olarak kullan
      let taskToAdd = { ...newTask };
      
      if (newTask.client_id && !newTask.category) {
        const selectedClient = activeClients.find(client => client.id === newTask.client_id);
        if (selectedClient) {
          taskToAdd.category = selectedClient.name;
        }
      }
      
      const result = addTask(taskToAdd);
      
      if (result) {
        setSnackbar({
          open: true,
          message: 'Görev başarıyla eklendi',
          severity: 'success'
        });
        
        // Formu sıfırla
        setNewTask({
          title: '',
          description: '',
          status: 'pending', // Önemli: 'Bekliyor' yerine 'pending' kullanılıyor
          priority: 'medium',
          assigned_to: 0,
          due_date: new Date().toISOString().split('T')[0],
          category: '',
          client_id: ''
        });
        
        loadTasks();
        
        // Görev tamamlama verilerini dashboard'a ilet
        updateTaskCompletionStats('task-added');
      } else {
        setSnackbar({
          open: true,
          message: 'Görev eklenirken bir hata oluştu',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Görev eklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Görev eklenirken bir hata oluştu',
        severity: 'error'
      });
    }
  };

  // Görev sil
  const handleDeleteTask = (taskId: number) => {
    try {
      console.log(`Görev siliniyor: ID=${taskId}`);
      
      // Önce görevi kontrol et
      const task = getTaskById(taskId);
      if (!task) {
        console.error(`Silinecek görev bulunamadı: ID=${taskId}`);
        setSnackbar({
          open: true,
          message: 'Silinecek görev bulunamadı',
          severity: 'error'
        });
        return;
      }
      
      // Görevi sil
      const result = deleteTask(taskId);
      
      if (result) {
        console.log(`Görev başarıyla silindi: ID=${taskId}`);
        setDeletedTaskId(taskId);
        
        setSnackbar({
          open: true,
          message: 'Görev başarıyla silindi',
          severity: 'success'
        });
        
        // Görevleri yeniden yükle
        loadTasks();
        
        // Görev güncellendi olayını manuel olarak tetikle
        window.dispatchEvent(new CustomEvent(TASKS_UPDATED_EVENT));
      } else {
        console.error(`Görev silinemedi: ID=${taskId}`);
        setSnackbar({
          open: true,
          message: 'Görev silinirken bir hata oluştu',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Görev silinirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Görev silinirken bir hata oluştu',
        severity: 'error'
      });
    }
  };

  // Görevi geri al
  const handleRestoreTask = () => {
    if (!deletedTaskId) return;
    
    try {
      const result = restoreTask(deletedTaskId);
      if (result) {
        setSnackbar({
          open: true,
          message: 'Görev başarıyla geri alındı',
          severity: 'success'
        });
        setDeletedTaskId(null);
        
        // Görevleri yeniden yükle
        loadTasks();
      } else {
        setSnackbar({
          open: true,
          message: 'Görev geri alınırken bir hata oluştu',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Görev geri alınırken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Görev geri alınırken bir hata oluştu',
        severity: 'error'
      });
    }
  };
  
  // Görev düzenleme işlemini başlat
  const handleEditTask = (taskId: number) => {
    try {
      console.log(`Görev düzenleniyor: ID=${taskId}`);
      
      // Görevi al
      const task = getTaskById(taskId);
      if (!task) {
        console.error(`Düzenlenecek görev bulunamadı: ID=${taskId}`);
        setSnackbar({
          open: true,
          message: 'Düzenlenecek görev bulunamadı',
          severity: 'error'
        });
        return;
      }
      
      // Düzenleme state'ini ayarla
      setEditTask(task);
      setEditDialogOpen(true);
    } catch (error) {
      console.error('Görev düzenleme başlatılırken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Görev düzenleme başlatılırken bir hata oluştu',
        severity: 'error'
      });
    }
  };
  
  // Düzenlenen görevi kaydet
  const handleSaveEditedTask = () => {
    try {
      if (!editTask) {
        console.error('Düzenlenecek görev bulunamadı');
        return;
      }
      
      console.log(`Düzenlenen görev kaydediliyor: ID=${editTask.id}`);
      
      // Görevi güncelle
      const result = updateTask(editTask.id, {
        title: editTask.title,
        description: editTask.description,
        status: editTask.status,
        priority: editTask.priority,
        assigned_to: editTask.assigned_to,
        due_date: editTask.due_date,
        category: editTask.category,
        client_id: editTask.client_id
      });
      
      if (result) {
        console.log(`Görev başarıyla güncellendi: ID=${editTask.id}`);
        
        setSnackbar({
          open: true,
          message: 'Görev başarıyla güncellendi',
          severity: 'success'
        });
        
        // Dialog'u kapat
        setEditDialogOpen(false);
        setEditTask(null);
        
        // Görevleri yeniden yükle
        loadTasks();
        
        // Görev tamamlama verilerini ve yaklaşan görevleri dashboard'a ilet
        updateTaskCompletionStats('task-edited');
        
        // Görev güncellendi olayını manuel olarak tetikle
        window.dispatchEvent(new CustomEvent(TASKS_UPDATED_EVENT));
      } else {
        console.error(`Görev güncellenemedi: ID=${editTask.id}`);
        setSnackbar({
          open: true,
          message: 'Görev güncellenirken bir hata oluştu',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Görev güncellenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Görev güncellenirken bir hata oluştu',
        severity: 'error'
      });
    }
  };
  
  // Görev durumunu değiştirme işlemi
  const handleStatusChange = (taskId: number, newStatus: string) => {
    try {
      console.log(`Görev durumu değiştiriliyor: ID=${taskId}, yeni durum=${newStatus}`);
      
      // Önce görevi al
      const task = getTaskById(taskId);
      if (!task) {
        console.error(`Görev bulunamadı: ID=${taskId}`);
        setSnackbar({
          open: true,
          message: 'Görev bulunamadı',
          severity: 'error'
        });
        setStatusMenuAnchor(null);
        return;
      }
      
      // Görev durumunu güncelle
      const result = updateTask(taskId, { status: newStatus });
      
      if (result) {
        // Türkçe durum etiketini kullan
        const statusLabel = TASK_STATUS_LABELS[newStatus] || newStatus;
        console.log(`Görev durumu başarıyla güncellendi: ID=${taskId}, yeni durum=${newStatus}`);
        
        setSnackbar({
          open: true,
          message: `Görev durumu "${statusLabel}" olarak güncellendi`,
          severity: 'success'
        });
        
        // Görevleri yeniden yükle
        loadTasks();
        
        // Görev güncellendi olayını manuel olarak tetikle
        window.dispatchEvent(new CustomEvent(TASKS_UPDATED_EVENT));
      } else {
        console.error(`Görev durumu güncellenemedi: ID=${taskId}`);
        setSnackbar({
          open: true,
          message: 'Görev durumu güncellenirken bir hata oluştu',
          severity: 'error'
        });
      }
      
      setStatusMenuAnchor(null);
    } catch (error) {
      console.error('Görev durumu güncellenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Görev durumu güncellenirken bir hata oluştu',
        severity: 'error'
      });
      setStatusMenuAnchor(null);
    }
  };

  // Durum menüsünü açma işlemi
  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: number) => {
    setStatusMenuAnchor(event.currentTarget);
    setSelectedTaskId(taskId);
  };

  // Durum menüsünü kapatma işlemi
  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
    setSelectedTaskId(null);
  };

  // Filtrelenmiş görevleri getir
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // Durum filtreleme
      if (filterStatus !== 'all' && task.status !== filterStatus) {
        return false;
      }
      
      // Atanan kişi filtreleme
      if (filterAssignee !== 0 && task.assigned_to !== filterAssignee) {
        return false;
      }
      
      // Müşteri filtreleme
      if (filterClient && task.client_id !== filterClient) {
        return false;
      }
      
      // Departman görevleri filtreleme ("Departman Görevleri" butonu için)
      if (showMyTasks && currentUser && currentUser.department) {
        // Kullanıcının departmanındaki tüm kullanıcıların ID'lerini al
        const departmentUserIds = usersByDepartment[currentUser.department]?.map(u => u.id) || [];
        
        // Görev, kullanıcının departmanındaki herhangi bir kişiye atanmış mı kontrol et
        if (!departmentUserIds.includes(task.assigned_to)) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  // Departman görevlerini göster/gizle
  const toggleMyTasks = () => {
    setShowMyTasks(!showMyTasks);
    // Eğer "Departman Görevleri" aktifleştirilirse, diğer filtreleri sıfırla
    if (!showMyTasks) {
      setFilterStatus('all');
      setFilterAssignee(0);
    }
  };

  // Kullanıcı adını getir
  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Bilinmeyen Kullanıcı';
  };

  // Öncelik rengini belirle
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Öncelik metnini belirle
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return 'Belirsiz';
    }
  };

  // Filtreleme dialogunu aç
  const handleOpenFilterDialog = () => {
    setOpenDialog(true);
  };

  // Filtreleme dialogunu kapat
  const handleCloseFilterDialog = () => {
    setOpenDialog(false);
  };

  // Filtreleri sıfırla
  const handleResetFilters = () => {
    setFilterStatus('all');
    setFilterAssignee(0);
    setOpenDialog(false);
  };

  // Filtreleri uygula
  const handleApplyFilters = () => {
    // ...
  };

  const filteredTasks = getFilteredTasks();

  return (
    <Box sx={{ width: '100%', maxWidth: 'lg', mx: 'auto' }}>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Görevler
              </Typography>
              {currentUser && (
                <Chip
                  icon={<AccountCircleIcon />}
                  label={`Aktif Kullanıcı: ${currentUser.name}`}
                  color="primary"
                  variant="outlined"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
            <Button 
              variant={showMyTasks ? "contained" : "outlined"}
              color={showMyTasks ? "primary" : "inherit"}
              startIcon={<AssignmentIcon />} 
              onClick={toggleMyTasks}
              sx={{ mr: 1 }}
              disabled={!currentUser?.department}
              title={!currentUser?.department ? "Departman bilgisi olmayan kullanıcılar bu özelliği kullanamaz" : ""}
            >
              {currentUser?.department ? `${currentUser.department} Görevleri` : "Departman Görevleri"}
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<FilterListIcon />} 
              onClick={handleOpenFilterDialog}
              sx={{ mr: 1 }}
            >
              Filtrele
            </Button>
            {deletedTaskId && (
              <Button 
                variant="contained" 
                color="warning" 
                startIcon={<RestoreIcon />} 
                onClick={handleRestoreTask}
              >
                Geri Al
              </Button>
            )}
          </Grid>
        </Grid>
        
        {/* Görev Özet Kartları */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
                  Tamamlanan Görevler
                </Typography>
                <Typography variant="h4" sx={{ mt: 1.5, mb: 0.5 }}>
                  {completedTasks.length}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    size="small" 
                    icon={<DoneIcon />}
                    label={`${Math.round((completedTasks.length / (tasks.length || 1)) * 100)}%`} 
                    color="success"
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    toplam görevlerin
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
                  Görev Tamamlama Oranı
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex', mt: 1.5, mb: 0.5 }}>
                  <CircularProgress 
                    variant="determinate" 
                    value={taskCompletionRate} 
                    size={56} 
                    thickness={4} 
                    color={taskCompletionRate > 75 ? 'success' : taskCompletionRate > 50 ? 'primary' : taskCompletionRate > 25 ? 'warning' : 'error'}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" fontWeight="bold">
                      {`${taskCompletionRate}%`}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Toplam {tasks.length} görev
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
                  Yaklaşan Görevler
                </Typography>
                <Typography variant="h4" sx={{ mt: 1.5, mb: 0.5 }}>
                  {upcomingTasks.length}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    size="small" 
                    icon={<AccessTimeIcon />}
                    label="7 gün içinde" 
                    color="warning"
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {upcomingTasks.filter(t => {
                      const dueDate = new Date(t.due_date);
                      const today = new Date();
                      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return diffDays <= 2;
                    }).length} acil görev
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
                  Yüksek Öncelikli Görevler
                </Typography>
                <Typography variant="h4" sx={{ mt: 1.5, mb: 0.5 }}>
                  {tasks.filter(t => t.priority === 'high' && t.status !== 'Tamamlandı' && t.status !== 'İptal Edildi').length}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    size="small" 
                    icon={<PriorityHighIcon />}
                    label="Yüksek Öncelik" 
                    color="error"
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    tamamlanmamış
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Yeni Görev Ekle
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Görev Başlığı"
                fullWidth
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                margin="normal"
                required
                variant="outlined"
                placeholder="Görev başlığını girin"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LabelIcon color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {newTask.priority === 'high' ? (
                        <Tooltip title="Yüksek Öncelik">
                          <PriorityHighIcon color="error" fontSize="small" />
                        </Tooltip>
                      ) : newTask.priority === 'medium' ? (
                        <Tooltip title="Orta Öncelik">
                          <WarningAmberIcon color="warning" fontSize="small" />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Düşük Öncelik">
                          <ScheduleIcon color="info" fontSize="small" />
                        </Tooltip>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="normal" required variant="outlined">
                <InputLabel>Atanan Kişi</InputLabel>
                <Select
                  value={newTask.assigned_to}
                  onChange={(e) => setNewTask({...newTask, assigned_to: Number(e.target.value)})}
                  label="Atanan Kişi"
                  startAdornment={
                    <InputAdornment position="start">
                      <PersonIcon color="primary" fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value={0} disabled>Kişi seçin</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.8rem' }}>{user.name.charAt(0)}</Avatar>
                        {user.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth margin="normal" required variant="outlined">
                <InputLabel>Öncelik</InputLabel>
                <Select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value as 'low' | 'medium' | 'high'})}
                  label="Öncelik"
                  startAdornment={
                    <InputAdornment position="start">
                      <FlagIcon color="primary" fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="low">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ScheduleIcon fontSize="small" sx={{ color: 'info.main', mr: 1 }} />
                      Düşük
                    </Box>
                  </MenuItem>
                  <MenuItem value="medium">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WarningAmberIcon fontSize="small" sx={{ color: 'warning.main', mr: 1 }} />
                      Orta
                    </Box>
                  </MenuItem>
                  <MenuItem value="high">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PriorityHighIcon fontSize="small" sx={{ color: 'error.main', mr: 1 }} />
                      Yüksek
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Açıklama"
                fullWidth
                multiline
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                margin="normal"
                variant="outlined"
                placeholder="Görev açıklamasını girin"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CommentIcon color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Müşteri"
                fullWidth
                value={newTask.client_id || ''}
                onChange={(e) => setNewTask({...newTask, client_id: e.target.value})}
                margin="normal"
                helperText="Görevle ilişkili müşteriyi seçin"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {activeClients.map(client => (
                  <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Durum"
                fullWidth
                value={newTask.status}
                onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                margin="normal"
              >
                {TASK_STATUSES.map(status => (
                  <MenuItem key={status} value={status}>{TASK_STATUS_LABELS[status]}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Öncelik"
                fullWidth
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value as 'low' | 'medium' | 'high'})}
                margin="normal"
              >
                <MenuItem value="low">Düşük</MenuItem>
                <MenuItem value="medium">Orta</MenuItem>
                <MenuItem value="high">Yüksek</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                label="Bitiş Tarihi"
                fullWidth
                value={newTask.due_date}
                onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Proje Kategorisi"
                value={newTask.category || ''}
                onChange={handleCategoryChange as any}
                variant="outlined"
                margin="normal"
                helperText="Görev hangi projeye ait?"
              >
                <MenuItem value="">Seçiniz...</MenuItem>
                {categories.map((category: string) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
                <MenuItem value="new" sx={{ fontStyle: 'italic', color: 'primary.main' }}>
                  + Yeni Kategori Ekle
                </MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'right', mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleAddTask}
                  startIcon={<AddIcon />}
                  disabled={!newTask.title || !newTask.assigned_to}
                  size="large"
                  sx={{ 
                    borderRadius: 2, 
                    px: 4,
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s'
                    }
                  }}
                >
                  Görev Ekle
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 4 }}>
          <AssignmentIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            Görevler
          </Typography>
          <Chip 
            label={filteredTasks.length} 
            color="primary" 
            size="small"
            sx={{ ml: 2, height: 24, minWidth: 30, fontWeight: 'bold' }}
          />
        </Box>
        
        {filteredTasks.length === 0 ? (
          <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 2, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
              <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {tasks.length === 0 ? 'Hiç görev bulunmuyor' : 'Filtrelere uygun görev bulunamadı'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mb: 3 }}>
                {tasks.length === 0 
                  ? 'Yeni bir görev eklemek için yukarıdaki formu kullanabilirsiniz.'
                  : 'Farklı filtre seçeneklerini deneyerek görevlerinizi görüntüleyebilirsiniz.'}
              </Typography>
              {tasks.length === 0 ? (
                <Button 
                  variant="outlined" 
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  sx={{ borderRadius: 2 }}
                >
                  Yeni Görev Ekle
                </Button>
              ) : (
                <Button 
                  variant="outlined" 
                  color="primary"
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilters(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Filtreleri Düzenle
                </Button>
              )}
            </Box>
          </Paper>
        ) : (
          <Box>
            {/* Yaklaşan Görevler */}
            {upcomingTasks.length > 0 && (
              <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="h6" fontWeight="bold" color="warning.main">
                      Yaklaşan Görevler
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${upcomingTasks.length} görev`} 
                    color="warning" 
                    size="small"
                    sx={{ height: 24, fontSize: '0.7rem', fontWeight: 'bold' }}
                  />
                </Box>
                
                <List>
                  {upcomingTasks.slice(0, 5).map((task) => {
                    const dueDate = new Date(task.due_date);
                    const today = new Date();
                    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    // Görev süresine göre renk belirleme
                    let urgencyColor = 'success';
                    if (diffDays <= 1) {
                      urgencyColor = 'error';
                    } else if (diffDays <= 3) {
                      urgencyColor = 'warning';
                    }
                    
                    return (
                      <ListItem key={task.id} divider>
                        <ListItemAvatar>
                          <Avatar src={users.find(u => u.id === task.assigned_to)?.avatar}>
                            {getUserName(task.assigned_to).charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={task.title}
                          secondary={
                            <>
                              <Typography variant="caption" component="span" color="text.secondary">
                                {getUserName(task.assigned_to)} • {task.priority === 'high' ? (
                                  <Typography component="span" color="error.main" variant="caption" fontWeight="bold">
                                    Yüksek Öncelik
                                  </Typography>
                                ) : task.priority === 'medium' ? (
                                  <Typography component="span" color="warning.main" variant="caption">
                                    Orta Öncelik
                                  </Typography>
                                ) : (
                                  <Typography component="span" color="text.secondary" variant="caption">
                                    Düşük Öncelik
                                  </Typography>
                                )}
                                {task.client_id && (
                                  <>
                                    {' • '}
                                    <Chip
                                      size="small"
                                      icon={<BusinessIcon style={{ fontSize: 10 }} />}
                                      label={activeClients.find(c => c.id === task.client_id)?.name || 'Müşteri'}
                                      variant="outlined"
                                      color="primary"
                                      sx={{ height: 16, fontSize: '0.6rem', ml: 0.5 }}
                                    />
                                  </>
                                )}
                              </Typography>
                            </>
                          }
                          primaryTypographyProps={{ 
                            variant: 'subtitle2', 
                            sx: { fontWeight: 500, mb: 0.5 } 
                          }}
                        />
                        <Chip 
                          label={diffDays <= 0 ? 'Bugün' : `${diffDays} gün`} 
                          color={urgencyColor as any} 
                          size="small"
                          sx={{ height: 24, fontSize: '0.7rem', mr: 1 }}
                        />
                        <Box sx={{ display: 'flex' }}>
                          <IconButton size="small" onClick={() => handleEditTask(task.id)} sx={{ mr: 0.5 }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteTask(task.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
                
                {upcomingTasks.length > 5 && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button 
                      variant="text" 
                      size="small"
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterAssignee(0);
                        setShowMyTasks(false);
                      }}
                    >
                      Tüm Yaklaşan Görevleri Görüntüle ({upcomingTasks.length})
                    </Button>
                  </Box>
                )}
              </Paper>
            )}
            
            {/* Görev Listesi */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {showMyTasks ? 
                    `${currentUser?.department || 'Departman'} Görevleri` : 
                    filterStatus === 'all' ? 
                      filterAssignee === 0 ? 'Tüm Görevler' : `${getUserName(filterAssignee)}'in Görevleri` : 
                      filterAssignee === 0 ? `${filterStatus} Durumundaki Görevler` : 
                        `${getUserName(filterAssignee)}'in ${filterStatus} Durumundaki Görevleri`
                  }
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Tabs 
                    value={viewType} 
                    onChange={(e, newValue) => setViewType(newValue)}
                    sx={{ mr: 2 }}
                  >
                    <Tab value="cards" label="Kartlar" />
                    <Tab value="list" label="Liste" />
                  </Tabs>
                  <Chip 
                    label={`${filteredTasks.length} görev`} 
                    color="primary" 
                    size="small"
                    sx={{ height: 24, fontSize: '0.7rem' }}
                  />
                </Box>
              </Box>
              
              {filteredTasks.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="text.secondary">
                    Görev bulunamadı
                  </Typography>
                </Box>
              ) : viewType === 'cards' ? (
                <Grid container spacing={2}>
                  {filteredTasks.map(task => (
                    <Grid item xs={12} sm={6} md={4} key={task.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" component="h2" noWrap sx={{ maxWidth: '70%' }}>
                              {task.title}
                            </Typography>
                            <Chip 
                              label={getPriorityText(task.priority)} 
                              color={getPriorityColor(task.priority) as any} 
                              size="small" 
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
                            {task.description || 'Açıklama yok'}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">
                              <strong>Durum:</strong> {TASK_STATUS_LABELS[task.status] || task.status}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Bitiş:</strong> {new Date(task.due_date).toLocaleDateString('tr-TR')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">
                              <strong>Atanan:</strong> {getUserName(task.assigned_to)}
                            </Typography>
                            {task.client_id && (
                              <Typography variant="body2">
                                <strong>Müşteri:</strong> {activeClients.find(c => c.id === task.client_id)?.name || 'Belirtilmemiş'}
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            color="primary" 
                            startIcon={<EditIcon />}
                            onClick={() => handleEditTask(task.id)}
                          >
                            Düzenle
                          </Button>
                          <Button 
                            size="small" 
                            color="error" 
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Sil
                          </Button>
                          <Box sx={{ flexGrow: 1 }} />
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleStatusMenuOpen(e, task.id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Başlık</TableCell>
                        <TableCell>Durum</TableCell>
                        <TableCell>Öncelik</TableCell>
                        <TableCell>Kalan Süre</TableCell>
                        <TableCell>Atanan Kişi</TableCell>
                        <TableCell>İlerleme</TableCell>
                        <TableCell>Detaylar</TableCell>
                        <TableCell>İşlemler</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTasks.map((task) => (
                        <TableRow
                          key={task.id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {task.title}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={TASK_STATUS_LABELS[task.status] || task.status} 
                              size="small" 
                              sx={{ 
                                backgroundColor: getStatusColor(task.status),
                                color: 'white',
                                mr: 1,
                              }} 
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={getPriorityText(task.priority)} 
                              color={getPriorityColor(task.priority) as any} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            {getRemainingDays(task.due_date)}
                          </TableCell>
                          <TableCell>
                            {getUserName(task.assigned_to)}
                          </TableCell>
                          <TableCell>
                            {task.progress !== undefined && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CircularProgress 
                                  variant="determinate" 
                                  value={task.progress} 
                                  size={24} 
                                  thickness={4} 
                                  sx={{ mr: 1 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                  {task.progress}%
                                </Typography>
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>
                            {task.tags && task.tags.length > 0 && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {task.tags.slice(0, 3).map((tag) => (
                                  <Chip 
                                    key={tag} 
                                    label={tag} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                ))}
                                {task.tags.length > 3 && (
                                  <Chip 
                                    label={`+${task.tags.length - 3}`} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => handleDeleteTask(task.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleStatusMenuOpen(e, task.id)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Box>
        )}
      </Box>
      
      {/* Bildirim */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Durum Değiştirme Menüsü */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
      >
        <MenuItem onClick={() => selectedTaskId && handleStatusChange(selectedTaskId, 'Beklemede')}>
          <PauseIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
          Beklemede
        </MenuItem>
        <MenuItem onClick={() => selectedTaskId && handleStatusChange(selectedTaskId, 'Devam Ediyor')}>
          <PlayArrowIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
          Devam Ediyor
        </MenuItem>
        <MenuItem onClick={() => selectedTaskId && handleStatusChange(selectedTaskId, 'Tamamlandı')}>
          <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
          Tamamlandı
        </MenuItem>
        <MenuItem onClick={() => selectedTaskId && handleStatusChange(selectedTaskId, 'İptal Edildi')}>
          <CancelIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
          İptal Edildi
        </MenuItem>
      </Menu>
      
      {/* Durum Değiştirme Menüsü */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
      >
        <MenuItem onClick={() => selectedTaskId && handleStatusChange(selectedTaskId, 'Beklemede')}>
          <PauseIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
          Beklemede
        </MenuItem>
        <MenuItem onClick={() => selectedTaskId && handleStatusChange(selectedTaskId, 'Devam Ediyor')}>
          <PlayArrowIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
          Devam Ediyor
        </MenuItem>
        <MenuItem onClick={() => selectedTaskId && handleStatusChange(selectedTaskId, 'Tamamlandı')}>
          <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
          Tamamlandı
        </MenuItem>
        <MenuItem onClick={() => selectedTaskId && handleStatusChange(selectedTaskId, 'İptal Edildi')}>
          <CancelIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
          İptal Edildi
        </MenuItem>
      </Menu>
      
      {/* Yeni Kategori Ekleme Diyaloğu */}
      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)}>
        <DialogTitle>Yeni Proje Kategorisi Ekle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Lütfen eklemek istediğiniz yeni proje kategorisinin adını girin.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Kategori Adı"
            type="text"
            fullWidth
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)} color="inherit">
            İptal
          </Button>
          <Button onClick={handleAddCategory} color="primary" variant="contained">
            Ekle
          </Button>
        </DialogActions>
      </Dialog>
      {/* Görev Düzenleme Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Görev Düzenle</DialogTitle>
        <DialogContent>
          {editTask && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Görev Başlığı"
                  fullWidth
                  required
                  value={editTask.title}
                  onChange={(e) => setEditTask({...editTask, title: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Atanan Kişi</InputLabel>
                  <Select
                    value={editTask.assigned_to}
                    onChange={(e) => setEditTask({...editTask, assigned_to: e.target.value as number})}
                    label="Atanan Kişi"
                  >
                    {/* Departmanlara göre gruplandırılmış kullanıcılar */}
                    {Array.from(new Set(users.filter((u: User) => u.department).map((u: User) => u.department))).filter((dept): dept is string => !!dept).sort().map((department: string) => [
                      <ListSubheader key={`dept-${department}`}>
                        {department}
                      </ListSubheader>,
                      ...users
                         .filter((user: User) => user.department === department)
                         .map((user: User) => (
                          <MenuItem key={user.id} value={user.id} sx={{ pl: 4 }}>
                            <ListItemAvatar sx={{ minWidth: 36 }}>
                              <Avatar src={user.avatar} sx={{ width: 24, height: 24 }}>
                                {user.name.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={`${user.name} ${currentUser && user.id === currentUser.id ? '(Ben)' : ''}`}
                              secondary={user.role}
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </MenuItem>
                        ))
                    ])}
                    {/* Departmanı olmayan kullanıcılar */}
                    {users.filter((user: User) => !user.department).length > 0 && [
                      <ListSubheader key="dept-other">Diğer</ListSubheader>,
                      ...users
                         .filter((user: User) => !user.department)
                         .map((user: User) => (
                          <MenuItem key={user.id} value={user.id} sx={{ pl: 4 }}>
                            {user.name} {currentUser && user.id === currentUser.id ? '(Ben)' : ''}
                          </MenuItem>
                        ))
                    ]}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={editTask.status}
                    onChange={(e) => setEditTask({...editTask, status: e.target.value as string})}
                    label="Durum"
                  >
                    {TASK_STATUSES.map(status => (
                      <MenuItem key={status} value={status}>
                        {TASK_STATUS_LABELS[status] || status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Müşteri</InputLabel>
                  <Select
                    value={editTask.client_id || ''}
                    onChange={(e) => setEditTask({...editTask, client_id: e.target.value as string})}
                    label="Müşteri"
                  >
                    <MenuItem value="">Seçiniz</MenuItem>
                    {activeClients.map(client => (
                      <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Görevle ilişkili müşteriyi seçin</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={editTask.category || ''}
                    onChange={(e) => setEditTask({...editTask, category: e.target.value as string})}
                    label="Kategori"
                  >
                    <MenuItem value="">Seçiniz</MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Öncelik</InputLabel>
                  <Select
                    value={editTask.priority}
                    onChange={(e) => setEditTask({...editTask, priority: e.target.value as 'low' | 'medium' | 'high'})}
                    label="Öncelik"
                  >
                    {TASK_PRIORITIES.map(priority => (
                      <MenuItem key={priority} value={priority}>
                        {priority === 'high' ? 'Yüksek' : priority === 'medium' ? 'Orta' : 'Düşük'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Bitiş Tarihi"
                  type="date"
                  fullWidth
                  required
                  value={editTask.due_date.split('T')[0]}
                  onChange={(e) => setEditTask({...editTask, due_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Açıklama"
                  multiline
                  rows={4}
                  fullWidth
                  value={editTask.description || ''}
                  onChange={(e) => setEditTask({...editTask, description: e.target.value})}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button onClick={handleSaveEditedTask} variant="contained" color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Filtreleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseFilterDialog}>
        <DialogTitle>Görevleri Filtrele</DialogTitle>
        <DialogContent>
          {currentUser && (
            <Box sx={{ mb: 2, mt: 1, display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src={currentUser.avatar} 
                sx={{ width: 32, height: 32, mr: 1 }}
              >
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="body2">
                  Giriş yapan kullanıcı: <strong>{currentUser.name}</strong> ({currentUser.role})
                </Typography>
                {currentUser.department && (
                  <Typography variant="caption" color="text.secondary">
                    Departman: <Chip 
                      label={currentUser.department} 
                      size="small" 
                      color="primary" 
                      sx={{ height: 20, fontSize: '0.7rem', ml: 1 }}
                    />
                  </Typography>
                )}
              </Box>
            </Box>
          )}
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Müşteri</InputLabel>
            <Select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value as string)}
              label="Müşteri"
              disabled={showMyTasks}
            >
              <MenuItem value="">Tüm Müşteriler</MenuItem>
              {activeClients.map(client => (
                <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Durum</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as string)}
              label="Durum"
              disabled={showMyTasks}
            >
              <MenuItem value="all">Tümü</MenuItem>
              {TASK_STATUSES.map(status => (
                <MenuItem key={status} value={status}>{TASK_STATUS_LABELS[status]}</MenuItem>
              ))}
            </Select>
            {showMyTasks && (
              <FormHelperText>
                {currentUser?.department ? 
                  `"${currentUser.department} Görevleri" aktifken diğer filtreler devre dışıdır` : 
                  "Departman görevleri aktifken diğer filtreler devre dışıdır"}
              </FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Atanan Kişi</InputLabel>
            <Select
              value={showMyTasks && currentUser ? currentUser.id : filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value as number)}
              label="Atanan Kişi"
              disabled={showMyTasks}
            >
              <MenuItem value={0}>Tümü</MenuItem>
              {/* Departmanlara göre gruplandırılmış kullanıcılar */}
              {Array.from(new Set(users.filter((u: User) => u.department).map((u: User) => u.department))).filter((dept): dept is string => !!dept).sort().map((department: string) => [
                <ListSubheader key={`dept-${department}`}>
                  {department}
                </ListSubheader>,
                ...users
                   .filter((user: User) => user.department === department)
                   .map((user: User) => (
                    <MenuItem key={user.id} value={user.id} sx={{ pl: 4 }}>
                      <ListItemAvatar sx={{ minWidth: 36 }}>
                        <Avatar src={user.avatar} sx={{ width: 24, height: 24 }}>
                          {user.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={`${user.name} ${currentUser && user.id === currentUser.id ? '(Ben)' : ''}`}
                        secondary={user.role}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </MenuItem>
                  ))
              ])}
              {/* Departmanı olmayan kullanıcılar */}
              {users.filter((user: User) => !user.department).length > 0 && [
                <ListSubheader key="dept-other">Diğer</ListSubheader>,
                ...users
                   .filter((user: User) => !user.department)
                   .map((user: User) => (
                    <MenuItem key={user.id} value={user.id} sx={{ pl: 4 }}>
                      {user.name} {currentUser && user.id === currentUser.id ? '(Ben)' : ''}
                    </MenuItem>
                  ))
              ]}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetFilters}>Sıfırla</Button>
          <Button onClick={handleApplyFilters} variant="contained">
            Uygula
          </Button>
        </DialogActions>
      </Dialog>
// ... 
    </Box>
  );
};

export default TasksPage;
