import { Card } from "components/ui";
import { ClipboardList } from "lucide-react";

export function RegistrationProgress({ completionPercentage, formValues }) {
  return (
    <Card skin="shadow" className="p-5 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent border border-primary-500/20">
      <h3 className="text-base font-semibold text-gray-800 dark:text-dark-50 mb-3 flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-primary-500" />
        Registration Progress
      </h3>
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200/50 dark:text-primary-400 dark:bg-primary-500/20">
              Progress
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
              {completionPercentage}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-dark-600">
          <div 
            style={{ width: `${completionPercentage}%` }} 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"
          ></div>
        </div>
      </div>
      <ul className="text-xs space-y-2.5 text-gray-500 dark:text-dark-350">
        <li className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${formValues.fullName ? "bg-green-500" : "bg-gray-300 dark:bg-dark-500"}`}></span>
          Personal Details
        </li>
        <li className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${formValues.email && formValues.phone ? "bg-green-500" : "bg-gray-300 dark:bg-dark-500"}`}></span>
          Contact Information
        </li>
        <li className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${formValues.dob ? "bg-green-500" : "bg-gray-300 dark:bg-dark-500"}`}></span>
          Date of Birth
        </li>
        <li className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${formValues.agreed ? "bg-green-500" : "bg-gray-300 dark:bg-dark-500"}`}></span>
          Terms Agreement
        </li>
      </ul>
    </Card>
  );
}
