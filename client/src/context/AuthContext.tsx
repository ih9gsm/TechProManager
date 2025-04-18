import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Carica lo stato utente dal localStorage all'avvio
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        // Verifica se esiste un token JWT valido
        const token = localStorage.getItem('token');
        
        if (token) {
          // Ottieni i dati utente dal server usando il token
          const userData = localStorage.getItem('user');
          if (userData) {
            setUser(JSON.parse(userData));
          } else {
            // Se non abbiamo i dati utente, li richiediamo al server
            try {
              const response = await authService.getCurrentUser();
              const userData = response.data;
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            } catch (error) {
              console.error('Errore nel recupero dati utente:', error);
              // Token non valido o scaduto
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Errore durante il controllo auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      // Token e utente sono salvati in localStorage direttamente da authService
    } catch (error) {
      console.error('Errore di login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.register(name, email, password);
      // Dopo la registrazione, facciamo login automaticamente
      await login(email, password);
    } catch (error) {
      console.error('Errore di registrazione:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};