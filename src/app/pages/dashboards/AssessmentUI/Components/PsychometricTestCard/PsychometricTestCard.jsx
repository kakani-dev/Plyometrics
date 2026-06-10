import { useState, useEffect, useCallback } from "react";
import { Card, Radio, Button, Progress, Badge } from "components/ui";
import { ClockIcon, ArrowRightIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import questionsData from "./psychometrictest.json";
import { TIME_THRESHOLDS } from "./data";
import { Welcome } from "./Welcome";


export function PsychometricTestCard({ testData, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [questionStartTime, setQuestionStartTime] = useState(() => new Date());
  const [totalTime, setTotalTime] = useState(0);
  
  const currentQuestion = questionsData[currentIndex];
  const difficulty = currentQuestion?.Difficulty || "Medium";
  const thresholds = TIME_THRESHOLDS[difficulty] || TIME_THRESHOLDS.Medium;
  
  const [timeLeft, setTimeLeft] = useState(thresholds.max);
  const [logs, setLogs] = useState([]);
  const [testCompleted, setTestCompleted] = useState(false);

  // Handle automatic skipping when max time is reached
  const handleAutoSkip = useCallback(() => {
    if (!currentQuestion) return;
    const endTime = new Date();
    const durationMs = endTime - questionStartTime;
    const durationMinutes = parseFloat((durationMs / 60000).toFixed(4));

    const newLog = {
      qid: currentQuestion.QID,
      question: currentQuestion.Question,
      type: currentQuestion["Question Type"],
      difficulty,
      thresholds,
      startedAt: questionStartTime.toISOString(),
      endedAt: endTime.toISOString(),
      durationMinutes,
      durationSeconds: parseFloat((durationMs / 1000).toFixed(2)),
      selectedAnswer: "AUTO_SKIPPED_TIMEOUT",
      status: "Skipped (Timeout)",
    };

    setLogs((prev) => [...prev, newLog]);

    // Move to next question or complete
    if (currentIndex < questionsData.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextQuestion = questionsData[nextIndex];
      const nextDifficulty = nextQuestion?.Difficulty || "Medium";
      const nextThresholds = TIME_THRESHOLDS[nextDifficulty] || TIME_THRESHOLDS.Medium;
      
      setCurrentIndex(nextIndex);
      setQuestionStartTime(new Date());
      setTimeLeft(nextThresholds.max);
    } else {
      setTestCompleted(true);
    }
  }, [currentIndex, currentQuestion, difficulty, thresholds, questionStartTime]);

  // Handle user submitting/moving next
  const handleNext = useCallback(() => {
    if (!currentQuestion) return;

    const endTime = new Date();
    const durationMs = endTime - questionStartTime;
    const durationMinutes = parseFloat((durationMs / 60000).toFixed(4));
    const answer = selectedAnswers[currentQuestion.QID] || "";

    const newLog = {
      qid: currentQuestion.QID,
      question: currentQuestion.Question,
      type: currentQuestion["Question Type"],
      difficulty,
      thresholds,
      startedAt: questionStartTime.toISOString(),
      endedAt: endTime.toISOString(),
      durationMinutes,
      durationSeconds: parseFloat((durationMs / 1000).toFixed(2)),
      selectedAnswer: answer,
      status: answer ? "Answered" : "Skipped (Manual)",
    };

    setLogs((prev) => {
      const filtered = prev.filter((l) => l.qid !== currentQuestion.QID);
      return [...filtered, newLog];
    });

    if (currentIndex < questionsData.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextQuestion = questionsData[nextIndex];
      const nextDifficulty = nextQuestion?.Difficulty || "Medium";
      const nextThresholds = TIME_THRESHOLDS[nextDifficulty] || TIME_THRESHOLDS.Medium;

      setCurrentIndex(nextIndex);
      setQuestionStartTime(new Date());
      setTimeLeft(nextThresholds.max);
    } else {
      setTestCompleted(true);
    }
  }, [currentIndex, currentQuestion, difficulty, thresholds, questionStartTime, selectedAnswers]);

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
    const initialDifficulty = questionsData[0]?.Difficulty || "Medium";
    setTimeLeft((TIME_THRESHOLDS[initialDifficulty] || TIME_THRESHOLDS.Medium).max);
  };

  // Options configuration based on question type
  const renderOptions = () => {
    if (currentQuestion["Question Type"] === "Likert") {
      const likertOptions = [
        { label: "Strongly Disagree", value: "1" },
        { label: "Disagree", value: "2" },
        { label: "Neutral", value: "3" },
        { label: "Agree", value: "4" },
        { label: "Strongly Agree", value: "5" },
      ];

      return (
        <div className="flex flex-col gap-3 mt-4">
          {likertOptions.map((opt) => (
            <Radio
              key={opt.value}
              name={currentQuestion.QID}
              label={opt.label}
              checked={selectedAnswers[currentQuestion.QID] === opt.value}
              onChange={() => handleRadioChange(opt.value)}
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
          testName={testData?.testName || "Psychometric Assessment Test"} 
          userName={testData?.name || "Travis Fuller"} 
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
                Question {currentIndex + 1} of {questionsData.length}
              </span>
              <Badge variant="soft" color="info">
                {currentQuestion.Domain}
              </Badge>
              <Badge variant="soft" color="secondary">
                {currentQuestion.Subdomain}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                color={
                  difficulty === "Easy"
                    ? "success"
                    : difficulty === "Medium"
                    ? "warning"
                    : "error"
                }
              >
                {difficulty}
              </Badge>
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
            <Button
              onClick={handleAutoSkip}
              variant="outlined"
              color="warning"
            >
              Skip Question
            </Button>
            <Button onClick={handleNext} color="primary">
              {currentIndex === questionsData.length - 1 ? "Finish" : "Next"}
              <ArrowRightIcon className="size-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
