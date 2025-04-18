import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth'; // Import middleware
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Apply authentication middleware to all user routes
router.use(authenticateToken);

// GET /api/users - List users (Admin only)
router.get('/', authorizeRole(['admin']), async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      // Add other fields if needed, e.g., email, name
    }).from(users);
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - Get a specific user's details (Admin or the user themselves)
router.get('/:id', async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const requestedUserId = req.params.id;
  const requestingUser = req.user;

  // Allow admin access or if the user is requesting their own info
  if (requestingUser.role !== 'admin' && requestingUser.userId !== requestedUserId) {
    return res.status(403).json({ message: 'Forbidden: You can only view your own details or you must be an admin.' });
  }

  try {
    const user = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, requestedUserId)).limit(1);

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user[0]);
  } catch (error) {
    console.error(`Error fetching user ${requestedUserId}:`, error);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
});

// TODO: Add routes for updating user roles (Admin only) or user profiles (User themselves or Admin)

export default router;
