const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Received registration request:', req.body);
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    let existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      console.log('User with email already exists');
      return res.status(400).json({ message: 'Email already registered' });
    }

    existingUser = await db.User.findOne({ where: { username } });
    if (existingUser) {
      console.log('User with username already exists');
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create new user
    const user = await db.User.create({
      username,
      email,
      password // Password will be hashed by the model hook
    });

    console.log('User created successfully:', { id: user.id, username: user.username });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Token generated successfully');
    res.status(201).json({ token });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Received login request:', { username: req.body.username });
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const user = await db.User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', { username: user.username });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ 
      username: user.username,
      email: user.email 
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
