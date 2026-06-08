import PropTypes from "prop-types";
import {
  CheckCircleIcon,
  XCircleIcon,
  BookmarkIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { Avatar, Card } from "components/ui";
import { SECTIONS, QUESTIONS } from "./mockData";
import { SuspicionIndicator } from "./SuspicionIndicator";

export function SummaryPage({
  tracking,
  timeTaken,
  suspiciousReport,
  onRestart,
}) {
  const answered = Object.values(tracking).filter(
    (r) => r.status === "answered" || r.status === "answered-and-marked",
  ).length;
  const notAnswered = Object.values(tracking).filter(
    (r) => r.status === "not-answered" || r.status === "not-visited",
  ).length;
  const markedForReview = Object.values(tracking).filter(
    (r) => r.status === "marked-for-review" || r.status === "answered-and-marked",
  ).length;
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-400">
          Assessment Summary
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">
          Time taken: {minutes}m {seconds}s
        </p>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5 lg:gap-6">
        <SummaryCard label="Total" value={Object.keys(tracking).length} icon={<CubeIcon className="size-6" />} color="info" />
        <SummaryCard label="Answered" value={answered} icon={<CheckCircleIcon className="size-6" />} color="success" />
        <SummaryCard label="Not Answered" value={notAnswered} icon={<XCircleIcon className="size-6" />} color="error" />
        <SummaryCard label="Marked for Review" value={markedForReview} icon={<BookmarkIcon className="size-6" />} color="warning" />
      </div>

      {/* Suspicion analysis */}
      {suspiciousReport && (
        <div className="mb-6">
          <SuspicionIndicator
            fastAnswersCount={suspiciousReport.fastAnswerCount}
            totalQuestions={Object.keys(tracking).length}
            timeTakenSeconds={timeTaken}
          />
        </div>
      )}

      {/* Section-wise breakdown */}
      <div className="mb-6 space-y-4">
        {SECTIONS.map((section) => {
          const sectionQs = QUESTIONS.filter((q) => q.section === section.id);
          const sectionAnswered = sectionQs.filter(
            (q) =>
              tracking[q.id]?.status === "answered" ||
              tracking[q.id]?.status === "answered-and-marked",
          ).length;
          return (
            <div
              key={section.id}
              className="rounded-lg border border-gray-200 p-4 dark:border-dark-600"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-50">
                  {section.label}
                </h3>
                <span className="text-xs text-gray-500 dark:text-dark-400">
                  {sectionAnswered}/{section.questionCount} answered
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-dark-600">
                <div
                  className="h-full rounded-full bg-primary-400 transition-all"
                  style={{
                    width: `${(sectionAnswered / section.questionCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Answer details table */}
      <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 dark:border-dark-600">
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-gray-100 dark:bg-dark-700">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-600 dark:text-dark-300">#</th>
                <th className="px-3 py-2 font-medium text-gray-600 dark:text-dark-300">Section</th>
                <th className="px-3 py-2 font-medium text-gray-600 dark:text-dark-300">Answer</th>
                <th className="px-3 py-2 font-medium text-gray-600 dark:text-dark-300">Time</th>
                <th className="px-3 py-2 font-medium text-gray-600 dark:text-dark-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
              {QUESTIONS.map((q, idx) => {
                const record = tracking[q.id];
                const status = record?.status || "not-visited";
                const isSuspicious = record?.suspiciousFlag;
                const sectionLabel = SECTIONS.find((s) => s.id === q.section)?.label || "";

                let statusBadge;
                if (status === "answered" || status === "answered-and-marked") {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      {status === "answered-and-marked" ? "Answered & Reviewed" : "Answered"}
                    </span>
                  );
                } else if (status === "marked-for-review") {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      Reviewed
                    </span>
                  );
                } else {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      Not Answered
                    </span>
                  );
                }

                return (
                  <tr
                    key={q.id}
                    className={
                      isSuspicious
                        ? "bg-rose-50/50 dark:bg-rose-900/10"
                        : ""
                    }
                  >
                    <td className="px-3 py-2 text-gray-500 dark:text-dark-400">{idx + 1}</td>
                    <td className="px-3 py-2 text-xs text-gray-600 dark:text-dark-300">
                      {sectionLabel}
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-dark-200">
                      {record?.selectedAnswer
                        ? (q.options
                            ?.find((o) => o.id === record.selectedAnswer)
                            ?.text?.slice(0, 20) || record.selectedAnswer)
                        : "—"}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-gray-600 dark:text-dark-300">
                      {record?.timeTakenSeconds !== null
                        ? `${record.timeTakenSeconds.toFixed(1)}s`
                        : "—"}
                    </td>
                    <td className="px-3 py-2">{statusBadge}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          Restart Assessment
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, color }) {
  return (
    <Card className="flex justify-between p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-400">
          {label}
        </p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-dark-50">
          {value}
        </p>
      </div>
      <Avatar
        size={12}
        classNames={{ display: "mask is-squircle rounded-none" }}
        initialVariant="soft"
        initialColor={color}
      >
        {icon}
      </Avatar>
    </Card>
  );
}

SummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
};

SummaryPage.propTypes = {
  tracking: PropTypes.object.isRequired,
  timeTaken: PropTypes.number.isRequired,
  suspiciousReport: PropTypes.object,
  onRestart: PropTypes.func.isRequired,
};
