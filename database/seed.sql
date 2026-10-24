-- ========================================================
-- Student Project and Team Collaboration Portal
-- Seed Data for Development and Testing
-- Passwords for all sample users: password123
-- Hash: $2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe
-- ========================================================

-- Insert Sample Users (Faculty and Students)
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Dr. Alan Turing', 'faculty.alan@university.edu', '$2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe', 'faculty'),
(2, 'Prof. Grace Hopper', 'faculty.grace@university.edu', '$2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe', 'faculty'),
(3, 'Alex Johnson', 'alex.johnson@student.edu', '$2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe', 'student'),
(4, 'Sarah Chen', 'sarah.chen@student.edu', '$2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe', 'student'),
(5, 'Marcus Rodriguez', 'marcus.rodriguez@student.edu', '$2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe', 'student'),
(6, 'Priya Patel', 'priya.patel@student.edu', '$2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe', 'student');

-- Sync user sequence if applicable
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Insert Student Profiles
INSERT INTO student_profiles (user_id, student_identifier, technical_skills, interests) VALUES
(3, 'STU-2026-001', 'React, Node.js, PostgreSQL, TypeScript, REST APIs', 'Full Stack Web Development, Cloud Computing, System Architecture'),
(4, 'STU-2026-002', 'Python, PyTorch, Data Analysis, Machine Learning, SQL', 'Artificial Intelligence, NLP, Data Science, Neural Networks'),
(5, 'STU-2026-003', 'Figma, UI/UX Design, CSS3, Tailwind, React, Accessibility', 'Human-Computer Interaction, Frontend Development, Design Systems'),
(6, 'STU-2026-004', 'Java, Spring Boot, Microservices, Docker, PostgreSQL', 'Distributed Systems, Backend Architecture, DevOps, Security');

SELECT setval('student_profiles_id_seq', (SELECT MAX(id) FROM student_profiles));

-- Insert Sample Projects
INSERT INTO projects (id, title, description, creator_id, deadline, status) VALUES
(1, 'Autonomous Campus Shuttle Navigation System', 'An AI-driven path planning and obstacle detection simulation for electric shuttles navigating campus grounds.', 3, CURRENT_DATE + INTERVAL '45 days', 'In Progress'),
(2, 'Smart Energy Grid Monitor', 'An IoT-enabled dashboard for real-time electrical load monitoring and predictive peak-demand alerts across campus facilities.', 4, CURRENT_DATE + INTERVAL '20 days', 'In Progress');

SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));

-- Insert Project Members (Project Creator is initial Team Leader)
INSERT INTO project_members (project_id, student_id, membership_role) VALUES
(1, 3, 'Team Leader'),
(1, 4, 'Member'),
(1, 5, 'Member'),
(2, 4, 'Team Leader'),
(2, 6, 'Member');

SELECT setval('project_members_id_seq', (SELECT MAX(id) FROM project_members));

-- Insert Team Invitations
INSERT INTO team_invitations (project_id, invited_student_id, invited_by, invitation_status) VALUES
(1, 6, 3, 'pending'),
(2, 3, 4, 'pending');

SELECT setval('team_invitations_id_seq', (SELECT MAX(id) FROM team_invitations));

-- Insert Tasks
INSERT INTO tasks (id, project_id, title, description, assigned_to, priority, status, deadline) VALUES
(1, 1, 'Architecture Diagram & Specification', 'Define modular sensor integration and LiDAR/Camera fusion pipeline schema.', 3, 'High', 'Completed', CURRENT_DATE + INTERVAL '5 days'),
(2, 1, 'Computer Vision Obstacle Detection Model', 'Train YOLOv8 model on custom pedestrian and campus landmark dataset.', 4, 'High', 'In Progress', CURRENT_DATE + INTERVAL '12 days'),
(3, 1, 'Telemetry & Control UI Dashboard', 'Build interactive React telemetry cockpit with map-based tracking and velocity charts.', 5, 'Medium', 'To Do', CURRENT_DATE + INTERVAL '22 days'),
(4, 1, 'Hardware Interface CAN-Bus Driver', 'Implement low-level serial communication driver for micro-controller steering.', 3, 'Low', 'To Do', CURRENT_DATE + INTERVAL '30 days'),
(5, 2, 'Time-Series Load Forecaster', 'Build LSTM regression model for hourly campus power consumption forecasting.', 4, 'High', 'In Progress', CURRENT_DATE + INTERVAL '10 days'),
(6, 2, 'Sensor Telemetry Ingestion API', 'Develop Express endpoints with payload schema validation and rate limiting.', 6, 'Medium', 'Completed', CURRENT_DATE + INTERVAL '7 days');

SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));

-- Insert Task Comments
INSERT INTO task_comments (task_id, user_id, comment_text) VALUES
(1, 3, 'Initial system architecture specification has been drafted and reviewed with team.'),
(2, 4, 'Training dataset gathered with 2,400 labeled images. Accuracy is currently at 89.4%.'),
(2, 3, 'Looks solid Sarah! Let us aim for >92% mAP before integrating into the main pathfinder node.'),
(5, 4, 'LSTM baseline model initialized. Working on hyperparameter tuning.');

SELECT setval('task_comments_id_seq', (SELECT MAX(id) FROM task_comments));

-- Insert Project Milestones
INSERT INTO project_milestones (id, project_id, title, description, target_date, status) VALUES
(1, 1, 'Phase 1: Research & Specifications', 'Finalize architecture, component selection, and safety protocols.', CURRENT_DATE - INTERVAL '5 days', 'Completed'),
(2, 1, 'Phase 2: Core Algorithm & AI Model Prototype', 'Demonstrate 90%+ obstacle avoidance in simulated sandbox.', CURRENT_DATE + INTERVAL '15 days', 'In Progress'),
(3, 1, 'Phase 3: Hardware In-the-Loop Integration', 'Full vehicle bench test with simulated sensors and emergency cutoff.', CURRENT_DATE + INTERVAL '35 days', 'Pending'),
(4, 2, 'Phase 1: Sensor Gateway Deployment', 'Deploy 10 metering nodes in Science Hall.', CURRENT_DATE - INTERVAL '10 days', 'Completed'),
(5, 2, 'Phase 2: Predictive Analytics Pipeline', 'Real-time alert engine for campus electrical spikes.', CURRENT_DATE + INTERVAL '18 days', 'In Progress');

SELECT setval('project_milestones_id_seq', (SELECT MAX(id) FROM project_milestones));

-- Insert Project Documents
INSERT INTO project_documents (project_id, uploaded_by, file_name, file_reference) VALUES
(1, 3, 'Campus_Shuttle_Architecture_v1.pdf', 'uploads/Campus_Shuttle_Architecture_v1.pdf'),
(1, 4, 'Obstacle_Detection_Dataset_Spec.docx', 'uploads/Obstacle_Detection_Dataset_Spec.docx'),
(2, 4, 'Smart_Grid_Requirements.pdf', 'uploads/Smart_Grid_Requirements.pdf');

-- Insert Project Links
INSERT INTO project_links (project_id, added_by, title, url) VALUES
(1, 3, 'Project GitHub Repository', 'https://github.com/academic-collab/campus-shuttle-ai'),
(1, 5, 'UI Wireframes on Figma', 'https://www.figma.com/file/sample-shuttle-dashboard'),
(2, 4, 'Energy Grid Telemetry Docs', 'https://docs.smartgrid.org/api/v1');

-- Insert Faculty Reviews
INSERT INTO faculty_reviews (project_id, faculty_id, feedback) VALUES
(1, 1, 'Excellent architectural foundation. Make sure to document fail-safe redundant mechanisms for the obstacle detection subsystem prior to Milestone 2 review.'),
(2, 2, 'Good progress on telemetry ingestion. Ensure you implement outlier filtering for erroneous sensor pings.');
