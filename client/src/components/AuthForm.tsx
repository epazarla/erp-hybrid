import React, { useState, useEffect } from 'react';
import { 
  registerUser, 
  loginUser,
  USER_STATUS, 
  USER_ROLE,
  User,
  CURRENT_USER_STORAGE_KEY
} from '../services/UserService';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Alert, 
  Paper, 
  CircularProgress, 
  Container,
  Grid,
  Divider,
  SelectChangeEvent
} from '@mui/material';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: USER_ROLE.EMPLOYEE,
    department: 'Genel',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Departman listesi
  const departments = [
    { value: 'Yönetim', label: 'Yönetim' },
    { value: 'İnsan Kaynakları', label: 'İnsan Kaynakları' },
    { value: 'Finans', label: 'Finans' },
    { value: 'Pazarlama', label: 'Pazarlama' },
    { value: 'Satış', label: 'Satış' },
    { value: 'Yazılım', label: 'Yazılım' },
    { value: 'Tasarım', label: 'Tasarım' },
    { value: 'Müşteri Hizmetleri', label: 'Müşteri Hizmetleri' },
    { value: 'Genel', label: 'Genel' },
  ];

  // Rol listesi
  const roles = [
    { value: USER_ROLE.ADMIN, label: 'Yönetici' },
    { value: USER_ROLE.MANAGER, label: 'Müdür' },
    { value: USER_ROLE.EMPLOYEE, label: 'Çalışan' },
    { value: USER_ROLE.HR, label: 'İK Uzmanı' },
    { value: USER_ROLE.FINANCE, label: 'Finans Uzmanı' },
    { value: USER_ROLE.MARKETING, label: 'Pazarlama Uzmanı' },
    { value: USER_ROLE.SALES, label: 'Satış Uzmanı' },
    { value: USER_ROLE.DEVELOPER, label: 'Yazılım Geliştirici' },
    { value: USER_ROLE.DESIGNER, label: 'Tasarımcı' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (mode === 'login') {
        // Giriş işlemi
        const result = await loginUser(form.email, form.password);
        
        if (!result.success || !result.user) {
          throw new Error(result.message || 'Geçersiz e-posta/kullanıcı adı veya şifre.');
        }
        
        // Giriş başarılı - loginUser fonksiyonu zaten onay ve aktiflik kontrolü yapıyor
        // ve başarılı değilse success: false döndürüyor
        onAuthSuccess(result.user);
      } else {
        // Kayıt işlemi validasyonları
        if (!form.name.trim()) {
          throw new Error('Ad Soyad alanı boş bırakılamaz.');
        }
        
        if (!form.username.trim()) {
          throw new Error('Kullanıcı adı alanı boş bırakılamaz.');
        }
        
        if (!form.email.trim() || !form.email.includes('@')) {
          throw new Error('Geçerli bir e-posta adresi giriniz.');
        }
        
        if (!form.password.trim() || form.password.length < 6) {
          throw new Error('Şifre en az 6 karakter olmalıdır.');
        }
        
        if (form.password !== form.confirmPassword) {
          throw new Error('Şifreler eşleşmiyor.');
        }
        
        // Kullanıcı kayıt işlemi
        const newUser = await registerUser({
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role,
          department: form.department,
          is_active: false, // Onay bekliyor durumunda
          status: USER_STATUS.PENDING_APPROVAL,
          permissions: []
        });
        
        if (!newUser) {
          throw new Error('Kayıt işlemi sırasında bir hata oluştu.');
        }
        
        // Kayıt başarılı, kullanıcıya bilgi ver
        setSuccess('Kayıt işleminiz başarıyla tamamlandı. Admin onayı beklenmektedir.');
        
        // Formu temizle
        setForm({
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          name: '',
          role: USER_ROLE.EMPLOYEE,
          department: 'Genel',
        });
        
        // 3 saniye sonra giriş moduna geç
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            {mode === 'register' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    name="name"
                    label="Ad Soyad"
                    fullWidth
                    value={form.name}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="username"
                    label="Kullanıcı Adı"
                    fullWidth
                    value={form.username}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="role-label">Rol</InputLabel>
                    <Select
                      labelId="role-label"
                      name="role"
                      value={form.role}
                      onChange={handleSelectChange}
                      label="Rol"
                      required
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="department-label">Departman</InputLabel>
                    <Select
                      labelId="department-label"
                      name="department"
                      value={form.department}
                      onChange={handleSelectChange}
                      label="Departman"
                      required
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <TextField
                name="email"
                label="E-posta"
                type="email"
                fullWidth
                value={form.email}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="password"
                label="Şifre"
                type="password"
                fullWidth
                value={form.password}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            
            {mode === 'register' && (
              <Grid item xs={12}>
                <TextField
                  name="confirmPassword"
                  label="Şifre Tekrar"
                  type="password"
                  fullWidth
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ mt: 1 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        <Box mt={2} textAlign="center">
          <Divider sx={{ my: 2 }} />
          {mode === 'login' ? (
            <Typography variant="body2">
              Hesabınız yok mu?{' '}
              <Button
                color="primary"
                onClick={() => setMode('register')}
                sx={{ textTransform: 'none' }}
              >
                Kayıt Ol
              </Button>
            </Typography>
          ) : (
            <Typography variant="body2">
              Zaten hesabınız var mı?{' '}
              <Button
                color="primary"
                onClick={() => setMode('login')}
                sx={{ textTransform: 'none' }}
              >
                Giriş Yap
              </Button>
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
