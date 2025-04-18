import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth'; // Import middleware

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'; // Use fallback only for dev

// Funzione per generare hash password con crypto (sostituzione di bcrypt)
const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

// Funzione per verificare password
const verifyPassword = (storedPassword: string, suppliedPassword: string): boolean => {
  const [salt, storedHash] = storedPassword.split(':');
  const hash = crypto.pbkdf2Sync(suppliedPassword, salt, 1000, 64, 'sha512').toString('hex');
  return storedHash === hash;
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Create user
    const newUser = await db.insert(users).values({
      name,
      email,
      passwordHash,
      // role defaults to 'member' in schema
    }).returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    // Don't send password hash back
    res.status(201).json(newUser[0]);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find user by email
    const foundUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (foundUsers.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' }); // User not found
    }
    const user = foundUsers[0];

    // Compare password
    const isPasswordValid = verifyPassword(user.passwordHash, password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' }); // Wrong password
    }

    // Generate JWT
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

    // Send token and user info (without password hash)
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

// POST /api/auth/logout (optional)
// This typically involves client-side token removal. Server-side might involve blocklisting tokens if needed.
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful (client should clear token)' });
});

// GET /api/auth/me - Get current authenticated user info
router.get('/me', authenticateToken, async (req, res) => {
  if (!req.user) {
    // This should technically not happen if authenticateToken passes
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    // Fetch fresh user data from DB to ensure it's up-to-date
    const currentUser = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatarUrl: users.avatarUrl,
      }).from(users).where(eq(users.id, req.user.userId)).limit(1);

    if (currentUser.length === 0) {
      // User in token doesn't exist in DB anymore?
      return res.status(401).json({ message: 'Invalid token: User not found' });
    }

    res.json(currentUser[0]);

  } catch (error) {
     console.error('Error fetching /me:', error);
     res.status(500).json({ message: 'Internal server error fetching user details' });
  }
});

export default router;
