import PropTypes from "prop-types";

export function FooterActions({
  onPrevious,
  onClear,
  onMarkReview,
  onSaveNext,
  onNext,
  hasPrevious,
  hasNext,
  hasSelectedAnswer,
  onOpenSubmitModal,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-6 py-3 dark:border-dark-600 dark:bg-dark-800">
      <div className="flex flex-wrap gap-2">
        <ActionButton onClick={onPrevious} disabled={!hasPrevious}>
          Previous
        </ActionButton>
        <ActionButton
          onClick={onClear}
          disabled={!hasSelectedAnswer}
          className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          Clear Response
        </ActionButton>
      </div>

      <div className="flex flex-wrap gap-2">
        <ActionButton
          onClick={onMarkReview}
          className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
        >
          Mark for Review
        </ActionButton>
        <ActionButton onClick={onSaveNext} disabled={!hasSelectedAnswer}>
          Save & Next
        </ActionButton>
        {hasNext ? (
          <ActionButton onClick={onNext}>
            Next
          </ActionButton>
        ) : (
          <ActionButton
            onClick={onOpenSubmitModal}
            className="border-primary-500 bg-primary-500 text-white hover:bg-primary-600"
          >
            Submit
          </ActionButton>
        )}
      </div>
    </div>
  );
}

function ActionButton({ onClick, disabled, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm ${
        className ||
        "text-gray-700 hover:bg-gray-100 dark:border-dark-500 dark:text-dark-200 dark:hover:bg-dark-700"
      }`}
    >
      {children}
    </button>
  );
}

ActionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

FooterActions.propTypes = {
  onPrevious: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onMarkReview: PropTypes.func.isRequired,
  onSaveNext: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  hasPrevious: PropTypes.bool.isRequired,
  hasNext: PropTypes.bool,
  hasSelectedAnswer: PropTypes.bool.isRequired,
  onOpenSubmitModal: PropTypes.func,
};
