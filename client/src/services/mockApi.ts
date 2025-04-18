// Mock API per sviluppo senza backend

// Dati di esempio
const mockUsers = [
  {
    id: '1',
    name: 'Mario Rossi',
    email: 'mario@example.com',
    role: 'admin',
    avatarUrl: null,
  },
  {
    id: '2',
    name: 'Giulia Bianchi',
    email: 'giulia@example.com',
    role: 'member',
    avatarUrl: null,
  }
];

const mockProjects = [
  { 
    id: '1', 
    name: 'Redesign Website', 
    description: 'Aggiornamento del sito web aziendale',
    status: 'in-progress',
    dueDate: '2025-06-15',
  },
  { 
    id: '2', 
    name: 'App Mobile', 
    description: 'Sviluppo app mobile per clienti',
    status: 'pending',
    dueDate: '2025-07-30',
  },
  {
    id: '3',
    name: 'Migrazione Database',
    description: 'Migrazione da MySQL a PostgreSQL',
    status: 'completed',
    dueDate: '2025-03-10',
  }
];

const mockTasks = [
  {
    id: '1',
    title: 'Design Homepage',
    description: 'Creare il nuovo design della homepage',
    status: 'completed',
    priority: 'high',
    dueDate: '2025-05-20',
    projectId: '1',
    projectName: 'Redesign Website',
  },
  {
    id: '2',
    title: 'Sviluppo Frontend',
    description: 'Implementare il frontend responsive',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2025-06-01',
    projectId: '1',
    projectName: 'Redesign Website',
  },
  {
    id: '3',
    title: 'Wireframe App',
    description: 'Creare wireframe per app mobile',
    status: 'pending',
    priority: 'medium',
    dueDate: '2025-07-10',
    projectId: '2',
    projectName: 'App Mobile',
  },
  {
    id: '4',
    title: 'Schema Database',
    description: 'Definire il nuovo schema database',
    status: 'completed',
    priority: 'medium',
    dueDate: '2025-03-01',
    projectId: '3',
    projectName: 'Migrazione Database',
  },
  {
    id: '5',
    title: 'Test Backend',
    description: 'Testare le API del backend',
    status: 'pending',
    priority: 'low',
    dueDate: '2025-06-10',
    projectId: '1',
    projectName: 'Redesign Website',
  }
];

// Simula una risposta asincrona del server
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Servizi di autenticazione
export const mockAuthService = {
  login: async (email: string, password: string) => {
    await delay();
    const user = mockUsers.find(u => u.email === email);
    
    if (!user || password !== 'password') {
      throw { 
        response: { 
          data: { message: 'Credenziali non valide' } 
        } 
      };
    }
    
    const token = 'mock-jwt-token';
    return { user, token };
  },
  
  register: async (name: string, email: string, password: string) => {
    await delay();
    if (mockUsers.some(u => u.email === email)) {
      throw { 
        response: { 
          data: { message: 'Email già in uso' } 
        } 
      };
    }
    
    const newUser = {
      id: String(mockUsers.length + 1),
      name,
      email,
      role: 'member',
      avatarUrl: null,
    };
    
    mockUsers.push(newUser);
    return newUser;
  },
  
  logout: () => {
    return true;
  },
  
  getCurrentUser: async () => {
    await delay();
    return { data: mockUsers[0] };
  },
};

// Servizi per i progetti
export const mockProjectsService = {
  getAll: async () => {
    await delay();
    return mockProjects;
  },
  
  getById: async (id: string) => {
    await delay();
    const project = mockProjects.find(p => p.id === id);
    if (!project) {
      throw { response: { data: { message: 'Progetto non trovato' } } };
    }
    return project;
  },
  
  create: async (projectData: any) => {
    await delay();
    const newProject = {
      id: String(mockProjects.length + 1),
      ...projectData,
    };
    mockProjects.push(newProject);
    return newProject;
  },
  
  update: async (id: string, projectData: any) => {
    await delay();
    const index = mockProjects.findIndex(p => p.id === id);
    if (index === -1) {
      throw { response: { data: { message: 'Progetto non trovato' } } };
    }
    
    mockProjects[index] = {
      ...mockProjects[index],
      ...projectData,
    };
    
    return mockProjects[index];
  },
  
  delete: async (id: string) => {
    await delay();
    const index = mockProjects.findIndex(p => p.id === id);
    if (index === -1) {
      throw { response: { data: { message: 'Progetto non trovato' } } };
    }
    
    mockProjects.splice(index, 1);
    return { success: true };
  },
};

// Servizi per i task
export const mockTasksService = {
  getAll: async () => {
    await delay();
    return mockTasks;
  },
  
  getByProject: async (projectId: string) => {
    await delay();
    return mockTasks.filter(t => t.projectId === projectId);
  },
  
  getById: async (id: string) => {
    await delay();
    const task = mockTasks.find(t => t.id === id);
    if (!task) {
      throw { response: { data: { message: 'Task non trovato' } } };
    }
    return task;
  },
  
  create: async (taskData: any) => {
    await delay();
    const newTask = {
      id: String(mockTasks.length + 1),
      ...taskData,
    };
    mockTasks.push(newTask);
    return newTask;
  },
  
  update: async (id: string, taskData: any) => {
    await delay();
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw { response: { data: { message: 'Task non trovato' } } };
    }
    
    mockTasks[index] = {
      ...mockTasks[index],
      ...taskData,
    };
    
    return mockTasks[index];
  },
  
  updateStatus: async (id: string, status: string) => {
    await delay();
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw { response: { data: { message: 'Task non trovato' } } };
    }
    
    mockTasks[index].status = status;
    return mockTasks[index];
  },
  
  delete: async (id: string) => {
    await delay();
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw { response: { data: { message: 'Task non trovato' } } };
    }
    
    mockTasks.splice(index, 1);
    return { success: true };
  },
};

export default {
  mockAuthService,
  mockProjectsService,
  mockTasksService
};