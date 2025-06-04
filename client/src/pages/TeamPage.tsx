import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tabs,
  Tab,
  InputAdornment,
  Tooltip,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  FilterList as FilterListIcon,
  PersonAdd as PersonAddIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  AccountCircle as AccountCircleIcon,
  Login as LoginIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import notificationService, { NotificationType } from '../services/NotificationService';
import UndoSnackbar from '../components/UndoSnackbar';
import { 
  syncTeamMembers, 
  updateUserStatus, 
  USER_STATUS, 
  USERS_UPDATED_EVENT, 
  setCurrentUser, 
  getCurrentUser, 
  USER_SWITCHED_EVENT,
  getPendingApprovalUsers,
  approveUser,
  rejectUser,
  USER_APPROVAL_REQUESTED_EVENT,
  USER_APPROVED_EVENT,
  USER_REJECTED_EVENT
} from '../services/UserService';

// Takım üyesi tipi
interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar?: string;
  department: string;
  status: 'active' | 'inactive' | 'vacation';
  tasks: number;
  completedTasks: number;
}

// Boş takım üyeleri listesi
const mockTeamMembers: TeamMember[] = [];

// Departman listesi
const departments = [
  'Tümü',
  'Yönetim',
  'Tasarım',
  'Yazılım',
  'Pazarlama',
  'Müşteri Hizmetleri'
];

// Durum renkleri
const statusColors = {
  active: 'success',
  inactive: 'error',
  vacation: 'warning'
};

// Durum metinleri
const statusTexts = {
  active: 'Aktif',
  inactive: 'Pasif',
  vacation: 'İzinde'
};

// Görünüm tipleri
type ViewType = 'grid' | 'list';

// LocalStorage'dan ekip üyelerini yükle
const loadTeamMembersFromStorage = (): TeamMember[] => {
  try {
    const savedMembers = localStorage.getItem('teamMembers');
    if (savedMembers) {
      return JSON.parse(savedMembers);
    }
  } catch (error) {
    console.error('Ekip üyeleri yüklenirken hata oluştu:', error);
  }
  
  // Ekip üyeleri yoksa boş dizi döndür
  return mockTeamMembers;
};

// LocalStorage'a ekip üyelerini kaydet
const saveTeamMembersToStorage = (members: TeamMember[]) => {
  try {
    localStorage.setItem('teamMembers', JSON.stringify(members));
  } catch (error) {
    console.error('Ekip üyeleri kaydedilirken hata oluştu:', error);
  }
};
export default function TeamPage() {
  // Temel state tanımlamaları
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(loadTeamMembersFromStorage());
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>(loadTeamMembersFromStorage());
  const [currentUser, setCurrentUserState] = useState<TeamMember | null>(null);
  const [pendingApprovalUsers, setPendingApprovalUsers] = useState<any[]>([]);
  
  // UI state tanımlamaları
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('Tümü');
  const [viewType, setViewType] = useState<ViewType>('grid');
  
  // Kullanıcı işlemleri için state tanımlamaları
  const [switchUserSnackbar, setSwitchUserSnackbar] = useState<{open: boolean, message: string}>({open: false, message: ''});
  
  // Form state tanımlamaları
  const [isAddMemberOpen, setIsAddMemberOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [newMember, setNewMember] = useState<TeamMember>({
    id: 0,
    name: '',
    role: '',
    email: '',
    phone: '',
    department: '',
    status: 'active',
    tasks: 0,
    completedTasks: 0
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Silme işlemleri için state tanımlamaları
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [deletedMember, setDeletedMember] = useState<TeamMember | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  
  // Ekip üyelerini UserService ile senkronize et ve mevcut kullanıcıyı yükle
  useEffect(() => {
    // Ekip üyelerini UserService'e gönder
    if (teamMembers.length > 0) {
      syncTeamMembers(teamMembers);
      console.log('Ekip üyeleri UserService ile senkronize edildi', teamMembers);
      
      // Mevcut kullanıcıyı yükle
      const user = getCurrentUser();
      if (user) {
        const currentTeamMember = teamMembers.find(m => m.id === user.id);
        if (currentTeamMember) {
          setCurrentUserState(currentTeamMember);
        }
      }
    }
    
    // Onay bekleyen kullanıcıları yükle
    loadPendingApprovalUsers();
    
    // Kullanıcı güncellemelerini dinle
    window.addEventListener(USERS_UPDATED_EVENT, handleUsersUpdated);
    window.addEventListener(USER_SWITCHED_EVENT, handleUserSwitched);
    window.addEventListener(USER_APPROVAL_REQUESTED_EVENT, handleUserApprovalRequested);
    
    return () => {
      window.removeEventListener(USERS_UPDATED_EVENT, handleUsersUpdated);
      window.removeEventListener(USER_SWITCHED_EVENT, handleUserSwitched);
      window.removeEventListener(USER_APPROVAL_REQUESTED_EVENT, handleUserApprovalRequested);
    };
  }, []);
  
  // Kullanıcı güncellemelerini dinle
  const handleUsersUpdated = () => {
    // Ekip üyelerini yeniden yükle
    setTeamMembers(loadTeamMembersFromStorage());
    
    // Filtreleri uygula
    applyFilters(searchQuery, selectedDepartment);
    
    // Onay bekleyen kullanıcıları yeniden yükle
    loadPendingApprovalUsers();
  };
  
  // Kullanıcı değişikliklerini dinle
  const handleUserSwitched = (event: Event) => {
    const customEvent = event as CustomEvent;
    const user = customEvent.detail?.user;
    
    if (user) {
      const teamMember = teamMembers.find(m => m.id === user.id);
      if (teamMember) {
        setCurrentUserState(teamMember);
        
        // Bildirim göster
        setSwitchUserSnackbar({
          open: true,
          message: `Aktif kullanıcı ${teamMember.name} olarak değiştirildi`
        });
      }
    }
  };
  
  // Onay bekleyen kullanıcı olduğunda bildirim
  const handleUserApprovalRequested = () => {
    loadPendingApprovalUsers();
    
    notificationService.showNotification(
      'Yeni bir kullanıcı onay bekliyor',
      NotificationType.INFO
    );
  };
  
  // Onay bekleyen kullanıcıları yükle
  const loadPendingApprovalUsers = () => {
    const pendingUsers = getPendingApprovalUsers();
    setPendingApprovalUsers(pendingUsers);
  };
  
  // Not: Giriş yapma özelliği kaldırıldı
  
  // Kullanıcıyı onayla
  const handleApproveUser = (userId: number) => {
    if (!currentUser) {
      notificationService.showNotification(
        'Kullanıcı onaylamak için giriş yapmalısınız',
        NotificationType.WARNING
      );
      return;
    }
    
    const success = approveUser(userId, currentUser.id);
    
    if (success) {
      notificationService.showNotification(
        'Kullanıcı başarıyla onaylandı',
        NotificationType.SUCCESS
      );
      
      // Onay bekleyen kullanıcıları yeniden yükle
      loadPendingApprovalUsers();
    } else {
      notificationService.showNotification(
        'Kullanıcı onaylanırken bir hata oluştu',
        NotificationType.ERROR
      );
    }
  };
  
  // Kullanıcı onayını reddet
  const handleRejectUser = (userId: number) => {
    if (!currentUser) {
      notificationService.showNotification(
        'Kullanıcı reddetmek için giriş yapmalısınız',
        NotificationType.WARNING
      );
      return;
    }
    
    const success = rejectUser(userId, currentUser.id);
    
    if (success) {
      notificationService.showNotification(
        'Kullanıcı reddedildi',
        NotificationType.SUCCESS
      );
      
      // Onay bekleyen kullanıcıları yeniden yükle
      loadPendingApprovalUsers();
    } else {
      notificationService.showNotification(
        'Kullanıcı reddedilirken bir hata oluştu',
        NotificationType.ERROR
      );
    }
  };
  
  // Filtreleri uygula - useCallback ile optimize edildi
  const applyFilters = useCallback((query: string, department: string) => {
    let filtered = [...teamMembers];
    
    // Arama filtresi
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(lowerCaseQuery) ||
        member.email.toLowerCase().includes(lowerCaseQuery) ||
        member.role.toLowerCase().includes(lowerCaseQuery) ||
        member.department.toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    // Departman filtresi
    if (department !== 'Tümü') {
      filtered = filtered.filter(member => member.department === department);
    }
    
    setFilteredMembers(filtered);
  }, [teamMembers]);
  
  // Arama ve filtreleme - useCallback ile optimize edildi
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(query, selectedDepartment);
  }, [selectedDepartment, applyFilters]);
  
  // Departman filtresi - useCallback ile optimize edildi
  const handleDepartmentChange = useCallback((department: string) => {
    setSelectedDepartment(department);
    applyFilters(searchQuery, department);
  }, [searchQuery, applyFilters]);
  
  // Üye ekleme modalını aç
  const handleOpenAddMember = () => {
    setIsEditMode(false);
    setNewMember({
      id: 0,
      name: '',
      role: '',
      email: '',
      phone: '',
      department: '',
      status: 'active',
      tasks: 0,
      completedTasks: 0
    });
    setFormErrors({});
    setIsAddMemberOpen(true);
  };
  
  // Üye düzenleme modalını aç
  const handleEditMember = (member: TeamMember) => {
    // Kullanıcının sadece kendi profilini düzenlemesine izin ver
    if (currentUser && member.id !== currentUser.id) {
      notificationService.showNotification(
        'Sadece kendi profilinizi düzenleyebilirsiniz',
        NotificationType.WARNING
      );
      return;
    }
    
    setIsEditMode(true);
    setNewMember({...member});
    setFormErrors({});
    setIsAddMemberOpen(true);
  };
  
  // Form alanlarını güncelle - useCallback ile optimize edildi
  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    
    // Hata mesajını temizle
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name as string]: ''
      }));
    }
    
    setNewMember(prev => ({
      ...prev,
      [name as string]: value
    }));
  }, [formErrors]);
  
  // Form doğrulama
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Ad kontrolü
    if (!newMember.name.trim()) {
      errors.name = 'Ad alanı zorunludur';
    } else if (newMember.name.trim().length < 2) {
      errors.name = 'Ad en az 2 karakter olmalıdır';
    }
    
    // Rol kontrolü
    if (!newMember.role.trim()) {
      errors.role = 'Rol alanı zorunludur';
    }
    
    // E-posta kontrolü
    if (!newMember.email.trim()) {
      errors.email = 'E-posta alanı zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMember.email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz';
    } else if (!isEditMode) {
      // Yeni üye eklenirken e-posta benzersizliği kontrolü
      const existingMember = teamMembers.find(
        m => m.email.toLowerCase() === newMember.email.toLowerCase()
      );
      if (existingMember) {
        errors.email = 'Bu e-posta adresi zaten kullanılıyor';
      }
    }
    
    // Telefon kontrolü
    if (!newMember.phone.trim()) {
      errors.phone = 'Telefon alanı zorunludur';
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(newMember.phone)) {
      errors.phone = 'Geçerli bir telefon numarası giriniz';
    }
    
    // Departman kontrolü
    if (!newMember.department) {
      errors.department = 'Departman seçimi zorunludur';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Üye ekle/düzenle
  const handleSaveMember = async () => {
    // Form doğrulama
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Yeni üye mi yoksa düzenleme mi?
      if (isEditMode) {
        // Mevcut üyeyi güncelle
        const updatedMembers = teamMembers.map(member => 
          member.id === newMember.id ? newMember : member
        );
        
        setTeamMembers(updatedMembers);
        saveTeamMembersToStorage(updatedMembers);
        
        // Filtrelenmiş listeyi güncelle
        applyFilters(searchQuery, selectedDepartment);
        
        // Başarı mesajı
        notificationService.showNotification(
          `${newMember.name} başarıyla güncellendi`,
          NotificationType.SUCCESS
        );
        
        // Aktif kullanıcı güncellendiyse state'i güncelle
        if (currentUser?.id === newMember.id) {
          setCurrentUserState(newMember);
        }
      } else {
        // Yeni üye ID'si oluştur
        const maxId = teamMembers.reduce((max, member) => Math.max(max, member.id), 0);
        const newId = maxId + 1;
        
        // Yeni üye oluştur
        const memberToAdd: TeamMember = {
          ...newMember,
          id: newId,
          tasks: 0,
          completedTasks: 0
        };
        
        // Üyeyi ekle
        const updatedMembers = [...teamMembers, memberToAdd];
        setTeamMembers(updatedMembers);
        saveTeamMembersToStorage(updatedMembers);
        
        // Filtrelenmiş listeyi güncelle
        applyFilters(searchQuery, selectedDepartment);
        
        // Başarı mesajı
        notificationService.showNotification(
          `${memberToAdd.name} başarıyla eklendi`,
          NotificationType.SUCCESS
        );
      }
    } catch (error) {
      console.error('Üye kaydedilirken hata oluştu:', error);
      notificationService.showNotification(
        'Üye kaydedilirken bir hata oluştu',
        NotificationType.ERROR
      );
    } finally {
      setIsSubmitting(false);
      setIsAddMemberOpen(false);
    }
  };
  
  // Silme onay diyaloğunu aç
  const handleDeleteConfirmation = (member: TeamMember) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };
  
  // Silme onay diyaloğunu kapat
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMemberToDelete(null);
  };
  
  // Üye sil
  const handleDeleteMember = () => {
    if (!memberToDelete) return;
    
    try {
      // Silinen üyeyi sakla (geri alma için)
      setDeletedMember(memberToDelete);
      
      // Üyeyi sil
      const updatedMembers = teamMembers.filter(member => member.id !== memberToDelete.id);
      setTeamMembers(updatedMembers);
      saveTeamMembersToStorage(updatedMembers);
      
      // Filtrelenmiş listeyi güncelle
      applyFilters(searchQuery, selectedDepartment);
      
      // Snackbar göster
      setSnackbarMessage(`${memberToDelete.name} silindi`);
      setSnackbarOpen(true);
      
      // Aktif kullanıcı silindiyse state'i temizle
      if (currentUser?.id === memberToDelete.id) {
        setCurrentUserState(null);
      }
      
      // Diyaloğu kapat
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Üye silinirken hata oluştu:', error);
      notificationService.showNotification(
        'Üye silinirken bir hata oluştu',
        NotificationType.ERROR
      );
    }
  };
  
  // Silinen üyeyi geri al
  const handleUndoDelete = () => {
    if (!deletedMember) return;
    
    try {
      // Üyeyi geri ekle
      const updatedMembers = [...teamMembers, deletedMember];
      setTeamMembers(updatedMembers);
      saveTeamMembersToStorage(updatedMembers);
      
      // Filtrelenmiş listeyi güncelle
      applyFilters(searchQuery, selectedDepartment);
      
      // Başarı mesajı
      notificationService.showNotification(
        `${deletedMember.name} geri alındı`,
        NotificationType.SUCCESS
      );
      
      // Snackbar kapat
      setSnackbarOpen(false);
      
      // Silinen üye state'ini temizle
      setDeletedMember(null);
    } catch (error) {
      console.error('Üye geri alınırken hata oluştu:', error);
      notificationService.showNotification(
        'Üye geri alınırken bir hata oluştu',
        NotificationType.ERROR
      );
    }
  };
  
  // Snackbar kapatma işlevi
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  // Grid görünümü
  const renderGridView = () => {
    return (
      <Grid container spacing={3}>
        {filteredMembers.map(member => (
          <Grid item xs={12} sm={6} md={4} key={member.id}>
            <Card 
              sx={{
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                bgcolor: currentUser?.id === member.id ? 'rgba(33, 150, 243, 0.1)' : 'inherit',
                borderLeft: currentUser?.id === member.id ? '4px solid #2196f3' : 'none'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={member.avatar} 
                    sx={{ width: 56, height: 56, mr: 2 }}
                  >
                    {member.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="div">
                      {member.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.role}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    label={statusTexts[member.status]} 
                    color={statusColors[member.status] as any} 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                  {currentUser?.id === member.id && (
                    <Chip 
                      label="Aktif Kullanıcı" 
                      color="primary" 
                      size="small" 
                    />
                  )}
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <MailIcon fontSize="small" sx={{ mr: 1 }} />
                    {member.email}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                    {member.phone}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <BadgeIcon fontSize="small" sx={{ mr: 1 }} />
                    {member.department}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                {currentUser?.id === member.id && (
                  <Chip 
                    label="Aktif Kullanıcı" 
                    color="primary" 
                    size="small" 
                  />
                )}
                <IconButton 
                  size="small" 
                  onClick={() => handleEditMember(member)}
                  disabled={currentUser?.id !== member.id}
                  title={currentUser?.id !== member.id ? 'Sadece kendi profilinizi düzenleyebilirsiniz' : 'Profilinizi düzenleyin'}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDeleteConfirmation(member)}
                  disabled={true}
                  title="Kullanıcı silme işlemi devre dışı bırakılmıştır"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };
  
  // Liste görünümü
  const renderListView = () => {
    return (
      <List sx={{ bgcolor: 'background.paper' }}>
        {filteredMembers.map(member => (
          <React.Fragment key={member.id}>
            <ListItem
              sx={{
                bgcolor: currentUser?.id === member.id ? 'rgba(33, 150, 243, 0.1)' : 'inherit',
                borderLeft: currentUser?.id === member.id ? '4px solid #2196f3' : 'none'
              }}
              secondaryAction={
                <Box>
                  {currentUser?.id === member.id && (
                    <Chip 
                      label="Aktif Kullanıcı" 
                      color="primary" 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                  )}
                  <IconButton 
                    edge="end" 
                    aria-label="edit" 
                    onClick={() => handleEditMember(member)}
                    disabled={currentUser?.id !== member.id}
                    title={currentUser?.id !== member.id ? 'Sadece kendi profilinizi düzenleyebilirsiniz' : 'Profilinizi düzenleyin'}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    aria-label="delete" 
                    onClick={() => handleDeleteConfirmation(member)}
                    disabled={true}
                    title="Kullanıcı silme işlemi devre dışı bırakılmıştır"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemAvatar>
                <Avatar src={member.avatar}>
                  {member.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1" component="span">
                      {member.name}
                    </Typography>
                    <Chip 
                      label={statusTexts[member.status]} 
                      color={statusColors[member.status] as any} 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                    {currentUser?.id === member.id && (
                      <Chip 
                        label="Aktif Kullanıcı" 
                        color="primary" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {member.role} - {member.department}
                    </Typography>
                    <Typography component="div" variant="body2">
                      {member.email} | {member.phone}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    );
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Ekip Yönetimi
          </Typography>
          {currentUser && (
            <Chip
              icon={<AccountCircleIcon />}
              label={`Aktif Kullanıcı: ${currentUser.name}`}
              color="primary"
              variant="outlined"
              sx={{ ml: 2 }}
            />
          )}
          {pendingApprovalUsers.length > 0 && (
            <Chip
              icon={<HourglassEmptyIcon />}
              label={`Onay Bekleyen: ${pendingApprovalUsers.length}`}
              color="warning"
              variant="outlined"
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenAddMember}
            sx={{ mr: 1 }}
          >
            Yeni Üye Ekle
          </Button>
        </Box>
      </Box>
      
      {/* Onay bekleyen kullanıcılar */}
      {pendingApprovalUsers.length > 0 && (
        <Paper sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Onay Bekleyen Kullanıcılar ({pendingApprovalUsers.length})
          </Typography>
          
          <Grid container spacing={2}>
            {pendingApprovalUsers.map(user => (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2 }}>
                        {user.name?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{user.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.department || 'Departman belirtilmemiş'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Kayıt: {new Date(user.registrationDate).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      startIcon={<CheckCircleIcon />} 
                      variant="contained" 
                      color="success"
                      size="small"
                      onClick={() => handleApproveUser(user.id)}
                    >
                      Onayla
                    </Button>
                    <Button 
                      startIcon={<CancelIcon />} 
                      variant="contained" 
                      color="error"
                      size="small"
                      onClick={() => handleRejectUser(user.id)}
                    >
                      Reddet
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
      
      {/* Arama ve Filtreler */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Ara..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Departman</InputLabel>
              <Select
                value={selectedDepartment}
                label="Departman"
                onChange={(e) => handleDepartmentChange(e.target.value as string)}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 48 * 4.5,
                      width: 250,
                    },
                  },
                  // Önemli performans iyileştirmesi
                  disablePortal: true,
                  variant: 'menu',
                }}
              >
                {departments.map(department => (
                  <MenuItem key={department} value={department}>
                    {department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Tabs
                value={viewType}
                onChange={(e, newValue) => setViewType(newValue as ViewType)}
                aria-label="Görünüm tipi"
              >
                <Tab 
                  icon={<ViewModuleIcon />} 
                  aria-label="grid" 
                  value="grid"
                  sx={{ minWidth: 'auto' }}
                />
                <Tab 
                  icon={<ViewListIcon />} 
                  aria-label="list" 
                  value="list"
                  sx={{ minWidth: 'auto' }}
                />
              </Tabs>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Ekip üyeleri listesi */}
      {filteredMembers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Ekip üyesi bulunamadı
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Yeni bir ekip üyesi ekleyin veya arama kriterlerinizi değiştirin
          </Typography>
        </Paper>
      ) : (
        viewType === 'grid' ? renderGridView() : renderListView()
      )}
      
      {/* Üye ekleme/düzenleme diyaloğu */}
      <Dialog 
        open={isAddMemberOpen} 
        onClose={() => setIsAddMemberOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? 'Ekip Üyesini Düzenle' : 'Yeni Ekip Üyesi Ekle'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ad Soyad"
                name="name"
                value={newMember.name}
                onChange={handleFormChange}
                fullWidth
                required
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Rol"
                name="role"
                value={newMember.role}
                onChange={handleFormChange}
                fullWidth
                required
                error={!!formErrors.role}
                helperText={formErrors.role}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="E-posta"
                name="email"
                type="email"
                value={newMember.email}
                onChange={handleFormChange}
                fullWidth
                required
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Telefon"
                name="phone"
                value={newMember.phone}
                onChange={handleFormChange}
                fullWidth
                required
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!formErrors.department}>
                <InputLabel>Departman</InputLabel>
                <Select
                  name="department"
                  value={newMember.department}
                  onChange={handleFormChange}
                  label="Departman"
                >
                  {departments.filter(d => d !== 'Tümü').map(department => (
                    <MenuItem key={department} value={department}>
                      {department}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.department && (
                  <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formErrors.department}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Durum</InputLabel>
                <Select
                  name="status"
                  value={newMember.status}
                  onChange={handleFormChange}
                  label="Durum"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 3,
                        width: 250,
                      },
                    },
                    // Önemli performans iyileştirmesi
                    disablePortal: true,
                    variant: 'menu',
                  }}
                >
                  <MenuItem value="active">Aktif</MenuItem>
                  <MenuItem value="inactive">Pasif</MenuItem>
                  <MenuItem value="vacation">İzinde</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Profil Resmi URL"
                name="avatar"
                value={newMember.avatar || ''}
                onChange={handleFormChange}
                fullWidth
                placeholder="https://example.com/avatar.jpg"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setIsAddMemberOpen(false)} 
            color="inherit"
            disabled={isSubmitting}
          >
            İptal
          </Button>
          <Button 
            onClick={handleSaveMember} 
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isEditMode ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Kullanıcı değişikliği bildirim snackbar */}
      <Snackbar
        open={switchUserSnackbar.open}
        autoHideDuration={3000}
        onClose={() => setSwitchUserSnackbar({...switchUserSnackbar, open: false})}
        message={switchUserSnackbar.message}
        action={
          <Button color="inherit" size="small" onClick={() => setSwitchUserSnackbar({...switchUserSnackbar, open: false})}>
            TAMAM
          </Button>
        }
      />
      
      {/* Silme Onay Diyaloğu */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Ekip Üyesini Sil
        </DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            {memberToDelete && (
              <><b>{memberToDelete.name}</b> adlı ekip üyesini silmek istediğinize emin misiniz? Bu işlem geri alınabilir.</>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            İptal
          </Button>
          <Button 
            onClick={handleDeleteMember} 
            color="error" 
            variant="contained"
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Silme geri alma snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        action={
          <Button color="secondary" size="small" onClick={handleUndoDelete}>
            GERİ AL
          </Button>
        }
      />
    </Box>
  );
}
