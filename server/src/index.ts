import express from 'express';
import dotenv from 'dotenv';
import { testDbConnection } from './db';
import authRouter from './routes/auth';
import projectsRouter from './routes/projects';
import tasksRouter from './routes/tasks';
import usersRouter from './routes/users';

// Carica le variabili d'ambiente
dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // Cambiato da 3000 a 3001 per corrispondere all'URL del client

// Middleware per CORS manuale
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Testa la connessione al database
testDbConnection().catch(err => {
  console.warn('Avvio con errori di connessione al DB:', err.message);
  console.warn('L\'app funzionerà in modalità limitata');
});

// Routes di base
app.get('/', (req, res) => {
  res.json({ message: 'TechProManager API' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/users', usersRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Si è verificato un errore interno',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default app;
