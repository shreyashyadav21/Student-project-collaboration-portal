const API_BASE = '/api';

export function getStoredToken() {
  return localStorage.getItem('portal_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('portal_token', token);
  } else {
    localStorage.removeItem('portal_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData vs JSON
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (data && data.error) ? data.error : `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),

  // Profile
  getProfile: () => request('/profile'),
  updateProfile: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getAllStudents: () => request('/profile/students'),

  // Projects
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  getProjects: () => request('/projects'),
  getProjectById: (id) => request(`/projects/${id}`),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getProjectProgress: (id) => request(`/projects/${id}/progress`),

  // Teams & Invitations
  inviteStudent: (projectId, studentId) =>
    request(`/teams/${projectId}/invite`, { method: 'POST', body: JSON.stringify({ studentId }) }),
  getProjectTeam: (projectId) => request(`/teams/${projectId}/members`),
  getMyInvitations: () => request('/teams/invitations'),
  respondToInvitation: (invitationId, action) =>
    request(`/teams/invitations/${invitationId}`, { method: 'PUT', body: JSON.stringify({ action }) }),

  // Tasks
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  getProjectTasks: (projectId) => request(`/tasks/project/${projectId}`),
  getMyAssignedTasks: () => request('/tasks/assigned'),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateTaskStatus: (id, status) =>
    request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Comments
  addTaskComment: (taskId, comment_text) =>
    request(`/comments/task/${taskId}`, { method: 'POST', body: JSON.stringify({ comment_text }) }),
  getTaskComments: (taskId) => request(`/comments/task/${taskId}`),

  // Milestones
  createMilestone: (data) => request('/milestones', { method: 'POST', body: JSON.stringify(data) }),
  getProjectMilestones: (projectId) => request(`/milestones/project/${projectId}`),
  updateMilestone: (id, data) => request(`/milestones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMilestone: (id) => request(`/milestones/${id}`, { method: 'DELETE' }),

  // Resources (Documents & Links)
  uploadDocument: (formData) => request('/resources/documents/upload', { method: 'POST', body: formData }),
  getProjectDocuments: (projectId) => request(`/resources/documents/project/${projectId}`),
  addProjectLink: (data) => request('/resources/links', { method: 'POST', body: JSON.stringify(data) }),
  getProjectLinks: (projectId) => request(`/resources/links/project/${projectId}`),
  deleteProjectLink: (id) => request(`/resources/links/${id}`, { method: 'DELETE' }),

  // Faculty Reviews & Monitoring
  getFacultyProjects: () => request('/faculty/projects'),
  getFacultyInspection: (projectId) => request(`/faculty/projects/${projectId}`),
  submitFacultyReview: (projectId, feedback) =>
    request(`/faculty/projects/${projectId}/reviews`, { method: 'POST', body: JSON.stringify({ feedback }) }),
  getFacultyReviews: (projectId) => request(`/faculty/projects/${projectId}/reviews`),
};
