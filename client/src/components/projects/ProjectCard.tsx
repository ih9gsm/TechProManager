import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  IconButton,
  CardActions,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => Promise<boolean>;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const navigate = useNavigate();

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT').format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'primary';
      case 'ON_HOLD':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Sei sicuro di voler eliminare questo progetto?')) {
      const success = await onDelete(project.id);
      if (!success) {
        alert('Impossibile eliminare il progetto. Riprova più tardi.');
      }
    }
  };

  const viewDetails = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6,
      }
    }}>
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <IconButton size="small" onClick={handleDelete} color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {project.title}
        </Typography>
        
        <Chip 
          label={project.status} 
          size="small" 
          color={getStatusColor(project.status) as any}
          sx={{ mb: 2 }} 
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {truncateText(project.description, 100)}
        </Typography>
        
        <Typography variant="caption" display="block" color="text.secondary">
          Scadenza: {formatDate(project.deadline)}
        </Typography>
      </CardContent>
      
      <CardActions>
        <Button 
          startIcon={<VisibilityIcon />} 
          size="small" 
          onClick={viewDetails}
          sx={{ ml: 'auto' }}
        >
          Visualizza
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;