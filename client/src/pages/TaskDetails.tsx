import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { tasksService } from '../services/api';
import Header from '../components/Header';
import TaskDialog from '../components/TaskDialog';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

const TaskDetails = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Load task data
  const fetchTaskDetails = async () => {
    if (!taskId) return;
    
    setLoading(true);
    setError(null);
    try {
      const taskData = await tasksService.getById(taskId);
      setTask(taskData);
    } catch (err: any) {
      console.error('Errore caricamento dettagli task:', err);
      setError(err.response?.data?.message || 'Errore nel caricamento del task.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);
  
  // Task action handlers
  const handleEditTask = () => {
    setTaskDialogOpen(true);
  };
  
  const handleTaskSave = async (taskData: any) => {
    try {
      await tasksService.update(taskId as string, taskData);
      setTaskDialogOpen(false);
      fetchTaskDetails(); // Refresh data
    } catch (err: any) {
      console.error('Errore aggiornamento task:', err);
      setError(err.response?.data?.message || 'Errore durante l\'aggiornamento del task.');
    }
  };
  
  const handleDeleteTask = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDeleteTask = async () => {
    try {
      await tasksService.delete(taskId as string);
      setDeleteDialogOpen(false);
      // Return to parent project if available, otherwise to dashboard
      if (task?.projectId) {
        navigate(`/projects/${task.projectId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Errore eliminazione task:', err);
      setError(err.response?.data?.message || 'Errore durante l\'eliminazione del task.');
      setDeleteDialogOpen(false);
    }
  };
  
  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    try {
      await tasksService.updateStatus(taskId as string, newStatus);
      fetchTaskDetails(); // Refresh data
    } catch (err: any) {
      console.error('Errore aggiornamento stato:', err);
      setError(err.response?.data?.message || 'Errore durante l\'aggiornamento dello stato.');
    }
  };
  
  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const getPriorityChipColor = (priority: string) => {
    switch (priority) {
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
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!task && !loading) {
    return (
      <Box>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">Task non trovato o errore di caricamento.</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Torna alla Dashboard
          </Button>
        </Container>
      </Box>
    );
  }
  
  return (
    <Box>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => task.projectId ? navigate(`/projects/${task.projectId}`) : navigate('/dashboard')}
              sx={{ mr: 2 }}
            >
              {task.projectId ? 'Al Progetto' : 'Alla Dashboard'}
            </Button>
            <Typography variant="h4" component="h1">
              {task.title}
            </Typography>
          </Box>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />} 
              onClick={handleEditTask}
              sx={{ mr: 1 }}
            >
              Modifica
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />} 
              onClick={handleDeleteTask}
            >
              Elimina
            </Button>
          </Box>
        </Box>
        
        {/* Task details */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Descrizione:
              </Typography>
              <Typography paragraph>
                {task.description || 'Nessuna descrizione disponibile.'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Stato:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label="Da fare" 
                  color={task.status === 'pending' ? 'warning' : 'default'}
                  variant={task.status === 'pending' ? 'filled' : 'outlined'}
                  onClick={() => handleStatusChange('pending')}
                  clickable
                />
                <Chip 
                  label="In corso" 
                  color={task.status === 'in_progress' ? 'primary' : 'default'}
                  variant={task.status === 'in_progress' ? 'filled' : 'outlined'}
                  onClick={() => handleStatusChange('in_progress')}
                  clickable
                />
                <Chip 
                  label="Completato" 
                  color={task.status === 'completed' ? 'success' : 'default'}
                  variant={task.status === 'completed' ? 'filled' : 'outlined'}
                  onClick={() => handleStatusChange('completed')}
                  clickable
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Priorità:
              </Typography>
              <Chip 
                label={task.priority} 
                color={getPriorityChipColor(task.priority)} 
                variant="filled" 
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Progetto:
              </Typography>
              {task.projectId ? (
                <Button 
                  variant="text" 
                  onClick={() => navigate(`/projects/${task.projectId}`)}
                >
                  {task.project?.name || 'Vai al Progetto'}
                </Button>
              ) : (
                <Typography>Non associato ad alcun progetto</Typography>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Data di Scadenza:
              </Typography>
              <Typography>
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Non specificata'}
              </Typography>
            </Grid>
            
            {/* More task details can be added here */}
          </Grid>
        </Paper>
        
        {/* Dialogs */}
        <TaskDialog
          open={taskDialogOpen}
          onClose={() => setTaskDialogOpen(false)}
          onSave={handleTaskSave}
          initialName={task.title}
        />
        
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleConfirmDeleteTask}
          itemName={task?.title || 'questo task'}
        />
      </Container>
    </Box>
  );
};

export default TaskDetails;