// Import Dependencies
import {
  ArrowUpIcon,
  CubeIcon,
  CurrencyDollarIcon,
  PresentationChartBarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Avatar, Card } from "components/ui";

// ----------------------------------------------------------------------

export function Overview() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
      <Card className="flex justify-between p-5">
        <div>
          <p>Candidates</p>
          <p className="this:info mt-0.5 text-2xl font-medium text-this dark:text-this-lighter">
            10
          </p>
          <p className="this:success mt-3 flex items-center gap-1 text-this dark:text-this-lighter">
            <ArrowUpIcon className="size-4" />
            <span>10%</span>
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
            10
          </p>
          <p className="this:success mt-3 flex items-center gap-1 text-this dark:text-this-lighter">
            <ArrowUpIcon className="size-4" />
            <span>10%</span>
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
            5
          </p>
          <p className="this:success mt-3 flex items-center gap-1 text-this dark:text-this-lighter">
            <ArrowUpIcon className="size-4" />
            <span>1%</span>
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
            5
          </p>
          <p className="this:success mt-3 flex items-center gap-1 text-this dark:text-this-lighter">
            <ArrowUpIcon className="size-4" />
            <span>3.69%</span>
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
