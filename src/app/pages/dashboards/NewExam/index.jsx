import { Page } from "components/shared/Page";

import UserScreen from "./../UserScreen";
import TestScreen from "./Components/TestScreen";
import ResultsScreen from "./Components/ResultsScreen";
import MetricDetailModal from "./Components/MetricDetailModal";
import Header from "./Components/Header";
import { useExamLogic } from "./hooks/useExamLogic";
import { formatTime, getStrokeDashOffset } from "./utils";
import "./styles.css";

export default function NewExam() {
  const {
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
  } = useExamLogic();

  if (currentScreen === "welcome") {
    return (
      <UserScreen
        setProfile={setProfile}
        handleStartTest={handleStartTest}
      />
    );
  }

  return (
    <Page title="New Exam">
      <div className="new-exam-wrapper neuropi-portal transition-content w-full min-h-screen pb-12">
        <Header currentScreen={currentScreen} profile={profile} />

        <main className="app-main">
          {currentScreen === "test" && currentQuestion && (
            <TestScreen
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              questionsLength={totalQuestionsCount}
              timeElapsed={timeElapsed}
              formatTime={formatTime}
              progressPercent={progressPercent}
              selectedAnswers={selectedAnswers}
              handleAnswerSelect={handleAnswerSelect}
              questionTimeSpent={questionTimeSpent}
              handleNextQuestion={handleNextQuestion}
              consoleLogs={consoleLogs}
              consoleEndRef={consoleEndRef}
              servedQuestionsHistory={servedQuestionsHistory}
            />
          )}

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
              resultsData={resultsData}
              generatingAiReport={generatingAiReport}
              handleGenerateAiReport={handleGenerateAiReport}
            />
          )}
        </main>

        <MetricDetailModal
          selectedMetric={selectedMetric}
          setSelectedMetric={setSelectedMetric}
          resultsData={resultsData}
        />
      </div>
    </Page>
  );
}
