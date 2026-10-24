import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCommentsModal from '../components/TaskCommentsModal';
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Link as LinkIcon,
  FileText,
  Upload,
  MessageSquare,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Edit2,
  Layers,
  Award,
  ChevronRight,
  UserPlus
} from 'lucide-react';

export default function ProjectDetails({ projectId, onBack }) {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('kanban'); // 'overview' | 'kanban' | 'tasks' | 'team' | 'milestones' | 'resources' | 'reviews'
  const [loading, setLoading] = useState(true);

  // Tab Data
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [links, setLinks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  // Modals & Forms
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState(null);

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskStatus, setTaskStatus] = useState('To Do');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Milestone Form State
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [milestoneTargetDate, setMilestoneTargetDate] = useState('');
  const [milestoneStatus, setMilestoneStatus] = useState('Pending');

  // Resource Form States
  const [selectedFile, setSelectedFile] = useState(null);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Team Invite State
  const [selectedStudentToInvite, setSelectedStudentToInvite] = useState('');
  const [inviteFeedback, setInviteFeedback] = useState('');

  useEffect(() => {
    loadProjectAll();
  }, [projectId]);

  async function loadProjectAll() {
    try {
      setLoading(true);
      const [pRes, tRes, teamRes, mRes, docRes, linkRes, revRes, stuRes] = await Promise.all([
        api.getProjectById(projectId),
        api.getProjectTasks(projectId),
        api.getProjectTeam(projectId),
        api.getProjectMilestones(projectId),
        api.getProjectDocuments(projectId),
        api.getProjectLinks(projectId),
        api.getFacultyReviews(projectId),
        api.getAllStudents()
      ]);

      setProject(pRes.project);
      setTasks(tRes.tasks || []);
      setMembers(teamRes.members || []);
      setInvitations(teamRes.invitations || []);
      setMilestones(mRes.milestones || []);
      setDocuments(docRes.documents || []);
      setLinks(linkRes.links || []);
      setReviews(revRes.reviews || []);
      setAllStudents(stuRes.students || []);
    } catch (err) {
      console.error('Error loading project details:', err);
    } finally {
      setLoading(false);
    }
  }

  // Reload progress & tasks after state changes
  async function reloadTasksAndProgress() {
    try {
      const [tRes, pRes] = await Promise.all([
        api.getProjectTasks(projectId),
        api.getProjectById(projectId)
      ]);
      setTasks(tRes.tasks || []);
      setProject(pRes.project);
    } catch (err) {
      console.error(err);
    }
  }

  // --- Task Actions ---
  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      const payload = {
        project_id: projectId,
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        assigned_to: taskAssignee || null,
        priority: taskPriority,
        status: taskStatus,
        deadline: taskDeadline || null
      };

      if (editingTaskId) {
        await api.updateTask(editingTaskId, payload);
      } else {
        await api.createTask(payload);
      }

      setIsTaskModalOpen(false);
      resetTaskForm();
      reloadTasksAndProgress();
    } catch (err) {
      alert('Error saving task: ' + err.message);
    }
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskAssignee('');
    setTaskPriority('Medium');
    setTaskStatus('To Do');
    setTaskDeadline('');
    setEditingTaskId(null);
  };

  const openEditTask = (task) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskAssignee(task.assigned_to || '');
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskDeadline(task.deadline ? task.deadline.split('T')[0] : '');
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTask(taskId);
      reloadTasksAndProgress();
    } catch (err) {
      alert('Failed to delete task: ' + err.message);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      reloadTasksAndProgress();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // --- Team Invite Action ---
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedStudentToInvite) return;

    try {
      setInviteFeedback('');
      await api.inviteStudent(projectId, selectedStudentToInvite);
      setInviteFeedback('Invitation sent successfully!');
      setSelectedStudentToInvite('');
      const teamRes = await api.getProjectTeam(projectId);
      setInvitations(teamRes.invitations || []);
      setTimeout(() => setInviteFeedback(''), 4000);
    } catch (err) {
      setInviteFeedback('Error: ' + err.message);
    }
  };

  // --- Milestone Actions ---
  const handleSaveMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;

    try {
      await api.createMilestone({
        project_id: projectId,
        title: milestoneTitle.trim(),
        description: milestoneDescription.trim(),
        target_date: milestoneTargetDate || null,
        status: milestoneStatus
      });

      setIsMilestoneModalOpen(false);
      setMilestoneTitle('');
      setMilestoneDescription('');
      setMilestoneTargetDate('');
      setMilestoneStatus('Pending');
      const mRes = await api.getProjectMilestones(projectId);
      setMilestones(mRes.milestones || []);
    } catch (err) {
      alert('Error creating milestone: ' + err.message);
    }
  };

  const handleToggleMilestoneStatus = async (milestone, nextStatus) => {
    try {
      await api.updateMilestone(milestone.id, { status: nextStatus });
      const mRes = await api.getProjectMilestones(projectId);
      setMilestones(mRes.milestones || []);
    } catch (err) {
      alert('Error updating milestone: ' + err.message);
    }
  };

  // --- Resource Actions ---
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('project_id', projectId);
      formData.append('file', selectedFile);

      await api.uploadDocument(formData);
      setSelectedFile(null);
      // Reset file input element
      const fileInput = document.getElementById('project-file-input');
      if (fileInput) fileInput.value = '';

      const docRes = await api.getProjectDocuments(projectId);
      setDocuments(docRes.documents || []);
      alert('Document uploaded successfully!');
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    try {
      await api.addProjectLink({
        project_id: projectId,
        title: linkTitle.trim(),
        url: linkUrl.trim()
      });

      setLinkTitle('');
      setLinkUrl('');
      const linkRes = await api.getProjectLinks(projectId);
      setLinks(linkRes.links || []);
    } catch (err) {
      alert('Failed to add link: ' + err.message);
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (!confirm('Are you sure you want to remove this link?')) return;
    try {
      await api.deleteProjectLink(linkId);
      const linkRes = await api.getProjectLinks(projectId);
      setLinks(linkRes.links || []);
    } catch (err) {
      alert('Failed to delete link: ' + err.message);
    }
  };

  if (loading || !project) {
    return <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>Loading project workspace...</div>;
  }

  // Filter candidates who are NOT already members and NOT already pending invite
  const candidateStudents = allStudents.filter(s =>
    !members.some(m => m.student_id === s.id) &&
    !invitations.some(inv => inv.invited_student_id === s.id && inv.invitation_status === 'pending')
  );

  return (
    <div className="container">
      {/* Top Navigation & Project Title Banner */}
      <div style={{ marginBottom: '20px' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onBack}
          style={{ marginBottom: '12px' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div style={{
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="badge badge-primary">{project.status}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> Deadline: <strong>{new Date(project.deadline).toLocaleDateString()}</strong>
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Lead: <strong>{project.creator_name}</strong>
                </span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{project.title}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px', maxWidth: '850px' }}>
                {project.description}
              </p>
            </div>

            {/* Quick Progress Indicator */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              minWidth: '220px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Project Completion
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', margin: '4px 0' }}>
                {project.stats?.completion_percentage || 0}%
              </div>
              <div className="progress-bar-container" style={{ margin: '6px 0 8px 0' }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${project.stats?.completion_percentage || 0}%` }}
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {project.stats?.completed_tasks || 0} of {project.stats?.total_tasks || 0} tasks completed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'kanban' ? 'active' : ''}`}
          onClick={() => setActiveTab('kanban')}
        >
          <Layers size={18} /> Kanban Board
        </button>
        <button
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckCircle2 size={18} /> Tasks ({tasks.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          <Users size={18} /> Team ({members.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'milestones' ? 'active' : ''}`}
          onClick={() => setActiveTab('milestones')}
        >
          <Award size={18} /> Milestones ({milestones.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          <FileText size={18} /> Documents & Links ({documents.length + links.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <MessageSquare size={18} /> Faculty Reviews ({reviews.length})
        </button>
      </div>

      {/* =========================================================================
          TAB 1: KANBAN BOARD
      ========================================================================= */}
      {activeTab === 'kanban' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Project Kanban Board</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Move cards across stages to track execution and automatically update completion progress.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => { resetTaskForm(); setIsTaskModalOpen(true); }}>
              <Plus size={16} /> Add Task
            </button>
          </div>

          <div className="kanban-grid">
            {/* Column 1: To Do */}
            <div className="kanban-column">
              <div className="kanban-header">
                <span className="kanban-title">📋 To Do</span>
                <span className="kanban-count">{tasks.filter(t => t.status === 'To Do').length}</span>
              </div>
              <div className="kanban-cards">
                {tasks.filter(t => t.status === 'To Do').map(task => renderKanbanCard(task))}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="kanban-column" style={{ background: '#f0f9ff' }}>
              <div className="kanban-header" style={{ borderBottomColor: '#bae6fd' }}>
                <span className="kanban-title" style={{ color: '#0369a1' }}>⚡ In Progress</span>
                <span className="kanban-count" style={{ color: '#0369a1' }}>
                  {tasks.filter(t => t.status === 'In Progress').length}
                </span>
              </div>
              <div className="kanban-cards">
                {tasks.filter(t => t.status === 'In Progress').map(task => renderKanbanCard(task))}
              </div>
            </div>

            {/* Column 3: Completed */}
            <div className="kanban-column" style={{ background: '#f0fdf4' }}>
              <div className="kanban-header" style={{ borderBottomColor: '#bbf7d0' }}>
                <span className="kanban-title" style={{ color: '#15803d' }}>✅ Completed</span>
                <span className="kanban-count" style={{ color: '#15803d' }}>
                  {tasks.filter(t => t.status === 'Completed').length}
                </span>
              </div>
              <div className="kanban-cards">
                {tasks.filter(t => t.status === 'Completed').map(task => renderKanbanCard(task))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TASKS LIST VIEW
      ========================================================================= */}
      {activeTab === 'tasks' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Task Management Table</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Detailed list of all activities, priority levels, assigned team members, and target deadlines.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => { resetTaskForm(); setIsTaskModalOpen(true); }}>
              <Plus size={16} /> Create New Task
            </button>
          </div>

          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No tasks created yet. Click "Create New Task" to begin allocating activities.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px' }}>Task Title</th>
                    <th style={{ padding: '10px 12px' }}>Assigned Student</th>
                    <th style={{ padding: '10px 12px' }}>Priority</th>
                    <th style={{ padding: '10px 12px' }}>Deadline</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.title}</div>
                        {t.description && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '320px' }}>
                            {t.description}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {t.assignee_name ? (
                          <div>
                            <div style={{ fontWeight: 600 }}>{t.assignee_name}</div>
                            {t.assignee_identifier && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                {t.assignee_identifier}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${
                          t.priority === 'High' ? 'badge-danger' :
                          t.priority === 'Medium' ? 'badge-warning' : 'badge-slate'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {t.deadline ? (
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: new Date(t.deadline) < new Date() && t.status !== 'Completed' ? 'var(--danger)' : 'inherit',
                            fontWeight: new Date(t.deadline) < new Date() && t.status !== 'Completed' ? 700 : 500
                          }}>
                            <Clock size={14} /> {new Date(t.deadline).toLocaleDateString()}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <select
                          className="form-select"
                          style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                          value={t.status}
                          onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value)}
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Task Comments"
                            onClick={() => setSelectedTaskForComments(t)}
                          >
                            <MessageSquare size={14} />
                            {t.comment_count > 0 && <span>{t.comment_count}</span>}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Edit Task"
                            onClick={() => openEditTask(t)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Delete Task"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => handleDeleteTask(t.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: TEAM FORMATION & INVITATIONS
      ========================================================================= */}
      {activeTab === 'team' && (
        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          {/* Confirmed Team Members */}
          <div className="card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
              Confirmed Team Members ({members.length})
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Active student members collaborating on this project.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {members.map(member => (
                <div key={member.id} style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  background: member.membership_role === 'Team Leader' ? '#f0f9ff' : '#ffffff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{member.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{member.email}</div>
                    </div>
                    <span className={`badge ${
                      member.membership_role === 'Team Leader' ? 'badge-primary' : 'badge-slate'
                    }`}>
                      {member.membership_role}
                    </span>
                  </div>

                  {member.student_identifier && (
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#64748b', marginBottom: '8px' }}>
                      ID: {member.student_identifier}
                    </div>
                  )}

                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Technical Skills:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                      {member.technical_skills ? (
                        member.technical_skills.split(',').map((sk, i) => (
                          <span key={i} className="badge badge-slate" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                            {sk.trim()}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No skills listed</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Interests:
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: '2px' }}>
                      {member.interests || 'None listed'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite Student & Pending Invitations */}
          <div>
            {/* Invite Form */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={20} color="var(--primary)" /> Invite Student to Team
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Select a student from the directory to send an invitation to join this project.
              </p>

              {inviteFeedback && (
                <div style={{
                  background: inviteFeedback.includes('Error') ? 'var(--danger-light)' : 'var(--success-light)',
                  color: inviteFeedback.includes('Error') ? 'var(--danger)' : 'var(--success)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '14px'
                }}>
                  {inviteFeedback}
                </div>
              )}

              <form onSubmit={handleSendInvite}>
                <div className="form-group">
                  <label className="form-label">Select Student</label>
                  <select
                    className="form-select"
                    value={selectedStudentToInvite}
                    onChange={(e) => setSelectedStudentToInvite(e.target.value)}
                    required
                  >
                    <option value="">-- Choose a student to invite --</option>
                    {candidateStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.student_identifier || s.email}) - {s.technical_skills ? s.technical_skills.slice(0, 30) + '...' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" disabled={!selectedStudentToInvite}>
                  <UserPlus size={16} /> Send Project Invitation
                </button>
              </form>
            </div>

            {/* Pending Invitations Sent */}
            <div className="card">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
                Invitations Status ({invitations.length})
              </h2>

              {invitations.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No pending or previous invitations sent for this project.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {invitations.map(inv => (
                    <div key={inv.id} style={{
                      padding: '10px 12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{inv.invited_student_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Sent by {inv.invited_by_name} • {new Date(inv.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`badge ${
                        inv.invitation_status === 'accepted' ? 'badge-success' :
                        inv.invitation_status === 'pending' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {inv.invitation_status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: MILESTONES
      ========================================================================= */}
      {activeTab === 'milestones' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Project Milestones</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Track key project phases, deliverable targets, and review completion.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setIsMilestoneModalOpen(true)}>
              <Plus size={16} /> Add Milestone
            </button>
          </div>

          {milestones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No milestones defined yet. Click "Add Milestone" to establish target phases.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {milestones.map((m, idx) => (
                <div key={m.id} style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  background: m.status === 'Completed' ? '#f0fdf4' : '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: m.status === 'Completed' ? '#10b981' : '#e2e8f0',
                        color: m.status === 'Completed' ? 'white' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {idx + 1}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{m.title}</h3>
                      <span className={`badge ${
                        m.status === 'Completed' ? 'badge-success' :
                        m.status === 'In Progress' ? 'badge-primary' : 'badge-slate'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginLeft: '32px' }}>
                      {m.description || 'No milestone description.'}
                    </p>

                    {m.target_date && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '32px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> Target Date: <strong>{new Date(m.target_date).toLocaleDateString()}</strong>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {m.status !== 'Completed' ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleToggleMilestoneStatus(m, 'Completed')}
                      >
                        <CheckCircle2 size={14} /> Mark as Completed
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleToggleMilestoneStatus(m, 'In Progress')}
                      >
                        Reopen Milestone
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: DOCUMENTS & USEFUL LINKS
      ========================================================================= */}
      {activeTab === 'resources' && (
        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          {/* Documents Section */}
          <div className="card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="var(--primary)" /> Project Documents
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Upload technical documents, design specifications, and dataset references.
            </p>

            {/* Upload form */}
            <form onSubmit={handleFileUpload} style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <input
                  id="project-file-input"
                  type="file"
                  className="form-input"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={!selectedFile}>
                <Upload size={14} /> Upload Selected Document
              </button>
            </form>

            {/* Document list */}
            {documents.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No documents uploaded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {documents.map(doc => (
                  <div key={doc.id} style={{
                    padding: '10px 14px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{doc.file_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Uploaded by {doc.uploaded_by_name} • {new Date(doc.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>
                    <a
                      href={`/api/resources/documents/download/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links Section */}
          <div className="card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LinkIcon size={20} color="var(--primary)" /> Project URLs & Repositories
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Share GitHub repositories, Figma wireframes, live demos, and documentation links.
            </p>

            {/* Add link form */}
            <form onSubmit={handleAddLink} style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Link Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. GitHub Repository, Figma Design..."
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL (e.g. https://...)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://github.com/..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-sm">
                <Plus size={14} /> Add Project URL
              </button>
            </form>

            {/* Links list */}
            {links.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No URLs shared yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {links.map(link => (
                  <div key={link.id} style={{
                    padding: '10px 14px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{link.title}</div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {link.url} <ExternalLink size={12} />
                      </a>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: FACULTY REVIEWS
      ========================================================================= */}
      {activeTab === 'reviews' && (
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
            Faculty Reviews & Academic Feedback ({reviews.length})
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Official evaluations and guidance provided by faculty advisors.
          </p>

          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No faculty reviews submitted yet for this project.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reviews.map(rev => (
                <div key={rev.id} style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{rev.faculty_name}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {new Date(rev.review_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-wrap' }}>
                    {rev.feedback}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE / EDIT TASK
      ========================================================================= */}
      {isTaskModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingTaskId ? 'Edit Task' : 'Create Project Task'}</h3>
              <button className="modal-close" onClick={() => setIsTaskModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveTask}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Implement LiDAR Sensor Interface"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Task Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Detail activities, requirements, and deliverables..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assign To Project Member</label>
                <select
                  className="form-select"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                >
                  <option value="">-- Unassigned --</option>
                  {members.map(m => (
                    <option key={m.student_id} value={m.student_id}>
                      {m.name} ({m.membership_role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input
                    type="date"
                    className="form-input"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsTaskModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTaskId ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD MILESTONE
      ========================================================================= */}
      {isMilestoneModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Project Milestone</h3>
              <button className="modal-close" onClick={() => setIsMilestoneModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveMilestone}>
              <div className="form-group">
                <label className="form-label">Milestone Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Phase 2: Core Algorithm Prototype"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Milestone Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Target outcome and demonstration scope..."
                  value={milestoneDescription}
                  onChange={(e) => setMilestoneDescription(e.target.value)}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Target Completion Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={milestoneTargetDate}
                    onChange={(e) => setMilestoneTargetDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={milestoneStatus}
                    onChange={(e) => setMilestoneStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsMilestoneModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Comments Modal */}
      <TaskCommentsModal
        isOpen={Boolean(selectedTaskForComments)}
        onClose={() => setSelectedTaskForComments(null)}
        task={selectedTaskForComments}
      />
    </div>
  );

  // Helper to render individual Kanban Card
  function renderKanbanCard(task) {
    return (
      <div key={task.id} className="kanban-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <span className={`badge ${
            task.priority === 'High' ? 'badge-danger' :
            task.priority === 'Medium' ? 'badge-warning' : 'badge-slate'
          }`} style={{ fontSize: '0.62rem' }}>
            {task.priority}
          </span>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setSelectedTaskForComments(task)}
              title="Task Comments"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <MessageSquare size={14} />
            </button>
            <button
              onClick={() => openEditTask(task)}
              title="Edit Task"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <Edit2 size={13} />
            </button>
          </div>
        </div>

        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px', color: '#0f172a' }}>
          {task.title}
        </div>

        {task.description && (
          <div style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {task.description}
          </div>
        )}

        {/* Assigned Student */}
        <div style={{ fontSize: '0.75rem', color: '#334155', marginBottom: '8px' }}>
          Assignee: <strong>{task.assignee_name || 'Unassigned'}</strong>
        </div>

        {/* Footer: Deadline & Stage changer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '8px'
        }}>
          {task.deadline ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={11} /> {new Date(task.deadline).toLocaleDateString()}
            </span>
          ) : <span />}

          {/* Quick status cycle button */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {task.status !== 'To Do' && (
              <button
                className="btn btn-secondary btn-sm"
                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                onClick={() => handleUpdateTaskStatus(task.id, task.status === 'Completed' ? 'In Progress' : 'To Do')}
                title="Move Left"
              >
                ◀
              </button>
            )}
            {task.status !== 'Completed' && (
              <button
                className="btn btn-primary btn-sm"
                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                onClick={() => handleUpdateTaskStatus(task.id, task.status === 'To Do' ? 'In Progress' : 'Completed')}
                title="Advance Stage"
              >
                ▶
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
