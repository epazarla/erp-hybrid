import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Chip, 
  Container, 
  Divider, 
  Grid, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Typography, 
  Avatar,
  LinearProgress,
  Alert,
  Button,
  CircularProgress
} from '@mui/material';
import { 
  CheckCircleOutline as CheckCircleOutlineIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { format, parseISO, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { User, getActiveUsers } from '../services/UserService';
import { Client, getAllClients } from '../services/ClientService';
import { 
  Task, 
  getAllTasks,
  getAllTasksAndNotify,
  TASK_STATUS_LABELS,
  TASK_STATUSES as SERVICE_TASK_STATUSES, 
  TASKS_UPDATED_EVENT,
  TASK_COMPLETION_UPDATE_EVENT, 
  UPCOMING_TASKS_UPDATE_EVENT,
  RECENT_TASKS_UPDATE_EVENT,
  TASK_STATUS_UPDATE_EVENT,
  TASK_WIDGET_UPDATE_EVENT
} from '../services/TaskService';

// Görev durumları için sabitler
const TASK_STATUSES = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on-hold'
};

// Yardımcı sabitler - Kullanıcı avatarları için sabit URL'ler
const userAvatars: Record<number, string> = {
  1: 'https://randomuser.me/api/portraits/men/1.jpg',
  2: 'https://randomuser.me/api/portraits/women/2.jpg',
  3: 'https://randomuser.me/api/portraits/men/3.jpg',
  4: 'https://randomuser.me/api/portraits/women/4.jpg',
  5: 'https://randomuser.me/api/portraits/men/5.jpg',
  6: 'https://randomuser.me/api/portraits/women/6.jpg',
  7: 'https://randomuser.me/api/portraits/men/7.jpg',
  8: 'https://randomuser.me/api/portraits/women/8.jpg',
  9: 'https://randomuser.me/api/portraits/men/9.jpg',
  10: 'https://randomuser.me/api/portraits/women/10.jpg'
};

export default function DashboardPage() {
  // State tanımlamaları
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Görev dağılımı için veri
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [taskCompletionRate, setTaskCompletionRate] = useState<number>(0);
  
  // Canlı görev güncellemeleri için state
  const [taskStats, setTaskStats] = useState<{
    completionRate: number;
    counts: Record<string, number>;
    totalTasks: number;
    completedTasks: number;
    timestamp: string;
  } | null>(null);
  
  // Yaklaşan görevler için state
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Veri yükleme fonksiyonu
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Görevleri yükle
        const allTasks = await getAllTasks();
        setTasks(allTasks);

        // Tamamlanma oranını hesapla
        if (allTasks.length > 0) {
          const completedCount = allTasks.filter((task: Task) => task.status === TASK_STATUSES.COMPLETED).length;
          const rate = Math.round((completedCount / allTasks.length) * 100);
          setTaskCompletionRate(rate);
        }

        // Görev durumlarına göre ayır
        const completed = allTasks.filter((task: Task) => task.status === TASK_STATUSES.COMPLETED);
        const pending = allTasks.filter((task: Task) => 
          task.status === TASK_STATUSES.IN_PROGRESS || 
          task.status === TASK_STATUSES.PENDING
        );
        const overdue = allTasks.filter((task: Task) => {
          if (!task.due_date) return false;
          const dueDate = parseISO(task.due_date);
          const today = new Date();
          return differenceInDays(today, dueDate) > 0 && task.status !== TASK_STATUSES.COMPLETED;
        });

        setCompletedTasks(completed);
        setPendingTasks(pending);
        setOverdueTasks(overdue);

        // Aktif kullanıcıları yükle
        const users = getActiveUsers();
        setActiveUsers(users);

        // Müşterileri yükle
        const allClients = await getAllClients();
        setClients(allClients);

        setLoading(false);
      } catch (err) {
        console.error('Veri yükleme hatası:', err);
        setError('Veriler yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    loadData();

    // Görev güncellemelerini dinle
    const handleTasksUpdated = () => {
      loadData();
    };
    
    // Görev tamamlama istatistiklerini dinle
    const handleTaskCompletionUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const stats = customEvent.detail;
      console.log('Dashboard: Görev tamamlama istatistikleri güncellendi', stats);
      setTaskStats(stats);
      setLastUpdate(new Date());
      
      // İstatistiklere göre görev durumlarını güncelle
      if (stats && stats.completionRate !== undefined) {
        setTaskCompletionRate(stats.completionRate);
      }
    };
    
    // Yaklaşan görevleri dinle
    const handleUpcomingTasksUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const upcomingTasksData = customEvent.detail?.tasks;
      console.log('Dashboard: Yaklaşan görevler güncellendi', upcomingTasksData);
      if (upcomingTasksData && Array.isArray(upcomingTasksData)) {
        setUpcomingTasks(upcomingTasksData);
        setLastUpdate(new Date());
      }
    };
    
    // Son görevleri dinle
    const handleRecentTasksUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const recentTasksData = customEvent.detail?.tasks;
      console.log('Dashboard: Son görevler güncellendi', recentTasksData);
      if (recentTasksData && Array.isArray(recentTasksData)) {
        setTasks(recentTasksData);
        setLastUpdate(new Date());
      }
    };
    
    // Görev durumu güncellemelerini dinle
    const handleTaskStatusUpdate = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const statusData = customEvent.detail;
      console.log('Dashboard: Görev durumu güncellendi', statusData);
      setLastUpdate(new Date());
      
      // Görev durumu güncellemesi sonrası gerekli verileri yenile
      const allTasks = await getAllTasks();
      setTasks(allTasks);
        
        // Görevleri durumlara göre filtrele
        const completed = allTasks.filter((task: Task) => task.status === TASK_STATUSES.COMPLETED);
        const pending = allTasks.filter((task: Task) => task.status === TASK_STATUSES.PENDING);
        
        // Gecikmiş görevleri hesapla
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdue = allTasks.filter((task: Task) => {
          const dueDate = new Date(task.due_date);
          dueDate.setHours(0, 0, 0, 0);
          return differenceInDays(today, dueDate) > 0 && task.status !== TASK_STATUSES.COMPLETED;
        });
      
      setCompletedTasks(completed);
      setPendingTasks(pending);
      setOverdueTasks(overdue);
    };
    
    // Tüm widget'ları güncelleme olayını dinle
    const handleTaskWidgetUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const widgetData = customEvent.detail;
      console.log('Dashboard: Tüm widget verileri güncellendi', widgetData);
      
      if (widgetData) {
        // Tüm widget verilerini güncelle
        if (widgetData.completionRate !== undefined) {
          setTaskCompletionRate(widgetData.completionRate);
        }
        
        if (widgetData.statusCounts) {
          setTaskStats({
            completionRate: widgetData.completionRate || 0,
            counts: widgetData.statusCounts,
            totalTasks: widgetData.tasks?.length || 0,
            completedTasks: widgetData.tasks?.filter((t: Task) => t.status === 'completed').length || 0,
            timestamp: widgetData.timestamp
          });
        }
        
        if (widgetData.upcomingTasks && Array.isArray(widgetData.upcomingTasks)) {
          setUpcomingTasks(widgetData.upcomingTasks);
        }
        
        if (widgetData.recentTasks && Array.isArray(widgetData.recentTasks)) {
          setTasks(widgetData.recentTasks);
        }
        
        setLastUpdate(new Date());
      }
    };

    window.addEventListener(TASKS_UPDATED_EVENT, handleTasksUpdated);
    window.addEventListener(TASK_COMPLETION_UPDATE_EVENT, handleTaskCompletionUpdate);
    window.addEventListener(UPCOMING_TASKS_UPDATE_EVENT, handleUpcomingTasksUpdate);
    window.addEventListener(RECENT_TASKS_UPDATE_EVENT, handleRecentTasksUpdate);
    window.addEventListener(TASK_STATUS_UPDATE_EVENT, handleTaskStatusUpdate);
    window.addEventListener(TASK_WIDGET_UPDATE_EVENT, handleTaskWidgetUpdate);
    
    // Başlangıçta tüm görev verilerini ve olayları tetikle
    getAllTasksAndNotify('dashboard-init');
    
    // Cleanup
    return () => {
      window.removeEventListener(TASKS_UPDATED_EVENT, handleTasksUpdated);
      window.removeEventListener(TASK_COMPLETION_UPDATE_EVENT, handleTaskCompletionUpdate);
      window.removeEventListener(UPCOMING_TASKS_UPDATE_EVENT, handleUpcomingTasksUpdate);
      window.removeEventListener(RECENT_TASKS_UPDATE_EVENT, handleRecentTasksUpdate);
      window.removeEventListener(TASK_STATUS_UPDATE_EVENT, handleTaskStatusUpdate);
      window.removeEventListener(TASK_WIDGET_UPDATE_EVENT, handleTaskWidgetUpdate);
    };
  }, []);

  // Yardımcı fonksiyonlar
  const getTaskStatusText = (status: string): string => {
    return TASK_STATUS_LABELS[status] || status;
  };

  const getTaskStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case TASK_STATUSES.COMPLETED:
        return 'success';
      case TASK_STATUSES.IN_PROGRESS:
        return 'primary';
      case TASK_STATUSES.ON_HOLD:
        return 'warning';
      case TASK_STATUSES.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  // Kullanıcı bilgisini güvenli bir şekilde al
  const getUserInfo = (userId: number): {name: string, avatar: string} => {
    // activeUsers dizisini güvenli bir şekilde kontrol et
    const user = activeUsers?.find(u => u.id === userId);
    return {
      name: user ? user.name : `Kullanıcı ${userId}`,
      avatar: userAvatars[(userId % 10) + 1] || userAvatars[1]
    };
  };

  // Yükleme durumu gösterimi
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Yükleniyor...</Typography>
        </Box>
      </Container>
    );
  }

  // Hata durumu gösterimi
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Yeniden Dene
        </Button>
      </Container>
    );
  }

  // Ana dashboard içeriği
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Görev Tamamlama Oranı */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Görev Tamamlama
              </Typography>
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h4">
                  %{taskCompletionRate}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={taskCompletionRate} 
                color="success"
                sx={{ height: 8, borderRadius: 5, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Toplam {taskStats?.totalTasks || tasks.length} görevden {taskStats?.completedTasks || completedTasks.length} tamamlandı
              </Typography>
              {lastUpdate && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Son güncelleme: {format(lastUpdate, 'HH:mm:ss', { locale: tr })}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Görev Durumu Özeti */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Görev Durumu
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.light' }}>
                      <CheckCircleOutlineIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Tamamlanan Görevler" 
                    secondary={`${taskStats?.counts?.completed || completedTasks.length} görev`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <ScheduleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Devam Eden Görevler" 
                    secondary={`${(taskStats?.counts?.in_progress || 0) + (taskStats?.counts?.pending || 0) || pendingTasks.length} görev`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'error.light' }}>
                      <WarningIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Geciken Görevler" 
                    secondary={`${overdueTasks.length} görev`} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Aktif Kullanıcılar */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Aktif Kullanıcılar
              </Typography>
              {activeUsers.length > 0 ? (
                <>
                  <Box display="flex" flexWrap="wrap" mb={1}>
                    {activeUsers.slice(0, 5).map((user) => (
                      <Avatar 
                        key={user.id} 
                        src={userAvatars[(user.id % 10) + 1]} 
                        sx={{ width: 40, height: 40, mr: 1, mb: 1 }}
                      />
                    ))}
                    {activeUsers.length > 5 && (
                      <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                        +{activeUsers.length - 5}
                      </Avatar>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {activeUsers.length} aktif kullanıcı
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Henüz aktif kullanıcı bulunmuyor
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Müşteri Özeti */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Müşteriler
              </Typography>
              {clients.length > 0 ? (
                <>
                  <Typography variant="h4">
                    {clients.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Toplam müşteri
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    Son eklenen: {clients.length > 0 ? clients[clients.length - 1].name : '-'}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Henüz müşteri bulunmuyor
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Son Görevler */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Son Görevler
              </Typography>
              {tasks.length > 0 ? (
                <List>
                  {tasks
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5)
                    .map((task) => {
                      const { name, avatar } = getUserInfo(task.assigned_to);
                      return (
                        <ListItem key={task.id} alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar src={avatar} alt={name}>
                              {name.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={task.title}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {name}
                                </Typography>
                                {` — ${format(parseISO(task.created_at), 'dd MMM yyyy', { locale: tr })}`}
                              </>
                            }
                          />
                          <Chip 
                            label={getTaskStatusText(task.status)} 
                            color={getTaskStatusColor(task.status)} 
                            size="small" 
                          />
                        </ListItem>
                      );
                    })}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Henüz görev bulunmuyor
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Yaklaşan Görevler (Yeni Widget) */}
      <Grid item xs={12} md={6} lg={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ mr: 1 }} /> Yaklaşan Görevler
              {lastUpdate && (
                <Chip 
                  label={`Canlı`} 
                  size="small" 
                  color="success" 
                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                />
              )}
            </Typography>
            {upcomingTasks && upcomingTasks.length > 0 ? (
              <List dense>
                {upcomingTasks.slice(0, 5).map(task => {
                  const userInfo = getUserInfo(task.assigned_to);
                  const dueDate = parseISO(task.due_date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const daysLeft = differenceInDays(dueDate, today);
                  
                  return (
                    <ListItem key={task.id}>
                      <ListItemAvatar>
                        <Avatar src={userInfo.avatar} alt={userInfo.name} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <>
                            {userInfo.name} | Bitiş: {format(dueDate, 'dd MMMM yyyy', { locale: tr })}
                            <Chip 
                              label={daysLeft <= 1 ? 'Bugün' : `${daysLeft} gün kaldı`}
                              size="small"
                              color={daysLeft <= 1 ? 'error' : daysLeft <= 3 ? 'warning' : 'info'}
                              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                            />
                          </>
                        }
                      />
                      <Chip 
                        label={TASK_STATUS_LABELS[task.status] || task.status}
                        size="small"
                        color={getTaskStatusColor(task.status)}
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" minHeight="100px">
                <Typography variant="body2" color="text.secondary">
                  Yaklaşan görev bulunmuyor
                </Typography>
              </Box>
            )}
            {lastUpdate && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                Son güncelleme: {format(lastUpdate, 'HH:mm:ss', { locale: tr })}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Container>
  );
}
