require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const projectRoutes = require('./routes/projectRoutes');
const teamRoutes = require('./routes/teamRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');
const milestoneRoutes = require('./routes/milestoneRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const facultyRoutes = require('./routes/facultyRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Student Project and Team Collaboration Portal API'
  });
});

// Seed endpoint for resetting or populating dummy data
app.post('/api/seed', async (req, res) => {
  try {
    const fs = require('fs');
    const { exec } = require('./database/db');
    const seedPath = path.join(__dirname, '../database/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await exec(seedSql);
    res.json({ message: 'Database successfully re-seeded with rich dummy data.' });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/faculty', facultyRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error occurred'
  });
});

module.exports = app;
