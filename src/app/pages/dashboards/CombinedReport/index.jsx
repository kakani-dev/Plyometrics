import { useState, useEffect } from "react";
import clsx from "clsx";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Button } from "components/ui";
import { getExamsByUser, getUserPyList } from "services/examApi";
import { getStoredExams } from "app/pages/dashboards/examStorage";
import UserExamReport from "app/pages/dashboards/UserExamReport";
import UserResponse from "app/pages/dashboards/UserResponse";
import MarksReport from "app/pages/dashboards/MarksReport";

const VIEWS = [
  { id: "exam-report", label: "User Exam Report" },
  { id: "user-response", label: "User Response" },
  { id: "marks-report", label: "Marks Report" },
];

const viewComponents = {
  "exam-report": UserExamReport,
  "user-response": UserResponse,
  "marks-report": MarksReport,
};

export default function CombinedReport() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [userList, setUserList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await getUserPyList();
        const list = res?.data || [];
        setUserList(list);
        if (list.length > 0) setSelectedUserId(list[0].id);
      } catch {
        const local = getStoredExams();
        const fallback = local.map(e => ({ id: e.id, fullname: e.fullName, email: e.email }));
        setUserList(fallback);
        if (fallback.length > 0) setSelectedUserId(fallback[0].id);
      }
    }
    loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    async function loadExams() {
      try {
        const res = await getExamsByUser(selectedUserId);
        const list = res?.data || [];
        setSelectedExamId(list.length > 0 ? list[0].id : "");
      } catch {
        setSelectedExamId(selectedUserId);
      }
    }
    loadExams();
  }, [selectedUserId]);

  return (
    <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-dark-600 dark:bg-dark-900/80">
        <div className="flex items-center justify-between gap-3 px-(--margin-x) py-2">
          <TabList className="hide-scrollbar flex overflow-x-auto">
            {VIEWS.map((view) => (
              <Tab
                key={view.id}
                className={({ selected }) =>
                  clsx(
                    "shrink-0 whitespace-nowrap border-b-2 px-3 py-2 font-medium",
                    selected
                      ? "border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-400"
                      : "border-transparent hover:text-gray-800 focus:text-gray-800 dark:hover:text-dark-100 dark:focus:text-dark-100",
                  )
                }
                as={Button}
                unstyled
              >
                {view.label}
              </Tab>
            ))}
          </TabList>
          <div className="flex gap-3 ml-auto">
            {userList.length > 0 && (
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-dark-500 dark:bg-dark-800 dark:text-dark-200">
                {userList.map(u => (
                  <option key={u.id} value={u.id}>{u.fullname} ({u.email})</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
      <TabPanels className="mt-2 px-(--margin-x)">
        {VIEWS.map((view, index) => {
          const Component = viewComponents[view.id];
          return (
            <TabPanel key={view.id} static className={selectedIndex !== index ? "hidden" : undefined}>
              <Component selectedUserId={selectedUserId} selectedExamId={selectedExamId} />
            </TabPanel>
          );
        })}
      </TabPanels>
    </TabGroup>
  );
}
