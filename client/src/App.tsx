import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import TaskDetails from './pages/TaskDetails';
import NotFound from './pages/NotFound';
import theme from './theme';

// Componente protetto che verifica l'autenticazione
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated && !user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Componente che contiene tutte le rotte dell'applicazione
const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" />
          ) : (
            <Navigate to="/login" />
          )
        } 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/projects/:projectId" 
        element={
          <ProtectedRoute>
            <ProjectDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks/:taskId" 
        element={
          <ProtectedRoute>
            <TaskDetails />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Componente principale dell'applicazione
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
