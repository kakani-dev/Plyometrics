const LIKERT_LABELS = [
  { value: 1, label: "Strongly Disagree", colorClass: "text-low" },
  { value: 2, label: "Disagree", colorClass: "text-low" },
  { value: 3, label: "Neutral", colorClass: "text-moderate" },
  { value: 4, label: "Agree", colorClass: "text-high" },
  { value: 5, label: "Strongly Agree", colorClass: "text-high" },
];

export default function TestScreen({
  currentQuestion, currentQuestionIndex, questionsLength, timeElapsed,
  formatTime, progressPercent, selectedAnswers, handleAnswerSelect,
  questionTimeSpent, handleNextQuestion, consoleLogs, consoleEndRef,
  servedQuestionsHistory = [],
}) {
  const subdomainCounts = {};
  const difficultyCounts = {};

  servedQuestionsHistory.forEach((q) => {
    const sub = q.subdomain || "Unknown";
    subdomainCounts[sub] = (subdomainCounts[sub] || 0) + 1;

    const diff = q.difficulty || "Unknown";
    difficultyCounts[diff] = (difficultyCounts[diff] || 0) + 1;
  });

  if (!currentQuestion) {
    console.error("TestScreen rendered but currentQuestion is undefined.");
    return (
      <div className="screen active">
        <div className="glass-panel" style={{ padding: "2rem", textContent: "center" }}>
          <h3>Loading assessment question...</h3>
        </div>
      </div>
    );
  }

  const getLikertLabel = (val) => {
    const item = LIKERT_LABELS.find((l) => l.value === val);
    return item ? <span className={item.colorClass}>{item.label}</span> : "";
  };

  const getLogType = (log) => {
    if (!log || typeof log !== "string") return "system";
    return log.includes("[SYS]") ? "system" : log.includes("[SUB]") ? "success" : "system";
  };

  return (
    <div className="screen active">
      <div className="test-layout">
        <div className="test-panel-main glass-panel">
          <div className="test-header">
            <div className="category-indicator">
              <span className="active-domain">{currentQuestion.domain}</span>
              <span className="domain-divider">/</span>
              <span className="active-subdomain">{currentQuestion.subdomain}</span>
            </div>
            <div className="progress-stats">
              <span>Question {currentQuestionIndex + 1} of {questionsLength}</span>
              <span className="time-elapsed">{formatTime(timeElapsed)}</span>
            </div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="question-container">
            <div className="question-card">
              <p className="question-text">{currentQuestion.text}</p>
            </div>
          </div>
          <div className="options-container">
            {currentQuestion.type === "likert" ? (
              <div className="options-likert-wrapper">
                <div className="likert-buttons">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button key={val} type="button"
                      className={`btn-likert ${selectedAnswers[currentQuestion.id] === val ? "selected" : ""}`}
                      data-val={val} onClick={() => handleAnswerSelect(val)}>
                      {val}
                    </button>
                  ))}
                </div>
                <div className="likert-labels">
                  <span>Strongly Disagree</span>
                  <span>Strongly Agree</span>
                </div>
                <div className="likert-active-value-text">
                  {getLikertLabel(selectedAnswers[currentQuestion.id])}
                </div>
              </div>
            ) : (
              <div className="mcq-options-grid">
                {(currentQuestion.options || []).map((opt) => (
                  <button key={opt.letter} type="button"
                    className={`btn-mcq-option ${selectedAnswers[currentQuestion.id] === opt.letter ? "selected" : ""}`}
                    onClick={() => handleAnswerSelect(opt.letter)}>
                    <span className="mcq-letter">{opt.letter}</span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="test-footer">
            <div className="timing-warning-container">
              <div className="timing-warning-bar"
                style={{ background: questionTimeSpent > 15 ? "var(--color-low)" : "var(--color-high)" }} />
              <span className="timing-warning-text">
                {questionTimeSpent > 15 ? "Response Time: Slow" : "Response Time: Normal"} ({questionTimeSpent}s)
              </span>
            </div>
            <button type="button" className="btn btn-primary"
              disabled={selectedAnswers[currentQuestion.id] === undefined}
              onClick={handleNextQuestion}>
              {currentQuestionIndex + 1 === questionsLength ? "Finish Assessment" : "Submit & Continue"}
            </button>
          </div>
        </div>
        <div className="test-panel-side glass-panel">
          <div className="console-header">
            <h3>Adaptive Engine Brain</h3>
            <span className="badge badge-pulse">Active</span>
          </div>
          <div className="console-body" ref={consoleEndRef}>
            {consoleLogs.map((log, idx) => (
              <div key={idx} className={`console-log-line ${getLogType(log)}`}>{log}</div>
            ))}
          </div>
          <div className="engine-state-stats">
            <div className="stat-row">
              <span>Active Metrics Evaluated:</span>
              <span className="stat-value">{Object.keys(selectedAnswers).length} / 28</span>
            </div>
            <div className="stat-row">
              <span>Questions Saved:</span>
              <span className="stat-val text-high">
                {Math.floor(currentQuestionIndex / 2) * 3}
              </span>
            </div>
            <div className="stat-row">
              <span>Validity Status:</span>
              <span className="stat-val text-high">Stable</span>
            </div>
          </div>
          <details className="debug-panel-details" open>
            <summary className="debug-panel-summary">🔍 Adaptive Engine Debugger</summary>
            <div className="debug-panel-content">
              <div className="debug-section">
                <h4>Subdomain Distribution</h4>
                <div className="debug-grid">
                  {Object.entries(subdomainCounts).map(([sub, count]) => (
                    <div key={sub} className="debug-row">
                      <span className="debug-label">{sub}</span>
                      <span className="debug-value">{count} q</span>
                    </div>
                  ))}
                  {Object.keys(subdomainCounts).length === 0 && (
                    <span className="debug-empty">No questions served yet.</span>
                  )}
                </div>
              </div>
              <div className="debug-section">
                <h4>Difficulty Levels served</h4>
                <div className="debug-grid">
                  {Object.entries(difficultyCounts).map(([level, count]) => (
                    <div key={level} className="debug-row">
                      <span className="debug-label">{level}</span>
                      <span className="debug-value text-emerald">{count} q</span>
                    </div>
                  ))}
                  {Object.keys(difficultyCounts).length === 0 && (
                    <span className="debug-empty">No questions served yet.</span>
                  )}
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
