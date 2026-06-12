
export default function WelcomeScreen({ profile, setProfile, handleStartTest, handleDemoReport }) {
  return (
    <section id="screen-welcome" className="screen active">
      <div className="welcome-card glass-panel">
        <div className="welcome-header">
          <h2 className="glowing-text">Psychometric Assessment Portal</h2>
          <p className="tagline">Grades 8 to 12 Academic & Career Guidance Engine</p>
        </div>

        <div className="welcome-grid">
          <div className="setup-section">
            <h3>Profile Registration</h3>
            <form onSubmit={handleStartTest}>
              <div className="form-group">
                <label htmlFor="student-name">Student Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="student-name"
                  required
                  placeholder="Enter student's name..."
                  autoComplete="off"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="student-grade">Grade / Class <span className="required">*</span></label>
                <select
                  id="student-grade"
                  required
                  value={profile.grade}
                  onChange={(e) => setProfile({ ...profile, grade: e.target.value })}
                >
                  <option value="" disabled>Select Grade...</option>
                  <option value="8">Grade 8</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="test-mode">Assessment Protocol <span className="required">*</span></label>
                <select
                  id="test-mode"
                  required
                  value={profile.testMode}
                  onChange={(e) => setProfile({ ...profile, testMode: e.target.value })}
                >
                  <option value="adaptive">AI-Powered Adaptive Assessment (Dynamic Branching)</option>
                  <option value="compact">Compact Assessment (84-Question Fixed Baseline)</option>
                </select>
                <p className="form-hint">
                  Adaptive Mode dynamically scales question difficulty and branches domains based on consistency to find the student&apos;s exact profile in 40-60% fewer questions.
                </p>
              </div>
              <div className="form-group">
                <label htmlFor="api-key">Google AI Studio API Key <span className="optional">(Optional)</span></label>
                <input
                  type="password"
                  id="api-key"
                  placeholder="AI Studio API Key (AI-powered narrative report)..."
                  value={profile.apiKey}
                  onChange={(e) => setProfile({ ...profile, apiKey: e.target.value })}
                />
                <p className="form-hint">
                  Enter your free Gemini key for deep, custom letter synthesis. If blank, the engine uses our high-fidelity 1080 permutation rules locally.
                </p>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button type="submit" id="btn-start-test" className="btn btn-primary btn-glow" style={{ flex: 2 }}>
                  Start Assessment
                </button>
                <button
                  type="button"
                  id="btn-mock-test"
                  className="btn btn-secondary"
                  style={{ flex: 1, border: "1px solid var(--color-primary)", color: "var(--color-primary)" }}
                  onClick={handleDemoReport}
                >
                  Demo Report
                </button>
              </div>
            </form>
          </div>

          <div className="info-section">
            <h3>Assessment Coverage</h3>
            <div className="coverage-list">
              <div className="coverage-item">
                <div className="icon-circle riasec-color">R</div>
                <div>
                  <h4>RIASEC Career Interests</h4>
                  <p>Realistic, Investigative, Artistic, Social, Enterprising, Conventional interests.</p>
                </div>
              </div>
              <div className="coverage-item">
                <div className="icon-circle big5-color">B5</div>
                <div>
                  <h4>Big Five Personality</h4>
                  <p>Behavioral tendencies: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism.</p>
                </div>
              </div>
              <div className="coverage-item">
                <div className="icon-circle cog-color">IQ</div>
                <div>
                  <h4>Cognitive Reasoning</h4>
                  <p>Abstract patterns, logical deductions, numerical, verbal, and spatial abilities.</p>
                </div>
              </div>
              <div className="coverage-item">
                <div className="icon-circle emotional-color">EQ</div>
                <div>
                  <h4>Emotional Profile & Resilience</h4>
                  <p>Stress tolerance, confidence levels, resilience under pressure, and coping habits.</p>
                </div>
              </div>
              <div className="coverage-item">
                <div className="icon-circle learning-color">LS</div>
                <div>
                  <h4>Learning Styles & Indicators</h4>
                  <p>Visual, Auditory, Kinesthetic learning styles, plus study habits and motivation checks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
