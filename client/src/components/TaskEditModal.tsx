import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  IconButton,
  Typography,
  Box,
  Divider,
  Chip,
  Avatar,
  Grid,
  Slider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Autocomplete,
  Tooltip,
  Badge
} from '@mui/material';
import { 
  Save as SaveIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Label as LabelIcon,
  Timer as TimerIcon,
  AccessTime as AccessTimeIcon,
  Comment as CommentIcon,
  Link as LinkIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { 
  Task, 
  updateTask, 
  TaskComment, 
  TASK_STATUSES, 
  TASK_STATUS_LABELS,
  TASK_PRIORITIES, 
  TASK_TAGS,
  getAllTasks,
  addTagToTask,
  removeTagFromTask,
  addCommentToTask,
  removeCommentFromTask,
  addTaskDependency,
  removeTaskDependency,
  updateTaskProgress,
  updateTaskWorkHours,
  setTaskReminder
} from '../services/TaskService';
import { getAllUsers, getCurrentUser, User } from '../services/UserService';

interface TaskEditModalProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export default function TaskEditModal({ open, task, onClose, onTaskUpdated }: TaskEditModalProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: '',
    assigned_to: 0,
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: new Date(),
    // Yeni alanlar
    tags: [] as string[],
    progress: 0,
    estimated_hours: 0,
    actual_hours: 0,
    dependencies: [] as number[],
    reminder_date: '',
    start_date: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [newTag, setNewTag] = useState('');
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [selectedDependency, setSelectedDependency] = useState<number | null>(null);
  
  // Kullanıcıları ve görevleri yükle
  useEffect(() => {
    if (open) {
      const loadData = async () => {
        setLoadingUsers(true);
        try {
          // Kullanıcıları yükle
          const allUsers = await getAllUsers();
          setUsers(allUsers);
          
          // Mevcut kullanıcıyı al
          const current = await getCurrentUser();
          setCurrentUser(current);
          
          // Tüm görevleri yükle (bağımlılıklar için)
          const tasks = await getAllTasks();
          setAllTasks(tasks.filter(t => t.id !== task?.id)); // Kendisi hariç tüm görevler
          
          console.log('Veriler başarıyla yüklendi:', allUsers.length, 'kullanıcı,', tasks.length, 'görev');
        } catch (err) {
          console.error('Veriler yüklenirken hata oluştu:', err);
        } finally {
          setLoadingUsers(false);
        }
      };
      
      loadData();
    }
  }, [open, task?.id]);
  
  // Form alanlarını görevden doldur
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        status: task.status,
        assigned_to: task.assigned_to,
        priority: task.priority || 'medium',
        due_date: new Date(task.due_date),
        // Yeni alanlar
        tags: task.tags || [],
        progress: task.progress || 0,
        estimated_hours: task.estimated_hours || 0,
        actual_hours: task.actual_hours || 0,
        dependencies: task.dependencies || [],
        reminder_date: task.reminder_date || '',
        start_date: task.start_date || new Date().toISOString()
      });
      
      // Yorumları ayarla
      setComments(task.comments || []);
    }
  }, [task]);
  
  // Form değişikliklerini işle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  // Select değişikliklerini işle
  const handleSelectChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  // Tarih değişikliklerini işle
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setForm({ ...form, due_date: date });
    }
  };
  
  // Formu gönder
  const handleSubmit = async () => {
    if (!task) return;
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Form verilerini doğrula
      if (!form.title.trim()) {
        throw new Error('Görev başlığı gereklidir.');
      }
      
      // Form verilerini hazırla
      const updatedTask = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        assigned_to: form.assigned_to,
        priority: form.priority as 'low' | 'medium' | 'high',
        due_date: form.due_date.toISOString(),
        // Yeni alanlar
        tags: form.tags,
        progress: form.progress,
        estimated_hours: form.estimated_hours,
        actual_hours: form.actual_hours,
        dependencies: form.dependencies,
        reminder_date: form.reminder_date,
        start_date: form.start_date
      };
      
      console.log(`Görev güncelleniyor: ID=${task.id}`, updatedTask);
      
      // Görevi güncelle
      const result = await updateTask(task.id, updatedTask);
      
      if (result) {
        console.log('Görev başarıyla güncellendi:', result);
        setSuccess(true);
        setTimeout(() => {
          onTaskUpdated();
          onClose();
        }, 1000);
      } else {
        throw new Error('Görev güncellenemedi.');
      }
    } catch (err: any) {
      console.error('Görev güncellenirken hata:', err);
      setError(err.message || 'Görev güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  // Tab değişimi
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Etiket ekleme
  const handleAddTag = () => {
    if (newTag && !form.tags.includes(newTag)) {
      setForm({
        ...form,
        tags: [...form.tags, newTag]
      });
      setNewTag('');
    }
  };
  
  // Etiket silme
  const handleRemoveTag = (tag: string) => {
    setForm({
      ...form,
      tags: form.tags.filter(t => t !== tag)
    });
  };
  
  // İlerleme durumu değişimi
  const handleProgressChange = (event: Event, newValue: number | number[]) => {
    setForm({
      ...form,
      progress: newValue as number
    });
  };
  
  // Bağımlılık ekleme
  const handleAddDependency = () => {
    if (selectedDependency && !form.dependencies.includes(selectedDependency)) {
      setForm({
        ...form,
        dependencies: [...form.dependencies, selectedDependency]
      });
      setSelectedDependency(null);
    }
  };
  
  // Bağımlılık silme
  const handleRemoveDependency = (depId: number) => {
    setForm({
      ...form,
      dependencies: form.dependencies.filter(id => id !== depId)
    });
  };
  
  // Yorum ekleme
  const handleAddComment = () => {
    if (!task || !currentUser || !newComment.trim()) return;
    
    const result = addCommentToTask(task.id, currentUser.id, newComment.trim());
    if (result && result.comments) {
      setComments(result.comments);
      setNewComment('');
    }
  };
  
  // Yorum silme
  const handleRemoveComment = (commentId: number) => {
    if (!task) return;
    
    const result = removeCommentFromTask(task.id, commentId);
    if (result && result.comments) {
      setComments(result.comments);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Görev Düzenle</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Görev başarıyla güncellendi!</Alert>}
        
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Görev Başlığı"
            fullWidth
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            error={!form.title.trim()}
            helperText={!form.title.trim() ? 'Görev başlığı gereklidir' : ''}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Açıklama"
            fullWidth
            multiline
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  disabled={loading}
                >
                  {TASK_STATUSES.map(status => (
                    <MenuItem key={status} value={status}>
                      {TASK_STATUS_LABELS[status]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Öncelik</InputLabel>
                <Select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  disabled={loading}
                >
                  <MenuItem value="low">Düşük</MenuItem>
                  <MenuItem value="medium">Orta</MenuItem>
                  <MenuItem value="high">Yüksek</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Atanan Kişi</InputLabel>
                <Select
                  value={form.assigned_to}
                  onChange={(e) => setForm({ ...form, assigned_to: Number(e.target.value) })}
                  disabled={loading || loadingUsers}
                >
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={user.avatar}
                          alt={user.name}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        {user.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {loadingUsers && <FormHelperText>Kullanıcılar yükleniyor...</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Bitiş Tarihi"
                  value={form.due_date}
                  onChange={(newValue) => newValue && setForm({ ...form, due_date: newValue })}
                  disabled={loading}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
          
          {/* Sekme Menüsü */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="task detail tabs">
              <Tab label="Etiketler" icon={<LabelIcon />} iconPosition="start" />
              <Tab label="İlerleme" icon={<CheckCircleIcon />} iconPosition="start" />
              <Tab label="Bağımlılıklar" icon={<LinkIcon />} iconPosition="start" />
              <Tab label="Yorumlar" icon={<CommentIcon />} iconPosition="start" />
              <Tab label="Zaman" icon={<TimerIcon />} iconPosition="start" />
            </Tabs>
          </Box>
          
          {/* Etiketler Sekmesi */}
          <Box role="tabpanel" hidden={activeTab !== 0} sx={{ py: 2 }}>
            {activeTab === 0 && (
              <>
                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                  <TextField
                    label="Yeni Etiket"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    size="small"
                    sx={{ mr: 1, flexGrow: 1 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddTag}
                    disabled={!newTag.trim() || form.tags.includes(newTag)}
                    startIcon={<AddIcon />}
                  >
                    Ekle
                  </Button>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Önerilen Etiketler:</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {TASK_TAGS.filter(tag => !form.tags.includes(tag)).map(tag => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        onClick={() => {
                          if (!form.tags.includes(tag)) {
                            setForm({
                              ...form,
                              tags: [...form.tags, tag]
                            });
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>Mevcut Etiketler:</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {form.tags.length > 0 ? (
                    form.tags.map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        color="primary"
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Henüz etiket eklenmemiş.
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
          
          {/* İlerleme Sekmesi */}
          <Box role="tabpanel" hidden={activeTab !== 1} sx={{ py: 2 }}>
            {activeTab === 1 && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    İlerleme Durumu: %{form.progress}
                  </Typography>
                  <Slider
                    value={form.progress}
                    onChange={handleProgressChange}
                    aria-labelledby="progress-slider"
                    valueLabelDisplay="auto"
                    step={5}
                    marks
                    min={0}
                    max={100}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Başlangıç Tarihi:</Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={form.start_date ? new Date(form.start_date) : null}
                      onChange={(newValue) => newValue && setForm({ 
                        ...form, 
                        start_date: newValue.toISOString() 
                      })}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Box>
              </>
            )}
          </Box>
          
          {/* Bağımlılıklar Sekmesi */}
          <Box role="tabpanel" hidden={activeTab !== 2} sx={{ py: 2 }}>
            {activeTab === 2 && (
              <>
                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                  <FormControl sx={{ mr: 1, flexGrow: 1 }}>
                    <InputLabel>Bağımlı Olduğu Görev</InputLabel>
                    <Select
                      value={selectedDependency || ''}
                      onChange={(e) => setSelectedDependency(Number(e.target.value) || null)}
                      displayEmpty
                    >
                      <MenuItem value="">Görev Seçin</MenuItem>
                      {allTasks.map(t => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddDependency}
                    disabled={!selectedDependency || form.dependencies.includes(selectedDependency)}
                    startIcon={<AddIcon />}
                  >
                    Ekle
                  </Button>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>Bağımlı Olduğu Görevler:</Typography>
                {form.dependencies.length > 0 ? (
                  <List>
                    {form.dependencies.map(depId => {
                      const depTask = allTasks.find(t => t.id === depId);
                      return (
                        <ListItem key={depId}>
                          <ListItemText
                            primary={depTask?.title || `Görev #${depId}`}
                            secondary={depTask?.status ? `Durum: ${depTask.status}` : ''}
                          />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={() => handleRemoveDependency(depId)}>
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Henüz bağımlılık eklenmemiş.
                  </Typography>
                )}
              </>
            )}
          </Box>
          
          {/* Yorumlar Sekmesi */}
          <Box role="tabpanel" hidden={activeTab !== 3} sx={{ py: 2 }}>
            {activeTab === 3 && (
              <>
                <Box display="flex" alignItems="flex-start" sx={{ mb: 2 }}>
                  <TextField
                    label="Yeni Yorum"
                    multiline
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    sx={{ mr: 1, flexGrow: 1 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || !currentUser}
                    sx={{ mt: 1 }}
                  >
                    Yorum Ekle
                  </Button>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>Yorumlar ({comments.length}):</Typography>
                {comments.length > 0 ? (
                  <List>
                    {comments.map(comment => {
                      const commentUser = users.find(u => u.id === comment.user_id);
                      return (
                        <Paper key={comment.id} sx={{ p: 2, mb: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Box display="flex" alignItems="center">
                              <Avatar
                                src={commentUser?.avatar}
                                alt={commentUser?.name || 'Kullanıcı'}
                                sx={{ width: 32, height: 32, mr: 1 }}
                              />
                              <Typography variant="subtitle2">
                                {commentUser?.name || 'Kullanıcı'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(comment.created_at).toLocaleString()}
                              </Typography>
                              {currentUser?.id === comment.user_id && (
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleRemoveComment(comment.id)}
                                  sx={{ ml: 1 }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                          <Typography variant="body2">{comment.comment}</Typography>
                        </Paper>
                      );
                    })}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Henüz yorum yapılmamış.
                  </Typography>
                )}
              </>
            )}
          </Box>
          
          {/* Zaman Sekmesi */}
          <Box role="tabpanel" hidden={activeTab !== 4} sx={{ py: 2 }}>
            {activeTab === 4 && (
              <>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>Tahmini Süre (Saat):</Typography>
                    <TextField
                      type="number"
                      value={form.estimated_hours}
                      onChange={(e) => setForm({ 
                        ...form, 
                        estimated_hours: Math.max(0, Number(e.target.value)) 
                      })}
                      InputProps={{ inputProps: { min: 0 } }}
                      fullWidth
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>Gerçekleşen Süre (Saat):</Typography>
                    <TextField
                      type="number"
                      value={form.actual_hours}
                      onChange={(e) => setForm({ 
                        ...form, 
                        actual_hours: Math.max(0, Number(e.target.value)) 
                      })}
                      InputProps={{ inputProps: { min: 0 } }}
                      fullWidth
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>Hatırlatıcı:</Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Hatırlatıcı Tarihi"
                        value={form.reminder_date ? new Date(form.reminder_date) : null}
                        onChange={(newValue) => setForm({ 
                          ...form, 
                          reminder_date: newValue ? newValue.toISOString() : '' 
                        })}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </LocalizationProvider>
                    
                    {form.reminder_date && (
                      <Button 
                        variant="outlined" 
                        color="secondary" 
                        startIcon={<DeleteIcon />}
                        onClick={() => setForm({ ...form, reminder_date: '' })}
                        sx={{ mt: 1 }}
                      >
                        Hatırlatıcıyı Kaldır
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>İptal</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !form.title.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
