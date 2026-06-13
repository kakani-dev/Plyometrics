import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  CheckIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import PropTypes from "prop-types";
import { toast } from "sonner";

import { Button, Table, THead, TBody, Th, Tr, Td, Tag } from "components/ui";
import { DateCell } from "./rows";

const cols = [
  { label: "Exam Name", key: "exam" },
  { label: "Exam Date", key: "date" },
  { label: "Status", key: "status" },
  { label: "Actions", key: "actions" },
];

function TestRowActions() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        as={Button}
        variant="flat"
        isIcon
        className="size-6 rounded-full"
      >
        <EllipsisHorizontalIcon className="size-4" />
      </MenuButton>
      <Transition
        as={MenuItems}
        enter="transition ease-out"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
        anchor={{ to: "bottom end" }}
        className="dark:border-dark-500 dark:bg-dark-750 absolute z-100 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:shadow-none"
      >
        <MenuItem>
          {({ focus }) => (
            <button
              className={clsx(
                "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors ",
                focus && "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
              )}
            >
              <DocumentTextIcon className="size-4.5 stroke-1" />
              <span>Report</span>
            </button>
          )}
        </MenuItem>
      </Transition>
    </Menu>
  );
}

function StatusCell({ value, onChange }) {
  const options = [
    { value: false, label: "Pending", color: "warning" },
    { value: true, label: "Completed", color: "success" },
  ];

  const option = options.find((item) => item.value === value) || options[0];

  const handleChange = (newVal) => {
    onChange(newVal);
    toast.success(`Status updated to ${newVal ? "Completed" : "Pending"}`);
  };

  return (
    <Listbox onChange={handleChange} value={value}>
      <ListboxButton
        as={Tag}
        component="button"
        color={option.color}
        className="gap-1.5 cursor-pointer"
      >
        <span>{option.label}</span>
      </ListboxButton>
      <Transition
        as={ListboxOptions}
        enter="transition ease-out"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
        anchor={{ to: "bottom start", gap: "8px" }}
        className="max-h-60 z-100 w-40 overflow-auto rounded-lg border border-gray-300 bg-white py-1 text-xs-plus capitalize shadow-soft outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-750 dark:shadow-none"
      >
        {options.map((item) => (
          <ListboxOption
            key={String(item.value)}
            value={item.value}
            className={({ focus }) =>
              clsx(
                "relative flex cursor-pointer select-none items-center justify-between space-x-2 px-3 py-2 text-gray-800 outline-hidden transition-colors dark:text-dark-100 ",
                focus && "bg-gray-100 dark:bg-dark-600",
              )
            }
          >
            {({ selected }) => (
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="block truncate">{item.label}</span>
                </div>
                {selected && <CheckIcon className="-mr-1 size-4.5 stroke-1" />}
              </div>
            )}
          </ListboxOption>
        ))}
      </Transition>
    </Listbox>
  );
}

export function SubRowComponent({ row, cardWidth, table }) {
  const tests = [...row.original.tests].sort(
    (a, b) => Number(a.isCompleted) - Number(b.isCompleted)
  );

  return (
    <div
      className="sticky border-b border-b-gray-200 bg-gray-50 pb-4 pt-3 dark:border-b-dark-500 dark:bg-dark-750 ltr:left-0 rtl:right-0"
      style={{ maxWidth: cardWidth }}
    >
      <div className="flex items-center justify-between px-4 sm:px-5">
        <p className="font-medium text-gray-800 dark:text-dark-100">
          Candidate Tests:
        </p>
      </div>
      <div className="mt-1 overflow-x-auto overscroll-x-contain px-4 sm:px-5 lg:ltr:ml-14 rtl:rtl:mr-14">
        <Table
          hoverable
          className="w-full text-left text-xs-plus rtl:text-right [&_.table-td]:py-2"
        >
          <THead>
            <Tr className="border-y border-transparent border-b-gray-200 dark:border-b-dark-500">
              {cols.map((col) => (
                <Th
                  key={col.key}
                  className={`
                    py-2 font-semibold uppercase text-gray-800 dark:text-dark-100
                    ${col.key === "exam" ? "px-0" : ""}
                    ${col.key === "actions" ? "min-w-16 text-center" : ""}
                  `}
                >
                  {col.label}
                </Th>
              ))}
            </Tr>
          </THead>
          <TBody>
            {tests.map((test) => (
              <Tr
                key={test.id}
                className="border-y border-transparent border-b-gray-200 dark:border-b-dark-500"
              >
                <Td className="px-0 font-medium ltr:rounded-l-lg rtl:rounded-r-lg">
                  {test.testType.name}
                </Td>
                <Td>
                  <DateCell getValue={() => test.examDate} />
                </Td>
                <Td>
                  <StatusCell
                    value={test.isCompleted}
                    onChange={(newVal) => {
                      const originalTests = row.original.tests;
                      const testIndex = originalTests.findIndex((t) => t.id === test.id);
                      if (testIndex === -1) return;
                      const updatedTests = [...originalTests];
                      updatedTests[testIndex] = { ...updatedTests[testIndex], isCompleted: newVal };
                      table?.options.meta?.updateData(row.index, "tests", updatedTests);
                    }}
                  />
                </Td>
                <Td className="ltr:rounded-r-lg rtl:rounded-l-lg">
                  <div className="flex justify-center">
                    <TestRowActions />
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}

SubRowComponent.propTypes = {
  row: PropTypes.object,
  cardWidth: PropTypes.number,
  table: PropTypes.object,
};
