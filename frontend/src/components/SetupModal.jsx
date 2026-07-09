import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';

const ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Engineer',
  'Product Manager',
  'Data Scientist',
  'UX/UI Designer',
  'DevOps Engineer'
];

const SetupModal = ({ isOpen, onClose, onStart }) => {
  const [role, setRole] = useState(ROLES[0]);
  const [customRole, setCustomRole] = useState('');
  const [level, setLevel] = useState('Mid-Level');
  const [category, setCategory] = useState('Behavioral');
  const [maxQuestions, setMaxQuestions] = useState(5);
  const [jobDescription, setJobDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const finalRole = role === 'Other' ? customRole.trim() : role;
    if (!finalRole) {
      setError('Please specify a role.');
      setIsSubmitting(false);
      return;
    }

    try {
      await onStart({
        role: finalRole,
        level,
        category,
        jobDescription,
        maxQuestions
      });
    } catch (err) {
      setError(err.message || 'Failed to start interview.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 6, 15, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)',
      padding: '1.5rem'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '650px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.25rem',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer'
        }}>
          <X size={22} />
        </button>

        {/* Modal Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <div className="logo-icon" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.5rem', background: 'linear-gradient(135deg, #fff 40%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Setup Mock Interview
          </h2>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(244,63,94,0.15)',
            border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            color: '#fda4af',
            marginBottom: '1.25rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Role and Level Selection */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label className="label">Job Role</label>
              <select
                className="input-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px' }}
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                <option value="Other">Other / Custom</option>
              </select>
            </div>
            
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label className="label">Experience Level</label>
              <select
                className="input-field"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px' }}
              >
                <option value="Intern">Intern</option>
                <option value="Junior">Junior (0-2 yrs)</option>
                <option value="Mid-Level">Mid-Level (2-5 yrs)</option>
                <option value="Senior">Senior (5-8 yrs)</option>
                <option value="Lead / Principal">Lead / Principal (8+ yrs)</option>
              </select>
            </div>
          </div>

          {/* Custom Role Input */}
          {role === 'Other' && (
            <div>
              <label className="label">Specify Custom Role</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Site Reliability Engineer"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                required
              />
            </div>
          )}

          {/* Category and Question Count Selection */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label className="label">Interview Category</label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px' }}
              >
                <option value="Behavioral">Behavioral (STAR Method, culture fit)</option>
                <option value="Technical">Technical (Frontend, backend coding concepts)</option>
                <option value="System Design">System Design (Scalability, architecture)</option>
                <option value="General HR">General HR (Introduction, salary, goals)</option>
              </select>
            </div>
            
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label className="label">Number of Questions</label>
              <select
                className="input-field"
                value={maxQuestions}
                onChange={(e) => setMaxQuestions(parseInt(e.target.value))}
                style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px' }}
              >
                <option value="3">3 Questions (Speed Run)</option>
                <option value="5">5 Questions (Standard Practice)</option>
                <option value="7">7 Questions (Deep Session)</option>
              </select>
            </div>
          </div>

          {/* Job Description Textarea */}
          <div>
            <label className="label">Job Description / Custom Prompts (Optional)</label>
            <textarea
              className="input-field"
              placeholder="Paste the target job description here to generate tailored, highly realistic questions matching actual employer requirements..."
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ minWidth: '130px' }}
            >
              {isSubmitting ? 'Initializing...' : 'Start Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupModal;
