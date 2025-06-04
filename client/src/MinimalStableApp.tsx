import React, { Suspense } from 'react';
import { ThemeProvider, CssBaseline, Box, Typography, Paper, Container, Button, CircularProgress } from '@mui/material';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { lightTheme } from './theme';

// Gerçek sayfaları import ediyoruz
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import TeamPage from './pages/TeamPage';
import ClientsPage from './pages/ClientsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

// Basit sayfa bileşeni - hiçbir state veya karmaşık kod içermiyor
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

// Ana uygulama bileşeni - tamamen statik ve minimal
function MinimalStableApp() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <BrowserRouter>
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
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/clients" element={
              <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}>
                <ClientsPage />
              </Suspense>
            } />
            <Route path="/analytics" element={
              <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}>
                <AnalyticsPage />
              </Suspense>
            } />
            <Route path="/settings" element={
              <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}>
                <SettingsPage />
              </Suspense>
            } />
          </Routes>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default MinimalStableApp;
