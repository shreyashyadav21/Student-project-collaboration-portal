const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/auth');

router.post('/task/:taskId', authenticateToken, commentController.addComment);
router.get('/task/:taskId', authenticateToken, commentController.getTaskComments);

module.exports = router;
