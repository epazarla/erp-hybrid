import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Typography, CircularProgress } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { lightTheme, darkTheme } from './theme';

// Pages
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import TeamPage from './pages/TeamPage';
import ClientsPage from './pages/ClientsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

// Components
import DashboardLayout from './components/layout/DashboardLayout';

// Services
import * as UserService from './services/UserService';

// Ana uygulama bileşeni
function AppContent() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Kullanıcı bilgilerini yükle - performans için optimize edilmiş
  useEffect(() => {
    console.log('EnhancedApp useEffect çalışıyor...');
    
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
      console.log('EnhancedApp useEffect temizleniyor...');
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

  console.log('EnhancedApp rendering with DashboardLayout');
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
          <Route path="/dashboard" element={<DashboardPage />} />
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
function EnhancedApp() {
  console.log('EnhancedApp component rendering');
  
  // Hata yakalama için try-catch bloğu
  try {
    return (
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    );
  } catch (error) {
    console.error('EnhancedApp render hatası:', error);
    
    // Hata durumunda basit bir hata sayfası göster
    return (
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h4" color="error" gutterBottom>
            Bir hata oluştu
          </Typography>
          <Typography variant="body1">
            Uygulama yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <button onClick={() => window.location.reload()}>
              Sayfayı Yenile
            </button>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }
}

export default EnhancedApp;
