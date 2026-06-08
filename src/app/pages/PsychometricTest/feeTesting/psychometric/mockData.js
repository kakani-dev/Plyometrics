import rawQuestions from "../psychometrictest.json";

function toKebab(str) {
  return str.toLowerCase().replace(/[&\s]+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const validQuestions = rawQuestions.filter((q) => q.QID && q.QID.trim() !== "");

export const LIKERT_OPTIONS = [
  { id: "sd", text: "Strongly Disagree", score: 1 },
  { id: "d", text: "Disagree", score: 2 },
  { id: "n", text: "Neutral", score: 3 },
  { id: "a", text: "Agree", score: 4 },
  { id: "sa", text: "Strongly Agree", score: 5 },
];

export const QUESTIONS = validQuestions.map((q) => {
  const type = q["Question Type"]?.toLowerCase() === "mcq" ? "mcq" : "likert";
  const question = {
    id: q.QID,
    section: toKebab(q.Domain),
    type,
    text: q.Question,
  };
  if (type === "mcq") {
    question.options = ["A", "B", "C", "D"]
      .map((letter) => {
        const text = q[`Option ${letter}`];
        return text && text.trim() ? { id: letter.toLowerCase(), text: text.trim() } : null;
      })
      .filter(Boolean);
  }
  return question;
});

const sectionMap = {};
for (const q of validQuestions) {
  const id = toKebab(q.Domain);
  if (!sectionMap[id]) {
    sectionMap[id] = { id, label: q.Domain, questionCount: 0 };
  }
  sectionMap[id].questionCount++;
}

export const SECTIONS = Object.values(sectionMap);

export const EXAM_CONFIG = {
  title: "Psychometric Assessment",
  totalDurationMinutes: 45,
  totalQuestions: QUESTIONS.length,
  examMode: "Online",
  candidateName: "Demo Candidate",
};

export const INSTRUCTIONS = {
  general: [
    `This assessment contains ${QUESTIONS.length} questions across ${SECTIONS.length} domains.`,
    "Answer honestly — there are no right or wrong answers for Likert-scale questions.",
    "Read each statement carefully before responding.",
    "Complete all sections for an accurate profile.",
    "Your responses are confidential and used for development purposes only.",
  ],
  sectionWise: SECTIONS.map(
    (s) => `${s.label}: ${s.questionCount} question(s)`,
  ),
  timerRules: [
    `Total duration of the test is ${EXAM_CONFIG.totalDurationMinutes} minutes.`,
    "The timer will count down and auto-submit when time expires.",
    "Do not refresh the page during the test.",
  ],
  scoring: [
    "There are no right or wrong answers for Likert-scale questions.",
    "Situational judgment questions are scored based on behavioral alignment.",
    "Results are aggregated to provide a personality profile.",
  ],
  navigationRules: [
    "Use the 'Next' button to move to the next question.",
    "Use the 'Previous' button to revisit any question.",
    "Mark questions for review to revisit them later.",
    "You can change your answers any number of times before submission.",
  ],
};

export const getQuestionsBySection = (sectionId) =>
  QUESTIONS.filter((q) => q.section === sectionId);

export const getAllQuestionIds = () => QUESTIONS.map((q) => q.id);

export const getSectionForQuestion = (questionId) => {
  const q = QUESTIONS.find((q) => q.id === questionId);
  return q ? q.section : null;
};

export const getQuestionIndexInSection = (questionId) => {
  const q = QUESTIONS.find((q) => q.id === questionId);
  if (!q) return -1;
  const sectionQuestions = getQuestionsBySection(q.section);
  return sectionQuestions.findIndex((sq) => sq.id === questionId);
};
