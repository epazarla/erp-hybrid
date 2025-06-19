import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  TableCell
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Undo as UndoIcon
} from '@mui/icons-material';
import { Task, updateTask, deleteTask, restoreTask, getTaskById } from '../services/TaskService';
import { User } from '../services/UserService';

interface TaskListProps {
  tasks: Task[];
  users: User[];
  onTasksChanged: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, users, onTasksChanged }) => {
  // State tanımlamaları
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [deletedTask, setDeletedTask] = useState<Task | null>(null);

  // Görevleri filtrele
  useEffect(() => {
    setLoading(true);
    let filtered = [...tasks];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Öncelik filtresi
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Sıralama: Önce son tarihe göre, sonra önceliğe göre
    filtered.sort((a, b) => {
      // Önce son tarihe göre sırala (yakın tarihler önce)
      const dateA = new Date(a.due_date);
      const dateB = new Date(b.due_date);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      
      // Tarihler aynıysa önceliğe göre sırala (yüksek öncelik önce)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setFilteredTasks(filtered);
    setLoading(false);
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  // Görev durumunu değiştir
  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      setLoading(true);
      const updatedTask = await updateTask(taskId, { status: newStatus });
      if (updatedTask) {
        setSnackbar({ 
          open: true, 
          message: `Görev durumu "${newStatus}" olarak güncellendi.`, 
          severity: 'success' 
        });
        onTasksChanged();
      }
    } catch (error) {
      console.error('Görev durumu güncellenirken hata:', error);
      setSnackbar({ 
        open: true, 
        message: 'Görev durumu güncellenirken bir hata oluştu.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Silme onay diyaloğunu aç
  const openDeleteDialog = (taskId: number) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  // Silme onay diyaloğunu kapat
  const closeDeleteDialog = () => {
    setTaskToDelete(null);
    setDeleteDialogOpen(false);
  };

  // Görev silme işlemi
  const handleDelete = async () => {
    if (taskToDelete === null) return;
    
    try {
      setLoading(true);
      console.log(`[${new Date().toISOString()}] Görev siliniyor, ID: ${taskToDelete}`);
      
      // Önce görevi getir ve sakla (geri almak için)
      const taskToSave = await getTaskById(taskToDelete);
      if (!taskToSave) {
        console.error(`[${new Date().toISOString()}] Silinecek görev bulunamadı, ID: ${taskToDelete}`);
        setSnackbar({ 
          open: true, 
          message: 'Görev bulunamadı.', 
          severity: 'error' 
        });
        return;
      }
      
      // Görevi sil
      const deleted = await deleteTask(taskToDelete);
      if (deleted) {
        // Silinen görevi sakla
        setDeletedTask(taskToSave);
        // taskToDelete'i null olarak ayarla
        setTaskToDelete(null);
        
        setSnackbar({ 
          open: true, 
          message: 'Görev başarıyla silindi. Geri almak için "Geri Al" butonuna tıklayın.', 
          severity: 'success' 
        });
        
        // Görev listesini yenile
        setTimeout(() => {
          onTasksChanged();
        }, 100);
      } else {
        console.error(`[${new Date().toISOString()}] Görev silinemedi, ID: ${taskToDelete}`);
        setSnackbar({ 
          open: true, 
          message: 'Görev silinirken bir hata oluştu. Lütfen tekrar deneyin.', 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Görev silinirken hata:`, error);
      setSnackbar({ 
        open: true, 
        message: 'Görev silinirken bir hata oluştu.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
      closeDeleteDialog();
    }
  };
  
  // Silinen görevi geri al
  const handleUndoDelete = async () => {
    if (!deletedTask) return;
    
    try {
      setLoading(true);
      
      // Görevi geri al
      const restoredTask = await restoreTask(deletedTask.id);
      
      if (restoredTask) {
        setSnackbar({
          open: true,
          message: 'Görev başarıyla geri alındı.',
          severity: 'success'
        });
        
        // Görevleri yeniden yükle
        onTasksChanged();
      } else {
        throw new Error('Görev geri alınamadı.');
      }
    } catch (error) {
      console.error('Görev geri alınırken hata:', error);
      setSnackbar({
        open: true,
        message: 'Görev geri alınırken bir hata oluştu.',
        severity: 'error'
      });
    } finally {
      setDeletedTask(null);
      setLoading(false);
    }
  };

  // Görev durumuna göre renk belirleme
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'tamamlandı':
        return 'success';
      case 'devam ediyor':
        return 'info';
      case 'bekliyor':
        return 'warning';
      case 'iptal edildi':
        return 'error';
      default:
        return 'default';
    }
  };

  // Görev durumuna göre ikon belirleme
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'tamamlandı':
        return <CheckCircleIcon color="success" />;
      case 'devam ediyor':
        return <ScheduleIcon color="info" />;
      case 'bekliyor':
        return <ScheduleIcon color="warning" />;
      case 'iptal edildi':
        return <ErrorOutlineIcon color="error" />;
      default:
        return null;
    }
  };

  // Önceliğe göre renk belirleme
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  // Filtreleri sıfırla
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  // Atanan kişi bilgisini getir
  const getAssignedUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Bilinmeyen Kullanıcı';
  };
  
  // Kullanıcı adını getir
  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Bilinmeyen Kullanıcı';
  };
  
  // Kullanıcı avatarını getir
  const getUserAvatar = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user?.avatar || '';
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="h2">
          Görevler ({filteredTasks.length})
        </Typography>
        <Box>
          <Tooltip title="Filtreleri Göster/Gizle">
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Yenile">
            <IconButton onClick={onTasksChanged}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Arama ve Filtreler */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Görev ara..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />

        {showFilters && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Durum</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Durum"
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  <MenuItem value="Bekliyor">Bekliyor</MenuItem>
                  <MenuItem value="Devam Ediyor">Devam Ediyor</MenuItem>
                  <MenuItem value="Tamamlandı">Tamamlandı</MenuItem>
                  <MenuItem value="İptal Edildi">İptal Edildi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Öncelik</InputLabel>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  label="Öncelik"
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  <MenuItem value="high">Yüksek</MenuItem>
                  <MenuItem value="medium">Orta</MenuItem>
                  <MenuItem value="low">Düşük</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={resetFilters}
                startIcon={<RefreshIcon />}
                size="small"
                fullWidth
              >
                Filtreleri Sıfırla
              </Button>
            </Grid>
          </Grid>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Görev Listesi */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredTasks.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Görüntülenecek görev bulunamadı.
        </Alert>
      ) : (
        <List>
          {filteredTasks.map((task) => (
            <React.Fragment key={task.id}>
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  borderRadius: '8px', 
                  mb: 1,
                  '&:hover': { bgcolor: 'action.hover' } 
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(task.status)}
                      <Typography variant="subtitle1" component="span">
                        {task.title}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {task.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        <Chip 
                          label={task.status} 
                          size="small" 
                          color={getStatusColor(task.status) as any}
                          variant="outlined"
                        />
                        <Chip 
                          label={task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'} 
                          size="small" 
                          color={getPriorityColor(task.priority) as any}
                          variant="outlined"
                        />
                        {task.assigned_to ? (
                          <Chip 
                            avatar={
                              getUserAvatar(task.assigned_to) ? (
                                <Avatar alt={getUserName(task.assigned_to)} src={getUserAvatar(task.assigned_to)} />
                              ) : (
                                <Avatar>{getUserName(task.assigned_to).charAt(0)}</Avatar>
                              )
                            }
                            label={getUserName(task.assigned_to)}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">Atanmadı</Typography>
                        )}
                        <Chip 
                          label={`Son Tarih: ${new Date(task.due_date).toLocaleDateString('tr-TR')}`} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Tooltip title="Düzenle">
                      <IconButton edge="end" aria-label="edit">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton edge="end" aria-label="delete" onClick={() => openDeleteDialog(task.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Bildirim Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        action={
          deletedTask && (
            <Button color="secondary" size="small" onClick={handleUndoDelete}>
              <UndoIcon fontSize="small" sx={{ mr: 0.5 }} />
              Geri Al
            </Button>
          )
        }
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Silme Onay Diyaloğu */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Görevi silmek istediğinizden emin misiniz?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bu işlem geri alınabilir, ancak görev listesinden kaldırılacaktır.
            Silinen görevi daha sonra "Geri Al" butonuna tıklayarak geri alabilirsiniz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            İptal
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TaskList;