import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button,
  Card, 
  CardContent, 
  CardActions,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { projectsService } from '../services/api';
import { Link as RouterLink } from 'react-router-dom';

// Tipo per i progetti
interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  deadline: string;
  tasksCount?: number;
  completedTasksCount?: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const data = await projectsService.getAll();
        setProjects(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success.main';
      case 'in progress':
        return 'info.main';
      case 'planned':
        return 'warning.main';
      case 'delayed':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const calculateProgress = (completed: number = 0, total: number = 0) => {
    if (total === 0) return 0;
    return (completed / total) * 100;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component={RouterLink} 
          to="/projects/new"
        >
          Nuovo Progetto
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="body1">{error}</Typography>
        </Paper>
      ) : projects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Non hai ancora progetti
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Inizia creando il tuo primo progetto
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            component={RouterLink} 
            to="/projects/new"
          >
            Crea Progetto
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom noWrap>
                    {project.name}
                  </Typography>
                  <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: getStatusColor(project.status),
                        mr: 1
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {project.status}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {project.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Scadenza: {formatDate(project.deadline || '')}
                    </Typography>
                  </Box>
                  {(project.tasksCount !== undefined && project.tasksCount > 0) && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <Box
                          sx={{
                            height: 8,
                            borderRadius: 5,
                            bgcolor: 'background.paper',
                            position: 'relative',
                            '&:after': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              height: '100%',
                              width: `${calculateProgress(project.completedTasksCount, project.tasksCount)}%`,
                              bgcolor: 'primary.main',
                              borderRadius: 5,
                              transition: 'width 0.4s ease'
                            }
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {project.completedTasksCount || 0}/{project.tasksCount}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary" 
                    component={RouterLink} 
                    to={`/projects/${project.id}`}
                  >
                    Dettagli
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;