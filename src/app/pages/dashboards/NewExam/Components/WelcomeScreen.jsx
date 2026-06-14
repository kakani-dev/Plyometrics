export default function WelcomeScreen({ profile, setProfile, handleStartTest, handleDemoReport }) {
  return (
    <div className="screen active">
      <div className="welcome-card glass-panel">
        <div className="welcome-header">
          <h2 className="glowing-text">Psychometric Assessment Portal</h2>
          <p className="tagline">Grades 8 to 12 Academic & Career Guidance Engine</p>
        </div>
        <div className="welcome-grid">
          <div className="setup-section">
            <h3>Profile Registration</h3>
            <div className="setup-section-form">
              <div className="form-group">
                <label>Student Full Name <span className="required">*</span></label>
                <input type="text" required placeholder="Enter student's name..." autoComplete="off"
                  value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Grade / Class <span className="required">*</span></label>
                <select required value={profile.grade}
                  onChange={(e) => setProfile({ ...profile, grade: e.target.value })}>
                  <option value="" disabled>Select Grade...</option>
                  <option value="8">Grade 8</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assessment Protocol <span className="required">*</span></label>
                <select value={profile.testMode}
                  onChange={(e) => setProfile({ ...profile, testMode: e.target.value })}>
                  <option value="adaptive">AI-Powered Adaptive Assessment (Dynamic Branching)</option>
                  <option value="compact">Compact Assessment (84-Question Fixed Baseline)</option>
                </select>
                <p className="form-hint">
                  Adaptive Mode dynamically scales question difficulty and branches domains based on consistency.
                </p>
              </div>
              <div className="form-group">
                <label>Google AI Studio API Key <span className="optional">(Optional)</span></label>
                <input type="password" placeholder="AI Studio API Key (AI-powered narrative report)..."
                  value={profile.apiKey} onChange={(e) => setProfile({ ...profile, apiKey: e.target.value })} />
              </div>
              <div className="action-buttons">
                <button type="button" className="btn btn-primary btn-glow" style={{ width: '100%' }} onClick={handleStartTest}>
                  Start Assessment
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleDemoReport}>
                  Demo Report
                </button>
              </div>
            </div>
          </div>
          <div className="info-section">
            <h3>Assessment Coverage</h3>
            <div className="coverage-list">
              {[
                { icon: "R", cls: "riasec-color", title: "RIASEC Career Interests", desc: "Realistic, Investigative, Artistic, Social, Enterprising, Conventional interests." },
                { icon: "B5", cls: "big5-color", title: "Big Five Personality", desc: "Behavioral tendencies: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism." },
                { icon: "IQ", cls: "cog-color", title: "Cognitive Reasoning", desc: "Abstract patterns, logical deductions, numerical, verbal, and spatial abilities." },
                { icon: "EQ", cls: "emotional-color", title: "Emotional Profile & Resilience", desc: "Stress tolerance, confidence levels, resilience under pressure, and coping habits." },
                { icon: "LS", cls: "learning-color", title: "Learning Styles & Indicators", desc: "Visual, Auditory, Kinesthetic learning styles, plus study habits and motivation checks." },
              ].map((item, i) => (
                <div key={i} className="coverage-item">
                  <div className={`icon-circle ${item.cls}`}>{item.icon}</div>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
