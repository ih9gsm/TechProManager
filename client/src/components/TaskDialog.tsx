import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormHelperText,
  Chip,
  Avatar,
  Typography,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { projectsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import itLocale from 'date-fns/locale/it';

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Project {
  id: string;
  name: string;
}

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (taskData: any) => void;
  task?: any; // Task da modificare (se presente)
  projects?: Project[]; // Opzionale se passi già progetti
  users?: User[]; // Opzionale se passi già utenti
  projectId?: string; // Se aperto da un progetto specifico
}

const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  onClose,
  onSave,
  task,
  projects: initialProjects,
  users: initialUsers,
  projectId,
}) => {
  // Stati
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(projectId || null);
  const [selectedAssignees, setSelectedAssignees] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState('');
  
  // Per il caricamento di progetti e utenti
  const [projects, setProjects] = useState<Project[]>(initialProjects || []);
  const [users, setUsers] = useState<User[]>(initialUsers || []);
  const [loading, setLoading] = useState(!initialProjects || !initialUsers);
  
  const { user: currentUser } = useAuth(); // Utente attuale
  
  // Carica progetti e utenti se non forniti
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedProjects = initialProjects || await projectsService.getAll();
        setProjects(fetchedProjects);
        
        // In una app reale, qui caricheresti gli utenti dall'API
        // const fetchedUsers = initialUsers || await usersService.getAll();
        // Per ora usiamo dati di esempio
        if (!initialUsers) {
          const mockUsers = currentUser ? [
            { id: currentUser.id, name: currentUser.name },
            { id: 'user2', name: 'Marco Rossi' },
            { id: 'user3', name: 'Laura Bianchi' },
          ] : [];
          setUsers(mockUsers);
        }
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (open && (!initialProjects || !initialUsers)) {
      fetchData();
    }
  }, [open, initialProjects, initialUsers, currentUser]);
  
  // Inizializza i campi se c'è un task da modificare
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'pending');
      setPriority(task.priority || 'medium');
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
      setSelectedProject(task.projectId || null);
      
      // Per gli assegnatari, cerchiamo gli utenti completi nelle liste disponibili
      if (task.assignedTo?.length > 0 && users.length > 0) {
        const assignees = task.assignedTo
          .map((id: string) => users.find((u) => u.id === id))
          .filter(Boolean);
        setSelectedAssignees(assignees);
      } else {
        setSelectedAssignees([]);
      }
    } else {
      // Reset campi per nuovo task
      setTitle('');
      setDescription('');
      setStatus('pending');
      setPriority('medium');
      setDueDate(null);
      setSelectedProject(projectId || null);
      
      // Se è un nuovo task e l'utente è loggato, assegna automaticamente all'utente
      if (currentUser) {
        setSelectedAssignees(currentUser ? [{ id: currentUser.id, name: currentUser.name }] : []);
      } else {
        setSelectedAssignees([]);
      }
    }
  }, [task, open, users, projectId, currentUser]);
  
  // Validazione
  const validateForm = () => {
    let isValid = true;
    
    if (!title.trim()) {
      setTitleError('Il titolo è obbligatorio');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    return isValid;
  };
  
  // Gestisce salvataggio
  const handleSave = () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    const taskData = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? dueDate.toISOString() : null,
      projectId: selectedProject,
      assignedTo: selectedAssignees.map(assignee => assignee.id),
    };
    
    if (task?.id) {
      taskData.id = task.id;
    }
    
    try {
      onSave(taskData);
      onClose();
    } catch (error) {
      console.error('Errore salvataggio task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{task ? 'Modifica Task' : 'Nuovo Task'}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          {/* Titolo */}
          <TextField
            margin="dense"
            id="title"
            label="Titolo"
            type="text"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            error={!!titleError}
            helperText={titleError}
            autoFocus
          />
          
          {/* Descrizione */}
          <TextField
            margin="dense"
            id="description"
            label="Descrizione"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
          
          {/* Prima riga: Stato, Priorità */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            {/* Stato */}
            <FormControl variant="outlined" fullWidth margin="dense">
              <InputLabel id="status-label">Stato</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Stato"
              >
                <MenuItem value="pending">Da fare</MenuItem>
                <MenuItem value="in_progress">In corso</MenuItem>
                <MenuItem value="completed">Completato</MenuItem>
              </Select>
            </FormControl>
            
            {/* Priorità */}
            <FormControl variant="outlined" fullWidth margin="dense">
              <InputLabel id="priority-label">Priorità</InputLabel>
              <Select
                labelId="priority-label"
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                label="Priorità"
              >
                <MenuItem value="low">Bassa</MenuItem>
                <MenuItem value="medium">Media</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {/* Seconda riga: Progetto, Data Scadenza */}
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            {/* Progetto */}
            <FormControl variant="outlined" fullWidth margin="dense">
              <InputLabel id="project-label">Progetto</InputLabel>
              <Select
                labelId="project-label"
                id="project"
                value={selectedProject || ''}
                onChange={(e) => setSelectedProject(e.target.value)}
                label="Progetto"
                disabled={!!projectId} // Disabilita se il projectId è fornito esternamente
              >
                <MenuItem value="">Nessun progetto</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Data Scadenza */}
            <FormControl variant="outlined" fullWidth margin="dense">
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={itLocale}>
                <DatePicker
                  label="Data Scadenza"
                  value={dueDate}
                  onChange={(newValue) => setDueDate(newValue)}
                  slotProps={{
                    textField: { variant: 'outlined', fullWidth: true }
                  }}
                />
              </LocalizationProvider>
            </FormControl>
          </Box>
          
          {/* Assegnatari */}
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              multiple
              id="assignees"
              options={users}
              getOptionLabel={(option) => option.name}
              value={selectedAssignees}
              onChange={(event, newValue) => {
                setSelectedAssignees(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Assegna a"
                  placeholder="Seleziona utenti"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    avatar={option.avatarUrl ? <Avatar alt={option.name} src={option.avatarUrl} /> : undefined}
                    label={option.name}
                    {...getTagProps({ index })}
                    key={option.id}
                  />
                ))
              }
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {option.avatarUrl ? (
                      <Avatar alt={option.name} src={option.avatarUrl} sx={{ width: 24, height: 24, mr: 1 }} />
                    ) : (
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{option.name[0]}</Avatar>
                    )}
                    <Typography variant="body2">{option.name}</Typography>
                  </Box>
                </li>
              )}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvataggio...' : 'Salva'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog;
