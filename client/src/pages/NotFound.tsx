import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import Header from '../components/Header';

const NotFound = () => {
  return (
    <Box>
      <Header />
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'primary.main' }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Pagina non trovata
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          La pagina che stai cercando non esiste o è stata spostata.
        </Typography>
        <Button
          component={RouterLink}
          to="/dashboard"
          variant="contained"
          startIcon={<HomeIcon />}
          size="large"
        >
          Torna alla Dashboard
        </Button>
      </Container>
    </Box>
  );
};

export default NotFound;