import React, { useState, useEffect, ErrorInfo, ReactNode } from 'react';
import { ThemeProvider, CssBaseline, Box, Typography, CircularProgress, Button, Alert, Paper } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { lightTheme, darkTheme } from './theme';
import { testSupabaseConnection } from './lib/supabase';

// Pages
import BasicPage from './pages/BasicPage';
import TasksPage from './pages/TasksPage';
import TeamPage from './pages/TeamPage';
import ClientsPage from './pages/ClientsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';

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

// Hata sınırı bileşeni
class ErrorBoundary extends React.Component<{children: ReactNode}, {hasError: boolean; error: Error | null; info: ErrorInfo | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Hata durumunda state'i güncelle
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hata bilgilerini logla
    console.error('Uygulama hatası:', error);
    console.error('Bileşen yığın izleme:', info.componentStack);
    this.setState({ info });
  }

  handleRetry = () => {
    // Sayfayı yeniden yükle
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      // Hata durumunda kullanıcı dostu bir arayüz göster
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', p: 3 }}>
          <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%', textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              Sayfa Yüklenirken Hata Oluştu
            </Typography>
            <Typography variant="body1" sx={{ my: 2 }}>
              Üzünüz, bu sayfa yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
            </Typography>
            <Alert severity="error" sx={{ my: 2, textAlign: 'left' }}>
              {this.state.error?.message || 'Bilinmeyen hata'}
            </Alert>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={this.handleRetry}
              sx={{ mt: 2 }}
            >
              SAYFAYI YENİLE
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Ana uygulama bileşeni
function AppContent() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    console.log('AppContent useEffect çalışıyor...');
    // Yükleme ekranını göster
    setLoading(true);
    
    // Supabase bağlantısını kontrol et
    const checkSupabaseConnection = async () => {
      try {
        const isConnected = await testSupabaseConnection();
        setSupabaseConnected(isConnected);
        
        if (!isConnected) {
          console.error('Supabase bağlantısı başarısız. Veriler yüklenemeyebilir.');
          throw new Error('Veritabanı bağlantısı sağlanamıyor. Lütfen daha sonra tekrar deneyin.');
        }
      } catch (error) {
        console.error('Supabase bağlantı kontrolü sırasında hata:', error);
        setSupabaseConnected(false);
      }
    };
    
    // Kullanıcı bilgilerini yükle
    const loadUser = async () => {
      try {
        await checkSupabaseConnection();
        const user = UserService.getCurrentUser();
        setCurrentUser(user);
        
        // Kullanıcı giriş yapmamışsa ve korumalı bir sayfada değilse
        if (!user && !isPublicRoute(location.pathname)) {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Tema tercihini localStorage'dan al
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(savedTheme === 'true');
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
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPage />
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
export default function App() {
  console.log('App component rendering');
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
