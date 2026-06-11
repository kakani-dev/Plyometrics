// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Fragment } from "react";
import dayjs from "dayjs";
import PropTypes from "prop-types";

// Local Imports
import { Button } from "components/ui";
import { useLocaleContext } from "app/contexts/locale/context";

// ----------------------------------------------------------------------


export function CandidateDrawer({ isOpen, close, row }) {
  const { locale } = useLocaleContext();
  const date = row.original.dob ? dayjs(row.original.dob).locale(locale).format("DD MMM YYYY") : "";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={close}>
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40"
        />

        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="fixed right-0 top-0 flex h-full w-full max-w-xl transform-gpu flex-col bg-white py-4 transition-transform duration-200 dark:bg-dark-700"
        >
          <div className="flex justify-between px-4 sm:px-5">
            <div>
              <div className="font-semibold">Candidate ID:</div>
              <div className="text-xl font-medium text-primary-600 dark:text-primary-400">
                #{row.original.id}
              </div>
            </div>

            <Button
              onClick={close}
              variant="flat"
              isIcon
              className="size-6 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <div className="mt-5 flex w-full justify-between px-4 sm:px-5">
            <div className="flex flex-col">
              <div className="mb-1.5 font-semibold text-gray-500 dark:text-dark-300">Name:</div>
              <div className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                {row.original.name}
              </div>
            </div>
            <div className="text-end">
              <div className="font-semibold text-gray-500 dark:text-dark-300">Date of Birth:</div>
              <div className="mt-1.5 font-semibold text-gray-850 dark:text-dark-50">
                {date}
              </div>
            </div>
          </div>

          <div className="mt-6 px-4 sm:px-5">
            <div className="font-semibold text-gray-500 dark:text-dark-300">Email:</div>
            <p className="mt-1 font-semibold text-gray-800 dark:text-dark-50">{row.original.email}</p>
          </div>

          <div className="mt-6 px-4 sm:px-5">
            <div className="font-semibold text-gray-500 dark:text-dark-300">Mobile Number:</div>
            <p className="mt-1 font-semibold text-gray-850 dark:text-dark-50">{row.original.mobilenumber}</p>
          </div>

          <div className="mt-6 px-4 sm:px-5">
            <div className="font-semibold text-gray-500 dark:text-dark-300">Gender:</div>
            <p className="mt-1 font-semibold text-gray-850 dark:text-dark-50">
              {row.original.gender ? row.original.gender.charAt(0).toUpperCase() + row.original.gender.slice(1) : ""}
            </p>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

CandidateDrawer.propTypes = {
  isOpen: PropTypes.bool,
  close: PropTypes.func,
  row: PropTypes.object,
};
