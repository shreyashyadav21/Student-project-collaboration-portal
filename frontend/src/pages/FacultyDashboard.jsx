import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Search,
  ExternalLink,
  Send,
  Eye,
  FileText,
  Award,
  Layers
} from 'lucide-react';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAlertsOnly, setFilterAlertsOnly] = useState(false);

  // Project Inspection Modal
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [inspectionData, setInspectionData] = useState(null);
  const [inspectionLoading, setInspectionLoading] = useState(false);

  // Review submission
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  useEffect(() => {
    loadFacultyProjects();
  }, []);

  async function loadFacultyProjects() {
    try {
      setLoading(true);
      const res = await api.getFacultyProjects();
      setProjects(res.projects || []);
    } catch (err) {
      console.error('Failed to load faculty projects:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenInspection = async (projectId) => {
    try {
      setSelectedProjectId(projectId);
      setInspectionLoading(true);
      setReviewSuccessMsg('');
      setReviewFeedback('');
      const res = await api.getFacultyInspection(projectId);
      setInspectionData(res.project);
    } catch (err) {
      alert('Error inspecting project: ' + err.message);
    } finally {
      setInspectionLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewFeedback.trim() || !selectedProjectId) return;

    try {
      setSubmittingReview(true);
      const res = await api.submitFacultyReview(selectedProjectId, reviewFeedback.trim());
      setReviewSuccessMsg('Review feedback submitted and recorded successfully!');
      setReviewFeedback('');
      // Refresh inspection review history
      const updatedInspection = await api.getFacultyInspection(selectedProjectId);
      setInspectionData(updatedInspection.project);
      loadFacultyProjects();
    } catch (err) {
      alert('Failed to submit review: ' + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.creator_name && p.creator_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const isApproaching = parseInt(p.approaching_deadline_tasks, 10) > 0;
    if (filterAlertsOnly) {
      return matchesSearch && isApproaching;
    }
    return matchesSearch;
  });

  const totalMonitored = projects.length;
  const totalTasksUnderway = projects.reduce((acc, p) => acc + parseInt(p.total_tasks || 0, 10), 0);
  const urgentDeadlineProjects = projects.filter(p => parseInt(p.approaching_deadline_tasks, 10) > 0).length;

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>Loading faculty monitoring portal...</div>;
  }

  return (
    <div className="container">
      {/* Faculty Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        borderRadius: 'var(--radius-lg)',
        padding: '30px',
        color: 'white',
        marginBottom: '28px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="badge badge-warning" style={{ background: '#f59e0b', color: '#0f172a' }}>
            Faculty Portal
          </span>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Academic Project Oversight & Review</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome, {user.name}</h1>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '4px', maxWidth: '800px' }}>
          Centralized academic oversight dashboard to monitor student teams, track deliverable progress, audit task distribution, and provide constructive project reviews.
        </p>
      </div>

      {/* Faculty Metric Cards */}
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '14px', borderRadius: '12px' }}>
            <Layers size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Monitored Projects
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
              {totalMonitored} Active
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#ede9fe', color: '#6d28d9', padding: '14px', borderRadius: '12px' }}>
            <BookOpen size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Student Tasks
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
              {totalTasksUnderway} Deliverables
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: urgentDeadlineProjects > 0 ? 'var(--danger-light)' : 'var(--success-light)', color: urgentDeadlineProjects > 0 ? 'var(--danger)' : 'var(--success)', padding: '14px', borderRadius: '12px' }}>
            <AlertTriangle size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Approaching Deadlines
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
              {urgentDeadlineProjects} Projects
            </div>
          </div>
        </div>
      </div>

      {/* Monitoring Table Header & Filters */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="var(--primary)" /> Academic Project Oversight Roster
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Inspect team members, milestone velocity, and provide formal feedback.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '34px' }}
                placeholder="Search title or leader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              className={`btn btn-sm ${filterAlertsOnly ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterAlertsOnly(!filterAlertsOnly)}
            >
              <AlertTriangle size={14} /> Approaching Deadlines Only
            </button>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No projects match the selected monitoring filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px' }}>Project Title & Description</th>
                  <th style={{ padding: '12px 14px' }}>Team Lead & Members</th>
                  <th style={{ padding: '12px 14px' }}>Deadline</th>
                  <th style={{ padding: '12px 14px' }}>Progress</th>
                  <th style={{ padding: '12px 14px' }}>Approaching Alerts</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Faculty Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(p => {
                  const hasUrgent = parseInt(p.approaching_deadline_tasks, 10) > 0;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px', maxWidth: '320px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                          {p.title}
                        </div>
                        <div style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          marginTop: '2px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {p.description}
                        </div>
                        <span className="badge badge-slate" style={{ fontSize: '0.62rem', marginTop: '6px' }}>
                          Status: {p.status}
                        </span>
                      </td>

                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 600 }}>{p.creator_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Users size={12} /> {p.member_count} team members
                        </div>
                      </td>

                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                          <Calendar size={13} color="var(--text-muted)" />
                          <strong>{new Date(p.deadline).toLocaleDateString()}</strong>
                        </div>
                      </td>

                      <td style={{ padding: '14px', minWidth: '150px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.completion_percentage}%</span>
                          <span style={{ color: 'var(--text-muted)' }}>{p.completed_tasks || 0}/{p.total_tasks || 0}</span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${p.completion_percentage}%` }} />
                        </div>
                      </td>

                      <td style={{ padding: '14px' }}>
                        {hasUrgent ? (
                          <span className="badge badge-danger" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={12} /> {p.approaching_deadline_tasks} Incomplete Tasks &lt; 7d
                          </span>
                        ) : (
                          <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                            On Schedule
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenInspection(p.id)}
                        >
                          <Eye size={14} /> Review & Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          FACULTY PROJECT INSPECTION & REVIEW MODAL
      ========================================================================= */}
      {selectedProjectId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <div>
                <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Faculty Project Inspection</span>
                <h3 style={{ fontSize: '1.3rem', marginTop: '2px' }}>
                  {inspectionData?.title || 'Loading project details...'}
                </h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedProjectId(null)}>×</button>
            </div>

            {inspectionLoading || !inspectionData ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Retrieving full project audit data...
              </div>
            ) : (
              <div>
                {/* Metrics header */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Leader / Creator
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{inspectionData.creator_name} ({inspectionData.creator_email})</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Completion Rate
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                      {inspectionData.stats?.completion_percentage}% ({inspectionData.stats?.completed_tasks} / {inspectionData.stats?.total_tasks} Tasks)
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Deadline
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{new Date(inspectionData.deadline).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Team Members List */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} color="var(--primary)" /> Team Roster ({inspectionData.members?.length || 0})
                  </h4>
                  <div className="grid-2">
                    {inspectionData.members?.map(m => (
                      <div key={m.id} style={{
                        padding: '10px 12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'white'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{m.name}</span>
                          <span className="badge badge-slate" style={{ fontSize: '0.6rem' }}>{m.membership_role}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Skills: {m.technical_skills || 'None listed'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks & Milestones Snapshot */}
                <div className="grid-2" style={{ marginBottom: '20px' }}>
                  {/* Tasks */}
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} color="var(--primary)" /> Tasks Allocation ({inspectionData.tasks?.length || 0})
                    </h4>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {inspectionData.tasks?.map(t => (
                        <div key={t.id} style={{
                          padding: '8px 10px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{t.title}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Assignee: {t.assignee_name || 'Unassigned'}</div>
                          </div>
                          <span className={`badge ${
                            t.status === 'Completed' ? 'badge-success' : 'badge-slate'
                          }`} style={{ fontSize: '0.62rem' }}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Milestones */}
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Award size={16} color="var(--primary)" /> Project Milestones ({inspectionData.milestones?.length || 0})
                    </h4>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {inspectionData.milestones?.map(m => (
                        <div key={m.id} style={{
                          padding: '8px 10px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{m.title}</div>
                            {m.target_date && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Due: {new Date(m.target_date).toLocaleDateString()}</div>
                            )}
                          </div>
                          <span className={`badge ${
                            m.status === 'Completed' ? 'badge-success' : 'badge-slate'
                          }`} style={{ fontSize: '0.62rem' }}>
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents & Links */}
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} color="var(--primary)" /> Project Documents & Shared URLs
                  </h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {inspectionData.documents?.map(doc => (
                      <a
                        key={doc.id}
                        href={`/api/resources/documents/download/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.78rem' }}
                      >
                        📄 {doc.file_name}
                      </a>
                    ))}
                    {inspectionData.links?.map(l => (
                      <a
                        key={l.id}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.78rem' }}
                      >
                        🔗 {l.title}
                      </a>
                    ))}
                    {inspectionData.documents?.length === 0 && inspectionData.links?.length === 0 && (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No resources uploaded yet.</span>
                    )}
                  </div>
                </div>

                {/* Submit Faculty Review Feedback Form */}
                <div style={{
                  background: '#fefce8',
                  border: '1px solid #fef08a',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#854d0e', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={18} /> Submit Faculty Review & Advisory Comments
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#713f12', marginBottom: '12px' }}>
                    Feedback is stored with your faculty profile and review timestamp for the student team to consult.
                  </p>

                  {reviewSuccessMsg && (
                    <div style={{
                      background: 'var(--success-light)',
                      color: 'var(--success)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      marginBottom: '12px'
                    }}>
                      ✓ {reviewSuccessMsg}
                    </div>
                  )}

                  <form onSubmit={handleSubmitReview}>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Enter academic review, architecture critique, timeline recommendations, or grade notes..."
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      required
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReview || !reviewFeedback.trim()}>
                        <Send size={14} /> {submittingReview ? 'Submitting...' : 'Submit Review Feedback'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Existing Review History */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>
                    Review History ({inspectionData.reviews?.length || 0})
                  </h4>
                  {inspectionData.reviews?.length === 0 ? (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No prior faculty evaluations on file.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {inspectionData.reviews?.map(rev => (
                        <div key={rev.id} style={{
                          padding: '10px 14px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'white'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                            <span>{rev.faculty_name}</span>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{new Date(rev.review_date).toLocaleDateString()}</span>
                          </div>
                          <div style={{ fontSize: '0.88rem', color: '#334155' }}>{rev.feedback}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
