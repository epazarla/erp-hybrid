import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Typography, CircularProgress } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { lightTheme, darkTheme } from './theme';

// Pages
import BasicPage from './pages/BasicPage';
import TasksPage from './pages/TasksPage';
import TeamPage from './pages/TeamPage';
import ClientsPage from './pages/ClientsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Components
import DashboardLayout from './components/layout/DashboardLayout';

// Services
import * as UserService from './services/UserService';

// Korumalı Route bileşeni
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const user = UserService.getCurrentUser();
      if (!user) {
        // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
        navigate('/login', { replace: true, state: { from: location } });
      } else {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate, location]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

// Ana uygulama bileşeni
function AppContent() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    console.log('AppContent useEffect çalışıyor...');
    // Yükleme ekranını göster
    setLoading(true);
    
    try {
      // Mevcut kullanıcıyı al
      const user = UserService.getCurrentUser();
      console.log('Mevcut kullanıcı:', user);
      
      if (user) {
        setCurrentUser(user);
      }
      
      // Kullanıcı giriş yapmamışsa ve korumalı bir sayfada değilse
      if (!user && !isPublicRoute(location.pathname)) {
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Kullanıcı yüklenirken hata:', error);
    } finally {
      // Yükleme tamamlandı
      setLoading(false);
    }
  }, [navigate, location]);
  
  // Genel erişime açık rotaları kontrol et
  const isPublicRoute = (path: string) => {
    return path === '/login' || path === '/register' || path === '/forgot-password';
  };

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

  // Kullanıcı giriş yapmamışsa ve genel erişime açık bir sayfada değilse
  if (!currentUser && !isPublicRoute(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  // Kullanıcı giriş yapmışsa ve giriş/kayıt sayfalarındaysa dashboard'a yönlendir
  if (currentUser && isPublicRoute(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  console.log('AppContent rendering');
  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      {currentUser ? (
        // Kullanıcı giriş yapmışsa dashboard layout'u göster
        <DashboardLayout 
          user={currentUser}
          onLogout={handleLogout}
          onPageChange={handlePageChange}
          onThemeToggle={handleThemeToggle}
          darkMode={darkMode}
          currentPath={location.pathname}
        >
          <Routes>
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <BasicPage />
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute>
                <TeamPage />
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute>
                <ClientsPage />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DashboardLayout>
      ) : (
        // Kullanıcı giriş yapmamışsa sadece giriş ve kayıt sayfalarını göster
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </ThemeProvider>
  );
}

// Ana uygulama bileşeni
function App() {
  console.log('App component rendering');
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );

}

export default App;
