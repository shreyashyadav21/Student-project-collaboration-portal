const db = require('../database/db');

// Calculate completion percentage: (completed / total) * 100
function calculateProgress(total, completed) {
  const t = parseInt(total, 10) || 0;
  const c = parseInt(completed, 10) || 0;
  if (t === 0) return 0;
  return Math.round((c / t) * 100);
}

exports.createProject = async (req, res) => {
  try {
    const { title, description, deadline, status } = req.body;
    const creatorId = req.user.id;

    if (!title || !deadline) {
      return res.status(400).json({ error: 'Project title and deadline are required.' });
    }

    // Insert project
    const projectRes = await db.query(
      `INSERT INTO projects (title, description, creator_id, deadline, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title.trim(), description || '', creatorId, deadline, status || 'In Progress']
    );

    const project = projectRes.rows[0];

    // Automatically make creator the initial Team Leader
    await db.query(
      `INSERT INTO project_members (project_id, student_id, membership_role)
       VALUES ($1, $2, 'Team Leader')`,
      [project.id, creatorId]
    );

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        ...project,
        total_tasks: 0,
        completed_tasks: 0,
        completion_percentage: 0,
        membership_role: 'Team Leader'
      }
    });
  } catch (err) {
    console.error('createProject error:', err);
    res.status(500).json({ error: 'Failed to create project.' });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let queryText;
    let queryParams;

    if (userRole === 'faculty') {
      // Faculty can view all projects available for monitoring
      queryText = `
        SELECT p.*, u.name AS creator_name, u.email AS creator_email,
               COUNT(DISTINCT pm.id) AS member_count,
               COUNT(t.id) AS total_tasks,
               COUNT(t.id) FILTER (WHERE t.status = 'To Do') AS todo_tasks,
               COUNT(t.id) FILTER (WHERE t.status = 'In Progress') AS in_progress_tasks,
               COUNT(t.id) FILTER (WHERE t.status = 'Completed') AS completed_tasks,
               COUNT(t.id) FILTER (WHERE t.status != 'Completed' AND t.deadline <= CURRENT_DATE + INTERVAL '7 days') AS approaching_deadline_tasks
        FROM projects p
        JOIN users u ON p.creator_id = u.id
        LEFT JOIN project_members pm ON p.id = pm.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id, u.name, u.email
        ORDER BY p.deadline ASC
      `;
      queryParams = [];
    } else {
      // Students view projects they created or joined
      queryText = `
        SELECT p.*, u.name AS creator_name, u.email AS creator_email,
               pm_user.membership_role,
               COUNT(DISTINCT pm.id) AS member_count,
               COUNT(t.id) AS total_tasks,
               COUNT(t.id) FILTER (WHERE t.status = 'To Do') AS todo_tasks,
               COUNT(t.id) FILTER (WHERE t.status = 'In Progress') AS in_progress_tasks,
               COUNT(t.id) FILTER (WHERE t.status = 'Completed') AS completed_tasks
        FROM projects p
        JOIN users u ON p.creator_id = u.id
        LEFT JOIN project_members pm ON p.id = pm.project_id
        JOIN project_members pm_user ON p.id = pm_user.project_id AND pm_user.student_id = $1
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id, u.name, u.email, pm_user.membership_role
        ORDER BY p.creation_date DESC
      `;
      queryParams = [userId];
    }

    const result = await db.query(queryText, queryParams);

    const projectsWithProgress = result.rows.map((row) => ({
      ...row,
      completion_percentage: calculateProgress(row.total_tasks, row.completed_tasks)
    }));

    res.json({ projects: projectsWithProgress });
  } catch (err) {
    console.error('getProjects error:', err);
    res.status(500).json({ error: 'Failed to retrieve projects.' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check project exists
    const projectRes = await db.query(
      `SELECT p.*, u.name AS creator_name, u.email AS creator_email
       FROM projects p
       JOIN users u ON p.creator_id = u.id
       WHERE p.id = $1`,
      [projectId]
    );

    if (projectRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const project = projectRes.rows[0];

    // Check authorization: Student must be creator or member; Faculty has monitor permission
    let userMembership = null;
    if (userRole === 'student') {
      const memberCheck = await db.query(
        `SELECT * FROM project_members WHERE project_id = $1 AND student_id = $2`,
        [projectId, userId]
      );
      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ error: 'You are not authorized to view this project.' });
      }
      userMembership = memberCheck.rows[0];
    }

    // Get members with profiles
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

    // Get task statistics
    const taskStatsRes = await db.query(
      `SELECT
         COUNT(*) AS total_tasks,
         COUNT(*) FILTER (WHERE status = 'To Do') AS todo_tasks,
         COUNT(*) FILTER (WHERE status = 'In Progress') AS in_progress_tasks,
         COUNT(*) FILTER (WHERE status = 'Completed') AS completed_tasks
       FROM tasks
       WHERE project_id = $1`,
      [projectId]
    );

    const taskStats = taskStatsRes.rows[0];
    const completion_percentage = calculateProgress(taskStats.total_tasks, taskStats.completed_tasks);

    res.json({
      project: {
        ...project,
        membership: userMembership,
        members: membersRes.rows,
        stats: {
          total_tasks: parseInt(taskStats.total_tasks, 10) || 0,
          todo_tasks: parseInt(taskStats.todo_tasks, 10) || 0,
          in_progress_tasks: parseInt(taskStats.in_progress_tasks, 10) || 0,
          completed_tasks: parseInt(taskStats.completed_tasks, 10) || 0,
          completion_percentage
        }
      }
    });
  } catch (err) {
    console.error('getProjectById error:', err);
    res.status(500).json({ error: 'Failed to retrieve project details.' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { title, description, deadline, status } = req.body;

    // Check project exists and creator/team leader permissions
    const projectCheck = await db.query(
      `SELECT p.*, pm.membership_role
       FROM projects p
       LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.student_id = $2
       WHERE p.id = $1`,
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const current = projectCheck.rows[0];
    if (current.creator_id !== userId && current.membership_role !== 'Team Leader') {
      return res.status(403).json({ error: 'Only the project creator or team leader can update project details.' });
    }

    const updateRes = await db.query(
      `UPDATE projects
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           deadline = COALESCE($3, deadline),
           status = COALESCE($4, status)
       WHERE id = $5
       RETURNING *`,
      [title, description, deadline, status, projectId]
    );

    res.json({
      message: 'Project updated successfully',
      project: updateRes.rows[0]
    });
  } catch (err) {
    console.error('updateProject error:', err);
    res.status(500).json({ error: 'Failed to update project.' });
  }
};

exports.getProjectProgress = async (req, res) => {
  try {
    const projectId = req.params.id;

    const taskStatsRes = await db.query(
      `SELECT
         COUNT(*) AS total_tasks,
         COUNT(*) FILTER (WHERE status = 'To Do') AS todo_tasks,
         COUNT(*) FILTER (WHERE status = 'In Progress') AS in_progress_tasks,
         COUNT(*) FILTER (WHERE status = 'Completed') AS completed_tasks
       FROM tasks
       WHERE project_id = $1`,
      [projectId]
    );

    const stats = taskStatsRes.rows[0];
    const total = parseInt(stats.total_tasks, 10) || 0;
    const completed = parseInt(stats.completed_tasks, 10) || 0;
    const todo = parseInt(stats.todo_tasks, 10) || 0;
    const in_progress = parseInt(stats.in_progress_tasks, 10) || 0;
    const completion_percentage = calculateProgress(total, completed);

    res.json({
      progress: {
        total_tasks: total,
        todo_tasks: todo,
        in_progress_tasks: in_progress,
        completed_tasks: completed,
        completion_percentage
      }
    });
  } catch (err) {
    console.error('getProjectProgress error:', err);
    res.status(500).json({ error: 'Failed to calculate project progress.' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    // Only creator can delete project
    const projectCheck = await db.query(
      `SELECT creator_id FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (projectCheck.rows[0].creator_id !== userId) {
      return res.status(403).json({ error: 'Only the project creator can delete this project.' });
    }

    await db.query('DELETE FROM projects WHERE id = $1', [projectId]);

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('deleteProject error:', err);
    res.status(500).json({ error: 'Failed to delete project.' });
  }
};

