import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Typography, CircularProgress, Paper } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { lightTheme, darkTheme } from './theme';

// Pages
import TasksPage from './pages/TasksPage';
import TeamPage from './pages/TeamPage';
import ClientsPage from './pages/ClientsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

// Components
import DashboardLayout from './components/layout/DashboardLayout';

// Services
import * as UserService from './services/UserService';

// Simple Pages
function SimplePage({ title }: { title: string }) {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">{title}</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Bu basit bir sayfa. Beyaz ekran sorununu çözmek için oluşturulmuştur.
        </Typography>
      </Paper>
    </Box>
  );
}

// Ana uygulama bileşeni
function AppContent() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Kullanıcı bilgilerini yükle - performans için optimize edilmiş
  useEffect(() => {
    console.log('SimpleApp useEffect çalışıyor...');
    
    // Asenkron olarak kullanıcı bilgilerini yükle
    const loadUser = async () => {
      try {
        // Mevcut kullanıcıyı al
        const user = UserService.getCurrentUser();
        console.log('Mevcut kullanıcı:', user);
        
        // Kullanıcı yoksa demo kullanıcı oluştur
        if (!user) {
          const demoUser = {
            id: 1,
            name: 'İsmail Admin',
            email: 'ismail@admin.com',
            role: 'Admin',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
          };
          console.log('Demo kullanıcı oluşturuluyor:', demoUser);
          UserService.setCurrentUser(demoUser);
          setCurrentUser(demoUser);
        } else {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Kullanıcı yüklenirken hata:', error);
      } finally {
        // Yükleme tamamlandı
        setLoading(false);
      }
    };
    
    loadUser();
    
    // Temizleme fonksiyonu
    return () => {
      console.log('SimpleApp useEffect temizleniyor...');
    };
  }, []);

  // Oturum kapatma işlemi
  const handleLogout = () => {
    UserService.setCurrentUser(null);
    setCurrentUser(null);
    navigate('/login', { replace: true });
  };

  // Sayfa değiştirme işlemi
  const handlePageChange = (page: string) => {
    navigate(page);
  };

  // Tema değiştirme işlemi
  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  // Yükleniyor durumu
  if (loading) {
    return (
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            ERP Hybrid yükleniyor...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  console.log('SimpleApp rendering with DashboardLayout');
  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <DashboardLayout 
        user={currentUser}
        onLogout={handleLogout}
        onPageChange={handlePageChange}
        onThemeToggle={handleThemeToggle}
        darkMode={darkMode}
        currentPath={location.pathname}
      >
        <Routes>
          <Route path="/dashboard" element={<SimplePage title="Dashboard" />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DashboardLayout>
    </ThemeProvider>
  );
}

// Ana uygulama bileşeni
function SimpleApp() {
  console.log('SimpleApp component rendering');
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default SimpleApp;
