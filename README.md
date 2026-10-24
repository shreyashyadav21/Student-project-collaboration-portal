# Student Project and Team Collaboration Portal

A complete, full-stack web application designed to help university and college students form teams, manage academic and technical projects, allocate tasks, track milestones on a visual Kanban board, share project documents and URLs, and collaborate effectively. The platform also provides faculty members with a dedicated dashboard to monitor project progress, review deliverables, identify approaching deadlines, and submit structured feedback.

---

## 1. Project Objectives
- **Team Formation & Skill Discovery**: Allow students to showcase technical skills and project interests, and discover matching peers for academic project collaboration.
- **Structured Project Management**: Provide agile workflows used by software organizations, including task allocation, deadline tracking, priority tiers, and Kanban state progression.
- **Accurate Progress Tracking**: Compute live project completion percentages dynamically from real completed tasks:
  $$\text{Project Completion (\%)} = \left(\frac{\text{Number of Completed Tasks}}{\text{Total Number of Tasks}}\right) \times 100$$
- **Centralized Faculty Oversight**: Give faculty supervisors real-time visibility into project health, task allocation, milestones, and deliverable submissions, with a formal review mechanism.

---

## 2. Technology Stack

- **Frontend**:
  - React.js (v18)
  - Modern, responsive HTML5 and CSS3 design system
  - Lucide React iconography
  - Vite bundler
- **Backend**:
  - Node.js (v18+)
  - Express.js REST API architecture
  - Multer for protected project document uploads
  - Bcrypt.js for secure salted password hashing
  - JSON Web Tokens (JWT) for stateless role-based authorization
- **Database**:
  - PostgreSQL Relational Database (11 normalized tables with foreign keys and cascade rules)
  - Auto-connecting dual driver: connects to external PostgreSQL server or seamless embedded PostgreSQL (`@electric-sql/pglite`) for instant zero-configuration development
- **Development & Testing Tools**:
  - Git & GitHub for version control
  - Postman for REST API collection testing
  - Figma for UI/UX interface planning

---

## 3. User Roles and Permissions

| Role | Permissions & Capabilities |
| :--- | :--- |
| **Student** | • Register and login to portal<br>• Manage student profile (identifier, technical skills, interests)<br>• Search student directory to discover collaborators<br>• View accessible academic projects<br>• Create tasks, update task statuses, add comments<br>• Upload project documents and share reference links<br>• View milestones and overall progress |
| **Project Creator / Team Leader** | • Enter project title, description, and target deadline<br>• Automatically designated as Team Leader<br>• Invite students to join project<br>• Manage team composition and task assignments<br>• Define and manage project milestones<br>• Modify project parameters and oversee completion |
| **Faculty Member** | • Access dedicated Faculty Monitoring Dashboard<br>• View all student projects across courses<br>• Monitor tasks, assignees, priorities, deadlines, and statuses<br>• Identify incomplete tasks with approaching deadlines (< 7 days)<br>• Inspect project documents, links, and milestones<br>• Submit formal faculty review feedback and evaluation notes |

---

## 4. Project Folder Structure

```
PORTAL/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # User registration, login, and token issuance
│   │   ├── profileController.js    # Student profile management & student directory
│   │   ├── projectController.js    # Project CRUD and progress percentage calculation
│   │   ├── teamController.js       # Invitations and team member management
│   │   ├── taskController.js       # Task CRUD, assignments, and status updates
│   │   ├── commentController.js    # Task comments and team discussions
│   │   ├── milestoneController.js  # Project milestones and target deadlines
│   │   ├── resourceController.js   # Document uploads & project URLs
│   │   └── facultyController.js    # Faculty monitoring roster & review submission
│   ├── database/
│   │   ├── db.js                   # Unified PostgreSQL driver & auto-migrator
│   │   └── seed-runner.js          # Helper script to sync passwords & seeds
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification & role authorization
│   │   └── upload.js               # Multer file storage and type/size validation
│   ├── routes/                     # Modular Express REST API routes
│   ├── uploads/                    # Physical storage directory for uploaded files
│   ├── app.js                      # Express app setup and middleware registration
│   ├── server.js                   # Server bootstrap & database initialization
│   ├── test-backend.js             # Automated end-to-end integration test suite
│   └── package.json
├── database/
│   ├── schema.sql                  # PostgreSQL table definitions (11 tables)
│   ├── seed.sql                    # Initial seed data for students, faculty, & projects
│   └── queries.sql                 # Reference SQL queries used across the portal
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation with user badges
│   │   │   ├── CreateProjectModal.jsx # Project creation dialog
│   │   │   └── TaskCommentsModal.jsx  # Task comments thread dialog
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global authentication & user state
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx        # Login & Register with Student/Faculty toggle
│   │   │   ├── StudentDashboard.jsx# Student workspace, my tasks, invitations
│   │   │   ├── StudentProfile.jsx  # Profile editor & student discovery directory
│   │   │   ├── ProjectDetails.jsx  # Hub: Kanban, Tasks, Team, Milestones, Resources
│   │   │   └── FacultyDashboard.jsx# Faculty project oversight & review modal
│   │   ├── services/
│   │   │   └── api.js              # Centralized fetch client with JWT interceptor
│   │   ├── styles/
│   │   │   └── index.css           # Design system, cards, badges, Kanban columns
│   │   ├── App.jsx                 # View coordinator and route protection
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .env.example                    # Environment variable template
├── docker-compose.yml              # Optional PostgreSQL 16 Docker service
├── postman_collection.json         # Postman API test collection
└── README.md                       # Comprehensive system documentation
```

---

## 5. PostgreSQL Database Schema

The database consists of 11 normalized tables:

1. **`users`**: User credentials (`id`, `name`, `email`, `password_hash`, `role`, `created_at`).
2. **`student_profiles`**: Extended student details (`id`, `user_id`, `student_identifier`, `technical_skills`, `interests`).
3. **`projects`**: Project details (`id`, `title`, `description`, `creator_id`, `creation_date`, `deadline`, `status`).
4. **`project_members`**: Membership roster (`id`, `project_id`, `student_id`, `membership_role`, `joined_at`).
5. **`team_invitations`**: Invitation states (`id`, `project_id`, `invited_student_id`, `invited_by`, `invitation_status`, `created_at`).
6. **`tasks`**: Project tasks (`id`, `project_id`, `title`, `description`, `assigned_to`, `priority`, `status`, `deadline`, `created_at`).
7. **`task_comments`**: Discussion threads (`id`, `task_id`, `user_id`, `comment_text`, `created_at`).
8. **`project_milestones`**: Key checkpoints (`id`, `project_id`, `title`, `description`, `target_date`, `status`).
9. **`project_documents`**: Metadata for uploaded files (`id`, `project_id`, `uploaded_by`, `file_name`, `file_reference`, `uploaded_at`).
10. **`project_links`**: Shared URLs (`id`, `project_id`, `added_by`, `title`, `url`, `created_at`).
11. **`faculty_reviews`**: Formal evaluations (`id`, `project_id`, `faculty_id`, `feedback`, `review_date`).

---

## 6. Installation and Setup Instructions

### Prerequisites
- **Node.js** (v18.0 or higher)
- **npm** (v9.0 or higher)
- (Optional) **PostgreSQL** or **Docker Desktop** if running native external database.

### Step 1: Clone or Open the Repository
```bash
git clone https://github.com/your-username/student-project-portal.git
cd student-project-portal
```

### Step 2: Configure Environment Variables
Copy `.env.example` into `backend/.env`:
```bash
# In backend/.env
PORT=5000
JWT_SECRET=portal_super_secure_jwt_secret_key_2026

# Optional external PostgreSQL connection:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/student_portal
```
> **Note**: If `DATABASE_URL` or external PostgreSQL is not specified, the backend automatically uses embedded PostgreSQL (`@electric-sql/pglite`) persisting to `backend/database/pgdata/`.

### Step 3: Optional Docker PostgreSQL Setup
If you prefer running a local PostgreSQL container:
```bash
docker compose up -d
```

### Step 4: Install Dependencies
Install dependencies for both backend and frontend:
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

---

## 7. Running the Application

### Start the Backend Server:
```bash
cd backend
node server.js
```
The backend API starts on **`http://localhost:5000`**.  
Health check endpoint: **`http://localhost:5000/api/health`**.

### Start the Frontend Client:
In a separate terminal:
```bash
cd frontend
npm run dev
```
The React portal will open at **`http://localhost:3000`**.

---

## 8. Pre-Seeded Demo Accounts

All pre-seeded demo accounts share the password: **`password123`**.

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Student** | Alex Johnson (Team Leader) | `alex.johnson@student.edu` | `password123` |
| **Student** | Sarah Chen (Member) | `sarah.chen@student.edu` | `password123` |
| **Student** | Marcus Rodriguez (Member) | `marcus.rodriguez@student.edu` | `password123` |
| **Student** | Priya Patel (Student) | `priya.patel@student.edu` | `password123` |
| **Faculty** | Dr. Alan Turing (Faculty Advisor) | `faculty.alan@university.edu` | `password123` |
| **Faculty** | Prof. Grace Hopper (Faculty Advisor) | `faculty.grace@university.edu` | `password123` |

*(Convenient one-click demo login buttons are also provided directly on the Login interface).*

---

## 9. API Testing with Postman & Automated Suite

### Option A: Automated Backend Test Suite
Run the built-in test suite to verify all 13 API endpoints:
```bash
cd backend
node test-backend.js
```

### Option B: Postman Collection
1. Open **Postman**.
2. Click **Import** and select `postman_collection.json` located in the root directory.
3. Use the **Login** request to obtain a JWT token, set it in the collection variable `studentToken` or `facultyToken`, and execute all test requests across all 9 categories.

---

## 10. End-to-End Application Workflow

1. **Authentication**: Users log in as Student or Faculty. Role-based middleware routes them to the appropriate dashboard.
2. **Project Creation**: A student creates an academic project with a title, description, and deadline. The creator is automatically assigned as the Team Leader.
3. **Team Formation**: The team leader invites students from the directory. The invited students accept invitations through their dashboard to become confirmed members.
4. **Task Allocation & Kanban Tracking**: Team members create tasks, designate priorities (Low, Medium, High), assign members, and advance stages on the visual Kanban board.
5. **Progress Updates**: Task status transitions dynamically recalculate the project completion percentage in real time.
6. **Resource Sharing**: Students upload project architecture documents and share GitHub/Figma URLs.
7. **Milestone Tracking**: Teams track progress against deliverable deadlines.
8. **Faculty Review**: Faculty advisors inspect team allocation, review task completion velocity, check approaching deadlines, and submit formal reviews.
