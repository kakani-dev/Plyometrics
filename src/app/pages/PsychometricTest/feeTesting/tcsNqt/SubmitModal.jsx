import PropTypes from "prop-types";
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  BookmarkIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { Card } from "components/ui";

export function SubmitModal({ isOpen, onClose, onConfirm, stats }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card skin="shadow-sm" className="w-full max-w-md p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-dark-50">
          Confirm Submission
        </h2>

        <div className="mb-6 space-y-3">
          <StatRow label="Total Questions" value={stats.total} icon={<DocumentTextIcon className="size-4 text-primary-500" />} />
          <StatRow label="Answered" value={stats.answered} icon={<CheckCircleIcon className="size-4 text-emerald-500" />} />
          <StatRow label="Not Answered" value={stats.notAnswered} icon={<XCircleIcon className="size-4 text-red-500" />} />
          <StatRow label="Marked for Review" value={stats.markedForReview} icon={<BookmarkIcon className="size-4 text-purple-500" />} />
          <StatRow label="Answered & Marked" value={stats.answeredAndMarked} icon={<CheckBadgeIcon className="size-4 text-purple-500" />} />
        </div>

        {stats.notAnswered > 0 && (
          <p className="mb-4 text-sm text-amber-600 dark:text-amber-400">
            You have {stats.notAnswered} unanswered question(s). Are you sure you want to submit?
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-dark-500 dark:text-dark-200 dark:hover:bg-dark-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            Submit
          </button>
        </div>
      </Card>
    </div>
  );
}

function StatRow({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-gray-600 dark:text-dark-300">
        {icon}
        {label}
      </span>
      <span className="font-bold text-gray-900 dark:text-dark-50">
        {value}
      </span>
    </div>
  );
}

StatRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.node.isRequired,
};

SubmitModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  stats: PropTypes.shape({
    total: PropTypes.number.isRequired,
    answered: PropTypes.number.isRequired,
    notAnswered: PropTypes.number.isRequired,
    markedForReview: PropTypes.number.isRequired,
    answeredAndMarked: PropTypes.number.isRequired,
  }).isRequired,
};
