import { useEffect, useState } from "react";
import {
  CubeIcon,
  PresentationChartBarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import { Avatar, Card } from "components/ui";
import { getAppointmentsRequestsList } from "app/contexts/api/allapis";

export function Overview() {
  const [stats, setStats] = useState({ attempts: 0, completed: 0, pending: 0 });

  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      try {
        const response = await getAppointmentsRequestsList(1, 1);
        const tests = response.data?.[0]?.tests ?? [];
        const completed = tests.filter((t) => t.isCompleted).length;
        if (mounted) {
          setStats({
            attempts: tests.length,
            completed,
            pending: tests.length - completed,
          });
        }
      } catch {
        // silently fail
      }
    }
    fetchStats();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
      <Card className="flex justify-between p-5">
        <div>
          <p>Attempts</p>
          <p className="this:info mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
            {stats.attempts}
          </p>
        </div>
        <Avatar
          size={12}
          classNames={{
            display: "mask is-squircle rounded-none",
          }}
          initialVariant="soft"
          initialColor="info"
        >
          <PresentationChartBarIcon className="size-6" />
        </Avatar>
      </Card>

      <Card className="flex justify-between p-5">
        <div>
          <p>Completed</p>
          <p className="this:warning mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
            {stats.completed}
          </p>
        </div>
        <Avatar
          size={12}
          classNames={{
            display: "mask is-squircle rounded-none",
          }}
          initialVariant="soft"
          initialColor="warning"
        >
          <UsersIcon className="size-6" />
        </Avatar>
      </Card>

      <Card className="flex justify-between p-5">
        <div>
          <p>Pending</p>  
          <p className="this:success mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
            {stats.pending}
          </p>
        </div>
        <Avatar
          size={12}
          classNames={{
            display: "mask is-squircle rounded-none",
          }}
          initialVariant="soft"
          initialColor="success"
        >
          <CubeIcon className="size-6" />
        </Avatar>
      </Card>
    </div>
  );
}
