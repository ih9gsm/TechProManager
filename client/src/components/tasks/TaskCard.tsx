import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  DialogContentText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import itLocale from 'date-fns/locale/it';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => Promise<boolean>;
  onUpdate: (id: string, updates: Partial<Task>) => Promise<boolean>;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onUpdate }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    deadline: task.deadline
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    handleClose();
    setDeleteDialogOpen(true);
  };

  const handleEditClick = () => {
    handleClose();
    setEditDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    const success = await onDelete(task.id);
    if (success) {
      setDeleteDialogOpen(false);
    }
  };

  const handleStatusChange = async (newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    handleClose();
    await onUpdate(task.id, { status: newStatus });
  };

  const handleSaveEdit = async () => {
    const success = await onUpdate(task.id, editedTask);
    if (success) {
      setEditDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT').format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'success';
      case 'IN_PROGRESS':
        return 'primary';
      case 'TODO':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'Da fare';
      case 'IN_PROGRESS':
        return 'In corso';
      case 'DONE':
        return 'Completato';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'Alta';
      case 'MEDIUM':
        return 'Media';
      case 'LOW':
        return 'Bassa';
      default:
        return priority;
    }
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" component="div" sx={{ 
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              maxWidth: '80%'
            }}>
              {task.title}
            </Typography>
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box display="flex" gap={1} mb={2} flexWrap="wrap">
            <Chip 
              label={getStatusLabel(task.status)} 
              size="small" 
              color={getStatusColor(task.status) as any}
            />
            <Chip 
              label={getPriorityLabel(task.priority)} 
              size="small" 
              color={getPriorityColor(task.priority) as any}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{
            mb: 2,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}>
            {task.description}
          </Typography>
          
          <Typography variant="caption" display="block" color="text.secondary">
            Scadenza: {formatDate(task.deadline)}
          </Typography>
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Modifica</ListItemText>
        </MenuItem>
        
        {task.status !== 'TODO' && (
          <MenuItem onClick={() => handleStatusChange('TODO')}>
            <ListItemIcon>
              <PauseIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sposta in "Da fare"</ListItemText>
          </MenuItem>
        )}
        
        {task.status !== 'IN_PROGRESS' && (
          <MenuItem onClick={() => handleStatusChange('IN_PROGRESS')}>
            <ListItemIcon>
              <PlayArrowIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sposta in "In corso"</ListItemText>
          </MenuItem>
        )}
        
        {task.status !== 'DONE' && (
          <MenuItem onClick={() => handleStatusChange('DONE')}>
            <ListItemIcon>
              <DoneIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Segna come completato</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Elimina</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Conferma eliminazione</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sei sicuro di voler eliminare questa task? Questa azione non può essere annullata.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annulla</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Elimina
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifica Task</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            id="title"
            label="Titolo"
            type="text"
            fullWidth
            variant="outlined"
            value={editedTask.title}
            onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="description"
            label="Descrizione"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editedTask.description}
            onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
            sx={{ mb: 2 }}
          />
          <Box display="flex" gap={2}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Stato</InputLabel>
              <Select
                value={editedTask.status}
                label="Stato"
                onChange={(e) => setEditedTask({...editedTask, status: e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE'})}
              >
                <MenuItem value="TODO">Da fare</MenuItem>
                <MenuItem value="IN_PROGRESS">In corso</MenuItem>
                <MenuItem value="DONE">Completato</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Priorità</InputLabel>
              <Select
                value={editedTask.priority}
                label="Priorità"
                onChange={(e) => setEditedTask({...editedTask, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH'})}
              >
                <MenuItem value="LOW">Bassa</MenuItem>
                <MenuItem value="MEDIUM">Media</MenuItem>
                <MenuItem value="HIGH">Alta</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={itLocale}>
            <DatePicker 
              label="Scadenza"
              value={new Date(editedTask.deadline || Date.now())}
              onChange={(newDate) => {
                if (newDate) {
                  setEditedTask({...editedTask, deadline: newDate.toISOString()});
                }
              }}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Annulla</Button>
          <Button onClick={handleSaveEdit} variant="contained">Salva</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskCard;