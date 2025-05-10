import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Task } from '../services/TaskService';

// Task tipi artık TaskService'den import ediliyor

interface MyTasksProps {
  userId: number;
  tasks?: Task[];
}

export default function MyTasks({ userId, tasks: propTasks }: MyTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Görevleri yükle
  useEffect(() => {
    try {
      setLoading(true);
      console.log('MyTasks - Görevler yükleniyor...');
      
      if (propTasks && propTasks.length > 0) {
        // Prop olarak gelen görevleri kullan
        setTasks(propTasks);
        console.log(`MyTasks - Prop'tan ${propTasks.length} adet görev alındı.`);
      } else {
        // Prop yoksa boş dizi kullan
        setTasks([]);
        console.log('MyTasks - Görev bulunamadı.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, propTasks]);

  // Görev durumuna göre renk belirleme
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'tamamlandı':
      case 'completed':
        return 'success';
      case 'devam ediyor':
      case 'in progress':
        return 'info';
      case 'beklemede':
      case 'pending':
        return 'warning';
      case 'iptal':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Görev durumuna göre ikon belirleme
  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'tamamlandı':
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'devam ediyor':
      case 'in progress':
      case 'beklemede':
      case 'pending':
        return <ScheduleIcon fontSize="small" />;
      case 'iptal':
      case 'cancelled':
        return <ErrorOutlineIcon fontSize="small" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (tasks.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Size atanmış görev bulunmuyor.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="medium">
          Bana Atanan Görevler ({tasks.length})
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {tasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: '12px',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transform: 'translateY(-4px)'
                }
              }}
              elevation={0}
              variant="outlined"
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Chip 
                    label={task.status} 
                    size="small" 
                    color={getStatusColor(task.status) as any}
                    icon={getStatusIcon(task.status) || undefined}
                    sx={{ height: 24, fontWeight: 500 }}
                  />
                  <Box>
                    <Tooltip title="Düzenle">
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Typography variant="h6" component="h3" gutterBottom>
                  {task.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {task.description}
                </Typography>
                
                <Divider sx={{ my: 1.5 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                  <Typography variant="caption" color="text.secondary">
                    Oluşturulma: {new Date(task.created_at).toLocaleDateString('tr-TR')}
                  </Typography>
                  
                  <Typography variant="caption" fontWeight="medium" color="primary">
                    Bitiş: {new Date(task.due_date).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
