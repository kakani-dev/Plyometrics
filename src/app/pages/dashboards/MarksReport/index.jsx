import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Page } from "components/shared/Page";
import { getExamMarks } from "services/examApi";
import { loadExamResult } from "app/pages/dashboards/examStorage";

const SECTION_LABELS = {
  "riasec-interest": "RIASEC Interest",
  "big-five-personality": "Big Five Personality",
  "cognitive-ability": "Cognitive Ability",
  "emotional-profile": "Emotional Profile",
  "learning-style": "Learning Style",
  "additional-neuropi-indicators": "Additional NeuroPi Indicators",
  "validity-readiness": "Validity & Readiness",
};

export default function MarksReport({ selectedExamId }) {
  const navigate = useNavigate();
  const [marksData, setMarksData] = useState(null);
  const [loading, setLoading] = useState(!!selectedExamId);
  const [prevExamId, setPrevExamId] = useState(selectedExamId);

  if (selectedExamId !== prevExamId) {
    setPrevExamId(selectedExamId);
    setLoading(!!selectedExamId);
    setMarksData(null);
  }

  useEffect(() => {
    if (!selectedExamId) return;

    let active = true;
    (async () => {
      try {
        const res = await getExamMarks(selectedExamId);
        if (!active) return;
        setMarksData(res?.data || null);
      } catch {
        if (!active) return;
        const local = loadExamResult(selectedExamId);
        if (local) {
          const tracking = Object.values(local.tracking).map(r => ({ ...r, question: local.questions.find(q => q.id === r.questionId) }));
          const sectionMap = {};
          for (const r of tracking) {
            const sec = r.question?.section || "unknown";
            if (!sectionMap[sec]) sectionMap[sec] = { id: sec, total: 0, answered: 0, marks: 0, maxMarks: 0 };
            sectionMap[sec].total++;
            if (r.selectedAnswer) sectionMap[sec].answered++;
          }
          const sections = Object.values(sectionMap).map(s => {
            if (s.id === "cognitive-ability") {
              s.maxMarks = s.total;
              s.marks = tracking.filter(r => r.question?.section === s.id && r.question?.type === "mcq" && r.selectedAnswer != null && r.selectedAnswer === r.question?.correctAnswer).length;
              s.percentage = s.maxMarks > 0 ? Math.round((s.marks / s.maxMarks) * 100) : 0;
            } else {
              s.maxMarks = s.answered;
              s.marks = s.answered;
              s.percentage = s.maxMarks > 0 ? 100 : 0;
            }
            return s;
          });
          const totalMarks = sections.reduce((sum, s) => sum + s.marks, 0);
          const totalMax = sections.reduce((sum, s) => sum + s.maxMarks, 0);
          setMarksData({
            totalQuestions: sections.reduce((sum, s) => sum + s.total, 0),
            answeredCount: sections.reduce((sum, s) => sum + s.answered, 0),
            totalMarks, maxMarks: totalMax,
            percentage: totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0,
            sections,
          });
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

  const sections = marksData?.sections || [];
  const overall = useMemo(() => ({
    totalQuestions: marksData?.totalQuestions || 0,
    totalAnswered: marksData?.answeredCount || 0,
    totalMarks: marksData?.totalMarks || 0,
    totalMax: marksData?.maxMarks || 0,
    percentage: marksData?.percentage || 0,
  }), [marksData]);

  const noData = sections.length === 0;

  if (loading) {
    return <Page title="Marks Report"><div className="flex items-center justify-center py-20"><p className="text-gray-500">Loading...</p></div></Page>;
  }

  return (
    <Page title="Marks Report">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">Marks Report</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">Psychometric Assessment</p>
            </div>

          </div>
        </div>

        {noData ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <h2 className="text-xl font-medium text-gray-800 dark:text-dark-50">No Marks Data</h2>
            <p className="text-sm text-gray-500 dark:text-dark-400">Complete a psychometric test first to see your marks.</p>
            <button type="button" onClick={() => navigate("/dashboards/home")} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700">Go to Test</button>
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <SummaryCard label="Total Questions" value={overall.totalQuestions} color="info" />
              <SummaryCard label="Answered" value={overall.totalAnswered} color="success" />
              <SummaryCard label="Total Marks" value={`${overall.totalMarks}/${overall.totalMax}`} color="primary" />
              <SummaryCard label="Percentage" value={`${overall.percentage}%`} color={overall.percentage >= 50 ? "success" : "error"} />
            </div>

            <div className="space-y-4">
              {sections.map((sec) => {
                const label = SECTION_LABELS[sec.section || sec.id] || (sec.section || sec.id).replace(/-/g, " ");
                return (
                  <div key={sec.section || sec.id} className="rounded-lg border border-gray-200 p-4 dark:border-dark-600">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-50 capitalize">{label}</h3>
                      <span className="text-xs text-gray-500 dark:text-dark-400">{sec.marks}/{sec.maxMarks} &middot; {sec.percentage}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-dark-600">
                      <div className={`h-full rounded-full transition-all ${sec.percentage >= 80 ? "bg-green-500" : sec.percentage >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${sec.percentage}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-gray-400 dark:text-dark-500">{sec.answered}/{sec.total} questions answered</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Page>
  );
}

function SummaryCard({ label, value, color }) {
  const colors = {
    primary: "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-900/20 dark:text-primary-300",
    info: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    success: "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300",
    error: "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300",
    warning: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  };
  return (
    <div className={`rounded-lg border p-4 text-center ${colors[color] || colors.info}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}
