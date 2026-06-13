import React, { useState, useEffect } from 'react';
import { getHistory } from '../services/api';

export default function RegistrationScreen({ onStart, onViewResults }) {
  const [studentName, setStudentName] = useState('');
  const [grade, setGrade] = useState('10');
  const [mode, setMode] = useState('adaptive');
  const [apiKey, setApiKey] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load assessment history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    onStart(studentName.trim(), grade, mode, apiKey.trim());
  };

  return (
    <div className="grid-2col gap-30">
      {/* Registration Form Panel */}
      <div className="registration-container glass-panel animate-fade-in">
        <div className="form-header">
          <div className="pulsing-glow"></div>
          <h2>Student Registration</h2>
          <p>Initialize diagnostic profile sequencing</p>
        </div>

        <form onSubmit={handleSubmit} className="reg-form">
          <div className="form-group">
            <label htmlFor="reg-name">Student Full Name</label>
            <input
              type="text"
              id="reg-name"
              placeholder="Enter student's name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
            />
          </div>

          <div className="grid-2col gap-15">
            <div className="form-group">
              <label htmlFor="reg-grade">Current Grade</label>
              <select
                id="reg-grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reg-protocol">Assessment Protocol</label>
              <select
                id="reg-protocol"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="adaptive">Computer Adaptive (CAT)</option>
                <option value="compact">Compact Template (84 Qs)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-key">
              Google Gemini API Key <span className="text-secondary">(Optional - proxy calls client-side keys)</span>
            </label>
            <input
              type="password"
              id="reg-key"
              placeholder="AI Studio API Key (for counseling report)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <small className="help-text">
              If omitted, AI report generation will check the server-side environment variables.
            </small>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            {mode === 'adaptive' ? 'Launch Adaptive Diagnostic Engine' : 'Start Full Blueprint (84 Items)'}
          </button>
        </form>
      </div>

      {/* Info & History panel */}
      <div className="info-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-panel" style={{ flex: 1 }}>
          <h3>Assessment Scope & Coverage</h3>
          <div className="coverage-list" style={{ marginTop: '15px' }}>
            <div className="coverage-item">
              <div className="coverage-icon text-high">✓</div>
              <div>
                <strong>RIASEC Vocational Interest Model</strong>
                <p>Categorizes Realistic, Investigative, Artistic, Social, Enterprising, and Conventional interests.</p>
              </div>
            </div>
            <div className="coverage-item">
              <div className="coverage-icon text-high">✓</div>
              <div>
                <strong>Cognitive Aptitude Scaling</strong>
                <p>Measures Numerical, Logic, Verbal, Abstract, and Spatial abilities dynamically.</p>
              </div>
            </div>
            <div className="coverage-item">
              <div className="coverage-icon text-high">✓</div>
              <div>
                <strong>Behavioral & Emotional Indices</strong>
                <p>Evaluates Big Five Personality, Stress, Resilience, Coping, and Sensory Learning styles.</p>
              </div>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3>Counselor Records</h3>
            <button onClick={loadHistory} className="btn" style={{ padding: '3px 10px', fontSize: '0.8rem' }}>
              Refresh
            </button>
          </div>
          <div className="history-list" style={{ overflowY: 'auto', flex: 1, maxHeight: '200px' }}>
            {loadingHistory ? (
              <p className="text-secondary text-center" style={{ padding: '15px' }}>Loading past records...</p>
            ) : history.length === 0 ? (
              <p className="text-secondary text-center" style={{ padding: '15px' }}>No completed assessments found in database.</p>
            ) : (
              history.map((session) => (
                <div
                  key={session.id}
                  className="history-row"
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => onViewResults(session.id)}
                >
                  <div>
                    <strong>{session.studentName}</strong> (Grade {session.grade})
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                      Mode: {session.mode} | Profile: {session.profileCode || 'Pending'}
                    </div>
                  </div>
                  <span className="badge badge-high" style={{ fontSize: '0.7rem' }}>View</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
