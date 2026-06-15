import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  ArrowDownTrayIcon,
  CheckIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { useReactToPrint } from "react-to-print";

import { Button, Table, THead, TBody, Th, Tr, Td, Tag } from "components/ui";
import { DateCell } from "./rows";
import { generateReport } from "./data";
import ResultsScreen from "app/pages/dashboards/NewExam/components/ResultsScreen";

import "app/pages/dashboards/NewExam/styles.css";

const cols = [
  { label: "Exam Name", key: "exam" },
  { label: "Exam Date", key: "date" },
  { label: "Status", key: "status" },
  { label: "Actions", key: "actions" },
];

function TestRowActions({ test, onGenerateReport }) {
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
              onClick={() => onGenerateReport(test)}
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
  const [reportState, setReportState] = useState({
    isOpen: false,
    loading: false,
    text: "",
    error: "",
    testName: "",
    sessionId: "",
  });

  const handleGenerateReport = async (test) => {
    const sessionId = test.testType?.sessionId;
    if (!sessionId) {
      toast.error("No session ID available for this test");
      return;
    }
    setReportState({
      isOpen: true,
      loading: true,
      text: "",
      error: "",
      testName: test.testType.name,
      sessionId,
    });
    const report = await generateReport(sessionId);
    if (report) {
      setReportState((prev) => ({
        ...prev,
        loading: false,
        text: typeof report === "string" ? report : JSON.stringify(report, null, 2),
      }));
    } else {
      setReportState((prev) => ({ ...prev, loading: false, error: "Failed to generate AI report" }));
    }
  };

  const closeReport = () => {
    setReportState({ isOpen: false, loading: false, text: "", error: "", testName: "", sessionId: "" });
  };

  const printRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `AI-Report-${reportState.testName}`,
    pageStyle: `
      @page { margin: 20mm; }
      .report-content { padding: 0 !important; }
    `,
  });

  const parseReportSections = (text) => {
    if (!text) return null;
    const sections = { sec1: "", sec2: "", sec3: "", sec4: "" };
    const s1 = text.indexOf("[SECTION 1]");
    const s2 = text.indexOf("[SECTION 2]");
    const s3 = text.indexOf("[SECTION 3]");
    const s4 = text.indexOf("[SECTION 4]");
    if (s1 !== -1 && s2 !== -1) sections.sec1 = text.substring(s1 + 11, s2).trim();
    if (s2 !== -1 && s3 !== -1) sections.sec2 = text.substring(s2 + 11, s3).trim();
    if (s3 !== -1 && s4 !== -1) sections.sec3 = text.substring(s3 + 11, s4).trim();
    if (s4 !== -1) sections.sec4 = text.substring(s4 + 11).trim();
    if (!sections.sec1 && !sections.sec2) {
      const paras = text.split("\n\n").filter((p) => p.trim().length > 20);
      return { sec1: paras[0] || "", sec2: paras[1] || "", sec3: paras[2] || "", sec4: paras.slice(3).join("\n\n") || "" };
    }

    const cleanHeader = (secText) => {
      const lines = secText.split('\n');
      if (lines.length > 0 && (
        lines[0].toLowerCase().includes("executive summary") || 
        lines[0].toLowerCase().includes("cognitive profile") || 
        lines[0].toLowerCase().includes("academic stream") || 
        lines[0].toLowerCase().includes("counselor intervention")
      )) {
        return lines.slice(1).join('\n').trim();
      }
      return secText;
    };

    sections.sec1 = cleanHeader(sections.sec1);
    sections.sec2 = cleanHeader(sections.sec2);
    sections.sec3 = cleanHeader(sections.sec3);
    sections.sec4 = cleanHeader(sections.sec4);

    return sections;
  };

  const reportSections = parseReportSections(reportState.text);

  // Dynamic Parsing logic
  let cognitiveStrengths = "";
  let learningStrategy = "";
  if (reportSections?.sec2) {
    const parts = reportSections.sec2.split(/\n(?=(?:To bypass|To support|learning style|learning strategy|preference))/i);
    if (parts.length > 1) {
      cognitiveStrengths = parts[0].trim();
      learningStrategy = parts.slice(1).join('\n').trim();
    } else {
      const paras = reportSections.sec2.split('\n\n');
      cognitiveStrengths = paras[0] || "";
      learningStrategy = paras.slice(1).join('\n\n') || "";
    }
  }

  let recommendedStream = "Humanities & Liberal Arts";
  let streamSubjects = "History, Political Science, Psychology, Sociology, and Literature/English";
  let careerFitScore = 78;
  let streamActions = [];

  if (reportSections?.sec3) {
    const streamMatch = reportSections.sec3.match(/academic stream for\s+[\w\s]+\s+is\s+([^\n,.]+)/i) || reportSections.sec3.match(/recommended\s+\w+\s+academic stream[^\n]*?is\s+([^\n,.]+)/i);
    if (streamMatch) recommendedStream = streamMatch[1].trim();

    const scoreMatch = reportSections.sec3.match(/fit score of\s+(\d+)%/i) || reportSections.sec3.match(/fit score[\s\w]+of\s+(\d+)%/i) || reportSections.sec3.match(/score of\s+(\d+)%/i);
    if (scoreMatch) careerFitScore = parseInt(scoreMatch[1], 10);

    const subjectsMatch = reportSections.sec3.match(/subjects include\s+([^\n.]+)/i) || reportSections.sec3.match(/Subjects include\s+([^\n.]+)/i);
    if (subjectsMatch) streamSubjects = subjectsMatch[1].trim();

    const pathMatches = reportSections.sec3.match(/- \*\*Path \d+:[^*]+\*\*:[^\n]+/g) || reportSections.sec3.match(/- \*\*([^*]+)\*\*:[^\n]+/g);
    if (pathMatches) {
      streamActions = pathMatches.map(p => p.replace(/^-\s*\*\*Path\s+\d+:\s*/i, '').replace(/^-\s*\*\*/, '').replace(/\*\*/, '').trim());
    }
  }

  let priorities = ["Emotional Safety", "Stress Reduction", "Study Habits"];
  if (reportSections?.sec4) {
    const bulletMatches = reportSections.sec4.match(/- \*\*([^*]+)\*\*/g);
    if (bulletMatches) {
      priorities = bulletMatches.map(b => b.replace(/- \*\*/, '').replace(/\*\*/, '').trim());
    }
  }

  // Parse circular gauge scores and profile details
  let careerReadiness = 50;
  let riasecClarity = 50;
  let cognitiveIndex = 50;
  let emotionalSustainability = 50;
  let grade = "-";
  
  let dominantRIASEC = "Realistic (R)";
  let dominantBig5 = "Conscientiousness";
  let bigFiveBalance = 82;
  let dominantLearning = "Visual (V)";
  let learningPreferenceStrength = 90;

  if (reportSections?.sec1) {
    const crMatch = reportSections.sec1.match(/Career Readiness score of\s+(\d+)%/i) || reportSections.sec1.match(/Career Readiness[^\n]*?\s+(\d+)%/i);
    if (crMatch) careerReadiness = parseInt(crMatch[1], 10);

    const rcMatch = reportSections.sec1.match(/RIASEC Clarity of\s+(\d+)%/i) || reportSections.sec1.match(/RIASEC Clarity[^\n]*?\s+(\d+)%/i);
    if (rcMatch) riasecClarity = parseInt(rcMatch[1], 10);

    const ciMatch = reportSections.sec1.match(/Cognitive Index stands at\s+(\d+)%/i) || reportSections.sec1.match(/Cognitive Index[^\n]*?\s+(\d+)%/i);
    if (ciMatch) cognitiveIndex = parseInt(ciMatch[1], 10);

    const stressMatch = reportSections.sec1.match(/Stress scale with[^\n]*?\s+(\d+)%/i) || reportSections.sec1.match(/Stress[^\n]*?\s+(\d+)%/i);
    if (stressMatch) {
      emotionalSustainability = Math.max(0, 100 - parseInt(stressMatch[1], 10));
    } else {
      emotionalSustainability = 40;
    }

    const gradeMatch = reportSections.sec1.match(/Grade\s+(\d+)/i) || reportSections.sec1.match(/Grade\s+(\w+)/i);
    if (gradeMatch) grade = gradeMatch[1].trim();

    const riasecMatch = reportSections.sec1.match(/anchor him firmly in the\s+(\w+)\s+domain/i) || reportSections.sec1.match(/dominant vector alignments[^\n]*?in the\s+(\w+)\s+domain/i);
    if (riasecMatch) {
      const dom = riasecMatch[1].trim();
      dominantRIASEC = dom.charAt(0).toUpperCase() + dom.slice(1) + ` (${dom.charAt(0).toUpperCase()})`;
    } else if (reportSections.sec1.toLowerCase().includes("artistic")) {
      dominantRIASEC = "Artistic (A)";
    }

    const b5Match = reportSections.sec1.match(/score in\s+([^*%()]+)\s+\(Balance Index:\s*(\d+)%\)/i) || reportSections.sec1.match(/Openness to Experience\s+\(Balance Index:\s*(\d+)%\)/i);
    if (b5Match) {
      if (b5Match.length > 2) {
        dominantBig5 = b5Match[1].trim();
        bigFiveBalance = parseInt(b5Match[2], 10);
      } else {
        dominantBig5 = "Openness to Experience";
        bigFiveBalance = parseInt(b5Match[1], 10);
      }
    } else if (reportSections.sec1.toLowerCase().includes("openness")) {
      dominantBig5 = "Openness to Experience";
      const balanceMatch = reportSections.sec1.match(/Balance Index:\s*(\d+)%/i);
      if (balanceMatch) bigFiveBalance = parseInt(balanceMatch[1], 10);
    }
  }

  if (reportSections?.sec2) {
    const learnMatch = reportSections.sec2.match(/dominant\s+(\w+)\s+learning style\s+\((\d+)%\s+Preference Index\)/i) || reportSections.sec2.match(/Visual learning style\s+\((\d+)%\s+Preference Index\)/i);
    if (learnMatch) {
      if (learnMatch.length > 2) {
        const styleName = learnMatch[1].trim();
        dominantLearning = styleName.charAt(0).toUpperCase() + styleName.slice(1) + ` (${styleName.charAt(0).toUpperCase()})`;
        learningPreferenceStrength = parseInt(learnMatch[2], 10);
      } else {
        dominantLearning = "Visual (V)";
        learningPreferenceStrength = parseInt(learnMatch[1], 10);
      }
    } else if (reportSections.sec2.toLowerCase().includes("visual")) {
      dominantLearning = "Visual (V)";
      const strengthMatch = reportSections.sec2.match(/(\d+)%\s+Preference Index/i);
      if (strengthMatch) learningPreferenceStrength = parseInt(strengthMatch[1], 10);
    }
  }

  const reportData = reportSections ? {
    localNarrative: {
      executiveSummary: reportSections.sec1,
      cognitiveStrengths: cognitiveStrengths,
      learningStrategy: learningStrategy,
      careerMapping: reportSections.sec3,
      counselorGuideline: reportSections.sec4,
    },
    streamRecommendation: {
      stream: recommendedStream,
      subjects: streamSubjects,
      careerFitScore: careerFitScore,
      actions: streamActions.length > 0 ? streamActions : undefined
    },
    counselorRoadmap: {
      counselorFocus: "Establish emotional safety and reduce academic pressure",
      permutationAction: reportSections.sec4?.substring(0, 300),
      priorities: priorities.slice(0, 5),
    },
    dominantVectors: {
      dominantRIASEC,
      dominantBig5,
      bigFiveBalance,
      dominantLearning,
      learningPreferenceStrength,
    },
    circularGauges: {
      careerReadiness,
      riasecClarity,
      cognitiveIndex,
      emotionalSustainability,
    },
    profileCode: reportState.sessionId?.substring(0, 8) || "NP-0000",
  } : null;

  const tests = [...row.original.tests].sort(
    (a, b) => Number(a.isCompleted) - Number(b.isCompleted)
  );

  return (
    <>
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
                      <TestRowActions test={test} onGenerateReport={handleGenerateReport} />
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </div>
      </div>

      <Transition show={reportState.isOpen}>
        <Dialog onClose={closeReport} className="relative z-100">
          <TransitionChild
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="fixed inset-0 bg-gray-900/50 dark:bg-black/40"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild
              as={DialogPanel}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
              className="scrollbar-sm max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-dark-700"
            >
              <div className="mb-4 flex items-center justify-between">
                <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                  AI Report - {reportState.testName}
                </DialogTitle>
                <button
                  onClick={closeReport}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600 dark:hover:text-dark-200"
                >
                  <XMarkIcon className="size-5" />
                </button>
              </div>
              {reportState.loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
                </div>
              )}
              {reportState.error && (
                <p className="py-8 text-center text-red-500">{reportState.error}</p>
              )}
              {reportState.text && (
                <>
                  <div className="mb-4 flex justify-end">
                    <Button onClick={handlePrint} variant="outlined" className="inline-flex items-center gap-2 text-xs-plus">
                      <ArrowDownTrayIcon className="size-4.5" />
                      <span>Download PDF</span>
                    </Button>
                  </div>
                  <div ref={printRef} className="new-exam-wrapper counselor-report-only" style={{ minHeight: "auto", background: "transparent", backgroundImage: "none" }}>
                    <style>{`
                      .counselor-report-only .results-header,
                      .counselor-report-only .results-tabs {
                        display: none !important;
                      }
                      .counselor-report-only .report-container {
                        border: none !important;
                        box-shadow: none !important;
                        background: transparent !important;
                        padding: 0 !important;
                      }
                    `}</style>
                    <div>
                      <ResultsScreen
                        profile={{
                          name: row.original.name,
                          grade: grade,
                          testMode: "compact",
                          apiKey: "",
                        }}
                        activeTab="report"
                        setActiveTab={() => {}}
                        handleRestart={() => closeReport()}
                        handleExportJSON={() => {}}
                        metricFilter="all"
                        setMetricFilter={() => {}}
                        filteredMetrics={[]}
                        setSelectedMetric={() => {}}
                        getStrokeDashOffset={() => 0}
                        resultsData={reportData}
                        generatingAiReport={false}
                        handleGenerateAiReport={() => {}}
                      />
                    </div>
                  </div>
                </>
              )}
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

SubRowComponent.propTypes = {
  row: PropTypes.object,
  cardWidth: PropTypes.number,
  table: PropTypes.object,
};
