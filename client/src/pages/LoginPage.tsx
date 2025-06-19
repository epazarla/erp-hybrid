import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Link, 
  Grid, 
  Avatar, 
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Snackbar
} from '@mui/material';
import { 
  Login as LoginIcon, 
  Visibility, 
  VisibilityOff,
  PersonAdd as RegisterIcon,
  Refresh as ResetIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  loadAllUsers,
  loginUser,
  setCurrentUser,
  UserView,
  CURRENT_USER_STORAGE_KEY
} from '../services/UserService';

// Kullanıcı oturumunu temizle
const resetUserSession = () => {
  try {
    // LocalStorage'dan kullanıcı verisini temizle
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Kullanıcı oturumu temizlenirken hata oluştu:', error);
    return false;
  }
};

export default function LoginPage() {
  const navigate = useNavigate();
  
  // Form state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  
  // Kullanıcı zaten giriş yapmışsa dashboard'a yönlendir
  useEffect(() => {
    const currentUser = localStorage.getItem('erp_current_user');
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);
  
  // Giriş işlemi
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // E-posta ve şifre kontrolü
      if (!email.trim()) {
        setError('E-posta adresi gerekli');
        setLoading(false);
        return;
      }
      
      if (!password.trim()) {
        setError('Şifre gerekli');
        setLoading(false);
        return;
      }
      
      // Supabase ile giriş işlemi
      const result = await loginUser(email, password);
      
      if (!result.success) {
        console.log('Giriş başarısız:', result.message);
        setError(result.message || 'Geçersiz e-posta veya şifre');
        setLoading(false);
        return;
      }
      
      // Kullanıcı objesi var mı kontrol et
      if (!result.user) {
        setError('Kullanıcı bilgileri alınamadı');
        setLoading(false);
        return;
      }
      
      // Kullanıcı onaylanmış mı kontrol et
      if (result.user.approvalStatus === 'pending') {
        setError('Hesabınız henüz onaylanmamış. Lütfen yönetici onayını bekleyin.');
        setLoading(false);
        return;
      }
      
      if (result.user.approvalStatus === 'rejected') {
        setError('Hesabınız reddedildi. Lütfen yönetici ile iletişime geçin.');
        setLoading(false);
        return;
      }
      
      // Kullanıcı aktif mi kontrol et
      if (result.user.status === 'inactive') {
        setError('Hesabınız pasif durumda. Lütfen yönetici ile iletişime geçin.');
        setLoading(false);
        return;
      }
      
      // Giriş başarılı, kullanıcı zaten loginUser fonksiyonu içinde ayarlandı
      console.log('Giriş başarılı:', result.user.name);
      
      // Kısa bir gecikme ile dashboard'a yönlendir
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
      
    } catch (error) {
      console.error('Giriş sırasında hata oluştu:', error);
      setError('Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Kullanıcı oturumunu temizle
  const handleResetUserData = async () => {
    const success = await resetUserSession();
    setResetSuccess(success);
    
    if (success) {
      setEmail('');
      setPassword('');
      setError(null);
    }
  };
  
  return (
    <Container component="main" maxWidth="sm" sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center',
      py: 4
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2,
          background: theme => `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: theme => `0 8px 32px -8px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`,
        }}
      >
        <Avatar 
          sx={{ 
            m: 1, 
            bgcolor: 'primary.main',
            width: 56,
            height: 56,
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <LoginIcon />
        </Avatar>
        
        <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
          ERP Hybrid
        </Typography>
        
        <Typography component="h2" variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
          Giriş Yap
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-posta Adresi"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Şifre"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ 
              py: 1.5, 
              mb: 2,
              position: 'relative',
              fontWeight: 'bold',
              fontSize: '1rem',
              borderRadius: 2,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Giriş Yap'
            )}
          </Button>
          
          <Grid container>
            <Grid item xs>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Şifremi Unuttum
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                <RegisterIcon fontSize="small" sx={{ mr: 0.5 }} />
                Hesap Oluştur
              </Link>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ResetIcon />}
              onClick={handleResetUserData}
              size="small"
              sx={{ mt: 1 }}
            >
              Oturumu Temizle
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              Giriş yapamıyorsanız, oturum verilerini temizleyebilirsiniz.
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Sıfırlama başarılı bildirimi */}
      <Snackbar
        open={resetSuccess}
        autoHideDuration={3000}
        onClose={() => setResetSuccess(false)}
        message="Oturum başarıyla temizlendi"
      />
    </Container>
  );
}
