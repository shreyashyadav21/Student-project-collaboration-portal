import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, GraduationCap, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('student'); // 'student' | 'faculty'

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState('');
  const [interests, setInterests] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!email.trim()) throw new Error('Please enter your email.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');

        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          student_identifier: role === 'student' ? studentIdentifier.trim() : '',
          technical_skills: role === 'student' ? technicalSkills.trim() : '',
          interests: role === 'student' ? interests.trim() : '',
        });
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoEmail) => {
    setIsRegister(false);
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
      padding: '24px 16px'
    }}>
      <div style={{
        maxWidth: isRegister && role === 'student' ? '650px' : '460px',
        width: '100%',
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        padding: '36px',
        transition: 'all 0.2s'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '12px',
            borderRadius: '16px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            marginBottom: '12px'
          }}>
            {role === 'student' ? <GraduationCap size={32} /> : <ShieldCheck size={32} />}
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            {isRegister ? 'Create an Account' : 'Welcome to CollabPortal'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            {isRegister
              ? 'Join fellow students and faculty to collaborate on academic projects'
              : 'Sign in to access your projects, team tasks, and review dashboards'}
          </p>
        </div>

        {/* Role Toggle */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => setRole('student')}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: role === 'student' ? '#ffffff' : 'transparent',
              color: role === 'student' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: role === 'student' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            🎓 Student Portal
          </button>
          <button
            type="button"
            onClick={() => setRole('faculty')}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: role === 'faculty' ? '#ffffff' : 'transparent',
              color: role === 'faculty' ? '#b45309' : 'var(--text-muted)',
              boxShadow: role === 'faculty' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            🏛️ Faculty Portal
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: '0.85rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder={role === 'faculty' ? 'Dr. / Prof. Jane Smith' : 'Alex Johnson'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder={role === 'faculty' ? 'faculty.name@university.edu' : 'student.name@student.edu'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Student Specific Profile Fields during Registration */}
          {isRegister && role === 'student' && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>
                STUDENT PROFILE DETAILS
              </div>

              <div className="form-group">
                <label className="form-label">Student ID / Roll Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. STU-2026-042"
                  value={studentIdentifier}
                  onChange={(e) => setStudentIdentifier(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Technical Skills (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. React, Node.js, Python, PostgreSQL, Figma"
                  value={technicalSkills}
                  onChange={(e) => setTechnicalSkills(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Areas of Technical Interest</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Full-Stack Web, Machine Learning, Cloud Systems"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isRegister ? (
              <><UserPlus size={18} /> Register as {role === 'student' ? 'Student' : 'Faculty'}</>
            ) : (
              <><LogIn size={18} /> Sign In</>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setIsRegister(false); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700 }}
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account yet?{' '}
              <button
                onClick={() => { setIsRegister(true); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700 }}
              >
                Register Here
              </button>
            </>
          )}
        </div>

        {/* Quick Demo Logins for Testing & Demonstration */}
        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
            Quick Demo Accounts (Pre-seeded)
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillQuickDemo('alex.johnson@student.edu')}
              style={{ fontSize: '0.78rem' }}
            >
              👤 Student (Alex)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillQuickDemo('sarah.chen@student.edu')}
              style={{ fontSize: '0.78rem' }}
            >
              👤 Student (Sarah)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillQuickDemo('faculty.alan@university.edu')}
              style={{ fontSize: '0.78rem', color: '#b45309' }}
            >
              🏛️ Faculty (Dr. Alan)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
