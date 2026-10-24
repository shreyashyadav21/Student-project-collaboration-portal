const db = require('../database/db');

// Invite a student to a project
exports.inviteStudent = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { studentId } = req.body;
    const invitedBy = req.user.id;

    if (!studentId) {
      return res.status(400).json({ error: 'Please select a student to invite.' });
    }

    if (parseInt(studentId, 10) === invitedBy) {
      return res.status(400).json({ error: 'You cannot invite yourself.' });
    }

    // Verify inviter is a member of the project
    const memberCheck = await db.query(
      `SELECT * FROM project_members WHERE project_id = $1 AND student_id = $2`,
      [projectId, invitedBy]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You must be a member of the project to invite others.' });
    }

    // Check if target student exists and is a student
    const studentCheck = await db.query(
      `SELECT id, name, email, role FROM users WHERE id = $1 AND role = 'student'`,
      [studentId]
    );
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Selected student not found.' });
    }

    // Check if already a member
    const alreadyMember = await db.query(
      `SELECT id FROM project_members WHERE project_id = $1 AND student_id = $2`,
      [projectId, studentId]
    );
    if (alreadyMember.rows.length > 0) {
      return res.status(400).json({ error: 'This student is already a member of the project.' });
    }

    // Check if pending invitation already exists
    const existingInvite = await db.query(
      `SELECT id FROM team_invitations
       WHERE project_id = $1 AND invited_student_id = $2 AND invitation_status = 'pending'`,
      [projectId, studentId]
    );
    if (existingInvite.rows.length > 0) {
      return res.status(400).json({ error: 'A pending invitation has already been sent to this student.' });
    }

    // Insert invitation
    const inviteRes = await db.query(
      `INSERT INTO team_invitations (project_id, invited_student_id, invited_by, invitation_status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [projectId, studentId, invitedBy]
    );

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation: inviteRes.rows[0]
    });
  } catch (err) {
    console.error('inviteStudent error:', err);
    res.status(500).json({ error: 'Failed to send invitation.' });
  }
};

// Get members and invitations for a specific project
exports.getProjectTeam = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Confirmed members
    const membersRes = await db.query(
      `SELECT pm.id, pm.project_id, pm.student_id, pm.membership_role, pm.joined_at,
              u.name, u.email, sp.student_identifier, sp.technical_skills, sp.interests
       FROM project_members pm
       JOIN users u ON pm.student_id = u.id
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       WHERE pm.project_id = $1
       ORDER BY pm.membership_role DESC, pm.joined_at ASC`,
      [projectId]
    );

    // Pending/sent invitations for this project
    const invitationsRes = await db.query(
      `SELECT ti.*, u.name AS invited_student_name, u.email AS invited_student_email,
              inviter.name AS invited_by_name,
              sp.student_identifier, sp.technical_skills, sp.interests
       FROM team_invitations ti
       JOIN users u ON ti.invited_student_id = u.id
       JOIN users inviter ON ti.invited_by = inviter.id
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       WHERE ti.project_id = $1
       ORDER BY ti.created_at DESC`,
      [projectId]
    );

    res.json({
      members: membersRes.rows,
      invitations: invitationsRes.rows
    });
  } catch (err) {
    console.error('getProjectTeam error:', err);
    res.status(500).json({ error: 'Failed to retrieve project team.' });
  }
};

// Get invitations sent to the currently logged-in student
exports.getMyInvitations = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      `SELECT ti.*, p.title AS project_title, p.description AS project_description, p.deadline AS project_deadline,
              u.name AS invited_by_name, u.email AS invited_by_email
       FROM team_invitations ti
       JOIN projects p ON ti.project_id = p.id
       JOIN users u ON ti.invited_by = u.id
       WHERE ti.invited_student_id = $1
       ORDER BY ti.created_at DESC`,
      [studentId]
    );

    res.json({ invitations: result.rows });
  } catch (err) {
    console.error('getMyInvitations error:', err);
    res.status(500).json({ error: 'Failed to retrieve your invitations.' });
  }
};

// Respond to invitation (accept or decline)
exports.respondToInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { action } = req.body; // 'accepted' or 'declined'
    const studentId = req.user.id;

    if (!['accepted', 'declined'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "accepted" or "declined".' });
    }

    // Verify invitation belongs to user and is pending
    const inviteRes = await db.query(
      `SELECT * FROM team_invitations WHERE id = $1 AND invited_student_id = $2`,
      [invitationId, studentId]
    );

    if (inviteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found or not addressed to you.' });
    }

    const invitation = inviteRes.rows[0];
    if (invitation.invitation_status !== 'pending') {
      return res.status(400).json({ error: `Invitation is already ${invitation.invitation_status}.` });
    }

    // Update status
    await db.query(
      `UPDATE team_invitations SET invitation_status = $1 WHERE id = $2`,
      [action, invitationId]
    );

    // If accepted, add to project_members
    if (action === 'accepted') {
      // Check if by any chance already in members
      const memberCheck = await db.query(
        `SELECT id FROM project_members WHERE project_id = $1 AND student_id = $2`,
        [invitation.project_id, studentId]
      );

      if (memberCheck.rows.length === 0) {
        await db.query(
          `INSERT INTO project_members (project_id, student_id, membership_role)
           VALUES ($1, $2, 'Member')`,
          [invitation.project_id, studentId]
        );
      }
    }

    res.json({
      message: `Invitation successfully ${action}.`,
      action,
      projectId: invitation.project_id
    });
  } catch (err) {
    console.error('respondToInvitation error:', err);
    res.status(500).json({ error: 'Failed to process invitation.' });
  }
};
