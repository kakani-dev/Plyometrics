import { useState } from "react";
import PropTypes from "prop-types";
import {
  ClockIcon,
  DocumentTextIcon,
  RectangleStackIcon,
  ComputerDesktopIcon,
  ClipboardDocumentListIcon,
  RectangleGroupIcon,
  HeartIcon,
  MapIcon,
  UserIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { Avatar, Card } from "components/ui";
import { EXAM_CONFIG, INSTRUCTIONS, SECTIONS, QUESTIONS } from "./mockData";

export function InstructionsPage({ onStart }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="w-full">
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5 lg:gap-6">
        <DetailCard label="Total Duration" value={`${EXAM_CONFIG.totalDurationMinutes} min`} icon={<ClockIcon className="size-6" />} color="info" />
        <DetailCard label="Sections" value={`${SECTIONS.length}`} icon={<RectangleStackIcon className="size-6" />} color="warning" />
        <DetailCard label="Total Questions" value={`${EXAM_CONFIG.totalQuestions}`} icon={<DocumentTextIcon className="size-6" />} color="success" />
        <DetailCard label="Exam Mode" value={EXAM_CONFIG.examMode} icon={<ComputerDesktopIcon className="size-6" />} color="secondary" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InstructionCard title="General Instructions" items={INSTRUCTIONS.general} icon={<ClipboardDocumentListIcon className="size-5 text-primary-500" />} />
        <InstructionCard title="Section-wise Instructions" items={INSTRUCTIONS.sectionWise} icon={<RectangleGroupIcon className="size-5 text-primary-500" />} />
        <InstructionCard title="Timer Rules" items={INSTRUCTIONS.timerRules} icon={<ClockIcon className="size-5 text-primary-500" />} />
        <InstructionCard title="Scoring" items={INSTRUCTIONS.scoring} icon={<HeartIcon className="size-5 text-primary-500" />} />
        <InstructionCard title="Navigation Rules" items={INSTRUCTIONS.navigationRules} icon={<MapIcon className="size-5 text-primary-500" />} />
      </div>

      <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 dark:border-dark-600">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-dark-700">
            <tr>
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-dark-300">Section</th>
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-dark-300">Questions</th>
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-dark-300">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
            {SECTIONS.map((s) => {
              const sectionQs = QUESTIONS.filter((q) => q.section === s.id);
              const types = [...new Set(sectionQs.map((q) => q.type))].join(", ");
              return (
                <tr key={s.id}>
                  <td className="px-4 py-2 text-gray-900 dark:text-dark-50">{s.label}</td>
                  <td className="px-4 py-2 text-gray-700 dark:text-dark-200">{s.questionCount}</td>
                  <td className="px-4 py-2 capitalize text-gray-700 dark:text-dark-200">{types}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <CandidateForm
        fullName={fullName}
        email={email}
        onFullNameChange={setFullName}
        onEmailChange={setEmail}
      />

      <InstructionsCheckbox
        onStart={() => onStart({ fullName, email })}
        disabled={!fullName.trim() || !email.trim()}
      />
    </div>
  );
}

function DetailCard({ label, value, icon, color }) {
  return (
    <Card className="flex justify-between p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-dark-400">
          {label}
        </p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-dark-50">
          {value}
        </p>
      </div>
      <Avatar
        size={12}
        classNames={{ display: "mask is-squircle rounded-none" }}
        initialVariant="soft"
        initialColor={color}
      >
        {icon}
      </Avatar>
    </Card>
  );
}

DetailCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
};

function InstructionCard({ title, items, icon }) {
  return (
    <Card className="p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-dark-50">
        {icon}
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-dark-300">
            <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-primary-400" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

InstructionCard.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  icon: PropTypes.node.isRequired,
};

function CandidateForm({ fullName, email, onFullNameChange, onEmailChange }) {
  return (
    <Card className="mb-6 p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-dark-50">
        <UserIcon className="size-5 text-primary-500" />
        Candidate Information
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-dark-300">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-dark-500 dark:bg-dark-800 dark:text-dark-50 dark:placeholder-dark-400"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-dark-300">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-dark-500 dark:bg-dark-800 dark:text-dark-50 dark:placeholder-dark-400"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

CandidateForm.propTypes = {
  fullName: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  onFullNameChange: PropTypes.func.isRequired,
  onEmailChange: PropTypes.func.isRequired,
};

function InstructionsCheckbox({ onStart, disabled }) {
  const [checked, setChecked] = useState(false);

  const canStart = checked && !disabled;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-dark-600 dark:bg-dark-800">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-700 dark:text-dark-200">
          I understand that this is a psychometric assessment and I will answer honestly.
        </span>
      </label>
      <button
        type="button"
        disabled={!canStart}
        onClick={onStart}
        className="mt-4 w-full rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Start Assessment
      </button>
    </div>
  );
}

InstructionsCheckbox.propTypes = {
  onStart: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
