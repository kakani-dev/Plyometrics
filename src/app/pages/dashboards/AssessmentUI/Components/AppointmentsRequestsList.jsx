import { useState, useEffect } from "react";
import { AppointmentsRequestsCard } from "./AppointmentsRequestsCard";
import { getAppointmentsRequestsList } from "app/contexts/api/allapis";
import { useAuthContext } from "app/contexts/auth/context";

export function AppointmentsRequestsList({ onSelectTest }) {
  const [requests, setRequests] = useState([]);
  const { user } = useAuthContext();

  const candidateId = user?.id || 1;
  const tenantId = user?.tenantId || 1;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getAppointmentsRequestsList(candidateId, tenantId);
        const data = res?.data;
        if (active && data) {
          const candidates = Array.isArray(data) ? data : [data];
          const flattened = candidates.flatMap((candidate) =>
            (candidate.tests || []).map((test) => ({
              uid: candidate.uid,
              name: candidate.name,
              email: candidate.email,
              avatar: candidate.avatar,
              testId: test.testId,
              testName: test.testName,
              examDate: test.examDate,
              totalTestTime: test.totalTestTime,
              isCompleted: test.isCompleted,
            }))
          );
          setRequests(flattened);
        }
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      }
    })();
    return () => { active = false; };
  }, [candidateId, tenantId]);

  return (
    <div className="mt-4 sm:mt-5 lg:mt-6">
      <div className="flex h-8 items-center justify-between">


      </div>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {requests.map((request) => (
          <AppointmentsRequestsCard
            key={`${request.uid}-${request.testId}`}
            name={request.name}
            avatar={request.avatar}
            email={request.email}
            testName={request.testName}
            isCompleted={request.isCompleted}
            onSelect={() => onSelectTest && onSelectTest(request)}
          />
        ))}
      </div>
    </div>
  );
}
