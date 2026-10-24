import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FolderPlus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  ListTodo,
  Layers
} from 'lucide-react';

export default function StudentDashboard({ onSelectProject, onOpenCreateModal }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const [projRes, tasksRes, invitesRes] = await Promise.all([
        api.getProjects(),
        api.getMyAssignedTasks(),
        api.getMyInvitations()
      ]);

      setProjects(projRes.projects || []);
      setAssignedTasks(tasksRes.tasks || []);
      setInvitations(invitesRes.invitations || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleInvitationResponse = async (invitationId, action) => {
    try {
      await api.respondToInvitation(invitationId, action);
      setActionMsg(`Invitation ${action} successfully!`);
      setTimeout(() => setActionMsg(''), 4000);
      loadDashboardData();
    } catch (err) {
      alert('Error updating invitation: ' + err.message);
    }
  };

  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      loadDashboardData();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Aggregated progress calculations
  const totalTasks = assignedTasks.length;
  const todoTasks = assignedTasks.filter(t => t.status === 'To Do').length;
  const inProgressTasks = assignedTasks.filter(t => t.status === 'In Progress').length;
  const completedTasks = assignedTasks.filter(t => t.status === 'Completed').length;
  const myCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>Loading dashboard...</div>;
  }

  const createdProjects = projects.filter(p => p.creator_id === user.id);
  const joinedProjects = projects.filter(p => p.creator_id !== user.id);

  return (
    <div className="container">
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Student Workspace
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track academic projects, collaborate with team members, and manage your assigned deliverables.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={onOpenCreateModal}
          style={{ padding: '10px 18px', boxShadow: 'var(--shadow-md)' }}
        >
          <FolderPlus size={18} /> + Create New Project
        </button>
      </div>

      {actionMsg && (
        <div style={{
          background: 'var(--success-light)',
          color: 'var(--success)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Progress Overview Stats Cards */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: '12px' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              My Projects
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              {projects.length}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#fef3c7', color: '#b45309', padding: '12px', borderRadius: '12px' }}>
            <ListTodo size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Assigned Tasks
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              {totalTasks} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>({inProgressTasks} active)</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '12px', borderRadius: '12px' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Tasks Completed
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              {completedTasks} / {totalTasks}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#ede9fe', color: '#6d28d9', padding: '12px', borderRadius: '12px' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Task Completion
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              {myCompletionRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Team Invitations Alert Section (if any pending) */}
      {invitations.filter(inv => inv.invitation_status === 'pending').length > 0 && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
          marginBottom: '28px'
        }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Users size={20} /> Pending Team Invitations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {invitations
              .filter(inv => inv.invitation_status === 'pending')
              .map(inv => (
                <div key={inv.id} style={{
                  background: 'white',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #fef3c7',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{inv.project_title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Invited by: <strong>{inv.invited_by_name}</strong> ({inv.invited_by_email})
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleInvitationResponse(inv.id, 'accepted')}
                    >
                      <Check size={14} /> Accept Invitation
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleInvitationResponse(inv.id, 'declined')}
                      style={{ color: 'var(--danger)' }}
                    >
                      <X size={14} /> Decline
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Main Grid: Accessible Projects List & Assigned Tasks */}
      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Left Column: Accessible Projects */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="var(--primary)" /> Accessible Projects
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{projects.length} Total</span>
          </div>

          {projects.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                You are not currently part of any academic projects.
              </p>
              <button className="btn btn-primary btn-sm" onClick={onOpenCreateModal}>
                <FolderPlus size={16} /> Create your first project
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {projects.map(project => (
                <div
                  key={project.id}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
                    borderLeft: `4px solid ${project.creator_id === user.id ? 'var(--primary)' : '#10b981'}`
                  }}
                  onClick={() => onSelectProject(project.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span className="badge badge-slate" style={{ fontSize: '0.65rem', marginBottom: '4px' }}>
                        {project.creator_id === user.id ? 'Team Leader' : 'Member'}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                        {project.title}
                      </h3>
                    </div>
                    <span className={`badge ${
                      project.status === 'Completed' ? 'badge-success' : 'badge-primary'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    marginBottom: '14px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Progress:</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {project.completion_percentage}% ({project.completed_tasks || 0}/{project.total_tasks || 0} tasks)
                      </span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${project.completion_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer metadata */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> Deadline: <strong>{new Date(project.deadline).toLocaleDateString()}</strong>
                    </div>
                    <span style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Open Workspace <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Tasks Assigned to Me */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListTodo size={20} color="var(--primary)" /> Tasks Assigned to Me
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{assignedTasks.length} Active</span>
          </div>

          {assignedTasks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              No tasks currently assigned to you.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {assignedTasks.map(task => (
                <div key={task.id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      {task.project_title}
                    </div>
                    <span className={`badge ${
                      task.priority === 'High' ? 'badge-danger' :
                      task.priority === 'Medium' ? 'badge-warning' : 'badge-slate'
                    }`} style={{ fontSize: '0.65rem' }}>
                      {task.priority} Priority
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>
                    {task.title}
                  </div>

                  {task.description && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      {task.description}
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '10px'
                  }}>
                    {task.deadline ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> Due: {new Date(task.deadline).toLocaleDateString()}
                      </div>
                    ) : <span />}

                    {/* Quick status toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Status:</span>
                      <select
                        className="form-select"
                        style={{ padding: '3px 8px', fontSize: '0.78rem', width: 'auto' }}
                        value={task.status}
                        onChange={(e) => handleQuickStatusChange(task.id, e.target.value)}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
