import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  loadAllUsers,
  loadPendingApprovalUsers,
  approveUserAsync,
  rejectUserAsync,
  getCurrentUserAsync,
  UserView,
  USER_STATUS
} from '../services/UserService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Define a new interface for the admin page state
interface AdminPageState {
  tabValue: number;
  pendingUsers: UserView[];
  allUsers: UserView[];
  loading: boolean;
  error: string;
  success: string;
  currentUser: UserView | null;
  dialogOpen: boolean;
  selectedUser: UserView | null;
  actionType: 'approve' | 'reject' | null;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

export default function AdminPage() {
  const [tabValue, setTabValue] = useState(0);
  const [pendingUsers, setPendingUsers] = useState<UserView[]>([]);
  const [allUsers, setAllUsers] = useState<UserView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState<UserView | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserView | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Kullanıcıları yükle
  useEffect(() => {
    const initializeAdminPage = async () => {
      try {
        const user = await getCurrentUserAsync();
        setCurrentUser(user);

        // Admin değilse erişim izni yok
        if (!user?.isAdmin) {
          setError('Bu sayfaya erişim yetkiniz bulunmamaktadır.');
          setLoading(false);
          return;
        }
        
        await loadUsers();
      } catch (err) {
        console.error('Admin sayfası başlatılırken hata:', err);
        setError('Sayfa yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    initializeAdminPage();

    // Event listener ekle
    window.addEventListener('usersUpdated', () => loadUsers());
    window.addEventListener('userApprovalRequested', () => loadUsers());
    
    return () => {
      window.removeEventListener('usersUpdated', () => loadUsers());
      window.removeEventListener('userApprovalRequested', () => loadUsers());
    };
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [pending, all] = await Promise.all([
        loadPendingApprovalUsers(),
        loadAllUsers()
      ]);
      
      setPendingUsers(pending);
      setAllUsers(all);
    } catch (err: any) {
      setError('Kullanıcılar yüklenirken bir hata oluştu.');
      console.error('Kullanıcılar yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleApprove = (user: UserView) => {
    setSelectedUser(user);
    setActionType('approve');
    setDialogOpen(true);
  };

  const handleReject = (user: UserView) => {
    setSelectedUser(user);
    setActionType('reject');
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser || !currentUser || !actionType) return;
    
    try {
      if (actionType === 'approve') {
        const success = await approveUserAsync(selectedUser.id, currentUser.id);
        if (success) {
          setSuccess(`${selectedUser.name} kullanıcısı başarıyla onaylandı.`);
          await loadUsers();
        } else {
          setError('Kullanıcı onaylanırken bir hata oluştu.');
        }
      } else {
        const success = await rejectUserAsync(selectedUser.id, currentUser.id);
        if (success) {
          setSuccess(`${selectedUser.name} kullanıcısının onay talebi reddedildi.`);
          await loadUsers();
        } else {
          setError('Kullanıcı reddedilirken bir hata oluştu.');
        }
      }
    } catch (err: any) {
      setError(`İşlem sırasında bir hata oluştu: ${err.message}`);
    } finally {
      setDialogOpen(false);
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setActionType(null);
  };

  // Admin değilse erişim izni yok
  if (!currentUser?.isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Bu sayfaya erişim yetkiniz bulunmamaktadır. Sadece yöneticiler bu sayfaya erişebilir.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Yönetici Paneli
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
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="Onay Bekleyen Kullanıcılar" {...a11yProps(0)} />
          <Tab label="Tüm Kullanıcılar" {...a11yProps(1)} />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Onay Bekleyen Kullanıcılar
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : pendingUsers.length === 0 ? (
          <Alert severity="info">Onay bekleyen kullanıcı bulunmamaktadır.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kullanıcı</TableCell>
                  <TableCell>E-posta</TableCell>
                  <TableCell>Kullanıcı Adı</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Departman</TableCell>
                  <TableCell>Kayıt Tarihi</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={user.avatar} alt={user.name} sx={{ mr: 2 }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        {user.name}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      {user.registrationDate 
                        ? new Date(user.registrationDate).toLocaleDateString('tr-TR') 
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small" 
                        onClick={() => handleApprove(user)}
                        sx={{ mr: 1 }}
                      >
                        Onayla
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        onClick={() => handleReject(user)}
                      >
                        Reddet
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Tüm Kullanıcılar
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : allUsers.length === 0 ? (
          <Alert severity="info">Sistemde kayıtlı kullanıcı bulunmamaktadır.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kullanıcı</TableCell>
                  <TableCell>E-posta</TableCell>
                  <TableCell>Kullanıcı Adı</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Departman</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Son Giriş</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={user.avatar} alt={user.name} sx={{ mr: 2 }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        {user.name}
                        {user.isAdmin && (
                          <Chip 
                            label="Admin" 
                            color="primary" 
                            size="small" 
                            sx={{ ml: 1 }} 
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      <Chip 
                        label={
                          user.approvalStatus === 'approved' 
                            ? user.status === USER_STATUS.ACTIVE 
                              ? 'Aktif' 
                              : 'Pasif'
                            : user.approvalStatus === 'pending'
                              ? 'Onay Bekliyor'
                              : 'Reddedildi'
                        }
                        color={
                          user.approvalStatus === 'approved' 
                            ? user.status === USER_STATUS.ACTIVE 
                              ? 'success' 
                              : 'default'
                            : user.approvalStatus === 'pending'
                              ? 'warning'
                              : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString('tr-TR') 
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>
      
      {/* Onay/Red Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          {actionType === 'approve' ? 'Kullanıcı Onaylama' : 'Kullanıcı Reddetme'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedUser && (
              <>
                <strong>{selectedUser.name}</strong> isimli kullanıcıyı 
                {actionType === 'approve' 
                  ? ' onaylamak' 
                  : ' reddetmek'} 
                istediğinizden emin misiniz?
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            İptal
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color={actionType === 'approve' ? 'primary' : 'error'} 
            variant="contained"
            autoFocus
          >
            {actionType === 'approve' ? 'Onayla' : 'Reddet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
