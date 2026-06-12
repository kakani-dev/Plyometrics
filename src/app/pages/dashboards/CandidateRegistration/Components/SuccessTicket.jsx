import { Card, Button } from "components/ui";
import { CheckCircle, RefreshCw } from "lucide-react";

export function SuccessTicket({ ticketId, formValues, examOptions, handleReset }) {
  return (
    <div className="flex flex-col items-center">
      <Card skin="shadow" className="w-full max-w-lg overflow-hidden bg-white dark:bg-dark-700 relative border border-green-500/20">
        {/* Visual Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-400 w-full" />
        
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950/40 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 dark:text-dark-50">
            Registration Successful!
          </h3>
          <p className="text-sm text-gray-500 dark:text-dark-300 mt-1">
            Candidate profile created and assessment link dispatched.
          </p>

          {/* Decorative Ticket Content */}
          <div className="w-full bg-gray-50 dark:bg-dark-750 rounded-lg p-5 mt-6 border border-gray-150 dark:border-dark-600 text-left space-y-4 font-mono text-xs">
            <div className="flex justify-between border-b border-dashed border-gray-300 dark:border-dark-500 pb-3">
              <div>
                <span className="text-gray-400 block uppercase tracking-wider">Candidate ID</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-dark-50">{ticketId}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block uppercase tracking-wider">Date</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-dark-50">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 block uppercase tracking-wider">Name</span>
                <span className="text-gray-800 dark:text-dark-100 font-sans font-medium text-sm break-all">
                  {formValues.fullName}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block uppercase tracking-wider">Gender</span>
                <span className="text-gray-800 dark:text-dark-100 capitalize font-sans text-sm">
                  {formValues.gender}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 block uppercase tracking-wider">Assigned Assessment</span>
                <span className="text-primary-600 dark:text-primary-400 font-sans font-medium text-sm">
                  {examOptions.find(o => o.value === formValues.examType)?.label}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block uppercase tracking-wider">Contact Status</span>
                <span className="text-green-600 dark:text-green-400 font-sans font-medium text-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                  Email Sent
                </span>
              </div>
            </div>

            {/* Barcode representation */}
            <div className="pt-4 flex flex-col items-center border-t border-dashed border-gray-300 dark:border-dark-500">
              <div className="h-8 bg-gray-800 dark:bg-dark-400 w-full rounded flex items-center justify-between px-4 opacity-70">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div 
                    key={i} 
                    style={{ width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2)}px` }} 
                    className="h-6 bg-white dark:bg-dark-800"
                  />
                ))}
              </div>
              <span className="mt-2 text-[10px] text-gray-450 tracking-[0.25em]">{ticketId}</span>
            </div>
          </div>

          {/* Reset/Register new buttons */}
          <div className="flex gap-3 w-full mt-6">
            <Button 
              variant="outlined" 
              color="neutral" 
              className="w-full"
              onClick={() => window.print()}
            >
              Print Ticket
            </Button>
            <Button 
              color="primary" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleReset}
            >
              <RefreshCw className="w-4 h-4" />
              Register Another
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
