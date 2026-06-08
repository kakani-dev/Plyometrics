import PropTypes from "prop-types";

export function OptionList({ options, selectedAnswer, onSelect }) {
  return (
    <div className="px-6 pb-6">
      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const isSelected = selectedAnswer === opt.id;
          return (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-all ${
                isSelected
                  ? "border-primary-400 bg-primary-50 ring-2 ring-primary-200 dark:border-primary-600 dark:bg-primary-900/30 dark:ring-primary-800"
                  : "border-gray-200 hover:bg-gray-50 dark:border-dark-600 dark:hover:bg-dark-700"
              }`}
            >
              <input
                type="radio"
                name="mcq-option"
                value={opt.id}
                checked={isSelected}
                onChange={() => onSelect(opt.id)}
                className="size-4 border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="font-medium text-gray-800 dark:text-dark-100">
                {opt.id.toUpperCase()}.
              </span>
              <span className="text-gray-700 dark:text-dark-200">{opt.text}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

OptionList.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    }),
  ).isRequired,
  selectedAnswer: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};
