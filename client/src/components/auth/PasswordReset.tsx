import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { authService } from '../../services/api';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Validazione email
  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    // Validazione client-side
    if (!isEmailValid(email)) {
      setError('Email non valida');
      return;
    }
    
    setLoading(true);
    try {
      // Da implementare nella tua API
      // await authService.requestPasswordReset(email);
      // Simulo una chiamata API per ora
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
    } catch (err: any) {
      console.error('Errore durante la richiesta di reset:', err);
      setError(err.message || 'Si è verificato un errore. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Recupero Password
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          {submitted ? (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Se l'indirizzo email è associato a un account, riceverai istruzioni per reimpostare la tua password.
              </Alert>
              <Link component={RouterLink} to="/login" variant="body2">
                Torna alla pagina di login
              </Link>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Inserisci l'indirizzo email associato al tuo account. Ti invieremo un'email con le istruzioni per reimpostare la password.
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Indirizzo Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={email !== '' && !isEmailValid(email)}
                helperText={email !== '' && !isEmailValid(email) ? 'Email non valida' : ''}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Invia istruzioni'}
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link component={RouterLink} to="/login" variant="body2">
                  Torna alla pagina di login
                </Link>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default PasswordReset;