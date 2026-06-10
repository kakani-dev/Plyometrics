// Local Imports
import { AppointmentsRequestsCard } from "./AppointmentsRequestsCard";

const requests = [
  {
    uid: 1,
    name: "Travis Fuller",
    avatar: "/images/avatar/avatar-19.jpg",
    email: "travis.fuller@example.com",
    testName: "Psychometric Cognitive Test",
  },
  {
    uid: 2,
    name: "Travis Fuller",
    avatar: "/images/avatar/avatar-19.jpg",
    email: "travis.fuller@example.com",
    testName: "Behavioral Tendency Assessment",
  },
  {
    uid: 3,
    name: "Travis Fuller",
    avatar: "/images/avatar/avatar-19.jpg",
    email: "travis.fuller@example.com",
    testName: "Leadership Aptitude Test",
  }
];

// ----------------------------------------------------------------------

export function AppointmentsRequestsList({ onSelectTest }) {
  return (
    <div className="mt-4 sm:mt-5 lg:mt-6">
      <div className="flex h-8 items-center justify-between">


      </div>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {requests.map((request) => (
          <AppointmentsRequestsCard
            key={request.uid}
            name={request.name}
            avatar={request.avatar}
            email={request.email}
            testName={request.testName}
            onSelect={() => onSelectTest && onSelectTest(request)}
          />
        ))}
      </div>
    </div>
  );
}
