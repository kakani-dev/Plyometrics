import { useState, useEffect } from "react";

export default function WelcomeScreen({ profile, setProfile, handleStartTest, handleDemoReport }) {
  const [grades, setGrades] = useState([
    { Value: "8", Label: "Grade 8" },
    { Value: "9", Label: "Grade 9" },
    { Value: "10", Label: "Grade 10" },
    { Value: "11", Label: "Grade 11" },
    { Value: "12", Label: "Grade 12" }
  ]);

  useEffect(() => {
    async function fetchGrades() {
      try {
        const res = await fetch("http://localhost:5041/api/assessment/grades");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setGrades(data);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch grades from API, using default list:", err);
      }
    }
    fetchGrades();
  }, []);

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
                  {grades.map((g) => (
                    <option key={g.Value || g.value} value={g.Value || g.value}>
                      {g.Label || g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Google AI Studio API Key <span className="optional">(Optional)</span></label>
                <input type="password" placeholder="AI Studio API Key (AI-powered narrative report)..."
                  value={profile.apiKey} onChange={(e) => setProfile({ ...profile, apiKey: e.target.value })} />
              </div>
              <details className="custom-difficulty-details">
                <summary className="custom-difficulty-summary">Custom Difficulty Distribution (Optional)</summary>
                <div className="custom-difficulty-content">
                  <div className="form-group">
                    <label>Difficulty Levels</label>
                    <select
                      value={
                        profile.difficultyTypes === "Easy,Medium,Hard" ||
                        profile.difficultyTypes === "Easy,Medium" ||
                        profile.difficultyTypes === "Medium,Hard" ||
                        profile.difficultyTypes === ""
                          ? profile.difficultyTypes
                          : "custom"
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "custom") {
                          setProfile({ ...profile, difficultyTypes: "Easy,Medium,Hard,Extreme" });
                        } else {
                          let ratio = "";
                          if (val === "Easy,Medium,Hard") ratio = "33,34,33";
                          else if (val === "Easy,Medium") ratio = "50,50";
                          else if (val === "Medium,Hard") ratio = "50,50";
                          setProfile({ ...profile, difficultyTypes: val, difficultyRatios: ratio });
                        }
                      }}
                    >
                      <option value="">Default (Easy, Medium, Hard)</option>
                      <option value="Easy,Medium,Hard">Easy, Medium, Hard</option>
                      <option value="Easy,Medium">Easy, Medium</option>
                      <option value="Medium,Hard">Medium, Hard</option>
                      <option value="custom">Custom Configuration...</option>
                    </select>
                    <p className="form-hint">Select cognitive difficulty level presets.</p>
                  </div>

                  {profile.difficultyTypes !== "Easy,Medium,Hard" &&
                    profile.difficultyTypes !== "Easy,Medium" &&
                    profile.difficultyTypes !== "Medium,Hard" &&
                    profile.difficultyTypes !== "" && (
                      <div className="form-group">
                        <label>Custom Difficulty Levels <span className="required">*</span></label>
                        <input type="text" placeholder="e.g. Easy,Medium,Hard,Expert" required
                          value={profile.difficultyTypes || ""}
                          onChange={(e) => setProfile({ ...profile, difficultyTypes: e.target.value })} />
                        <p className="form-hint">Enter comma-separated level names.</p>
                      </div>
                    )}

                  <div className="form-group">
                    <label>Difficulty Ratios</label>
                    <input type="text" placeholder="e.g. 33,34,33"
                      value={profile.difficultyRatios || ""}
                      onChange={(e) => setProfile({ ...profile, difficultyRatios: e.target.value })} />
                    <p className="form-hint">Comma-separated percentages (must sum to 100). Defaults to: 33,34,33</p>
                  </div>

                  <div className="form-group">
                    <label>Questions Per Subdomain</label>
                    <input type="number" min="1" max="15" placeholder="e.g. 3"
                      value={profile.questionsPerSubdomain || ""}
                      onChange={(e) => setProfile({ ...profile, questionsPerSubdomain: e.target.value })} />
                    <p className="form-hint">Number of questions per cognitive subdomain. Defaults to 3.</p>
                  </div>
                </div>
              </details>
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
