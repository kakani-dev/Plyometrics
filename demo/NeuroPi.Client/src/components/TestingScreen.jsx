import React, { useState, useEffect, useRef } from 'react';
import { submitAnswer, populateMockDemo } from '../services/api';

export default function TestingScreen({ session, firstQuestion, totalQuestions, onComplete, onAbort }) {
  const [currentQuestion, setCurrentQuestion] = useState(firstQuestion);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [validityFails, setValidityFails] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [logs, setLogs] = useState([]);
  
  // Track cognitive difficulty per subdomain locally for logging
  const [cognitiveDifficulty, setCognitiveDifficulty] = useState({
    Numerical: 'Medium',
    Logic: 'Medium',
    Verbal: 'Medium',
    Abstract: 'Medium',
    Spatial: 'Medium',
  });

  const timerRef = useRef(null);
  const logEndRef = useRef(null);

  // Initialize timer
  useEffect(() => {
    startTimer();
    addLog(`[SYS] Adaptive diagnostics engine initialized. Student: ${session.studentName}`, 'success');
    if (session.mode === 'adaptive') {
      addLog(`[CAT] Selected starting difficulty: Medium for all cognitive modules.`, 'info');
    }
    
    // Log the first question details
    logQuestionServe(firstQuestion);

    return () => stopTimer();
  }, []);

  // Log question serve details
  const logQuestionServe = (q) => {
    if (!q) return;
    if (q["Domain"] === 'Validity & Readiness') {
      addLog(`[SYS] Injected attention-validity check item (QID: ${q["QID"]}).`, 'warning');
    } else {
      const diffStr = q["Domain"] === 'Cognitive Ability' 
        ? `Difficulty: ${cognitiveDifficulty[q["Subdomain"]] || 'Medium'}` 
        : 'Likert scale';
      addLog(`[CAT] Serving subdomain: ${q["Subdomain"]} | ${diffStr} (QID: ${q["QID"]})`, 'info');
    }
  };

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const startTimer = () => {
    stopTimer();
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const addLog = (text, type = 'default') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { text, type, timestamp }]);
  };

  const handleAnswer = async (responseValue) => {
    stopTimer();
    const qTime = seconds;
    const q = currentQuestion;

    addLog(`[USER] Logged response "${responseValue}" in ${qTime}s for ${q["Subdomain"]}`, 'default');

    try {
      const data = await submitAnswer(session.sessionId, q["QID"], responseValue, qTime);
      
      // Update counts
      setAnsweredCount((prev) => prev + 1);

      if (session.mode === 'adaptive') {
        // Log adaptive branching logic transitions based on response
        if (q["Domain"] === 'Validity & Readiness') {
          // Check validity pass/fail
          let failed = false;
          if (q["QID"] === 'AQ082' || q["QID"] === 'NPI0516' || q["QID"] === 'NPI0517') {
            if (parseInt(responseValue) < 4) failed = true;
          } else if (q["QID"] === 'AQ084' || q["QID"] === 'NPI0518' || q["QID"] === 'NPI0519') {
            if (parseInt(responseValue) > 2) failed = true;
          }
          if (failed) {
            setValidityFails((prev) => prev + 1);
            addLog(`[SYS] Attention check flagged (Failed consistency verification).`, 'danger');
          } else {
            addLog(`[SYS] Attention check verified successfully.`, 'success');
          }
        } else if (q["Domain"] === 'Cognitive Ability') {
          // Adjust cognitive difficulty log
          const isCorrect = responseValue.toUpperCase() === q["Correct/Key"].toUpperCase();
          const currentDiff = cognitiveDifficulty[q["Subdomain"]] || 'Medium';
          let nextDiff = currentDiff;
          
          if (isCorrect) {
            addLog(`[CAT] Question correct.`, 'success');
            if (currentDiff === 'Medium') nextDiff = 'Hard';
            else if (currentDiff === 'Easy') nextDiff = 'Medium';
          } else {
            addLog(`[CAT] Question incorrect (Expected: ${q["Correct/Key"]}).`, 'danger');
            if (currentDiff === 'Medium') nextDiff = 'Easy';
            else if (currentDiff === 'Hard') nextDiff = 'Medium';
          }

          if (nextDiff !== currentDiff) {
            setCognitiveDifficulty((prev) => ({ ...prev, [q["Subdomain"]]: nextDiff }));
            addLog(`[CAT] Adjusting dynamic difficulty for ${q["Subdomain"]}: ${currentDiff} -> ${nextDiff}`, 'warning');
          }
        }
      }

      if (data.isCompleted) {
        addLog(`[SYS] Diagnostics completed. Compiling final metrics.`, 'success');
        stopTimer();
        onComplete(session.sessionId);
      } else {
        // Check if a question was saved (bypassed) by comparing QID jumps or count
        // In adaptive mode, the backend moves to next metric if consistent
        const nextQ = data.nextQuestion;
        if (nextQ && q["Domain"] !== 'Validity & Readiness' && nextQ["Domain"] !== 'Validity & Readiness') {
          if (nextQ["Subdomain"] !== q["Subdomain"]) {
            // We moved to a new subdomain. Check if we answered less than 3 questions.
            // If so, we bypassed the 3rd question!
            // In a real session, if we answered 2 questions and move to next, we saved 1.
            // Let's check how many questions we asked in this subdomain
            // (We can simulate this or read it from the backend if needed, but simple local tracking works)
          }
        }

        setCurrentQuestion(nextQ);
        logQuestionServe(nextQ);
        startTimer();
      }
    } catch (err) {
      addLog(`[ERR] Failed to submit answer: ${err.message}`, 'danger');
      startTimer();
    }
  };

  const handleDemoMock = async () => {
    if (!window.confirm('Simulate all remaining responses and generate results instantly?')) return;
    stopTimer();
    addLog(`[SYS] Demoware bypass triggered. Simulating responses...`, 'warning');
    try {
      await populateMockDemo(session.sessionId);
      addLog(`[SYS] Simulation complete. Compiling counselor dashboard.`, 'success');
      onComplete(session.sessionId);
    } catch (err) {
      addLog(`[ERR] Mock failed: ${err.message}`, 'danger');
      startTimer();
    }
  };

  const getProgressPercentage = () => {
    return Math.min(100, Math.round((answeredCount / totalQuestions) * 100));
  };

  // Timing Hesitation warnings
  const isHesitating = () => {
    if (!currentQuestion) return false;
    if (currentQuestion["Question Type"] === 'Likert') {
      return seconds > 18;
    } else {
      return seconds > 45;
    }
  };

  return (
    <div className={session.mode === 'adaptive' ? 'grid-2col gap-30' : 'single-col'}>
      {/* Test Card Container */}
      <div className="glass-panel test-session-card animate-fade-in">
        {/* Progress header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <span className="badge" style={{ textTransform: 'uppercase' }}>
              {currentQuestion?.["Domain"]}
            </span>
            <h3 style={{ marginTop: '5px' }}>{currentQuestion?.["Subdomain"]}</h3>
          </div>
          <div className="text-right">
            <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
              Progress: {answeredCount} / {totalQuestions} items
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-bg" style={{ marginBottom: '20px' }}>
          <div 
            className="progress-bar-fill" 
            style={{ width: `${getProgressPercentage()}%`, transition: 'width 0.3s ease' }}
          ></div>
        </div>

        {/* Question Text */}
        <div className="question-content" style={{ minHeight: '150px', margin: '20px 0' }}>
          {currentQuestion?.["Trait/Code"] && (
            <span className="text-secondary" style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Trait Code: {currentQuestion["Trait/Code"]}
            </span>
          )}
          <h2 style={{ marginTop: '5px', fontWeight: '500', lineHeight: '1.4' }}>
            {currentQuestion?.["Question"]}
          </h2>
        </div>

        {/* Options Selection */}
        <div className="options-container" style={{ margin: '30px 0' }}>
          {currentQuestion?.["Question Type"] === 'Likert' ? (
            <div className="likert-wrapper">
              <div className="likert-labels">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
              </div>
              <div className="likert-scale">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    className="likert-btn"
                    onClick={() => handleAnswer(val.ToString || String(val))}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mcq-grid">
              {['A', 'B', 'C', 'D'].map((letter) => {
                const optText = currentQuestion?.[`Option ${letter}`];
                if (!optText) return null;
                return (
                  <button
                    key={letter}
                    className="mcq-option"
                    onClick={() => handleAnswer(letter)}
                  >
                    <span className="mcq-letter">{letter}</span>
                    <span className="mcq-text">{optText}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info: Timer & warnings */}
        <div 
          className={`timer-footer ${isHesitating() ? 'warning-flash' : ''}`}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            borderTop: '1px solid var(--border)',
            paddingTop: '15px',
            marginTop: '20px'
          }}
        >
          <div>
            <span className="text-secondary">Time Spent: </span>
            <strong className={isHesitating() ? 'text-low' : ''}>{seconds} seconds</strong>
            {isHesitating() && (
              <span className="text-low" style={{ marginLeft: '10px', fontSize: '0.85rem' }}>
                ⚠️ Hesitation threshold exceeded
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleDemoMock} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
              Populate Demo Data
            </button>
            <button onClick={onAbort} className="btn btn-danger" style={{ padding: '6px 12px' }}>
              Abort Test
            </button>
          </div>
        </div>
      </div>

      {/* Adaptive Brain Log Console */}
      {session.mode === 'adaptive' && (
        <div className="glass-panel console-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3>Adaptive Engine Brain Visualizer</h3>
          <div className="console-stats" style={{ margin: '15px 0', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div className="console-stat-box">
              <span className="stat-label">Validity Fails</span>
              <strong className={`stat-val ${validityFails >= 2 ? 'text-low' : 'text-high'}`}>
                {validityFails}
              </strong>
            </div>
            <div className="console-stat-box">
              <span className="stat-label">Bypassed Items</span>
              <strong className="stat-val text-high">{savedCount}</strong>
            </div>
          </div>

          <div className="console-log-box" style={{ height: '320px', background: '#0a0d16', borderRadius: '8px', padding: '15px', fontFamily: 'monospace', fontSize: '0.85rem', overflowY: 'auto' }}>
            {logs.map((log, idx) => (
              <div key={idx} className={`console-line log-${log.type}`} style={{ marginBottom: '8px', lineHeight: '1.4' }}>
                <span className="log-time" style={{ color: '#5b6375', marginRight: '8px' }}>[{log.timestamp}]</span>
                <span className="log-text">{log.text}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}
