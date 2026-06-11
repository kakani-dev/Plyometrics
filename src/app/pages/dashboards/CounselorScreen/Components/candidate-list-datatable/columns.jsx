// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";
import { CalendarDays, Mail, Phone, User, VenetianMask, GraduationCap, MoreHorizontal } from "lucide-react";

// Local Imports
import { RowActions } from "./RowActions";

// ----------------------------------------------------------------------
import {
    CustomerCell,
    DateCell,
    EmailCell,
    ExamsCell,
    MobileNumberCell,
    GenderCell,
} from "./rows";
const columnHelper = createColumnHelper();

export const columns = [
    columnHelper.accessor((row) => row.name, {
        id: "name",
        label: "Name",
        header: () => <div className="flex items-center gap-1"><User className="size-4 text-primary-600" /><span>Name</span></div>,
        cell: CustomerCell,
    }),
    columnHelper.accessor((row) => row.dob, {
        id: "dob",
        label: "DOB",
        header: () => <div className="flex items-center gap-1"><CalendarDays className="size-4 text-primary-600" /><span>DOB</span></div>,
        cell: DateCell,
    }),
    columnHelper.accessor((row) => row.email, {
        id: "email",
        label: "Email",
        header: () => <div className="flex items-center gap-1"><Mail className="size-4 text-primary-600" /><span>Email</span></div>,
        cell: EmailCell,
    }),
    columnHelper.accessor((row) => row.mobilenumber, {
        id: "mobilenumber",
        label: "Mobile Number",
        header: () => <div className="flex items-center gap-1"><Phone className="size-4 text-primary-600" /><span>Mobile Number</span></div>,
        cell: MobileNumberCell,
    }),
    columnHelper.accessor((row) => row.gender, {
        id: "gender",
        label: "Gender",
        header: () => <div className="flex items-center gap-1"><VenetianMask className="size-4 text-primary-600" /><span>Gender</span></div>,
        cell: GenderCell,
    }),
    columnHelper.accessor((row) => `${row.examsFinished ?? 0}/${row.examsTotal ?? 0}`, {
        id: "exams",
        label: "Exams",
        header: () => <div className="flex items-center gap-1"><GraduationCap className="size-4 text-primary-600" /><span>Exams</span></div>,
        cell: ExamsCell,
        enableSorting: false,
    }),
    columnHelper.display({
        id: "actions",
        label: "Row Actions",
        header: () => <div className="flex items-center gap-1"><MoreHorizontal className="size-4 text-primary-600" /><span>Actions</span></div>,
        cell: RowActions
    }),
];


