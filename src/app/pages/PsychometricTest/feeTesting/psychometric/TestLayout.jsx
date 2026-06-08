import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  SECTIONS,
  QUESTIONS,
  EXAM_CONFIG,
  getQuestionsBySection,
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

const ALL_QUESTION_IDS = QUESTIONS.map((q) => q.id);

export function TestLayout({ onRestart, onPhaseChange }) {
  const [phase, setPhase] = useState("instructions");
  const [currentSection, setCurrentSection] = useState(SECTIONS[0].id);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [tracking, setTracking] = useState(() => createTrackingMap(ALL_QUESTION_IDS));
  const [timeRemaining, setTimeRemaining] = useState(
    EXAM_CONFIG.totalDurationMinutes * 60,
  );
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const timerRef = useRef(null);
  const questionShownRef = useRef(false);
  const submitRef = useRef(null);

  const sectionQuestions = useMemo(
    () => getQuestionsBySection(currentSection),
    [currentSection],
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
        const prevSecQs = getQuestionsBySection(prevSection.id);
        setCurrentQIndex(prevSecQs.length - 1);
      }
    }
  }, [currentQIndex, currentSection]);

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
      setPhase("summary");
      setShowSubmitModal(false);
    });
  }, [tracking]);

  submitRef.current = handleSubmit;

  const handleStartTest = useCallback(() => {
    setPhase("test");
    questionShownRef.current = false;
  }, []);

  const handleRestart = useCallback(() => {
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
            tracking={tracking}
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
