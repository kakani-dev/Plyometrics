import PropTypes from "prop-types";

const STATUS_STYLES = {
  "not-visited": "bg-gray-200 text-gray-600 dark:bg-dark-500 dark:text-dark-300",
  "not-answered": "bg-red-100 text-red-700 border border-red-400 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
  answered: "bg-emerald-100 text-emerald-700 border border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
  "marked-for-review": "bg-purple-100 text-purple-700 border border-purple-400 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
  "answered-and-marked":
    "bg-emerald-100 text-emerald-700 border border-emerald-400 ring-2 ring-purple-400 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700 dark:ring-purple-600",
};

export function QuestionPalette({
  sections,
  questions,
  tracking,
  currentQuestionId,
  onNavigate,
}) {
  return (
    <div className="p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-dark-400">
        Question Palette
      </h3>

      {/* Legend */}
      <div className="mb-4 grid grid-cols-2 gap-1.5 text-[10px]">
        <LegendItem color="bg-gray-200 dark:bg-dark-500" label="Not Visited" />
        <LegendItem color="bg-red-100 border border-red-400 dark:bg-red-900/30 dark:border-red-700" label="Not Answered" />
        <LegendItem color="bg-emerald-100 border border-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-700" label="Answered" />
        <LegendItem color="bg-purple-100 border border-purple-400 dark:bg-purple-900/30 dark:border-purple-700" label="Marked for Review" />
        <LegendItem
          color="bg-emerald-100 border border-emerald-400 ring-2 ring-purple-400 dark:bg-emerald-900/30 dark:border-emerald-700 dark:ring-purple-600"
          label="Answered & Marked"
        />
      </div>

      {/* Section-wise question grid */}
      <div className="space-y-4">
        {sections.map((section) => {
          const sectionQs = questions.filter((q) => q.section === section.id);
          return (
            <div key={section.id}>
              <div className="mb-1.5 text-[10px] font-semibold text-gray-500 dark:text-dark-400">
                {section.label}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sectionQs.map((q) => {
                  const record = tracking[q.id];
                  const status = record?.status || "not-visited";
                  const isCurrent = q.id === currentQuestionId;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => onNavigate(q.id)}
                      className={`flex size-8 items-center justify-center rounded text-xs font-bold transition-all hover:scale-110 ${
                        STATUS_STYLES[status] || STATUS_STYLES["not-visited"]
                      } ${isCurrent ? "ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-dark-800" : ""}`}
                    >
                      {questions.indexOf(q) + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block size-3 rounded ${color}`} />
      <span className="text-gray-500 dark:text-dark-400">{label}</span>
    </div>
  );
}

LegendItem.propTypes = {
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

QuestionPalette.propTypes = {
  sections: PropTypes.array.isRequired,
  questions: PropTypes.array.isRequired,
  tracking: PropTypes.object.isRequired,
  currentQuestionId: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};
