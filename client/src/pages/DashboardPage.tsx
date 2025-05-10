import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Chip, 
  Container, 
  Divider, 
  Grid, 
  IconButton, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Paper, 
  Typography, 
  useTheme, 
  Avatar,
  LinearProgress,
  Stack,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Business as BusinessIcon,
  Flag as FlagIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { format, isAfter, isBefore, parseISO, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { User, getActiveUsers } from '../services/UserService';
import { Client, getAllClients, CLIENTS_UPDATED_EVENT, SECTORS } from '../services/ClientService';
import { 
  Task, 
  getAllTasks, 
  TASKS_STORAGE_KEY, 
  TASKS_UPDATED_EVENT,
  TASK_STATUSES,
  TASK_STATUS_LABELS
} from '../services/TaskService';

// Proje tipi tanımı
interface Project {
  name: string;
  progress: number;
  client: string;
  totalTasks: number;
  completedTasks: number;
}

// Yardımcı sabitler

// Yardımcı sabitler
const userAvatars: Record<number, string> = {
  1: 'https://randomuser.me/api/portraits/men/1.jpg',
  2: 'https://randomuser.me/api/portraits/women/2.jpg',
  3: 'https://randomuser.me/api/portraits/men/3.jpg',
  4: 'https://randomuser.me/api/portraits/women/4.jpg',
  5: 'https://randomuser.me/api/portraits/men/5.jpg',
};

export default function DashboardPage() {
  console.log('DashboardPage bileşeni yükleniyor...');
  const theme = useTheme();
  
  // State tanımlamaları
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [activeClients, setActiveClients] = useState<Client[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [ongoingTasks, setOngoingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [completedTaskCount, setCompletedTaskCount] = useState(0);
  const [completedTasksChange, setCompletedTasksChange] = useState(0);
  const [taskCompletionRate, setTaskCompletionRate] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectCount, setActiveProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    inProgress: 0,
    onHold: 0,
    completed: 0,
    cancelled: 0
  });
  
  // Sayfa yüklendiğinde verileri yükle
  useEffect(() => {
    console.log('Dashboard sayfası yükleniyor...');
    
    try {
      // Verileri yükle
      loadData();
      
      // Event listener'ları ekle
      window.addEventListener(TASKS_UPDATED_EVENT, loadData);
      window.addEventListener(CLIENTS_UPDATED_EVENT, loadData);
      
      // LocalStorage değişikliklerini dinle (diğer sekmelerde yapılan değişiklikler için)
      window.addEventListener('storage', handleStorageChange);
    } catch (error) {
      console.error('Dashboard useEffect hatası:', error);
      setError('Dashboard yüklenirken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      setLoading(false);
    }
    
    // Periyodik güncelleme için interval oluştur (her 30 saniyede bir)
    const intervalId = setInterval(() => {
      console.log('Periyodik veri güncelleme...');
      loadData();
    }, 30000);
    
    // Temizleme fonksiyonu
    return () => {
      window.removeEventListener(TASKS_UPDATED_EVENT, loadData);
      window.removeEventListener(CLIENTS_UPDATED_EVENT, loadData);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);
  
  // LocalStorage değişikliklerini işle
  const handleStorageChange = (event: StorageEvent) => {
    // Sadece görev verilerindeki değişiklikleri dinle
    if (event.key === TASKS_STORAGE_KEY) {
      console.log('Görev verilerinde değişiklik algılandı, dashboard güncelleniyor...');
      loadData();
    }
  };
  
  // Tüm verileri yükle
  const loadData = () => {
    console.log(`[${new Date().toISOString()}] Dashboard: Veriler güncelleniyor...`);
    setLoading(true);
    setError("");
    
    try {
      // TaskService'den görevleri yükle - en güncel verileri al
      const allTasks = getAllTasks();
      console.log(`[${new Date().toISOString()}] Dashboard: ${allTasks.length} görev yüklendi`);
      setTasks(allTasks);
      
      // Görev analizlerini yap
      analyzeTasksData(allTasks);
      
      // Devam eden görevleri filtrele
      const ongoing = allTasks
        .filter((task: Task) => task.status === 'in_progress')
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()) // Bitiş tarihine göre sırala
        .slice(0, 5);
      setOngoingTasks(ongoing);
      console.log(`[${new Date().toISOString()}] Dashboard: ${ongoing.length} devam eden görev`);
      
      // Yaklaşan görevleri filtrele
      const upcoming = allTasks
        .filter((task: Task) => task.status === 'pending')
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()) // Bitiş tarihine göre sırala
        .slice(0, 5);
      setUpcomingTasks(upcoming);
      console.log(`[${new Date().toISOString()}] Dashboard: ${upcoming.length} yaklaşan görev`);
      
      // Tamamlanan görevleri filtrele
      const completed = allTasks
        .filter((task: Task) => task.status === 'completed')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // En son tamamlananlara göre sırala
        .slice(0, 5);
      setCompletedTasks(completed);
      console.log(`[${new Date().toISOString()}] Dashboard: ${completed.length} tamamlanan görev`);
      
      // Kullanıcıları yükle
      const users = getActiveUsers();
      setActiveUsers(users);
      
      // Müşterileri yükle
      const clients = getAllClients();
      setActiveClients(clients);
      
      // Yükleme tamamlandı
      setLoading(false);
      console.log(`[${new Date().toISOString()}] Dashboard: Veriler başarıyla güncellendi`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Dashboard: Veri yüklenirken hata oluştu:`, error);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      setLoading(false);
    }
  };
  
  // Görev verilerini analiz et
  const analyzeTasksData = (tasks: Task[]) => {
    if (!tasks || tasks.length === 0) return;
    
    // Görev tamamlanma oranını hesapla
    const completionRate = calculateTaskCompletionRate(tasks);
    setTaskCompletionRate(completionRate);
    console.log(`[${new Date().toISOString()}] Dashboard: Görev tamamlanma oranı: %${completionRate}`);
    
    // Tamamlanan görev sayısını hesapla
    const completedCount = tasks.filter(task => task.status === 'completed').length;
    setCompletedTaskCount(completedCount);
    console.log(`[${new Date().toISOString()}] Dashboard: Tamamlanan görev sayısı: ${completedCount}`);
    
    // Görev durumlarını say
    const counts = getStatusCounts(tasks);
    setStatusCounts(counts);
    
    // Geciken görevleri hesapla
    const overdueTasks = tasks.filter(task => 
      task.status !== 'completed' && 
      task.status !== 'cancelled' && 
      isAfter(new Date(), parseISO(task.due_date))
    );
    
    // Yaklaşan bitiş tarihi olan görevleri hesapla (7 gün içinde)
    const upcomingDeadlines = tasks.filter(task => {
      if (task.status === 'completed' || task.status === 'cancelled') return false;
      
      const dueDate = parseISO(task.due_date);
      const today = new Date();
      const diff = differenceInDays(dueDate, today);
      
      return diff >= 0 && diff <= 7;
    });
    
    console.log(`[${new Date().toISOString()}] Dashboard: ${overdueTasks.length} geciken görev, ${upcomingDeadlines.length} yaklaşan bitiş tarihli görev`);
  };
  
  // Görevleri localStorage'dan yükle - gerçek zamanlı veri için doğrudan localStorage'a erişiyoruz
  const getAllTasks = (): Task[] => {
    try {
      // Her zaman en güncel veriyi almak için doğrudan localStorage'a eriş
      const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      console.log(`[${new Date().toISOString()}] Dashboard: Görevler yükleniyor...`);
      
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        if (Array.isArray(parsedTasks)) {
          const activeTasks = parsedTasks.filter(task => !task.deleted_at);
          console.log(`[${new Date().toISOString()}] Dashboard: ${activeTasks.length} aktif görev yüklendi`);
          return activeTasks;
        }
      }
      
      // Eğer localStorage boşsa, örnek görev verileri oluştur
      console.log(`[${new Date().toISOString()}] Dashboard: Görev verisi bulunamadı, örnek veriler oluşturuluyor`);
      const demoTasks = createDemoTasks();
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(demoTasks));
      return demoTasks;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Dashboard: Görevler yüklenirken hata oluştu:`, error);
      return [];
    }
  };
  
  // Örnek görev verileri oluştur
  const createDemoTasks = (): Task[] => {
    return [
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
  };
  
  // Görev tamamlanma oranını hesapla
  const calculateTaskCompletionRate = (allTasks: Task[]): number => {
    if (allTasks.length === 0) return 0;
    
    const completedCount = allTasks.filter(task => task.status === 'completed').length;
    return Math.round((completedCount / allTasks.length) * 100);
  };
  
  // Görev durumlarını say - doğrudan en güncel görev verileriyle çalışır
  const getStatusCounts = (currentTasks: Task[] = tasks) => {
    const counts = {
      pending: 0,
      inProgress: 0,
      onHold: 0,
      completed: 0,
      cancelled: 0
    };
    
    currentTasks.forEach(task => {
      if (task.status === 'pending') counts.pending++;
      else if (task.status === 'in_progress') counts.inProgress++;
      else if (task.status === 'on_hold') counts.onHold++;
      else if (task.status === 'completed') counts.completed++;
      else if (task.status === 'cancelled') counts.cancelled++;
    });
    
    console.log(`[${new Date().toISOString()}] Dashboard: Görev durumları hesaplandı:`, counts);
    return counts;
  };
  
  // Görev durumunu metin olarak döndür
  const getTaskStatusText = (status: string) => {
    return TASK_STATUS_LABELS[status] || status;
  };
  
  // Görev durumuna göre renk döndür
  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'on_hold': return 'secondary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };
  
  // Kullanıcı adını ve avatarını getir
  const getUserInfo = (userId: number) => {
    const user = activeUsers.find(u => u.id === userId);
    const name = user ? user.name : 'Atanmamış';
    const avatar = userAvatars[userId] || '';
    
    return { name, avatar };
  };
  
  // Yükleme durumunu göster
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Hata durumunu göster
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Bir hata oluştu</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Sayfayı Yenile
        </Button>
      </Box>
    );
  }
  
  // Görev yoksa bilgi mesajı göster
  if (tasks.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h6">Henüz görev bulunmuyor</Typography>
          <Typography variant="body2">
            Görevlerinizi yönetmek için lütfen önce görev ekleyin.
          </Typography>
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          href="/tasks"
          sx={{ mt: 2 }}
        >
          Görev Ekle
        </Button>
      </Box>
    );
  }
  
  // Dashboard'u göster
  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Görev Tamamlama Kartı */}
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Görev Tamamlama
                    <Tooltip title="Görevler ekranından güncel veriler" placement="top">
                      <InfoIcon sx={{ fontSize: 16, ml: 1, color: 'primary.main', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </Typography>
                  <Chip 
                    label={`${taskCompletionRate}%`} 
                    color={taskCompletionRate > 75 ? "success" : taskCompletionRate > 50 ? "primary" : taskCompletionRate > 25 ? "warning" : "error"}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={taskCompletionRate} 
                    color={taskCompletionRate > 75 ? "success" : taskCompletionRate > 50 ? "primary" : taskCompletionRate > 25 ? "warning" : "error"}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Toplam {tasks.length} görev
                  </Typography>
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    {completedTaskCount} tamamlandı
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Görev Durumları
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Son güncelleme: {format(new Date(), 'HH:mm', { locale: tr })}
                  </Typography>
                </Box>
                
                {TASK_STATUSES.map((status: string) => {
                  const count = tasks.filter((t: Task) => t.status === status).length;
                  const percentage = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
                  
                  return (
                    <Box key={status} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            component="span" 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              backgroundColor: getTaskStatusColor(status),
                              display: 'inline-block',
                              mr: 0.5
                            }} 
                          />
                          {getTaskStatusText(status)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="caption" fontWeight="bold" sx={{ mr: 1 }}>
                            {count}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({percentage}%)
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        color={getTaskStatusColor(status) as any}
                        sx={{ height: 5, borderRadius: 5 }}
                      />
                    </Box>
                  );
                })}
                
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed rgba(0, 0, 0, 0.12)' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    <strong>Not:</strong> Tüm görev verileri Görevler ekranından eşzamanlı olarak alınmaktadır.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Yaklaşan Görevler Kartı */}
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Yaklaşan Görevler
                    <Tooltip title="Görevler ekranından eş zamanlı veriler" placement="top">
                      <InfoIcon sx={{ fontSize: 16, ml: 1, color: 'warning.main', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </Typography>
                  <Chip 
                    label={`${upcomingTasks.length} görev`} 
                    color="warning" 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Son güncelleme: {format(new Date(), 'HH:mm', { locale: tr })}
                  </Typography>
                  <Typography variant="caption" color="warning.main" fontWeight="bold">
                    {upcomingTasks.length > 0 ? `En yakın: ${format(parseISO(upcomingTasks[0]?.due_date || new Date().toISOString()), 'dd MMM', { locale: tr })}` : 'Bekleyen görev yok'}
                  </Typography>
                </Box>
                
                {upcomingTasks.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography color="text.secondary" variant="body2">
                      Bekleyen görev bulunmuyor
                    </Typography>
                    <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mt: 1 }}>
                      Yeni görev eklemek için Görevler sayfasını ziyaret edin
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0, maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1 }}>
                    {upcomingTasks.map((task) => {
                      const { name, avatar } = getUserInfo(task.assigned_to);
                      const dueDate = parseISO(task.due_date);
                      const today = new Date();
                      const daysLeft = differenceInDays(dueDate, today);
                      const formattedDate = format(dueDate, 'dd MMM', { locale: tr });
                      const isUrgent = daysLeft <= 3 && daysLeft >= 0;
                      
                      return (
                        <ListItem 
                          key={task.id} 
                          sx={{ 
                            px: 1, 
                            py: 1, 
                            borderLeft: isUrgent ? '3px solid' : 'none', 
                            borderColor: isUrgent ? 'error.main' : 'transparent',
                            mb: 0.5,
                            '&:hover': { bgcolor: 'action.hover' },
                            borderRadius: 1
                          }}
                        >
                          <ListItemAvatar>
                            <Tooltip title={name}>
                              <Avatar src={avatar} sx={{ width: 32, height: 32 }}>{name.charAt(0)}</Avatar>
                            </Tooltip>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Tooltip title={task.description || 'Görev açıklaması bulunmuyor'}>
                                <Typography variant="body2" noWrap sx={{ fontWeight: isUrgent ? 'bold' : 'normal' }}>
                                  {task.title}
                                </Typography>
                              </Tooltip>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="caption" color={isUrgent ? 'error.main' : 'text.secondary'} sx={{ fontWeight: isUrgent ? 'bold' : 'normal' }}>
                                  {isUrgent ? `Acil: ${formattedDate}` : formattedDate}
                                </Typography>
                                {task.priority === 'high' && (
                                  <Chip 
                                    label="Yüksek" 
                                    size="small" 
                                    color="error" 
                                    variant="outlined"
                                    sx={{ ml: 1, height: 16, fontSize: '0.6rem' }} 
                                  />
                                )}
                              </Box>
                            }
                            sx={{ ml: -1 }}
                          />
                          <Chip 
                            label={getTaskStatusText(task.status)} 
                            color={getTaskStatusColor(task.status) as any} 
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                )}
                
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="small"
                    color="warning"
                    endIcon={<ArrowForwardIcon />}
                    href="/tasks"
                  >
                    Tüm Bekleyen Görevleri Gör
                  </Button>
                </Box>
                
                <Box sx={{ mt: 2, pt: 1, borderTop: '1px dashed rgba(0, 0, 0, 0.12)' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0 }}>
                    <strong>Not:</strong> Görevler ekranından eş zamanlı olarak güncellenir
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Devam Eden Görevler Kartı */}
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Devam Eden Görevler
                    <Tooltip title="Görevler ekranından eş zamanlı veriler" placement="top">
                      <InfoIcon sx={{ fontSize: 16, ml: 1, color: 'info.main', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </Typography>
                  <Chip 
                    label={`${ongoingTasks.length} görev`} 
                    color="info" 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Son güncelleme: {format(new Date(), 'HH:mm', { locale: tr })}
                  </Typography>
                  <Typography variant="caption" color="info.main" fontWeight="bold">
                    {ongoingTasks.length > 0 ? 
                      `İlerleme: ${Math.round(ongoingTasks.reduce((acc, task) => acc + (task.progress || 0), 0) / ongoingTasks.length)}%` : 
                      'Aktif görev yok'}
                  </Typography>
                </Box>
                
                {ongoingTasks.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography color="text.secondary" variant="body2">
                      Devam eden görev bulunmuyor
                    </Typography>
                    <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mt: 1 }}>
                      Görevler sayfasından yeni görev başlatın
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0, maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1 }}>
                    {ongoingTasks.map((task) => {
                      const { name, avatar } = getUserInfo(task.assigned_to);
                      const dueDate = parseISO(task.due_date);
                      const today = new Date();
                      const daysLeft = differenceInDays(dueDate, today);
                      const formattedDate = format(dueDate, 'dd MMM', { locale: tr });
                      const isLate = daysLeft < 0;
                      const progress = task.progress || 0;
                      
                      return (
                        <ListItem 
                          key={task.id} 
                          sx={{ 
                            px: 1, 
                            py: 1, 
                            mb: 0.5,
                            '&:hover': { bgcolor: 'action.hover' },
                            borderRadius: 1
                          }}
                        >
                          <ListItemAvatar>
                            <Tooltip title={name}>
                              <Avatar src={avatar} sx={{ width: 32, height: 32 }}>{name.charAt(0)}</Avatar>
                            </Tooltip>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Box>
                                <Tooltip title={task.description || 'Görev açıklaması bulunmuyor'}>
                                  <Typography variant="body2" noWrap>
                                    {task.title}
                                  </Typography>
                                </Tooltip>
                                <Box sx={{ mt: 0.5, mb: 0.5 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={progress} 
                                    color={progress > 75 ? "success" : progress > 50 ? "primary" : progress > 25 ? "warning" : "error"}
                                    sx={{ height: 4, borderRadius: 5 }}
                                  />
                                </Box>
                              </Box>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color={isLate ? 'error.main' : 'text.secondary'} sx={{ fontWeight: isLate ? 'bold' : 'normal' }}>
                                  {isLate ? `Gecikmiş: ${formattedDate}` : `Bitiş: ${formattedDate}`}
                                </Typography>
                                <Typography variant="caption" color="info.main" fontWeight="bold">
                                  %{progress}
                                </Typography>
                              </Box>
                            }
                            sx={{ ml: -1 }}
                          />
                          <Chip 
                            label={getTaskStatusText(task.status)} 
                            color={getTaskStatusColor(task.status) as any} 
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                )}
                
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="small"
                    color="info"
                    endIcon={<ArrowForwardIcon />}
                    href="/tasks"
                  >
                    Devam Eden Görevleri Yönet
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Tamamlanan Görevler Kartı */}
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Tamamlanan Görevler
                    <Tooltip title="Görevler ekranından eş zamanlı veriler" placement="top">
                      <InfoIcon sx={{ fontSize: 16, ml: 1, color: 'success.main', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </Typography>
                  <Chip 
                    label={`${completedTasks.length} görev`} 
                    color="success" 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Son güncelleme: {format(new Date(), 'HH:mm', { locale: tr })}
                  </Typography>
                  <Typography variant="caption" color="success.main" fontWeight="bold">
                    {completedTasks.length > 0 ? 
                      `Son tamamlanan: ${format(parseISO(completedTasks[0]?.created_at || new Date().toISOString()), 'dd MMM', { locale: tr })}` : 
                      'Tamamlanan görev yok'}
                  </Typography>
                </Box>
                
                {completedTasks.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography color="text.secondary" variant="body2">
                      Tamamlanan görev bulunmuyor
                    </Typography>
                    <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mt: 1 }}>
                      Görevler sayfasından görevleri tamamlayın
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0, maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1 }}>
                    {completedTasks.map((task) => {
                      const { name, avatar } = getUserInfo(task.assigned_to);
                      const completedDate = parseISO(task.created_at);
                      const formattedDate = format(completedDate, 'dd MMM', { locale: tr });
                      const estimatedHours = task.estimated_hours || 0;
                      const actualHours = task.actual_hours || 0;
                      const efficiency = estimatedHours > 0 ? Math.round((estimatedHours / (actualHours || estimatedHours)) * 100) : 100;
                      const isEfficient = efficiency >= 100;
                      
                      return (
                        <ListItem 
                          key={task.id} 
                          sx={{ 
                            px: 1, 
                            py: 1, 
                            mb: 0.5,
                            bgcolor: isEfficient ? 'rgba(76, 175, 80, 0.08)' : 'transparent',
                            '&:hover': { bgcolor: isEfficient ? 'rgba(76, 175, 80, 0.12)' : 'action.hover' },
                            borderRadius: 1
                          }}
                        >
                          <ListItemAvatar>
                            <Tooltip title={name}>
                              <Avatar src={avatar} sx={{ width: 32, height: 32 }}>{name.charAt(0)}</Avatar>
                            </Tooltip>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Tooltip title={task.description || 'Görev açıklaması bulunmuyor'}>
                                <Typography variant="body2" noWrap>
                                  {task.title}
                                </Typography>
                              </Tooltip>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">
                                  {`Tamamlama: ${formattedDate}`}
                                </Typography>
                                {(estimatedHours > 0 || actualHours > 0) && (
                                  <Tooltip title={`Tahmini: ${estimatedHours} saat, Gerçek: ${actualHours} saat`}>
                                    <Typography variant="caption" color={isEfficient ? 'success.main' : 'warning.main'} fontWeight="bold">
                                      {isEfficient ? `%${efficiency} verimli` : `%${efficiency} verim`}
                                    </Typography>
                                  </Tooltip>
                                )}
                              </Box>
                            }
                            sx={{ ml: -1 }}
                          />
                          <Box>
                            <Chip 
                              label={getTaskStatusText(task.status)} 
                              color={getTaskStatusColor(task.status) as any} 
                              size="small"
                              sx={{ fontSize: '0.7rem', mb: 1 }}
                            />
                            {task.priority === 'high' && (
                              <Chip 
                                label="Yüksek" 
                                size="small" 
                                color="error" 
                                variant="outlined"
                                sx={{ fontSize: '0.6rem', display: 'block', height: 16 }} 
                              />
                            )}
                          </Box>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
                
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="small"
                    color="success"
                    endIcon={<ArrowForwardIcon />}
                    href="/tasks"
                  >
                    Tüm Tamamlanan Görevleri Gör
                  </Button>
                </Box>
                
                <Box sx={{ mt: 2, pt: 1, borderTop: '1px dashed rgba(0, 0, 0, 0.12)' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0 }}>
                    <strong>Not:</strong> Görevler ekranından eş zamanlı olarak güncellenir
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Özet Bilgi */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body1">
                Toplam {tasks.length} görev | 
                Bekleyen: {statusCounts.pending} | 
                Devam Eden: {statusCounts.inProgress} | 
                Tamamlanan: {statusCounts.completed} | 
                Beklemede: {statusCounts.onHold} | 
                İptal Edilen: {statusCounts.cancelled}
              </Typography>
            </Alert>
          </Grid>
          
          {/* Görev Analizi Özeti */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Görev Analizi Özeti
                  <Tooltip title="Görevlerin durumlarına göre dağılımı" placement="top">
                    <InfoIcon sx={{ fontSize: 16, ml: 1, color: 'primary.main', verticalAlign: 'middle' }} />
                  </Tooltip>
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  {TASK_STATUSES.map((status) => {
                    const count = tasks.filter(t => t.status === status).length;
                    const percentage = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
                    
                    return (
                      <Box 
                        key={status} 
                        sx={{ 
                          textAlign: 'center', 
                          p: 1, 
                          borderRadius: 1,
                          bgcolor: `${getTaskStatusColor(status)}.light`,
                          minWidth: 100
                        }}
                      >
                        <Typography variant="h4" fontWeight="bold" color={`${getTaskStatusColor(status)}.dark`}>
                          {count}
                        </Typography>
                        <Typography variant="caption" color={`${getTaskStatusColor(status)}.dark`}>
                          {getTaskStatusText(status)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {percentage}%
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Görev Öncelik Dağılımı
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    {['low', 'medium', 'high'].map((priority) => {
                      const count = tasks.filter(t => t.priority === priority).length;
                      const percentage = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
                      const color = priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'success';
                      const label = priority === 'high' ? 'Yüksek' : priority === 'medium' ? 'Orta' : 'Düşük';
                      
                      return (
                        <Box key={priority} sx={{ textAlign: 'center', width: '30%' }}>
                          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                            <CircularProgress 
                              variant="determinate" 
                              value={percentage} 
                              size={60}
                              thickness={5}
                              color={color as any}
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
                              <Typography variant="caption" fontWeight="bold">
                                {percentage}%
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {count} görev
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Görev Tamamlama Performansı
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Box sx={{ width: '70%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={taskCompletionRate} 
                        color={taskCompletionRate > 75 ? "success" : taskCompletionRate > 50 ? "primary" : taskCompletionRate > 25 ? "warning" : "error"}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight="bold" color={taskCompletionRate > 75 ? "success.main" : taskCompletionRate > 50 ? "primary.main" : taskCompletionRate > 25 ? "warning.main" : "error.main"}>
                      {taskCompletionRate}% Tamamlandı
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Geciken Görevler Uyarı Listesi */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <FlagIcon sx={{ mr: 1, color: 'error.main' }} />
                  Geciken Görevler
                </Typography>
                
                {(() => {
                  const overdueTasksData = tasks.filter(task => 
                    task.status !== 'completed' && 
                    task.status !== 'cancelled' && 
                    isAfter(new Date(), parseISO(task.due_date))
                  );
                  
                  if (overdueTasksData.length === 0) {
                    return (
                      <Box sx={{ textAlign: 'center', py: 3, bgcolor: 'success.light', borderRadius: 1, color: 'success.dark' }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 40 }} />
                        <Typography variant="body1" fontWeight="bold" sx={{ mt: 1 }}>
                          Harika! Geciken görev bulunmuyor
                        </Typography>
                        <Typography variant="caption">
                          Tüm görevler zamanında ilerliyor
                        </Typography>
                      </Box>
                    );
                  }
                  
                  return (
                    <>
                      <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>{overdueTasksData.length}</strong> görev son tarihini geçti ve hala tamamlanmadı!
                        </Typography>
                      </Alert>
                      
                      <List sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1 }}>
                        {overdueTasksData
                          .sort((a, b) => parseISO(a.due_date).getTime() - parseISO(b.due_date).getTime())
                          .map((task) => {
                            const { name, avatar } = getUserInfo(task.assigned_to);
                            const dueDate = parseISO(task.due_date);
                            const today = new Date();
                            const daysLate = Math.abs(differenceInDays(dueDate, today));
                            
                            return (
                              <ListItem 
                                key={task.id} 
                                sx={{ 
                                  px: 1, 
                                  py: 1, 
                                  mb: 0.5,
                                  bgcolor: daysLate > 7 ? 'rgba(211, 47, 47, 0.1)' : 'transparent',
                                  '&:hover': { bgcolor: 'action.hover' },
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: 'error.light'
                                }}
                              >
                                <ListItemAvatar>
                                  <Tooltip title={name}>
                                    <Avatar src={avatar} sx={{ width: 32, height: 32 }}>{name.charAt(0)}</Avatar>
                                  </Tooltip>
                                </ListItemAvatar>
                                <ListItemText 
                                  primary={
                                    <Typography variant="body2" fontWeight="bold">
                                      {task.title}
                                    </Typography>
                                  }
                                  secondary={
                                    <Box>
                                      <Typography variant="caption" color="error.main" fontWeight="bold">
                                        {daysLate} gün gecikmiş
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        Son tarih: {format(dueDate, 'dd MMM yyyy', { locale: tr })}
                                      </Typography>
                                    </Box>
                                  }
                                />
                                <Chip 
                                  label={getTaskStatusText(task.status)} 
                                  color={getTaskStatusColor(task.status) as any} 
                                  size="small"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              </ListItem>
                            );
                        })}
                      </List>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Kullanıcı Performans Kartı */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Kullanıcı Performansı
                </Typography>
                
                {(() => {
                  // Kullanıcı performans verilerini hesapla
                  const userPerformance = activeUsers.map(user => {
                    const userTasks = tasks.filter(task => task.assigned_to === user.id);
                    const completedTasks = userTasks.filter(task => task.status === 'completed');
                    const completionRate = userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0;
                    
                    // Gecikmiş görev sayısı
                    const overdueTasks = userTasks.filter(task => 
                      task.status !== 'completed' && 
                      task.status !== 'cancelled' && 
                      isAfter(new Date(), parseISO(task.due_date))
                    );
                    
                    return {
                      id: user.id,
                      name: user.name,
                      totalTasks: userTasks.length,
                      completedTasks: completedTasks.length,
                      completionRate,
                      overdueTasks: overdueTasks.length
                    };
                  });
                  
                  // Performansa göre sırala (tamamlama oranına göre azalan sırada)
                  userPerformance.sort((a, b) => b.completionRate - a.completionRate);
                  
                  return (
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {userPerformance.map((user) => {
                        const { avatar } = getUserInfo(user.id);
                        
                        return (
                          <ListItem key={user.id} sx={{ px: 1, py: 1.5 }}>
                            <ListItemAvatar>
                              <Avatar src={avatar}>{user.name.charAt(0)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2">{user.name}</Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    {user.completionRate}%
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 0.5 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={user.completionRate} 
                                    color={user.completionRate > 75 ? "success" : user.completionRate > 50 ? "primary" : user.completionRate > 25 ? "warning" : "error"}
                                    sx={{ height: 5, borderRadius: 5, mb: 0.5 }}
                                  />
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" color="text.secondary">
                                      {user.completedTasks} / {user.totalTasks} görev
                                    </Typography>
                                    {user.overdueTasks > 0 && (
                                      <Typography variant="caption" color="error.main">
                                        {user.overdueTasks} gecikmiş
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  );
                })()}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Öncelikli Görevler Özeti */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Öncelikli Görevler Özeti
                </Typography>
                
                {(() => {
                  // Yüksek öncelikli görevleri filtrele
                  const highPriorityTasks = tasks.filter(task => 
                    task.priority === 'high' && 
                    task.status !== 'completed' && 
                    task.status !== 'cancelled'
                  );
                  
                  if (highPriorityTasks.length === 0) {
                    return (
                      <Box sx={{ textAlign: 'center', py: 3, bgcolor: 'success.light', borderRadius: 1, color: 'success.dark' }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 40 }} />
                        <Typography variant="body1" fontWeight="bold" sx={{ mt: 1 }}>
                          Yüksek öncelikli bekleyen görev yok
                        </Typography>
                        <Typography variant="caption">
                          Tüm yüksek öncelikli görevler tamamlandı
                        </Typography>
                      </Box>
                    );
                  }
                  
                  return (
                    <>
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>{highPriorityTasks.length}</strong> yüksek öncelikli görev bekliyor
                        </Typography>
                      </Alert>
                      
                      <List sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1 }}>
                        {highPriorityTasks
                          .sort((a, b) => parseISO(a.due_date).getTime() - parseISO(b.due_date).getTime())
                          .map((task) => {
                            const { name, avatar } = getUserInfo(task.assigned_to);
                            const dueDate = parseISO(task.due_date);
                            const today = new Date();
                            const daysLeft = differenceInDays(dueDate, today);
                            const isLate = daysLeft < 0;
                            
                            return (
                              <ListItem 
                                key={task.id} 
                                sx={{ 
                                  px: 1, 
                                  py: 1, 
                                  mb: 0.5,
                                  bgcolor: isLate ? 'rgba(211, 47, 47, 0.1)' : 'rgba(237, 108, 2, 0.1)',
                                  '&:hover': { bgcolor: 'action.hover' },
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: isLate ? 'error.light' : 'warning.light'
                                }}
                              >
                                <ListItemAvatar>
                                  <Tooltip title={name}>
                                    <Avatar src={avatar} sx={{ width: 32, height: 32 }}>{name.charAt(0)}</Avatar>
                                  </Tooltip>
                                </ListItemAvatar>
                                <ListItemText 
                                  primary={
                                    <Typography variant="body2" fontWeight="bold">
                                      {task.title}
                                    </Typography>
                                  }
                                  secondary={
                                    <Box>
                                      <Typography variant="caption" color={isLate ? "error.main" : "warning.main"} fontWeight="bold">
                                        {isLate ? `${Math.abs(daysLeft)} gün gecikmiş` : `${daysLeft} gün kaldı`}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        Son tarih: {format(dueDate, 'dd MMM yyyy', { locale: tr })}
                                      </Typography>
                                    </Box>
                                  }
                                />
                                <Chip 
                                  label={getTaskStatusText(task.status)} 
                                  color={getTaskStatusColor(task.status) as any} 
                                  size="small"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              </ListItem>
                            );
                        })}
                      </List>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
