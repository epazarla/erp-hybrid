import React, { useState, useEffect } from 'react';
import { 
  Box, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  useTheme,
  ThemeProvider,
  IconButton,
  Divider,
  Avatar,
  Tabs,
  Tab,
  Badge,
  Menu,
  MenuItem,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Chip,
  ButtonBase
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  People as PeopleIcon,
  BarChart as AnalyticsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { lightTheme, darkTheme } from '../../theme';
import { styled, alpha } from '@mui/material/styles';

// Ana içerik alanı
const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  paddingTop: theme.spacing(14), // Daha büyük üst çubuk için padding artırıldı
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  minHeight: 'calc(100vh - 110px)', // Apple tarzı daha yüksek üst çubuk için güncellendi
}));

// İkon kapsayıcısı
const IconContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  marginBottom: '8px',
  transition: 'all 0.3s ease',
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.08)}`,
}));

// Modern menü butonu
const MenuButton = styled('button')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px',
  borderRadius: '16px',
  minWidth: '100px',
  height: '80px',
  margin: '0 8px',
  transition: 'all 0.25s ease',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  outline: 'none',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.6),
    transform: 'translateY(-2px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    borderRadius: 'inherit',
    transition: 'opacity 0.3s ease',
    opacity: 0,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
  },
  '&:hover::before': {
    opacity: 1,
  },
}));

// Seçili menü butonu için özel stil
const SelectedMenuButton = styled(MenuButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  boxShadow: `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.2)}`,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: '3px',
    borderRadius: '3px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

// İçerik konteyneri
const ContentContainer = styled('div')(() => ({
  width: '100%',
  maxWidth: '1400px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '100%',
}));

interface DashboardLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  user: {
    name: string;
    email: string;
    role?: string;
    id?: number;
    avatar?: string;
    isAdmin?: boolean;
  };
  onPageChange?: (page: string) => void;
  onThemeToggle?: () => void;
  darkMode?: boolean;
  currentPath?: string;
}

// Modern menü öğeleri
const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon sx={{ fontSize: '1.8rem' }} />, 
    path: '/dashboard', 
    value: 'dashboard',
    color: '#2196f3', // Mavi
    gradient: 'linear-gradient(135deg, #2196f3, #21cbf3)'
  },
  { 
    text: 'Görevler', 
    icon: <TaskIcon sx={{ fontSize: '1.8rem' }} />, 
    path: '/tasks', 
    value: 'tasks',
    color: '#4caf50', // Yeşil
    gradient: 'linear-gradient(135deg, #4caf50, #8bc34a)'
  },
  { 
    text: 'Ekip', 
    icon: <PeopleIcon sx={{ fontSize: '1.8rem' }} />, 
    path: '/team', 
    value: 'team',
    color: '#ff9800', // Turuncu
    gradient: 'linear-gradient(135deg, #ff9800, #ffb74d)'
  },
  { 
    text: 'Müşteriler', 
    icon: <BusinessIcon sx={{ fontSize: '1.8rem' }} />, 
    path: '/clients', 
    value: 'clients',
    color: '#9c27b0', // Mor
    gradient: 'linear-gradient(135deg, #9c27b0, #ba68c8)'
  },
  { 
    text: 'Analitik', 
    icon: <AnalyticsIcon sx={{ fontSize: '1.8rem' }} />, 
    path: '/analytics', 
    value: 'analytics',
    color: '#f44336', // Kırmızı
    gradient: 'linear-gradient(135deg, #f44336, #e57373)'
  },
  { 
    text: 'Ayarlar', 
    icon: <SettingsIcon sx={{ fontSize: '1.8rem' }} />, 
    path: '/settings', 
    value: 'settings',
    color: '#607d8b', // Gri-mavi
    gradient: 'linear-gradient(135deg, #607d8b, #90a4ae)'
  },
  { 
    text: 'Admin Panel', 
    icon: <SecurityIcon sx={{ fontSize: '1.8rem' }} />, 
    path: '/admin', 
    value: 'admin',
    color: '#d32f2f', // Kırmızı
    gradient: 'linear-gradient(135deg, #d32f2f, #ff5722)',
    adminOnly: true // Sadece admin kullanıcılar için
  },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentPath, onThemeToggle, darkMode, user, onLogout, onPageChange }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Tema değiştirme
  const handleThemeToggle = () => {
    if (onThemeToggle) {
      onThemeToggle();
    }
  };

  // Tab değişikliği işleyicisi
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    // Seçilen sekmeye yönlendirme
    const selectedItem = menuItems[newValue];
    if (selectedItem && selectedItem.path) {
      navigate(selectedItem.path);
    }
  };
  
  // Profil menüsünü aç
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(null);
    setIsNotificationsMenuOpen(false);
    setAnchorEl(event.currentTarget);
    setIsProfileMenuOpen(true);
  };
  
  // Profil menüsünü kapat
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
    setIsProfileMenuOpen(false);
  };
  
  // Bildirimler menüsünü aç
  const handleNotificationsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(null);
    setIsProfileMenuOpen(false);
    setNotificationsAnchorEl(event.currentTarget);
    setIsNotificationsMenuOpen(true);
  };
  
  // Bildirimler menüsünü kapat
  const handleNotificationsMenuClose = () => {
    setNotificationsAnchorEl(null);
    setIsNotificationsMenuOpen(false);
  };
  
  // Tüm menüleri kapat
  const handleCloseAllMenus = () => {
    setAnchorEl(null);
    setNotificationsAnchorEl(null);
    setIsProfileMenuOpen(false);
    setIsNotificationsMenuOpen(false);
  };
  
  // Tıklama olayını işle
  const handleClickOutside = (event: MouseEvent) => {
    if (!isProfileMenuOpen && !isNotificationsMenuOpen) {
      return;
    }
    
    const target = event.target as HTMLElement;
    const isMenuClick = target.closest('#profile-menu') || target.closest('#notifications-menu');
    const isMenuButtonClick = target.closest('[aria-controls="profile-menu"]') || target.closest('[aria-controls="notifications-menu"]');
    
    if (!isMenuClick && !isMenuButtonClick) {
      handleCloseAllMenus();
    }
  };
  
  // Seçili sekmeyi yükle
  useEffect(() => {
    const currentTabIndex = menuItems.findIndex(item => item.path === currentPath);
    if (currentTabIndex !== -1) {
      setSelectedTab(currentTabIndex);
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentPath]);
  
  // Profil menüsü
  const profileMenu = (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl) && isProfileMenuOpen}
      onClose={handleProfileMenuClose}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      sx={{ mt: 1 }}
      MenuListProps={{
        'aria-labelledby': 'profile-button',
        id: 'profile-menu',
        sx: {
          padding: '8px',
          borderRadius: '12px',
          minWidth: '240px',
          '& .MuiMenuItem-root': {
            borderRadius: '8px',
            margin: '4px 0',
            padding: '8px 16px',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              transform: 'translateY(-1px)',
              boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.05)}`,
            },
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{
        elevation: 3,
        sx: {
          mt: 1.5,
          overflow: 'visible',
          borderRadius: '16px',
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: `0 10px 40px -10px ${alpha(theme.palette.common.black, 0.2)}`,
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 20,
            width: 10,
            height: 10,
            bgcolor: theme.palette.background.paper,
            transform: 'translateY(-50%) rotate(45deg)',
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            borderLeft: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            zIndex: 0,
          },
        },
      }}
    >
      {/* Kullanıcı Profil Başlığı */}
      <Box sx={{ px: 2, py: 1.5, textAlign: 'center' }}>
        <Avatar 
          src={user?.avatar} 
          sx={{ 
            width: 60, 
            height: 60, 
            mx: 'auto',
            mb: 1,
            border: `2px solid ${theme.palette.primary.main}`,
            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
          }}
        >
          {user?.name?.charAt(0) || 'U'}
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {user?.name || 'Kullanıcı'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {user?.email || 'kullanici@example.com'}
        </Typography>
        <Chip 
          label={user?.role || 'Kullanıcı'} 
          color="primary" 
          size="small" 
          variant="outlined"
          sx={{ borderRadius: '12px' }}
        />
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      {/* Profil Menü Öğeleri */}
      <MenuItem onClick={() => { handleProfileMenuClose(); onPageChange && onPageChange('/profile'); }}>
        <ListItemIcon>
          <PersonIcon color="primary" />
        </ListItemIcon>
        <ListItemText 
          primary="Profilim" 
          secondary="Profil bilgilerinizi görüntüleyin ve düzenleyin"
          secondaryTypographyProps={{ variant: 'caption', sx: { mt: 0.2 } }}
        />
      </MenuItem>
      
      <MenuItem onClick={() => { handleProfileMenuClose(); onPageChange && onPageChange('/settings'); }}>
        <ListItemIcon>
          <SettingsIcon color="primary" />
        </ListItemIcon>
        <ListItemText 
          primary="Ayarlar" 
          secondary="Uygulama ayarlarını özelleştirin"
          secondaryTypographyProps={{ variant: 'caption', sx: { mt: 0.2 } }}
        />
      </MenuItem>
      
      <MenuItem onClick={() => { handleProfileMenuClose(); handleThemeToggle(); }}>
        <ListItemIcon>
          {darkMode ? <LightModeIcon color="warning" /> : <DarkModeIcon color="primary" />}
        </ListItemIcon>
        <ListItemText 
          primary={darkMode ? "Açık Tema" : "Koyu Tema"} 
          secondary="Tema tercihini değiştirin"
          secondaryTypographyProps={{ variant: 'caption', sx: { mt: 0.2 } }}
        />
      </MenuItem>
      
      <Divider sx={{ my: 1 }} />
      
      <MenuItem onClick={() => { handleProfileMenuClose(); onPageChange && onPageChange('/team'); }}>
        <ListItemIcon>
          <PeopleIcon color="info" />
        </ListItemIcon>
        <ListItemText 
          primary="Ekibim" 
          secondary="Ekip üyelerinizi yönetin"
          secondaryTypographyProps={{ variant: 'caption', sx: { mt: 0.2 } }}
        />
      </MenuItem>
      
      <MenuItem onClick={() => { handleProfileMenuClose(); onPageChange && onPageChange('/security'); }}>
        <ListItemIcon>
          <SecurityIcon color="success" />
        </ListItemIcon>
        <ListItemText 
          primary="Güvenlik" 
          secondary="Güvenlik ayarlarınızı yönetin"
          secondaryTypographyProps={{ variant: 'caption', sx: { mt: 0.2 } }}
        />
      </MenuItem>
      
      <Divider sx={{ my: 1 }} />
      
      <MenuItem onClick={() => { handleProfileMenuClose(); onLogout(); }}>
        <ListItemIcon>
          <LogoutIcon color="error" />
        </ListItemIcon>
        <ListItemText 
          primary="Çıkış Yap" 
          secondary="Oturumu sonlandırın"
          secondaryTypographyProps={{ variant: 'caption', sx: { mt: 0.2 } }}
        />
      </MenuItem>
    </Menu>
  );
  
  // Bildirimler menüsü
  const notificationsMenu = (
    <Menu
      anchorEl={notificationsAnchorEl}
      open={Boolean(notificationsAnchorEl) && isNotificationsMenuOpen}
      onClose={handleNotificationsMenuClose}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      sx={{ mt: 1 }}
      MenuListProps={{
        'aria-labelledby': 'notifications-button',
        id: 'notifications-menu',
        sx: {
          padding: '8px',
          width: 320,
          maxHeight: 400,
        }
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{
        elevation: 3,
        sx: {
          mt: 1.5,
          overflow: 'visible',
          borderRadius: '16px',
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: `0 10px 40px -10px ${alpha(theme.palette.common.black, 0.2)}`,
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 20,
            width: 10,
            height: 10,
            bgcolor: theme.palette.background.paper,
            transform: 'translateY(-50%) rotate(45deg)',
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            borderLeft: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            zIndex: 0,
          },
        },
      }}
    >
      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Bildirimler
        </Typography>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      {notifications.length === 0 ? (
        <MenuItem onClick={handleNotificationsMenuClose}>
          <ListItemIcon>
            <NotificationsOffIcon color="disabled" />
          </ListItemIcon>
          <ListItemText primary="Bildirim bulunmuyor" secondary="Şu anda hiç bildiriminiz yok" />
        </MenuItem>
      ) : (
        notifications.map(notification => (
          <MenuItem 
            key={notification.id} 
            onClick={handleNotificationsMenuClose}
            sx={{
              borderRadius: '8px',
              margin: '4px 8px',
              backgroundColor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <ListItemIcon>
              <AccountCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary={notification.message} 
              secondary={notification.time}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: notification.read ? 'normal' : 'bold',
              }}
              secondaryTypographyProps={{
                variant: 'caption',
                color: 'text.secondary',
              }}
            />
          </MenuItem>
        ))
      )}
    </Menu>
  );
  
  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        
        {/* Apple Tarzı Üst Çubuk */}
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: alpha(theme.palette.background.default, 0.85),
            backdropFilter: 'blur(12px)',
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            height: 110, // Apple tarzı daha yüksek üst çubuk
          }}
        >
          <Toolbar sx={{ 
            minHeight: 110, 
            px: { xs: 2, sm: 3 },
            display: 'flex',
            alignItems: 'center',
          }}>
            {/* Logo ve Başlık */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mr: 3,
              '&:hover': {
                '& .logo-text': {
                  backgroundSize: '100% 2px'
                }
              }
            }}>
              <Typography
                variant="h6"
                noWrap
                component={RouterLink}
                to="/"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  textDecoration: 'none',
                  letterSpacing: '.1rem',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                ERP HYBRID
              </Typography>
              <Typography
                className="logo-text"
                variant="h6"
                noWrap
                component={RouterLink}
                to="/"
                sx={{
                  ml: { xs: 0, sm: 1 },
                  fontWeight: 500,
                  color: 'text.primary',
                  textDecoration: 'none',
                  backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: '0 100%',
                  backgroundSize: '0% 2px',
                  transition: 'background-size 0.3s',
                  paddingBottom: '2px',
                  display: { xs: 'none', md: 'block' },
                }}
              >
                Yönetim Paneli
              </Typography>
            </Box>
            
            {/* Apple Tarzı Menü */}
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="dashboard menu tabs"
              sx={{
                flex: 1,
                minHeight: '60px',
                '& .MuiTabs-flexContainer': {
                  height: '100%',
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px',
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`,
                },
                '& .MuiTab-root': {
                  minWidth: '90px',
                  minHeight: '60px',
                  padding: '6px 16px',
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  opacity: 0.7,
                  '&:hover': {
                    opacity: 1,
                    backgroundColor: alpha(theme.palette.background.paper, 0.04),
                  },
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    opacity: 1,
                  },
                },
              }}
            >
              {menuItems
                .filter(item => !item.adminOnly || (user?.isAdmin === true))
                .map((item, index) => (
                <Tab
                  key={item.text}
                  label={
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: selectedTab === index 
                            ? `linear-gradient(135deg, ${item.color}, ${alpha(item.color, 0.8)})` 
                            : alpha(theme.palette.background.paper, 0.7),
                          boxShadow: selectedTab === index
                            ? `0 4px 8px ${alpha(item.color, 0.3)}`
                            : `0 2px 4px ${alpha(theme.palette.common.black, 0.05)}`,
                          transition: 'all 0.2s ease',
                          backdropFilter: 'blur(5px)',
                          WebkitBackdropFilter: 'blur(5px)',
                        }}
                      >
                        {React.cloneElement(item.icon, {
                          sx: {
                            fontSize: '1.5rem',
                            color: selectedTab === index ? '#fff' : item.color,
                            transition: 'all 0.2s ease',
                            filter: selectedTab === index ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : 'none',
                          },
                        })}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: selectedTab === index ? 600 : 500,
                          color: selectedTab === index ? item.color : 'inherit',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.text}
                      </Typography>
                    </Box>
                  }
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    '&.MuiButtonBase-root': {
                      minWidth: '90px',
                    }
                  }}
                />
              ))}
            </Tabs>
            
            {/* Sağ Taraf Butonları */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Tema Değiştirme Butonu */}
              <Tooltip title={darkMode ? "Açık Tema" : "Koyu Tema"} arrow placement="bottom">
                <IconButton 
                  onClick={handleThemeToggle} 
                  color="inherit" 
                  sx={{ 
                    ml: 1,
                    transition: 'all 0.2s ease',
                    borderRadius: '12px',
                    width: 40,
                    height: 40,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 8px -2px ${alpha(theme.palette.primary.main, 0.25)}`,
                    }
                  }}
                >
                  {darkMode ? 
                    <LightModeIcon sx={{ color: theme.palette.warning.main }} /> : 
                    <DarkModeIcon sx={{ color: theme.palette.primary.main }} />
                  }
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Bildirimler" arrow placement="bottom">
                <IconButton 
                  color="primary" 
                  sx={{ 
                    ml: 1,
                    transition: 'all 0.2s ease',
                    borderRadius: '12px',
                    width: 40,
                    height: 40,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 8px -2px ${alpha(theme.palette.primary.main, 0.25)}`,
                    }
                  }}
                  onClick={handleNotificationsMenuOpen}
                  aria-controls="notifications-menu"
                  aria-haspopup="true"
                >
                  <Badge 
                    badgeContent={notifications.filter(n => !n.read).length} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        boxShadow: '0 0 0 2px #fff',
                        animation: notifications.filter(n => !n.read).length > 0 ? 'pulse 1.5s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.2)' },
                          '100%': { transform: 'scale(1)' },
                        },
                      }
                    }}
                  >
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              {notificationsMenu}
              
              <Tooltip title="Profil" arrow placement="bottom">
                <IconButton 
                  onClick={handleProfileMenuOpen} 
                  color="inherit" 
                  sx={{ 
                    ml: 1,
                    transition: 'all 0.2s ease',
                    borderRadius: '12px',
                    padding: '4px',
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 8px -2px ${alpha(theme.palette.primary.main, 0.25)}`,
                    }
                  }}
                  aria-controls="profile-menu"
                  aria-haspopup="true"
                >
                  <Avatar 
                    src={user?.avatar}
                    sx={{ 
                      width: 36, 
                      height: 36,
                      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              {profileMenu}
            </Box>
          </Toolbar>
        </AppBar>
        
        {/* Ana İçerik */}
        <Main>
          <ContentContainer 
            className="main-content-container"
            sx={{
              minWidth: { xs: '100%', sm: '600px', md: '900px', lg: '1200px', xl: '1400px' },
              width: '100%',
              flex: 1,
            }}
          >
            {children}
          </ContentContainer>
        </Main>
      </Box>
    </ThemeProvider>
  );
}

export default DashboardLayout;
