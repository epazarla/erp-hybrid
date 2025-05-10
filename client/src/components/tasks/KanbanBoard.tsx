import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  Box, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  Avatar, 
  IconButton,
  Grid,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Task tipi
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'yeni' | 'devam' | 'tamamlandi';
  priority: 'düşük' | 'orta' | 'yüksek';
  assigned_to: {
    id: number;
    name: string;
    avatar?: string;
  };
  due_date: string;
  created_at: string;
}

// Kolon tipi
interface Column {
  id: 'yeni' | 'devam' | 'tamamlandi';
  title: string;
  taskIds: string[];
}

// Kanban board props
interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, status: 'yeni' | 'devam' | 'tamamlandi') => void;
  onTaskClick: (taskId: string) => void;
  onAddTask: () => void;
}

// Öncelik renklerini belirle
const priorityColors = {
  'düşük': '#4caf50',
  'orta': '#ff9800',
  'yüksek': '#f44336'
};

// Kolon başlıklarını ve renklerini belirle
const columnConfig = {
  'yeni': { title: 'Yeni Görevler', color: '#42a5f5' },
  'devam': { title: 'Devam Eden', color: '#ff9800' },
  'tamamlandi': { title: 'Tamamlandı', color: '#4caf50' }
};

export default function KanbanBoard({ tasks, onTaskUpdate, onTaskClick, onAddTask }: KanbanBoardProps) {
  // Görevleri kolonlara ayır
  const initialColumns: { [key: string]: Column } = {
    'yeni': { id: 'yeni', title: columnConfig['yeni'].title, taskIds: [] },
    'devam': { id: 'devam', title: columnConfig['devam'].title, taskIds: [] },
    'tamamlandi': { id: 'tamamlandi', title: columnConfig['tamamlandi'].title, taskIds: [] }
  };

  // Görevleri durumlarına göre kolonlara yerleştir
  tasks.forEach(task => {
    if (initialColumns[task.status]) {
      initialColumns[task.status].taskIds.push(task.id);
    }
  });

  const [columns, setColumns] = useState(initialColumns);

  // Sürükle-bırak işlemi
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Geçersiz bırakma
    if (!destination) return;

    // Aynı yere bırakma
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Kaynak ve hedef kolonları al
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    // Aynı kolon içinde taşıma
    if (sourceColumn.id === destColumn.id) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...sourceColumn,
        taskIds: newTaskIds,
      };

      setColumns({
        ...columns,
        [newColumn.id]: newColumn,
      });
      
      return;
    }

    // Farklı kolonlar arası taşıma
    const sourceTaskIds = Array.from(sourceColumn.taskIds);
    sourceTaskIds.splice(source.index, 1);
    
    const newSourceColumn = {
      ...sourceColumn,
      taskIds: sourceTaskIds,
    };

    const destTaskIds = Array.from(destColumn.taskIds);
    destTaskIds.splice(destination.index, 0, draggableId);
    
    const newDestColumn = {
      ...destColumn,
      taskIds: destTaskIds,
    };

    setColumns({
      ...columns,
      [newSourceColumn.id]: newSourceColumn,
      [newDestColumn.id]: newDestColumn,
    });

    // Görev durumunu güncelle
    onTaskUpdate(draggableId, destColumn.id as 'yeni' | 'devam' | 'tamamlandi');
  };

  // Görev kartı
  const TaskCard = ({ task }: { task: Task }) => (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        '&:hover': { boxShadow: 6 },
        borderLeft: `4px solid ${priorityColors[task.priority]}`,
      }}
      onClick={() => onTaskClick(task.id)}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="medium" noWrap>
            {task.title}
          </Typography>
          <IconButton size="small">
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {task.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Tooltip title={`Öncelik: ${task.priority}`}>
            <FlagIcon sx={{ fontSize: 16, mr: 0.5, color: priorityColors[task.priority] }} />
          </Tooltip>
          <Tooltip title={`Bitiş Tarihi: ${format(new Date(task.due_date), 'dd MMMM yyyy', { locale: tr })}`}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {format(new Date(task.due_date), 'dd MMM', { locale: tr })}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ justifyContent: 'space-between', py: 0.5 }}>
        <Tooltip title={task.assigned_to.name}>
          <Avatar 
            src={task.assigned_to.avatar} 
            alt={task.assigned_to.name}
            sx={{ width: 24, height: 24 }}
          />
        </Tooltip>
        <Chip 
          label={task.status === 'yeni' ? 'Yeni' : task.status === 'devam' ? 'Devam Ediyor' : 'Tamamlandı'} 
          size="small"
          sx={{ 
            backgroundColor: columnConfig[task.status].color + '20',
            color: columnConfig[task.status].color,
            fontWeight: 500,
            fontSize: '0.7rem'
          }}
        />
      </CardActions>
    </Card>
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Grid container spacing={2}>
        {Object.values(columns).map(column => (
          <Grid item xs={12} md={4} key={column.id}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2,
                pb: 1,
                borderBottom: 1,
                borderColor: 'divider'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      backgroundColor: columnConfig[column.id].color,
                      mr: 1
                    }} 
                  />
                  <Typography variant="subtitle1" fontWeight="medium">
                    {column.title}
                  </Typography>
                </Box>
                <Chip 
                  label={column.taskIds.length} 
                  size="small" 
                  sx={{ 
                    backgroundColor: columnConfig[column.id].color + '20',
                    color: columnConfig[column.id].color,
                  }}
                />
              </Box>
              
              {column.id === 'yeni' && (
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />} 
                  onClick={onAddTask}
                  sx={{ mb: 2 }}
                  fullWidth
                >
                  Yeni Görev
                </Button>
              )}
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{ 
                      minHeight: 200,
                      flexGrow: 1,
                      overflowY: 'auto',
                      '&::-webkit-scrollbar': {
                        width: '0.4em'
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'transparent'
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0,0,0,.1)',
                        borderRadius: 4
                      }
                    }}
                  >
                    {column.taskIds.map((taskId, index) => {
                      const task = tasks.find(t => t.id === taskId);
                      if (!task) return null;
                      
                      return (
                        <Draggable key={taskId} draggableId={taskId} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TaskCard task={task} />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </DragDropContext>
  );
}
