import { useState } from "react";
import { Page } from "components/shared/Page";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { PsychometricTestCard } from "./Components/PsychometricTestCard/PsychometricTestCard";
import { AppointmentsRequestsList } from "./Components/AppointmentsRequestsList";

export default function AssessmentUI() {
  const [selectedTest, setSelectedTest] = useState(null);

  return (
    <Page title="Assessment UI">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="min-w-0 mb-6 flex items-center gap-2">
          <ClipboardDocumentListIcon className="size-6 text-primary-600" />
          <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            Psychometric Assessment Test
          </h2>
        </div>
        {!selectedTest ? (
          <AppointmentsRequestsList onSelectTest={setSelectedTest} />
        ) : (
          <div>
            <button
              onClick={() => setSelectedTest(null)}
              className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100 transition-colors"
            >
              ← Back to Appointments
            </button>
            <PsychometricTestCard
              key={selectedTest.uid}
              testData={selectedTest}
              onBack={() => setSelectedTest(null)}
            />
          </div>
        )}
      </div>
    </Page>
  );
}

