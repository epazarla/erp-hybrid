import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Typography, Button } from '@mui/material';
import { lightTheme } from './theme';
import SafeApp from './SafeApp';
import './index.css';

// Basit bir hata sınırı bileşeni
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uygulama hatası:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
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
          <Typography variant="body1" sx={{ mb: 3, maxWidth: '600px' }}>
            Üzgünüz, uygulamada beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
          >
            Sayfayı Yenile
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Yükleme durumu için basit bir bileşen
function LoadingFallback() {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <Typography>Yükleniyor...</Typography>
    </Box>
  );
}

// Ana uygulama bileşeni
function App() {
  return (
    <React.StrictMode>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <BrowserRouter>
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingFallback />}>
              <SafeApp />
            </React.Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
}

// Uygulamayı başlat
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element bulunamadı');

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
