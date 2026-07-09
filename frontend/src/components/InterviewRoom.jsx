import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, HelpCircle, Volume2, VolumeX, Square, ArrowRight, Brain } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

const InterviewRoom = ({ session, onSubmitAnswer, onEndSession }) => {
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [error, setError] = useState('');
  
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  const currentQIndex = session.currentQuestionIndex;
  const currentQuestion = session.questions[currentQIndex]?.question || '';
  const totalQuestions = session.maxQuestions;

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
        setError('');
      };

      rec.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setAnswerText(prev => prev + finalTranscript);
        }
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission blocked. Please allow mic access in your browser settings.');
        } else {
          setError(`Voice input issue: ${event.error}. Feel free to type your answer.`);
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    } else {
      setError('Web Speech API is not supported in this browser. You can type your response instead.');
    }

    // Cancel TTS speaking on component unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-speak questions when they change
  useEffect(() => {
    if (ttsEnabled && currentQuestion) {
      speakQuestion(currentQuestion);
    }
  }, [currentQuestion, ttsEnabled]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.questions]);

  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose a natural English voice
    const voices = window.speechSynthesis.getVoices();
    const idealVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))) ||
                       voices.find(v => v.lang.startsWith('en')) || 
                       voices[0];
                       
    if (idealVoice) utterance.voice = idealVoice;
    utterance.rate = 0.95; // Slightly slower, professional pace
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setError('Voice recognition is not supported in this browser. Please type.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      // Stop TTS if it's currently speaking
      if (isSpeaking && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!answerText.trim()) {
      setError('Please provide an answer (type or speak) before submitting.');
      return;
    }

    setError('');
    setIsThinking(true);
    
    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Stop speaking if active
    if (isSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const submittedText = answerText;
    setAnswerText('');

    try {
      await onSubmitAnswer(submittedText);
    } catch (err) {
      setError(err.message || 'Error sending answer.');
      setAnswerText(submittedText); // Restore text
    } finally {
      setIsThinking(false);
    }
  };

  const handleSkipQuestion = () => {
    setAnswerText('I would like to skip this question.');
    setTimeout(() => {
      handleSubmit();
    }, 100);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', flex: '1', minHeight: '550px' }}>
      
      {/* Left Column: Interactive Chatroom & Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Progress Bar & Header */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.05em' }}>
              Current Practice Session
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
              {session.level} {session.role}
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>
              Question {currentQIndex + 1} of {totalQuestions}
            </span>
            <div style={{ width: '120px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${((currentQIndex + 1) / totalQuestions) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>

        {/* Conversation Dialog box */}
        <div className="glass-card" style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          maxHeight: '480px',
          overflowY: 'auto',
          gap: '1rem',
          padding: '1.25rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {session.questions.map((q, idx) => {
              const isAnswered = q.answer !== null;
              const isCurrent = idx === currentQIndex;

              if (idx > currentQIndex) return null;

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* AI Question Bubble */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start', maxWidth: '85%' }}>
                    <div className="logo-icon" style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%' }}>
                      <Brain size={14} color="#fff" />
                    </div>
                    <div>
                      <div style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--glass-border)',
                        padding: '0.85rem 1.1rem',
                        borderRadius: '0 var(--radius-md) var(--radius-md) var(--radius-md)',
                        fontSize: '0.95rem',
                        lineHeight: '1.5',
                        color: 'var(--text-primary)'
                      }}>
                        {q.question}
                      </div>
                      {isCurrent && (
                        <button
                          onClick={() => speakQuestion(q.question)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                            marginTop: '6px',
                            fontWeight: '600'
                          }}
                        >
                          <Volume2 size={13} /> Replay Audio
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Candidate Answer Bubble */}
                  {isAnswered && (
                    <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-end', maxWidth: '85%', flexDirection: 'row-reverse' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        flexShrink: 0
                      }}>
                        ME
                      </div>
                      <div style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        padding: '0.85rem 1.1rem',
                        borderRadius: 'var(--radius-md) 0 var(--radius-md) var(--radius-md)',
                        fontSize: '0.95rem',
                        lineHeight: '1.5',
                        color: 'var(--text-primary)'
                      }}>
                        {q.answer}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Thinking / Spinner Bubble */}
            {isThinking && (
              <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start', maxWidth: '85%' }}>
                <div className="logo-icon" style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%' }}>
                  <Brain size={14} color="#fff" />
                </div>
                <div style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--glass-border)',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '0 var(--radius-md) var(--radius-md) var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div className="skeleton-loading" style={{ width: '8px', height: '8px', borderRadius: '50%' }} />
                  <div className="skeleton-loading" style={{ width: '8px', height: '8px', borderRadius: '50%', animationDelay: '0.2s' }} />
                  <div className="skeleton-loading" style={{ width: '8px', height: '8px', borderRadius: '50%', animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        </div>

      </div>

      {/* Right Column: Dynamic Input, Voice waveforms, and Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Voice Visualizer Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', alignSelf: 'flex-start', marginBottom: '0.5rem' }}>Voice Practice</h3>
          
          <AudioVisualizer isRecording={isRecording} isSpeaking={isSpeaking} isThinking={isThinking} />

          {/* Voice Settings bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HelpCircle size={14} /> Voice Guidance (TTS)
            </span>
            <button
              onClick={() => {
                const state = !ttsEnabled;
                setTtsEnabled(state);
                if (!state && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: ttsEnabled ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: '700',
                fontSize: '0.85rem'
              }}
            >
              {ttsEnabled ? (
                <><Volume2 size={16} /> Enabled</>
              ) : (
                <><VolumeX size={16} /> Muted</>
              )}
            </button>
          </div>

          {/* Large Mic Toggle Button */}
          <button
            onClick={toggleRecording}
            className={`btn ${isRecording ? 'pulse-record-active' : 'btn-primary'}`}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isRecording ? '0 0 25px var(--error-glow)' : '0 8px 25px rgba(99,102,241,0.3)',
              backgroundColor: isRecording ? 'var(--error)' : 'var(--primary)',
              border: 'none'
            }}
          >
            {isRecording ? <MicOff size={32} color="#fff" /> : <Mic size={32} color="#fff" />}
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.75rem', fontWeight: '600' }}>
            {isRecording ? 'Click to Stop Recording' : 'Click to Speak Answer'}
          </span>
        </div>

        {/* Text Area & Submit Card */}
        <div className="glass-card" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Review or Edit Transcript</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {answerText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          <textarea
            className="input-field"
            placeholder="Your transcribed answer will populate here. You can also edit it or type from scratch if your mic is disabled..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            disabled={isThinking}
            rows={5}
            style={{ flex: '1', resize: 'none', fontSize: '0.95rem', lineHeight: '1.5' }}
          />

          {error && (
            <div style={{ fontSize: '0.85rem', color: '#fda4af', backgroundColor: 'rgba(244,63,94,0.1)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--error)' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
            <button
              onClick={handleSkipQuestion}
              className="btn btn-secondary"
              disabled={isThinking}
              style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem' }}
            >
              Skip Question
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={isThinking || !answerText.trim()}
              style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem', flex: '1' }}
            >
              Submit Answer <Send size={14} />
            </button>
          </div>
        </div>

        {/* Session Danger Controls */}
        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Finish Session Early?</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Analyze my progress based on answered questions.</p>
          </div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to end the interview now? You will receive evaluation on answered questions.')) {
                onEndSession();
              }
            }}
            className="btn btn-danger"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            <Square size={13} fill="#fff" /> End & Grade
          </button>
        </div>

      </div>

    </div>
  );
};

export default InterviewRoom;
