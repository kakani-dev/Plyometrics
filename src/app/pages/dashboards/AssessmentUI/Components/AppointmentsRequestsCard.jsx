// Import Dependencies
import PropTypes from "prop-types";
import {
  // ArrowUpRightIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Avatar, Button, Card } from "components/ui";

// ----------------------------------------------------------------------

export function AppointmentsRequestsCard({
  name,
  avatar,
  email,
  testName,
  isCompleted,
  onSelect,
}) {
  return (
    <Card className="space-y-4 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar size={10} name={name} src={avatar} initialColor="auto" />

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-gray-800 dark:text-dark-100">
            {name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-dark-300">
            {email}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="truncate text-xs font-semibold text-primary">
              {testName}
            </span>
            {isCompleted && (
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-medium border border-emerald-200 dark:border-emerald-900/30">
                Completed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button
            className="size-7 rounded-full"
            isIcon
            color="success"
            variant="soft"
            onClick={onSelect}
            disabled={isCompleted}
          >
            <CheckIcon className="size-4" />
          </Button>
          <Button
            className="size-7 rounded-full"
            isIcon
            color="error"
            variant="soft"
            disabled={isCompleted}
          >
            <XMarkIcon className="size-4" />
          </Button>
        </div>
        {/* <Button className="size-7 rounded-full" isIcon>
          <ArrowUpRightIcon className="size-3.5" />
        </Button> */}
      </div>
    </Card>
  );
}

AppointmentsRequestsCard.propTypes = {
  name: PropTypes.string,
  avatar: PropTypes.string,
  email: PropTypes.string,
  testName: PropTypes.string,
  isCompleted: PropTypes.bool,
  onSelect: PropTypes.func,
};
