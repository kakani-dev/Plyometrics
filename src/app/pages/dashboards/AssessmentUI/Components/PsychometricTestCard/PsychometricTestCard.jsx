import { useState, useEffect, useCallback } from "react";
import { Card, Radio, Button, Progress } from "components/ui";
import { ClockIcon, ArrowRightIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Welcome } from "./Welcome";
import {
  getExamPattern,
  submitAnswers,
} from "app/contexts/api/allapis";

const DEFAULT_THRESHOLDS = {
  Easy: { min: 5, med: 15, max: 30 },
  Medium: { min: 10, med: 30, max: 60 },
  Hard: { min: 20, med: 60, max: 120 },
};


export function PsychometricTestCard({ testData, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [thresholdsMap, setThresholdsMap] = useState(null);
  const [examInfo, setExamInfo] = useState({ testName: "", userName: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [questionStartTime, setQuestionStartTime] = useState(() => new Date());
  const [totalTime, setTotalTime] = useState(0);

  const currentQuestion = questions[currentIndex];
  const difficulty = currentQuestion?.Difficulty || "Medium";
  const thresholds = (thresholdsMap || DEFAULT_THRESHOLDS)[difficulty] || DEFAULT_THRESHOLDS.Medium;

  const [timeLeft, setTimeLeft] = useState(thresholds.max);
  const [logs, setLogs] = useState([]);
  const [testCompleted, setTestCompleted] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getExamPattern(testData?.testId || 1, testData?.uid || 1);
        if (!active) return;
        const d = res?.data;
        if (d) {
          const normalized = (d.questions || []).map(q => ({
            ...q,
            QID: q.qid,
            Question: q.question,
            Difficulty: q.difficulty,
          }));
          if (active) {
            setQuestions(normalized);
            setThresholdsMap(d.timeThresholds);
            setExamInfo({ testName: d.testName, userName: d.userName });
            
            // Correctly initialize time left and start time based on the first question's difficulty
            const firstQuestion = normalized[0];
            const firstDiff = firstQuestion?.Difficulty || "Medium";
            const firstThresh = (d.timeThresholds || DEFAULT_THRESHOLDS)[firstDiff] || DEFAULT_THRESHOLDS.Medium;
            setTimeLeft(firstThresh.max);
            setQuestionStartTime(new Date());
          }
        }
      } catch (err) {
        console.error("Failed to fetch exam pattern:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [testData]);

  const submitTest = useCallback(async (answers, totalTimeSeconds) => {
    setSubmitting(true);
    try {
      const payload = {
        testId: testData?.testId || 1,
        candidateId: testData?.uid || 1,
        totalTimeTakenSeconds: totalTimeSeconds,
        answers: answers.map(a => ({
          qid: a.qid,
          selectedAnswer: a.selectedAnswer,
          timeTakenSeconds: a.durationSeconds,
        })),
      };
      await submitAnswers(payload);
    } catch (err) {
      console.error("Failed to submit answers:", err);
    } finally {
      setSubmitting(false);
      setTestCompleted(true);
    }
  }, [testData]);

  // Handle automatic skipping when max time is reached
  const handleAutoSkip = useCallback(() => {
    if (!currentQuestion) return;
    const endTime = new Date();
    const durationMs = endTime - questionStartTime;
    const durationMinutes = parseFloat((durationMs / 60000).toFixed(4));
    const durationSeconds = parseFloat((durationMs / 1000).toFixed(2));

    const newLog = {
      qid: currentQuestion.QID,
      question: currentQuestion.Question,
      thresholds,
      startedAt: questionStartTime.toISOString(),
      endedAt: endTime.toISOString(),
      durationMinutes,
      durationSeconds,
      selectedAnswer: "AUTO_SKIPPED_TIMEOUT",
      status: "Skipped (Timeout)",
    };

    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);

    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextQuestion = questions[nextIndex];
      const nextDifficulty = nextQuestion?.Difficulty || "Medium";
      const nextThresholds = (thresholdsMap || DEFAULT_THRESHOLDS)[nextDifficulty] || DEFAULT_THRESHOLDS.Medium;
      
      setCurrentIndex(nextIndex);
      setQuestionStartTime(new Date());
      setTimeLeft(nextThresholds.max);
    } else {
      submitTest(updatedLogs, totalTime);
    }
  }, [currentIndex, currentQuestion, difficulty, thresholds, questionStartTime, logs, totalTime, submitTest, questions, thresholdsMap]);

  // Handle user submitting/moving next
  const handleNext = useCallback(() => {
    if (!currentQuestion) return;

    const endTime = new Date();
    const durationMs = endTime - questionStartTime;
    const durationMinutes = parseFloat((durationMs / 60000).toFixed(4));
    const durationSeconds = parseFloat((durationMs / 1000).toFixed(2));
    const answer = selectedAnswers[currentQuestion.QID] || "";

    const newLog = {
      qid: currentQuestion.QID,
      question: currentQuestion.Question,
      thresholds,
      startedAt: questionStartTime.toISOString(),
      endedAt: endTime.toISOString(),
      durationMinutes,
      durationSeconds,
      selectedAnswer: answer,
      status: answer ? "Answered" : "Skipped (Manual)",
    };

    const updatedLogs = [...logs.filter((l) => l.qid !== currentQuestion.QID), newLog];
    setLogs(updatedLogs);

    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextQuestion = questions[nextIndex];
      const nextDifficulty = nextQuestion?.Difficulty || "Medium";
      const nextThresholds = (thresholdsMap || DEFAULT_THRESHOLDS)[nextDifficulty] || DEFAULT_THRESHOLDS.Medium;

      setCurrentIndex(nextIndex);
      setQuestionStartTime(new Date());
      setTimeLeft(nextThresholds.max);
    } else {
      submitTest(updatedLogs, totalTime);
    }
  }, [currentIndex, currentQuestion, thresholds, questionStartTime, selectedAnswers, logs, totalTime, submitTest, questions, thresholdsMap]);

  // Timer effect: Only decrements the count down timer and increments total exam time
  useEffect(() => {
    if (testCompleted || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSkip();
          return 0;
        }
        return prev - 1;
      });
      setTotalTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [currentIndex, testCompleted, currentQuestion, handleAutoSkip]);

  const handleRadioChange = (value) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.QID]: value,
    }));
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setLogs([]);
    setTestCompleted(false);
    setQuestionStartTime(new Date());
    setTotalTime(0);
    setSubmitting(false);
    const initialDifficulty = questions[0]?.Difficulty || "Medium";
    setTimeLeft(((thresholdsMap || DEFAULT_THRESHOLDS)[initialDifficulty] || DEFAULT_THRESHOLDS.Medium).max);
  };

  // Options configuration based on question type
  const renderOptions = () => {
    if (currentQuestion["Question Type"] === "Likert") {
      let likertOptions = [
        { key: "A", label: currentQuestion["Option A"] },
        { key: "B", label: currentQuestion["Option B"] },
        { key: "C", label: currentQuestion["Option C"] },
        { key: "D", label: currentQuestion["Option D"] },
        { key: "E", label: currentQuestion["Option E"] },
      ].filter((opt) => opt.label && opt.label.trim() !== "");

      if (likertOptions.length === 0) {
        likertOptions = [
          { key: "A", label: "Strongly Disagree" },
          { key: "B", label: "Disagree" },
          { key: "C", label: "Neutral" },
          { key: "D", label: "Agree" },
          { key: "E", label: "Strongly Agree" },
        ];
      }

      return (
        <div className="flex flex-col gap-3 mt-4">
          {likertOptions.map((opt) => (
            <Radio
              key={opt.key}
              name={currentQuestion.QID}
              label={opt.label}
              checked={selectedAnswers[currentQuestion.QID] === opt.key}
              onChange={() => handleRadioChange(opt.key)}
              className="size-5"
            />
          ))}
        </div>
      );
    } else if (currentQuestion["Question Type"] === "MCQ") {
      const mcqOptions = [
        { key: "A", text: currentQuestion["Option A"] },
        { key: "B", text: currentQuestion["Option B"] },
        { key: "C", text: currentQuestion["Option C"] },
        { key: "D", text: currentQuestion["Option D"] },
      ].filter((opt) => opt.text);

      return (
        <div className="flex flex-col gap-3 mt-4">
          {mcqOptions.map((opt) => (
            <Radio
              key={opt.key}
              name={currentQuestion.QID}
              label={`${opt.key}. ${opt.text}`}
              checked={selectedAnswers[currentQuestion.QID] === opt.key}
              onChange={() => handleRadioChange(opt.key)}
              className="size-5"
            />
          ))}
        </div>
      );
    }
    return null;
  };

  if (testCompleted) {
    return (
      <div className="space-y-6">
        <Card className="p-6 text-center space-y-4">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-dark-100">
            Psychometric Test Completed!
          </h3>
          <p className="text-gray-500 dark:text-dark-300">
            All questions have been answered or skipped. Below is the generated payload for the backend.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={handleRestart} color="primary">
              <ArrowPathIcon className="size-4 mr-2" />
              Restart Test
            </Button>
            {onBack && (
              <Button onClick={onBack} variant="outlined" color="secondary">
                Back to Appointments
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-dark-100 border-b pb-2">
            Backend Submission Payload
          </h4>
          <div className="overflow-x-auto">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono max-h-96 overflow-y-auto">
              {JSON.stringify(logs, null, 2)}
            </pre>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-10 text-gray-500 dark:text-dark-300">Loading questions...</div>;
  }

  if (!currentQuestion) {
    return <div>No questions found.</div>;
  }

  // Timer visual variables
  const progressPercent = (timeLeft / thresholds.max) * 100;
  const isTimeCritical = timeLeft <= thresholds.min;
  const isTimeWarning = timeLeft <= thresholds.med && timeLeft > thresholds.min;

  let timerColor = "success";
  if (isTimeCritical) timerColor = "error";
  else if (isTimeWarning) timerColor = "warning";

  return (
    <div className="max-w-3xl mx-auto space-y-5">


        <Welcome 
          testName={examInfo.testName || testData?.testName || "Psychometric Assessment Test"} 
          userName={examInfo.userName || testData?.name || "Travis Fuller"} 
          totalTime={totalTime} 
        />
      <Card className="p-6 relative overflow-hidden flex flex-col justify-between min-h-[400px]">
        {/* Top Progress bar */}
        <div className="absolute top-0 left-0 w-full">
          <Progress value={progressPercent} color={timerColor} className="h-1 rounded-none" />
        </div>

        <div>
          {/* Header info */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-400 dark:text-dark-300">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-dark-100">
                <ClockIcon className="size-4" />
                <span>{timeLeft}s</span>
              </div>
            </div>
          </div>

          {/* Question Text */}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-50 leading-relaxed">
            {currentQuestion.Question}
          </h3>

          {/* Render options list */}
          <div className="mt-6">
            {renderOptions()}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end items-center pt-6 mt-6 border-t">
          <div className="flex gap-2">
            {submitting && (
              <span className="text-sm text-gray-400 dark:text-dark-300 self-center">
                Submitting...
              </span>
            )}
            <Button
              onClick={handleAutoSkip}
              variant="outlined"
              color="warning"
              disabled={submitting}
            >
              Skip Question
            </Button>
            <Button onClick={handleNext} color="primary" disabled={submitting}>
              {currentIndex === questions.length - 1 ? "Finish" : "Next"}
              <ArrowRightIcon className="size-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
