import { useEffect, useState } from "react";
import { Page } from "components/shared/Page";
import { Overview } from "./Components/Overview";
import { UserCard } from "./Components/UserCard";
// import OrdersDatatableV1 from "./Components/orders-datatable-1";
import { AppointmentsRequestsList } from "../AssessmentUI/Components/AppointmentsRequestsList";
import { PsychometricTestCard } from "../AssessmentUI/Components/PsychometricTestCard/PsychometricTestCard";
import { getCandidateDetails } from "app/contexts/api/allapis";
import { useAuthContext } from "app/contexts/auth/context";

export default function UserScreen() {
  const [selectedTest, setSelectedTest] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const { user } = useAuthContext();

  const candidateId = user?.id || 1;
  const tenantId = user?.tenantId || 1;

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const response = await getCandidateDetails(candidateId, tenantId);
        if (mounted && response && response.data) {
          setCandidate(response.data);
        }
      } catch (err) {
        console.error("Failed to load candidate details:", err);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [candidateId, tenantId]);

  return (
    <Page title="User Screen">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="min-w-0 mb-6">
          <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            User Screen Page
          </h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
          <div className="lg:col-span-1">
            <UserCard
              name={candidate?.name || "Loading..."}
              avatar={candidate?.avatar || ""}
              position="Candidate"
              phone={candidate?.mobilenumber || ""}
              email={candidate?.email || ""}
              website={candidate ? `Exams: ${candidate.examsFinished} / ${candidate.examsTotal}` : ""}
              isOnline={true}
              query=""
            />
          </div>
          <div className="lg:col-span-3 space-y-4 sm:space-y-5 lg:space-y-6">
            <Overview />
            {!selectedTest ? (
              <AppointmentsRequestsList onSelectTest={setSelectedTest} />
            ) : (
              <div className="mt-6">
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
        </div>
        {/* <OrdersDatatableV1 /> */}
      </div>
    </Page>
  );
}
