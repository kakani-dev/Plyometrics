// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { NotebookText } from "lucide-react";
import axios from "axios";
import dayjs from "dayjs";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "sonner";

// Local Imports
import { Button, Input } from "components/ui";
import { DatePicker } from "components/shared/form/Datepicker";
import { Listbox } from "components/shared/form/Listbox";
import { NEUROPI_API_BASE } from "configs/auth.config";

// ----------------------------------------------------------------------

const difficultyOptions = [
  { id: 1, name: "Easy" },
  { id: 2, name: "Medium" },
  { id: 3, name: "Hard" },
  { id: 4, name: "Expert" },
];

// ----------------------------------------------------------------------

export function ExamGenerationDrawer({ isOpen, close, row }) {
  const [existingExams, setExistingExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [difficulties, setDifficulties] = useState([]);
  const [loadingDifficulties, setLoadingDifficulties] = useState(false);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [examDate, setExamDate] = useState(null);
  const [sampleSize, setSampleSize] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [ratios, setRatios] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [payloadPreview, setPayloadPreview] = useState(null);

  const ageFromDob = useMemo(() => {
    if (!row.original.dob) return null;
    return dayjs().diff(dayjs(row.original.dob), "year");
  }, [row.original.dob]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchExistingExams = async () => {
      setLoadingExams(true);
      try {
        const { data } = await axios.get(
          `${NEUROPI_API_BASE}/api/TestService/by-candidate/${row.original.id}/tenant/1`,
        );
        setExistingExams(data.data || []);
      } catch {
        setExistingExams([]);
      } finally {
        setLoadingExams(false);
      }
    };
    fetchExistingExams();

    const fetchDifficulties = async () => {
      setLoadingDifficulties(true);
      try {
        const { data } = await axios.get(
          `${NEUROPI_API_BASE}/api/MasterService/1`,
        );
        setDifficulties(data.data || []);
      } catch {
        setDifficulties(difficultyOptions);
      } finally {
        setLoadingDifficulties(false);
      }
    };
    fetchDifficulties();
  }, [isOpen, row.original.id]);

  const handleDifficultyChange = useCallback((items) => {
    setSelectedDifficulties(items);
    setRatios(new Array(items.length).fill(""));
  }, []);

  const handleRatioChange = (index, value) => {
    const updated = [...ratios];
    updated[index] = value;
    setRatios(updated);
  };

  const handleSubmit = useCallback(() => {
    if (!examDate) {
      toast.error("Please select an exam date");
      return;
    }
    if (!selectedDifficulties.length) {
      toast.error("Please select at least one difficulty");
      return;
    }
    if (!sampleSize) {
      toast.error("Please enter sample size");
      return;
    }

    const ratioSum = ratios.reduce((sum, r) => sum + (Number(r) || 0), 0);
    if (ratioSum > 100) {
      toast.error("Sum of ratios cannot exceed 100");
      return;
    }

    const payload = {
      candidateId: row.original.id,
      counselorId: 1,
      examDate: dayjs(examDate).toISOString(),
      tenantId: 1,
      createdBy: "1",
      sampleSize: Number(sampleSize),
      minAge: Number(minAge) || ageFromDob || 0,
      maxAge: Number(maxAge) || ageFromDob || 0,
      difficultyIds: selectedDifficulties.map((d) => d.id).join(","),
      ratios: ratios.filter((r) => r !== "").join(","),
    };

    setPayloadPreview(payload);
  }, [
    examDate,
    selectedDifficulties,
    sampleSize,
    minAge,
    maxAge,
    ratios,
    row.original.id,
  ]);

  const handleConfirmSend = useCallback(async () => {
    setSubmitting(true);
    try {
      await axios.post(
        `${NEUROPI_API_BASE}/api/TestService/schedule-and-generate`,
        payloadPreview,
      );
      toast.success("Exam generated successfully");
      close();
    } catch {
      toast.error("Failed to generate exam");
    } finally {
      setSubmitting(false);
    }
  }, [payloadPreview, close]);

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
          className="fixed right-0 top-0 flex h-full w-full max-w-xl transform-gpu flex-col bg-white py-4 transition-transform duration-200 dark:bg-dark-700"
        >
          <div className="flex items-center justify-between px-4 sm:px-5">
            <div className="flex items-center gap-2">
              <NotebookText className="size-6 text-primary-600 dark:text-primary-400" />
              <span className="text-lg font-semibold">Exam Generation</span>
            </div>
            <Button
              onClick={close}
              variant="flat"
              isIcon
              className="size-6 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <div className="mt-3 flex items-center gap-4 border-b border-gray-200 px-4 pb-3 dark:border-dark-500 sm:px-5">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-dark-300">Candidate:</span>
              <p className="font-medium text-gray-800 dark:text-dark-50">{row.original.name}</p>
            </div>
            <div className="text-end">
              <span className="text-xs font-semibold text-gray-500 dark:text-dark-300">ID:</span>
              <p className="font-medium text-primary-600 dark:text-primary-400">#{row.original.id}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <div className="space-y-5">
              {loadingExams ? (
                <p className="text-sm text-gray-400">Loading existing exams...</p>
              ) : existingExams.length > 0 ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-200">
                    Existing Tests ({existingExams.length})
                  </label>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-dark-500">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-100 text-xs uppercase text-gray-600 dark:bg-dark-600 dark:text-dark-300">
                        <tr>
                          <th className="px-3 py-2">Test Name</th>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-dark-500">
                        {existingExams.map((exam) => (
                          <tr key={exam.id} className="bg-white dark:bg-dark-700">
                            <td className="px-3 py-2 font-medium text-gray-800 dark:text-dark-50">
                              {exam.testName || `Test #${exam.testTypeId}`}
                            </td>
                            <td className="px-3 py-2 text-gray-600 dark:text-dark-300">
                              {dayjs(exam.examDate).format("MMM D, YYYY h:mm A")}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                  exam.isCompleted
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : exam.counselorId > 0
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                }`}
                              >
                                {exam.isCompleted
                                  ? "Completed"
                                  : exam.counselorId > 0
                                    ? "Assigned"
                                    : "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No existing tests found</p>
              )}

              <Listbox
                multiple
                data={difficulties}
                value={selectedDifficulties}
                onChange={handleDifficultyChange}
                label="Difficulty Levels"
                displayField="name"
                placeholder={
                  loadingDifficulties
                    ? "Loading..."
                    : "Select difficulties..."
                }
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-dark-200">
                  Exam Date
                </label>
                <DatePicker
                  options={{
                    defaultDate: examDate,
                    dateFormat: "Y-m-d",
                    onChange: (selectedDates) => {
                      setExamDate(selectedDates[0] || null);
                    },
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Sample Size"
                  type="number"
                  placeholder="e.g. 50"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(e.target.value)}
                />
                <Input
                  label="Min Age"
                  type="number"
                  placeholder="e.g. 18"
                  value={minAge || (ageFromDob != null ? String(ageFromDob) : "")}
                  onChange={(e) => setMinAge(e.target.value)}
                />
                <Input
                  label="Max Age"
                  type="number"
                  placeholder="e.g. 60"
                  value={maxAge || (ageFromDob != null ? String(ageFromDob) : "")}
                  onChange={(e) => setMaxAge(e.target.value)}
                />
              </div>

              {selectedDifficulties.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                    Ratios (sum should not exceed 100)
                  </label>
                  {selectedDifficulties.map((diff, index) => (
                    <div key={diff.id} className="flex items-center gap-3">
                      <span className="w-20 text-sm font-medium text-gray-600 dark:text-dark-300">
                        {diff.name}
                      </span>
                      <Input
                        type="number"
                        placeholder="e.g. 30"
                        value={ratios[index] || ""}
                        onChange={(e) => handleRatioChange(index, e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-400">%</span>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400">
                    Total: {ratios.reduce((s, r) => s + (Number(r) || 0), 0)}%
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-4 pt-4 dark:border-dark-500 sm:px-5">
            <Button variant="outlined" onClick={close}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              Generate Exam
            </Button>
          </div>

          {payloadPreview && (
            <div className="fixed inset-0 z-200 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
              <div className="mx-4 w-full max-w-lg rounded-lg bg-white p-5 dark:bg-dark-700">
                <h3 className="mb-3 text-base font-semibold text-gray-800 dark:text-dark-50">
                  Payload Preview
                </h3>
                <p className="mb-2 text-xs text-gray-500 dark:text-dark-300">
                  Endpoint:{" "}
                  <code className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-dark-600">
                    POST /api/TestService/schedule-and-generate
                  </code>
                </p>
                <pre className="max-h-60 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs dark:border-dark-500 dark:bg-dark-800">
                  {JSON.stringify(payloadPreview, null, 2)}
                </pre>
                <div className="mt-4 flex justify-end gap-3">
                  <Button
                    variant="outlined"
                    onClick={() => setPayloadPreview(null)}
                  >
                    Edit
                  </Button>
                  <Button onClick={handleConfirmSend} loading={submitting}>
                    Confirm & Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

ExamGenerationDrawer.propTypes = {
  isOpen: PropTypes.bool,
  close: PropTypes.func,
  row: PropTypes.object,
};
