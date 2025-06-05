import React, { useState, useEffect, Suspense } from 'react';
import { 
  ThemeProvider, 
  CssBaseline, 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Container, 
  Paper,
  createTheme
} from '@mui/material';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Basit bir tema oluşturuyoruz
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
});

// Hata sınırı bileşeni
type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class AppErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component Hatası:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          p: 3,
          textAlign: 'center'
        }}>
          <Typography variant="h4" color="error" gutterBottom>
            Bir Hata Oluştu
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            {this.state.error?.message || 'Beklenmeyen bir hata oluştu.'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', maxWidth: '600px' }}>
            Lütfen sayfayı yenileyip tekrar deneyin. Sorun devam ederse, lütfen yöneticinizle iletişime geçin.
          </Typography>
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

    return this.props.children;
  }
}

// Yükleme bileşeni
const LoadingFallback = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh',
    flexDirection: 'column',
    gap: 2
  }}>
    <CircularProgress />
    <Typography variant="body1" color="text.secondary">
      Yükleniyor...
    </Typography>
  </Box>
);

// Gerçek sayfaları import ediyoruz - hata yakalama mekanizması ile
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const TasksPage = React.lazy(() => import('./pages/TasksPage'));
const TeamPage = React.lazy(() => import('./pages/TeamPage'));
const ClientsPage = React.lazy(() => import('./pages/ClientsPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

// Ana uygulama bileşeni
function SafeApp() {
  const [appState, setAppState] = useState<{
    loading: boolean;
    error: string | null;
    initialized: boolean;
  }>({
    loading: true,
    error: null,
    initialized: false
  });

  // Uygulama başlatma işlemleri
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Uygulama başlatılıyor...');
        
        // API sağlık kontrolü yapılabilir
        // const healthCheck = await fetch('/api/health');
        // if (!healthCheck.ok) throw new Error('API bağlantı hatası');
        
        // Kullanıcı oturum kontrolü yapılabilir
        // const user = await checkAuth();
        
        setAppState({ loading: false, error: null, initialized: true });
      } catch (err) {
        console.error('Uygulama başlatma hatası:', err);
        setAppState({
          loading: false,
          error: 'Uygulama başlatılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
          initialized: false
        });
      }
    };

    initializeApp();
  }, []);

  // Yükleniyor durumu
  if (appState.loading) {
    return <LoadingFallback />;
  }

  // Hata durumu
  if (appState.error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" color="error" gutterBottom>
              Uygulama Yüklenemedi
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {appState.error}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Detay: {appState.error}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.reload()}
              size="large"
              sx={{ mt: 2 }}
            >
              Yeniden Dene
            </Button>
          </Paper>
        </Container>
      </ThemeProvider>
    );
  }

  // Uygulama içeriği
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Container maxWidth="lg">
          <AppErrorBoundary 
            fallback={
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h5" color="error" gutterBottom>
                  Kritik Hata
                </Typography>
                <Typography paragraph>
                  Uygulamada kritik bir hata oluştu. Lütfen sayfayı yenileyin.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => window.location.reload()}
                >
                  Sayfayı Yenile
                </Button>
              </Box>
            }
          >
            <Box sx={{ my: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                ERP Uygulaması
              </Typography>
              
              {/* Navigasyon */}
              <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button component={Link} to="/" variant="contained">
                  Ana Sayfa
                </Button>
                <Button component={Link} to="/tasks" variant="contained">
                  Görevler
                </Button>
                <Button component={Link} to="/team" variant="contained">
                  Ekip
                </Button>
                <Button component={Link} to="/clients" variant="contained">
                  Müşteriler
                </Button>
                <Button component={Link} to="/analytics" variant="contained">
                  Analitik
                </Button>
                <Button component={Link} to="/settings" variant="contained">
                  Ayarlar
                </Button>
              </Box>
              
              {/* İçerik */}
              <AppErrorBoundary 
                fallback={
                  <Paper elevation={3} sx={{ p: 3, mt: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="error" gutterBottom>
                      Sayfa Yüklenirken Hata Oluştu
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      Üzgünüz, bu sayfa yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => window.location.reload()}
                    >
                      Sayfayı Yenile
                    </Button>
                  </Paper>
                }
              >
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/clients" element={<ClientsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route 
                      path="*" 
                      element={
                        <Typography variant="h5" sx={{ my: 4, textAlign: 'center' }}>
                          404 - Sayfa Bulunamadı
                        </Typography>
                      } 
                    />
                  </Routes>
                </Suspense>
              </AppErrorBoundary>
            </Box>
          </AppErrorBoundary>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default SafeApp;
