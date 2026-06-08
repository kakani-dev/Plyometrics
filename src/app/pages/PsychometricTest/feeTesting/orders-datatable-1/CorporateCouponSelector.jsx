import { Fragment } from "react";
import { Box, Button } from "components/ui";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import PropTypes from "prop-types";

export const corporateCoupons = [
  { name: "Google Inc. (15%)", discount: 15 },
  { name: "Microsoft Corp (12%)", discount: 12 },
  { name: "Apple Staff (10%)", discount: 10 },
  { name: "Amazon Retail (8%)", discount: 8 },
  { name: "Meta Platforms (5%)", discount: 5 },
  { name: "Partner School Standard (3%)", discount: 3 },
  { name: "Clear Discount (0%)", discount: 0 }
];

export function CorporateCouponSelector({ selectedCoupon, onApplyCoupon }) {
  return (
    <Box className="mt-4 p-5 rounded-lg border border-gray-150 bg-white dark:border-dark-500 dark:bg-dark-750 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="max-w-xl">
        <h3 className="text-base font-semibold text-gray-800 dark:text-dark-100">
          Auto-fill Corporate Discounts
        </h3>
        <p className="text-xs text-gray-500 dark:text-dark-300 mt-1">
          Select a predefined corporate partner program from the dropdown to automatically apply the corresponding discount percentage to all fee structures.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Menu as="div" className="relative inline-block text-start">
          <MenuButton
            as={Button}
            className="space-x-2 rounded-full border border-gray-250 bg-gray-50 hover:bg-gray-100 dark:border-dark-400 dark:bg-dark-600 px-4 py-2 text-xs font-semibold"
          >
            {({ open }) => (
              <>
                <span>{selectedCoupon ? selectedCoupon.name : "Select Partner Coupon"}</span>
                <ChevronDownIcon
                  className={clsx(
                    "size-4 transition-transform text-gray-500",
                    open && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </>
            )}
          </MenuButton>
          <Transition
            as={Fragment}
            enter="transition ease-out"
            enterFrom="opacity-0 translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-2"
          >
            <MenuItems className="absolute right-0 md:left-0 z-[100] mt-1.5 min-w-[14rem] rounded-lg border border-gray-300 bg-white py-1 font-medium shadow-lg shadow-gray-200/50 outline-none focus-visible:outline-none dark:border-dark-500 dark:bg-dark-700 dark:shadow-none">
              {corporateCoupons.map((coupon) => (
                <MenuItem key={coupon.name}>
                  {({ focus }) => (
                    <button
                      onClick={() => onApplyCoupon(coupon)}
                      className={clsx(
                        "flex h-9 w-full items-center justify-between px-3 tracking-wide outline-none transition-colors text-xs text-left",
                        focus
                          ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
                          : "text-gray-700 dark:text-dark-100",
                      )}
                    >
                      <span>{coupon.name}</span>
                      <span className="font-bold text-xxs bg-gray-100 dark:bg-dark-600 px-1.5 py-0.5 rounded-full">
                        {coupon.discount}%
                      </span>
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Transition>
        </Menu>
      </div>
    </Box>
  );
}

CorporateCouponSelector.propTypes = {
  selectedCoupon: PropTypes.object,
  onApplyCoupon: PropTypes.func.isRequired,
};
