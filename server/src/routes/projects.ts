import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth'; // Import middleware
import { db } from '../db';
import { projects, projectMembers } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Apply authentication middleware to all project routes
router.use(authenticateToken);

// GET /api/projects - List projects the user is a member of or owns
router.get('/', async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const userId = req.user.userId;

  try {
    // Find projects where the user is the owner OR a member
    // This requires joining projects and projectMembers tables
    // TODO: Refine query to fetch projects based on ownership/membership
    const userProjects = await db.select().from(projects).where(eq(projects.ownerId, userId)); // Simplified for now
    res.json(userProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// POST /api/projects - Create a new project
router.post('/', async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const { title, description } = req.body;
  const ownerId = req.user.userId;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const newProject = await db.insert(projects).values({
      title,
      description,
      ownerId,
    }).returning();
    res.status(201).json(newProject[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// GET /api/projects/:id - Get project details (check ownership/membership)
router.get('/:id', async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const projectId = req.params.id;
  const userId = req.user.userId;

  try {
    // TODO: Add check to ensure user is owner or member of the project
    const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (project.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    // Add membership/ownership check here before returning
    res.json(project[0]);
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ message: 'Failed to fetch project details' });
  }
});

// PUT /api/projects/:id - Update project (check ownership/admin role)
router.put('/:id', async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const projectId = req.params.id;
  const userId = req.user.userId;
  const userRole = req.user.role;
  const { title, description } = req.body;

  try {
    const projectToUpdate = await db.select({ ownerId: projects.ownerId }).from(projects).where(eq(projects.id, projectId)).limit(1);

    if (projectToUpdate.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Authorization check: Only owner or admin can update
    if (projectToUpdate[0].ownerId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to update this project' });
    }

    const updatedProject = await db.update(projects)
      .set({ title, description, updatedAt: new Date() })
      .where(eq(projects.id, projectId))
      .returning();

    res.json(updatedProject[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete project (check ownership/admin role)
router.delete('/:id', async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const projectId = req.params.id;
  const userId = req.user.userId;
  const userRole = req.user.role;

  try {
    const projectToDelete = await db.select({ ownerId: projects.ownerId }).from(projects).where(eq(projects.id, projectId)).limit(1);

    if (projectToDelete.length === 0) {
      // Already gone or never existed, still return success for DELETE idempotency
      return res.sendStatus(204);
    }

    // Authorization check: Only owner or admin can delete
    if (projectToDelete[0].ownerId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this project' });
    }

    await db.delete(projects).where(eq(projects.id, projectId));
    res.sendStatus(204);

  } catch (error) {
    console.error('Error deleting project:', error);
    // Avoid sending detailed error messages for DELETE
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

// --- Project Member Routes --- (Example)

// POST /api/projects/:id/members - Add a member to a project (Owner/Admin only)
router.post('/:id/members', authorizeRole(['admin']), async (req, res) => { // Example: Admin only
  // TODO: Implement logic to add user to projectMembers table
  // Check if project exists, check if user exists, check if user is already member
  // Check if requestor is owner or admin
  res.status(501).json({ message: 'Add project member - Not implemented yet' });
});

// DELETE /api/projects/:id/members/:userId - Remove a member (Owner/Admin only)
router.delete('/:id/members/:userId', authorizeRole(['admin']), async (req, res) => { // Example: Admin only
  // TODO: Implement logic to remove user from projectMembers table
  // Check if project exists, check if user is member
  // Check if requestor is owner or admin
  res.status(501).json({ message: 'Remove project member - Not implemented yet' });
});

export default router;
