import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Tabella utenti
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }), // Assicura che sia primary key e auto-incrementante
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('member'),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabella progetti
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('pending'),
  dueDate: text('due_date'),
  ownerId: text('owner_id').notNull().references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabella task
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('pending'),
  priority: text('priority').notNull().default('medium'),
  dueDate: text('due_date'),
  projectId: text('project_id').notNull().references(() => projects.id),
  assigneeId: text('assignee_id').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabella per le relazioni utente-progetto
export const projectMembers = sqliteTable('project_members', {
  id: text('id').primaryKey().notNull(),
  projectId: text('project_id').notNull().references(() => projects.id),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role').notNull().default('member'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabella per commenti sui task
export const taskComments = sqliteTable('task_comments', {
  id: text('id').primaryKey().notNull(),
  taskId: text('task_id').notNull().references(() => tasks.id),
  userId: text('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
