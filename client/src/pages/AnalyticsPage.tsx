import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

// Servisler
import { getAllTasks, TASKS_UPDATED_EVENT } from '../services/TaskService';
import { getActiveUsers, USERS_UPDATED_EVENT } from '../services/UserService';
import { getAllClients, CLIENTS_UPDATED_EVENT } from '../services/ClientService';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  RadialLinearScale
);

// Zaman aralığı tipi
type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [department, setDepartment] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  // Veri state'leri
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  // Grafik verileri
  const [taskCompletionData, setTaskCompletionData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: 'Tamamlanan Görevler',
        data: [],
        backgroundColor: '#4caf50',
        borderColor: '#4caf50',
      },
      {
        label: 'Yeni Görevler',
        data: [],
        backgroundColor: '#2196f3',
        borderColor: '#2196f3',
      },
    ],
  });
  
  const [clientDistributionData, setClientDistributionData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: 'Müşteri Dağılımı',
        data: [],
        backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336'],
        borderWidth: 0,
      },
    ],
  });
  
  const [teamPerformanceData, setTeamPerformanceData] = useState<any>({
    labels: ['Görev Tamamlama', 'Zamanında Teslim', 'Müşteri Memnuniyeti', 'İşbirliği', 'Yenilikçilik'],
    datasets: [],
  });
  
  // Zaman aralığını değiştir
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };
  
  // Departman değiştir
  const handleDepartmentChange = (event: SelectChangeEvent) => {
    setDepartment(event.target.value);
  };
  
  // Verileri yükle
  useEffect(() => {
    loadData();
    
    // Event listener'ları ekle
    window.addEventListener(TASKS_UPDATED_EVENT, loadData);
    window.addEventListener(USERS_UPDATED_EVENT, loadData);
    window.addEventListener(CLIENTS_UPDATED_EVENT, loadData);
    
    return () => {
      // Event listener'ları kaldır
      window.removeEventListener(TASKS_UPDATED_EVENT, loadData);
      window.removeEventListener(USERS_UPDATED_EVENT, loadData);
      window.removeEventListener(CLIENTS_UPDATED_EVENT, loadData);
    };
  }, []);
  
  // Zaman aralığı değiştiğinde grafik verilerini güncelle
  useEffect(() => {
    if (tasks.length > 0) {
      generateTaskCompletionData(tasks);
    }
  }, [timeRange, tasks]);
  
  // Departman değiştiğinde müşteri dağılımı ve ekip performansı verilerini güncelle
  useEffect(() => {
    if (clients.length > 0 && tasks.length > 0 && users.length > 0) {
      generateClientDistributionData(clients);
      generateTeamPerformanceData(tasks, users);
    }
  }, [department, clients, tasks, users]);
  
  // Tüm verileri yükle
  const loadData = async () => {
    try {
      setLoading(true);
      
      const [allTasks, activeUsers, allClients] = await Promise.all([
        getAllTasks(),
        getActiveUsers(),
        getAllClients(true) // Sadece aktif müşteriler
      ]);
      
      setTasks(allTasks);
      setUsers(activeUsers);
      setClients(allClients);
      
      // Özet metrikleri hesapla
      calculateSummaryMetrics(allTasks, allClients);
      
      // Grafik verilerini oluştur - useEffect'ler tarafından da tetiklenecek
      generateTaskCompletionData(allTasks);
      generateClientDistributionData(allClients);
      generateTeamPerformanceData(allTasks, activeUsers);
      
    } catch (error) {
      console.error('Analitik verileri yüklenirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Özet metrikleri hesapla
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [newTasksCount, setNewTasksCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [completedTasksChange, setCompletedTasksChange] = useState(0);
  const [newTasksChange, setNewTasksChange] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);
  
  const calculateSummaryMetrics = (taskList: any[], clientsList: any[]) => {
    // Son 7 gün içinde tamamlanan görevleri hesapla
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    // Son 7 gün içinde tamamlanan görevler
    const lastWeekCompletedTasks = taskList.filter(task => 
      task.status === 'Tamamlandı' && 
      new Date(task.due_date) >= oneWeekAgo && 
      new Date(task.due_date) <= now
    ).length;
    
    // Önceki 7 gün içinde tamamlanan görevler
    const previousWeekCompletedTasks = taskList.filter(task => 
      task.status === 'Tamamlandı' && 
      new Date(task.due_date) >= twoWeeksAgo && 
      new Date(task.due_date) < oneWeekAgo
    ).length;
    
    // Son 7 gün içinde oluşturulan görevler
    const lastWeekNewTasks = taskList.filter(task => 
      new Date(task.created_at) >= oneWeekAgo && 
      new Date(task.created_at) <= now
    ).length;
    
    // Önceki 7 gün içinde oluşturulan görevler
    const previousWeekNewTasks = taskList.filter(task => 
      new Date(task.created_at) >= twoWeeksAgo && 
      new Date(task.created_at) < oneWeekAgo
    ).length;
    
    // Toplam gelir (ödemesi yapılmış müşterilerden)
    const currentRevenue = clientsList
      .filter(client => client.paymentStatus === 'paid')
      .reduce((sum, client) => sum + (client.monthlyIncome || 0), 0);
    
    // Değişim oranlarını hesapla
    const completedChange = previousWeekCompletedTasks > 0 
      ? Math.round(((lastWeekCompletedTasks - previousWeekCompletedTasks) / previousWeekCompletedTasks) * 100) 
      : 0;
    
    const newTasksChangeRate = previousWeekNewTasks > 0 
      ? Math.round(((lastWeekNewTasks - previousWeekNewTasks) / previousWeekNewTasks) * 100) 
      : 0;
    
    // Gelir değişimi (örnek değer, gerçek hesaplama için geçmiş veriler gerekli)
    const revenueChangeRate = 8; // Örnek değer
    
    // State'leri güncelle
    setCompletedTasksCount(lastWeekCompletedTasks);
    setNewTasksCount(lastWeekNewTasks);
    setTotalRevenue(currentRevenue);
    setCompletedTasksChange(completedChange);
    setNewTasksChange(newTasksChangeRate);
    setRevenueChange(revenueChangeRate);
  };
  
  // Görev tamamlama verilerini oluştur
  const generateTaskCompletionData = (taskList: any[]) => {
    if (!taskList.length) return;
    
    // Zaman aralığına göre verileri hazırla
    const now = new Date();
    let labels: string[] = [];
    let completedTasks: number[] = [];
    let newTasks: number[] = [];
    
    // Günleri Pazartesi'den Pazar'a sırala
    const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    
    switch (timeRange) {
      case 'week':
        // Son 7 gün için günlük veriler
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          
          // Gün adını al
          const dayIndex = date.getDay() - 1; // 0 = Pazar, 1 = Pazartesi, ...
          const dayName = dayNames[dayIndex < 0 ? 6 : dayIndex]; // Pazar günü için düzeltme
          labels.push(dayName);
          
          // O gün tamamlanan görevleri say
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);
          
          const dayCompletedTasks = taskList.filter(task => 
            task.status === 'Tamamlandı' && 
            new Date(task.due_date) >= dayStart && 
            new Date(task.due_date) <= dayEnd
          ).length;
          
          const dayNewTasks = taskList.filter(task => 
            new Date(task.created_at) >= dayStart && 
            new Date(task.created_at) <= dayEnd
          ).length;
          
          completedTasks.push(dayCompletedTasks);
          newTasks.push(dayNewTasks);
        }
        break;
        
      case 'month':
        // Son 4 hafta için haftalık veriler
        for (let i = 4; i >= 1; i--) {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (i * 7));
          const weekEnd = new Date(now);
          weekEnd.setDate(now.getDate() - ((i-1) * 7 - 1));
          
          labels.push(`Hafta ${5-i}`);
          
          const weekCompletedTasks = taskList.filter(task => 
            task.status === 'Tamamlandı' && 
            new Date(task.due_date) >= weekStart && 
            new Date(task.due_date) <= weekEnd
          ).length;
          
          const weekNewTasks = taskList.filter(task => 
            new Date(task.created_at) >= weekStart && 
            new Date(task.created_at) <= weekEnd
          ).length;
          
          completedTasks.push(weekCompletedTasks);
          newTasks.push(weekNewTasks);
        }
        break;
        
      case 'quarter':
        // Son 3 ay için aylık veriler
        const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        
        for (let i = 2; i >= 0; i--) {
          const monthDate = new Date(now);
          monthDate.setMonth(now.getMonth() - i);
          
          const monthName = monthNames[monthDate.getMonth()];
          labels.push(monthName);
          
          const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
          const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
          
          const monthCompletedTasks = taskList.filter(task => 
            task.status === 'Tamamlandı' && 
            new Date(task.due_date) >= monthStart && 
            new Date(task.due_date) <= monthEnd
          ).length;
          
          const monthNewTasks = taskList.filter(task => 
            new Date(task.created_at) >= monthStart && 
            new Date(task.created_at) <= monthEnd
          ).length;
          
          completedTasks.push(monthCompletedTasks);
          newTasks.push(monthNewTasks);
        }
        break;
        
      case 'year':
        // Son 4 çeyrek için çeyreklik veriler
        for (let i = 3; i >= 0; i--) {
          const quarterDate = new Date(now);
          quarterDate.setMonth(now.getMonth() - (i * 3));
          
          labels.push(`${i + 1}. Çeyrek`);
          
          const quarterStart = new Date(now);
          quarterStart.setMonth(now.getMonth() - ((i+1) * 3));
          const quarterEnd = new Date(now);
          quarterEnd.setMonth(now.getMonth() - (i * 3));
          
          const quarterCompletedTasks = taskList.filter(task => 
            task.status === 'Tamamlandı' && 
            new Date(task.due_date) >= quarterStart && 
            new Date(task.due_date) <= quarterEnd
          ).length;
          
          const quarterNewTasks = taskList.filter(task => 
            new Date(task.created_at) >= quarterStart && 
            new Date(task.created_at) <= quarterEnd
          ).length;
          
          completedTasks.push(quarterCompletedTasks);
          newTasks.push(quarterNewTasks);
        }
        break;
    }
    
    setTaskCompletionData({
      labels,
      datasets: [
        {
          label: 'Tamamlanan Görevler',
          data: completedTasks,
          backgroundColor: '#4caf50',
          borderColor: '#4caf50',
        },
        {
          label: 'Yeni Görevler',
          data: newTasks,
          backgroundColor: '#2196f3',
          borderColor: '#2196f3',
        },
      ],
    });
  };
  
  // Müşteri dağılımı verilerini oluştur
  const generateClientDistributionData = (clientsList: any[]) => {
    if (!clientsList.length) return;
    
    // İlgili görevleri al
    let relevantClients = [...clientsList];
    
    // Departman filtresine göre müşterileri filtrele
    if (department !== 'all' && tasks.length > 0 && users.length > 0) {
      // Departmandaki kullanıcıları al
      const deptUsers = users.filter(user => user.department === department);
      const deptUserIds = deptUsers.map(user => user.id);
      
      // Bu kullanıcıların görevlerini al
      const deptTasks = tasks.filter(task => deptUserIds.includes(task.assigned_to));
      
      // Görevlerin ait olduğu müşteri kategorilerini bul
      const clientCategories = new Set<string>();
      deptTasks.forEach(task => {
        if (task.category) {
          clientCategories.add(task.category);
        }
      });
      
      // Sadece bu kategorilere ait müşterileri filtrele
      relevantClients = clientsList.filter(client => 
        clientCategories.has(client.name) || clientCategories.has(client.id)
      );
      
      // Eğer filtreleme sonucu müşteri kalmadıysa, tüm müşterileri kullan
      if (relevantClients.length === 0) {
        relevantClients = [...clientsList];
      }
    }
    
    // Sektörlere göre müşteri sayılarını hesapla
    const sectorCounts: { [key: string]: number } = {};
    
    relevantClients.forEach(client => {
      if (client.sector) {
        sectorCounts[client.sector] = (sectorCounts[client.sector] || 0) + 1;
      }
    });
    
    // Sektör sayısı yoksa boş veri dön
    if (Object.keys(sectorCounts).length === 0) {
      setClientDistributionData({
        labels: [],
        datasets: [{
          label: 'Müşteri Dağılımı',
          data: [],
          backgroundColor: [],
          borderWidth: 0,
        }]
      });
      return;
    }
    
    // En çok müşterisi olan ilk 5 sektörü al
    const topSectors = Object.entries(sectorCounts)
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 5);
    
    const labels = topSectors.map(([sector]) => sector);
    const data = topSectors.map(([, count]) => count);
    
    // Sektör renklerini belirle
    const colors = [
      '#4caf50', // Yeşil
      '#2196f3', // Mavi
      '#ff9800', // Turuncu
      '#9c27b0', // Mor
      '#f44336'  // Kırmızı
    ];
    
    setClientDistributionData({
      labels,
      datasets: [
        {
          label: 'Müşteri Dağılımı',
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
        },
      ],
    });
  };
  
  // Ekip performans verilerini oluştur
  const generateTeamPerformanceData = (taskList: any[], userList: any[]) => {
    if (!taskList.length || !userList.length) return;
    
    // Departmanları belirle
    let departments: string[] = [];
    
    if (department === 'all') {
      // Tüm departmanları al (boş olmayanlar)
      departments = [...new Set(userList.map(user => user.department).filter(Boolean))];
    } else {
      // Sadece seçilen departmanı al
      departments = [department];
    }
    
    // En fazla 5 departman göster
    if (departments.length > 5) {
      departments = departments.slice(0, 5);
    }
    
    // Departman yoksa boş veri dön
    if (departments.length === 0) {
      setTeamPerformanceData({
        labels: ['Görev Tamamlama', 'Zamanında Teslim', 'Müşteri Memnuniyeti', 'İşbirliği', 'Yenilikçilik'],
        datasets: []
      });
      return;
    }
    
    // Renk paleti
    const colors = [
      { bg: 'rgba(33, 150, 243, 0.2)', border: 'rgba(33, 150, 243, 1)' }, // Mavi
      { bg: 'rgba(76, 175, 80, 0.2)', border: 'rgba(76, 175, 80, 1)' },    // Yeşil
      { bg: 'rgba(156, 39, 176, 0.2)', border: 'rgba(156, 39, 176, 1)' },  // Mor
      { bg: 'rgba(255, 152, 0, 0.2)', border: 'rgba(255, 152, 0, 1)' },    // Turuncu
      { bg: 'rgba(244, 67, 54, 0.2)', border: 'rgba(244, 67, 54, 1)' }     // Kırmızı
    ];
    
    // Her departman için performans verilerini hesapla
    const datasets = departments.map((dept, index) => {
      // Departmandaki kullanıcıları al
      const deptUsers = userList.filter(user => user.department === dept);
      const deptUserIds = deptUsers.map(user => user.id);
      
      // Departman görevlerini al
      const deptTasks = taskList.filter(task => deptUserIds.includes(task.assigned_to));
      
      // Görev yoksa varsayılan değerler kullan
      if (deptTasks.length === 0) {
        return {
          label: `${dept} Ekibi`,
          data: [0, 0, 0, 0, 0],
          backgroundColor: colors[index % colors.length].bg,
          borderColor: colors[index % colors.length].border,
          pointBackgroundColor: colors[index % colors.length].border,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: colors[index % colors.length].border,
        };
      }
      
      // Görev tamamlama oranı (tamamlanan görev / toplam görev)
      const completionRate = deptTasks.length > 0
        ? (deptTasks.filter(task => task.status === 'Tamamlandı').length / deptTasks.length) * 100
        : 0;
      
      // Zamanında teslim oranı (zamanında tamamlanan görev / tamamlanan görev)
      const completedTasks = deptTasks.filter(task => task.status === 'Tamamlandı');
      const onTimeDeliveryRate = completedTasks.length > 0
        ? (completedTasks.filter(task => 
            new Date(task.due_date) >= new Date(task.created_at)
          ).length / completedTasks.length) * 100
        : 0;
      
      // Müşteri memnuniyeti (hesaplanamadığı için görev tamamlama oranına bağlı bir tahmin)
      const customerSatisfaction = Math.min(100, 50 + completionRate * 0.3 + onTimeDeliveryRate * 0.2);
      
      // İşbirliği (aynı müşteri için çalışan kullanıcı sayısına bağlı bir tahmin)
      const clientCategories = new Set(deptTasks.map(task => task.category).filter(Boolean));
      const usersPerClient = Array.from(clientCategories).map(category => {
        const categoryTasks = deptTasks.filter(task => task.category === category);
        return new Set(categoryTasks.map(task => task.assigned_to)).size;
      });
      
      const avgUsersPerClient = usersPerClient.length > 0
        ? usersPerClient.reduce((sum, count) => sum + count, 0) / usersPerClient.length
        : 0;
      
      const collaboration = Math.min(100, 40 + (avgUsersPerClient * 15));
      
      // Yenilikçilik (son 30 günde oluşturulan görev oranı)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const recentTasks = deptTasks.filter(task => 
        new Date(task.created_at) >= thirtyDaysAgo
      ).length;
      
      const innovation = deptTasks.length > 0
        ? Math.min(100, (recentTasks / deptTasks.length) * 100 + 40)
        : 50; // Varsayılan değer
      
      // Renk belirle
      const colorIndex = index % colors.length;
      
      return {
        label: `${dept} Ekibi`,
        data: [
          Math.round(completionRate),
          Math.round(onTimeDeliveryRate),
          Math.round(customerSatisfaction),
          Math.round(collaboration),
          Math.round(innovation)
        ],
        backgroundColor: colors[colorIndex].bg,
        borderColor: colors[colorIndex].border,
        pointBackgroundColor: colors[colorIndex].border,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors[colorIndex].border,
      };
    });
    
    setTeamPerformanceData({
      labels: ['Görev Tamamlama', 'Zamanında Teslim', 'Müşteri Memnuniyeti', 'İşbirliği', 'Yenilikçilik'],
      datasets
    });
  };
  
  // Grafik seçenekleri
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  };
  
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    cutout: '70%',
  };
  
  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    }
  };
  
  // Departman filtreleme seçenekleri
  const departmentOptions = [
    { value: 'all', label: 'Tümü' },
    { value: 'marketing', label: 'Pazarlama' },
    { value: 'sales', label: 'Satış' },
    { value: 'development', label: 'Yazılım Geliştirme' },
    { value: 'design', label: 'Tasarım' },
    { value: 'support', label: 'Müşteri Desteği' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analitik Paneli
      </Typography>
      
      {/* Filtreler */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>Zaman Aralığı</Typography>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(e, newValue) => newValue && handleTimeRangeChange(newValue)}
            size="small"
            aria-label="zaman aralığı"
          >
            <ToggleButton value="week" aria-label="haftalık">
              Haftalık
            </ToggleButton>
            <ToggleButton value="month" aria-label="aylık">
              Aylık
            </ToggleButton>
            <ToggleButton value="quarter" aria-label="çeyrek">
              Çeyrek
            </ToggleButton>
            <ToggleButton value="year" aria-label="yıllık">
              Yıllık
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="subtitle2" gutterBottom>Departman</Typography>
          <FormControl fullWidth size="small">
            <Select
              value={department}
              onChange={handleDepartmentChange}
              displayEmpty
            >
              {departmentOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <Typography>Veriler yükleniyor...</Typography>
        </Box>
      ) : (
        <>
          {/* Performans Metrikleri */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Tamamlanan Görevler</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4">{completedTasksCount}</Typography>
                    <Chip 
                      icon={completedTasksChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      label={`${Math.abs(completedTasksChange)}%`}
                      color={completedTasksChange >= 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {completedTasksChange >= 0 ? 'Artış' : 'Azalış'} bir önceki döneme göre
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Yeni Görevler</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4">{newTasksCount}</Typography>
                    <Chip 
                      icon={newTasksChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      label={`${Math.abs(newTasksChange)}%`}
                      color={newTasksChange >= 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {newTasksChange >= 0 ? 'Artış' : 'Azalış'} bir önceki döneme göre
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Toplam Gelir</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4">{totalRevenue.toLocaleString('tr-TR')} ₺</Typography>
                    <Chip 
                      icon={revenueChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      label={`${Math.abs(revenueChange)}%`}
                      color={revenueChange >= 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {revenueChange >= 0 ? 'Artış' : 'Azalış'} bir önceki döneme göre
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Görev Tamamlama ve Yeni Görevler Grafiği */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader title="Görev Tamamlama Analizi" />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    {taskCompletionData.labels.length > 0 ? (
                      <Bar data={taskCompletionData} options={barOptions} />
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography variant="subtitle1" color="text.secondary">Henüz veri bulunmuyor</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Müşteri Sektör Dağılımı" />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {clientDistributionData.labels.length > 0 ? (
                      <Doughnut data={clientDistributionData} options={doughnutOptions} />
                    ) : (
                      <Typography variant="subtitle1" color="text.secondary">Henüz veri bulunmuyor</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Ekip Performansı */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Ekip Performans Analizi" />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {teamPerformanceData.datasets.length > 0 ? (
                      <Radar data={teamPerformanceData} options={radarOptions} />
                    ) : (
                      <Typography variant="subtitle1" color="text.secondary">Henüz veri bulunmuyor</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}