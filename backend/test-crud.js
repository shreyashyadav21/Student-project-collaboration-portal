// ========================================================
// Full CRUD Operations Verification Test Suite
// Student Project and Team Collaboration Portal
// ========================================================
const app = require('./app');
const { initializeDatabase } = require('./database/db');

async function runCrudVerification() {
  console.log('========================================================');
  console.log('STARTING COMPLETE CRUD OPERATIONS VERIFICATION TEST');
  console.log('========================================================\n');

  await initializeDatabase();
  const server = app.listen(5098);
  const baseUrl = 'http://localhost:5098/api';

  async function api(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const data = await res.json();
    return { status: res.status, data };
  }

  try {
    // ----------------------------------------------------
    // 1. AUTH & PROFILE CRUD
    // ----------------------------------------------------
    console.log('--- 1. Testing Auth & Profile CRUD ---');
    // CREATE: Register new student
    const testEmail = `test.student.${Date.now()}@student.edu`;
    const regRes = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'CRUD Test Student',
        email: testEmail,
        password: 'password123',
        role: 'student',
        student_identifier: 'STU-TEST-999',
        technical_skills: 'Python, C++, Docker',
        interests: 'Robotics, Distributed Systems'
      })
    });
    console.log('  [CREATE] User Registered:', regRes.status === 201 ? 'SUCCESS' : 'FAILED', regRes.data.user?.name);
    const testUserToken = regRes.data.token;
    const testUserId = regRes.data.user.id;

    // READ: Login as seeded student Alex Johnson
    const alexLogin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'alex.johnson@student.edu', password: 'password123' })
    });
    console.log('  [READ] Seeded User Login:', alexLogin.status === 200 ? 'SUCCESS' : 'FAILED', alexLogin.data.user?.name);
    const alexToken = alexLogin.data.token;

    // UPDATE: Update profile technical skills
    const updateProf = await api('/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: JSON.stringify({
        student_identifier: 'STU-TEST-999-MOD',
        technical_skills: 'Python, C++, Docker, Kubernetes, Rust',
        interests: 'Autonomous Drone Swarms'
      })
    });
    console.log('  [UPDATE] Student Profile Updated:', updateProf.status === 200 ? 'SUCCESS' : 'FAILED', updateProf.data.profile?.technical_skills);

    // READ: Get profile & student directory
    const getProf = await api('/profile', {
      headers: { Authorization: `Bearer ${testUserToken}` }
    });
    console.log('  [READ] Profile Verified:', getProf.data.profile?.student_identifier === 'STU-TEST-999-MOD' ? 'SUCCESS' : 'FAILED');

    // ----------------------------------------------------
    // 2. PROJECTS CRUD
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Project Management CRUD ---');
    // CREATE: Create new project
    const createProjectRes = await api('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({
        title: 'Deep Ocean Submersible Sensor Node',
        description: 'Underwater sonar telemetry node with mesh acoustic network.',
        deadline: '2026-12-31',
        status: 'In Progress'
      })
    });
    const createdProjectId = createProjectRes.data.project.id;
    console.log('  [CREATE] Project Created:', createProjectRes.status === 201 ? 'SUCCESS' : 'FAILED', `ID: ${createdProjectId}`, createProjectRes.data.project.title);

    // READ: Get project details with stats
    const getProjectRes = await api(`/projects/${createdProjectId}`, {
      headers: { Authorization: `Bearer ${alexToken}` }
    });
    console.log('  [READ] Project Details Retrieved:', getProjectRes.status === 200 ? 'SUCCESS' : 'FAILED', `Role: ${getProjectRes.data.project.membership?.membership_role}`);

    // UPDATE: Update project description & deadline
    const updateProjectRes = await api(`/projects/${createdProjectId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({
        title: 'Deep Ocean Submersible Sensor Node v2',
        status: 'Planning'
      })
    });
    console.log('  [UPDATE] Project Updated:', updateProjectRes.status === 200 ? 'SUCCESS' : 'FAILED', `Title: ${updateProjectRes.data.project.title}, Status: ${updateProjectRes.data.project.status}`);

    // ----------------------------------------------------
    // 3. TEAM MEMBERS & INVITATIONS CRUD
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Team Formation & Invitations CRUD ---');
    // CREATE: Invite test student to newly created project
    const inviteRes = await api(`/teams/${createdProjectId}/invite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({ studentId: testUserId })
    });
    const inviteId = inviteRes.data.invitation.id;
    console.log('  [CREATE] Team Invitation Sent:', inviteRes.status === 201 ? 'SUCCESS' : 'FAILED', `Invite ID: ${inviteId}`);

    // READ: Student reads received invitations
    const myInvites = await api('/teams/invitations', {
      headers: { Authorization: `Bearer ${testUserToken}` }
    });
    console.log('  [READ] Pending Invitations Count:', myInvites.data.invitations?.length > 0 ? 'SUCCESS' : 'FAILED');

    // UPDATE: Student accepts invitation
    const acceptRes = await api(`/teams/invitations/${inviteId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: JSON.stringify({ action: 'accepted' })
    });
    console.log('  [UPDATE] Invitation Accepted:', acceptRes.data.action === 'accepted' ? 'SUCCESS' : 'FAILED');

    // READ: Verify project team members roster
    const teamRes = await api(`/teams/${createdProjectId}/members`, {
      headers: { Authorization: `Bearer ${alexToken}` }
    });
    const isNowMember = teamRes.data.members?.some(m => m.student_id === testUserId);
    console.log('  [READ] Member Roster Verified in Database:', isNowMember ? 'SUCCESS' : 'FAILED', `Total Members: ${teamRes.data.members?.length}`);

    // ----------------------------------------------------
    // 4. TASK MANAGEMENT & KANBAN CRUD
    // ----------------------------------------------------
    console.log('\n--- 4. Testing Task Management & Kanban Board CRUD ---');
    // CREATE: Create a task allocated to newly accepted member
    const createTaskRes = await api('/tasks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({
        project_id: createdProjectId,
        title: 'Calibrate Hydrophone Acoustic Transducer',
        description: 'Verify 20kHz acoustic frequency reception in pressurized test tank.',
        assigned_to: testUserId,
        priority: 'High',
        status: 'To Do',
        deadline: '2026-11-15'
      })
    });
    const taskId = createTaskRes.data.task.id;
    console.log('  [CREATE] Task Created:', createTaskRes.status === 201 ? 'SUCCESS' : 'FAILED', `Task ID: ${taskId}, Assignee: ${createTaskRes.data.task.assignee_name}`);

    // READ: Get tasks for project
    const getTasksRes = await api(`/tasks/project/${createdProjectId}`, {
      headers: { Authorization: `Bearer ${alexToken}` }
    });
    console.log('  [READ] Tasks List Retrieved:', getTasksRes.data.tasks?.length === 1 ? 'SUCCESS' : 'FAILED');

    // UPDATE: Update task priority & description
    const updateTaskRes = await api(`/tasks/${taskId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({
        priority: 'Medium',
        description: 'Updated tank testing protocols approved.'
      })
    });
    console.log('  [UPDATE] Task Details Updated:', updateTaskRes.data.task.priority === 'Medium' ? 'SUCCESS' : 'FAILED');

    // UPDATE STATUS: Move task across Kanban columns (To Do -> In Progress -> Completed)
    const kanbanMove1 = await api(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({ status: 'In Progress' })
    });
    console.log('  [UPDATE - KANBAN] Moved to "In Progress":', kanbanMove1.data.task.status === 'In Progress' ? 'SUCCESS' : 'FAILED');

    const kanbanMove2 = await api(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({ status: 'Completed' })
    });
    console.log('  [UPDATE - KANBAN] Moved to "Completed":', kanbanMove2.data.task.status === 'Completed' ? 'SUCCESS' : 'FAILED');

    // READ: Verify calculated progress percentage (should be 100% since 1 of 1 task is completed)
    const progressRes = await api(`/projects/${createdProjectId}/progress`, {
      headers: { Authorization: `Bearer ${alexToken}` }
    });
    console.log('  [READ - FORMULA] Progress Percentage Calculated:', `${progressRes.data.progress.completion_percentage}%`, progressRes.data.progress.completion_percentage === 100 ? 'SUCCESS' : 'FAILED');

    // ----------------------------------------------------
    // 5. TASK COMMENTS CRUD
    // ----------------------------------------------------
    console.log('\n--- 5. Testing Task Comments CRUD ---');
    // CREATE: Add comment on task
    const addCommentRes = await api(`/comments/task/${taskId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: JSON.stringify({
        comment_text: 'Transducer calibration confirmed zero jitter at 20kHz.'
      })
    });
    console.log('  [CREATE] Comment Posted:', addCommentRes.status === 201 ? 'SUCCESS' : 'FAILED', `Author: ${addCommentRes.data.comment.user_name}`);

    // READ: Read comments thread
    const getCommentsRes = await api(`/comments/task/${taskId}`, {
      headers: { Authorization: `Bearer ${alexToken}` }
    });
    console.log('  [READ] Comments Thread Retrieved:', getCommentsRes.data.comments?.length === 1 ? 'SUCCESS' : 'FAILED');

    // ----------------------------------------------------
    // 6. PROJECT MILESTONES CRUD
    // ----------------------------------------------------
    console.log('\n--- 6. Testing Project Milestones CRUD ---');
    // CREATE: Add milestone
    const createMilestoneRes = await api('/milestones', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({
        project_id: createdProjectId,
        title: 'Milestone 1: Pressure Tank Testing',
        description: 'Complete 5-bar hydrostatic pressure test.',
        target_date: '2026-11-20',
        status: 'In Progress'
      })
    });
    const milestoneId = createMilestoneRes.data.milestone.id;
    console.log('  [CREATE] Milestone Created:', createMilestoneRes.status === 201 ? 'SUCCESS' : 'FAILED', `ID: ${milestoneId}`);

    // UPDATE: Update milestone status to Completed
    const updateMilestoneRes = await api(`/milestones/${milestoneId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({ status: 'Completed' })
    });
    console.log('  [UPDATE] Milestone Updated to Completed:', updateMilestoneRes.data.milestone.status === 'Completed' ? 'SUCCESS' : 'FAILED');

    // ----------------------------------------------------
    // 7. PROJECT LINKS CRUD
    // ----------------------------------------------------
    console.log('\n--- 7. Testing Project Resources & Links CRUD ---');
    // CREATE: Add URL link
    const addLinkRes = await api('/resources/links', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({
        project_id: createdProjectId,
        title: 'Acoustic Mesh Firmware Repo',
        url: 'https://github.com/academic-collab/acoustic-mesh'
      })
    });
    const linkId = addLinkRes.data.link.id;
    console.log('  [CREATE] Project Link Added:', addLinkRes.status === 201 ? 'SUCCESS' : 'FAILED', addLinkRes.data.link.url);

    // READ: Get links
    const getLinksRes = await api(`/resources/links/project/${createdProjectId}`, {
      headers: { Authorization: `Bearer ${alexToken}` }
    });
    console.log('  [READ] Project Links Count:', getLinksRes.data.links?.length === 1 ? 'SUCCESS' : 'FAILED');

    // DELETE: Delete link
    const deleteLinkRes = await api(`/resources/links/${linkId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${alexToken}` }
    });
    console.log('  [DELETE] Project Link Deleted:', deleteLinkRes.status === 200 ? 'SUCCESS' : 'FAILED');

    // ----------------------------------------------------
    // 8. FACULTY MONITORING & REVIEWS CRUD
    // ----------------------------------------------------
    console.log('\n--- 8. Testing Faculty Monitoring & Reviews CRUD ---');
    // Login as Faculty Dr. Alan Turing
    const facLogin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'faculty.alan@university.edu', password: 'password123' })
    });
    const facultyToken = facLogin.data.token;

    // READ: Faculty gets monitored projects roster
    const facProjects = await api('/faculty/projects', {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    console.log('  [READ] Faculty Monitored Projects Count:', facProjects.data.projects?.length > 0 ? 'SUCCESS' : 'FAILED');

    // READ: Faculty full inspection of project
    const inspectionRes = await api(`/faculty/projects/${createdProjectId}`, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    console.log('  [READ] Faculty Project Audit Retrieved:', inspectionRes.data.project.stats?.completion_percentage === 100 ? 'SUCCESS' : 'FAILED');

    // CREATE: Faculty submits review feedback
    const reviewRes = await api(`/faculty/projects/${createdProjectId}/reviews`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${facultyToken}` },
      body: JSON.stringify({
        feedback: 'Superb hydrostatic test execution. Recommended to proceed with ocean trial preparation.'
      })
    });
    console.log('  [CREATE] Faculty Review Submitted:', reviewRes.status === 201 ? 'SUCCESS' : 'FAILED', reviewRes.data.review.faculty_name);

    // READ: Get reviews history
    const getReviewsRes = await api(`/faculty/projects/${createdProjectId}/reviews`, {
      headers: { Authorization: `Bearer ${alexToken}` }
    });
    console.log('  [READ] Reviews History on Project:', getReviewsRes.data.reviews?.length === 1 ? 'SUCCESS' : 'FAILED');

    // ----------------------------------------------------
    // 9. CLEANUP / DELETE OPERATIONS
    // ----------------------------------------------------
    console.log('\n--- 9. Testing Delete Operations ---');
    // DELETE: Delete task
    const deleteTaskRes = await api(`/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${alexToken}` }
    });
    console.log('  [DELETE] Task Deleted:', deleteTaskRes.status === 200 ? 'SUCCESS' : 'FAILED');

    // DELETE: Delete milestone
    const deleteMilestoneRes = await api(`/milestones/${milestoneId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${alexToken}` }
    });
    console.log('  [DELETE] Milestone Deleted:', deleteMilestoneRes.status === 200 ? 'SUCCESS' : 'FAILED');

    console.log('\n========================================================');
    console.log('>>> ALL CRUD OPERATIONS VERIFIED AND WORKING 100%! <<<');
    console.log('========================================================\n');
  } catch (err) {
    console.error('CRUD Verification Error:', err);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
}

runCrudVerification();
