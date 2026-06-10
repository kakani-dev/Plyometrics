import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Page } from "components/shared/Page";
import { getExamResponses } from "services/examApi";
import { loadExamResult } from "app/pages/dashboards/examStorage";

const LIKERT_LABELS = {
  sd: "Strongly Disagree",
  d: "Disagree",
  n: "Neutral",
  a: "Agree",
  sa: "Strongly Agree",
};

export default function UserResponse({ selectedExamId }) {
  const navigate = useNavigate();
  const [responses, setResponses] = useState(null);
  const [loading, setLoading] = useState(!!selectedExamId);
  const [prevExamId, setPrevExamId] = useState(selectedExamId);

  if (selectedExamId !== prevExamId) {
    setPrevExamId(selectedExamId);
    setLoading(!!selectedExamId);
    setResponses(null);
  }

  useEffect(() => {
    if (!selectedExamId) return;

    let active = true;
    (async () => {
      try {
        const res = await getExamResponses(selectedExamId);
        if (!active) return;
        setResponses(res?.data || null);
      } catch {
        if (!active) return;
        const local = loadExamResult(selectedExamId);
        if (local) {
          const answers = Object.values(local.tracking)
            .filter(r => r.selectedAnswer)
            .map(r => {
              const q = local.questions.find(q => q.id === r.questionId);
              return { questionId: r.questionId, text: q?.text, section: q?.section, type: q?.type, selectedAnswer: r.selectedAnswer, correctAnswer: q?.correctAnswer, options: q?.options };
            });
          setResponses({ answers });
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
    if (!responses?.answers) return [];
    return responses.answers;
  }, [responses]);

  const noData = records.length === 0;

  if (loading) {
    return <Page title="User Response"><div className="flex items-center justify-center py-20"><p className="text-gray-500">Loading...</p></div></Page>;
  }

  return (
    <Page title="User Response">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">User Response</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">Review all answered questions and selected responses</p>
            </div>

          </div>
        </div>

        {noData ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <h2 className="text-xl font-medium text-gray-800 dark:text-dark-50">No Responses</h2>
            <p className="text-sm text-gray-500 dark:text-dark-400">Complete a psychometric test first to see your responses.</p>
            <button type="button" onClick={() => navigate("/dashboards/home")} className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700">Go to Test</button>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((r, i) => (
              <div key={r.questionId || i} className="rounded-lg border border-gray-200 p-4 dark:border-dark-600">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">{i + 1}</span>
                    <span className="text-sm text-gray-900 dark:text-dark-50">{r.text || r.questionId}</span>
                  </div>
                </div>
                <div className="ml-8 flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600 dark:bg-dark-700 dark:text-dark-300">{r.type || "--"}</span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600 dark:bg-dark-700 dark:text-dark-300">{r.section?.replace(/-/g, " ") || "--"}</span>
                </div>
                <div className="ml-8 mt-2">
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">Answer: {r.selectedAnswer?.toUpperCase()}</span>
                  {r.type === "likert" && LIKERT_LABELS[r.selectedAnswer] && (
                    <span className="ml-2 text-sm text-gray-500 dark:text-dark-400">({LIKERT_LABELS[r.selectedAnswer]})</span>
                  )}
                  {r.type === "mcq" && r.options && (
                    <span className="ml-2 text-sm text-gray-500 dark:text-dark-400">({r.options.find(o => o.id === r.selectedAnswer)?.text || "--"})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
