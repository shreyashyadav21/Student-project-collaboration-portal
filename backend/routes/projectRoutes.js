const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, projectController.createProject);
router.get('/', authenticateToken, projectController.getProjects);
router.get('/:id', authenticateToken, projectController.getProjectById);
router.put('/:id', authenticateToken, projectController.updateProject);
router.get('/:id/progress', authenticateToken, projectController.getProjectProgress);

module.exports = router;
