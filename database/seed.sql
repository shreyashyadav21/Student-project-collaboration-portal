-- ========================================================
-- Student Project and Team Collaboration Portal
-- Comprehensive Dummy Seed Data for Testing & Demonstration
-- Passwords for all sample users: password123
-- Hash: $2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe
-- ========================================================

-- Clear existing data cleanly
DELETE FROM faculty_reviews;
DELETE FROM project_links;
DELETE FROM project_documents;
DELETE FROM project_milestones;
DELETE FROM task_comments;
DELETE FROM tasks;
DELETE FROM team_invitations;
DELETE FROM project_members;
DELETE FROM projects;
DELETE FROM student_profiles;
DELETE FROM users;

-- 1. Insert Sample Users (Faculty and Students)
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Dr. Alan Turing', 'faculty.alan@university.edu', '$2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe', 'faculty'),
(2, 'Prof. Grace Hopper', 'faculty.grace@university.edu', '$2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe', 'faculty'),
(3, 'Dr. Ada Lovelace', 'faculty.ada@university.edu', '$2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe', 'faculty'),
(4, 'Alex Johnson', 'alex.johnson@student.edu', '$2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe', 'student'),
(5, 'Sarah Chen', 'sarah.chen@student.edu', '$2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe', 'student'),
(6, 'Marcus Rodriguez', 'marcus.rodriguez@student.edu', '$2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe', 'student'),
(7, 'Priya Patel', 'priya.patel@student.edu', '$2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe', 'student'),
(8, 'Liam O''Connor', 'liam.oconnor@student.edu', '$2a$10$d1NMVAUMwtFcSJqYHl9sru9HUcU00BlIDCkjPgjOZRUSz6URkVfSe', 'student');

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. Insert Student Profiles
INSERT INTO student_profiles (user_id, student_identifier, technical_skills, interests) VALUES
(4, 'STU-2026-001', 'React, Node.js, PostgreSQL, TypeScript, REST APIs, Git', 'Full Stack Web Development, Cloud Computing, System Architecture'),
(5, 'STU-2026-002', 'Python, PyTorch, Data Analysis, Machine Learning, OpenCV, SQL', 'Artificial Intelligence, Computer Vision, Deep Learning, NLP'),
(6, 'STU-2026-003', 'Figma, UI/UX Design, CSS3, Tailwind, React, Accessibility', 'Human-Computer Interaction, Frontend Development, Design Systems'),
(7, 'STU-2026-004', 'Java, Spring Boot, Microservices, Docker, PostgreSQL, Redis', 'Distributed Systems, Backend Architecture, DevOps, Security'),
(8, 'STU-2026-005', 'C++, Embedded C, ROS2, IoT Sensors, CAN-Bus, Linux', 'Robotics, Autonomous Vehicles, Hardware-in-the-Loop, Embedded Systems');

SELECT setval('student_profiles_id_seq', (SELECT MAX(id) FROM student_profiles));

-- 3. Insert Academic Projects
INSERT INTO projects (id, title, description, creator_id, deadline, status) VALUES
(1, 'Autonomous Campus Shuttle Navigation System', 'An AI-driven path planning, LiDAR/Camera fusion, and obstacle detection system for electric micro-shuttles navigating campus pedestrian pathways.', 4, CURRENT_DATE + INTERVAL '45 days', 'In Progress'),
(2, 'Smart Energy Grid Monitor', 'An IoT-enabled dashboard for real-time electrical load monitoring and predictive peak-demand alerts across campus science facilities.', 5, CURRENT_DATE + INTERVAL '18 days', 'In Progress'),
(3, 'Decentralized Health Records Exchange', 'A secure medical record audit trail utilizing cryptographic signatures and role-based permissions for campus health services.', 6, CURRENT_DATE + INTERVAL '60 days', 'Planning'),
(4, 'AI Academic Integrity & Plagiarism Inspector', 'An NLP transformer pipeline analyzing source code similarity, style entropy, and synthetic text generation for computer science grading.', 7, CURRENT_DATE + INTERVAL '30 days', 'In Progress');

SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));

-- 4. Insert Project Members (Creator is initial Team Leader)
INSERT INTO project_members (project_id, student_id, membership_role) VALUES
-- Project 1 Members
(1, 4, 'Team Leader'),
(1, 5, 'Member'),
(1, 6, 'Member'),
(1, 8, 'Member'),
-- Project 2 Members
(2, 5, 'Team Leader'),
(2, 7, 'Member'),
(2, 8, 'Member'),
-- Project 3 Members
(3, 6, 'Team Leader'),
(3, 4, 'Member'),
-- Project 4 Members
(4, 7, 'Team Leader'),
(4, 5, 'Member');

SELECT setval('project_members_id_seq', (SELECT MAX(id) FROM project_members));

-- 5. Insert Team Invitations
INSERT INTO team_invitations (project_id, invited_student_id, invited_by, invitation_status) VALUES
(1, 7, 4, 'pending'),
(2, 4, 5, 'pending'),
(3, 5, 6, 'pending'),
(4, 6, 7, 'pending');

SELECT setval('team_invitations_id_seq', (SELECT MAX(id) FROM team_invitations));

-- 6. Insert Tasks Across All Projects & Kanban Stages
INSERT INTO tasks (id, project_id, title, description, assigned_to, priority, status, deadline) VALUES
-- Project 1 Tasks
(1, 1, 'Architecture Diagram & Specification', 'Define modular sensor integration and LiDAR/Camera fusion pipeline schema.', 4, 'High', 'Completed', CURRENT_DATE - INTERVAL '2 days'),
(2, 1, 'Computer Vision Obstacle Detection Model', 'Train YOLOv8 model on custom pedestrian and campus landmark dataset.', 5, 'High', 'In Progress', CURRENT_DATE + INTERVAL '5 days'),
(3, 1, 'Telemetry & Control UI Cockpit', 'Build interactive React telemetry dashboard with map-based tracking and velocity charts.', 6, 'Medium', 'To Do', CURRENT_DATE + INTERVAL '20 days'),
(4, 1, 'Hardware Interface CAN-Bus Driver', 'Implement low-level serial communication driver for micro-controller steering.', 8, 'Low', 'To Do', CURRENT_DATE + INTERVAL '28 days'),

-- Project 2 Tasks (Smart Energy Grid - with approaching deadline alert)
(5, 2, 'Time-Series Load Forecaster', 'Build LSTM regression model for hourly campus power consumption forecasting.', 5, 'High', 'In Progress', CURRENT_DATE + INTERVAL '4 days'),
(6, 2, 'Sensor Telemetry Ingestion API', 'Develop Express endpoints with payload schema validation and rate limiting.', 7, 'Medium', 'Completed', CURRENT_DATE - INTERVAL '1 days'),
(7, 2, 'IoT Firmware Gateway Integration', 'Flash ESP32 gateway controllers to transmit MQTT power metrics to broker.', 8, 'High', 'To Do', CURRENT_DATE + INTERVAL '6 days'),

-- Project 3 Tasks (Health Records)
(8, 3, 'Cryptographic Audit Trail Protocol', 'Design signature verification and tampering detection algorithms.', 6, 'High', 'To Do', CURRENT_DATE + INTERVAL '25 days'),
(9, 3, 'HIPAA Compliance & Access Control Specs', 'Formulate student privacy requirements and consent revoking protocol.', 4, 'Medium', 'To Do', CURRENT_DATE + INTERVAL '35 days'),

-- Project 4 Tasks (Plagiarism Inspector)
(10, 4, 'AST Code Normalization Engine', 'Parse Python and Java syntax trees to normalize variable names and control structures.', 7, 'High', 'In Progress', CURRENT_DATE + INTERVAL '12 days'),
(11, 4, 'Cosine Vector Embedding Index', 'Generate Dense vectors for code submissions using CodeBERT and indexing in database.', 5, 'Medium', 'Completed', CURRENT_DATE - INTERVAL '4 days'),
(12, 4, 'Instructor Grading UI & Diff Viewer', 'Side-by-side colorized source code difference viewer with percentage similarity overlay.', 7, 'Low', 'To Do', CURRENT_DATE + INTERVAL '22 days');

SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));

-- 7. Insert Task Comments
INSERT INTO task_comments (task_id, user_id, comment_text) VALUES
(1, 4, 'Initial system architecture specification has been drafted and reviewed with team.'),
(2, 5, 'Training dataset gathered with 2,400 labeled images. Accuracy is currently at 89.4%.'),
(2, 4, 'Looks solid Sarah! Let us aim for >92% mAP before integrating into the main pathfinder node.'),
(2, 1, 'Dr. Alan Turing here: Make sure to evaluate edge cases under low-lighting and rainy conditions.'),
(5, 5, 'LSTM baseline model initialized. Working on hyperparameter tuning and sliding window size.'),
(6, 7, 'Express sensor ingestion API tested against simulated 1,000 requests/sec load test. Handled with zero dropouts.');

SELECT setval('task_comments_id_seq', (SELECT MAX(id) FROM task_comments));

-- 8. Insert Project Milestones
INSERT INTO project_milestones (id, project_id, title, description, target_date, status) VALUES
(1, 1, 'Phase 1: Research & Specifications', 'Finalize architecture, component selection, and safety protocols.', CURRENT_DATE - INTERVAL '5 days', 'Completed'),
(2, 1, 'Phase 2: Core Algorithm & AI Model Prototype', 'Demonstrate 90%+ obstacle avoidance in simulated sandbox.', CURRENT_DATE + INTERVAL '15 days', 'In Progress'),
(3, 1, 'Phase 3: Hardware In-the-Loop Integration', 'Full vehicle bench test with simulated sensors and emergency cutoff.', CURRENT_DATE + INTERVAL '35 days', 'Pending'),
(4, 2, 'Phase 1: Sensor Gateway Deployment', 'Deploy 10 metering nodes in Science Hall.', CURRENT_DATE - INTERVAL '10 days', 'Completed'),
(5, 2, 'Phase 2: Predictive Analytics Pipeline', 'Real-time alert engine for campus electrical spikes.', CURRENT_DATE + INTERVAL '12 days', 'In Progress'),
(6, 3, 'Phase 1: Protocol Whitepaper & Cryptographic Design', 'Publish threat model and formal verification proofs.', CURRENT_DATE + INTERVAL '30 days', 'Pending'),
(7, 4, 'Phase 1: Parsing & Vector Indexing Prototype', 'Achieve sub-second similarity lookups across 10,000 code repositories.', CURRENT_DATE + INTERVAL '14 days', 'In Progress');

SELECT setval('project_milestones_id_seq', (SELECT MAX(id) FROM project_milestones));

-- 9. Insert Project Documents (referencing existing physical files in uploads/)
INSERT INTO project_documents (project_id, uploaded_by, file_name, file_reference) VALUES
(1, 4, 'Campus_Shuttle_Architecture_v1.pdf', 'uploads/Campus_Shuttle_Architecture_v1.pdf'),
(1, 5, 'Obstacle_Detection_Dataset_Spec.docx', 'uploads/Obstacle_Detection_Dataset_Spec.docx'),
(2, 5, 'Smart_Grid_Requirements.pdf', 'uploads/Smart_Grid_Requirements.pdf'),
(3, 6, 'Health_Exchange_Whitepaper.pdf', 'uploads/Health_Exchange_Whitepaper.pdf');

-- 10. Insert Project Links
INSERT INTO project_links (project_id, added_by, title, url) VALUES
(1, 4, 'Project GitHub Repository', 'https://github.com/academic-collab/campus-shuttle-ai'),
(1, 6, 'UI Wireframes on Figma', 'https://www.figma.com/file/sample-shuttle-dashboard'),
(2, 5, 'Energy Grid Telemetry Docs', 'https://docs.smartgrid.org/api/v1'),
(3, 6, 'Decentralized Identity Specification', 'https://w3c.github.io/did-core/'),
(4, 7, 'HuggingFace CodeBERT Model Hub', 'https://huggingface.co/microsoft/codebert-base');

-- 11. Insert Faculty Reviews
INSERT INTO faculty_reviews (project_id, faculty_id, feedback) VALUES
(1, 1, 'Excellent architectural foundation. Make sure to document fail-safe redundant mechanisms for the obstacle detection subsystem prior to Milestone 2 review.'),
(1, 2, 'Strong cross-functional distribution between AI, Frontend, and Embedded systems. Keep up the steady cadence.'),
(2, 2, 'Good progress on telemetry ingestion. Ensure you implement outlier filtering for erroneous sensor pings before final deployment.'),
(4, 3, 'Well-scoped NLP application. Consider evaluating language models on obfuscated code snippets to test robustness.');
