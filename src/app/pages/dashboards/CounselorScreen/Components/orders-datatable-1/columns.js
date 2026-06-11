// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";

// ----------------------------------------------------------------------
import {
    // AddressCell,
    CustomerCell,
    DateCell,
    // OrderIdCell,
    OrderStatusCell,
    // ProfitCell,
    // TotalCell,
} from "./rows";
const columnHelper = createColumnHelper();

export const columns = [
    columnHelper.accessor((row) => row.name, {
        id: "name",
        label: "Name",
        header: "Name",
        cell: CustomerCell,
    }),
    columnHelper.accessor((row) => row.dob, {
        id: "dob",
        label: "DOB",
        header: "DOB",
        cell: DateCell,
    }),
    columnHelper.accessor((row) => row.email, {
        id: "email",
        label: "Email",
        header: "Email",
        cell: (info) => info.getValue() || "",
    }),
    columnHelper.accessor((row) => row.mobilenumber, {
        id: "mobilenumber",
        label: "Mobile Number",
        header: "Mobile Number",
        cell: (info) => info.getValue() || "",
    }),
    columnHelper.accessor((row) => row.gender, {
        id: "gender",
        label: "Gender",
        header: "Gender",
        cell: OrderStatusCell,
    }),
    columnHelper.display({
        id: "actions",
        label: "Row Actions",
        header: "Actions",
        cell: RowActions
    }),
];


