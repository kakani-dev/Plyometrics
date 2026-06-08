import PropTypes from "prop-types";

export function SectionTabs({ sections, activeSection, onSelect }) {
  return (
    <div className="flex overflow-x-auto border-b border-gray-200 dark:border-dark-600">
      {sections.map((s) => {
        const isActive = s.id === activeSection;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={`shrink-0 px-4 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
              isActive
                ? "border-b-2 border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-400"
                : "text-gray-500 hover:bg-gray-100 dark:text-dark-400 dark:hover:bg-dark-700"
            }`}
          >
            {s.label}
            <span className="ml-1.5 text-[10px] opacity-60">({s.questionCount})</span>
          </button>
        );
      })}
    </div>
  );
}

SectionTabs.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      questionCount: PropTypes.number.isRequired,
    }),
  ).isRequired,
  activeSection: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};
