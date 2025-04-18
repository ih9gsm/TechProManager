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
  Divider, 
  Alert, 
  CircularProgress 
} from '@mui/material';
import { Google as GoogleIcon, GitHub as GitHubIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    
    if (password.length < 6) {
      setError('La password deve contenere almeno 6 caratteri');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard'); // Redirect alla dashboard
    } catch (err: any) {
      console.error('Errore durante il login:', err);
      setError(err.message || 'Credenziali non valide. Riprova.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOAuthLogin = (provider: string) => {
    // Implementazione futura per login OAuth
    setError(`Login con ${provider} non ancora implementato`);
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Accedi a TechProManager
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={password !== '' && password.length < 6}
              helperText={password !== '' && password.length < 6 ? 'La password deve contenere almeno 6 caratteri' : ''}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Accedi'}
            </Button>
            
            <Box sx={{ mt: 2, mb: 2 }}>
              <Link component={RouterLink} to="/password-reset" variant="body2">
                Password dimenticata?
              </Link>
            </Box>
            
            <Divider sx={{ my: 2 }}>oppure</Divider>
            
            {/* OAuth buttons */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => handleOAuthLogin('Google')}
              sx={{ mt: 1, mb: 1 }}
            >
              Continua con Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GitHubIcon />}
              onClick={() => handleOAuthLogin('GitHub')}
              sx={{ mb: 2 }}
            >
              Continua con GitHub
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Non hai un account?{' '}
                <Link component={RouterLink} to="/register" variant="body2">
                  Registrati
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;