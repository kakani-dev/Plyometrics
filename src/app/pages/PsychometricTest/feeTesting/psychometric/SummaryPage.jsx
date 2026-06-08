import PropTypes from "prop-types";
import {
  CheckCircleIcon,
  XCircleIcon,
  BookmarkIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { Avatar, Card } from "components/ui";
import { SECTIONS, QUESTIONS } from "./mockData";

export function SummaryPage({
  tracking,
  timeTaken,
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
          Assessment Complete
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">
          Time taken: {minutes}m {seconds}s
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5 lg:gap-6">
        <SummaryCard label="Total" value={Object.keys(tracking).length} icon={<CubeIcon className="size-6" />} color="info" />
        <SummaryCard label="Answered" value={answered} icon={<CheckCircleIcon className="size-6" />} color="success" />
        <SummaryCard label="Not Answered" value={notAnswered} icon={<XCircleIcon className="size-6" />} color="error" />
        <SummaryCard label="Marked for Review" value={markedForReview} icon={<BookmarkIcon className="size-6" />} color="warning" />
      </div>

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

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          Retake Assessment
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
  onRestart: PropTypes.func.isRequired,
};
