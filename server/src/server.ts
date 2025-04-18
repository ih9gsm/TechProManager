import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import userRoutes from './routes/users'; // Import user routes
import { authenticateToken } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (example - apply middleware where needed)
// app.use(authenticateToken); // Apply to all subsequent routes if needed

app.use('/api/projects', projectRoutes); // Assumes projects need auth
app.use('/api/tasks', taskRoutes); // Assumes tasks need auth
app.use('/api/users', userRoutes); // Add user routes

// Basic root route
app.get('/', (req, res) => {
  res.send('TechProManager API Running!');
});

// Error handling middleware (basic example)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
