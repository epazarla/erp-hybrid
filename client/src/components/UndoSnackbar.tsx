import React from 'react';
import { Snackbar, Button, Alert } from '@mui/material';
import { Undo as UndoIcon } from '@mui/icons-material';

interface UndoSnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
  onUndo: () => void;
}

export default function UndoSnackbar({ open, message, onClose, onUndo }: UndoSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={15000} // 15 saniye
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ 
        mb: 2,
        '& .MuiAlert-root': {
          width: '100%',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          borderRadius: '8px'
        }
      }}
    >
      <Alert 
        onClose={onClose} 
        severity="info" 
        variant="filled"
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={onUndo}
            startIcon={<UndoIcon />}
            sx={{ fontWeight: 'bold' }}
          >
            Geri Al
          </Button>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
