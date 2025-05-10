import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  FormControlLabel,
  Switch,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  Notifications as NotificationsIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon
} from '@mui/icons-material';
import notificationService, { NotificationType, NotificationSoundType } from '../../services/NotificationService';
import directStorageService, { User } from '../../services/DirectStorageService';

interface ProfileSettingsProps {
  user: {
    id?: number;
    name: string;
    email: string;
    role?: string;
    avatar?: string;
  };
  onUpdateProfile: (userData: Partial<User>) => void;
}

export default function ProfileSettings({ user, onUpdateProfile }: ProfileSettingsProps) {
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || '',
    avatar: user.avatar || '',
    password: '',
    confirmPassword: ''
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    notificationService.isEnabled()
  );
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user.avatar);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form alanlarını güncelle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });

    // Hata durumunu temizle
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Profil resmini güncelle
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Dosya boyutu kontrolü (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'Dosya boyutu 2MB\'dan küçük olmalıdır',
          severity: 'error'
        });
        return;
      }

      // Dosya türü kontrolü
      if (!file.type.match('image.*')) {
        setSnackbar({
          open: true,
          message: 'Lütfen bir resim dosyası seçin',
          severity: 'error'
        });
        return;
      }

      // Resmi önizle
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setAvatarPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Bildirim ayarlarını güncelle
  const handleNotificationToggle = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    notificationService.updateSettings({ enabled: newState });
    
    // Bildirim izni iste
    if (newState) {
      notificationService.requestPermission().then(permission => {
        if (permission === 'granted') {
          setSnackbar({
            open: true,
            message: 'Bildirimler başarıyla etkinleştirildi',
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: 'Bildirim izni reddedildi. Tarayıcı ayarlarından izin vermeniz gerekiyor.',
            severity: 'error'
          });
        }
      });
    }
  };

  // Bildirim testi
  const handleTestNotification = () => {
    // Önce sadece ses testi yap
    notificationService.testSound(NotificationSoundType.BELL);
    
    // Sonra bildirim göster
    setTimeout(() => {
      notificationService.showNotification(
        'Test Bildirimi',
        'Bu bir test bildirimidir. Bildirimler başarıyla çalışıyor!',
        { 
          type: NotificationType.SUCCESS,
          onClick: () => {
            console.log('Bildirime tıklandı');
          }
        }
      );
    }, 500);
  };

  // Formu doğrula
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    
    // Ad alanı kontrolü
    if (!userData.name.trim()) {
      newErrors.name = 'Ad alanı boş olamaz';
      isValid = false;
    }
    
    // E-posta alanı kontrolü
    if (!userData.email.trim()) {
      newErrors.email = 'E-posta alanı boş olamaz';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
      isValid = false;
    }
    
    // Şifre alanı kontrolü (sadece şifre değiştiriliyorsa)
    if (userData.password) {
      if (userData.password.length < 6) {
        newErrors.password = 'Şifre en az 6 karakter olmalıdır';
        isValid = false;
      }
      
      if (userData.password !== userData.confirmPassword) {
        newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // localStorage değişikliklerini dinle
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'erp_current_user' && event.newValue) {
        try {
          const updatedUser = JSON.parse(event.newValue);
          if (updatedUser && updatedUser.id === user.id) {
            setUserData({
              ...userData,
              name: updatedUser.name || userData.name,
              email: updatedUser.email || userData.email,
              role: updatedUser.role || userData.role,
              avatar: updatedUser.avatar || userData.avatar
            });
            setAvatarPreview(updatedUser.avatar);
          }
        } catch (error) {
          console.error('Kullanıcı verisi ayrıştırılırken hata oluştu:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userData, user.id]);

  // Profili güncelle
  const handleSubmit = () => {
    if (validateForm()) {
      // Profil güncellemesi için gerekli alanları hazırla
      const updatedUser: Partial<User> = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        // avatar null ise undefined olarak gönder (tip hatası için)
        avatar: avatarPreview === null ? undefined : avatarPreview
      };
      
      // Şifre değiştirilmişse ekle
      if (userData.password) {
        updatedUser.password = userData.password;
      }

      // Profil güncelleme işlemini çağır
      onUpdateProfile(updatedUser);
      
      // Düzenleme modunu kapat
      setEditMode(false);
      
      // Başarı mesajı göster
      setSnackbar({
        open: true,
        message: 'Profil bilgileriniz başarıyla güncellendi',
        severity: 'success'
      });
      
      // Bildirim gönder
      if (notificationsEnabled) {
        notificationService.showNotification(
          'Profil Güncellendi',
          'Profil bilgileriniz başarıyla güncellendi.'
        );
      }
    }
  };

  // Snackbar kapat
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        mb: 3 
      }}>
        <Button
          variant="contained"
          color={editMode ? "primary" : "secondary"}
          startIcon={editMode ? <SaveIcon /> : <EditIcon />}
          onClick={() => editMode ? handleSubmit() : setEditMode(true)}
        >
          {editMode ? 'Kaydet' : 'Düzenle'}
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center' 
            }}>
              <Avatar
                src={avatarPreview || undefined}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  fontSize: '3rem'
                }}
              >
                {user.name?.charAt(0) || 'U'}
              </Avatar>
              
              {editMode && (
                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleAvatarChange}
                    ref={fileInputRef}
                  />
                  <label htmlFor="avatar-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                    >
                      Fotoğraf Değiştir
                    </Button>
                  </label>
                </Box>
              )}
              
              <Typography variant="h6" gutterBottom>
                {user.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {user.role || 'Pozisyon belirtilmemiş'}
              </Typography>
              
              <Divider sx={{ width: '100%', my: 3 }} />
              
              <Typography variant="h6" sx={{ mb: 2, alignSelf: 'flex-start' }}>
                Bildirim Ayarları
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                width: '100%', 
                mb: 2 
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationsEnabled}
                      onChange={handleNotificationToggle}
                      color="primary"
                    />
                  }
                  label="Bildirimleri Etkinleştir"
                />
              </Box>
              
              <Button
                variant="outlined"
                startIcon={notificationsEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
                onClick={handleTestNotification}
                disabled={!notificationsEnabled}
                fullWidth
              >
                Bildirim Testi
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Kişisel Bilgiler
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Ad Soyad"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="E-posta"
                    name="email"
                    type="email"
                    value={userData.email}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Pozisyon"
                    name="role"
                    value={userData.role}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>
              
              {editMode && (
                <>
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Şifre Değiştir
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Yeni Şifre"
                        name="password"
                        type="password"
                        value={userData.password}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.password}
                        helperText={errors.password}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Şifre Tekrar"
                        name="confirmPassword"
                        type="password"
                        value={userData.confirmPassword}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
