import { Router } from 'express';
import { authenticateToken } from '../middleware/auth'; // Import middleware
import { db } from '../db';
import { tasks, taskAssignments, projects, projectMembers, users } from '../db/schema';
import { eq, and, or, sql, inArray } from 'drizzle-orm';
import type { Task, TaskPriority } from '@shared/types'; // Import shared types

const router = Router();

// Apply authentication middleware to all task routes
router.use(authenticateToken);

// GET /api/tasks - Recupera tutti i task (con informazioni su progetto e assegnatario)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Esegui la query selezionando i campi necessari e facendo join
    const allTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        project: {
          id: projects.id,
          name: projects.name,
        },
        assignee: {
          id: users.id,
          name: users.name,
        },
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(users, eq(tasks.assigneeId, users.id)); // Join con users per l'assegnatario

    res.json(allTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const userId = req.user.userId;
  const { title, description, priority, dueDate, projectId, assignedTo } = req.body as Partial<Task> & { assignedTo?: string[] }; // Use shared Task type

  if (!title) {
    return res.status(400).json({ message: 'Task title is required' });
  }

  try {
    // TODO: Add validation for projectId - check if project exists and user has access
    // TODO: Add validation for assignedTo user IDs - check if users exist

    const newTask = await db.transaction(async (tx) => {
      const insertedTasks = await tx.insert(tasks).values({
        title,
        description,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: projectId || null,
        // createdBy: userId, // Consider adding a createdBy field to tasks schema
      }).returning();

      const newTaskId = insertedTasks[0].id;

      // Handle assignments
      const assignees = assignedTo || [];
      // Always assign to the creator by default?
      if (!assignees.includes(userId)) {
          assignees.push(userId);
      }

      if (assignees.length > 0) {
        const assignmentValues = assignees.map(assigneeId => ({
          taskId: newTaskId,
          userId: assigneeId,
        }));
        await tx.insert(taskAssignments).values(assignmentValues);
      }

      return insertedTasks[0];
    });

    // Refetch task with assignments to return complete data?
    res.status(201).json(newTask);

  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

// GET /api/tasks/:id - Fetch a single task
router.get('/:id', async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const userId = req.user.userId;
  const taskId = req.params.id;

  try {
    // TODO: Check if user has access to this task (assigned or via project membership)
    const taskResult = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);

    if (taskResult.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Fetch assignments for the task
    const assignments = await db.select({ userId: taskAssignments.userId }).from(taskAssignments).where(eq(taskAssignments.taskId, taskId));
    const assignedUserIds = assignments.map(a => a.userId);

    // Check access (simplified: is user assigned?)
    if (!assignedUserIds.includes(userId)) {
       // TODO: Add check for project membership access
       // return res.status(403).json({ message: 'Forbidden: You do not have access to this task' });
    }

    res.json({ ...taskResult[0], assignedTo: assignedUserIds });

  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    res.status(500).json({ message: 'Failed to fetch task details' });
  }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const userId = req.user.userId;
  const taskId = req.params.id;
  const { title, description, isDone, priority, dueDate, assignedTo } = req.body as Partial<Task> & { assignedTo?: string[] };

  try {
    // TODO: Check if user has permission to update this task (e.g., assignee, project owner/member)
    const taskToUpdate = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    if (taskToUpdate.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Perform update
    const updatedTask = await db.transaction(async (tx) => {
      const updateData: Partial<typeof tasks.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (isDone !== undefined) updateData.isDone = isDone;
      if (priority !== undefined) updateData.priority = priority;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      // projectId update might need more complex logic/permissions

      const result = await tx.update(tasks)
        .set(updateData)
        .where(eq(tasks.id, taskId))
        .returning();

      // Handle assignment updates (replace existing assignments)
      if (assignedTo !== undefined) {
        // Delete existing assignments for this task
        await tx.delete(taskAssignments).where(eq(taskAssignments.taskId, taskId));
        // Insert new assignments
        if (assignedTo.length > 0) {
          const assignmentValues = assignedTo.map(assigneeId => ({
            taskId: taskId,
            userId: assigneeId,
          }));
          await tx.insert(taskAssignments).values(assignmentValues);
        }
      }
      return result[0];
    });

    // Refetch task with assignments?
    const finalAssignments = await db.select({ userId: taskAssignments.userId }).from(taskAssignments).where(eq(taskAssignments.taskId, taskId));

    res.json({ ...updatedTask, assignedTo: finalAssignments.map(a => a.userId) });

  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    res.status(500).json({ message: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const userId = req.user.userId;
  const taskId = req.params.id;

  try {
    // TODO: Check if user has permission to delete this task
    const taskToDelete = await db.select({ id: tasks.id }).from(tasks).where(eq(tasks.id, taskId)).limit(1);
    if (taskToDelete.length === 0) {
      return res.sendStatus(204); // Not found, but DELETE is idempotent
    }

    // Perform deletion (Drizzle doesn't cascade deletes automatically based on schema relations)
    // Need to delete related comments and assignments first if ON DELETE is not CASCADE in DB schema
    await db.transaction(async (tx) => {
        // await tx.delete(comments).where(eq(comments.taskId, taskId)); // If comments exist
        await tx.delete(taskAssignments).where(eq(taskAssignments.taskId, taskId));
        await tx.delete(tasks).where(eq(tasks.id, taskId));
    });

    res.sendStatus(204); // No Content

  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

// POST /api/tasks/:id/comments - Add a comment to a task
router.post('/:id/comments', async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const userId = req.user.userId;
  const taskId = req.params.id;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Comment content is required' });
  }

  try {
    // TODO: Check if task exists and user has access to comment
    // const taskExists = ...
    // const userHasAccess = ...

    // Insert comment (assuming comments schema exists)
    // const newComment = await db.insert(comments).values({ ... }).returning();
    // res.status(201).json(newComment[0]);

    res.status(501).json({ message: `POST /api/tasks/${req.params.id}/comments - Not implemented yet` });

  } catch (error) {
    console.error(`Error adding comment to task ${taskId}:`, error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

export default router;
