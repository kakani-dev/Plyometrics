// Import Dependencies
import PropTypes from "prop-types";
import {
  EnvelopeIcon,
  AcademicCapIcon,
  UserIcon,
  PhoneIcon,
} from "@heroicons/react/20/solid";

// Local Imports
import { Avatar, AvatarDot, Button, Card } from "components/ui";
import { Highlight } from "components/shared/Highlight";

// ----------------------------------------------------------------------

export function UserCard({
  name,
  avatar,
  position,
  phone,
  email,
  exams,
  isOnline,
  query,
}) {
  return (
    <Card className="flex grow flex-col items-center p-5 sm:p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border border-gray-100 dark:border-dark-800">
      <Avatar
        size={24}
        name={name}
        src={avatar}
        initialColor="auto"
        classNames={{
          display: "text-3xl font-semibold",
        }}
        indicator={
          <AvatarDot
            color={isOnline ? "primary" : "neutral"}
            className="right-0 m-1 size-4"
          />
        }
      />
      <h3 className="pt-4 text-xl font-semibold text-gray-800 dark:text-dark-100">
        <Highlight query={query}>{name}</Highlight>
      </h3>
      <p className="text-xs font-medium text-gray-500 dark:text-dark-400 mt-1">
        <Highlight query={query}>{position}</Highlight>
      </p>
      
      <div className="my-5 h-px w-full bg-gray-150 dark:bg-dark-700"></div>
      
      <div className="w-full flex flex-col justify-between flex-1">
        <div className="mx-auto flex flex-col gap-3.5 text-sm text-gray-600 dark:text-dark-300 w-fit">
          {phone && (
            <div className="flex min-w-0 items-center space-x-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500 dark:bg-primary-400/10 dark:text-primary-400">
                <PhoneIcon className="size-4" />
              </div>
              <p className="truncate font-medium">
                <Highlight query={query}>{phone}</Highlight>
              </p>
            </div>
          )}
          
          {email && (
            <div className="flex min-w-0 items-center space-x-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500 dark:bg-primary-400/10 dark:text-primary-400">
                <EnvelopeIcon className="size-4" />
              </div>
              <p className="truncate font-medium">
                <Highlight query={query}>{email}</Highlight>
              </p>
            </div>
          )}
          
          {exams && (
            <div className="flex min-w-0 items-center space-x-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500 dark:bg-primary-400/10 dark:text-primary-400">
                <AcademicCapIcon className="size-4" />
              </div>
              <p className="truncate font-medium">
                <Highlight query={query}>{exams}</Highlight>
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-6 w-full">
          <Button className="w-full justify-center space-x-2 py-2.5 font-semibold shadow-sm hover:shadow transition-all" color="primary">
            <UserIcon className="size-4" />
            <span>Profile</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

UserCard.propTypes = {
  name: PropTypes.string,
  avatar: PropTypes.string,
  position: PropTypes.string,
  phone: PropTypes.string,
  email: PropTypes.string,
  exams: PropTypes.string,
  isOnline: PropTypes.bool,
  query: PropTypes.string,
};
