import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  SelectChangeEvent,
  Avatar,
  Container
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { registerUser, checkUserApprovalStatus, USER_APPROVAL_REQUESTED_EVENT } from '../services/UserService';
import { useNavigate } from 'react-router-dom';

// Departman listesi
const departments = [
  'Yönetim',
  'Tasarım',
  'Yazılım',
  'Pazarlama',
  'Müşteri Hizmetleri'
];

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  role?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form verileri
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    password: '',
    confirmPassword: ''
  });
  
  // Form hataları
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // İşlem durumu
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState<number | null>(null);
  
  // Onay bekliyor diyaloğu
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Form alanı değişikliği
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Hata mesajını temizle
      if (formErrors[name as keyof FormErrors]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }
    }
  };
  
  // Form doğrulama
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;
    
    // İsim kontrolü
    if (!formData.name.trim()) {
      errors.name = 'İsim alanı zorunludur';
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      errors.name = 'İsim en az 3 karakter olmalıdır';
      isValid = false;
    }
    
    // E-posta kontrolü
    if (!formData.email.trim()) {
      errors.email = 'E-posta alanı zorunludur';
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz';
      isValid = false;
    }
    
    // Telefon kontrolü
    if (!formData.phone.trim()) {
      errors.phone = 'Telefon alanı zorunludur';
      isValid = false;
    }
    
    // Departman kontrolü
    if (!formData.department) {
      errors.department = 'Departman seçimi zorunludur';
      isValid = false;
    }
    
    // Rol kontrolü
    if (!formData.role.trim()) {
      errors.role = 'Rol alanı zorunludur';
      isValid = false;
    }
    
    // Şifre kontrolü
    if (!formData.password) {
      errors.password = 'Şifre alanı zorunludur';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Şifre en az 6 karakter olmalıdır';
      isValid = false;
    }
    
    // Şifre tekrar kontrolü
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Şifreler eşleşmiyor';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Kayıt işlemi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Şifre alanını çıkart ve bcrypt ile hash'le
      const { confirmPassword, ...userData } = formData;
      
      // Kullanıcı kaydını oluştur
      const newUser = await registerUser({
        ...userData,
        username: userData.email.split('@')[0], // E-posta adresinden kullanıcı adı oluştur
        is_admin: false, // Varsayılan olarak admin değil
        is_active: false, // Varsayılan olarak aktif değil
        status: 'pending_approval', // Onay bekliyor durumu
        password: userData.password // Şifre hash'leme işlemi Supabase fonksiyonunda yapılıyor
      });
      
      if (newUser) {
        setRegisteredUserId(newUser.id);
        setRegistrationSuccess(true);
        setApprovalDialogOpen(true);
        
        // Başarı mesajı göster
        setSnackbar({
          open: true,
          message: 'Kayıt başarıyla oluşturuldu. Yönetici onayı bekleniyor.',
          severity: 'success'
        });
      } else {
        // Hata mesajı göster
        setSnackbar({
          open: true,
          message: 'Kayıt oluşturulurken bir hata oluştu. E-posta adresi zaten kullanılıyor olabilir.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Kayıt işlemi sırasında hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Kayıt işlemi sırasında bir hata oluştu.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Onay durumunu kontrol et
  useEffect(() => {
    if (registeredUserId) {
      const checkApprovalStatus = async () => {
        if (!registeredUserId) return;
        
        try {
          const status = await checkUserApprovalStatus(registeredUserId);
          
          if (status === 'approved') {
            setSnackbar({
              open: true,
              message: 'Hesabınız onaylandı! Giriş yapabilirsiniz.',
              severity: 'success'
            });
            
            // Onay diyaloğunu kapat
            setApprovalDialogOpen(false);
            
            // Giriş sayfasına yönlendir
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          } else if (status === 'rejected') {
            setSnackbar({
              open: true,
              message: 'Hesap başvurunuz reddedildi.',
              severity: 'error'
            });
            
            // Onay diyaloğunu kapat
            setApprovalDialogOpen(false);
          }
        } catch (error) {
          console.error('Onay durumu kontrolü sırasında hata:', error);
          setSnackbar({
            open: true,
            message: 'Onay durumu kontrol edilirken bir hata oluştu.',
            severity: 'error'
          });
        }
      };
      
      // İlk kontrol
      checkApprovalStatus();
      
      // Periyodik kontrol (30 saniyede bir)
      const intervalId = setInterval(checkApprovalStatus, 30000);
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [registeredUserId, navigate]);
  
  // Onay diyaloğunu kapat
  const handleCloseApprovalDialog = () => {
    setApprovalDialogOpen(false);
    
    // Giriş sayfasına yönlendir
    navigate('/login');
  };
  
  // Snackbar'ı kapat
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // Giriş sayfasına git
  const handleGoToLogin = () => {
    navigate('/login');
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Kayıt Ol
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            E-Pazarla ERP sistemine kayıt olmak için lütfen aşağıdaki formu doldurun.
            <br />
            Kayıt işleminiz yönetici onayından sonra aktif olacaktır.
          </Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Ad Soyad"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={isSubmitting || registrationSuccess}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="E-posta"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={isSubmitting || registrationSuccess}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Telefon"
                fullWidth
                required
                value={formData.phone}
                onChange={handleChange}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                disabled={isSubmitting || registrationSuccess}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!formErrors.department} disabled={isSubmitting || registrationSuccess}>
                <InputLabel>Departman</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  label="Departman"
                >
                  {departments.map(department => (
                    <MenuItem key={department} value={department}>
                      {department}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.department && (
                  <FormHelperText>{formErrors.department}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="role"
                label="Pozisyon/Rol"
                fullWidth
                required
                value={formData.role}
                onChange={handleChange}
                error={!!formErrors.role}
                helperText={formErrors.role}
                disabled={isSubmitting || registrationSuccess}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="password"
                label="Şifre"
                type="password"
                fullWidth
                required
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                disabled={isSubmitting || registrationSuccess}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="confirmPassword"
                label="Şifre Tekrar"
                type="password"
                fullWidth
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                disabled={isSubmitting || registrationSuccess}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handleGoToLogin}
              disabled={isSubmitting}
            >
              Giriş Yap
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || registrationSuccess}
              startIcon={isSubmitting ? <CircularProgress size={24} /> : null}
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Onay Bekleniyor Diyaloğu */}
      <Dialog
        open={approvalDialogOpen}
        onClose={handleCloseApprovalDialog}
        aria-labelledby="approval-dialog-title"
        aria-describedby="approval-dialog-description"
      >
        <DialogTitle id="approval-dialog-title">
          Yönetici Onayı Bekleniyor
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="approval-dialog-description">
            Kayıt işleminiz başarıyla tamamlandı. Hesabınızın aktifleştirilmesi için yönetici onayı bekleniyor.
            Onay işlemi tamamlandığında e-posta adresinize bilgilendirme yapılacaktır.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApprovalDialog} color="primary">
            Tamam
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bildirim Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RegisterPage;
