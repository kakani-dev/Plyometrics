import React, { useState } from 'react';
import CircularGauge from './CircularGauge';
import { generateAiReport } from '../services/api';

export default function ResultsDashboard({ results, onRestart }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubdomain, setSelectedSubdomain] = useState(null);
  const [aiReportText, setAiReportText] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [generationSource, setGenerationSource] = useState('');
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(null);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    setGenerationSuccess(null);
    try {
      const data = await generateAiReport(results.sessionId, customApiKey || results.apiKey);
      setAiReportText(data.reportText);
      setGenerationSource(data.source);
      setIsAiGenerated(data.isAiGenerated);
      setGenerationSuccess(true);
    } catch (err) {
      setAiReportText(`Failed to generate counseling report: ${err.message}`);
      setGenerationSource('Error');
      setIsAiGenerated(false);
      setGenerationSuccess(false);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const parseAiReportSections = (text) => {
    if (!text) return null;

    const sections = {
      sec1: '',
      sec2: '',
      sec3: '',
      sec4: '',
    };

    const s1Index = text.indexOf('[SECTION 1]');
    const s2Index = text.indexOf('[SECTION 2]');
    const s3Index = text.indexOf('[SECTION 3]');
    const s4Index = text.indexOf('[SECTION 4]');

    if (s1Index !== -1 && s2Index !== -1) {
      sections.sec1 = text.substring(s1Index + 11, s2Index).trim();
    }
    if (s2Index !== -1 && s3Index !== -1) {
      sections.sec2 = text.substring(s2Index + 11, s3Index).trim();
    }
    if (s3Index !== -1 && s4Index !== -1) {
      sections.sec3 = text.substring(s3Index + 11, s4Index).trim();
    }
    if (s4Index !== -1) {
      sections.sec4 = text.substring(s4Index + 11).trim();
    }

    // If parsing failed to find markers, return fallback split by double newlines
    if (!sections.sec1 && !sections.sec2) {
      const paras = text.split('\n\n').filter(p => p.trim().length > 20);
      return {
        sec1: paras[0] || '',
        sec2: paras[1] || '',
        sec3: paras[2] || '',
        sec4: paras.slice(3).join('\n\n') || '',
      };
    }

    return sections;
  };

  const reportSections = parseAiReportSections(aiReportText);

  // Filter audit responses for modal
  const getSubdomainResponses = (subdomainName) => {
    return results.auditResponses.filter(
      (r) => r.subdomain.toLowerCase() === subdomainName.toLowerCase()
    );
  };

  return (
    <div className="results-container animate-fade-in">
      {/* Results Header */}
      <div className="results-header glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '15px 25px' }}>
        <div>
          <span className="text-secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
            Diagnostic Profile: {results.profileCode}
          </span>
          <h2 style={{ marginTop: '3px' }}>Counselor Dashboard — {results.studentName}</h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
            Grade {results.grade} • Protocol: {results.mode === 'compact' ? 'Compact Blueprint' : 'Computer Adaptive (CAT)'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '8px 16px' }}>
            Print Report
          </button>
          <button onClick={onRestart} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
            Restart Assessment
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-container" style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Counselor Summary
        </button>
        <button
          className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          Diagnostic Metrics ({results.metrics.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          AI Counseling Report
        </button>
      </div>

      {/* Tab 1: Dashboard Summary */}
      {activeTab === 'dashboard' && (
        <div className="grid-2col gap-25">
          {/* Left panel: circular progress gauges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel">
              <h3 style={{ marginBottom: '20px' }}>Key Psychometric Indices</h3>
              <div className="gauges-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <CircularGauge value={results.circularGauges.careerReadiness} label="Career Readiness" />
                <CircularGauge value={results.circularGauges.riasecClarity} label="RIASEC Clarity" />
                <CircularGauge value={results.circularGauges.cognitiveIndex} label="Cognitive Index" />
                <CircularGauge value={results.circularGauges.emotionalSustainability} label="Emotional Sustainability" />
              </div>
            </div>

            {/* Alert Panel */}
            <div className={`alert-box glass-panel ${results.primaryAlert.alertClass}`}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ fontSize: '1.8rem' }}>
                  {results.primaryAlert.alertClass === 'alert-danger' ? '🚨' : results.primaryAlert.alertClass === 'alert-warning' ? '⚠️' : '✅'}
                </div>
                <div>
                  <h4 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {results.primaryAlert.alertType}
                  </h4>
                  <p style={{ marginTop: '5px', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    {results.primaryAlert.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: CBSE recommendations and Counselor actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Stream Recommendation */}
            <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
              <div className="pulsing-glow" style={{ opacity: 0.1 }}></div>
              <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                Recommended CBSE Stream
              </span>
              <h2 style={{ marginTop: '5px', color: 'var(--primary)' }}>
                {results.streamRecommendation.stream}
              </h2>
              <div style={{ margin: '15px 0', padding: '10px 15px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '3px solid var(--primary)' }}>
                <strong>Key Subjects: </strong>
                <span className="text-secondary">{results.streamRecommendation.subjects}</span>
              </div>
              <h4 style={{ marginBottom: '8px' }}>Action Roadmap:</h4>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.streamRecommendation.actions.map((act, idx) => (
                  <li key={idx} className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                    {act}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                <span>Career Stream Fit Affinity:</span>
                <span className="badge badge-high" style={{ fontSize: '0.9rem', padding: '4px 10px' }}>
                  {results.streamRecommendation.careerFitScore}%
                </span>
              </div>
            </div>

            {/* Counselor Action Guide */}
            <div className="glass-panel">
              <h3>Counseling Guidance & Action Plan</h3>
              <div style={{ marginTop: '15px' }}>
                <strong>Counselor Focus: </strong>
                <p className="text-secondary" style={{ marginTop: '3px', marginBottom: '15px' }}>
                  {results.counselorRoadmap.counselorFocus}
                </p>
                
                <strong>Recommended Classroom Intervention: </strong>
                <p className="text-secondary" style={{ marginTop: '3px', marginBottom: '15px', lineHeight: '1.4' }}>
                  {results.counselorRoadmap.permutationAction}
                </p>

                <strong>Action Priorities: </strong>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '5px' }}>
                  {results.counselorRoadmap.priorities.map((tag, idx) => (
                    <span key={idx} className="badge badge-moderate" style={{ textTransform: 'capitalize' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Subdomain Cards Grid */}
      {activeTab === 'metrics' && (
        <div>
          <div style={{ marginBottom: '15px' }}>
            <p className="text-secondary">Click on any subdomain card below to view the detailed item-by-item question response audit.</p>
          </div>
          <div className="metrics-grid">
            {results.metrics.map((m) => {
              let cardClass = 'metric-card glass-panel';
              let statusLabel = 'OK';
              let statusClass = 'text-high';

              if (m.flag === 'Support Needed') {
                cardClass += ' flag-alert';
                statusLabel = 'Support Needed';
                statusClass = 'text-low';
              } else if (m.flag === 'Timing Review') {
                cardClass += ' flag-warning';
                statusLabel = 'Timing Review';
                statusClass = 'text-moderate';
              }

              return (
                <div
                  key={m.subdomain}
                  className={cardClass}
                  onClick={() => setSelectedSubdomain(m)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        {m.domain}
                      </span>
                      <h4 style={{ marginTop: '3px' }}>
                        {m.subdomain} ({m.code})
                      </h4>
                    </div>
                    <span className="metric-score-value">{m.score0100}%</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '15px 0' }}>
                    <div className="console-stat-box">
                      <span className="stat-label">Band</span>
                      <strong style={{ fontSize: '0.9rem' }}>{m.band}</strong>
                    </div>
                    <div className="console-stat-box">
                      <span className="stat-label">Avg Time</span>
                      <strong style={{ fontSize: '0.9rem' }}>{m.avgTime}s</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '10px', fontSize: '0.8rem' }}>
                    <span>Status:</span>
                    <strong className={statusClass}>{statusLabel}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: AI Counseling Report */}
      {activeTab === 'report' && (
        <div className="glass-panel" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div>
            <h3>AI-Synthesized Counseling Report</h3>
            <p className="text-secondary" style={{ marginTop: '5px' }}>
              Utilizes Gemini AI Models to generate a detailed, structured counselor narrative. In case of quota limitations, it falls back to a high-fidelity offline psychometric rules engine.
            </p>
          </div>

          {!aiReportText && !generatingReport && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', margin: '30px auto', width: '100%' }}>
              <div className="form-group">
                <label>Gemini API Key override (optional)</label>
                <input
                  type="password"
                  placeholder="Enter API key or leave empty to use server configuration"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                />
              </div>
              <button onClick={handleGenerateReport} className="btn btn-primary btn-block" style={{ padding: '12px' }}>
                Generate AI Counsel Report
              </button>
            </div>
          )}

          {generatingReport && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '60px 0' }}>
              <div className="loading-spinner"></div>
              <p className="text-secondary animate-pulse">Running psychometric logic rules and requesting Gemini API synthesis...</p>
            </div>
          )}

          {aiReportText && !generatingReport && (
            <div className="ai-report-view printable-report" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '30px', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
              
              {/* API and Data Status Indicators */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px 20px', 
                  borderRadius: '6px', 
                  marginBottom: '25px', 
                  background: isAiGenerated ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                  border: `1px solid ${isAiGenerated ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                  fontSize: '0.9rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{isAiGenerated ? '✨' : '⚙️'}</span>
                  <div>
                    <strong>Engine / Source:</strong>{' '}
                    <span style={{ color: isAiGenerated ? '#10b981' : '#ff9800', fontWeight: 'bold' }}>
                      {generationSource}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', fontWeight: 'bold' }}>
                    {isAiGenerated ? 'LIVE API REQUEST' : 'OFFLINE MODE'}
                  </span>
                  <span style={{ color: generationSuccess ? '#10b981' : '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: generationSuccess ? '#10b981' : '#ef4444' }}></span>
                    {generationSuccess ? 'Data Received' : 'No Data Received'}
                  </span>
                </div>
              </div>

              <div className="watermark">OFFICIAL REPORT</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: '15px', marginBottom: '30px' }}>
                <div>
                  <h2 style={{ color: 'var(--primary)', letterSpacing: '0.5px' }}>NeuroPi Developmental Intelligence Profile</h2>
                  <p className="text-secondary" style={{ marginTop: '3px' }}>Counselor Evaluation Report</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>Report Ref:</strong> {results.profileCode} <br />
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Demographics Summary */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '0.9rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Student Name:</td>
                    <td style={{ padding: '8px 0' }}>{results.studentName}</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Current Grade:</td>
                    <td style={{ padding: '8px 0' }}>Grade {results.grade}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Career Stream fit:</td>
                    <td style={{ padding: '8px 0' }}>{results.streamRecommendation.stream}</td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Assoc Code:</td>
                    <td style={{ padding: '8px 0' }}>{results.profileCode}</td>
                  </tr>
                </tbody>
              </table>

              {reportSections ? (
                <div className="report-sections-content">
                  <div className="report-section" style={{ marginBottom: '25px' }}>
                    <h3 className="section-title" style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '5px', marginBottom: '10px' }}>
                      I. Executive Summary & Holistic Analysis
                    </h3>
                    <p style={{ lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-line' }} className="text-secondary">
                      {reportSections.sec1}
                    </p>
                  </div>

                  <div className="report-section" style={{ marginBottom: '25px' }}>
                    <h3 className="section-title" style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '5px', marginBottom: '10px' }}>
                      II. Cognitive Profile & Learning Modality Synthesis
                    </h3>
                    <p style={{ lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-line' }} className="text-secondary">
                      {reportSections.sec2}
                    </p>
                  </div>

                  <div className="report-section" style={{ marginBottom: '25px' }}>
                    <h3 className="section-title" style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '5px', marginBottom: '10px' }}>
                      III. Academic Stream & Career Mapping Trajectory
                    </h3>
                    <p style={{ lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-line' }} className="text-secondary">
                      {reportSections.sec3}
                    </p>
                  </div>

                  <div className="report-section" style={{ marginBottom: '40px' }}>
                    <h3 className="section-title" style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '5px', marginBottom: '10px' }}>
                      IV. Guided Counselor Interventions & Action Plans
                    </h3>
                    <p style={{ lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-line' }} className="text-secondary">
                      {reportSections.sec4}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="raw-report-content">
                  <p style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>{aiReportText}</p>
                </div>
              )}

              {/* Signatures */}
              <div className="signature-block" style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', paddingTop: '30px', borderTop: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid var(--border)', width: '200px', height: '40px' }}></div>
                  <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>Lead Psychometric Analyst</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid var(--border)', width: '200px', height: '40px' }}></div>
                  <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>Guidance Counselor Signature</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subdomain Response Audit Modal */}
      {selectedSubdomain && (
        <div className="modal-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '800px', width: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <div>
                <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Domain: {selectedSubdomain.domain}
                </span>
                <h3>{selectedSubdomain.subdomain} ({selectedSubdomain.code}) Response Audit</h3>
              </div>
              <button onClick={() => setSelectedSubdomain(null)} className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                Close
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
                <div className="console-stat-box">
                  <span className="stat-label">Metric Score</span>
                  <strong style={{ fontSize: '1.1rem' }}>{selectedSubdomain.score0100}%</strong>
                </div>
                <div className="console-stat-box">
                  <span className="stat-label">Assessed Band</span>
                  <strong style={{ fontSize: '1.1rem' }}>{selectedSubdomain.band}</strong>
                </div>
                <div className="console-stat-box">
                  <span className="stat-label">High Time Flags</span>
                  <strong style={{ fontSize: '1.1rem' }}>{selectedSubdomain.highTimeCount}</strong>
                </div>
              </div>

              <div style={{ marginBottom: '20px', padding: '10px 15px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '3px solid var(--primary)' }}>
                <strong>Metric Interpretation: </strong>
                <p className="text-secondary" style={{ marginTop: '5px', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  {selectedSubdomain.interpretation}
                </p>
              </div>

              <h4>Question Details & Responses</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 4px' }}>QID</th>
                    <th style={{ padding: '8px 4px' }}>Type</th>
                    {selectedSubdomain.domain === 'Cognitive Ability' && <th style={{ padding: '8px 4px' }}>Diff</th>}
                    <th style={{ padding: '8px 4px' }}>Answer Given</th>
                    {selectedSubdomain.domain === 'Cognitive Ability' && <th style={{ padding: '8px 4px' }}>Correct Key</th>}
                    <th style={{ padding: '8px 4px' }}>Time Spent</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {getSubdomainResponses(selectedSubdomain.subdomain).length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '15px', textAlign: 'center' }} className="text-secondary">
                        No response details available for this subdomain (skipped in CAT branching).
                      </td>
                    </tr>
                  ) : (
                    getSubdomainResponses(selectedSubdomain.subdomain).map((r, idx) => {
                      const isCognitive = selectedSubdomain.domain === 'Cognitive Ability';
                      const isMCQCorrect = isCognitive && r.responseValue.toUpperCase() === r.correctKey.toUpperCase();
                      const scoreVal = isCognitive 
                        ? (isMCQCorrect ? 100 : 0)
                        : Math.round(((r.reverseScored ? (6 - parseInt(r.responseValue)) : parseInt(r.responseValue)) - 1) / 4 * 100);

                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 4px' }}>{r.qid}</td>
                          <td style={{ padding: '8px 4px' }}>{r.questionType}</td>
                          {isCognitive && <td style={{ padding: '8px 4px' }}>{r.difficulty}</td>}
                          <td style={{ padding: '8px 4px', fontWeight: 'bold' }}>
                            {r.responseValue} {r.reverseScored && '(Rev)'}
                          </td>
                          {isCognitive && <td style={{ padding: '8px 4px' }}>{r.correctKey}</td>}
                          <td style={{ padding: '8px 4px' }}>{r.timeSec}s</td>
                          <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 'bold' }} className={scoreVal >= 70 ? 'text-high' : scoreVal >= 40 ? 'text-moderate' : 'text-low'}>
                            {scoreVal}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
