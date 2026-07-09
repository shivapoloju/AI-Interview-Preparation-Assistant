import React, { useState, useEffect } from 'react';
import { Settings, Sparkles, Key, AlertCircle, CheckCircle, Database } from 'lucide-react';
import Dashboard from './components/Dashboard';
import SetupModal from './components/SetupModal';
import InterviewRoom from './components/InterviewRoom';
import FeedbackReport from './components/FeedbackReport';

const App = () => {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'interview', 'report'
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appError, setAppError] = useState('');

  // 1. Load Session History on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sessions');
      if (!res.ok) throw new Error('Failed to retrieve history');
      const data = await res.json();
      setSessions(data);
      setAppError('');
    } catch (err) {
      console.error(err);
      setAppError('Could not connect to the backend server. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getHeaders = () => {
    return { 'Content-Type': 'application/json' };
  };

  // 2. Start a New Mock Interview Session
  const handleStartInterview = async (setupData) => {
    setAppError('');
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(setupData)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to start interview.');
    }

    const session = await res.json();
    setCurrentSession(session);
    setIsSetupOpen(false);
    setView('interview');
    fetchSessions(); // Refresh list in background
  };

  // 3. Submit an Answer to the Current Question
  const handleSubmitAnswer = async (answer) => {
    setAppError('');
    const res = await fetch(`/api/sessions/${currentSession.id}/answer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ answer })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to process answer.');
    }

    const updatedSession = await res.json();
    setCurrentSession(updatedSession);
    
    // If the session has completed, automatically grade and load the report
    if (updatedSession.status === 'completed') {
      handleEndInterview(updatedSession.id);
    }
  };

  // 4. End the Interview Session Early & Generate Final Grade/Report
  const handleEndInterview = async (sessionId = currentSession?.id) => {
    if (!sessionId) return;
    setAppError('');
    try {
      const res = await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate report.');
      }

      const completedSession = await res.json();
      setCurrentSession(completedSession);
      setView('report');
      fetchSessions(); // Refresh history list
    } catch (err) {
      setAppError(err.message || 'Error completing interview.');
    }
  };

  // 5. Open an Interview from History (View Completed or Resume In-Progress)
  const handleViewSession = async (id) => {
    setAppError('');
    try {
      const res = await fetch(`/api/sessions/${id}`);
      if (!res.ok) throw new Error('Failed to fetch session details');
      const session = await res.json();
      
      setCurrentSession(session);
      if (session.status === 'completed') {
        setView('report');
      } else {
        setView('interview');
      }
    } catch (err) {
      setAppError(err.message || 'Failed to load session.');
    }
  };

  // 6. Delete an Interview Session
  const handleDeleteSession = async (id) => {
    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete session');
      fetchSessions();
      if (currentSession && currentSession.id === id) {
        setCurrentSession(null);
        setView('dashboard');
      }
    } catch (err) {
      setAppError(err.message || 'Failed to delete session.');
    }
  };

  // 7. Retake a completed/previous session with same options
  const handleRetake = () => {
    if (!currentSession) return;
    setIsSetupOpen(true);
  };

  const handleBackToDashboard = () => {
    setCurrentSession(null);
    setView('dashboard');
    fetchSessions(); // Refresh list to ensure scores are sync'd
  };



  return (
    <div className="app-container">
      {/* Header bar */}
      <header className="header">
        <div className="logo-container" style={{ cursor: 'pointer' }} onClick={handleBackToDashboard}>
          <div className="logo-icon">
            <Sparkles size={20} color="#fff" />
          </div>
          <span className="logo-text">AI Interview Coach</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        </div>
      </header>

      {/* Main app alerts */}
      {appError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: 'rgba(244,63,94,0.15)',
          border: '1px solid rgba(244,63,94,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          color: '#fda4af',
          marginBottom: '1.5rem',
          fontSize: '0.92rem'
        }}>
          <AlertCircle size={18} />
          <span>{appError}</span>
        </div>
      )}



      {/* Main content body switcher */}
      <main style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '1',
            gap: '12px'
          }}>
            <div className="skeleton-loading" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
              Loading practice details...
            </span>
          </div>
        ) : (
          <>
            {view === 'dashboard' && (
              <Dashboard
                sessions={sessions}
                onStartNew={() => setIsSetupOpen(true)}
                onViewSession={handleViewSession}
                onDeleteSession={handleDeleteSession}
              />
            )}

            {view === 'interview' && currentSession && (
              <InterviewRoom
                session={currentSession}
                onSubmitAnswer={handleSubmitAnswer}
                onEndSession={handleEndInterview}
              />
            )}

            {view === 'report' && currentSession && (
              <FeedbackReport
                session={currentSession}
                onBackToDashboard={handleBackToDashboard}
                onRetake={handleRetake}
              />
            )}
          </>
        )}
      </main>

      {/* Settings Modal triggers */}
      <SetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStart={handleStartInterview}
      />
    </div>
  );
};

export default App;
