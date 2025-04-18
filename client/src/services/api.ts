import axios from 'axios';
import { mockAuthService, mockProjectsService, mockTasksService } from './mockApi';

// Flag per attivare la modalità offline (mock)
const USE_MOCK_API = false; // Disattivo completamente i mock

const apiClient = axios.create({
  baseURL: '/api', // Usa un baseURL relativo per attivare il proxy Vite
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Aggiungo un timeout di 10 secondi per le richieste
});

// Interceptor per aggiungere il token di autenticazione
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor per gestire gli errori di risposta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestione degli errori di connessione
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.error('Errore di connessione al server:', error.message);
      return Promise.reject({
        response: {
          data: {
            message: 'Impossibile connettersi al server. Verifica che il server sia in esecuzione.'
          }
        }
      });
    }
    
    return Promise.reject(error);
  }
);

// Servizi di autenticazione
export const authService = {
  login: async (email: string, password: string) => {
    if (USE_MOCK_API) {
      console.log('Usando mock API per login');
      const response = await mockAuthService.login(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    }
    
    const response = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },
  
  register: async (name: string, email: string, password: string) => {
    if (USE_MOCK_API) {
      console.log('Usando mock API per register');
      return await mockAuthService.register(name, email, password);
    }
    
    try {
      const response = await apiClient.post('/auth/register', { name, email, password });
      return response.data;
    } catch (error: any) {
      console.error('Errore durante la registrazione:', error);
      throw error;
    }
  },
  
  logout: () => {
    if (USE_MOCK_API) {
      console.log('Usando mock API per logout');
      mockAuthService.logout();
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: async () => {
    if (USE_MOCK_API) {
      console.log('Usando mock API per getCurrentUser');
      return mockAuthService.getCurrentUser();
    }
    
    return apiClient.get('/auth/me');
  },
};

// Servizi per i progetti
export const projectsService = {
  getAll: async () => {
    if (USE_MOCK_API) {
      console.log('Usando mock API per getAll projects');
      return mockProjectsService.getAll();
    }
    
    const response = await apiClient.get('/projects');
    return response.data;
  },
  
  getById: async (id: string) => {
    if (USE_MOCK_API) {
      console.log('Usando mock API per getById project');
      return mockProjectsService.getById(id);
    }
    
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },
  
  create: async (projectData: any) => {
    if (USE_MOCK_API) {
      console.log('Usando mock API per create project');
      return mockProjectsService.create(projectData);
    }
    
    const response = await apiClient.post('/projects', projectData);
    return response.data;
  },
  
  update: async (id: string, projectData: any) => {
    if (USE_MOCK_API) {
      console.log('Usando mock API per update project');
      return mockProjectsService.update(id, projectData);
    }
    
    const response = await apiClient.put(`/projects/${id}`, projectData);
    return response.data;
  },
  
  delete: async (id: string) => {
    if (USE_MOCK_API) {
      console.log('Usando mock API per delete project');
      return mockProjectsService.delete(id);
    }
    
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },
};

// Servizi per i task
export const tasksService = {
  getAll: async () => {
    if (USE_MOCK_API) {
      console.log('Usando mock API per getAll tasks');
      return mockTasksService.getAll();
    }
    
    const response = await apiClient.get('/tasks');
    return response.data;
  },
  
  getByProject: async (projectId: string) => {
    if (USE_MOCK_API) {
      console.log('Usando mock API per getByProject tasks');
      return mockTasksService.getByProject(projectId);
    }
    
    const response = await apiClient.get(`/projects/${projectId}/tasks`);
    return response.data;
  },
  
  getById: async (id: string) => {
    if (USE_MOCK_API) {
      console.log('Usando mock API per getById task');
      return mockTasksService.getById(id);
    }
    
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },
  
  create: async (taskData: any) => {
    if (USE_MOCK_API) {
      console.log('Usando mock API per create task');
      return mockTasksService.create(taskData);
    }
    
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  },
  
  update: async (id: string, taskData: any) => {
    if (USE_MOCK_API) {
      console.log('Usando mock API per update task');
      return mockTasksService.update(id, taskData);
    }
    
    const response = await apiClient.put(`/tasks/${id}`, taskData);
    return response.data;
  },
  
  updateStatus: async (id: string, status: string) => {
    if (USE_MOCK_API) {
      console.log('Usando mock API per updateStatus task');
      return mockTasksService.updateStatus(id, status);
    }
    
    const response = await apiClient.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },
  
  delete: async (id: string) => {
    if (USE_MOCK_API) {
      console.log('Usando mock API per delete task');
      return mockTasksService.delete(id);
    }
    
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },
};

export default apiClient;