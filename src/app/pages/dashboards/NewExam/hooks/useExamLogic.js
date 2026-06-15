import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { DUMMY_QUESTIONS, DUMMY_METRICS } from "../data";
import {
  INITIAL_CONSOLE_LOGS,
  SUBDOMAINS_LIST,
  DIFFICULTY_LEVELS,
} from "../const";
import {
  startBackendSession,
  submitAnswerToBackend,
  fetchResults,
  fetchSavedReport,
  generateAiReportBackend,
  generateAiReportDirect,
} from "../apicalling";
import { mapBackendQuestionToFrontend } from "../utils";

export function useExamLogic() {
  const [currentScreen, setCurrentScreen] = useState("welcome");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState({
    name: "",
    grade: "8",
    apiKey: "",
    difficultyTypes: "",
    difficultyRatios: "",
    questionsPerSubdomain: "",
  });
  const [servedQuestionsHistory, setServedQuestionsHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState(INITIAL_CONSOLE_LOGS);
  const [timerActive, setTimerActive] = useState(false);
  const [questionTimeSpent, setQuestionTimeSpent] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [metricFilter, setMetricFilter] = useState("all");
  const [resultsData, setResultsData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(
    DUMMY_QUESTIONS.length
  );
  const [generatingAiReport, setGeneratingAiReport] = useState(false);

  const consoleEndRef = useRef(null);

  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
        setQuestionTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollTop = consoleEndRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    const storedError = localStorage.getItem("last_error");
    if (storedError) {
      console.error("DEBUG - Error from previous session:", storedError);
      alert("Detected React/App crash from previous load: " + storedError);
      localStorage.removeItem("last_error");
    }

    const errorHandler = (event) => {
      localStorage.setItem(
        "last_error",
        `Error: ${event.message} at ${event.filename}:${event.lineno}`
      );
    };

    const rejectionHandler = (event) => {
      localStorage.setItem(
        "last_error",
        `Unhandled Rejection: ${event.reason?.message || String(event.reason)}`
      );
    };

    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", rejectionHandler);
    return () => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", rejectionHandler);
    };
  }, []);

  const handleStartTest = async (e, overrideProfile) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    const p = overrideProfile || profile;
    console.log(
      "handleStartTest triggered. Profile name:",
      p.name,
      "Grade:",
      p.grade
    );

    if (!p.name || !p.grade) {
      console.warn(
        "handleStartTest: Profile name or grade is missing. Aborting."
      );
      alert(
        "Please fill in Student Full Name and select a Grade class before starting."
      );
      return;
    }

    try {
      addLog(`[REG] Student Profile: ${p.name} (Grade ${p.grade})`);

      console.log("Attempting to connect to backend...");
      const backend = await startBackendSession(p);
      if (backend) {
        setSessionId(backend.sessionId);
        addLog(`[API] Session created: ${backend.sessionId}`);
        if (backend.cognitiveDifficultyState) {
          addLog(`[ENG] Difficulty State: ${backend.cognitiveDifficultyState}`);
        }
        console.log(
          "Session created successfully:",
          backend.sessionId,
          backend
        );

        const firstQ = mapBackendQuestionToFrontend(backend.firstQuestion);
        setCurrentQuestion(firstQ);
        if (firstQ) {
          setServedQuestionsHistory([firstQ]);
        }
        setTotalQuestionsCount(backend.totalQuestions || 70);
      } else {
        addLog("[API] Backend offline, using local mock mode");
        console.log(
          "Backend connection failed. Falling back to local mock mode."
        );

        const firstMockQ = DUMMY_QUESTIONS[0];
        setCurrentQuestion(firstMockQ);
        setServedQuestionsHistory([firstMockQ]);
        setTotalQuestionsCount(DUMMY_QUESTIONS.length);
      }

      addLog("[ENG] Scaling neural baseline parameters...");
      addLog("[SYS] Starting test session.");

      console.log("Initializing test state...");
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setTimeElapsed(0);
      setQuestionTimeSpent(0);
      setTimerActive(true);
      setCurrentScreen("test");
      console.log("Screen transitioned to 'test'. Test active.");
    } catch (err) {
      console.error("handleStartTest error:", err);
    }
  };

  const handleGenerateAiReport = async () => {
    if (!profile.apiKey) return;
    setGeneratingAiReport(true);
    addLog("[SYS] Generating AI Counseling Report...");

    const promptText = `
You are an expert educational psychologist and counseling director. Analyze this student psychometric data sheet and synthesize a detailed developmental diagnostic report.

STUDENT PROFILE:
- Name: ${profile.name || "Student"}
- Grade: ${profile.grade || "10"}
- Assessment Code: ${resultsData?.profileCode || "NP-P1028"}

DOMINANT TRAITS:
- dominant RIASEC: ${resultsData?.dominantVectors?.dominantRIASEC || "Realistic"}
- dominant Big Five: ${resultsData?.dominantVectors?.dominantBig5 || "Conscientiousness"}
- Cognitive Band: ${resultsData?.circularGauges?.cognitiveIndex >= 70 ? "High" : resultsData?.circularGauges?.cognitiveIndex >= 40 ? "Moderate" : "Low"} (Index Score: ${resultsData?.circularGauges?.cognitiveIndex || 95}%)
- Emotional Band: ${resultsData?.circularGauges?.emotionalSustainability >= 70 ? "High" : resultsData?.circularGauges?.emotionalSustainability >= 40 ? "Moderate" : "Low"} (Index Score: ${resultsData?.circularGauges?.emotionalSustainability || 68}%)
- dominant Learning Style: ${resultsData?.dominantVectors?.dominantLearning || "Visual"}
- Recommended Stream: ${resultsData?.streamRecommendation?.stream || "Science (PCM)"} (Subjects: ${resultsData?.streamRecommendation?.subjects || "Physics, Chemistry, Mathematics"})
- Recommended Stream Actions: ${(resultsData?.streamRecommendation?.actions || []).join("; ")}

Write a comprehensive, professional narrative report divided into four sections. Adopt a supportive, guidance-oriented tone.
Formatting: Do not use markdown titles. Format each section as solid, flowing paragraphs.

Section I: Executive Assessment Summary (Synthesize a detailed review of RIASEC interest, personality traits and developmental indicators).
Section II: Cognitive Reasoning & Sensory Learning Profile (Detail cognitive strengths and specific classroom learning strategies matching their learning style).
Section III: Academic and Career Trajectory Mapping (Provide concrete career recommendations matching their RIASEC code and cognitive band, and write an analysis supporting their recommended academic stream).
Section IV: Guided Counseling & Parental Support Recommendations (List step-by-step counselor focus roadmaps and parental support guidelines).
`;

    try {
      let aiText = "";
      if (sessionId) {
        aiText =
          (await generateAiReportBackend(sessionId, profile.apiKey)) || "";
      } else {
        aiText =
          (await generateAiReportDirect(profile.apiKey, promptText)) || "";
      }

      if (aiText) {
        const sections = aiText.split(
          /(?:Section I:|Section II:|Section III:|Section IV:|### I\.|### II\.|### III\.|### IV\.|I\.\s+|II\.\s+|III\.\s+|IV\.\s+)/gi
        );
        const contentBlocks = [];
        sections.forEach((s) => {
          const cleanText = s.trim();
          if (cleanText.length > 50) {
            contentBlocks.push(cleanText);
          }
        });

        let newNarrative = {};
        if (contentBlocks.length >= 4) {
          newNarrative = {
            executiveSummary: contentBlocks[0].replace(/\*/g, ""),
            cognitiveStrengths: contentBlocks[1]
              .split("\n\n")[0]
              .replace(/\*/g, ""),
            learningStrategy:
              contentBlocks[1]
                .split("\n\n")
                .slice(1)
                .join("\n\n")
                .replace(/\*/g, "") || "Learning strategy tailored for student.",
            careerMapping: contentBlocks[2].replace(/\*/g, ""),
            counselorGuideline: contentBlocks[3].replace(/\*/g, ""),
          };
        } else {
          const paragraphs = aiText
            .split("\n\n")
            .filter((p) => p.trim().length > 30);
          if (paragraphs.length >= 4) {
            newNarrative = {
              executiveSummary: paragraphs[0].replace(/\*/g, ""),
              cognitiveStrengths: paragraphs[1].replace(/\*/g, ""),
              learningStrategy: "",
              careerMapping: paragraphs[2].replace(/\*/g, ""),
              counselorGuideline: paragraphs[3].replace(/\*/g, ""),
            };
          } else {
            newNarrative = {
              executiveSummary: aiText.replace(/\*/g, ""),
              cognitiveStrengths: "",
              learningStrategy: "",
              careerMapping: "",
              counselorGuideline: "",
            };
          }
        }

        setResultsData((prev) => ({
          ...prev,
          localNarrative: newNarrative,
        }));
        addLog("[SYS] AI Report generated successfully.");
      }
    } catch (err) {
      console.error(err);
      addLog(`[SYS-ERR] AI Generation failed: ${err.message}`);
      alert("Failed to generate AI report: " + err.message);
    } finally {
      setGeneratingAiReport(false);
    }
  };

  const handleAnswerSelect = (value) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNextQuestion = async () => {
    const answer = selectedAnswers[currentQuestion.id];
    if (answer === undefined) return;

    if (currentQuestionIndex + 1 === totalQuestionsCount) {
      toast.success(
        "Assessment complete! Preparing your results report..."
      );

      const finalSubdomains = {};
      SUBDOMAINS_LIST.forEach((sub) => {
        finalSubdomains[sub] = { ...DIFFICULTY_LEVELS };
      });

      const finalDifficulties = { ...DIFFICULTY_LEVELS };

      servedQuestionsHistory.forEach((q) => {
        const sub = q.subdomain;
        const diff = q.difficulty;

        if (sub) {
          if (!finalSubdomains[sub]) {
            finalSubdomains[sub] = { ...DIFFICULTY_LEVELS };
          }
          if (diff && diff in finalSubdomains[sub]) {
            finalSubdomains[sub][diff]++;
          } else if (diff) {
            finalSubdomains[sub][diff] =
              (finalSubdomains[sub][diff] || 0) + 1;
          }
        }

        if (diff && diff in finalDifficulties) {
          finalDifficulties[diff]++;
        } else if (diff) {
          finalDifficulties[diff] = (finalDifficulties[diff] || 0) + 1;
        }
      });

      const downloadData = {
        subdomainCounts: finalSubdomains,
        difficultyCounts: finalDifficulties,
      };

      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(downloadData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "contcheck.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    addLog(
      `[SUB] Q${currentQuestionIndex + 1} (${currentQuestion.subdomain}) answered in ${questionTimeSpent}s.`
    );

    if (sessionId) {
      const result = await submitAnswerToBackend(
        sessionId,
        currentQuestion.id,
        answer,
        questionTimeSpent
      );

      if (result && result.isCompleted) {
        setTimerActive(false);
        addLog("[SYS] All questions completed.");

        const data = await fetchResults(sessionId);
        if (data) {
          const reportText = await fetchSavedReport(sessionId);
          if (reportText) {
            data.localNarrative = {
              executiveSummary: "",
              cognitiveStrengths: "",
              learningStrategy: "",
              careerMapping: "",
              counselorGuideline: reportText,
            };
            addLog("[SYS] AI report loaded.");
          }
          setResultsData(data);
        }

        addLog("[SYS] Running diagnostic engine matrix...");
        setCurrentScreen("results");
        return;
      }

      if (result && result.nextQuestion) {
        const nextQ = mapBackendQuestionToFrontend(result.nextQuestion);
        setCurrentQuestion(nextQ);
        if (nextQ) {
          setServedQuestionsHistory((prev) => [...prev, nextQ]);
        }
        setCurrentQuestionIndex((prev) => prev + 1);
        setQuestionTimeSpent(0);
        if (result.cognitiveDifficultyState) {
          addLog(
            `[ENG] Difficulty State: ${result.cognitiveDifficultyState}`
          );
        }
        return;
      }
    }

    if (currentQuestionIndex + 1 < DUMMY_QUESTIONS.length) {
      const nextIdx = currentQuestionIndex + 1;
      const nextMockQ = DUMMY_QUESTIONS[nextIdx];
      setCurrentQuestion(nextMockQ);
      setServedQuestionsHistory((prev) => [...prev, nextMockQ]);
      setCurrentQuestionIndex(nextIdx);
      setQuestionTimeSpent(0);
    } else {
      setTimerActive(false);
      addLog("[SYS] All questions completed.");

      if (sessionId) {
        const data = await fetchResults(sessionId);
        if (data) setResultsData(data);
      }

      addLog("[SYS] Running diagnostic engine matrix...");
      addLog("[SYS] Report generated.");
      setCurrentScreen("results");
    }
  };

  const handleRestart = () => {
    setProfile({
      name: "",
      grade: "",
      apiKey: "",
      difficultyTypes: "",
      difficultyRatios: "",
      questionsPerSubdomain: "",
    });
    setServedQuestionsHistory([]);
    setSessionId(null);
    setResultsData(null);
    setConsoleLogs(INITIAL_CONSOLE_LOGS);
    setCurrentQuestion(null);
    setCurrentQuestionIndex(0);
    setTotalQuestionsCount(DUMMY_QUESTIONS.length);
    setCurrentScreen("welcome");
  };

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            profile,
            selectedAnswers,
            metrics: DUMMY_METRICS,
            results: resultsData,
          },
          null,
          2
        )
      );
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute(
      "download",
      `NeuroPi_Report_${profile.name || "Student"}.json`
    );
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const progressPercent =
    totalQuestionsCount > 0
      ? (currentQuestionIndex / totalQuestionsCount) * 100
      : 0;

  const filteredMetrics = (
    resultsData?.metrics || resultsData?.Metrics || DUMMY_METRICS
  ).filter((m) => {
    if (metricFilter === "all") return true;
    const layerVal = m.layer || m.Layer || m.domain || m.Domain;
    return layerVal === metricFilter;
  });

  return {
    currentScreen,
    activeTab,
    setActiveTab,
    profile,
    setProfile,
    servedQuestionsHistory,
    currentQuestionIndex,
    selectedAnswers,
    timeElapsed,
    consoleLogs,
    questionTimeSpent,
    selectedMetric,
    setSelectedMetric,
    metricFilter,
    setMetricFilter,
    resultsData,
    currentQuestion,
    totalQuestionsCount,
    generatingAiReport,
    consoleEndRef,
    handleStartTest,
    handleGenerateAiReport,
    handleAnswerSelect,
    handleNextQuestion,
    handleRestart,
    handleExportJSON,
    progressPercent,
    filteredMetrics,
  };
}
