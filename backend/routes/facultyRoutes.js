const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Faculty monitoring routes
router.get('/projects', authenticateToken, requireRole('faculty'), facultyController.getMonitoredProjects);
router.get('/projects/:projectId', authenticateToken, requireRole('faculty'), facultyController.getProjectInspection);
router.post('/projects/:projectId/reviews', authenticateToken, requireRole('faculty'), facultyController.submitProjectReview);
router.get('/projects/:projectId/reviews', authenticateToken, facultyController.getProjectReviews);

module.exports = router;
