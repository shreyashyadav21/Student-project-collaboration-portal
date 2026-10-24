const db = require('../database/db');

// Calculate progress percentage: (completed / total) * 100
function calculateProgress(total, completed) {
  const t = parseInt(total, 10) || 0;
  const c = parseInt(completed, 10) || 0;
  if (t === 0) return 0;
  return Math.round((c / t) * 100);
}

// Get all projects for faculty monitoring with progress and alert metrics
exports.getMonitoredProjects = async (req, res) => {
  try {
    const query = `
      SELECT p.*, u.name AS creator_name, u.email AS creator_email,
             COUNT(DISTINCT pm.id) AS member_count,
             COUNT(t.id) AS total_tasks,
             COUNT(t.id) FILTER (WHERE t.status = 'To Do') AS todo_tasks,
             COUNT(t.id) FILTER (WHERE t.status = 'In Progress') AS in_progress_tasks,
             COUNT(t.id) FILTER (WHERE t.status = 'Completed') AS completed_tasks,
             COUNT(t.id) FILTER (WHERE t.status != 'Completed' AND t.deadline <= CURRENT_DATE + INTERVAL '7 days') AS approaching_deadline_tasks,
             (SELECT COUNT(*) FROM faculty_reviews fr WHERE fr.project_id = p.id) AS review_count
      FROM projects p
      JOIN users u ON p.creator_id = u.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id, u.name, u.email
      ORDER BY p.deadline ASC
    `;

    const result = await db.query(query);

    const projects = result.rows.map(row => ({
      ...row,
      completion_percentage: calculateProgress(row.total_tasks, row.completed_tasks)
    }));

    res.json({ projects });
  } catch (err) {
    console.error('getMonitoredProjects error:', err);
    res.status(500).json({ error: 'Failed to retrieve projects for faculty monitoring.' });
  }
};

// Full inspection of a project for faculty review
exports.getProjectInspection = async (req, res) => {
  try {
    const { projectId } = req.params;

    // 1. Project info
    const pRes = await db.query(
      `SELECT p.*, u.name AS creator_name, u.email AS creator_email
       FROM projects p
       JOIN users u ON p.creator_id = u.id
       WHERE p.id = $1`,
      [projectId]
    );

    if (pRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    const project = pRes.rows[0];

    // 2. Team members
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

    // 3. Tasks
    const tasksRes = await db.query(
      `SELECT t.*, u.name AS assignee_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.project_id = $1
       ORDER BY t.deadline ASC NULLS LAST`,
      [projectId]
    );

    // 4. Milestones
    const milestonesRes = await db.query(
      `SELECT * FROM project_milestones WHERE project_id = $1 ORDER BY target_date ASC NULLS LAST`,
      [projectId]
    );

    // 5. Documents
    const docsRes = await db.query(
      `SELECT pd.*, u.name AS uploaded_by_name
       FROM project_documents pd
       JOIN users u ON pd.uploaded_by = u.id
       WHERE pd.project_id = $1
       ORDER BY pd.uploaded_at DESC`,
      [projectId]
    );

    // 6. Links
    const linksRes = await db.query(
      `SELECT pl.*, u.name AS added_by_name
       FROM project_links pl
       JOIN users u ON pl.added_by = u.id
       WHERE pl.project_id = $1
       ORDER BY pl.created_at DESC`,
      [projectId]
    );

    // 7. Reviews history
    const reviewsRes = await db.query(
      `SELECT fr.*, u.name AS faculty_name
       FROM faculty_reviews fr
       JOIN users u ON fr.faculty_id = u.id
       WHERE fr.project_id = $1
       ORDER BY fr.review_date DESC`,
      [projectId]
    );

    const totalTasks = tasksRes.rows.length;
    const completedTasks = tasksRes.rows.filter(t => t.status === 'Completed').length;
    const completion_percentage = calculateProgress(totalTasks, completedTasks);

    res.json({
      project: {
        ...project,
        members: membersRes.rows,
        tasks: tasksRes.rows,
        milestones: milestonesRes.rows,
        documents: docsRes.rows,
        links: linksRes.rows,
        reviews: reviewsRes.rows,
        stats: {
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          completion_percentage
        }
      }
    });
  } catch (err) {
    console.error('getProjectInspection error:', err);
    res.status(500).json({ error: 'Failed to inspect project.' });
  }
};

// Submit faculty review feedback
exports.submitProjectReview = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { feedback } = req.body;
    const facultyId = req.user.id;

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({ error: 'Review feedback is required.' });
    }

    // Verify project exists
    const pCheck = await db.query(`SELECT id FROM projects WHERE id = $1`, [projectId]);
    if (pCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const insertRes = await db.query(
      `INSERT INTO faculty_reviews (project_id, faculty_id, feedback)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [projectId, facultyId, feedback.trim()]
    );

    const review = insertRes.rows[0];
    review.faculty_name = req.user.name;

    res.status(201).json({
      message: 'Review feedback submitted successfully',
      review
    });
  } catch (err) {
    console.error('submitProjectReview error:', err);
    res.status(500).json({ error: 'Failed to submit review feedback.' });
  }
};

// Get reviews for a project (accessible by both faculty and project members)
exports.getProjectReviews = async (req, res) => {
  try {
    const { projectId } = req.params;

    const query = `
      SELECT fr.*, u.name AS faculty_name, u.email AS faculty_email
      FROM faculty_reviews fr
      JOIN users u ON fr.faculty_id = u.id
      WHERE fr.project_id = $1
      ORDER BY fr.review_date DESC
    `;

    const result = await db.query(query, [projectId]);
    res.json({ reviews: result.rows });
  } catch (err) {
    console.error('getProjectReviews error:', err);
    res.status(500).json({ error: 'Failed to retrieve project reviews.' });
  }
};
