const db = require('../database/db');

exports.addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { comment_text } = req.body;
    const userId = req.user.id;

    if (!comment_text || !comment_text.trim()) {
      return res.status(400).json({ error: 'Comment text is required.' });
    }

    // Verify task exists
    const taskCheck = await db.query(`SELECT id FROM tasks WHERE id = $1`, [taskId]);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const insertRes = await db.query(
      `INSERT INTO task_comments (task_id, user_id, comment_text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [taskId, userId, comment_text.trim()]
    );

    const comment = insertRes.rows[0];

    // Fetch author details
    const userRes = await db.query(`SELECT name, role FROM users WHERE id = $1`, [userId]);
    if (userRes.rows.length > 0) {
      comment.user_name = userRes.rows[0].name;
      comment.user_role = userRes.rows[0].role;
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (err) {
    console.error('addComment error:', err);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
};

exports.getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const query = `
      SELECT tc.*, u.name AS user_name, u.role AS user_role
      FROM task_comments tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.task_id = $1
      ORDER BY tc.created_at ASC
    `;

    const result = await db.query(query, [taskId]);
    res.json({ comments: result.rows });
  } catch (err) {
    console.error('getTaskComments error:', err);
    res.status(500).json({ error: 'Failed to retrieve task comments.' });
  }
};
