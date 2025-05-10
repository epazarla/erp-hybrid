import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Card,
  CardContent,
  Badge
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { API_BASE_URL } from '../config';
import { Task } from '../services/TaskService';

// Task tipi artık TaskService'den import ediliyor

interface TaskCalendarProps {
  userId: number;
  showAssignedOnly?: boolean;
  tasks?: Task[];
}

export default function TaskCalendar({ userId, showAssignedOnly = false, tasks: propTasks }: TaskCalendarProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  
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
        return <InfoIcon fontSize="small" />;
    }
  };
  
  // Takvim günlerini oluştur
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Ayın ilk günü
    const firstDay = new Date(year, month, 1);
    // Ayın son günü
    const lastDay = new Date(year, month + 1, 0);
    
    // Ayın ilk gününün haftanın hangi günü olduğunu bul (0: Pazar, 6: Cumartesi)
    const firstDayOfWeek = firstDay.getDay();
    
    // Takvimin başlangıç günü (önceki ayın son günleri dahil)
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(calendarStart.getDate() - (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1));
    
    // Takvim günlerini oluştur (6 hafta, 42 gün)
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(calendarStart);
      day.setDate(day.getDate() + i);
      days.push(day);
      
      // Eğer sonraki ayın ilk haftasını tamamladıysak, döngüyü sonlandır
      if (day.getMonth() > month && day.getDay() === 0) {
        break;
      }
    }
    
    setCalendarDays(days);
  }, [currentDate]);
  
  // showAssignedOnly prop'unu izle
  useEffect(() => {
    console.log('TaskCalendar - showAssignedOnly:', showAssignedOnly);
  }, [showAssignedOnly]);
  
  // Props'tan gelen görevleri kullan veya mock veri yükle
  useEffect(() => {
    try {
      setLoading(true);
      
      if (propTasks && propTasks.length > 0) {
        // Props'tan gelen görevleri kullan
        console.log('TaskCalendar - Props\'tan gelen görevler kullanılıyor:', propTasks.length);
        setTasks(propTasks);
      } else {
        // Mock veriyi kullan
        console.log('TaskCalendar - Mock görevler yükleniyor...');
        setTasks([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [propTasks]);
  
  // Önceki aya git
  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  // Sonraki aya git
  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  // Bugüne git
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  // Belirli bir gün için görevleri getir
  const getTasksForDay = (day: Date) => {
    console.log('getTasksForDay - showAssignedOnly:', showAssignedOnly, 'userId:', userId);
    const filteredTasks = tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      const dateMatches = (
        taskDate.getDate() === day.getDate() &&
        taskDate.getMonth() === day.getMonth() &&
        taskDate.getFullYear() === day.getFullYear()
      );
      
      // Bana atananlar filtresi
      const assignedMatches = !showAssignedOnly || task.assigned_to === userId;
      
      if (dateMatches && showAssignedOnly) {
        console.log('Görev:', task.id, 'assigned_to:', task.assigned_to, 'userId:', userId, 'eşleşme:', task.assigned_to === userId);
      }
      
      return dateMatches && assignedMatches;
    });
    
    return filteredTasks;
  };
  
  // Gün hücresini oluştur
  const renderDay = (day: Date, index: number) => {
    const isToday = new Date().toDateString() === day.toDateString();
    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
    const tasksForDay = getTasksForDay(day);
    
    return (
      <Box
        key={index}
        sx={{
          height: '100%',
          minHeight: 120,
          p: 1,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: isToday ? 'action.selected' : isCurrentMonth ? 'background.paper' : 'action.hover',
          borderRadius: '4px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: isToday ? 'bold' : isCurrentMonth ? 'medium' : 'normal',
            color: isCurrentMonth ? 'text.primary' : 'text.secondary',
            mb: 1
          }}
        >
          {day.getDate()}
        </Typography>
        
        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
          {tasksForDay.length > 0 ? (
            tasksForDay.map(task => (
              <Tooltip key={task.id} title={task.description}>
                <Chip
                  label={task.title}
                  size="small"
                  icon={getStatusIcon(task.status)}
                  color={getStatusColor(task.status) as any}
                  sx={{ 
                    mb: 0.5, 
                    width: '100%', 
                    height: 'auto',
                    '& .MuiChip-label': {
                      whiteSpace: 'normal',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                    }
                  }}
                />
              </Tooltip>
            ))
          ) : null}
        </Box>
      </Box>
    );
  };
  
  // Haftanın günlerini oluştur
  const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="medium">
          Görev Takvimi
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handlePreviousMonth}>
            <ChevronLeftIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ mx: 2 }}>
            {currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
          </Typography>
          
          <IconButton onClick={handleNextMonth}>
            <ChevronRightIcon />
          </IconButton>
          
          <Tooltip title="Bugün">
            <IconButton onClick={handleToday} sx={{ ml: 1 }}>
              <TodayIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Grid container spacing={0}>
          {/* Haftanın günleri */}
          {weekDays.map((day, index) => (
            <Grid item xs key={index} sx={{ p: 1 }}>
              <Typography 
                variant="subtitle2" 
                align="center"
                sx={{ fontWeight: 'medium' }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
          
          {/* Takvim günleri */}
          {calendarDays.map((day, index) => (
            <Grid item xs key={index} sx={{ height: 120 }}>
              {renderDay(day, index)}
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* Görev özeti */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Yaklaşan Görevler
        </Typography>
        
        <Grid container spacing={2}>
          {tasks
            .filter(task => {
              const dueDate = new Date(task.due_date);
              const today = new Date();
              const inNextWeek = new Date();
              inNextWeek.setDate(today.getDate() + 7);
              
              return (
                dueDate >= today && 
                dueDate <= inNextWeek && 
                (!showAssignedOnly || task.assigned_to === userId)
              );
            })
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
            .slice(0, 3)
            .map(task => (
              <Grid item xs={12} sm={4} key={task.id}>
                <Card 
                  elevation={0}
                  variant="outlined"
                  sx={{ 
                    borderRadius: '12px',
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Chip 
                        label={task.status} 
                        size="small" 
                        color={getStatusColor(task.status) as any}
                        icon={getStatusIcon(task.status) || undefined}
                        sx={{ height: 24, fontWeight: 500 }}
                      />
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      {task.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {task.description.length > 100 
                        ? `${task.description.substring(0, 100)}...` 
                        : task.description}
                    </Typography>
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
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
    </Box>
  );
}
