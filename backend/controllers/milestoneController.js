const db = require('../database/db');

exports.createMilestone = async (req, res) => {
  try {
    const { project_id, title, description, target_date, status } = req.body;
    const userId = req.user.id;

    if (!project_id || !title) {
      return res.status(400).json({ error: 'Project ID and milestone title are required.' });
    }

    // Verify user is a member of the project
    const memberCheck = await db.query(
      `SELECT * FROM project_members WHERE project_id = $1 AND student_id = $2`,
      [project_id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You must be a member of the project to create milestones.' });
    }

    const validStatuses = ['Pending', 'In Progress', 'Completed'];
    const milestoneStatus = validStatuses.includes(status) ? status : 'Pending';

    const insertRes = await db.query(
      `INSERT INTO project_milestones (project_id, title, description, target_date, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [project_id, title.trim(), description || '', target_date || null, milestoneStatus]
    );

    res.status(201).json({
      message: 'Milestone created successfully',
      milestone: insertRes.rows[0]
    });
  } catch (err) {
    console.error('createMilestone error:', err);
    res.status(500).json({ error: 'Failed to create milestone.' });
  }
};

exports.getProjectMilestones = async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await db.query(
      `SELECT * FROM project_milestones
       WHERE project_id = $1
       ORDER BY target_date ASC NULLS LAST, id ASC`,
      [projectId]
    );

    res.json({ milestones: result.rows });
  } catch (err) {
    console.error('getProjectMilestones error:', err);
    res.status(500).json({ error: 'Failed to retrieve milestones.' });
  }
};

exports.updateMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, target_date, status } = req.body;

    const updateRes = await db.query(
      `UPDATE project_milestones
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           target_date = COALESCE($3, target_date),
           status = COALESCE($4, status)
       WHERE id = $5
       RETURNING *`,
      [title, description, target_date, status, id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found.' });
    }

    res.json({
      message: 'Milestone updated successfully',
      milestone: updateRes.rows[0]
    });
  } catch (err) {
    console.error('updateMilestone error:', err);
    res.status(500).json({ error: 'Failed to update milestone.' });
  }
};

exports.deleteMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM project_milestones WHERE id = $1`, [id]);
    res.json({ message: 'Milestone deleted successfully' });
  } catch (err) {
    console.error('deleteMilestone error:', err);
    res.status(500).json({ error: 'Failed to delete milestone.' });
  }
};
