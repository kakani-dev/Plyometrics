import PropTypes from "prop-types";

export function CodingEditor({ code, onChange }) {
  return (
    <div className="px-6 pb-6">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-dark-400">
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        Code Editor
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-dark-500">
        <div className="flex items-center gap-2 border-b border-gray-300 bg-gray-100 px-4 py-2 dark:border-dark-500 dark:bg-dark-700">
          <span className="size-3 rounded-full bg-red-400" />
          <span className="size-3 rounded-full bg-yellow-400" />
          <span className="size-3 rounded-full bg-green-400" />
          <span className="ml-2 text-xs text-gray-500 dark:text-dark-400">solution.js</span>
        </div>
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-y bg-gray-950 p-4 font-mono text-sm leading-relaxed text-green-300 outline-none placeholder:text-green-700"
          rows={12}
          spellCheck={false}
          placeholder="// Write your code here"
        />
      </div>
    </div>
  );
}

CodingEditor.propTypes = {
  code: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
