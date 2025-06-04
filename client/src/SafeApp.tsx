import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Typography, Paper, Container, Button, CircularProgress } from '@mui/material';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { lightTheme } from './theme';

// Gerçek sayfaları import ediyoruz - hata yakalama mekanizması ile
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const TasksPage = React.lazy(() => import('./pages/TasksPage'));
const TeamPage = React.lazy(() => import('./pages/TeamPage'));
const ClientsPage = React.lazy(() => import('./pages/ClientsPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

// Basit sayfa bileşeni - yedek olarak
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

// Sayfa yükleme bileşeni
function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
      <Typography variant="h6" sx={{ ml: 2 }}>
        Sayfa yükleniyor...
      </Typography>
    </Box>
  );
}

// Hata sınırı bileşeni
class ErrorBoundary extends React.Component<
  { children: React.ReactNode, fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode, fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Sayfa yüklenirken hata:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Sayfa içerik bileşeni
function PageContent() {
  const location = useLocation();
  
  // Sayfa değiştiğinde hata durumunu sıfırla
  useEffect(() => {
    console.log('Sayfa değişti:', location.pathname);
  }, [location]);

  return (
    <React.Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={
          <ErrorBoundary fallback={<SimplePage title="Dashboard (Hata)" />}>
            <DashboardPage />
          </ErrorBoundary>
        } />
        <Route path="/tasks" element={
          <ErrorBoundary fallback={<SimplePage title="Görevler (Hata)" />}>
            <TasksPage />
          </ErrorBoundary>
        } />
        <Route path="/team" element={
          <ErrorBoundary fallback={<SimplePage title="Ekip (Hata)" />}>
            <TeamPage />
          </ErrorBoundary>
        } />
        <Route path="/clients" element={
          <ErrorBoundary fallback={<SimplePage title="Müşteriler (Hata)" />}>
            <ClientsPage />
          </ErrorBoundary>
        } />
        <Route path="/analytics" element={
          <ErrorBoundary fallback={<SimplePage title="Analitik (Hata)" />}>
            <AnalyticsPage />
          </ErrorBoundary>
        } />
        <Route path="/settings" element={
          <ErrorBoundary fallback={<SimplePage title="Ayarlar (Hata)" />}>
            <SettingsPage />
          </ErrorBoundary>
        } />
      </Routes>
    </React.Suspense>
  );
}

// Ana uygulama bileşeni
function SafeApp() {
  console.log('SafeApp rendering');
  
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <BrowserRouter basename="/erp">
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography variant="h3" gutterBottom>ERP Hybrid</Typography>
          
          {/* Basit Navigasyon */}
          <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
            <Button component={Link} to="/" variant="contained" color="primary">
              Dashboard
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
          <ErrorBoundary fallback={
            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography variant="h4" color="error">Bir Hata Oluştu</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Uygulama yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => window.location.reload()}
              >
                Sayfayı Yenile
              </Button>
            </Paper>
          }>
            <PageContent />
          </ErrorBoundary>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default SafeApp;
