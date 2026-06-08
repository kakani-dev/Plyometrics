import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Page } from "components/shared/Page";

const SECTION_LABELS = {
  "riasec-interest": "RIASEC Interest",
  "big-five-personality": "Big Five Personality",
  "cognitive-ability": "Cognitive Ability",
  "emotional-profile": "Emotional Profile",
  "learning-style": "Learning Style",
  "additional-neuropi-indicators": "Additional NeuroPi Indicators",
  "validity-readiness": "Validity & Readiness",
};

export default function MarksReport() {
  const navigate = useNavigate();

  const data = useMemo(() => {
    try {
      const tracking = JSON.parse(sessionStorage.getItem("examTracking") || "{}");
      const questions = JSON.parse(sessionStorage.getItem("examQuestions") || "[]");
      const config = JSON.parse(sessionStorage.getItem("examConfig") || "{}");
      return { tracking, questions, config };
    } catch {
      return { tracking: {}, questions: [], config: {} };
    }
  }, []);

  const { tracking, questions, config } = data;
  const questionMap = useMemo(
    () => Object.fromEntries(questions.map((q) => [q.id, q])),
    [questions],
  );

  const { sections, overall } = useMemo(() => {
    const records = Object.values(tracking).map((r) => ({
      ...r,
      question: questionMap[r.questionId],
    }));

    const sectionMap = {};
    for (const r of records) {
      const sec = r.question?.section || "unknown";
      if (!sectionMap[sec]) {
        sectionMap[sec] = { id: sec, total: 0, answered: 0, marks: 0, maxMarks: 0 };
      }
      sectionMap[sec].total++;
      if (r.selectedAnswer) sectionMap[sec].answered++;
    }

    const sections = Object.values(sectionMap).map((s) => {
      if (s.id === "cognitive-ability") {
        s.maxMarks = s.total;
        const correct = records.filter(
          (r) => r.question?.section === s.id && r.question?.type === "mcq",
        ).length;
        s.marks = correct;
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
    const totalAnswered = sections.reduce((sum, s) => sum + s.answered, 0);
    const totalQuestions = sections.reduce((sum, s) => sum + s.total, 0);

    return {
      sections,
      overall: {
        totalQuestions,
        totalAnswered,
        totalMarks,
        totalMax,
        percentage: totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0,
      },
    };
  }, [tracking, questionMap]);

  const noData = sections.length === 0;

  return (
    <Page title="Marks Report">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="mb-6">
          <h2 className="text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            Marks Report
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">
            {config.title || "Psychometric Assessment"}
          </p>
        </div>

        {noData ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <h2 className="text-xl font-medium text-gray-800 dark:text-dark-50">
              No Marks Data
            </h2>
            <p className="text-sm text-gray-500 dark:text-dark-400">
              Complete a psychometric test first to see your marks.
            </p>
            <button
              type="button"
              onClick={() => navigate("/dashboards/home")}
              className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Go to Test
            </button>
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
                const label = SECTION_LABELS[sec.id] || sec.id.replace(/-/g, " ");
                return (
                  <div
                    key={sec.id}
                    className="rounded-lg border border-gray-200 p-4 dark:border-dark-600"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-50 capitalize">
                        {label}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-dark-400">
                        {sec.marks}/{sec.maxMarks} &middot; {sec.percentage}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-dark-600">
                      <div
                        className={`h-full rounded-full transition-all ${
                          sec.percentage >= 80
                            ? "bg-green-500"
                            : sec.percentage >= 50
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${sec.percentage}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400 dark:text-dark-500">
                      {sec.answered}/{sec.total} questions answered
                    </p>
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
