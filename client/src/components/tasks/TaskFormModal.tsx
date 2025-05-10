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
  Box,
  Typography,
  Divider,
  Grid,
  Avatar,
  Chip,
  IconButton,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { tr } from 'date-fns/locale';

// Takım üyesi tipi
interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar?: string;
}

// Görev tipi
interface Task {
  id?: string;
  title: string;
  description: string;
  status: 'yeni' | 'devam' | 'tamamlandi';
  priority: 'düşük' | 'orta' | 'yüksek';
  assigned_to: number | {
    id: number;
    name: string;
    avatar?: string;
  };
  due_date: Date | string | null;
  created_at?: string;
  attachments?: string[];
  // Firma bilgileri
  company_name: string;
  new_company_name?: string; // Yeni eklenen firma adı alanı
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  company_sector?: string;
  company_contact_person?: string;
  is_priority_client?: boolean;
}

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Task;
  teamMembers: TeamMember[];
  isEditMode?: boolean;
  onDelete?: (taskId: string) => void;
}

export default function TaskFormModal({
  open,
  onClose,
  onSave,
  task,
  teamMembers,
  isEditMode = false,
  onDelete
}: TaskFormModalProps) {
  // Form durumu
  const [formData, setFormData] = useState<Task>({
    id: '',
    title: '',
    description: '',
    status: 'yeni',
    priority: 'orta',
    assigned_to: 0,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 hafta sonra
    attachments: [],
    // Firma bilgileri
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    company_sector: '',
    company_contact_person: '',
    is_priority_client: false
  });

  // Form hataları
  const [errors, setErrors] = useState({
    title: '',
    assigned_to: '',
    due_date: '',
    company_name: ''
  });

  // Düzenleme modunda ise mevcut görev verilerini yükle
  useEffect(() => {
    if (task && isEditMode) {
      setFormData({
        ...task,
        // Eğer assigned_to bir obje ise, sadece ID'yi al
        assigned_to: typeof task.assigned_to === 'object' ? task.assigned_to.id : task.assigned_to,
        due_date: task.due_date ? new Date(task.due_date) : null
      });
    } else {
      // Yeni görev oluşturma
      setFormData({
        id: '',
        title: '',
        description: '',
        status: 'yeni',
        priority: 'orta',
        assigned_to: teamMembers.length > 0 ? teamMembers[0].id : 0,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        attachments: [],
        // Firma bilgileri
        company_name: '',
        company_email: '',
        company_phone: '',
        company_address: '',
        company_sector: '',
        company_contact_person: '',
        is_priority_client: false
      });
    }
  }, [task, isEditMode, teamMembers]);

  // Form alanlarını güncelle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });

      // Hata durumunu temizle
      if (errors[name as keyof typeof errors]) {
        setErrors({
          ...errors,
          [name]: ''
        });
      }
    }
  };

  // Tarih değişikliği
  const handleDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      due_date: date
    });

    // Hata durumunu temizle
    if (errors.due_date) {
      setErrors({
        ...errors,
        due_date: ''
      });
    }
  };

  // Form doğrulama
  const validateForm = () => {
    const newErrors = {
      title: '',
      assigned_to: '',
      due_date: '',
      company_name: ''
    };
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'Görev başlığı zorunludur';
      isValid = false;
    }

    if (!formData.assigned_to) {
      newErrors.assigned_to = 'Görev atanacak kişi seçilmelidir';
      isValid = false;
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Bitiş tarihi seçilmelidir';
      isValid = false;
    }
    
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Firma adı zorunludur';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Formu kaydet
  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  // Görevi sil
  const handleDelete = () => {
    if (formData.id && onDelete) {
      onDelete(formData.id);
      onClose();
    }
  };

  return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {isEditMode ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ py: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Görev Bilgileri
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Görev Başlığı"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Açıklama"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.assigned_to}>
                <InputLabel>Atanan Kişi</InputLabel>
                <Select
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleChange}
                  label="Atanan Kişi"
                >
                  {teamMembers.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={member.avatar}
                          alt={member.name}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        >
                          {member.name.charAt(0)}
                        </Avatar>
                        {member.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.assigned_to && <FormHelperText>{errors.assigned_to}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Bitiş Tarihi"
                type="date"
                name="due_date"
                value={formData.due_date ? new Date(formData.due_date).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  handleDateChange(date);
                }}
                fullWidth
                error={!!errors.due_date}
                helperText={errors.due_date}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Durum"
                >
                  <MenuItem value="yeni">Yeni</MenuItem>
                  <MenuItem value="devam">Devam Ediyor</MenuItem>
                  <MenuItem value="tamamlandi">Tamamlandı</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Öncelik</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Öncelik"
                >
                  <MenuItem value="düşük">Düşük</MenuItem>
                  <MenuItem value="orta">Orta</MenuItem>
                  <MenuItem value="yüksek">Yüksek</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Firma Bilgileri Bölümü */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Divider />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Firma Bilgileri
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.company_name} required>
                <InputLabel>Firma Adı</InputLabel>
                <Select
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  label="Firma Adı"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        borderRadius: 12
                      },
                    },
                  }}
                >
                  <MenuItem value=""><em>Firma Seçiniz</em></MenuItem>
                  
                  {/* Kayıtlı Firmalar */}
                  <MenuItem value="ABC Teknoloji">ABC Teknoloji</MenuItem>
                  <MenuItem value="XYZ E-Ticaret">XYZ E-Ticaret</MenuItem>
                  <MenuItem value="123 Dijital">123 Dijital</MenuItem>
                  <MenuItem value="Mega Yazılım">Mega Yazılım</MenuItem>
                  <MenuItem value="Smart Solutions">Smart Solutions</MenuItem>
                  <MenuItem value="Tech Innovators">Tech Innovators</MenuItem>
                  <MenuItem value="Global Marketing">Global Marketing</MenuItem>
                  <MenuItem value="Dijital Vizyon">Dijital Vizyon</MenuItem>
                  
                  {/* Yeni Firma Ekleme Seçeneği */}
                  <MenuItem 
                    value="new_company" 
                    sx={{ 
                      borderTop: '1px solid rgba(0,0,0,0.12)', 
                      mt: 1, 
                      pt: 1,
                      color: 'primary.main',
                      fontWeight: 'bold'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AddIcon fontSize="small" sx={{ mr: 1 }} />
                      Yeni Firma Ekle
                    </Box>
                  </MenuItem>
                </Select>
                {errors.company_name && <FormHelperText>{errors.company_name}</FormHelperText>}
              </FormControl>
              
              {/* Yeni Firma Ekleme Seçeneği Seçildiğinde Gösterilecek Alan */}
              {formData.company_name === 'new_company' && (
                <TextField
                  label="Yeni Firma Adı"
                  name="new_company_name"
                  value={formData.new_company_name || ''}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      new_company_name: e.target.value
                    });
                  }}
                  fullWidth
                  margin="normal"
                  size="small"
                  autoFocus
                />
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Sektör</InputLabel>
                <Select
                  name="company_sector"
                  value={formData.company_sector || ''}
                  onChange={handleChange}
                  label="Sektör"
                >
                  <MenuItem value=""><em>Seçiniz</em></MenuItem>
                  <MenuItem value="e-ticaret">E-Ticaret</MenuItem>
                  <MenuItem value="hizmet">Hizmet</MenuItem>
                  <MenuItem value="üretim">Üretim</MenuItem>
                  <MenuItem value="sağlık">Sağlık</MenuItem>
                  <MenuItem value="eğitim">Eğitim</MenuItem>
                  <MenuItem value="teknoloji">Teknoloji</MenuItem>
                  <MenuItem value="finans">Finans</MenuItem>
                  <MenuItem value="diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="İletişim Kişisi"
                name="company_contact_person"
                value={formData.company_contact_person || ''}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="E-posta"
                name="company_email"
                type="email"
                value={formData.company_email || ''}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Telefon"
                name="company_phone"
                value={formData.company_phone || ''}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Öncelikli Müşteri</InputLabel>
                <Select
                  name="is_priority_client"
                  value={formData.is_priority_client ? 'true' : 'false'}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      is_priority_client: e.target.value === 'true'
                    });
                  }}
                  label="Öncelikli Müşteri"
                >
                  <MenuItem value="true">Evet</MenuItem>
                  <MenuItem value="false">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Adres"
                name="company_address"
                value={formData.company_address || ''}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Divider />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Ekler
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AttachFileIcon />}
                  sx={{ borderRadius: 20 }}
                >
                  Dosya Ekle
                </Button>
              </Box>
              
              {formData.attachments && formData.attachments.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.attachments.map((attachment, index) => (
                    <Chip
                      key={index}
                      label={attachment.split('/').pop()}
                      onDelete={() => {
                        const newAttachments = [...formData.attachments!];
                        newAttachments.splice(index, 1);
                        setFormData({ ...formData, attachments: newAttachments });
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Henüz dosya eklenmedi
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <Divider />
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          {isEditMode && onDelete && (
            <Button 
              onClick={handleDelete} 
              color="error" 
              startIcon={<DeleteIcon />}
              sx={{ mr: 'auto' }}
            >
              Görevi Sil
            </Button>
          )}
          <Button onClick={onClose} color="inherit">İptal</Button>
          <Button onClick={handleSave} variant="contained">
            {isEditMode ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
  );
}
