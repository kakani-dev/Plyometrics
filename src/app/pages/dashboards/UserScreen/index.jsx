import { useEffect, useState } from "react";
import { Page } from "components/shared/Page";
import { Overview } from "./Components/Overview";
import { UserCard } from "./Components/UserCard";
// import OrdersDatatableV1 from "./Components/orders-datatable-1";
import { AppointmentsRequestsList } from "../AssessmentUI/Components/AppointmentsRequestsList";
import { getCandidateDetails } from "app/contexts/api/allapis";
import { useAuthContext } from "app/contexts/auth/context";

export default function UserScreen({ setProfile, handleStartTest }) {
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
          const raw = response.data;
          setCandidate(Array.isArray(raw) ? raw[0] : raw);
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

  const handleTestSelect = (request) => {
    const profileData = {
      name: request.name || "",
      grade: "8",
      apiKey: "",
      difficultyTypes: "Easy,Medium",
      difficultyRatios: request.difficultyRatios || "",
      questionsPerSubdomain: String(request.questionsPerSubdomain || ""),
      testTypeServiceId: request.testTypeId,
      tenantId: 1,
    };
    setProfile(profileData);
    handleStartTest(null, profileData);
  };

  return (
    <Page title="User Screen">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
          <div className="lg:col-span-1">
            <UserCard
              name={candidate?.name || "Loading..."}
              avatar={candidate?.avatar || ""}
              position="Candidate"
              phone={candidate?.mobilenumber || ""}
              email={candidate?.email || ""}
              exams={candidate ? `Exams: ${candidate.examsFinished} / ${candidate.examsTotal}` : ""}
              isOnline={true}
              query=""
            />
          </div>
          <div className="lg:col-span-3 space-y-4 sm:space-y-5 lg:space-y-6">
            <Overview />
            <AppointmentsRequestsList onSelectTest={handleTestSelect} isCandidateView={true} />
          </div>
        </div>
      </div>
    </Page>
  );
}
