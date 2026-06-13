import React, { useState } from 'react';
import RegistrationScreen from './components/RegistrationScreen';
import TestingScreen from './components/TestingScreen';
import ResultsDashboard from './components/ResultsDashboard';
import { startSession, getResults } from './services/api';

export default function App() {
  const [screen, setScreen] = useState('registration'); // 'registration', 'testing', 'results'
  const [session, setSession] = useState(null);
  const [firstQuestion, setFirstQuestion] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(84);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async (studentName, grade, mode, apiKey) => {
    setLoading(true);
    setError('');
    try {
      const data = await startSession(studentName, grade, mode, apiKey);
      setSession({
        sessionId: data.sessionId,
        studentName: data.studentName,
        grade: data.grade,
        mode: data.mode,
        apiKey: apiKey
      });
      setFirstQuestion(data.firstQuestion);
      setTotalQuestions(data.totalQuestions);
      setScreen('testing');
    } catch (err) {
      setError(`Failed to initiate assessment: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestingComplete = async (sessionId) => {
    setLoading(true);
    setError('');
    try {
      const data = await getResults(sessionId);
      setResults(data);
      setScreen('results');
    } catch (err) {
      setError(`Failed to compile results: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = async (sessionId) => {
    setLoading(true);
    setError('');
    try {
      const data = await getResults(sessionId);
      setResults(data);
      setScreen('results');
    } catch (err) {
      setError(`Failed to load results: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setScreen('registration');
    setSession(null);
    setFirstQuestion(null);
    setResults(null);
    setError('');
  };

  return (
    <div className="app-container">
      {/* Background decoration */}
      <div className="bg-dots"></div>

      {/* Main Header */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <svg className="brain-logo" viewBox="0 0 24 24" width="36" height="36">
            <path
              fill="currentColor"
              d="M12,3c-4.97,0-9,4.03-9,9c0,2.12,0.74,4.07,1.97,5.61L4.35,19.4c-0.39,0.39-0.39,1.02,0,1.41c0.39,0.39,1.02,0.39,1.41,0l1.9-1.9C9.13,19.58,10.51,20,12,20c4.97,0,9-4.03,9-9S16.97,3,12,3z M15,16.5c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S15.83,16.5,15,16.5z M9,12c-0.83,0-1.5-0.67-1.5-1.5S8.17,9,9,9s1.5,0.67,1.5,1.5S9.83,12,9,12z M15,10.5c-0.83,0-1.5-0.67-1.5-1.5S14.17,7.5,15,7.5s1.5,0.67,1.5,1.5S15.83,10.5,15,10.5z"
            />
          </svg>
          <div>
            <h1 className="logo-title">NeuroPi</h1>
            <p className="logo-subtitle">Adaptive Intelligence Counseling Engine</p>
          </div>
        </div>
      </header>

      {/* Loading Overlay */}
      {loading && (
        <div className="modal-overlay">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '15px', color: 'var(--text)' }} className="animate-pulse">Processing request...</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="alert-box alert-danger" style={{ maxWidth: '800px', margin: '10px auto 20px' }}>
          <strong>Error: </strong> {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Screens Router */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 50px' }}>
        {screen === 'registration' && (
          <RegistrationScreen onStart={handleStart} onViewResults={handleViewResults} />
        )}
        {screen === 'testing' && session && (
          <TestingScreen
            session={session}
            firstQuestion={firstQuestion}
            totalQuestions={totalQuestions}
            onComplete={handleTestingComplete}
            onAbort={handleRestart}
          />
        )}
        {screen === 'results' && results && (
          <ResultsDashboard results={results} onRestart={handleRestart} />
        )}
      </main>
    </div>
  );
}
