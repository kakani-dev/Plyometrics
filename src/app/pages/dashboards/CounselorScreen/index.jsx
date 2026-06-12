import { useState, useEffect, useCallback } from "react";
import { NotebookText } from "lucide-react";
import { Page } from "components/shared/Page";
import { Overview } from "./Components/Overview";
import CandidateListDatatable from "./Components/candidate-list-datatable";
import { getCandidatesByTenant } from "./Components/candidate-list-datatable/data";

export default function CounselorScreen() {
  const [candidates, setCandidates] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshData = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const data = await getCandidatesByTenant(1);
        if (data && data.data) {
          setCandidates(data.data);
        }
      } catch (error) {
        console.error("Error fetching candidates:", error);
      }
    };
    fetchCandidates();
  }, [refreshKey]);

  return (
    <Page title="Counselor Screen">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            <NotebookText className="size-6 text-primary-600" />
            Counselor Screen Page
          </h2>
        </div>
        <Overview candidateCount={candidates.length} refreshKey={refreshKey} />
        <CandidateListDatatable candidates={candidates} setCandidates={setCandidates} onDataChange={refreshData} />
      </div>
    </Page>
  );
}
