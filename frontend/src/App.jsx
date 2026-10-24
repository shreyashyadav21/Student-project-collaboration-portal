import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import ProjectDetails from './pages/ProjectDetails';
import FacultyDashboard from './pages/FacultyDashboard';
import CreateProjectModal from './components/CreateProjectModal';

export default function App() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-muted)'
      }}>
        Loading Student Project Portal...
      </div>
    );
  }

  // Not authenticated -> show Login / Register
  if (!user) {
    return <AuthPage />;
  }

  // Faculty user view
  if (user.role === 'faculty') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar
          activePage="faculty-dashboard"
          setActivePage={() => {}}
          selectedProjectId={null}
          setSelectedProjectId={() => {}}
        />
        <main style={{ flex: 1, paddingBottom: '40px' }}>
          <FacultyDashboard />
        </main>
      </div>
    );
  }

  // Student user view
  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    setActivePage('project-details');
  };

  const handleBackToDashboard = () => {
    setSelectedProjectId(null);
    setActivePage('student-dashboard');
  };

  const handleProjectCreated = (newProject) => {
    setSelectedProjectId(newProject.id);
    setActivePage('project-details');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
      />

      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {activePage === 'student-profile' && <StudentProfile />}

        {activePage === 'project-details' && selectedProjectId && (
          <ProjectDetails
            projectId={selectedProjectId}
            onBack={handleBackToDashboard}
          />
        )}

        {(activePage === 'student-dashboard' || (activePage !== 'student-profile' && !selectedProjectId)) && (
          <StudentDashboard
            onSelectProject={handleSelectProject}
            onOpenCreateModal={() => setIsCreateProjectOpen(true)}
          />
        )}
      </main>

      {/* Global Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
