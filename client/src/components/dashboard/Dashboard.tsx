import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material';
import Header from '../../components/Header';
import { projectsService, tasksService } from '../../services/api';
import ProjectDialog from '../../components/ProjectDialog';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import type { Project, Task } from '@shared/types'; // Import shared types

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State per i dialog
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedProjects, fetchedTasks] = await Promise.all([
        projectsService.getAll(),
        tasksService.getAll(), // Assumendo che getAll restituisca tutti i task
      ]);
      setProjects(fetchedProjects || []);
      setTasks(fetchedTasks || []);
    } catch (err: any) {
      console.error('Errore durante il caricamento dei dati della dashboard', err);
      setError(err.response?.data?.message || 'Errore nel caricamento dei dati.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- Gestione Dialog Progetti ---
  const handleOpenCreateDialog = () => {
    setEditingProject(null);
    setProjectDialogOpen(true);
  };

  const handleOpenEditDialog = (project: Project) => {
    setEditingProject(project);
    setProjectDialogOpen(true);
  };

  const handleCloseProjectDialog = () => {
    setProjectDialogOpen(false);
    setEditingProject(null);
  };

  const handleSaveProject = async (projectData: Partial<Project>) => {
    try {
      if (editingProject?.id) {
        // Update
        await projectsService.update(editingProject.id, projectData);
      } else {
        // Create
        await projectsService.create(projectData);
      }
      handleCloseProjectDialog();
      fetchDashboardData(); // Ricarica i dati
    } catch (err: any) {
      console.error('Errore salvataggio progetto:', err);
      setError(err.response?.data?.message || 'Errore durante il salvataggio del progetto.');
      // Non chiudere il dialog in caso di errore per permettere correzioni
    }
  };

  // --- Gestione Dialog Eliminazione ---
  const handleOpenDeleteDialog = (projectId: string) => {
    setDeletingProjectId(projectId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingProjectId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProjectId) return;
    try {
      await projectsService.delete(deletingProjectId);
      handleCloseDeleteDialog();
      fetchDashboardData(); // Ricarica i dati
    } catch (err: any) {
      console.error('Errore eliminazione progetto:', err);
      // Usa doppie virgolette per la stringa che contiene un apostrofo
      setError(err.response?.data?.message || "Errore durante l'eliminazione del progetto.");
      handleCloseDeleteDialog(); // Chiudi comunque il dialog
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={3}>
          {/* Sezione Progetti */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">I miei Progetti</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateDialog}
                >
                  Nuovo Progetto
                </Button>
              </Box>
              {projects.length === 0 ? (
                <Typography>Nessun progetto trovato.</Typography>
              ) : (
                <List dense>
                  {projects.map((project) => (
                    <ListItem
                      key={project.id}
                      secondaryAction={
                        <Box>
                          <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditDialog(project)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteDialog(project.id)} sx={{ ml: 1 }}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                      disablePadding
                    >
                      <RouterLink to={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                        <ListItemText
                          primary={project.name}
                          secondary={project.description?.substring(0, 50) + (project.description && project.description.length > 50 ? '...' : '')}
                        />
                      </RouterLink>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Sezione Task Recenti/Assegnati (Esempio) */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>I miei Task</Typography>
              {tasks.length === 0 ? (
                <Typography>Nessun task trovato.</Typography>
              ) : (
                <List dense>
                  {tasks.slice(0, 5).map((task) => ( // Mostra solo i primi 5 task come esempio
                    <ListItem key={task.id} disablePadding>
                       <RouterLink to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                         <ListItemText
                           primary={task.title}
                           secondary={`Progetto: ${task.project?.name || 'N/D'} - Stato: ${task.status}`}
                         />
                       </RouterLink>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Dialog per Creare/Modificare Progetti */}
        <ProjectDialog
          open={projectDialogOpen}
          onClose={handleCloseProjectDialog}
          onSave={handleSaveProject}
          project={editingProject}
        />

        {/* Dialog per Conferma Eliminazione */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          itemName={projects.find(p => p.id === deletingProjectId)?.name || 'questo progetto'}
        />
      </Container>
    </Box>
  );
};

export default Dashboard;