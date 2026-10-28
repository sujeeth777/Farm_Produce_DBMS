const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');

// Demo accounts for IA3 evaluation
const DEMO_USERS = [
  { id: 'demo_001', email: 'farmer@farmhub.com', password: 'Password123!', name: 'Ramesh Patel', role: 'Farm Manager', farm_name: 'Green Meadows Farm' },
  { id: 'demo_002', email: 'admin@farmhub.com', password: 'Password123!', name: 'Sarah Jenkins', role: 'Inventory Director', farm_name: 'Sunrise Agro Co.' },
];

// Hash helper
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check demo users first
    const demo = DEMO_USERS.find((u) => u.email === cleanEmail && u.password === password);
    if (demo) {
      const token = generateToken({ id: demo.id, email: demo.email, name: demo.name, role: demo.role, farm_name: demo.farm_name });
      return res.status(200).json({
        success: true,
        message: `Welcome back, ${demo.name}!`,
        token,
        user: { id: demo.id, email: demo.email, name: demo.name, role: demo.role, farm_name: demo.farm_name },
      });
    }

    // 2. Check MongoDB users collection
    const user = await User.findOne({ email: cleanEmail });
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken({ id: user._id, email: user.email, name: user.name, role: user.role, farm_name: user.farm_name });
    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role, farm_name: user.farm_name },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { email, password, full_name, farm_name } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required.' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) return res.status(400).json({ success: false, message: 'An account with this email already exists.' });

    const name = full_name?.trim() || cleanEmail.split('@')[0];
    const user = await User.create({
      name,
      email: cleanEmail,
      password: hashPassword(password),
      farm_name: farm_name || 'My Local Farm',
      role: 'farmer',
    });

    const token = generateToken({ id: user._id, email: user.email, name: user.name, role: user.role, farm_name: user.farm_name });
    return res.status(201).json({
      success: true,
      message: 'Account registered!',
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role, farm_name: user.farm_name },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
}

// GET /api/auth/me
async function getCurrentUser(req, res) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
  return res.status(200).json({ success: true, user: req.user });
}

// GET /api/auth/demo-credentials
function getDemoCredentials(req, res) {
  res.status(200).json({
    success: true,
    accounts: DEMO_USERS.map((u) => ({ email: u.email, name: u.name, role: u.role, passwordHint: 'Password123!' })),
  });
}

module.exports = { login, register, getCurrentUser, getDemoCredentials };
