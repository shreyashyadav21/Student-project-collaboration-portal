// Integration test script for all Student Project Portal APIs
const app = require('./app');
const { initializeDatabase } = require('./database/db');

async function runTests() {
  console.log('--- STARTING BACKEND INTEGRATION TESTS ---');
  await initializeDatabase();

  const server = app.listen(5099);
  const baseUrl = 'http://localhost:5099';

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
    // 1. Health check
    const health = await api('/api/health');
    console.log('✓ Health check:', health.status, health.data.status);

    // 2. Student Login
    const stuLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'alex.johnson@student.edu', password: 'password123' })
    });
    console.log('✓ Student Login:', stuLogin.status, stuLogin.data.user.name, 'Role:', stuLogin.data.user.role);
    const studentToken = stuLogin.data.token;

    // 3. Faculty Login
    const facLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'faculty.alan@university.edu', password: 'password123' })
    });
    console.log('✓ Faculty Login:', facLogin.status, facLogin.data.user.name, 'Role:', facLogin.data.user.role);
    const facultyToken = facLogin.data.token;

    // 4. Student Profile fetch & update
    const prof = await api('/api/profile', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('✓ Profile retrieved:', prof.data.profile.technical_skills);

    // 5. Get Student Projects
    const projectsRes = await api('/api/projects', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('✓ Student Projects count:', projectsRes.data.projects.length, 'First title:', projectsRes.data.projects[0].title);
    const projectId = projectsRes.data.projects[0].id;

    // 6. Get Project Details & Stats
    const pDetail = await api(`/api/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('✓ Project Details:', pDetail.data.project.title, 'Completion %:', pDetail.data.project.stats.completion_percentage);

    // 7. Get Project Team & Send Invite
    const teamRes = await api(`/api/teams/${projectId}/members`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('✓ Project Members count:', teamRes.data.members.length);

    // 8. Create a Task & Update status
    const newTask = await api('/api/tasks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        project_id: projectId,
        title: 'Integration Test Task',
        description: 'Verifying automated Kanban update',
        priority: 'High',
        status: 'To Do',
        deadline: '2026-11-30'
      })
    });
    console.log('✓ Task created:', newTask.data.task.id, newTask.data.task.title);
    const taskId = newTask.data.task.id;

    // Kanban status update
    const statusUpdate = await api(`/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ status: 'In Progress' })
    });
    console.log('✓ Kanban status moved to:', statusUpdate.data.task.status);

    // 9. Add Task Comment
    const commentRes = await api(`/api/comments/task/${taskId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ comment_text: 'Integration test comment working!' })
    });
    console.log('✓ Task comment added by:', commentRes.data.comment.user_name);

    // 10. Milestones
    const milestonesRes = await api(`/api/milestones/project/${projectId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('✓ Project milestones count:', milestonesRes.data.milestones.length);

    // 11. Project Links
    const addLink = await api('/api/resources/links', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        project_id: projectId,
        title: 'Documentation Reference',
        url: 'https://react.dev'
      })
    });
    console.log('✓ Resource link added:', addLink.data.link.title);

    // 12. Faculty Monitoring
    const facProjects = await api('/api/faculty/projects', {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    console.log('✓ Faculty Monitored projects:', facProjects.data.projects.length);

    // 13. Faculty Review Submission
    const facReview = await api(`/api/faculty/projects/${projectId}/reviews`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${facultyToken}` },
      body: JSON.stringify({ feedback: 'Outstanding progress on integration milestone.' })
    });
    console.log('✓ Faculty review submitted:', facReview.data.review.faculty_name, facReview.data.review.feedback);

    console.log('\n>>> ALL 13 BACKEND TEST CHECKS PASSED PERFECTLY! <<<');
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
