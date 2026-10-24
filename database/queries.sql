-- ========================================================
-- Student Project and Team Collaboration Portal
-- Common SQL Queries for Backend APIs
-- ========================================================

-- 1. Authentication & Profile
-- Register a new user
-- INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at;

-- Find user by email
-- SELECT * FROM users WHERE email = $1;

-- Get Student Profile with User Details
-- SELECT u.id, u.name, u.email, u.role, sp.student_identifier, sp.technical_skills, sp.interests
-- FROM users u
-- LEFT JOIN student_profiles sp ON u.id = sp.user_id
-- WHERE u.id = $1;

-- 2. Projects & Team Membership
-- Get all projects accessible to a student (created or joined)
-- SELECT DISTINCT p.*, u.name AS creator_name,
--        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS total_tasks,
--        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'Completed') AS completed_tasks
-- FROM projects p
-- JOIN users u ON p.creator_id = u.id
-- LEFT JOIN project_members pm ON p.id = pm.project_id
-- WHERE p.creator_id = $1 OR pm.student_id = $1
-- ORDER BY p.creation_date DESC;

-- Get project details with creator name
-- SELECT p.*, u.name AS creator_name, u.email AS creator_email
-- FROM projects p
-- JOIN users u ON p.creator_id = u.id
-- WHERE p.id = $1;

-- Get project members with profile details
-- SELECT pm.id, pm.project_id, pm.student_id, pm.membership_role, pm.joined_at,
--        u.name, u.email, sp.student_identifier, sp.technical_skills, sp.interests
-- FROM project_members pm
-- JOIN users u ON pm.student_id = u.id
-- LEFT JOIN student_profiles sp ON u.id = sp.user_id
-- WHERE pm.project_id = $1;

-- 3. Team Formation & Invitations
-- Get invitations for a student
-- SELECT ti.*, p.title AS project_title, p.description AS project_description, u.name AS invited_by_name
-- FROM team_invitations ti
-- JOIN projects p ON ti.project_id = p.id
-- JOIN users u ON ti.invited_by = u.id
-- WHERE ti.invited_student_id = $1
-- ORDER BY ti.created_at DESC;

-- Accept invitation transaction
-- UPDATE team_invitations SET invitation_status = 'accepted' WHERE id = $1;
-- INSERT INTO project_members (project_id, student_id, membership_role) VALUES ($2, $3, 'Member');

-- 4. Tasks & Progress Calculation
-- Get tasks for a project with assignee details
-- SELECT t.*, u.name AS assignee_name, u.email AS assignee_email
-- FROM tasks t
-- LEFT JOIN users u ON t.assigned_to = u.id
-- WHERE t.project_id = $1
-- ORDER BY t.created_at DESC;

-- Calculate Project Completion Percentage:
-- Project Completion (%) = (Completed Tasks / Total Tasks) * 100
-- SELECT
--   COUNT(*) AS total_tasks,
--   COUNT(*) FILTER (WHERE status = 'To Do') AS todo_tasks,
--   COUNT(*) FILTER (WHERE status = 'In Progress') AS in_progress_tasks,
--   COUNT(*) FILTER (WHERE status = 'Completed') AS completed_tasks,
--   CASE
--     WHEN COUNT(*) = 0 THEN 0
--     ELSE ROUND((COUNT(*) FILTER (WHERE status = 'Completed')::DECIMAL / COUNT(*)) * 100, 2)
--   END AS completion_percentage
-- FROM tasks
-- WHERE project_id = $1;

-- 5. Task Comments
-- SELECT tc.*, u.name AS user_name, u.role AS user_role
-- FROM task_comments tc
-- JOIN users u ON tc.user_id = u.id
-- WHERE tc.task_id = $1
-- ORDER BY tc.created_at ASC;

-- 6. Milestones
-- SELECT * FROM project_milestones WHERE project_id = $1 ORDER BY target_date ASC;

-- 7. Documents and Links
-- SELECT pd.*, u.name AS uploaded_by_name FROM project_documents pd
-- JOIN users u ON pd.uploaded_by = u.id WHERE pd.project_id = $1 ORDER BY pd.uploaded_at DESC;

-- SELECT pl.*, u.name AS added_by_name FROM project_links pl
-- JOIN users u ON pl.added_by = u.id WHERE pl.project_id = $1 ORDER BY pl.created_at DESC;

-- 8. Faculty Monitoring & Reviews
-- Get all projects with creator, task counts, completion percentage, and alert metrics
-- SELECT p.*, u.name AS creator_name,
--        COUNT(t.id) AS total_tasks,
--        COUNT(t.id) FILTER (WHERE t.status = 'Completed') AS completed_tasks,
--        COUNT(t.id) FILTER (WHERE t.status != 'Completed' AND t.deadline <= CURRENT_DATE + INTERVAL '7 days') AS approaching_deadline_tasks,
--        CASE
--          WHEN COUNT(t.id) = 0 THEN 0
--          ELSE ROUND((COUNT(t.id) FILTER (WHERE t.status = 'Completed')::DECIMAL / COUNT(t.id)) * 100, 2)
--        END AS completion_percentage
-- FROM projects p
-- JOIN users u ON p.creator_id = u.id
-- LEFT JOIN tasks t ON p.id = t.project_id
-- GROUP BY p.id, u.name
-- ORDER BY p.deadline ASC;

-- Submit faculty review
-- INSERT INTO faculty_reviews (project_id, faculty_id, feedback) VALUES ($1, $2, $3) RETURNING *;
