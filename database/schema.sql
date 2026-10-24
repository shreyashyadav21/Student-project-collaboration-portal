-- ========================================================
-- Student Project and Team Collaboration Portal
-- Database Schema for PostgreSQL
-- ========================================================

-- Drop existing tables if reinitializing
DROP TABLE IF EXISTS faculty_reviews CASCADE;
DROP TABLE IF EXISTS project_links CASCADE;
DROP TABLE IF EXISTS project_documents CASCADE;
DROP TABLE IF EXISTS project_milestones CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS team_invitations CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'faculty')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Student Profiles Table
CREATE TABLE student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_identifier VARCHAR(100),
    technical_skills TEXT,
    interests TEXT
);

-- 3. Projects Table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'In Progress' CHECK (status IN ('Planning', 'In Progress', 'Completed', 'On Hold'))
);

-- 4. Project Members Table
CREATE TABLE project_members (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    membership_role VARCHAR(50) DEFAULT 'Member' CHECK (membership_role IN ('Team Leader', 'Member')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_project_member UNIQUE (project_id, student_id)
);

-- 5. Team Invitations Table
CREATE TABLE team_invitations (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    invited_student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invited_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitation_status VARCHAR(50) DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tasks Table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    status VARCHAR(50) DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Completed')),
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Task Comments Table
CREATE TABLE task_comments (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Project Milestones Table
CREATE TABLE project_milestones (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed'))
);

-- 9. Project Documents Table
CREATE TABLE project_documents (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_reference VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Project Links Table
CREATE TABLE project_links (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    added_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Faculty Reviews Table
CREATE TABLE faculty_reviews (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    faculty_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feedback TEXT NOT NULL,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_student ON project_members(student_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_task_comments_task ON task_comments(task_id);
CREATE INDEX idx_milestones_project ON project_milestones(project_id);
CREATE INDEX idx_documents_project ON project_documents(project_id);
CREATE INDEX idx_links_project ON project_links(project_id);
CREATE INDEX idx_reviews_project ON faculty_reviews(project_id);
