import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Hash, Code, Sparkles, CheckCircle2, Search, Users, Edit3, Save } from 'lucide-react';

export default function StudentProfile() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Students Directory
  const [studentsList, setStudentsList] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    loadProfileAndDirectory();
  }, []);

  async function loadProfileAndDirectory() {
    try {
      setLoading(true);
      const [profRes, studentsRes] = await Promise.all([
        api.getProfile(),
        api.getAllStudents()
      ]);

      const p = profRes.profile;
      setProfile(p);
      setName(p.name || '');
      setStudentId(p.student_identifier || '');
      setTechnicalSkills(p.technical_skills || '');
      setInterests(p.interests || '');
      setStudentsList(studentsRes.students || []);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await api.updateProfile({
        name,
        student_identifier: studentId,
        technical_skills: technicalSkills,
        interests,
      });
      await refreshUser();
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      loadProfileAndDirectory();
    } catch (err) {
      setMessage('Error updating profile: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = studentsList.filter((s) => {
    const term = searchFilter.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.technical_skills && s.technical_skills.toLowerCase().includes(term)) ||
      (s.interests && s.interests.toLowerCase().includes(term)) ||
      (s.student_identifier && s.student_identifier.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>Loading profile...</div>;
  }

  return (
    <div className="container">
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        color: 'white',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 800,
            border: '3px solid rgba(255,255,255,0.2)'
          }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{name}</h1>
              <span className="badge badge-primary" style={{ background: 'rgba(59, 130, 246, 0.25)', color: '#93c5fd' }}>
                Student
              </span>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.85rem', color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={15} /> {profile?.email}
              </span>
              {studentId && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
                  <Hash size={15} /> {studentId}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel Editing' : <><Edit3 size={16} /> Edit Profile</>}
        </button>
      </div>

      {message && (
        <div style={{
          background: message.includes('Error') ? 'var(--danger-light)' : 'var(--success-light)',
          color: message.includes('Error') ? 'var(--danger)' : 'var(--success)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Main Grid: My Profile Details & Edit Form */}
      <div className="grid-2" style={{ marginBottom: '36px' }}>
        {/* Profile Card / Edit Form */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="var(--primary)" />
            {isEditing ? 'Edit Profile Details' : 'Student Profile Details'}
          </h2>

          {isEditing ? (
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Student Identifier / Roll No</label>
                <input
                  type="text"
                  className="form-input"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. STU-2026-001"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Technical Skills (comma separated)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={technicalSkills}
                  onChange={(e) => setTechnicalSkills(e.target.value)}
                  placeholder="e.g. React, Node.js, PostgreSQL, Python, Git"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Areas of Technical Interest</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g. Full Stack Web Development, Machine Learning, IoT"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Student ID
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  {profile?.student_identifier || 'Not set'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code size={14} /> Technical Skills
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {profile?.technical_skills ? (
                    profile.technical_skills.split(',').map((skill, idx) => (
                      <span key={idx} className="badge badge-primary">
                        {skill.trim()}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No skills listed yet.</span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> Areas of Interest
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {profile?.interests ? (
                    profile.interests.split(',').map((interest, idx) => (
                      <span key={idx} className="badge badge-slate">
                        {interest.trim()}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No interests listed yet.</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Info / Best Practices Box */}
        <div className="card" style={{ background: '#f8fafc' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px', color: '#1e293b' }}>
            💡 Team Formation Tips
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '16px' }}>
            Keeping your technical skills and project interests up to date helps team creators identify your strengths and invite you to relevant academic and technical projects.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 800 }}>1.</div>
              <div><strong>List Core Frameworks:</strong> e.g., React, Express, PostgreSQL, Spring Boot.</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 800 }}>2.</div>
              <div><strong>Specify Disciplines:</strong> Frontend, Backend, Machine Learning, UI/UX, or Systems.</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 800 }}>3.</div>
              <div><strong>Discover Peers:</strong> Use the directory below to explore potential collaborators and their skill sets.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Directory for Peer Discovery */}
      <div className="card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--primary)" /> Student Directory & Peer Discovery
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Browse students to find teammates matching required skills for your academic projects
            </p>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '34px' }}
              placeholder="Search by name, skill, or interest..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No students found matching "{searchFilter}".
          </div>
        ) : (
          <div className="grid-3">
            {filteredStudents.map((s) => (
              <div key={s.id} style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                background: s.id === user.id ? '#f0f9ff' : '#ffffff',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.email}</div>
                  </div>
                  {s.id === user.id && (
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>You</span>
                  )}
                </div>

                {s.student_identifier && (
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#64748b', marginBottom: '10px' }}>
                    ID: {s.student_identifier}
                  </div>
                )}

                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Skills:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {s.technical_skills ? (
                      s.technical_skills.split(',').slice(0, 4).map((sk, i) => (
                        <span key={i} className="badge badge-slate" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                          {sk.trim()}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None listed</span>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Interests:
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: '2px' }}>
                    {s.interests || 'None listed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
