  import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Paper,
  IconButton,
  Menu,
  Tooltip
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import ProfileSettings from '../components/profile/ProfileSettings';
import NotificationSettingsComponent from '../components/settings/NotificationSettings';
import notificationService, { NotificationType, NotificationSettings, NotificationSoundType } from '../services/NotificationService';

// Sekme paneli için içerik
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

export default function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    notificationService.getSettings()
  );
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [language, setLanguage] = useState('tr');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  // Şirket bilgileri
  const [companySettings, setCompanySettings] = useState({
    name: 'E-Pazarla',
    address: 'Atatürk Cad. No:123, 34000 İstanbul',
    phone: '+90 212 123 4567',
    email: 'info@epazarla.com',
    website: 'www.epazarla.com',
    taxId: '1234567890'
  });
  
  // E-posta ayarları
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.epazarla.com',
    smtpPort: '587',
    smtpUsername: 'notifications@epazarla.com',
    smtpPassword: '********',
    fromEmail: 'notifications@epazarla.com',
    fromName: 'E-Pazarla Bildirim'
  });

  // Sekme değişimi
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Tema değişimi
  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDarkMode(event.target.checked);
    // Tema değişimi için App.tsx'e bilgi gönderilmeli
  };

  // Bildirim ayarları değişimi
  const handleNotificationSettingsChange = (settings: NotificationSettings) => {
    setNotificationSettings(settings);
    
    // Bildirim izni iste
    if (settings.enabled && settings.desktop) {
      notificationService.requestPermission().then(permission => {
        if (permission === 'granted') {
          setSnackbar({
            open: true,
            message: 'Bildirimler etkinleştirildi',
            severity: 'success'
          });
        } else if (permission === 'denied') {
          setSnackbar({
            open: true,
            message: 'Bildirim izni reddedildi. Tarayıcı ayarlarından izin vermeniz gerekiyor.',
            severity: 'error'
          });
        }
      });
    }
  };

  // E-posta bildirimleri değişimi
  const handleEmailNotificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailNotifications(event.target.checked);
  };

  // Dil değişimi
  const handleLanguageChange = (event: any) => {
    setLanguage(event.target.value);
  };

  // Şirket bilgilerini güncelle
  const handleCompanySettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanySettings({
      ...companySettings,
      [name]: value
    });
  };

  // E-posta ayarlarını güncelle
  const handleEmailSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: value
    });
  };

  // Ayarları kaydet
  const handleSaveSettings = () => {
    setSnackbar({
      open: true,
      message: 'Ayarlar başarıyla kaydedildi',
      severity: 'success'
    });
  };

  // Profil güncelleme
  const handleUpdateProfile = (userData: any) => {
    console.log('Profil güncellendi:', userData);
    // Profil güncelleme işlemleri burada yapılacak
  };

  // Snackbar kapat
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Bildirim testi
  const handleTestNotification = (type: NotificationType = NotificationType.DEFAULT) => {
    notificationService.showNotification(
      'Test Bildirimi',
      `Bu bir test bildirimidir. ${type} tipinde bildirim başarıyla gönderildi.`,
      { type, playSound: true }
    );
  };

  // Ses testi
  const handleTestSound = (soundType: NotificationSoundType = NotificationSoundType.BELL) => {
    notificationService.testSound(soundType);
    setSnackbar({
      open: true,
      message: `${soundType} sesi başarıyla test edildi`,
      severity: 'success'
    });
  };

  // Daha fazla menüsü için
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuContext, setMenuContext] = useState<string>('');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, context: string) => {
    setAnchorEl(event.currentTarget);
    setMenuContext(context);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuAction = (action: string) => {
    // Menü eylemlerini işle
    console.log(`${menuContext} için ${action} eylemi`);

    // Bildirim göster
    notificationService.showNotification(
      'Eylem Gerçekleştirildi',
      `${menuContext} için ${action} eylemi başarıyla gerçekleştirildi.`,
      { type: NotificationType.SUCCESS }
    );

    handleMenuClose();
  };

  return (
    <Box sx={{ 
      p: 3,
      width: '100%',
      minWidth: { xs: '100%', sm: '600px', md: '900px', lg: '1200px' }
    }}>
      <Typography variant="h4" fontWeight="medium" sx={{ mb: 3 }}>
        Ayarlar
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Tabs
                orientation="vertical"
                variant="scrollable"
                value={tabValue}
                onChange={handleTabChange}
                sx={{ borderRight: 1, borderColor: 'divider' }}
              >
                <Tab 
                  label="Profil" 
                  icon={<BusinessIcon />} 
                  iconPosition="start" 
                  {...a11yProps(0)} 
                  sx={{ justifyContent: 'flex-start', minHeight: 48 }}
                />
                <Tab 
                  label="Görünüm" 
                  icon={<PaletteIcon />} 
                  iconPosition="start" 
                  {...a11yProps(1)} 
                  sx={{ justifyContent: 'flex-start', minHeight: 48 }}
                />
                <Tab 
                  label="Bildirimler" 
                  icon={<NotificationsIcon />} 
                  iconPosition="start" 
                  {...a11yProps(2)} 
                  sx={{ justifyContent: 'flex-start', minHeight: 48 }}
                />
                <Tab 
                  label="Güvenlik" 
                  icon={<SecurityIcon />} 
                  iconPosition="start" 
                  {...a11yProps(3)} 
                  sx={{ justifyContent: 'flex-start', minHeight: 48 }}
                />
                <Tab 
                  label="Dil" 
                  icon={<LanguageIcon />} 
                  iconPosition="start" 
                  {...a11yProps(4)} 
                  sx={{ justifyContent: 'flex-start', minHeight: 48 }}
                />
                <Tab 
                  label="Şirket" 
                  icon={<BusinessIcon />} 
                  iconPosition="start" 
                  {...a11yProps(5)} 
                  sx={{ justifyContent: 'flex-start', minHeight: 48 }}
                />
                <Tab 
                  label="E-posta" 
                  icon={<EmailIcon />} 
                  iconPosition="start" 
                  {...a11yProps(6)} 
                  sx={{ justifyContent: 'flex-start', minHeight: 48 }}
                />
                <Tab 
                  label="Veri" 
                  icon={<StorageIcon />} 
                  iconPosition="start" 
                  {...a11yProps(7)} 
                  sx={{ justifyContent: 'flex-start', minHeight: 48 }}
                />
              </Tabs>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 0 }}>
            <TabPanel value={tabValue} index={0}>
              <ProfileSettings 
                user={{
                  name: 'Ali Yılmaz',
                  email: 'ali.yilmaz@epazarla.com',
                  role: 'Proje Yöneticisi',
                  avatar: 'https://i.pravatar.cc/150?img=1'
                }}
                onUpdateProfile={handleUpdateProfile}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Görünüm Ayarları
              </Typography>
              
              <Card>
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <PaletteIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Koyu Tema" 
                        secondary="Koyu temayı etkinleştir veya devre dışı bırak" 
                      />
                      <Switch
                        edge="end"
                        checked={darkMode}
                        onChange={handleThemeChange}
                      />
                    </ListItem>
                    
                    <Divider variant="inset" component="li" />
                    
                    <ListItem>
                      <ListItemIcon>
                        <PaletteIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Yüksek Kontrast" 
                        secondary="Yüksek kontrastlı modu etkinleştir" 
                      />
                      <Switch
                        edge="end"
                        checked={false}
                      />
                    </ListItem>
                    
                    <Divider variant="inset" component="li" />
                    
                    <ListItem>
                      <ListItemIcon>
                        <PaletteIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Animasyonlar" 
                        secondary="Arayüz animasyonlarını etkinleştir" 
                      />
                      <Switch
                        edge="end"
                        defaultChecked
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Bildirim Ayarları
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Bildirim ayarlarını yapılandırın ve test edin.
              </Typography>
              
              <NotificationSettingsComponent 
                onSettingsChange={handleNotificationSettingsChange} 
              />
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Ses Testi
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleTestSound(NotificationSoundType.BELL)}
                    >
                      Zil
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleTestSound(NotificationSoundType.CHIME)}
                    >
                      Çan
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleTestSound(NotificationSoundType.ALERT)}
                    >
                      Uyarı
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleTestSound(NotificationSoundType.NOTIFICATION)}
                    >
                      Bildirim
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleTestSound(NotificationSoundType.PING)}
                    >
                      Ping
                    </Button>
                  </Box>
                </Box>
                
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<NotificationsIcon />}
                  onClick={() => handleTestNotification()}
                >
                  Test Bildirimi Gönder
                </Button>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  E-posta Bildirimleri
                </Typography>
                
                <Card>
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="E-posta Bildirimleri" 
                          secondary="Önemli güncellemeler için e-posta bildirimleri alın"
                        />
                        <Switch
                          edge="end"
                          checked={emailNotifications}
                          onChange={handleEmailNotificationChange}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Box>
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Güvenlik Ayarları
              </Typography>
              
              <Card>
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="İki Faktörlü Kimlik Doğrulama" 
                        secondary="Hesabınızı korumak için iki faktörlü kimlik doğrulamayı etkinleştirin" 
                      />
                      <Switch
                        edge="end"
                        defaultChecked={false}
                      />
                    </ListItem>
                    
                    <Divider variant="inset" component="li" />
                    
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Oturum Zaman Aşımı" 
                        secondary="Belirli bir süre işlem yapılmadığında oturumu sonlandır" 
                      />
                      <FormControl sx={{ minWidth: 120 }}>
                        <Select
                          value={30}
                          size="small"
                        >
                          <MenuItem value={15}>15 dakika</MenuItem>
                          <MenuItem value={30}>30 dakika</MenuItem>
                          <MenuItem value={60}>1 saat</MenuItem>
                          <MenuItem value={120}>2 saat</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItem>
                  </List>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Şifre Değiştir
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Mevcut Şifre"
                          type="password"
                          fullWidth
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Yeni Şifre"
                          type="password"
                          fullWidth
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Şifre Tekrar"
                          type="password"
                          fullWidth
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Button variant="contained">
                          Şifreyi Değiştir
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </TabPanel>
            
            <TabPanel value={tabValue} index={4}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Dil Ayarları
              </Typography>
              
              <Card>
                <CardContent>
                  <FormControl fullWidth>
                    <InputLabel>Dil</InputLabel>
                    <Select
                      value={language}
                      onChange={handleLanguageChange}
                      label="Dil"
                    >
                      <MenuItem value="tr">Türkçe</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="de">Deutsch</MenuItem>
                      <MenuItem value="fr">Français</MenuItem>
                      <MenuItem value="es">Español</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ mt: 3 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Tarih ve saat formatını dile göre ayarla"
                    />
                  </Box>
                  
                  <Box sx={{ mt: 1 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Para birimi formatını dile göre ayarla"
                    />
                  </Box>
                </CardContent>
              </Card>
            </TabPanel>
            
            <TabPanel value={tabValue} index={5}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Şirket Bilgileri
              </Typography>
              
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Şirket Adı"
                        name="name"
                        value={companySettings.name}
                        onChange={handleCompanySettingsChange}
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Vergi Numarası"
                        name="taxId"
                        value={companySettings.taxId}
                        onChange={handleCompanySettingsChange}
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Adres"
                        name="address"
                        value={companySettings.address}
                        onChange={handleCompanySettingsChange}
                        fullWidth
                        multiline
                        rows={2}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Telefon"
                        name="phone"
                        value={companySettings.phone}
                        onChange={handleCompanySettingsChange}
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="E-posta"
                        name="email"
                        type="email"
                        value={companySettings.email}
                        onChange={handleCompanySettingsChange}
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Web Sitesi"
                        name="website"
                        value={companySettings.website}
                        onChange={handleCompanySettingsChange}
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button 
                        variant="contained" 
                        startIcon={<SaveIcon />}
                        onClick={handleSaveSettings}
                      >
                        Kaydet
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </TabPanel>
            
            <TabPanel value={tabValue} index={6}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                E-posta Ayarları
              </Typography>
              
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        label="SMTP Sunucu"
                        name="smtpServer"
                        value={emailSettings.smtpServer}
                        onChange={handleEmailSettingsChange}
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Port"
                        name="smtpPort"
                        value={emailSettings.smtpPort}
                        onChange={handleEmailSettingsChange}
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="SMTP Kullanıcı Adı"
                        name="smtpUsername"
                        value={emailSettings.smtpUsername}
                        onChange={handleEmailSettingsChange}
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="SMTP Şifre"
                        name="smtpPassword"
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={handleEmailSettingsChange}
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Gönderen E-posta"
                        name="fromEmail"
                        value={emailSettings.fromEmail}
                        onChange={handleEmailSettingsChange}
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Gönderen Adı"
                        name="fromName"
                        value={emailSettings.fromName}
                        onChange={handleEmailSettingsChange}
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Button 
                            variant="contained" 
                            startIcon={<SaveIcon />}
                            onClick={handleSaveSettings}
                          >
                            Kaydet
                          </Button>
                          <Button 
                            variant="outlined" 
                            sx={{ ml: 2 }}
                          >
                            Test E-postası Gönder
                          </Button>
                        </Box>
                        
                        <IconButton 
                          aria-label="daha fazla"
                          onClick={(e) => handleMenuOpen(e, 'E-posta Ayarları')}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </TabPanel>
            
            <TabPanel value={tabValue} index={7}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Veri Yönetimi
              </Typography>
              
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Veri Yedekleme
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Sistem verilerinizi yedekleyin ve gerektiğinde geri yükleyin.
                  </Typography>
                  
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Button variant="contained" sx={{ mr: 2 }}>
                        Veri Yedekle
                      </Button>
                      <Button variant="outlined">
                        Yedekten Geri Yükle
                      </Button>
                    </Box>
                    
                    <IconButton 
                      aria-label="daha fazla"
                      onClick={(e) => handleMenuOpen(e, 'Veri Yönetimi')}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Veri Temizleme
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Eski verileri temizleyerek sistem performansını artırın.
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Button variant="outlined" color="warning" sx={{ mr: 2 }}>
                      Önbelleği Temizle
                    </Button>
                    <Button variant="outlined" color="error">
                      Tüm Verileri Sıfırla
                    </Button>
                  </Box>
                  
                  <Alert severity="warning">
                    Veri sıfırlama işlemi geri alınamaz. Bu işlemi yapmadan önce verilerinizi yedeklediğinizden emin olun.
                  </Alert>
                </CardContent>
              </Card>
            </TabPanel>
          </Paper>
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
      
      {/* Daha fazla menüsü */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            mt: 1.5,
            borderRadius: '12px',
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              borderRadius: '8px',
              mx: 0.5,
              my: 0.25
            }
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleMenuAction('düzenle')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Düzenle
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('kopyala')}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          Kopyala
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('indir')}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          İndir
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('yazdır')}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          Yazdır
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleMenuAction('yenile')}>
          <ListItemIcon>
            <RefreshIcon fontSize="small" />
          </ListItemIcon>
          Yenile
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('ayarlar')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Ayarlar
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('yardım')}>
          <ListItemIcon>
            <HelpIcon fontSize="small" />
          </ListItemIcon>
          Yardım
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleMenuAction('sil')} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Sil
        </MenuItem>
      </Menu>
    </Box>
  );
}
