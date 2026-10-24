const express = require('express');
const router = express.Router();
const milestoneController = require('../controllers/milestoneController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, milestoneController.createMilestone);
router.get('/project/:projectId', authenticateToken, milestoneController.getProjectMilestones);
router.put('/:id', authenticateToken, milestoneController.updateMilestone);
router.delete('/:id', authenticateToken, milestoneController.deleteMilestone);

module.exports = router;
