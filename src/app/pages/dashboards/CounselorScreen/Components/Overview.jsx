// Import Dependencies
import {
  CubeIcon,
  CurrencyDollarIcon,
  PresentationChartBarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useEffect, useState } from "react";

// Local Imports
import { Avatar, Card } from "components/ui";
import { NEUROPI_API_BASE } from "configs/auth.config";

// ----------------------------------------------------------------------

export function Overview({ candidateCount = 0 }) {
  const [stats, setStats] = useState({ totalSent: 0, completed: 0, pending: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(
          `${NEUROPI_API_BASE}/api/TestService/counselor/1/today/1`,
        );
        if (data && data.data) {
          setStats(data.data);
        }
      } catch {
        // keep defaults
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
      <Card className="flex justify-between p-5">
        <div>
          <p>Candidates</p>
          <p className="this:info mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
            {candidateCount}
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
          <p>Requests Sent</p>
          <p className="this:warning mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
            {stats.totalSent}
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
          <p>Users Completed</p>
          <p className="this:success mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
            {stats.completed}
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

      <Card className="flex justify-between p-5">
        <div>
          <p>Users Pending</p>
          <p className="this:secondary mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
            {stats.pending}
          </p>
        </div>
        <Avatar
          size={12}
          classNames={{
            display: "mask is-squircle rounded-none",
          }}
          initialVariant="soft"
          initialColor="secondary"
        >
          <CurrencyDollarIcon className="size-6" />
        </Avatar>
      </Card>
    </div>
  );
}
