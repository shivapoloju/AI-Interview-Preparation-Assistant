import React from 'react';

const AudioVisualizer = ({ isRecording = false, isSpeaking = false, isThinking = false }) => {
  const bars = Array.from({ length: 15 });

  // Get active state style class
  let status = 'idle';
  if (isRecording) status = 'recording';
  else if (isSpeaking) status = 'speaking';
  else if (isThinking) status = 'thinking';

  // Render CSS for the component inline to keep the design modular and styling direct
  return (
    <div className="audio-visualizer-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      height: '60px',
      width: '100%',
      margin: '1.5rem 0',
      padding: '0 10px',
      background: 'rgba(0, 0, 0, 0.15)',
      borderRadius: 'var(--radius-md)',
      border: '1px dashed var(--glass-border)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {status === 'idle' && (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
          Mic inactive • Toggle speech or click Record to start
        </span>
      )}

      {status === 'thinking' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="skeleton-loading" style={{ width: '12px', height: '12px', borderRadius: '50%' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            AI Interviewer is analyzing your answer...
          </span>
        </div>
      )}

      {(status === 'recording' || status === 'speaking') && (
        <>
          <div style={{
            position: 'absolute',
            left: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: status === 'recording' ? 'var(--error)' : 'var(--primary)',
              boxShadow: status === 'recording' ? '0 0 10px var(--error)' : '0 0 10px var(--primary)'
            }} />
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: status === 'recording' ? 'var(--error)' : 'var(--primary)',
              letterSpacing: '0.05em'
            }}>
              {status === 'recording' ? 'Recording' : 'AI Speaking'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '100%' }}>
            {bars.map((_, i) => {
              // Staggered animation duration and heights
              const delay = `${i * 0.07}s`;
              const animName = status === 'recording' ? 'voiceWaveRed' : 'voiceWaveBlue';
              return (
                <div
                  key={i}
                  style={{
                    width: '4px',
                    borderRadius: '2px',
                    backgroundColor: status === 'recording' ? 'var(--error)' : 'var(--primary)',
                    boxShadow: status === 'recording' ? '0 0 5px rgba(244,63,94,0.3)' : '0 0 5px rgba(99,102,241,0.3)',
                    animation: `${animName} 1.2s infinite ease-in-out alternate`,
                    animationDelay: delay,
                    height: '6px'
                  }}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Inject custom visualizer keyframes */}
      <style>{`
        @keyframes voiceWaveBlue {
          0% { height: 6px; }
          100% { height: 42px; }
        }
        @keyframes voiceWaveRed {
          0% { height: 6px; }
          100% { height: 35px; }
        }
      `}</style>
    </div>
  );
};

export default AudioVisualizer;
