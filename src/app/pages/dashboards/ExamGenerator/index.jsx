import { useState, useEffect, useRef } from "react";
import { Page } from "components/shared/Page";
import { DUMMY_QUESTIONS, DUMMY_METRICS } from "./data";
import WelcomeScreen from "./Components/WelcomeScreen";
import TestScreen from "./Components/TestScreen";
import ResultsScreen from "./Components/ResultsScreen";
import MetricDetailModal from "./Components/MetricDetailModal";
import "./styles.css";

export default function ExamGenerator() {
  // Navigation / Screen state
  const [currentScreen, setCurrentScreen] = useState("welcome"); // welcome | test | results
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | metrics | report

  // Registration profile state
  const [profile, setProfile] = useState({
    name: "",
    grade: "",
    testMode: "adaptive",
    apiKey: "AQ.Ab8RN6IcPtEVDv_o9u3KiQlPt5YQ9aE-8Ric9S7j7RnHEJufLA",
  });

  // Test session state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // qId -> value
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState([
    "[SYS] NeuralPi Adaptive Assessment engine initialized.",
    "[SYS] Grade model loaded. Waiting for registration..."
  ]);
  const [timerActive, setTimerActive] = useState(false);
  const [questionTimeSpent, setQuestionTimeSpent] = useState(0);

  // Result metrics/modal state
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [metricFilter, setMetricFilter] = useState("all");

  // Console and warning timers
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
        setQuestionTimeSpent((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Format elapsed time as MM:SS or SSs
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  // Log auto-scroll helper
  const consoleEndRef = useRef(null);
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollTop = consoleEndRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString().split(" ")[0];
    const logLine = `[${timestamp}] ${message}`;
    setConsoleLogs((prev) => [...prev, logLine]);
  };

  const handleStartTest = (e) => {
    if (e) e.preventDefault();
    if (!profile.name || !profile.grade) return;

    addLog(`[REG] Student Profile Registered: ${profile.name} (Grade ${profile.grade})`);
    addLog(`[ENG] Mode configured: ${profile.testMode.toUpperCase()}`);
    addLog("[ENG] Scaling neural baseline parameters based on grade...");
    addLog("[SYS] Starting test session. Section 1: RIASEC Interests.");

    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeElapsed(0);
    setQuestionTimeSpent(0);
    setTimerActive(true);
    setCurrentScreen("test");
  };

  const handleDemoReport = () => {
    // Populate with mock profile and jump straight to results
    setProfile({
      name: "Harsh Vardhan",
      grade: "10",
      testMode: "adaptive",
      apiKey: "AQ.Ab8RN6IcPtEVDv_o9u3KiQlPt5YQ9aE-8Ric9S7j7RnHEJufLA",
    });
    setCurrentScreen("results");
  };

  const handleAnswerSelect = (value) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNextQuestion = () => {
    const answer = selectedAnswers[currentQuestion.id];
    if (answer === undefined) return;

    addLog(`[SUB] Q${currentQuestionIndex + 1} (${currentQuestion.subdomain}) response logged in ${questionTimeSpent}s.`);

    // Adaptive Engine simulated logic
    if (profile.testMode === "adaptive" && currentQuestionIndex % 2 === 1) {
      addLog(`[AI-ENG] Branching logic check: high consistency in ${currentQuestion.domain}. Skipping sub-branch questions.`);
      addLog(`[AI-ENG] Saved 3 baseline items for ${currentQuestion.subdomain}.`);
    }

    if (currentQuestionIndex + 1 < DUMMY_QUESTIONS.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionTimeSpent(0);
    } else {
      setTimerActive(false);
      addLog("[SYS] All test questions completed successfully.");
      addLog("[SYS] Running permutation rules and diagnostic engine matrix...");
      addLog("[SYS] Report card generated.");
      setCurrentScreen("results");
    }
  };

  const handleRestart = () => {
    setProfile({
      name: "",
      grade: "",
      testMode: "adaptive",
      apiKey: "AQ.Ab8RN6IcPtEVDv_o9u3KiQlPt5YQ9aE-8Ric9S7j7RnHEJufLA",
    });
    setCurrentScreen("welcome");
  };

  const currentQuestion = DUMMY_QUESTIONS[currentQuestionIndex];
  const progressPercent = (currentQuestionIndex / DUMMY_QUESTIONS.length) * 100;

  // Calculate gauge offsets (stroke-dasharray = 251)
  const getStrokeDashOffset = (percentage) => {
    return 251 - (251 * percentage) / 100;
  };

  // Filtered metrics list
  const filteredMetrics = DUMMY_METRICS.filter((m) => {
    if (metricFilter === "all") return true;
    return m.layer === metricFilter;
  });

  // Export JSON helper
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ profile, selectedAnswers, metrics: DUMMY_METRICS }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NeuroPi_Report_${profile.name || "Student"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <Page title="Exam Generator">
      <div className="eg-portal-wrapper transition-content w-full min-h-screen text-slate-100 pb-12">
        {/* Header */}
        <header className="app-header">
          <div className="header-container">
            <div className="logo-area">
              <svg className="brain-logo" viewBox="0 0 24 24" width="32" height="32">
                <path fill="currentColor" d="M12,3c-4.97,0-9,4.03-9,9c0,2.12,0.74,4.07,1.97,5.61L4.35,19.4c-0.39,0.39-0.39,1.02,0,1.41c0.39,0.39,1.02,0.39,1.41,0l1.9-1.9C9.07,19.58,10.48,20,12,20c4.97,0,9-4.03,9-9S16.97,3,12,3z M12,18c-3.31,0-6-2.69-6-6s2.69-6,6-6s6,2.69,6,6S15.31,18,12,18z"/>
                <path fill="currentColor" opacity="0.8" d="M12,8c-2.21,0-4,1.79-4,4s1.79,4,4,4s4-1.79,4-4S14.21,8,12,8z M12,14c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,14,12,14z"/>
              </svg>
              <div className="brand-text">
                <h1>NeuroPi</h1>
                <span className="sub-brand">Student Development Intelligence</span>
              </div>
            </div>
            {currentScreen !== "welcome" && (
              <div className="header-status">
                <span className="status-badge">{profile.name || "Student"}</span>
                <span className="status-badge mode-badge">
                  {profile.testMode === "adaptive" ? "Adaptive Engine" : "Baseline Mode"}
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="app-main">
          {/* Welcome Screen */}
          {currentScreen === "welcome" && (
            <WelcomeScreen
              profile={profile}
              setProfile={setProfile}
              handleStartTest={handleStartTest}
              handleDemoReport={handleDemoReport}
            />
          )}

          {/* Test Screen */}
          {currentScreen === "test" && currentQuestion && (
            <TestScreen
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              questionsLength={DUMMY_QUESTIONS.length}
              timeElapsed={timeElapsed}
              formatTime={formatTime}
              progressPercent={progressPercent}
              selectedAnswers={selectedAnswers}
              handleAnswerSelect={handleAnswerSelect}
              questionTimeSpent={questionTimeSpent}
              handleNextQuestion={handleNextQuestion}
              consoleLogs={consoleLogs}
              consoleEndRef={consoleEndRef}
              profile={profile}
            />
          )}

          {/* Results Screen */}
          {currentScreen === "results" && (
            <ResultsScreen
              profile={profile}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleRestart={handleRestart}
              handleExportJSON={handleExportJSON}
              metricFilter={metricFilter}
              setMetricFilter={setMetricFilter}
              filteredMetrics={filteredMetrics}
              setSelectedMetric={setSelectedMetric}
              getStrokeDashOffset={getStrokeDashOffset}
            />
          )}
        </main>

        {/* Modal Overlay */}
        <MetricDetailModal
          selectedMetric={selectedMetric}
          setSelectedMetric={setSelectedMetric}
        />
      </div>
    </Page>
  );
}
