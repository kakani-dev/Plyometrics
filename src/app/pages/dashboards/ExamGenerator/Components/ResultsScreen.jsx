
export default function ResultsScreen({
  profile,
  activeTab,
  setActiveTab,
  handleRestart,
  handleExportJSON,
  metricFilter,
  setMetricFilter,
  filteredMetrics,
  setSelectedMetric,
  getStrokeDashOffset
}) {
  return (
    <section id="screen-results" className="screen active">
      <div className="results-layout">
        <div className="results-header glass-panel">
          <div className="student-profile-summary">
            <h2>{profile.name || "Harsh Vardhan"} - Report Card</h2>
            <p>Grade {profile.grade || "10"} | {profile.testMode === "adaptive" ? "AI-Powered Adaptive Mode" : "Compact baseline mode"}</p>
          </div>
          <div className="profile-code-box">
            <span className="label">Permutation Code</span>
            <span className="code">NP-P1028</span>
          </div>
          <div className="action-buttons">
            <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
              Print Full Report
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleExportJSON}>
              Export Raw JSON Data
            </button>
            <button type="button" className="btn btn-primary" onClick={handleRestart}>
              New Assessment
            </button>
          </div>
        </div>

        <div className="results-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Counselor Dashboard
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "metrics" ? "active" : ""}`}
            onClick={() => setActiveTab("metrics")}
          >
            Diagnostic Metrics (28)
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "report" ? "active" : ""}`}
            onClick={() => setActiveTab("report")}
          >
            AI Counseling Report
          </button>
        </div>

        {/* Tab: Dashboard */}
        {activeTab === "dashboard" && (
          <div className="tab-content active">
            <div className="dashboard-grid">
              {/* Left Panel: Composite Gauges */}
              <div className="dashboard-card glass-panel col-span-2">
                <h3>Key Psychometric Indices</h3>
                <div className="gauges-container">
                  {[
                    { title: "Career Readiness", value: 88, offset: getStrokeDashOffset(88), band: "High" },
                    { title: "RIASEC Clarity", value: 75, offset: getStrokeDashOffset(75), band: "High" },
                    { title: "Cognitive Index", value: 95, offset: getStrokeDashOffset(95), band: "High" },
                    { title: "Emotional Sustainability", value: 68, offset: getStrokeDashOffset(68), band: "Moderate" }
                  ].map((g, idx) => (
                    <div className="gauge-item" key={idx}>
                      <div className="gauge-ring-container">
                        <svg className="gauge-ring" viewBox="0 0 100 100">
                          <circle className="gauge-ring-bg" cx="50" cy="50" r="40"></circle>
                          <circle
                            className="gauge-ring-progress"
                            cx="50"
                            cy="50"
                            r="40"
                            strokeDasharray="251"
                            strokeDashoffset={g.offset}
                          ></circle>
                        </svg>
                        <span className="gauge-value">{g.value}%</span>
                      </div>
                      <h4>{g.title}</h4>
                      <span className={`badge ${g.band === "High" ? "text-emerald" : "text-moderate"}`}>{g.band}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel: Core Findings */}
              <div className="dashboard-card glass-panel">
                <h3>Dominant Profile Vectors</h3>
                <div className="findings-list">
                  <div className="finding-item">
                    <span className="finding-label">Dominant RIASEC Group</span>
                    <span className="finding-val text-emerald">Realistic (R)</span>
                  </div>
                  <div className="finding-item">
                    <span className="finding-label">Dominant Big Five Trait</span>
                    <span className="finding-val text-emerald">Conscientiousness</span>
                  </div>
                  <div className="finding-item">
                    <span className="finding-label">Learning Preference</span>
                    <span className="finding-val text-emerald">Visual (V)</span>
                  </div>
                  <div className="finding-item">
                    <span className="finding-label">Big Five Behavioral Balance</span>
                    <span className="finding-val">82%</span>
                  </div>
                  <div className="finding-item">
                    <span className="finding-label">Learning Preference Strength</span>
                    <span className="finding-val">90%</span>
                  </div>
                  <div className="finding-item" style={{ borderTop: "1px solid rgba(6, 182, 212, 0.2)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                    <span className="finding-label" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Recommended Stream</span>
                    <span className="finding-val text-emerald" style={{ fontWeight: 700 }}>Science (PCM)</span>
                  </div>
                </div>
              </div>

              {/* Full Width Alerts and Counselor Recommendations */}
              <div className="dashboard-card glass-panel col-span-3">
                <div className="alert-action-section">
                  <div className="alert-box alert-warning">
                    <div className="alert-header">
                      <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M12,2L1,21h22L12,2z M12,18c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1S12.55,18,12,18z M12,14c-0.55,0-1-0.45-1-1V9c0-0.55,0.45-1,1-1s1,0.45,1,1v4C12.97,13.55,12.55,14,12,14z"/>
                      </svg>
                      <h4>Primary Alert: Strong technical alignment, check stress resilience</h4>
                    </div>
                    <p>Validity check passed. Student registers exceptional logical reasoning capacity but shows slightly elevated academic pressure response during timing checks.</p>
                  </div>
                  <div className="recommendations-box">
                    <h4>Counselor Action Roadmap</h4>
                    <p className="focus-title">Counselor Focus: Strengths confirmation and growth plan</p>
                    <p className="focus-text">
                      Recommend pursuing Science (Physics, Chemistry, Mathematics) with elective focuses in Computer Science. Focus counseling sessions on emotional coping strategies and time management to buffer academic load.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Diagnostic Metrics */}
        {activeTab === "metrics" && (
          <div className="tab-content active">
            <div className="metrics-summary-controls">
              <div className="filter-group">
                {[
                  { label: "All Layers", value: "all" },
                  { label: "RIASEC", value: "RIASEC Interest" },
                  { label: "Big Five", value: "Big Five Personality" },
                  { label: "Cognitive", value: "Cognitive Ability" },
                  { label: "Emotional", value: "Emotional Profile" },
                  { label: "Learning Styles", value: "Learning Style" }
                ].map((btn) => (
                  <button
                    key={btn.value}
                    type="button"
                    className={`filter-btn ${metricFilter === btn.value ? "active" : ""}`}
                    onClick={() => setMetricFilter(btn.value)}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <div className="metrics-legend">
                <span className="legend-item"><span className="legend-dot band-high"></span>High (&ge;70%)</span>
                <span className="legend-item"><span className="legend-dot band-moderate"></span>Moderate (40-69%)</span>
                <span className="legend-item"><span className="legend-dot band-low"></span>Low (&le;39%)</span>
              </div>
            </div>

            <div className="metrics-grid">
              {filteredMetrics.map((m) => (
                <div
                  key={m.id}
                  className="metric-card glass-panel cursor-pointer hover:border-cyan-500 transition-colors"
                  onClick={() => setSelectedMetric(m)}
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
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{m.layer}</span>
                    <span className={`badge ${m.band === "High" ? "band-high" : m.band === "Moderate" ? "band-moderate" : "band-low"}`} style={{
                      background: m.band === "High" ? "rgba(16, 185, 129, 0.1)" : m.band === "Moderate" ? "rgba(245, 158, 11, 0.1)" : "rgba(244, 63, 94, 0.1)",
                      color: m.band === "High" ? "var(--color-high)" : m.band === "Moderate" ? "var(--color-moderate)" : "var(--color-low)",
                      padding: "0.1rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: "bold"
                    }}>
                      {m.band}
                    </span>
                  </div>
                  <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-main)", margin: "0.25rem 0" }}>{m.name}</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.25rem" }}>
                    <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{
                        width: `${m.score}%`,
                        height: "100%",
                        background: m.band === "High" ? "var(--color-high)" : m.band === "Moderate" ? "var(--color-moderate)" : "var(--color-low)"
                      }}></div>
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--color-text-main)", minWidth: "2rem", textAlign: "right" }}>{m.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: AI Report */}
        {activeTab === "report" && (
          <div className="tab-content active">
            <div className="report-container glass-panel">
              <div className="report-controls">
                <div className="api-key-status-indicator">
                  <span className="indicator-dot" style={{ background: profile.apiKey ? "var(--color-high)" : "var(--color-low)" }}></span>
                  <span className="indicator-text">
                    {profile.apiKey ? "Gemini Live Link: Configured" : "Gemini Live Link: Disabled (Local Rules Matched)"}
                  </span>
                </div>
                <div className="report-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
                    Print PDF
                  </button>
                </div>
              </div>

              <div className="report-content" id="report-printable-area">
                <div className="report-watermark">NEUROPI REPORT</div>
                <div className="report-doc-header">
                  <div className="report-doc-title">
                    <h2>Student Development Intelligence Report</h2>
                    <p className="subtitle">NeuroPi Psychological and Cognitive Diagnostic Profiling</p>
                  </div>
                  <div className="report-doc-meta">
                    <div className="meta-row"><strong>Student Name:</strong> <span>{profile.name || "Harsh Vardhan"}</span></div>
                    <div className="meta-row"><strong>Grade:</strong> <span>Grade {profile.grade || "10"}</span></div>
                    <div className="meta-row"><strong>Assessment Date:</strong> <span>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                    <div className="meta-row"><strong>Permutation Code:</strong> <span>NP-P1028</span></div>
                  </div>
                </div>

                <hr className="report-divider" />

                <div className="report-section">
                  <h3>I. Executive Assessment Summary</h3>
                  <p>
                    The candidate {profile.name || "Harsh Vardhan"} completed the student profiling battery. Analysis shows high analytical reasoning index accompanied by well-developed visual processing. RIASEC patterns indicate a strong primary Realistic interest profile, suggesting high compatibility with applied systems and scientific streams.
                  </p>
                </div>

                <div className="report-section">
                  <h3>II. Cognitive Reasoning & Sensory Learning Profile</h3>
                  <div className="report-subgrid">
                    <div className="subgrid-card">
                      <h4>Cognitive Strengths</h4>
                      <p>
                        Evaluated abstract patterns demonstrate perfect logical deductive capabilities. Displays robust visual cognitive efficiency, helping process structural and quantitative models swiftly.
                      </p>
                    </div>
                    <div className="subgrid-card">
                      <h4>Pedagogical & Learning Strategy</h4>
                      <p>
                        High visual preference suggests utilizing diagrams, video explanations, and concept mapping for study materials. Incorporate interactive worksheets to optimize retention.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="report-section">
                  <h3>III. Academic and Career Trajectory Mapping</h3>
                  <div className="formula-box">
                    <span className="formula-title">Weighted Career Fit Calculation</span>
                    <span className="formula-description">Career Fit = (RIASEC Interest × 0.35) + (Cognitive Capacity × 0.25) + (Big Five Adaptation × 0.20) + (Emotional Stamina × 0.20)</span>
                    <div className="formula-values">
                      Calculated Career Fit Index: <strong className="text-emerald">86%</strong>
                    </div>
                  </div>
                  <p>
                    Academic performance index matches streams with rigorous technical and logical foundations.
                  </p>
                  <div className="stream-recommendation-box" style={{ marginTop: "1.5rem", marginBottom: "1.5rem", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", padding: "1.25rem" }}>
                    <h4 style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", marginBottom: "0.5rem", fontSize: "1.05rem" }}>Recommended Academic Stream</h4>
                    <p style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-high)", marginBottom: "0.25rem" }}>Science (PCM)</p>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.75rem" }}><strong>Core Subjects:</strong> Physics, Chemistry, Mathematics</p>
                    <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "0.75rem" }}>
                      <strong style={{ fontSize: "0.85rem", color: "var(--color-text)", display: "block", marginBottom: "0.4rem" }}>Action Plan to Achieve Success in This Stream:</strong>
                      <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.85rem", color: "var(--color-text-muted)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        <li>Focus heavily on mathematical logic and physics foundations.</li>
                        <li>Engage in exploratory computer programming exercises.</li>
                        <li>Maintain high study environment structure and time blocks.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="report-section">
                  <h3>IV. Guided Counseling & Parental Support Recommendations</h3>
                  <p>
                    Ensure a balanced study routine. Promote stress management to reduce pressure responses during intense exam preparations.
                  </p>
                  <div className="action-points-box">
                    <h4>Action Roadmap & Support Priorities:</h4>
                    <ul className="action-list">
                      <li>Priority 1: Build foundational academic skills and structured study schedules.</li>
                      <li>Priority 2: Provide emotional support and practice simulated exam environments to lower testing anxiety.</li>
                    </ul>
                  </div>
                </div>

                <div className="report-doc-footer">
                  <div className="signature-line">
                    <div className="signature-space"></div>
                    <p>NeuroPi Counseling Systems Director</p>
                  </div>
                  <div className="signature-line">
                    <div className="signature-space"></div>
                    <p>Lead Educational Psychologist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
