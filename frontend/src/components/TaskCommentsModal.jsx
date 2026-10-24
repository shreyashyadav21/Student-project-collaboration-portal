import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, X, Clock, User } from 'lucide-react';

export default function TaskCommentsModal({ isOpen, onClose, task }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      loadComments();
    }
  }, [isOpen, task]);

  async function loadComments() {
    try {
      setLoading(true);
      const res = await api.getTaskComments(task.id);
      setComments(res.comments || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.addTaskComment(task.id, newComment.trim());
      setComments([...comments, res.comment]);
      setNewComment('');
    } catch (err) {
      alert('Error posting comment: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
              Task Comments & Discussion
            </div>
            <h3 style={{ fontSize: '1.15rem', marginTop: '2px' }}>{task.title}</h3>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Task Summary Banner */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px',
          marginBottom: '16px',
          fontSize: '0.82rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            Assigned to: <strong>{task.assignee_name || 'Unassigned'}</strong>
          </div>
          <span className={`badge ${
            task.priority === 'High' ? 'badge-danger' :
            task.priority === 'Medium' ? 'badge-warning' : 'badge-slate'
          }`}>
            {task.priority} Priority
          </span>
          <span className={`badge ${
            task.status === 'Completed' ? 'badge-success' : 'badge-primary'
          }`}>
            {task.status}
          </span>
        </div>

        {/* Comments Thread */}
        <div style={{
          maxHeight: '340px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          paddingRight: '6px',
          marginBottom: '18px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Loading discussion...</div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px', fontStyle: 'italic' }}>
              No comments posted yet. Start the coordination thread below!
            </div>
          ) : (
            comments.map(c => {
              const isMe = c.user_id === user.id;
              return (
                <div
                  key={c.id}
                  style={{
                    background: isMe ? '#eff6ff' : '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '90%',
                    width: '100%'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.user_name}</span>
                      <span className={`badge ${c.user_role === 'faculty' ? 'badge-warning' : 'badge-slate'}`} style={{ fontSize: '0.62rem' }}>
                        {c.user_role}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} /> {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                    {c.comment_text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* New Comment Input */}
        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Type your comment or update for this task..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <button type="submit" className="btn btn-primary" disabled={submitting || !newComment.trim()}>
            <Send size={16} /> Post
          </button>
        </form>
      </div>
    </div>
  );
}
