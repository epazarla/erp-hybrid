import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Button,
  Tabs,
  Tab,
  Badge,
  Menu,
  MenuItem,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Link,
  Chip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
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
  DoneAll as DoneAllIcon,
  DeleteSweep as DeleteSweepIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  Badge as BadgeIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { lightTheme, darkTheme } from '../../theme';
import { styled, alpha } from '@mui/material/styles';

// Kenar çubuğu genişliği
const drawerWidth = 260;

// Ana içerik alanı
const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  paddingTop: theme.spacing(10),
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  minHeight: 'calc(100vh - 64px)', // Üst çubuk yüksekliğini çıkar
}));

// Modern menü tab butonu - şık ve performanslı
const MenuTab = styled(Tab)(({ theme }) => ({
  minHeight: 64,
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
  padding: '6px 16px',
  borderRadius: '12px',
  margin: '0 6px',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 8px -2px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    boxShadow: `0 4px 10px -2px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  '& .MuiTab-iconWrapper': {
    marginBottom: 4,
    padding: '8px',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
    transition: 'transform 0.2s ease',
  },
  '&.Mui-selected .MuiSvgIcon-root': {
    color: theme.palette.primary.main,
    transform: 'scale(1.2)',
  },
}));

// İçerik konteyneri - daha da optimize edildi
const ContentContainer = styled('div')(() => ({
  width: '100%',
  maxWidth: '1400px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '100%', // Ana içerik alanının tamamını kapla
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
  };
  onPageChange?: (page: string) => void;
  onThemeToggle?: () => void;
  darkMode?: boolean;
  currentPath?: string;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', value: 'dashboard' },
  { text: 'Görevler', icon: <TaskIcon />, path: '/tasks', value: 'tasks' },
  { text: 'Ekip', icon: <PeopleIcon />, path: '/team', value: 'team' },
  { text: 'Müşteriler', icon: <BusinessIcon />, path: '/clients', value: 'clients' },
  { text: 'Analitik', icon: <AnalyticsIcon />, path: '/analytics', value: 'analytics' },
  { text: 'Ayarlar', icon: <SettingsIcon />, path: '/settings', value: 'settings' },
];

export default function DashboardLayout({ 
  children, 
  onLogout, 
  user, 
  onPageChange, 
  onThemeToggle, 
  darkMode: propDarkMode = false,
  currentPath = '/dashboard'
}: DashboardLayoutProps) {
  const theme = useTheme();
  const darkMode = propDarkMode;
  
  // Seçili sekme
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Menü durumları
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Bildirimler menüsü
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  
  // Basitleştirilmiş bildirimler - sabit sayıda
  const [notifications] = useState<Array<{
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
  }>>([{
      id: 1,
      title: 'Bildirimler',
      message: 'Bildirim sistemi performans için basitleştirildi',
      type: 'info',
      read: true
    }
  ]);
  
  // Tema değiştirme
  const handleThemeToggle = () => {
    if (onThemeToggle) {
      onThemeToggle();
    }
  };

  // Tab değişimi - ultra hızlı versiyon
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    // Önce sekmeyi güncelle - kullanıcıya anında geri bildirim
    setSelectedTab(newValue);
    
    // Sayfa değişimini üst bileşene bildir
    const path = menuItems[newValue].path;
    const pageName = menuItems[newValue].value;
    
    // onPageChange callback'i çağır
    if (onPageChange) {
      onPageChange(pageName);
    }
    
    // Sayfayı yönlendirmek için window.location.replace kullan - en hızlı yöntem
    // preventDefault ile gereksiz işlemleri engelle
    event.preventDefault();
    
    // requestAnimationFrame ile tarayıcının render döngüsünü bekle
    requestAnimationFrame(() => {
      window.location.replace(path);
    });
  }, [menuItems, onPageChange]);
  
  // Tüm menüleri kapat
  const handleCloseAllMenus = () => {
    setAnchorEl(null);
    setIsProfileMenuOpen(false);
    setIsNotificationsMenuOpen(false);
    setNotificationsAnchorEl(null);
  };

  // Profil menüsünü aç
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    // Diğer menüleri kapat
    setNotificationsAnchorEl(null);
    setIsNotificationsMenuOpen(false);
    
    // Profil menüsünü aç
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
    // Diğer menüleri kapat
    setAnchorEl(null);
    setIsProfileMenuOpen(false);
    
    // Bildirimler menüsünü aç
    setNotificationsAnchorEl(event.currentTarget);
    setIsNotificationsMenuOpen(true);
    
    // Olay yayılımını durdur
    event.stopPropagation();
  };
  
  // Bildirimler menüsünü kapat
  const handleNotificationsMenuClose = () => {
    setNotificationsAnchorEl(null);
    setIsNotificationsMenuOpen(false);
  };

  // Bildirim işlemleri kaldırıldı - performans için
  
  const handleLogout = useCallback(() => {
    handleProfileMenuClose();
    onLogout();
    // Çıkış yapınca login sayfasına hızlı yönlendirme
    requestAnimationFrame(() => {
      window.location.replace('/login');
    });
  }, [handleProfileMenuClose, onLogout]);

  // Basitleştirilmiş bildirimler menüsü
  const notificationsMenu = (
    <Menu
      anchorEl={notificationsAnchorEl}
      open={Boolean(notificationsAnchorEl) && isNotificationsMenuOpen}
      onClose={handleNotificationsMenuClose}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      sx={{ mt: 1 }}
      MenuListProps={{
        'aria-labelledby': 'notifications-button',
      }}
      slotProps={{
        paper: {
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            maxHeight: '400px',
          },
        },
      }}
      disablePortal={false}
      disableScrollLock={false}
      transitionDuration={150}
    >
      <MenuItem onClick={handleNotificationsMenuClose}>
        <ListItemIcon>
          <InfoIcon color="primary" />
        </ListItemIcon>
        <ListItemText primary="Bildirim sistemi devre dışı" secondary="Performans için bildirimler basitleştirildi" />
      </MenuItem>
    </Menu>
  );

  // Profil menüsünü güncelle - Kullanıcı profili, ayarlar ve çıkış yapma seçenekleri
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
        <Typography variant="caption" sx={{ 
          display: 'inline-block',
          px: 1.5, 
          py: 0.5, 
          borderRadius: '12px',
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
          fontWeight: 'bold',
        }}>
          {user?.role || 'Kullanıcı'}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      {/* Profil Menü Öğeleri */}
      <MenuItem onClick={() => { handleProfileMenuClose(); onPageChange && onPageChange('/profile'); }}>
        <ListItemIcon>
          <PersonIcon color="primary" />
        </ListItemIcon>
        <ListItemText 

// Profil menüsünü güncelle - Kullanıcı profili, ayarlar ve çıkış yapma seçenekleri
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
      <Typography variant="caption" sx={{ 
        display: 'inline-block',
        px: 1.5, 
        py: 0.5, 
        borderRadius: '12px',
        bgcolor: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.main,
        fontWeight: 'bold',
      }}>
        {user?.role || 'Kullanıcı'}
      </Typography>
    </Box>
  useEffect(() => {
    
    // Seçili sekmeyi belirle
    const currentPagePath = currentPath || '/dashboard';
    const tabIndex = menuItems.findIndex(item => item.path === currentPagePath);
    setSelectedTab(tabIndex >= 0 ? tabIndex : 0);
  }, [currentPath]);
  
  // Menü dışına tıklandığında menüleri kapat - daha güvenli ve basit hale getirildi
  useEffect(() => {
    // Tıklama olayını işle - basit ve güvenli
    const handleClickOutside = (event: MouseEvent) => {
      // Eğer hiçbir menü açık değilse, işlem yapma
      if (!isProfileMenuOpen && !isNotificationsMenuOpen) {
        return;
      }
      
      // Tıklanan element
      const target = event.target as HTMLElement;
      
      // Menü içine veya menü butonlarına tıklanıp tıklanmadığını kontrol et - basit yol
      const isMenuClick = target.closest('#profile-menu') || target.closest('#notifications-menu');
      const isMenuButtonClick = target.closest('[aria-controls="profile-menu"]') || target.closest('[aria-controls="notifications-menu"]');
      
      // Eğer menü içine veya menü butonlarına tıklanmadıysa, menüleri kapat
      if (!isMenuClick && !isMenuButtonClick) {
        handleCloseAllMenus();
      }
    };

    // Olay dinleyicisini ekle
    document.addEventListener('mousedown', handleClickOutside);
    
    // Temizleme fonksiyonu
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen, isNotificationsMenuOpen]); // Bağımlılıkları ekledik

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CssBaseline />
        
        {/* Üst Menü - Modern ve şık tasarım */}
        <AppBar 
          position="fixed" 
          elevation={0}
          color="default"
          sx={{ 
            zIndex: theme.zIndex.drawer + 1,
            borderBottom: 'none',
            backgroundColor: alpha(theme.palette.background.paper, darkMode ? 0.8 : 0.9),
            backdropFilter: 'blur(8px)',
            boxShadow: `0 4px 20px -8px ${alpha(theme.palette.common.black, darkMode ? 0.3 : 0.15)}`,
            transition: 'all 0.3s ease',
          }}
        >
          <Toolbar 
            sx={{ 
              justifyContent: 'space-between', 
              padding: { xs: '0 16px', md: '0 24px' },
              minHeight: 70,
            }}>
          
            {/* Logo ve Başlık - Modern tasarım */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontWeight: 800, 
                  letterSpacing: '0.8px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  mr: 3,
                  textShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    width: '40%',
                    height: '4px',
                    borderRadius: '2px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    bottom: '-8px',
                    left: '0',
                    boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }
                }}
              >
                ERP Hybrid
              </Typography>
              
              {/* Üst Menü Sekmeleri - Şık ve modern tasarım */}
              <Tabs 
                value={selectedTab} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                  minHeight: 64,
                  '& .MuiTabs-indicator': {
                    display: 'none', // Göstergeyi gizliyoruz çünkü kendi göstergemiz var
                  },
                  '& .MuiTabs-flexContainer': {
                    gap: '8px', // Sekmeler arasında boşluk
                  }
                }}
              >
                {menuItems.map((item, index) => (
                  <MenuTab 
                    key={item.value}
                    label={item.text}
                    icon={item.icon}
                    aria-label={item.text}
                    disableRipple // Daha iyi performans için
                    sx={{
                      opacity: selectedTab === index ? 1 : 0.7,
                      transform: selectedTab === index ? 'scale(1.05)' : 'scale(1)',
                    }}
                  />
                ))}
              </Tabs>
            </Box>
            
            {/* Sağ Taraf Butonları - Modern ve şık tasarım */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Tema Değiştirme */}
              <Tooltip title="Tema Değiştir" arrow placement="bottom">
                <IconButton 
                  onClick={handleThemeToggle} 
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
