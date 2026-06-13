import dayjs from "dayjs";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { CalendarDaysIcon, CheckIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

import { Highlight } from "components/shared/Highlight";
import { Avatar, Tag } from "components/ui";
import { useLocaleContext } from "app/contexts/locale/context";
import { ensureString } from "utils/ensureString";

export function CustomerCell({ getValue, column, table }) {
  const globalQuery = ensureString(table.getState().globalFilter);
  const columnQuery = ensureString(column.getFilterValue());
  const name = getValue();

  return (
    <div className="flex items-center space-x-4">
      <Avatar
        size={9}
        name={name}
        initialColor="auto"
        initialVariant="soft"
        classNames={{
          display: "mask is-squircle rounded-none text-sm font-semibold",
        }}
      />
      <span className="font-semibold text-gray-800 dark:text-dark-100 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors">
        <Highlight query={[globalQuery, columnQuery]}>{name}</Highlight>
      </span>
    </div>
  );
}

export function DateCell({ getValue }) {
  const { locale } = useLocaleContext();
  const timestapms = getValue();
  const date = dayjs(timestapms).locale(locale).format("DD MMM YYYY");
  const age = dayjs().diff(dayjs(timestapms), "year");
  return (
    <div className="flex items-center gap-2">
      <CalendarDaysIcon className="size-5 stroke-1 text-amber-500 dark:text-amber-400" />
      <div>
        <p className="font-medium">{date}</p>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-dark-300">Age: {age} years</p>
      </div>
    </div>
  );
}

export function EmailCell({ getValue }) {
  const email = getValue();
  return (
    <div className="flex items-center gap-2">
      <EnvelopeIcon className="size-4.5 stroke-1 text-red-500 dark:text-red-400" />
      <span className="text-gray-800 dark:text-dark-100">{email}</span>
    </div>
  );
}

function formatPhoneNumber(phoneNumberString) {
  if (!phoneNumberString) return "";
  const cleaned = ("" + phoneNumberString).replace(/\D/g, "");
  if (cleaned.length === 10) {
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
  }
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    const match = cleaned.match(/^1(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
    }
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    const match = cleaned.match(/^91(\d{5})(\d{5})$/);
    if (match) {
      return `+91 ${match[1]}-${match[2]}`;
    }
  }
  return phoneNumberString;
}

export function MobileNumberCell({ getValue }) {
  const number = getValue();
  return (
    <div className="flex items-center gap-2">
      <PhoneIcon className="size-4.5 stroke-1 text-green-500 dark:text-green-400" />
      <span className="text-gray-800 dark:text-dark-100">{formatPhoneNumber(number)}</span>
    </div>
  );
}

export function GenderCell({ getValue, row, column, table }) {
  const val = getValue();
  const options = [
    { value: "male", label: "Male", color: "info" },
    { value: "female", label: "Female", color: "warning" },
  ];

  const normalizedVal = val ? String(val).toLowerCase() : "";
  const option = options.find(
    (item) => item.value.toLowerCase() === normalizedVal
  ) || {
    value: val,
    label: val || "",
    color: "primary",
  };

  const handleChangeStatus = (status) => {
    table.options.meta?.updateData(row.index, column.id, status);
    toast.success(`Gender updated to ${status}`);
  };

  return (
    <Listbox onChange={handleChangeStatus} value={val}>
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
            key={item.value}
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

export function ExamsCell({ row }) {
  const finished = row.original.examsFinished ?? 0;
  const total = row.original.examsTotal ?? 0;
  return (
    <span className="font-medium text-gray-800 dark:text-dark-100">
      {finished}/{total}
    </span>
  );
}

CustomerCell.propTypes = {
  row: PropTypes.object,
  column: PropTypes.object,
  table: PropTypes.object,
  getValue: PropTypes.func,
};

DateCell.propTypes = {
  getValue: PropTypes.func,
};

EmailCell.propTypes = {
  getValue: PropTypes.func,
};

MobileNumberCell.propTypes = {
  getValue: PropTypes.func,
};

GenderCell.propTypes = {
  getValue: PropTypes.func,
  row: PropTypes.object,
  column: PropTypes.object,
  table: PropTypes.object,
};

ExamsCell.propTypes = {
  row: PropTypes.object,
};
