// Import Dependencies
import PropTypes from "prop-types";
import {
  CheckIcon,
  XMarkIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  PlayIcon,
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
  isCandidateView = false,
}) {
  if (isCandidateView) {
    return (
      <Card className="flex flex-col justify-between p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border border-gray-100 dark:border-dark-800 h-full">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500 dark:bg-primary-400/10 dark:text-primary-400">
              <AcademicCapIcon className="size-6" />
            </div>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/30">
                <CheckCircleIcon className="size-3.5" />
                Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/30">
                Pending
              </span>
            )}
          </div>
          
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-dark-100 truncate">
              {testName}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-dark-400">
              Psychometric assessment test
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-dark-700">
          {isCompleted ? (
            <Button
              className="w-full justify-center py-2 text-xs font-semibold"
              variant="soft"
              color="success"
              disabled
            >
              Completed
            </Button>
          ) : (
            <Button
              className="w-full justify-center py-2 text-xs font-semibold space-x-1.5"
              color="primary"
              onClick={onSelect}
            >
              <PlayIcon className="size-3.5 animate-pulse" />
              <span>Start Assessment</span>
            </Button>
          )}
        </div>
      </Card>
    );
  }

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
  isCandidateView: PropTypes.bool,
};
