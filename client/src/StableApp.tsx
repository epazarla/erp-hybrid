import React from 'react';
import { ThemeProvider, CssBaseline, Box, Typography, Paper, Container } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lightTheme } from './theme';

// Basit sayfa bileşeni
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

// Dashboard sayfası
function DashboardPage() {
  return <SimplePage title="Dashboard" />;
}

// Görevler sayfası
function TasksPage() {
  return <SimplePage title="Görevler" />;
}

// Ekip sayfası
function TeamPage() {
  return <SimplePage title="Ekip" />;
}

// Müşteriler sayfası
function ClientsPage() {
  return <SimplePage title="Müşteriler" />;
}

// Analitik sayfası
function AnalyticsPage() {
  return <SimplePage title="Analitik" />;
}

// Ayarlar sayfası
function SettingsPage() {
  return <SimplePage title="Ayarlar" />;
}

// Ana uygulama bileşeni
function StableApp() {
  console.log('StableApp rendering');
  
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography variant="h3" gutterBottom>ERP Hybrid</Typography>
          
          {/* Basit Navigasyon */}
          <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
            <Typography component="a" href="/" variant="button" sx={{ textDecoration: 'none' }}>
              Dashboard
            </Typography>
            <Typography component="a" href="/tasks" variant="button" sx={{ textDecoration: 'none' }}>
              Görevler
            </Typography>
            <Typography component="a" href="/team" variant="button" sx={{ textDecoration: 'none' }}>
              Ekip
            </Typography>
            <Typography component="a" href="/clients" variant="button" sx={{ textDecoration: 'none' }}>
              Müşteriler
            </Typography>
            <Typography component="a" href="/analytics" variant="button" sx={{ textDecoration: 'none' }}>
              Analitik
            </Typography>
            <Typography component="a" href="/settings" variant="button" sx={{ textDecoration: 'none' }}>
              Ayarlar
            </Typography>
          </Box>
          
          {/* İçerik */}
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default StableApp;
