import { useState } from "react";
import { Page } from "components/shared/Page";
import { TestSwitcher } from "./TestSwitcher";
import { Welcome } from "./Welcome";

export default function Home() {
  const [isTestRunning, setIsTestRunning] = useState(false);

  return (
    <Page title="Fee Testing">
      <div className={isTestRunning ? "w-full h-[calc(100vh-65px)] overflow-hidden" : "transition-content w-full px-(--margin-x) pt-5 lg:pt-6"}>
        <div className={isTestRunning ? "h-full w-full" : "flex min-w-0 flex-col gap-6"}>
          {!isTestRunning && <Welcome testName="Assessment Center" candidateName="Demo Candidate" />}
          <TestSwitcher onPhaseChange={(phase) => setIsTestRunning(phase === "test")} />
        </div>
      </div>
    </Page>
  );
}

