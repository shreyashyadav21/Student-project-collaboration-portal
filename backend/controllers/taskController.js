const db = require('../database/db');

exports.createTask = async (req, res) => {
  try {
    const { project_id, title, description, assigned_to, priority, status, deadline } = req.body;
    const userId = req.user.id;

    if (!project_id || !title) {
      return res.status(400).json({ error: 'Project ID and task title are required.' });
    }

    // Check that user is a member of the project
    const memberCheck = await db.query(
      `SELECT * FROM project_members WHERE project_id = $1 AND student_id = $2`,
      [project_id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You must be a member of the project to create tasks.' });
    }

    // If assigned_to is specified, verify that assigned_to is a member of the project
    let assignedUserId = assigned_to ? parseInt(assigned_to, 10) : null;
    if (assignedUserId) {
      const assigneeCheck = await db.query(
        `SELECT id FROM project_members WHERE project_id = $1 AND student_id = $2`,
        [project_id, assignedUserId]
      );
      if (assigneeCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Assigned student must be a confirmed member of this project.' });
      }
    }

    const validPriorities = ['Low', 'Medium', 'High'];
    const validStatuses = ['To Do', 'In Progress', 'Completed'];

    const taskPriority = validPriorities.includes(priority) ? priority : 'Medium';
    const taskStatus = validStatuses.includes(status) ? status : 'To Do';

    const insertRes = await db.query(
      `INSERT INTO tasks (project_id, title, description, assigned_to, priority, status, deadline)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [project_id, title.trim(), description || '', assignedUserId, taskPriority, taskStatus, deadline || null]
    );

    const task = insertRes.rows[0];

    // Fetch assignee name if assigned
    if (task.assigned_to) {
      const uRes = await db.query(`SELECT name, email FROM users WHERE id = $1`, [task.assigned_to]);
      if (uRes.rows.length > 0) {
        task.assignee_name = uRes.rows[0].name;
        task.assignee_email = uRes.rows[0].email;
      }
    }

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
};

exports.getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const query = `
      SELECT t.*, u.name AS assignee_name, u.email AS assignee_email,
             sp.student_identifier AS assignee_identifier,
             (SELECT COUNT(*) FROM task_comments tc WHERE tc.task_id = t.id) AS comment_count
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE t.project_id = $1
      ORDER BY
        CASE t.priority
          WHEN 'High' THEN 1
          WHEN 'Medium' THEN 2
          WHEN 'Low' THEN 3
          ELSE 4
        END,
        t.deadline ASC NULLS LAST
    `;

    const result = await db.query(query, [projectId]);
    res.json({ tasks: result.rows });
  } catch (err) {
    console.error('getProjectTasks error:', err);
    res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
};

exports.getMyAssignedTasks = async (req, res) => {
  try {
    const studentId = req.user.id;

    const query = `
      SELECT t.*, p.title AS project_title,
             (SELECT COUNT(*) FROM task_comments tc WHERE tc.task_id = t.id) AS comment_count
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.assigned_to = $1
      ORDER BY
        CASE t.status
          WHEN 'In Progress' THEN 1
          WHEN 'To Do' THEN 2
          WHEN 'Completed' THEN 3
          ELSE 4
        END,
        t.deadline ASC NULLS LAST
    `;

    const result = await db.query(query, [studentId]);
    res.json({ tasks: result.rows });
  } catch (err) {
    console.error('getMyAssignedTasks error:', err);
    res.status(500).json({ error: 'Failed to retrieve assigned tasks.' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assigned_to, priority, status, deadline } = req.body;

    const taskRes = await db.query(`SELECT * FROM tasks WHERE id = $1`, [id]);
    if (taskRes.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    const currentTask = taskRes.rows[0];

    // If changing assigned_to, verify membership
    let assignedUserId = assigned_to !== undefined ? (assigned_to ? parseInt(assigned_to, 10) : null) : currentTask.assigned_to;
    if (assignedUserId) {
      const assigneeCheck = await db.query(
        `SELECT id FROM project_members WHERE project_id = $1 AND student_id = $2`,
        [currentTask.project_id, assignedUserId]
      );
      if (assigneeCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Assigned student must be a confirmed member of this project.' });
      }
    }

    const updateRes = await db.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           assigned_to = $3,
           priority = COALESCE($4, priority),
           status = COALESCE($5, status),
           deadline = COALESCE($6, deadline)
       WHERE id = $7
       RETURNING *`,
      [title, description, assignedUserId, priority, status, deadline, id]
    );

    const updated = updateRes.rows[0];

    // Fetch assignee info
    if (updated.assigned_to) {
      const uRes = await db.query(`SELECT name, email FROM users WHERE id = $1`, [updated.assigned_to]);
      if (uRes.rows.length > 0) {
        updated.assignee_name = uRes.rows[0].name;
        updated.assignee_email = uRes.rows[0].email;
      }
    }

    res.json({
      message: 'Task updated successfully',
      task: updated
    });
  } catch (err) {
    console.error('updateTask error:', err);
    res.status(500).json({ error: 'Failed to update task.' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['To Do', 'In Progress', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status must be "To Do", "In Progress", or "Completed".' });
    }

    const updateRes = await db.query(
      `UPDATE tasks
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const updated = updateRes.rows[0];
    if (updated.assigned_to) {
      const uRes = await db.query(`SELECT name, email FROM users WHERE id = $1`, [updated.assigned_to]);
      if (uRes.rows.length > 0) {
        updated.assignee_name = uRes.rows[0].name;
      }
    }

    res.json({
      message: `Task status updated to ${status}`,
      task: updated
    });
  } catch (err) {
    console.error('updateTaskStatus error:', err);
    res.status(500).json({ error: 'Failed to update task status.' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM tasks WHERE id = $1`, [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('deleteTask error:', err);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
};
