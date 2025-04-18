import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
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
    if (!name) {
      setError('Il nome è obbligatorio');
      return;
    }
    
    if (!isEmailValid(email)) {
      setError('Email non valida');
      return;
    }
    
    if (password.length < 6) {
      setError('La password deve contenere almeno 6 caratteri');
      return;
    }
    
    if (password !== passwordConfirm) {
      setError('Le password non corrispondono');
      return;
    }
    
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard'); // Redirect alla dashboard
    } catch (err: any) {
      console.error('Errore durante la registrazione:', err);
      setError(
        err.message || 
        'Errore durante la registrazione. Forse l\'email è già in uso?'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Registrati a TechProManager
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nome e Cognome"
              name="name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Indirizzo Email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={email !== '' && !isEmailValid(email)}
              helperText={email !== '' && !isEmailValid(email) ? 'Email non valida' : ''}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={password !== '' && password.length < 6}
              helperText={password !== '' && password.length < 6 ? 'La password deve contenere almeno 6 caratteri' : ''}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="passwordConfirm"
              label="Conferma Password"
              type="password"
              id="passwordConfirm"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              error={passwordConfirm !== '' && password !== passwordConfirm}
              helperText={passwordConfirm !== '' && password !== passwordConfirm ? 'Le password non corrispondono' : ''}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Registrati'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Hai già un account?{' '}
                <Link component={RouterLink} to="/login" variant="body2">
                  Accedi
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;