import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Page } from "components/shared/Page";
import { getExamReport } from "services/examApi";
import { loadExamResult } from "app/pages/dashboards/examStorage";

const FLAG_THRESHOLD = { likert: 2, mcq: 5 };

function getFlagLevel(timeTaken, type) {
  if (timeTaken == null) return null;
  if (timeTaken < 1) return "critical";
  if (timeTaken < (FLAG_THRESHOLD[type] || FLAG_THRESHOLD.likert)) return "warning";
  return "normal";
}

function formatTime(seconds) {
  if (seconds == null) return "--";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export default function UserExamReport({ selectedExamId }) {
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(!!selectedExamId);
  const [prevExamId, setPrevExamId] = useState(selectedExamId);

  if (selectedExamId !== prevExamId) {
    setPrevExamId(selectedExamId);
    setLoading(!!selectedExamId);
    setExamData(null);
  }

  useEffect(() => {
    if (!selectedExamId) return;

    let active = true;
    (async () => {
      try {
        const res = await getExamReport(selectedExamId);
        if (!active) return;
        setExamData(res?.data || null);
      } catch {
        if (!active) return;
        const local = loadExamResult(selectedExamId);
        if (local) {
          const tracking = Object.values(local.tracking).map(r => ({
            questionId: r.questionId,
            selectedAnswer: r.selectedAnswer,
            timeTakenSeconds: r.timeTakenSeconds,
            status: r.status,
            questionText: local.questions.find(q => q.id === r.questionId)?.text,
            section: local.questions.find(q => q.id === r.questionId)?.section,
            type: local.questions.find(q => q.id === r.questionId)?.type,
          }));
          setExamData({ questions: tracking, totalQuestions: local.questions.length, status: "completed", completedAt: null });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedExamId]);

  const records = useMemo(() => {
    if (!examData?.questions) return [];
    return examData.questions.map(q => {
      const flagLevel = getFlagLevel(q.timeTakenSeconds, q.type);
      return { ...q, flagLevel, question: q };
    });
  }, [examData]);

  const stats = useMemo(() => {
    const total = records.length;
    const answered = records.filter(r => r.selectedAnswer).length;
    const notAnswered = total - answered;
    const flagged = records.filter(r => r.flagLevel === "warning" || r.flagLevel === "critical").length;
    const critical = records.filter(r => r.flagLevel === "critical").length;
    const avgTime = answered > 0 ? records.reduce((sum, r) => sum + (r.timeTakenSeconds || 0), 0) / answered : 0;
    return { total, answered, notAnswered, flagged, critical, avgTime };
  }, [records]);

  if (loading) {
    return <Page title="User Exam Report"><div className="flex items-center justify-center py-20"><p className="text-gray-500">Loading...</p></div></Page>;
  }

  const noData = records.length === 0;

  if (noData) {
    return (
      <Page title="User Exam Report">
        <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <h2 className="text-xl font-medium text-gray-800 dark:text-dark-50">No Exam Data</h2>
            <p className="text-sm text-gray-500 dark:text-dark-400">Complete a psychometric test first to see your report.</p>
            <button type="button" onClick={() => navigate("/dashboards/home")} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700">Go to Test</button>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="User Exam Report">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">User Exam Report</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">Psychometric Assessment</p>
            </div>

          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <SummaryCard label="Total Questions" value={stats.total} color="info" />
          <SummaryCard label="Answered" value={stats.answered} color="success" />
          <SummaryCard label="Not Answered" value={stats.notAnswered} color="error" />
          <SummaryCard label="Avg Time" value={formatTime(stats.avgTime)} color="secondary" />
          <SummaryCard label="Flagged" value={stats.flagged} color="warning" />
          <SummaryCard label="Critical" value={stats.critical} color="error" />
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 dark:border-dark-600">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 dark:bg-dark-700">
                <tr>
                  <th className="px-4 py-2 font-medium text-gray-600 dark:text-dark-300">#</th>
                  <th className="px-4 py-2 font-medium text-gray-600 dark:text-dark-300">Question</th>
                  <th className="px-4 py-2 font-medium text-gray-600 dark:text-dark-300">Section</th>
                  <th className="px-4 py-2 font-medium text-gray-600 dark:text-dark-300">Type</th>
                  <th className="px-4 py-2 font-medium text-gray-600 dark:text-dark-300">Answer</th>
                  <th className="px-4 py-2 font-medium text-gray-600 dark:text-dark-300">Time</th>
                  <th className="px-4 py-2 font-medium text-gray-600 dark:text-dark-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
                {records.map((r, i) => (
                  <tr key={r.questionId || i}
                    className={`${r.flagLevel === "critical" ? "bg-red-50 dark:bg-red-900/10" : r.flagLevel === "warning" ? "bg-amber-50 dark:bg-amber-900/10" : ""}`}>
                    <td className="px-4 py-2 text-gray-500 dark:text-dark-400">{i + 1}</td>
                    <td className="max-w-xs truncate px-4 py-2 text-gray-900 dark:text-dark-50">{r.questionText || r.questionId}</td>
                    <td className="px-4 py-2 capitalize text-gray-700 dark:text-dark-200">{r.section?.replace(/-/g, " ") || "--"}</td>
                    <td className="px-4 py-2 capitalize text-gray-700 dark:text-dark-200">{r.type || "--"}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-dark-200">
                      {r.selectedAnswer ? <span className="font-medium text-primary-600 dark:text-primary-400">{r.selectedAnswer.toUpperCase()}</span> : <span className="text-gray-400">--</span>}
                    </td>
                    <td className="px-4 py-2 text-gray-700 dark:text-dark-200">{formatTime(r.timeTakenSeconds)}</td>
                    <td className="px-4 py-2"><StatusBadge status={r.status} flagLevel={r.flagLevel} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 p-4 dark:border-dark-600">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-dark-50">Timing Flag Legend</h3>
          <div className="space-y-2 text-xs text-gray-600 dark:text-dark-300">
            <p><span className="inline-block size-3 rounded bg-red-400 align-middle" />&nbsp; <strong>Critical</strong> &mdash; answered in under 1s (likely random)</p>
            <p><span className="inline-block size-3 rounded bg-amber-400 align-middle" />&nbsp; <strong>Rushed</strong> &mdash; Likert answered under 2s / MCQ under 5s</p>
            <p><span className="inline-block size-3 rounded bg-green-400 align-middle" />&nbsp; <strong>Normal</strong> &mdash; reasonable response time</p>
            <p><span className="inline-block size-3 rounded bg-gray-300 align-middle" />&nbsp; <strong>Not visited / Not answered</strong></p>
          </div>
        </div>

        <div className="flex justify-center pb-6">
          <button type="button" onClick={() => navigate("/dashboards/home")} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700">Back to Dashboard</button>
        </div>
      </div>
    </Page>
  );
}

function SummaryCard({ label, value, color }) {
  const colors = {
    info: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    success: "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300",
    error: "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300",
    warning: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    secondary: "border-gray-300 bg-gray-50 text-gray-700 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-200",
    primary: "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-900/20 dark:text-primary-300",
  };
  return (
    <div className={`rounded-lg border p-4 text-center ${colors[color] || colors.secondary}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}

function StatusBadge({ status, flagLevel }) {
  const styles = {
    normal: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    "not-answered": "bg-gray-100 text-gray-500 dark:bg-dark-700 dark:text-dark-400",
    "not-visited": "bg-gray-100 text-gray-400 dark:bg-dark-700 dark:text-dark-500",
  };
  let label = status?.replace(/-/g, " ") || "unknown";
  let styleKey = status;
  if (flagLevel === "critical") { styleKey = "critical"; label = "very rushed"; }
  else if (flagLevel === "warning") { styleKey = "warning"; label = "rushed"; }
  else if (status === "answered" || status === "answered-and-marked") { styleKey = "normal"; label = "genuine"; }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[styleKey] || styles["not-visited"]}`}>{label}</span>
  );
}
