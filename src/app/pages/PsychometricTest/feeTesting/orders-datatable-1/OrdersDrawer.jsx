// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Fragment } from "react";
import PropTypes from "prop-types";

// Local Imports
import {
  Button,
  Table,
  TBody,
  Tr,
  Td,
} from "components/ui";

const getPeriodMultiplier = (periodName) => {
  const name = (periodName || "").toLowerCase().trim();
  if (name.includes("annual") || name.includes("one time") || name.includes("yearly")) return 1;
  if (name.includes("semi") || name.includes("half")) return 2;
  if (name.includes("term")) return 3;
  if (name.includes("quarter")) return 4;
  if (name.includes("monthly")) return 12;
  return 1;
};

export function OrdersDrawer({ isOpen, close, row }) {
  const pkg = row.original;
  const amount = pkg.feeStructureAmount || 0;
  const specialPct = pkg.specialDiscount || 0;
  const corporatePct = pkg.corporateDiscount || 0;

  const specialAmt = (amount * specialPct) / 100;
  const corporateAmt = (amount * corporatePct) / 100;
  const netPayable = amount - specialAmt - corporateAmt;
  const multiplier = getPeriodMultiplier(pkg.paymentPeriodName);
  const academicYearTotal = netPayable * multiplier;

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
          className="fixed right-0 top-0 flex h-full w-full max-w-md transform-gpu flex-col bg-white py-4 transition-transform duration-200 dark:bg-dark-700 shadow-xl"
        >
          <div className="flex justify-between px-4 sm:px-5 border-b pb-4 dark:border-dark-500">
            <div>
              <div className="font-semibold text-gray-500 dark:text-dark-300 text-xs uppercase tracking-wider">Fee Package ID: {pkg.id}</div>
              <div className="text-xl font-bold text-gray-800 dark:text-dark-50 mt-1">
                {pkg.feeStructureName}
              </div>
            </div>

            <Button
              onClick={close}
              variant="flat"
              isIcon
              className="size-8 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
            >
              <XMarkIcon className="size-5" />
            </Button>
          </div>

          <div className="mt-6 grow overflow-y-auto px-4 sm:px-5">
            <h3 className="font-semibold text-gray-800 dark:text-dark-50 mb-3 text-sm-plus">Package Specifications</h3>
            
            <Table className="w-full text-sm [&_.table-td]:py-3 [&_.table-td]:border-b [&_.table-td]:border-gray-150 dark:[&_.table-td]:border-dark-500">
              <TBody>
                <Tr>
                  <Td className="font-medium text-gray-500 dark:text-dark-300 w-1/2">Fee Structure Name</Td>
                  <Td className="text-gray-800 dark:text-dark-100">{pkg.feeStructureName}</Td>
                </Tr>
                <Tr>
                  <Td className="font-medium text-gray-500 dark:text-dark-300">Base Amount</Td>
                  <Td className="font-semibold text-gray-800 dark:text-dark-100">₹{amount.toLocaleString()}</Td>
                </Tr>
                <Tr>
                  <Td className="font-medium text-gray-500 dark:text-dark-300">Payment Period</Td>
                  <Td className="text-gray-800 dark:text-dark-100">{pkg.paymentPeriodName} (x{multiplier})</Td>
                </Tr>
                <Tr>
                  <Td className="font-medium text-gray-500 dark:text-dark-300">Special Discount</Td>
                  <Td className="font-medium text-emerald-600 dark:text-emerald-400">
                    {specialPct}% (₹{specialAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })})
                  </Td>
                </Tr>
                <Tr>
                  <Td className="font-medium text-gray-500 dark:text-dark-300">Corporate Discount</Td>
                  <Td className="font-medium text-blue-600 dark:text-blue-400">
                    {corporatePct}% (₹{corporateAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })})
                  </Td>
                </Tr>
                <Tr>
                  <Td className="font-bold text-gray-700 dark:text-dark-200">Total (Per Period)</Td>
                  <Td className="font-semibold text-gray-800 dark:text-dark-100">
                    ₹{netPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Td>
                </Tr>
                <Tr className="bg-gray-50 dark:bg-dark-800/40">
                  <Td className="font-bold text-gray-900 dark:text-dark-50">Total Academic Year Fee</Td>
                  <Td className="font-bold text-primary-600 dark:text-primary-400 text-base">
                    ₹{academicYearTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Td>
                </Tr>
              </TBody>
            </Table>
          </div>

          <div className="flex justify-end gap-2 px-4 sm:px-5 pt-4 border-t dark:border-dark-500">
            <Button onClick={close} variant="flat" className="px-4 py-2">
              Close
            </Button>
            <Button color="primary" className="px-4 py-2">
              Apply Package
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

OrdersDrawer.propTypes = {
  isOpen: PropTypes.bool,
  close: PropTypes.func,
  row: PropTypes.object,
};
