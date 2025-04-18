import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Box, Paper, Typography, Chip, Avatar, Card, CardContent, IconButton } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assigneeId?: string;
  assignee?: { id: string; name: string; avatarUrl?: string };
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

interface KanbanBoardProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: string) => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  tasks, 
  onTaskStatusChange,
  onEditTask,
  onDeleteTask
}) => {
  // Configurazione colonne kanban
  const columns: KanbanColumn[] = [
    { id: 'pending', title: 'Da fare', color: '#ff9800', tasks: [] },
    { id: 'in_progress', title: 'In corso', color: '#2196f3', tasks: [] },
    { id: 'completed', title: 'Completati', color: '#4caf50', tasks: [] },
  ];
  
  // Distribuisci i task nelle colonne in base allo stato
  tasks.forEach(task => {
    const column = columns.find(col => col.id === task.status) || columns[0];
    column.tasks.push(task);
  });

  const getPriorityColor = (priority?: string) => {
    switch(priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };
  
  // Gestisce la fine del drag & drop
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Uscita se l'utente annulla o posiziona il task nello stesso punto
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return;
    }
    
    // Se il task è spostato in una colonna diversa, aggiorna lo stato
    if (source.droppableId !== destination.droppableId) {
      onTaskStatusChange(draggableId, destination.droppableId);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', overflowX: 'auto', pb: 2 }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        {columns.map(column => (
          <Box
            key={column.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              minWidth: 280,
              maxWidth: 350,
              mx: 1,
              flexShrink: 0
            }}
          >
            {/* Header colonna */}
            <Paper
              sx={{
                p: 1,
                mb: 1,
                backgroundColor: column.color + '20', // Colore con opacità
                borderTop: `3px solid ${column.color}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {column.title}
                </Typography>
                <Chip
                  label={column.tasks.length}
                  size="small"
                  sx={{ ml: 1, minWidth: 30 }}
                />
              </Box>
            </Paper>

            {/* Lista task droppable */}
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    height: '100%',
                    minHeight: 200,
                    backgroundColor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
                    transition: 'background-color 0.2s ease',
                    borderRadius: 1,
                    p: 1,
                    overflowY: 'auto',
                  }}
                >
                  {column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                            mb: 1,
                            boxShadow: snapshot.isDragging ? 8 : 1,
                            opacity: snapshot.isDragging ? 0.9 : 1,
                            '&:hover .task-actions': { opacity: 1 },
                          }}
                        >
                          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" noWrap sx={{ fontWeight: 'medium', maxWidth: '80%' }}>
                                {task.title}
                              </Typography>
                              <Box className="task-actions" sx={{ opacity: 0, transition: 'opacity 0.2s' }}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => onEditTask(task.id)}
                                  sx={{ p: 0.5 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={() => onDeleteTask(task.id)}
                                  sx={{ p: 0.5 }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              {task.priority && (
                                <Chip 
                                  label={task.priority} 
                                  size="small" 
                                  color={getPriorityColor(task.priority) as any}
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                              
                              {task.assignee && (
                                <Avatar 
                                  alt={task.assignee.name}
                                  src={task.assignee.avatarUrl}
                                  sx={{ width: 24, height: 24, ml: 'auto' }}
                                />
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Box>
        ))}
      </DragDropContext>
    </Box>
  );
};

export default KanbanBoard;