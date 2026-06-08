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
  analyzeSuspiciousBehavior,
  sendAnswerTrackingEvent,
} from "./trackingService";
import { Header } from "./Header";
import { SectionTabs } from "./SectionTabs";
import { QuestionCard } from "./QuestionCard";
import { OptionList } from "./OptionList";
import { CodingEditor } from "./CodingEditor";
import { QuestionPalette } from "./QuestionPalette";
import { FooterActions } from "./FooterActions";
import { SubmitModal } from "./SubmitModal";
import { InstructionsPage } from "./InstructionsPage";
import { SummaryPage } from "./SummaryPage";

const ALL_QUESTION_IDS = QUESTIONS.map((q) => q.id);

export function TestLayout({ onRestart, onPhaseChange }) {
  const [phase, setPhase] = useState("instructions");
  const [currentSection, setCurrentSection] = useState(SECTIONS[0].id);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [tracking, setTracking] = useState(() => createTrackingMap(ALL_QUESTION_IDS));
  const [codingCode, setCodingCode] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(
    EXAM_CONFIG.totalDurationMinutes * 60,
  );
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [suspiciousReport, setSuspiciousReport] = useState(null);

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

  // ── Timer ──
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

  // ── Track question visit ──
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

  const navigateToQuestion = useCallback(
    (questionId) => {
      questionShownRef.current = false;
      const q = QUESTIONS.find((q) => q.id === questionId);
      if (!q) return;
      setCurrentSection(q.section);
      const secQs = getQuestionsBySection(q.section);
      const idx = secQs.findIndex((sq) => sq.id === questionId);
      setCurrentQIndex(idx >= 0 ? idx : 0);
    },
    [],
  );

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

    const report = analyzeSuspiciousBehavior(tracking);
    setSuspiciousReport(report);

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
    setCodingCode({});
    setTimeRemaining(EXAM_CONFIG.totalDurationMinutes * 60);
    setShowSubmitModal(false);
    setSuspiciousReport(null);
    questionShownRef.current = false;
    if (onRestart) onRestart();
  }, [onRestart]);

  // ── Stats for submit modal ──
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
        suspiciousReport={suspiciousReport}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <Header
        timeRemaining={timeRemaining}
        onOpenSubmitModal={() => setShowSubmitModal(true)}
      />

      {/* Section tabs */}
      <SectionTabs
        sections={SECTIONS}
        activeSection={currentSection}
        onSelect={(id) => {
          questionShownRef.current = false;
          setCurrentSection(id);
          setCurrentQIndex(0);
        }}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <QuestionCard
              question={currentQuestion}
              questionIndex={currentQIndex}
              totalInSection={sectionQuestions.length}
            />

            {currentQuestion?.type === "mcq" && (
              <OptionList
                options={currentQuestion.options}
                selectedAnswer={selectedAnswer}
                onSelect={handleSelectAnswer}
              />
            )}

            {currentQuestion?.type === "coding" && (
              <CodingEditor
                code={
                  codingCode[currentQuestion.id] ||
                  currentQuestion.defaultCode ||
                  ""
                }
                onChange={(val) =>
                  setCodingCode((prev) => ({
                    ...prev,
                    [currentQuestion.id]: val,
                  }))
                }
              />
            )}
          </div>

          {/* Footer actions */}
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

        {/* Right sidebar - Question Palette */}
        <div className="hidden w-72 shrink-0 overflow-y-auto border-l border-gray-200 bg-white dark:border-dark-600 dark:bg-dark-800 lg:block">
          <QuestionPalette
            sections={SECTIONS}
            questions={QUESTIONS}
            tracking={tracking}
            currentQuestionId={currentQuestion?.id || ""}
            onNavigate={navigateToQuestion}
          />
        </div>
      </div>

      {/* Submit modal */}
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
