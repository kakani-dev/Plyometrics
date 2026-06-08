import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { TestLayout as TcsNqtTest } from "./tcsNqt";
import { TestLayout as PsychometricTest } from "./psychometric";

const TABS = [
  { id: "tcs-nqt", label: "NQT" },
  { id: "psychometric", label: "Psychometric Test" },
];

export function TestSwitcher({ onPhaseChange }) {
  const [activeTab, setActiveTab] = useState("tcs-nqt");
  const [restartKey, setRestartKey] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(false);

  const handleRestart = () => setRestartKey((k) => k + 1);

  const handlePhaseChange = useCallback(
    (phase) => {
      setIsTestRunning(phase === "test");
      if (onPhaseChange) {
        onPhaseChange(phase);
      }
    },
    [onPhaseChange],
  );

  return (
    <div className={isTestRunning ? "h-full w-full" : "flex flex-col gap-4"}>
      {!isTestRunning && (
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-dark-600">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "shrink-0 px-5 py-3 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-b-2 border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-400"
                    : "text-gray-500 hover:bg-gray-100 dark:text-dark-400 dark:hover:bg-dark-700",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {activeTab === "tcs-nqt" && (
        <TcsNqtTest
          key={`tcs-${restartKey}`}
          onRestart={handleRestart}
          onPhaseChange={handlePhaseChange}
        />
      )}
      {activeTab === "psychometric" && (
        <PsychometricTest
          key={`psych-${restartKey}`}
          onRestart={handleRestart}
          onPhaseChange={handlePhaseChange}
        />
      )}
    </div>
  );
}

TestSwitcher.propTypes = {
  onPhaseChange: PropTypes.func,
};

