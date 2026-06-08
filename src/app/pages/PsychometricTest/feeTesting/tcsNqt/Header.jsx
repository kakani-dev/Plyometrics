import PropTypes from "prop-types";

export function Header({ timeRemaining, onOpenSubmitModal }) {
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const isLow = timeRemaining < 600;

  return (
    <div className="flex items-center justify-end gap-4 border-b border-gray-200 bg-white px-6 py-3 dark:border-dark-600 dark:bg-dark-800">
      <div
        className={`tabular-nums font-mono text-lg font-bold ${
          isLow
            ? "text-red-600 animate-pulse dark:text-red-400"
            : "text-gray-800 dark:text-dark-100"
        }`}
      >
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </div>

      <button
        type="button"
        onClick={onOpenSubmitModal}
        className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
      >
        Submit
      </button>
    </div>
  );
}

Header.propTypes = {
  timeRemaining: PropTypes.number.isRequired,
  onOpenSubmitModal: PropTypes.func.isRequired,
};
