import { createColumnHelper } from "@tanstack/react-table";

import { RowActions } from "./RowActions";
import {
    SelectCell,
    SelectHeader,
} from "components/shared/table/SelectCheckbox";
import {
    CustomerCell,
    DateCell,
    EmailCell,
    MobileNumberCell,
    GenderCell,
    ExamsCell,
} from "./rows";

const columnHelper = createColumnHelper();

export const columns = [
    columnHelper.display({
        id: "select",
        label: "Row Selection",
        header: SelectHeader,
        cell: SelectCell,
    }),
    columnHelper.accessor((row) => row.name, {
        id: "name",
        label: "Name",
        header: "Name",
        cell: CustomerCell,
    }),
    columnHelper.accessor((row) => row.dob, {
        id: "dob",
        label: "Date of Birth",
        header: "DOB",
        cell: DateCell,
    }),
    columnHelper.accessor((row) => row.email, {
        id: "email",
        label: "Email",
        header: "Email",
        cell: EmailCell,
    }),
    columnHelper.accessor((row) => row.mobilenumber, {
        id: "mobilenumber",
        label: "Mobile Number",
        header: "Mobile",
        cell: MobileNumberCell,
    }),
    columnHelper.accessor((row) => row.gender, {
        id: "gender",
        label: "Gender",
        header: "Gender",
        cell: GenderCell,
    }),
    columnHelper.accessor(
        (row) => `${row.examsFinished}/${row.examsTotal}`,
        {
            id: "exams",
            label: "Exams Finished/Total",
            header: "Exams",
            cell: ExamsCell,
        }
    ),
    columnHelper.display({
        id: "actions",
        label: "Row Actions",
        header: "Actions",
        cell: RowActions
    }),
]
