import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  title?: string;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  itemName,
  title = 'Conferma eliminazione',
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Sei sicuro di voler eliminare <Typography component="span" fontWeight="bold">{itemName}</Typography>?
          <br />
          Questa azione non può essere annullata.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Annulla
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Elimina
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
