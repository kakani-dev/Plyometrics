import PropTypes from "prop-types";
import clsx from "clsx";

const LEVELS = {
  genuine: {
    label: "Genuine",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: "✓",
  },
  "possibly-random": {
    label: "Possibly Random",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    icon: "⚠",
  },
  "highly-suspicious": {
    label: "Highly Suspicious",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    border: "border-rose-200 dark:border-rose-800",
    icon: "✗",
  },
};

export function SuspicionIndicator({ fastAnswersCount, totalQuestions, timeTakenSeconds }) {
  const ratio = totalQuestions > 0 ? fastAnswersCount / totalQuestions : 0;

  let level;
  if (ratio >= 0.5) {
    level = "highly-suspicious";
  } else if (ratio >= 0.25) {
    level = "possibly-random";
  } else {
    level = "genuine";
  }

  const config = LEVELS[level];

  return (
    <div className={clsx("rounded-lg border p-4", config.bg, config.border)}>
      <div className="flex items-center gap-3">
        <span
          className={clsx(
            "flex size-10 shrink-0 items-center justify-center rounded-full text-lg font-bold",
            config.bg,
            config.color,
          )}
        >
          {config.icon}
        </span>
        <div>
          <div className={clsx("text-sm font-semibold", config.color)}>
            {config.label}
          </div>
          <div className="mt-0.5 text-xs text-gray-500 dark:text-dark-400">
            {fastAnswersCount} of {totalQuestions} answered in under 2s &middot;{" "}
            {timeTakenSeconds}s total
          </div>
        </div>
      </div>
    </div>
  );
}

SuspicionIndicator.propTypes = {
  fastAnswersCount: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  timeTakenSeconds: PropTypes.number.isRequired,
};
