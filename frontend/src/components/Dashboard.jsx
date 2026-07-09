import React from 'react';
import { Calendar, Brain, Clock, ChevronRight, Play, Trash2, Award, TrendingUp } from 'lucide-react';

const Dashboard = ({ sessions = [], onStartNew, onViewSession, onDeleteSession }) => {
  const completedSessions = sessions.filter(s => s.status === 'completed' && s.overallScore !== null);
  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / completedSessions.length)
    : 0;

  // Calculate estimated total practice time (assuming ~10 min per session if not finished, or difference in dates)
  const totalMinutes = sessions.reduce((acc, curr) => {
    if (curr.endTime) {
      const diff = new Date(curr.endTime) - new Date(curr.startTime);
      return acc + Math.ceil(diff / (1000 * 60));
    }
    return acc + 5; // default 5 mins for unfinished sessions
  }, 0);

  const getPerformanceBadge = (score) => {
    if (score >= 85) return { text: 'Expert', class: 'badge-success' };
    if (score >= 70) return { text: 'Competent', class: 'badge-indigo' };
    if (score >= 50) return { text: 'Developing', class: 'badge-warning' };
    return { text: 'Needs Work', class: 'badge-error' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        padding: '2.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.75rem', fontWeight: '800', tracking: '-0.03em' }}>
            Elevate Your Interview Readiness
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.5', maxWidth: '600px' }}>
            Practice real-time technical and behavioral interviews. Get instant speech analysis, filler word metrics, and expert AI suggestions to land your dream job.
          </p>
        </div>
        <button className="btn btn-primary" onClick={onStartNew} style={{
          padding: '1rem 2rem',
          fontSize: '1.05rem',
          borderRadius: 'var(--radius-lg)'
        }}>
          <Play size={18} fill="#fff" /> Start Practice Session
        </button>
      </div>

      {/* Analytics Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Stat 1 */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-md)',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Brain size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Practices</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '2px' }}>{sessions.length}</div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-md)',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--success)'
          }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Average AI Score</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '2px' }}>
              {avgScore > 0 ? `${avgScore}%` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            borderRadius: 'var(--radius-md)',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--secondary)'
          }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Practice Time</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '2px' }}>{totalMinutes} mins</div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: 'var(--radius-md)',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Completion Rate</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '2px' }}>
              {sessions.length > 0 
                ? `${Math.round((completedSessions.length / sessions.length) * 100)}%` 
                : '100%'}
            </div>
          </div>
        </div>
      </div>

      {/* Session History List */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', fontWeight: '700' }}>Practice History</h2>
        
        {sessions.length === 0 ? (
          <div className="glass-card" style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed var(--glass-border)',
            gap: '1rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: 'var(--text-muted)'
            }}>
              <Calendar size={40} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>No sessions found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '400px' }}>
              You haven't recorded any mock interviews yet. Launch your first customized practice run to start tracking your progress!
            </p>
            <button className="btn btn-primary" onClick={onStartNew} style={{ marginTop: '0.5rem' }}>
              Create First Session
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sessions.map((session) => {
              const date = new Date(session.startTime).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              
              const isCompleted = session.status === 'completed';
              const badge = isCompleted && session.overallScore !== null
                ? getPerformanceBadge(session.overallScore)
                : null;

              return (
                <div
                  key={session.id}
                  className="glass-card interactive"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: '1', minWidth: '280px' }}>
                    {/* Score display */}
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: isCompleted && session.overallScore !== null
                        ? (session.overallScore >= 80 
                            ? 'rgba(16, 185, 129, 0.1)' 
                            : session.overallScore >= 60 
                            ? 'rgba(245, 158, 11, 0.1)' 
                            : 'rgba(244, 63, 94, 0.1)')
                        : 'rgba(255, 255, 255, 0.05)',
                      border: `2px solid ${
                        isCompleted && session.overallScore !== null
                          ? (session.overallScore >= 80 ? 'var(--success)' : session.overallScore >= 60 ? 'var(--warning)' : 'var(--error)')
                          : 'var(--glass-border)'
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                      color: isCompleted && session.overallScore !== null
                        ? (session.overallScore >= 80 ? '#6ee7b7' : session.overallScore >= 60 ? '#fde047' : '#fda4af')
                        : 'var(--text-muted)'
                    }}>
                      {isCompleted && session.overallScore !== null ? `${session.overallScore}%` : '—'}
                    </div>

                    {/* Metadata details */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                          {session.level} {session.role}
                        </h3>
                        <span className="badge badge-indigo">{session.category}</span>
                        {badge && <span className={`badge ${badge.class}`}>{badge.text}</span>}
                        {!isCompleted && (
                          <span className="badge badge-warning">In Progress</span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> {date}
                        </span>
                        <span>
                          Q: {session.completedQuestionsCount} / {session.questionsCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => onViewSession(session.id)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      {isCompleted ? 'View Performance' : 'Resume Interview'} <ChevronRight size={14} />
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this practice session from history?')) {
                          onDeleteSession(session.id);
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.backgroundColor = 'rgba(244,63,94,0.15)' }}
                      onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent' }}
                      title="Delete Session"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
