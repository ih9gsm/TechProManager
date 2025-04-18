export type UserRole = "admin" | "member";

export interface User {
  id: string; // UUID
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
}

export interface Project {
  id: string; // UUID
  title: string;
  description?: string;
  ownerId: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  members?: User[]; // Added for clarity based on functionality 4.2
}

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string; // UUID
  projectId?: string | null; // Project ID
  title: string;
  description?: string;
  isDone: boolean;
  priority: TaskPriority;
  dueDate?: Date | null;
  assignedTo?: string[]; // Array of User IDs
  tags?: string[]; // Added based on functionality 4.3
  subtasks?: Task[]; // Added based on functionality 4.3
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string; // UUID
  taskId: string; // Task ID
  authorId: string; // User ID
  content: string;
  createdAt: Date;
}
