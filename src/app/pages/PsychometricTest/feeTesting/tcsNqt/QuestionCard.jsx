import PropTypes from "prop-types";

export function QuestionCard({ question, questionIndex, totalInSection }) {
  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
          {questionIndex + 1}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-dark-500">
          Question {questionIndex + 1} of {totalInSection}
        </span>
      </div>

      <p className="mb-6 text-base leading-relaxed text-gray-900 dark:text-dark-50 sm:text-lg">
        {question.text}
      </p>
    </div>
  );
}

QuestionCard.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  questionIndex: PropTypes.number.isRequired,
  totalInSection: PropTypes.number.isRequired,
};
