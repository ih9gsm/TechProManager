import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import type { Project } from '@shared/types'; // Import shared types

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => void;
  project?: Project | null; // Optional project data for editing
}

const ProjectDialog: React.FC<ProjectDialogProps> = ({ open, onClose, onSave, project }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
    } else {
      // Reset form when opening for creation
      setName('');
      setDescription('');
    }
  }, [project, open]); // Depend on project and open state

  const handleSave = () => {
    const projectData: Partial<Project> = {
      name,
      description,
    };
    if (project?.id) {
      projectData.id = project.id; // Include id if editing
    }
    onSave(projectData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{project ? 'Modifica Progetto' : 'Nuovo Progetto'}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            label="Nome Progetto"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="description"
            label="Descrizione (Opzionale)"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button onClick={handleSave} variant="contained" disabled={!name}>Salva</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDialog;
