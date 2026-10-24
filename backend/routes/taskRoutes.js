const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, taskController.createTask);
router.get('/project/:projectId', authenticateToken, taskController.getProjectTasks);
router.get('/assigned', authenticateToken, taskController.getMyAssignedTasks);
router.put('/:id', authenticateToken, taskController.updateTask);
router.patch('/:id/status', authenticateToken, taskController.updateTaskStatus);
router.delete('/:id', authenticateToken, taskController.deleteTask);

module.exports = router;
