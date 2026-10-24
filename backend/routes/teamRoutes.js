const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticateToken } = require('../middleware/auth');

router.post('/:projectId/invite', authenticateToken, teamController.inviteStudent);
router.get('/:projectId/members', authenticateToken, teamController.getProjectTeam);
router.get('/invitations', authenticateToken, teamController.getMyInvitations);
router.put('/invitations/:invitationId', authenticateToken, teamController.respondToInvitation);

module.exports = router;
