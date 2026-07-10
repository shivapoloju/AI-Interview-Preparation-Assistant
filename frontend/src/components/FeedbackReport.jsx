import React, { useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle, AlertTriangle, MessageSquare, RefreshCw, BarChart2, Star, Play } from 'lucide-react';
import CircularProgress from './CircularProgress';

const FeedbackReport = ({ session, onBackToDashboard, onRetake }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  const report = session.finalReport || {
    overallScore: 0,
    summary: 'Mock interview completed successfully.',
    keyStrengths: [],
    keyWeaknesses: [],
    actionablePlan: []
  };

  const keyStrengths = Array.isArray(report.keyStrengths)
    ? report.keyStrengths
    : (typeof report.keyStrengths === 'string' && report.keyStrengths ? [report.keyStrengths] : []);

  const keyWeaknesses = Array.isArray(report.keyWeaknesses)
    ? report.keyWeaknesses
    : (typeof report.keyWeaknesses === 'string' && report.keyWeaknesses ? [report.keyWeaknesses] : []);

  const actionablePlan = Array.isArray(report.actionablePlan)
    ? report.actionablePlan
    : (typeof report.actionablePlan === 'string' && report.actionablePlan ? [report.actionablePlan] : []);

  const completedQA = (session.questions || []).filter(q => q.answer !== null);

  // Compute average communication metrics across all answered questions
  const totalWords = completedQA.reduce((acc, q) => acc + (q.communication?.wordCount || 0), 0);
  const totalFillers = completedQA.reduce((acc, q) => acc + (q.communication?.fillerCount || 0), 0);
  const avgFillerPercentage = totalWords > 0 ? parseFloat(((totalFillers / totalWords) * 100).toFixed(1)) : 0;
  
  const avgLexicalDiversity = completedQA.length > 0 
    ? parseFloat((completedQA.reduce((acc, q) => acc + (q.communication?.lexicalDiversity || 0), 0) / completedQA.length).toFixed(2))
    : 0;

  const avgConfidenceScore = completedQA.length > 0 
    ? Math.round(completedQA.reduce((acc, q) => acc + (q.communication?.confidenceScore || 0), 0) / completedQA.length)
    : 0;

  // Aggregate filler words breakdown
  const aggregatedFillers = {};
  completedQA.forEach(q => {
    const breakdown = q.communication?.fillerBreakdown || {};
    Object.entries(breakdown).forEach(([word, count]) => {
      aggregatedFillers[word] = (aggregatedFillers[word] || 0) + count;
    });
  });

  const fillerTags = Object.entries(aggregatedFillers)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const getPaceText = (wordCount) => {
    if (wordCount < 20) return { label: 'Brief', desc: 'Answer is too short. Try to add more details.', color: 'var(--error)' };
    if (wordCount > 300) return { label: 'Wordy', desc: 'Answer is quite long. Focus on conciseness.', color: 'var(--warning)' };
    return { label: 'Good', desc: 'Appropriate answer length.', color: 'var(--success)' };
  };

  const getDiversityText = (diversity) => {
    if (diversity >= 0.6) return { label: 'Excellent', desc: 'Rich vocabulary utilized.', color: 'var(--success)' };
    if (diversity >= 0.45) return { label: 'Moderate', desc: 'Clear and standard vocabulary.', color: 'var(--primary)' };
    return { label: 'Repetitive', desc: 'Repeating similar words. Try using synonyms.', color: 'var(--error)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={onBackToDashboard}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <button className="btn btn-primary" onClick={onRetake}>
          <RefreshCw size={16} /> Retake Practice Run
        </button>
      </div>

      {/* Main Stats Header */}
      <div className="glass-card" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2.5fr',
        gap: '2.5rem',
        padding: '2.5rem 2rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Left Circular Gauge */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress value={report.overallScore} size={180} strokeWidth={15} label="Overall Grade" />
        </div>

        {/* Right Summary */}
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '0.75rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            {session.level} {session.role} • {session.category}
          </span>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', fontWeight: '800' }}>Performance Evaluation</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            {report.summary}
          </p>
        </div>
      </div>

      {/* Strengths, Weaknesses, and Action Plan Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}>
        
        {/* Key Strengths & Weaknesses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Strengths Card */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--success)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: '#6ee7b7' }}>
              <CheckCircle size={18} /> Major Strengths
            </h3>
            {keyStrengths.length > 0 ? (
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.4' }}>
                {keyStrengths.map((str, idx) => <li key={idx}>{str}</li>)}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No evaluation records found.</p>
            )}
          </div>

          {/* Weaknesses Card */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--error)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: '#fda4af' }}>
              <AlertTriangle size={18} /> Areas for Improvement
            </h3>
            {keyWeaknesses.length > 0 ? (
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.4' }}>
                {keyWeaknesses.map((weak, idx) => <li key={idx}>{weak}</li>)}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No evaluation records found.</p>
            )}
          </div>
        </div>

        {/* Study Roadmap Action Plan */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <BookOpen size={20} /> Actionable Practice Roadmap
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Follow these custom steps designed by our AI coach to polish your skills before your next live interview:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            {actionablePlan.map((plan, idx) => (
              <div key={idx} style={{
                display: 'flex',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--glass-border)'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>
                <div style={{ fontSize: '0.95rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>
                  {plan}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Speech Communication Metrics (Python Style NLP Analysis) */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={20} color="var(--accent)" /> Speech & Communication Analytics
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {/* Left Block: Communication Progress Indicators */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Metric 1: Filler Words Density */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: '600' }}>Filler Word Density</span>
                <span style={{ fontWeight: '700', color: avgFillerPercentage > 8 ? 'var(--error)' : avgFillerPercentage > 4 ? 'var(--warning)' : 'var(--success)' }}>
                  {avgFillerPercentage}%
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(avgFillerPercentage * 5, 100)}%`,
                  height: '100%',
                  background: avgFillerPercentage > 8 ? 'var(--error)' : avgFillerPercentage > 4 ? 'var(--warning)' : 'var(--success)',
                  borderRadius: '4px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Ideal range is below 4%. Lower density yields high clarity.
              </div>
            </div>

            {/* Metric 2: Vocabulary Variety */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: '600' }}>Vocabulary Diversity (TTR)</span>
                <span style={{ fontWeight: '700', color: getDiversityText(avgLexicalDiversity).color }}>
                  {getDiversityText(avgLexicalDiversity).label} ({avgLexicalDiversity})
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${avgLexicalDiversity * 100}%`,
                  height: '100%',
                  background: getDiversityText(avgLexicalDiversity).color,
                  borderRadius: '4px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {getDiversityText(avgLexicalDiversity).desc} Measures unique word choices.
              </div>
            </div>

            {/* Metric 3: Tone & Confidence */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: '600' }}>Confidence Tone Index</span>
                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                  {avgConfidenceScore}%
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${avgConfidenceScore}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                  borderRadius: '4px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Determined by the ratio of strong/confident words vs hesitant keywords.
              </div>
            </div>

          </div>

          {/* Right Block: Filler words tag clouds & pacing feedback */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.5rem' }}>Filler Words Breakdown</h4>
              {fillerTags.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {fillerTags.map(([word, count]) => (
                    <span
                      key={word}
                      className="badge"
                      style={{
                        backgroundColor: count > 3 ? 'rgba(244,63,94,0.1)' : 'rgba(245,158,11,0.1)',
                        color: count > 3 ? '#fda4af' : '#fde047',
                        border: `1px solid ${count > 3 ? 'rgba(244,63,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      "{word}": used {count}x
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-success)', fontSize: '0.9rem', fontWeight: '600' }}>
                  Excellent! No filler words were detected in your speech.
                </p>
              )}
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.15)',
              border: '1px dashed var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem'
            }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>Answer Pacing Stats</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Across {completedQA.length} responses, you averaged{' '}
                <strong>{Math.round(totalWords / (completedQA.length || 1))} words</strong> per answer. 
                This indicates a{' '}
                <strong style={{ color: getPaceText(totalWords / (completedQA.length || 1)).color }}>
                  {getPaceText(totalWords / (completedQA.length || 1)).label}
                </strong>{' '}
                speaking speed.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Question-by-Question Accordion Breakdown */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '700' }}>Question Breakdown</h2>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          
          {/* Question Index Tabs (Left Column on larger devices) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '220px', flexShrink: 0 }}>
            {completedQA.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                style={{
                  textAlign: 'left',
                  padding: '1rem',
                  background: activeTab === idx ? 'rgba(99, 102, 241, 0.15)' : 'var(--glass-bg)',
                  border: `1px solid ${activeTab === idx ? 'var(--primary)' : 'var(--glass-border)'}`,
                  color: activeTab === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <span>Question {idx + 1}</span>
                <span className="badge badge-indigo" style={{
                  backgroundColor: q.score >= 80 ? 'var(--success)' : q.score >= 60 ? 'var(--warning)' : 'var(--error)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.75rem',
                  padding: '0.15rem 0.4rem'
                }}>
                  {q.score}%
                </span>
              </button>
            ))}
          </div>

          {/* Active Tab Details Card (Right Column) */}
          <div className="glass-card" style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {completedQA[activeTab] && (
              <>
                {/* Question and Answer */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={14} /> The Question
                  </h4>
                  <p style={{ fontSize: '1.05rem', fontWeight: '700', marginTop: '4px', lineHeight: '1.4', color: 'var(--text-primary)' }}>
                    {completedQA[activeTab].question}
                  </p>
                </div>

                <div style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  border: '1px solid var(--glass-border)'
                }}>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>
                    Your Answer Transcript
                  </h4>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    "{completedQA[activeTab].answer}"
                  </p>
                </div>

                {/* Score & Gemini Evaluation */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#6ee7b7', marginBottom: '6px' }}>Content Strengths</h5>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.4', color: 'var(--text-secondary)' }}>
                      {completedQA[activeTab].feedback?.strengths || 'N/A'}
                    </p>
                  </div>
                  
                  <div style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.15)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fda4af', marginBottom: '6px' }}>Areas for Growth</h5>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.4', color: 'var(--text-secondary)' }}>
                      {completedQA[activeTab].feedback?.weaknesses || 'N/A'}
                    </p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                    <Star size={16} /> How to Improve Your Answer
                  </h5>
                  <p style={{ fontSize: '0.92rem', lineHeight: '1.5', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {completedQA[activeTab].feedback?.improvement}
                  </p>
                </div>

                {/* Model Answer */}
                {completedQA[activeTab].modelAnswer && completedQA[activeTab].modelAnswer !== 'N/A' && (
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem'
                  }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '6px' }}>
                      Recommended Model Answer Structure
                    </h5>
                    <div style={{
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {completedQA[activeTab].modelAnswer}
                    </div>
                  </div>
                )}

                {/* Local Communication Breakdown for this specific QA */}
                {completedQA[activeTab].communication && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    background: 'rgba(0,0,0,0.1)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--glass-border)',
                    fontSize: '0.85rem'
                  }}>
                    <span>
                      Words: <strong>{completedQA[activeTab].communication.wordCount}</strong>
                    </span>
                    <span>
                      Fillers: <strong>{completedQA[activeTab].communication.fillerCount}</strong> ({completedQA[activeTab].communication.fillerPercentage}%)
                    </span>
                    <span>
                      Tone: <strong>{completedQA[activeTab].communication.toneRating}</strong>
                    </span>
                    <span>
                      Sentences: <strong>{completedQA[activeTab].communication.sentenceRating}</strong>
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default FeedbackReport;
