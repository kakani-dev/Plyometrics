
const LIKERT_LABELS = [
  { value: 1, label: "Strongly Disagree", colorClass: "text-low" },
  { value: 2, label: "Disagree", colorClass: "text-low" },
  { value: 3, label: "Neutral", colorClass: "text-moderate" },
  { value: 4, label: "Agree", colorClass: "text-high" },
  { value: 5, label: "Strongly Agree", colorClass: "text-high" }
];

export default function TestScreen({
  currentQuestion,
  currentQuestionIndex,
  questionsLength,
  timeElapsed,
  formatTime,
  progressPercent,
  selectedAnswers,
  handleAnswerSelect,
  questionTimeSpent,
  handleNextQuestion,
  consoleLogs,
  consoleEndRef,
  profile
}) {
  const getLikertLabelText = (val) => {
    const item = LIKERT_LABELS.find((l) => l.value === val);
    return item ? <span className={item.colorClass}>{item.label}</span> : "";
  };

  return (
    <section id="screen-test" className="screen active">
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
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>

          <div className="question-container">
            <div className="question-card">
              <p className="question-text">{currentQuestion.text}</p>
            </div>
          </div>

          {/* Options Area */}
          <div className="options-container">
            {currentQuestion.type === "likert" ? (
              <div className="options-likert-wrapper">
                <div className="likert-buttons">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`btn-likert ${selectedAnswers[currentQuestion.id] === val ? "selected" : ""}`}
                      data-val={val}
                      onClick={() => handleAnswerSelect(val)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="likert-labels">
                  <span>Strongly Disagree</span>
                  <span>Strongly Agree</span>
                </div>
                <div className="likert-active-value-text">
                  {getLikertLabelText(selectedAnswers[currentQuestion.id])}
                </div>
              </div>
            ) : (
              <div className="mcq-options-grid">
                {currentQuestion.options.map((opt) => (
                  <button
                    key={opt.letter}
                    type="button"
                    className={`btn-mcq-option ${selectedAnswers[currentQuestion.id] === opt.letter ? "selected" : ""}`}
                    onClick={() => handleAnswerSelect(opt.letter)}
                  >
                    <span className="mcq-letter">{opt.letter}</span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="test-footer">
            <div className="timing-warning-container">
              <div
                className="timing-warning-bar"
                style={{
                  width: "100%",
                  background: questionTimeSpent > 15 ? "var(--color-low)" : "var(--color-high)",
                }}
              ></div>
              <span className="timing-warning-text">
                {questionTimeSpent > 15 ? "Response Time: Slow" : "Response Time: Normal"} ({questionTimeSpent}s)
              </span>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={selectedAnswers[currentQuestion.id] === undefined}
              onClick={handleNextQuestion}
            >
              {currentQuestionIndex + 1 === questionsLength ? "Finish Assessment" : "Submit & Continue"}
            </button>
          </div>
        </div>

        {/* Side console panel for Adaptive Engine logs */}
        <div className="test-panel-side glass-panel">
          <div className="console-header">
            <h3>Adaptive Engine Brain</h3>
            <span className="badge badge-pulse">Active</span>
          </div>
          <div className="console-body" ref={consoleEndRef}>
            {consoleLogs.map((log, idx) => (
              <div
                key={idx}
                className={`console-log-line ${
                  log.includes("[SYS]")
                    ? "system"
                    : log.includes("[SUB]") || log.includes("[AI-ENG]")
                    ? "success"
                    : "system"
                }`}
              >
                {log}
              </div>
            ))}
          </div>
          <div className="engine-state-stats">
            <div className="stat-row">
              <span>Active Metrics Evaluated:</span>
              <span className="stat-value">{Object.keys(selectedAnswers).length} / 28</span>
            </div>
            <div className="stat-row">
              <span>Questions Saved:</span>
              <span className="stat-value text-emerald">
                {profile.testMode === "adaptive" ? Math.floor(currentQuestionIndex / 2) * 3 : 0}
              </span>
            </div>
            <div className="stat-row">
              <span>Validity Status:</span>
              <span className="stat-value text-emerald">Stable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
