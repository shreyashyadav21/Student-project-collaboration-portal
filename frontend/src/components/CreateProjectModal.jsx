import React, { useState } from 'react';
import { api } from '../services/api';
import { FolderPlus, X, AlertCircle } from 'lucide-react';

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Project title is required.');
      return;
    }
    if (!deadline) {
      setError('Project deadline is required.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.createProject({
        title: title.trim(),
        description: description.trim(),
        deadline,
        status,
      });

      onProjectCreated(res.project);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderPlus size={20} color="var(--primary)" /> Create Academic Project
          </h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Autonomous Campus Navigation System"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Project Description</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Outline project objectives, architecture, scope, and target outcomes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Target Deadline *</label>
              <input
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="In Progress">In Progress</option>
                <option value="Planning">Planning</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            marginBottom: '20px'
          }}>
            ℹ️ You will automatically be designated as the <strong>Team Leader</strong> for this project and can invite members, assign tasks, and manage milestones.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
