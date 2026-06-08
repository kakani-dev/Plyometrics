// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";
import {
    SelectCell,
    SelectHeader,
} from "components/shared/table/SelectCheckbox";
import { Input } from "components/ui";

const columnHelper = createColumnHelper();

const getPeriodMultiplier = (periodName) => {
    const name = (periodName || "").toLowerCase().trim();
    if (name.includes("annual") || name.includes("one time") || name.includes("yearly")) return 1;
    if (name.includes("semi") || name.includes("half")) return 2;
    if (name.includes("term")) return 3; // Usually 3 terms per academic year
    if (name.includes("quarter")) return 4;
    if (name.includes("monthly")) return 12; // 12 months per academic year
    return 1;
};

export const columns = [
    columnHelper.display({
        id: "select",
        label: "Row Selection",
        header: SelectHeader,
        cell: SelectCell,
    }),
    columnHelper.accessor((row) => row.feeStructureName, {
        id: "feeStructureName",
        label: "Fee Structure",
        header: "Fee Structure",
        cell: ({ getValue }) => (
            <span className="font-medium text-gray-800 dark:text-dark-100">
                {getValue()}
            </span>
        ),
    }),
    columnHelper.accessor((row) => row.feeStructureAmount, {
        id: "feeStructureAmount",
        label: "Amount",
        header: "Amount",
        cell: ({ getValue }) => (
            <span className="font-semibold text-gray-850 dark:text-dark-50">
                ₹{getValue().toLocaleString()}
            </span>
        ),
        filterFn: "inNumberRange",
    }),
    columnHelper.accessor((row) => row.paymentPeriodName, {
        id: "paymentPeriodName",
        label: "Payment Period",
        header: "Payment Period",
        cell: ({ getValue }) => (
            <span className="text-gray-600 dark:text-dark-200">
                {getValue()}
            </span>
        ),
    }),
    columnHelper.accessor((row) => row.specialDiscount, {
        id: "specialDiscount",
        label: "Special Discount (%)",
        header: "Special Discount (%)",
        cell: ({ getValue, row, column, table }) => {
            const value = getValue();
            return (
                <div className="flex items-center space-x-1 w-24">
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            table.options.meta?.updateData(row.index, column.id, val);
                        }}
                        placeholder="0"
                        className="h-8 py-1 text-xs w-full text-emerald-600 dark:text-emerald-400 font-medium"
                    />
                    <span className="text-xs text-gray-400 font-bold">%</span>
                </div>
            );
        },
        filterFn: "inNumberRange",
    }),
    columnHelper.accessor((row) => row.corporateDiscount, {
        id: "corporateDiscount",
        label: "Corporate Discount (%)",
        header: "Corporate Discount (%)",
        cell: ({ getValue, row, column, table }) => {
            const value = getValue();
            return (
                <div className="flex items-center space-x-1 w-24">
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            table.options.meta?.updateData(row.index, column.id, val);
                        }}
                        placeholder="0"
                        className="h-8 py-1 text-xs w-full text-blue-600 dark:text-blue-400 font-medium"
                    />
                    <span className="text-xs text-gray-400 font-bold">%</span>
                </div>
            );
        },
        filterFn: "inNumberRange",
    }),
    columnHelper.accessor(
        (row) => {
            const amount = row.feeStructureAmount || 0;
            const specialPct = row.specialDiscount || 0;
            const corporatePct = row.corporateDiscount || 0;
            const specialAmt = (amount * specialPct) / 100;
            const corporateAmt = (amount * corporatePct) / 100;
            return amount - specialAmt - corporateAmt;
        },
        {
            id: "totalAmount",
            label: "Total (Per Period)",
            header: "Total (Per Period)",
            cell: ({ getValue }) => (
                <span className="font-semibold text-gray-700 dark:text-dark-100">
                    ₹{getValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            ),
            filterFn: "inNumberRange",
        }
    ),
    columnHelper.accessor(
        (row) => {
            const amount = row.feeStructureAmount || 0;
            const specialPct = row.specialDiscount || 0;
            const corporatePct = row.corporateDiscount || 0;
            const specialAmt = (amount * specialPct) / 100;
            const corporateAmt = (amount * corporatePct) / 100;
            const periodTotal = amount - specialAmt - corporateAmt;
            const multiplier = getPeriodMultiplier(row.paymentPeriodName);
            return periodTotal * multiplier;
        },
        {
            id: "academicYearTotal",
            label: "Total Academic Year Fee",
            header: "Total Academic Year Fee",
            cell: ({ getValue, row }) => {
                const multiplier = getPeriodMultiplier(row.original.paymentPeriodName);
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-dark-50 text-sm-plus">
                            ₹{getValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xxs text-gray-400 dark:text-dark-300">
                            (₹{((row.original.feeStructureAmount || 0) * (1 - ((row.original.specialDiscount || 0) + (row.original.corporateDiscount || 0)) / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })} × {multiplier})
                        </span>
                    </div>
                );
            },
            filterFn: "inNumberRange",
        }
    ),
    columnHelper.display({
        id: "actions",
        label: "Row Actions",
        header: "Actions",
        cell: RowActions,
    }),
];
