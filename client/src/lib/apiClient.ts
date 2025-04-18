import axios from 'axios';
import { useAuthStore } from '@/store/authStore'; // Import store
import type { Project, User, Task } from '@shared/types'; // Import Project and Task types

const apiClient = axios.create({
  baseURL: '/api', // Base URL for server API routes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (optional: handle 401 errors globally)
apiClient.interceptors.response.use(
  (response) => response, // Simply return successful responses
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      console.log('API Client: Received 401 Unauthorized. Clearing auth.');
      useAuthStore.getState().clearAuth();
      // Optionally redirect to login page
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// --- Auth API Functions --- 

export const loginUser = async (credentials: any) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data; // { token, user }
};

export const registerUser = async (userData: any) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data; // new user object
};

export const fetchCurrentUser = async (): Promise<User> => { // Add return type
  const response = await apiClient.get('/auth/me');
  return response.data;
};

// --- Project API Functions --- 

export const fetchProjects = async (): Promise<Project[]> => {
  const response = await apiClient.get('/projects');
  return response.data;
};

export const createProject = async (projectData: { title: string; description?: string }): Promise<Project> => {
  const response = await apiClient.post('/projects', projectData);
  return response.data;
};

// --- Task API Functions --- 

// Type for task data returned from API (might include assignments)
type ApiTask = Task & { assignedTo?: string[] };

export const fetchTasks = async (): Promise<ApiTask[]> => {
  const response = await apiClient.get('/tasks');
  return response.data;
};

export const createTask = async (taskData: Partial<Task> & { assignedTo?: string[] }): Promise<ApiTask> => {
  const response = await apiClient.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (taskId: string, updateData: Partial<Task> & { assignedTo?: string[] }): Promise<ApiTask> => {
  const response = await apiClient.put(`/tasks/${taskId}`, updateData);
  return response.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await apiClient.delete(`/tasks/${taskId}`);
};

// --- Users API ---

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    // Re-throw or handle error as appropriate for your app
    throw error;
  }
};
