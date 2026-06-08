import PropTypes from "prop-types";
import { LIKERT_OPTIONS } from "./mockData";

export function LikertList({ selectedAnswer, onSelect }) {
  return (
    <div className="px-6 pb-6">
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        {LIKERT_OPTIONS.map((opt) => {
          const isSelected = selectedAnswer === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg border px-3 py-3 text-center text-xs transition-all sm:py-4 sm:text-sm ${
                isSelected
                  ? "border-primary-400 bg-primary-50 ring-2 ring-primary-200 dark:border-primary-600 dark:bg-primary-900/30 dark:ring-primary-800"
                  : "border-gray-200 hover:bg-gray-50 dark:border-dark-600 dark:hover:bg-dark-700"
              }`}
            >
              <span className="text-lg font-bold sm:text-xl">
                {opt.id === "sd" ? "1" : opt.id === "d" ? "2" : opt.id === "n" ? "3" : opt.id === "a" ? "4" : "5"}
              </span>
              <span className="text-gray-700 dark:text-dark-200">{opt.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

LikertList.propTypes = {
  selectedAnswer: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};
