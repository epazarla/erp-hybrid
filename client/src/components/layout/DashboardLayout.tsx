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
  Link
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
  Business as BusinessIcon
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

// Basitleştirilmiş menü tab butonu - performans için optimize edildi
const MenuTab = styled(Tab)(({ theme }) => ({
  minHeight: 64,
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
  padding: '6px 16px',
  borderRadius: '8px',
  margin: '0 4px',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  '& .MuiTab-iconWrapper': {
    marginBottom: 4,
    padding: '8px',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
  },
  '&.Mui-selected .MuiSvgIcon-root': {
    color: theme.palette.primary.main,
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
  
  // Profil menüsü
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
  
  // Profil menüsü - memoize edilmiş
  const handleProfileMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);
  
  const handleProfileMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  
  // Bildirimler menüsü - memoize edilmiş
  const handleNotificationsMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  }, []);
  
  const handleNotificationsMenuClose = useCallback(() => {
    setNotificationsAnchorEl(null);
  }, []);
  
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
  const notificationsMenu = useMemo(() => (
    <Menu
      anchorEl={notificationsAnchorEl}
      keepMounted
      open={Boolean(notificationsAnchorEl)}
      onClose={handleNotificationsMenuClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          width: 300,
          maxHeight: 300,
        },
      }}
    >
      <MenuItem onClick={handleNotificationsMenuClose}>
        <ListItemIcon>
          <InfoIcon color="primary" />
        </ListItemIcon>
        <ListItemText primary="Bildirim sistemi devre dışı" secondary="Performans için bildirimler basitleştirildi" />
      </MenuItem>
    </Menu>
  ), [notificationsAnchorEl, handleNotificationsMenuClose]);
  
  // Profil menüsü - memoize edilmiş
  const profileMenu = useMemo(() => (
    <Menu
      id="profile-menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleProfileMenuClose}
      PaperProps={{
        sx: {
          mt: 2,
          borderRadius: '12px',
          minWidth: 180,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 6px 20px rgba(0,0,0,0.3)'
            : '0 6px 20px rgba(0,0,0,0.1)',
          '& .MuiMenuItem-root': {
            borderRadius: '8px',
            margin: '4px 8px',
            padding: '8px 16px',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.primary.main, 0.2)
                : alpha(theme.palette.primary.main, 0.1),
            },
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={() => {
        handleProfileMenuClose();
        requestAnimationFrame(() => {
          window.location.replace('/profile');
        });
      }}>
        <ListItemIcon>
          <AccountCircleIcon fontSize="small" color="primary" />
        </ListItemIcon>
        <ListItemText>Profil</ListItemText>
      </MenuItem>
      
      <MenuItem onClick={() => {
        handleProfileMenuClose();
        requestAnimationFrame(() => {
          window.location.replace('/settings');
        });
      }}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" color="primary" />
        </ListItemIcon>
        <ListItemText>Ayarlar</ListItemText>
      </MenuItem>
      
      <Divider sx={{ my: 1 }} />
      
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText>Çıkış Yap</ListItemText>
      </MenuItem>
    </Menu>
  ), [anchorEl, handleProfileMenuClose, handleLogout, theme.palette]);

  // Seçili sekmeyi yükle - bildirim işlemleri kaldırıldı
  useEffect(() => {
    
    // Seçili sekmeyi belirle
    const currentPagePath = currentPath || '/dashboard';
    const tabIndex = menuItems.findIndex(item => item.path === currentPagePath);
    setSelectedTab(tabIndex >= 0 ? tabIndex : 0);
  }, [currentPath]);
  
  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CssBaseline />
        
        {/* Üst Menü */}
        <AppBar 
          position="fixed" 
          elevation={0}
          color="default"
          sx={{ 
            zIndex: theme.zIndex.drawer + 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Logo ve Başlık */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 700, 
                  letterSpacing: '0.5px',
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  mr: 2
                }}
              >
                ERP Hybrid
              </Typography>
              
              {/* Üst Menü Sekmeleri */}
              <Tabs 
                value={selectedTab} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ minHeight: 64 }}
              >
                {menuItems.map((item, index) => (
                  <MenuTab 
                    key={item.value}
                    label={item.text}
                    icon={item.icon}
                    aria-label={item.text}
                  />
                ))}
              </Tabs>
            </Box>
            
            {/* Sağ Taraf Butonları */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Tema Değiştirme */}
              <Tooltip title="Tema Değiştir">
                <IconButton 
                  onClick={handleThemeToggle} 
                  color="inherit" 
                  sx={{ ml: 1 }}
                >
                  {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Bildirimler">
                <IconButton 
                  color="inherit" 
                  sx={{ ml: 1 }}
                  onClick={handleNotificationsMenuOpen}
                  aria-controls="notifications-menu"
                  aria-haspopup="true"
                >
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
              {notificationsMenu}
              
              <Tooltip title="Profil">
                <IconButton 
                  onClick={handleProfileMenuOpen} 
                  color="inherit" 
                  sx={{ ml: 1 }}
                  aria-controls="profile-menu"
                  aria-haspopup="true"
                >
                  <Avatar 
                    src={user?.avatar}
                    sx={{ width: 30, height: 30 }}
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
