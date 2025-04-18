import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Button,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Task as TaskIcon,
  VerifiedUser as CompletedIcon,
  Comment as CommentIcon,
  Person as PersonIcon,
  ClearAll as ClearAllIcon,
} from '@mui/icons-material';

// Tipi di notifica
type NotificationType = 'task_assigned' | 'task_completed' | 'comment' | 'deadline' | 'project_invite';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    taskId?: string;
    projectId?: string;
    commentId?: string;
    userId?: string;
  };
}

interface NotificationsMenuProps {
  // In un'applicazione reale, si dovrebbero passare le notifiche effettive da un contesto o stato
  // Qui utilizziamo delle mock per la demo
}

const NotificationsMenu: React.FC<NotificationsMenuProps> = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Simula il caricamento delle notifiche (in un'app reale verrebbero dall'API)
  useEffect(() => {
    // Mock di notifiche per la demo
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'task_assigned',
        message: 'Sei stato assegnato al task "Completare il design"',
        read: false,
        createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minuti fa
        metadata: { taskId: 'task1', projectId: 'proj1' },
      },
      {
        id: '2',
        type: 'deadline',
        message: 'Il task "Implementare login" scade oggi',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 ora fa
        metadata: { taskId: 'task2', projectId: 'proj1' },
      },
      {
        id: '3',
        type: 'comment',
        message: 'Mario Rossi ha commentato sul task "Bug fix"',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 giorno fa
        metadata: { taskId: 'task3', commentId: 'comm1', userId: 'user1' },
      },
      {
        id: '4',
        type: 'project_invite',
        message: 'Sei stato invitato al progetto "Website Redesign"',
        read: true,
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 giorni fa
        metadata: { projectId: 'proj2' },
      },
      {
        id: '5',
        type: 'task_completed',
        message: 'Laura Bianchi ha completato il task "Database setup"',
        read: true,
        createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 giorni fa
        metadata: { taskId: 'task4', projectId: 'proj1', userId: 'user2' },
      }
    ];
    
    setNotifications(mockNotifications);
    updateUnreadCount(mockNotifications);
  }, []);
  
  // Calcola il numero di notifiche non lette
  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => !n.read).length;
    setUnreadCount(count);
  };
  
  // Gestione apertura/chiusura del menu
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  // Marca una notifica come letta e naviga alla risorsa collegata
  const handleNotificationClick = (notification: Notification) => {
    // Aggiorna lo stato letto
    const updatedNotifications = notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    );
    
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);
    
    // Naviga alla risorsa appropriata in base al tipo di notifica
    const { taskId, projectId } = notification.metadata || {};
    if (taskId) {
      navigate(`/tasks/${taskId}`);
    } else if (projectId) {
      navigate(`/projects/${projectId}`);
    }
    
    handleCloseMenu();
  };
  
  // Segna tutte le notifiche come lette
  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };
  
  // Formatta il tempo relativo (es. "30 minuti fa")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Adesso';
    if (diffMins < 60) return `${diffMins} min fa`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ore fa`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return `${diffDays} giorni fa`;
    
    return date.toLocaleDateString('it-IT');
  };
  
  // Seleziona l'icona appropriata in base al tipo di notifica
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'task_assigned':
        return <TaskIcon color="primary" />;
      case 'task_completed':
        return <CompletedIcon color="success" />;
      case 'comment':
        return <CommentIcon color="info" />;
      case 'deadline':
        return <TaskIcon color="error" />;
      case 'project_invite':
        return <PersonIcon color="secondary" />;
      default:
        return <NotificationsIcon />;
    }
  };
  
  const open = Boolean(anchorEl);
  
  return (
    <>
      <Tooltip title="Notifiche">
        <IconButton
          color="inherit"
          onClick={handleOpenMenu}
          aria-label="notifiche"
          size="large"
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        id="notifications-menu"
        open={open}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifiche</Typography>
          {unreadCount > 0 && (
            <Button
              startIcon={<ClearAllIcon />}
              size="small"
              onClick={handleMarkAllAsRead}
            >
              Segna tutte come lette
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Nessuna notifica
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                py: 1.5,
                borderLeft: notification.read ? 'none' : '3px solid',
                borderLeftColor: 'primary.main',
                backgroundColor: notification.read ? 'inherit' : 'action.hover',
              }}
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={notification.message}
                secondary={formatRelativeTime(notification.createdAt)}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: notification.read ? 'regular' : 'medium',
                }}
              />
            </MenuItem>
          ))
        )}
        
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
              <Button size="small" onClick={() => navigate('/notifications')}>
                Vedi tutte
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationsMenu;