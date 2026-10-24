import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, LayoutDashboard, UserCheck, LogOut, FolderGit2, BookOpen } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, selectedProjectId, setSelectedProjectId }) {
  const { user, logout } = useAuth();

  const handleNav = (page) => {
    setActivePage(page);
    if (page !== 'project-details') {
      setSelectedProjectId(null);
    }
  };

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px'
      }}>
        {/* Brand */}
        <div
          onClick={() => handleNav(user.role === 'faculty' ? 'faculty-dashboard' : 'student-dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: 'white',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FolderGit2 size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
              COLLAB<span style={{ color: 'var(--primary)' }}>PORTAL</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Academic & Technical Projects
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {user.role === 'student' ? (
            <>
              <button
                className={`btn btn-secondary btn-sm ${activePage === 'student-dashboard' ? 'active' : ''}`}
                style={{
                  background: activePage === 'student-dashboard' ? 'var(--primary-light)' : 'transparent',
                  color: activePage === 'student-dashboard' ? 'var(--primary)' : 'var(--text-main)',
                  borderColor: activePage === 'student-dashboard' ? 'var(--primary)' : 'transparent'
                }}
                onClick={() => handleNav('student-dashboard')}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </button>

              <button
                className={`btn btn-secondary btn-sm ${activePage === 'student-profile' ? 'active' : ''}`}
                style={{
                  background: activePage === 'student-profile' ? 'var(--primary-light)' : 'transparent',
                  color: activePage === 'student-profile' ? 'var(--primary)' : 'var(--text-main)',
                  borderColor: activePage === 'student-profile' ? 'var(--primary)' : 'transparent'
                }}
                onClick={() => handleNav('student-profile')}
              >
                <UserCheck size={16} />
                <span>My Profile</span>
              </button>
            </>
          ) : (
            <button
              className={`btn btn-secondary btn-sm ${activePage === 'faculty-dashboard' ? 'active' : ''}`}
              style={{
                background: activePage === 'faculty-dashboard' ? 'var(--primary-light)' : 'transparent',
                color: activePage === 'faculty-dashboard' ? 'var(--primary)' : 'var(--text-main)',
                borderColor: activePage === 'faculty-dashboard' ? 'var(--primary)' : 'transparent'
              }}
              onClick={() => handleNav('faculty-dashboard')}
            >
              <BookOpen size={16} />
              <span>Faculty Dashboard</span>
            </button>
          )}
        </nav>

        {/* User Badge & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
              <span className={`badge ${user.role === 'faculty' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.65rem' }}>
                {user.role}
              </span>
              {user.profile?.student_identifier && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {user.profile.student_identifier}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Log Out"
            style={{ color: 'var(--danger)', borderColor: '#fecaca', background: '#fff5f5' }}
          >
            <LogOut size={16} />
            <span style={{ display: 'none' }}>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
