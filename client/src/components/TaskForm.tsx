import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Snackbar,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Chip,
  Autocomplete,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Save as SaveIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Label as LabelIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { API_BASE_URL } from '../config';
import { addTask } from '../services/TaskService';
import { getAllUsers, getActiveUsers, User } from '../services/UserService';
import { getAllClients, Client } from '../services/ClientService';

interface TaskFormProps {
  users: User[];
  currentUser: User;
  onTaskCreated: () => void;
}

// Etiket arayüzü
interface Tag {
  id: string;
  label: string;
  color?: string;
}

export default function TaskForm({ users, currentUser, onTaskCreated }: TaskFormProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    assigned_to: currentUser.id,
    status: 'pending',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: new Date(),
    category: '',
    client_id: 0,
    tags: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<string[]>(['Yazılım Geliştirme', 'Web Tasarım', 'Mobil Uygulama', 'SEO', 'İçerik Üretimi', 'Sosyal Medya']);
  const [availableTags, setAvailableTags] = useState<Tag[]>([
    { id: 'urgent', label: 'Acil', color: '#f44336' },
    { id: 'bug', label: 'Hata', color: '#e91e63' },
    { id: 'feature', label: 'Özellik', color: '#9c27b0' },
    { id: 'improvement', label: 'İyileştirme', color: '#673ab7' },
    { id: 'documentation', label: 'Dokümantasyon', color: '#3f51b5' },
    { id: 'design', label: 'Tasarım', color: '#2196f3' },
    { id: 'testing', label: 'Test', color: '#03a9f4' },
    { id: 'maintenance', label: 'Bakım', color: '#00bcd4' },
    { id: 'research', label: 'Araştırma', color: '#009688' },
    { id: 'planning', label: 'Planlama', color: '#4caf50' }
  ]);
  
  // Müşterileri yükle
  useEffect(() => {
    try {
      const allClients = getAllClients();
      setClients(allClients);
    } catch (error) {
      console.error('Müşteriler yüklenirken hata:', error);
    }
  }, []);

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
  
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Form verilerini doğrula
      if (!form.title.trim()) {
        throw new Error('Görev başlığı gereklidir.');
      }

      // Form verilerini uygun formata dönüştür
      const formData = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        due_date: form.due_date.toISOString(),
        status: 'Bekliyor', // Status'u TASK_STATUSES'dan bir değer olarak ayarla
        category: form.category || undefined,
        client_id: form.client_id || undefined,
        tags: form.tags.length > 0 ? form.tags : undefined
      };
      
      console.log(`[${new Date().toISOString()}] Yeni görev ekleniyor:`, formData);
      
      // LocalStorage'a kaydet
      const newTask = addTask(formData);
      
      if (!newTask) {
        throw new Error('Görev eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
      
      console.log(`[${new Date().toISOString()}] Görev başarıyla eklendi:`, newTask);
      
      // API'ye gönderme kodu (backend hazır olduğunda kullanılacak)
      /*
      const response = await fetch(`${API_BASE_URL}/api/task/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Görev oluşturulamadı.');
      */
      
      setSuccess(true);
      setOpenSnackbar(true);
      
      // Formu sıfırla
      setForm({
        title: '',
        description: '',
        assigned_to: currentUser.id,
        status: 'Bekliyor',
        priority: 'medium',
        due_date: new Date(),
        category: '',
        client_id: 0,
        tags: []
      });
      
      // Görev oluşturulduğunda parent component'i bilgilendir
      // Bu, TaskManager'daki refreshTrigger'ı tetikleyecek
      onTaskCreated();
    } catch (err: any) {
      console.error(`[${new Date().toISOString()}] Görev eklenirken hata:`, err);
      setError(err.message || 'Görev eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Yeni Görev Oluştur
              </Typography>
            </Grid>
            
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Görev Başlığı"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                variant="outlined"
                placeholder="Görev başlığını girin"
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Görev Açıklaması"
                name="description"
                value={form.description}
                onChange={handleChange}
                multiline
                rows={4}
                variant="outlined"
                placeholder="Görev açıklamasını girin"
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="assigned-to-label">Atanan Kişi</InputLabel>
                <Select
                  labelId="assigned-to-label"
                  id="assigned-to"
                  name="assigned_to"
                  value={form.assigned_to}
                  onChange={handleSelectChange}
                  label="Atanan Kişi"
                  startAdornment={
                    <PersonIcon sx={{ mr: 1 }} />
                  }
                  sx={{ borderRadius: '8px' }}
                >
                  {users.map((user) => (
                    <MenuItem 
                      key={user.id} 
                      value={user.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {user.avatar ? (
                        <Box 
                          component="img"
                          src={user.avatar}
                          alt={user.name}
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%',
                            mr: 1
                          }}
                        />
                      ) : (
                        <PersonIcon sx={{ fontSize: 20, mr: 1 }} />
                      )}
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2">{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.department || 'Departman Yok'}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {users.length === 0 && (
                  <FormHelperText error>Kullanıcılar yüklenemedi</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="priority-label">Öncelik</InputLabel>
                <Select
                  labelId="priority-label"
                  id="priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleSelectChange}
                  label="Öncelik"
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="low">Düşük</MenuItem>
                  <MenuItem value="medium">Orta</MenuItem>
                  <MenuItem value="high">Yüksek</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Bitiş Tarihi"
                  value={form.due_date}
                  onChange={handleDateChange}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      required: true,
                      InputProps: {
                        sx: { borderRadius: '8px' }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Etiketler" size="small" icon={<LabelIcon />} />
              </Divider>
              <Autocomplete
                multiple
                id="tags"
                options={availableTags}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                value={form.tags.map(tagId => availableTags.find(tag => tag.id === tagId) || { id: tagId, label: tagId })}
                onChange={(event, newValue) => {
                  setForm({
                    ...form,
                    tags: newValue.map(tag => typeof tag === 'string' ? tag : tag.id)
                  });
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const tag = typeof option === 'string' 
                      ? { id: option, label: option } 
                      : option;
                    const tagColor = availableTags.find(t => t.id === tag.id)?.color || '#757575';
                    
                    return (
                      <Chip
                        label={tag.label}
                        {...getTagProps({ index })}
                        key={tag.id}
                        style={{ backgroundColor: tagColor, color: '#fff' }}
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Etiketler"
                    placeholder="Etiket seçin"
                    helperText="Görev için etiketler seçin"
                  />
                )}
                renderOption={(props, option) => {
                  const tag = typeof option === 'string' ? { id: option, label: option } : option;
                  const tagColor = availableTags.find(t => t.id === tag.id)?.color || '#757575';
                  
                  return (
                    <li {...props}>
                      <Box 
                        component="span" 
                        sx={{ 
                          width: 14, 
                          height: 14, 
                          mr: 1, 
                          borderRadius: '50%', 
                          backgroundColor: tagColor 
                        }} 
                      />
                      {tag.label}
                    </li>
                  );
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{ 
                    borderRadius: '8px',
                    py: 1,
                    px: 3,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  {loading ? 'Oluşturuluyor...' : 'Görev Oluştur'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Görev başarıyla oluşturuldu!"
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
}
