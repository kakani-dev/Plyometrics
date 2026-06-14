

const FILTER_BTNS = [
  { label: "All Layers", value: "all" },
  { label: "RIASEC", value: "RIASEC Interest" },
  { label: "Big Five", value: "Big Five Personality" },
  { label: "Cognitive", value: "Cognitive Ability" },
  { label: "Emotional", value: "Emotional Profile" },
  { label: "Learning Styles", value: "Learning Style" },
];

export default function ResultsScreen({
  profile, activeTab, setActiveTab, handleRestart, handleExportJSON,
  metricFilter, setMetricFilter, filteredMetrics, setSelectedMetric,
  getStrokeDashOffset, resultsData, generatingAiReport, handleGenerateAiReport
}) {
  const bandClass = (band) =>
    band === "High" ? "text-high" : band === "Moderate" ? "text-moderate" : "text-low";

  // Dynamic getters with fallbacks
  const getGaugeValue = (title) => {
    if (!resultsData) {
      if (title === "Career Readiness") return 88;
      if (title === "RIASEC Clarity") return 75;
      if (title === "Cognitive Index") return 95;
      if (title === "Emotional Sustainability") return 68;
      return 50;
    }
    const g = resultsData.circularGauges;
    if (!g) return 50;
    if (title === "Career Readiness") return g.careerReadiness ?? g.CareerReadiness ?? 50;
    if (title === "RIASEC Clarity") return g.riasecClarity ?? g.RiasecClarity ?? 50;
    if (title === "Cognitive Index") return g.cognitiveIndex ?? g.CognitiveIndex ?? 50;
    if (title === "Emotional Sustainability") return g.emotionalSustainability ?? g.EmotionalSustainability ?? 50;
    return 50;
  };

  const getGaugeBand = (title) => {
    const val = getGaugeValue(title);
    if (val < 40) return "Low";
    if (val >= 70) return "High";
    return "Moderate";
  };

  const dynamicGauges = [
    { title: "Career Readiness", value: getGaugeValue("Career Readiness"), band: getGaugeBand("Career Readiness") },
    { title: "RIASEC Clarity", value: getGaugeValue("RIASEC Clarity"), band: getGaugeBand("RIASEC Clarity") },
    { title: "Cognitive Index", value: getGaugeValue("Cognitive Index"), band: getGaugeBand("Cognitive Index") },
    { title: "Emotional Sustainability", value: getGaugeValue("Emotional Sustainability"), band: getGaugeBand("Emotional Sustainability") },
  ];

  const dominantRiasec = resultsData?.dominantVectors?.dominantRIASEC || resultsData?.dominantVectors?.DominantRIASEC || "Realistic (R)";
  const dominantBig5 = resultsData?.dominantVectors?.dominantBig5 || resultsData?.dominantVectors?.DominantBig5 || "Conscientiousness";
  const dominantLearning = resultsData?.dominantVectors?.dominantLearning || resultsData?.dominantVectors?.DominantLearning || "Visual (V)";
  const bigFiveBalance = resultsData?.dominantVectors?.bigFiveBalance ?? resultsData?.dominantVectors?.BigFiveBalance ?? 82;
  const learningStrength = resultsData?.dominantVectors?.learningPreferenceStrength ?? resultsData?.dominantVectors?.LearningPreferenceStrength ?? 90;
  
  const recommendedStream = resultsData?.streamRecommendation?.stream || resultsData?.streamRecommendation?.Stream || "Science (PCM)";
  const streamSubjects = resultsData?.streamRecommendation?.subjects || resultsData?.streamRecommendation?.Subjects || "Physics, Chemistry, Mathematics";
  const careerFitScore = resultsData?.streamRecommendation?.careerFitScore ?? resultsData?.streamRecommendation?.CareerFitScore ?? 86;

  const alertType = resultsData?.primaryAlert?.alertType || resultsData?.primaryAlert?.AlertType || "Strong technical alignment";
  const alertDesc = resultsData?.primaryAlert?.description || resultsData?.primaryAlert?.Description || "Validity check passed. Student registers exceptional logical reasoning capacity.";
  const alertClass = resultsData?.primaryAlert?.alertClass || resultsData?.primaryAlert?.AlertClass || "alert-success";

  const counselorFocus = resultsData?.counselorRoadmap?.counselorFocus || resultsData?.counselorRoadmap?.CounselorFocus || "Strengths confirmation and growth plan";
  const permutationAction = resultsData?.counselorRoadmap?.permutationAction || resultsData?.counselorRoadmap?.PermutationAction || "Recommend pursuing Science (PCM) with Computer Science. Focus counseling on emotional coping strategies.";
  const priorities = resultsData?.counselorRoadmap?.priorities || resultsData?.counselorRoadmap?.Priorities || ["Academic Skills", "Stress Management", "Career Exploration"];

  // Local narrative sections
  const exeSummary = resultsData?.localNarrative?.executiveSummary || resultsData?.localNarrative?.ExecutiveSummary || "The candidate completed the student profiling battery. Analysis shows high analytical reasoning index with well-developed visual processing.";
  const cognitiveStrengths = resultsData?.localNarrative?.cognitiveStrengths || resultsData?.localNarrative?.CognitiveStrengths || "Demonstrates perfect logical deductive capabilities and robust visual cognitive efficiency.";
  const learningStrategy = resultsData?.localNarrative?.learningStrategy || resultsData?.localNarrative?.LearningStrategy || "High visual preference suggests utilizing diagrams, video explanations, and concept mapping.";
  const careerMapping = resultsData?.localNarrative?.careerMapping || resultsData?.localNarrative?.CareerMapping || "Academic performance index matches streams with rigorous technical foundations.";
  const counselorGuideline = resultsData?.localNarrative?.counselorGuideline || resultsData?.localNarrative?.CounselorGuideline || "Ensure balanced study routine. Promote stress management techniques.";

  return (
    <div className="screen active">
      <div className="results-layout">
        <div className="results-header glass-panel">
          <div className="student-profile-summary">
            <h2>{profile.name || "Harsh Vardhan"} - Report Card</h2>
            <p>Grade {profile.grade || "10"} | {profile.testMode === "adaptive" ? "AI-Powered Adaptive Mode" : "Compact Mode"}</p>
          </div>
          <div className="profile-code-box">
            <span className="label">Permutation Code</span>
            <span className="code">{resultsData?.profileCode || "NP-P1028"}</span>
          </div>
          <div className="action-buttons">
            <button type="button" className="btn btn-secondary" onClick={() => window.print()}>Print Report</button>
            <button type="button" className="btn btn-secondary" onClick={handleExportJSON}>Export JSON</button>
            <button type="button" className="btn btn-primary" onClick={handleRestart}>New Assessment</button>
          </div>
        </div>

        <div className="results-tabs">
          {["dashboard", "metrics", "report"].map((tab) => (
            <button key={tab} type="button"
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}>
              {tab === "dashboard" ? "Counselor Dashboard" : tab === "metrics" ? "Diagnostic Metrics (28)" : "AI Counseling Report"}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <div className="dashboard-grid">
            <div className="dashboard-card glass-panel col-span-2">
              <h3>Key Psychometric Indices</h3>
              <div className="gauges-container">
                {dynamicGauges.map((g, i) => (
                  <div key={i} className="gauge-item">
                    <div className="gauge-ring-container">
                      <svg className="gauge-ring" viewBox="0 0 100 100">
                        <circle className="gauge-ring-bg" cx="50" cy="50" r="40" />
                        <circle className="gauge-ring-progress" cx="50" cy="50" r="40"
                          strokeDasharray="251" strokeDashoffset={getStrokeDashOffset(g.value)} />
                      </svg>
                      <span className="gauge-value">{g.value}%</span>
                    </div>
                    <h4>{g.title}</h4>
                    <span className={`badge ${bandClass(g.band)}`}>{g.band}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="dashboard-card glass-panel">
              <h3>Dominant Profile Vectors</h3>
              <div className="findings-list">
                <div className="finding-item">
                  <span className="finding-label">Dominant RIASEC Group</span>
                  <span className="finding-val text-high">{dominantRiasec}</span>
                </div>
                <div className="finding-item">
                  <span className="finding-label">Dominant Big Five Trait</span>
                  <span className="finding-val text-high">{dominantBig5}</span>
                </div>
                <div className="finding-item">
                  <span className="finding-label">Learning Preference</span>
                  <span className="finding-val text-high">{dominantLearning}</span>
                </div>
                <div className="finding-item">
                  <span className="finding-label">Big Five Balance</span>
                  <span className="finding-val">{bigFiveBalance}%</span>
                </div>
                <div className="finding-item">
                  <span className="finding-label">Learning Strength</span>
                  <span className="finding-val">{learningStrength}%</span>
                </div>
                <div className="finding-item stream-row">
                  <span className="finding-label" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Recommended Stream</span>
                  <span className="finding-val text-high" style={{ fontWeight: 700 }}>{recommendedStream}</span>
                </div>
              </div>
            </div>
            <div className="dashboard-card glass-panel col-span-3">
              <div className="alert-action-section">
                <div className={`alert-box ${alertClass}`}>
                  <div className="alert-header">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M12,2L1,21h22L12,2z M12,18c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1S12.55,18,12,18z M12,14c-0.55,0-1-0.45-1-1V9c0-0.55,0.45-1,1-1s1,0.45,1,1v4C12.97,13.55,12.55,14,12,14z"/>
                    </svg>
                    <h4>Primary Alert: {alertType}</h4>
                  </div>
                  <p>{alertDesc}</p>
                </div>
                <div className="recommendations-box">
                  <h4>Counselor Action Roadmap</h4>
                  <p className="focus-title">Counselor Focus: {counselorFocus}</p>
                  <p className="focus-text">
                    {permutationAction}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "metrics" && (
          <div className="tab-content active">
            <div className="metrics-summary-controls">
              <div className="filter-group">
                {FILTER_BTNS.map((btn) => (
                  <button key={btn.value} type="button"
                    className={`filter-btn ${metricFilter === btn.value ? "active" : ""}`}
                    onClick={() => setMetricFilter(btn.value)}>{btn.label}</button>
                ))}
              </div>
              <div className="metrics-legend">
                <span><span className="legend-dot band-high" />High (&ge;70%)</span>
                <span><span className="legend-dot band-moderate" />Moderate (40-69%)</span>
                <span><span className="legend-dot band-low" />Low (&le;39%)</span>
              </div>
            </div>
            <div className="metrics-grid">
              {filteredMetrics.map((m) => {
                const band = m.band || m.Band;
                const name = m.name || m.Name || m.subdomain || m.Subdomain;
                const score = m.score ?? m.Score ?? m.score_0_100 ?? m.Score_0_100 ?? m.score0100 ?? m.Score0100;
                const layer = m.layer || m.Layer || m.domain || m.Domain;
                const bCls = band === "High" ? "band-high" : band === "Moderate" ? "band-moderate" : band === "Low" ? "band-low" : "";
                return (
                  <div key={m.id || m.Id || m.subdomain || m.Subdomain} className="metric-card glass-panel cursor-pointer hover:border-cyan-500 transition-colors"
                    style={{
                      padding: "1.25rem",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "12px",
                      background: "rgba(14, 22, 38, 0.4)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "0.5rem"
                    }}
                    onClick={() => setSelectedMetric(m)}>
                    <div className="metric-card-header">
                      <span className="metric-layer-tag">{layer}</span>
                      <span className={`badge ${bCls}`}>{band}</span>
                    </div>
                    <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-main)", margin: "0.25rem 0" }}>{name}</h4>
                    <div className="metric-score-display">
                      <span className="metric-score-num">{score}</span>
                      <span className="metric-score-pct">%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "report" && (
          <div className="report-container glass-panel">
            <div className="report-controls">
              <div className="api-key-status-indicator">
                <span className="indicator-dot" style={{ background: profile.apiKey ? "var(--color-high)" : "var(--color-low)" }} />
                <span>{profile.apiKey ? "Gemini Live Link: Configured" : "Gemini Live Link: Disabled (Local Rules)"}</span>
              </div>
              {profile.apiKey && (
                <button type="button" className="btn btn-primary" onClick={handleGenerateAiReport} disabled={generatingAiReport}>
                  {generatingAiReport ? "Synthesizing AI Summary..." : "Generate AI Counseling Report"}
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={() => window.print()}>Print PDF</button>
            </div>
            <div className="report-content">
              <div className="report-watermark">NEUROPI REPORT</div>
              <div className="report-doc-header">
                <div className="report-doc-title">
                  <h2>Student Development Intelligence Report</h2>
                  <p className="subtitle">NeuroPi Psychological and Cognitive Diagnostic Profiling</p>
                </div>
                <div className="report-doc-meta">
                  <div><strong>Student:</strong> {profile.name || "Harsh Vardhan"}</div>
                  <div><strong>Grade:</strong> {profile.grade || "10"}</div>
                  <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                  <div><strong>Code:</strong> {resultsData?.profileCode || "NP-P1028"}</div>
                </div>
              </div>
              <hr className="report-divider" />
              
              <div className="report-section">
                <h3>I. Executive Assessment Summary</h3>
                <p>{exeSummary}</p>
              </div>

              <div className="report-section">
                <h3>II. Cognitive Reasoning & Learning Profile</h3>
                <div className="report-subgrid">
                  <div className="subgrid-card">
                    <h4>Cognitive Strengths</h4>
                    <p>{cognitiveStrengths}</p>
                  </div>
                  <div className="subgrid-card">
                    <h4>Learning Strategy</h4>
                    <p>{learningStrategy}</p>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h3>III. Academic and Career Trajectory</h3>
                <div className="formula-box">
                  <span className="formula-title">Weighted Career Fit Calculation</span>
                  <span className="formula-description">Career Fit = (RIASEC × 0.35) + (Cognitive × 0.25) + (Big Five × 0.20) + (Emotional × 0.20)</span>
                  <div className="formula-values">Career Fit Index: <strong className="text-high">{careerFitScore}%</strong></div>
                </div>
                <p>{careerMapping}</p>
                <div className="stream-box">
                  <h4>Recommended Academic Stream</h4>
                  <p className="stream-title">{recommendedStream}</p>
                  <p className="stream-subjects"><strong>Core Subjects:</strong> {streamSubjects}</p>
                  <div className="stream-actions">
                    <strong>Action Plan:</strong>
                    <ul>
                      {resultsData?.streamRecommendation?.actions ? (
                        resultsData.streamRecommendation.actions.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))
                      ) : (
                        <>
                          <li>Focus on mathematical logic and physics foundations</li>
                          <li>Engage in exploratory programming exercises</li>
                          <li>Maintain structured study environment</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h3>IV. Counseling Recommendations</h3>
                <p>{counselorGuideline}</p>
                <div className="action-points-box">
                  <h4>Action Roadmap:</h4>
                  <ul className="action-list">
                    {priorities.map((p, idx) => (
                      <li key={idx}>Priority {idx + 1}: {p} interventions. Support student development in this area.</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="report-doc-footer">
                <div className="signature-line"><div className="signature-space" /><p>Counseling Director</p></div>
                <div className="signature-line"><div className="signature-space" /><p>Lead Psychologist</p></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
