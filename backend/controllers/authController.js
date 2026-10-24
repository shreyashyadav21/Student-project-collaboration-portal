const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { JWT_SECRET } = require('../middleware/auth');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, student_identifier, technical_skills, interests } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required.' });
    }

    if (!['student', 'faculty'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either "student" or "faculty".' });
    }

    // Check if email already exists
    const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'A user with this email address already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const userRes = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name.trim(), email.trim().toLowerCase(), password_hash, role]
    );
    const user = userRes.rows[0];

    // If student, create profile
    let profile = null;
    if (role === 'student') {
      const profileRes = await db.query(
        'INSERT INTO student_profiles (user_id, student_identifier, technical_skills, interests) VALUES ($1, $2, $3, $4) RETURNING *',
        [user.id, student_identifier || '', technical_skills || '', interests || '']
      );
      profile = profileRes.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        ...user,
        profile
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'An error occurred during registration. Please try again.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const userRes = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    let profile = null;
    if (user.role === 'student') {
      const profRes = await db.query('SELECT * FROM student_profiles WHERE user_id = $1', [user.id]);
      profile = profRes.rows[0] || null;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      profile
    };

    res.json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An error occurred during login. Please try again.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const userRes = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userRes.rows[0];
    let profile = null;
    if (user.role === 'student') {
      const profRes = await db.query('SELECT * FROM student_profiles WHERE user_id = $1', [user.id]);
      profile = profRes.rows[0] || null;
    }

    res.json({
      user: {
        ...user,
        profile
      }
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
};
