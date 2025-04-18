import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { projectsService, tasksService } from '../services/api';
import Header from '../components/Header';
import ProjectDialog from '../components/ProjectDialog';
import TaskDialog from '../components/TaskDialog';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  
  // Load project and tasks data
  const fetchProjectDetails = async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    try {
      const [projectData, tasksData] = await Promise.all([
        projectsService.getById(projectId),
        tasksService.getByProject(projectId),
      ]);
      
      setProject(projectData);
      setTasks(tasksData || []);
    } catch (err: any) {
      console.error('Errore caricamento dettagli progetto:', err);
      setError(err.response?.data?.message || 'Errore nel caricamento del progetto.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);
  
  // Project edit handlers
  const handleEditProject = () => {
    setProjectDialogOpen(true);
  };
  
  const handleProjectSave = async (updatedProject: any) => {
    try {
      await projectsService.update(projectId as string, updatedProject);
      setProjectDialogOpen(false);
      fetchProjectDetails(); // Refresh data
    } catch (err: any) {
      console.error('Errore aggiornamento progetto:', err);
      setError(err.response?.data?.message || 'Errore durante l\'aggiornamento del progetto.');
    }
  };
  
  // Project delete handlers
  const handleDeleteProject = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDeleteProject = async () => {
    try {
      await projectsService.delete(projectId as string);
      setDeleteDialogOpen(false);
      navigate('/dashboard'); // Return to dashboard after deletion
    } catch (err: any) {
      console.error('Errore eliminazione progetto:', err);
      setError(err.response?.data?.message || 'Errore durante l\'eliminazione del progetto.');
      setDeleteDialogOpen(false);
    }
  };
  
  // Task handlers
  const handleAddTask = () => {
    setTaskDialogOpen(true);
  };
  
  const handleTaskSave = async (taskData: any) => {
    try {
      // Add project ID to the task data
      const newTaskData = {
        ...taskData,
        projectId,
      };
      
      await tasksService.create(newTaskData);
      setTaskDialogOpen(false);
      fetchProjectDetails(); // Refresh tasks
    } catch (err: any) {
      console.error('Errore creazione task:', err);
      setError(err.response?.data?.message || 'Errore durante la creazione del task.');
    }
  };
  
  // Task delete handlers
  const handleDeleteTask = (taskId: string) => {
    setDeletingTaskId(taskId);
    setDeleteTaskDialogOpen(true);
  };
  
  const handleConfirmDeleteTask = async () => {
    if (!deletingTaskId) return;
    
    try {
      await tasksService.delete(deletingTaskId);
      setDeleteTaskDialogOpen(false);
      setDeletingTaskId(null);
      fetchProjectDetails(); // Refresh tasks
    } catch (err: any) {
      console.error('Errore eliminazione task:', err);
      setError(err.response?.data?.message || 'Errore durante l\'eliminazione del task.');
      setDeleteTaskDialogOpen(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!project && !loading) {
    return (
      <Box>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">Progetto non trovato o errore di caricamento.</Alert>
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
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2 }}
            >
              Indietro
            </Button>
            <Typography variant="h4" component="h1">
              {project.name}
            </Typography>
          </Box>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />} 
              onClick={handleEditProject}
              sx={{ mr: 1 }}
            >
              Modifica
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />} 
              onClick={handleDeleteProject}
            >
              Elimina
            </Button>
          </Box>
        </Box>
        
        {/* Project details */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Descrizione:
              </Typography>
              <Typography paragraph>
                {project.description || 'Nessuna descrizione disponibile.'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Stato:
              </Typography>
              <Chip 
                label={project.status} 
                color={
                  project.status === 'completed' ? 'success' : 
                  project.status === 'in_progress' ? 'primary' : 'default'
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Data di Scadenza:
              </Typography>
              <Typography>
                {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Non specificata'}
              </Typography>
            </Grid>
            {/* Additional project details can be added here */}
          </Grid>
        </Paper>
        
        {/* Tasks section */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Task</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleAddTask}
          >
            Aggiungi Task
          </Button>
        </Box>
        
        <Paper>
          {tasks.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography>Nessun task presente in questo progetto.</Typography>
            </Box>
          ) : (
            <List>
              {tasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task.id)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                    sx={{ py: 1.5 }}
                  >
                    <ListItemText
                      primary={
                        <Typography 
                          component="span" 
                          sx={{ 
                            cursor: 'pointer', 
                            fontWeight: 'medium',
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none'
                          }}
                          onClick={() => navigate(`/tasks/${task.id}`)}
                        >
                          {task.title}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip 
                            label={task.status} 
                            size="small" 
                            color={
                              task.status === 'completed' ? 'success' : 
                              task.status === 'in_progress' ? 'primary' : 'default'
                            }
                          />
                          {task.priority && (
                            <Chip 
                              label={task.priority} 
                              size="small" 
                              color={
                                task.priority === 'high' ? 'error' :
                                task.priority === 'medium' ? 'warning' : 'info'
                              }
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
        
        {/* Dialogs */}
        <ProjectDialog
          open={projectDialogOpen}
          onClose={() => setProjectDialogOpen(false)}
          onSave={handleProjectSave}
          project={project}
        />
        
        <TaskDialog
          open={taskDialogOpen}
          onClose={() => setTaskDialogOpen(false)}
          onSave={handleTaskSave}
        />
        
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleConfirmDeleteProject}
          itemName={project?.name || 'questo progetto'}
        />
        
        <DeleteConfirmDialog
          open={deleteTaskDialogOpen}
          onClose={() => {
            setDeleteTaskDialogOpen(false);
            setDeletingTaskId(null);
          }}
          onConfirm={handleConfirmDeleteTask}
          itemName="questo task"
        />
      </Container>
    </Box>
  );
};

export default ProjectDetails;