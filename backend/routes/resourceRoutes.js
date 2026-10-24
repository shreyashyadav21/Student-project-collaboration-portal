const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Document endpoints
router.post('/documents/upload', authenticateToken, upload.single('file'), resourceController.uploadDocument);
router.get('/documents/project/:projectId', authenticateToken, resourceController.getProjectDocuments);
router.get('/documents/download/:id', authenticateToken, resourceController.downloadDocument);

// Link endpoints
router.post('/links', authenticateToken, resourceController.addLink);
router.get('/links/project/:projectId', authenticateToken, resourceController.getProjectLinks);
router.delete('/links/:id', authenticateToken, resourceController.deleteLink);

module.exports = router;
