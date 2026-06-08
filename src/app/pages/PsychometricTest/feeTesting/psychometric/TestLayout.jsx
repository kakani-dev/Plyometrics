import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import PropTypes from "prop-types";
import {
  SECTIONS,
  QUESTIONS,
  EXAM_CONFIG,
} from "./mockData";
import {
  createTrackingMap,
  visitQuestion,
  selectAnswer,
  markForReview,
  clearAnswer,
  sendAnswerTrackingEvent,
} from "./trackingService";
import { Header } from "../tcsNqt/Header";
import { QuestionCard } from "../tcsNqt/QuestionCard";
import { FooterActions } from "../tcsNqt/FooterActions";
import { SubmitModal } from "../tcsNqt/SubmitModal";
import { LikertList } from "./LikertList";
import { OptionList } from "../tcsNqt/OptionList";
import { InstructionsPage } from "./InstructionsPage";
import { SummaryPage } from "./SummaryPage";

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const ALL_QUESTION_IDS = QUESTIONS.map((q) => q.id);

export function TestLayout({ onRestart, onPhaseChange }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("instructions");
  const [currentSection, setCurrentSection] = useState(SECTIONS[0].id);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [tracking, setTracking] = useState(() => createTrackingMap(ALL_QUESTION_IDS));
  const [timeRemaining, setTimeRemaining] = useState(
    EXAM_CONFIG.totalDurationMinutes * 60,
  );
  const [shuffledQuestions, setShuffledQuestions] = useState(() => [...QUESTIONS]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const timerRef = useRef(null);
  const questionShownRef = useRef(false);
  const submitRef = useRef(null);

  const sectionQuestions = useMemo(
    () => shuffledQuestions.filter((q) => q.section === currentSection),
    [currentSection, shuffledQuestions],
  );

  const currentQuestion = sectionQuestions[currentQIndex];
  const hasPrevious = currentQIndex > 0 || SECTIONS.findIndex((s) => s.id === currentSection) > 0;
  const hasNext =
    currentQIndex < sectionQuestions.length - 1 ||
    SECTIONS.findIndex((s) => s.id === currentSection) < SECTIONS.length - 1;

  useEffect(() => {
    if (phase !== "test") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "test" && currentQuestion && !questionShownRef.current) {
      setTracking((prev) => visitQuestion(prev, currentQuestion.id));
      questionShownRef.current = true;
    }
  }, [phase, currentQuestion]);

  useEffect(() => {
    if (onPhaseChange) {
      onPhaseChange(phase);
    }
  }, [phase, onPhaseChange]);

  const handleSaveNext = useCallback(() => {
    questionShownRef.current = false;
    if (currentQIndex < sectionQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      const currentSecIdx = SECTIONS.findIndex((s) => s.id === currentSection);
      if (currentSecIdx < SECTIONS.length - 1) {
        const nextSection = SECTIONS[currentSecIdx + 1];
        setCurrentSection(nextSection.id);
        setCurrentQIndex(0);
      }
    }
  }, [currentQIndex, sectionQuestions, currentSection]);

  const handleNext = useCallback(() => {
    handleSaveNext();
  }, [handleSaveNext]);

  const handlePrevious = useCallback(() => {
    questionShownRef.current = false;
    if (currentQIndex > 0) {
      setCurrentQIndex((prev) => prev - 1);
    } else {
      const currentSecIdx = SECTIONS.findIndex((s) => s.id === currentSection);
      if (currentSecIdx > 0) {
        const prevSection = SECTIONS[currentSecIdx - 1];
        setCurrentSection(prevSection.id);
        const prevSecQs = shuffledQuestions.filter((q) => q.section === prevSection.id);
        setCurrentQIndex(prevSecQs.length - 1);
      }
    }
  }, [currentQIndex, currentSection, shuffledQuestions]);

  const handleSelectAnswer = useCallback(
    (answer) => {
      if (!currentQuestion) return;
      setTracking((prev) => selectAnswer(prev, currentQuestion.id, answer));
    },
    [currentQuestion],
  );

  const handleMarkReview = useCallback(() => {
    if (!currentQuestion) return;
    setTracking((prev) => markForReview(prev, currentQuestion.id));
  }, [currentQuestion]);

  const handleClearResponse = useCallback(() => {
    if (!currentQuestion) return;
    setTracking((prev) => clearAnswer(prev, currentQuestion.id));
  }, [currentQuestion]);

  const handleSubmit = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsedSeconds = EXAM_CONFIG.totalDurationMinutes * 60 - timeRemaining;
    sessionStorage.setItem("examTracking", JSON.stringify(tracking));
    sessionStorage.setItem("examQuestions", JSON.stringify(shuffledQuestions));
    sessionStorage.setItem("examElapsed", JSON.stringify(elapsedSeconds));
    sessionStorage.setItem("examConfig", JSON.stringify(EXAM_CONFIG));

    Promise.all(
      Object.values(tracking).map((record) =>
        sendAnswerTrackingEvent({
          questionId: record.questionId,
          selectedAnswer: record.selectedAnswer,
          questionShownAt: record.questionShownAt,
          answerSelectedAt: record.answerSelectedAt,
          timeTakenSeconds: record.timeTakenSeconds,
        }),
      ),
    ).then(() => {
      setShowSubmitModal(false);
      navigate("/dashboards/user-exam-report");
    });
  }, [tracking, timeRemaining, shuffledQuestions, navigate]);

  submitRef.current = handleSubmit;

  const handleStartTest = useCallback(() => {
    sessionStorage.removeItem("examTracking");
    sessionStorage.removeItem("examQuestions");
    sessionStorage.removeItem("examElapsed");
    sessionStorage.removeItem("examConfig");
    setShuffledQuestions(shuffleArray(QUESTIONS));
    setPhase("test");
    questionShownRef.current = false;
  }, []);

  const handleRestart = useCallback(() => {
    setShuffledQuestions([...QUESTIONS]);
    setPhase("instructions");
    setCurrentSection(SECTIONS[0].id);
    setCurrentQIndex(0);
    setTracking(createTrackingMap(ALL_QUESTION_IDS));
    setTimeRemaining(EXAM_CONFIG.totalDurationMinutes * 60);
    setShowSubmitModal(false);
    questionShownRef.current = false;
    if (onRestart) onRestart();
  }, [onRestart]);

  const submitStats = useMemo(() => {
    const records = Object.values(tracking);
    return {
      total: records.length,
      answered: records.filter(
        (r) => r.status === "answered" || r.status === "answered-and-marked",
      ).length,
      notAnswered: records.filter(
        (r) => r.status === "not-answered" || r.status === "not-visited",
      ).length,
      markedForReview: records.filter((r) => r.status === "marked-for-review").length,
      answeredAndMarked: records.filter(
        (r) => r.status === "answered-and-marked",
      ).length,
    };
  }, [tracking]);

  const currentTracking = currentQuestion ? tracking[currentQuestion.id] : null;
  const selectedAnswer = currentTracking?.selectedAnswer || null;
  const elapsedSeconds = EXAM_CONFIG.totalDurationMinutes * 60 - timeRemaining;

  if (phase === "instructions") {
    return <InstructionsPage onStart={handleStartTest} />;
  }

  if (phase === "summary") {
    return (
      <SummaryPage
        tracking={tracking}
        timeTaken={elapsedSeconds}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-dark-900">
      <Header
        timeRemaining={timeRemaining}
        onOpenSubmitModal={() => setShowSubmitModal(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto">
            <QuestionCard
              question={currentQuestion}
              questionIndex={currentQIndex}
              totalInSection={sectionQuestions.length}
            />

            {currentQuestion?.type === "likert" && (
              <LikertList
                selectedAnswer={selectedAnswer}
                onSelect={handleSelectAnswer}
              />
            )}

            {currentQuestion?.type === "mcq" && (
              <OptionList
                options={currentQuestion.options}
                selectedAnswer={selectedAnswer}
                onSelect={handleSelectAnswer}
              />
            )}
          </div>

          <FooterActions
            onPrevious={handlePrevious}
            onClear={handleClearResponse}
            onMarkReview={handleMarkReview}
            onSaveNext={handleSaveNext}
            onNext={handleNext}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            hasSelectedAnswer={!!selectedAnswer}
            onOpenSubmitModal={() => setShowSubmitModal(true)}
          />
        </div>
      </div>

      <SubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleSubmit}
        stats={submitStats}
      />
    </div>
  );
}

TestLayout.propTypes = {
  onRestart: PropTypes.func,
  onPhaseChange: PropTypes.func,
};
