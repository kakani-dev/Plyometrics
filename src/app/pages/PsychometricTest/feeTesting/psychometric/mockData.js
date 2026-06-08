export const EXAM_CONFIG = {
  title: "Psychometric Assessment",
  totalDurationMinutes: 45,
  totalQuestions: 30,
  examMode: "Online",
  candidateName: "Demo Candidate",
};

export const SECTIONS = [
  { id: "personality", label: "Personality", questionCount: 15 },
  { id: "situational", label: "Situational Judgment", questionCount: 10 },
  { id: "work-style", label: "Work Style", questionCount: 5 },
];

export const LIKERT_OPTIONS = [
  { id: "sd", text: "Strongly Disagree", score: 1 },
  { id: "d", text: "Disagree", score: 2 },
  { id: "n", text: "Neutral", score: 3 },
  { id: "a", text: "Agree", score: 4 },
  { id: "sa", text: "Strongly Agree", score: 5 },
];

export const QUESTIONS = [
  // ── Personality ──
  {
    id: "p1", section: "personality", type: "likert",
    text: "I enjoy working in a team rather than working alone.",
  },
  {
    id: "p2", section: "personality", type: "likert",
    text: "I stay calm under pressure and make rational decisions.",
  },
  {
    id: "p3", section: "personality", type: "likert",
    text: "I prefer structured tasks with clear instructions.",
  },
  {
    id: "p4", section: "personality", type: "likert",
    text: "I often take the initiative to solve problems.",
  },
  {
    id: "p5", section: "personality", type: "likert",
    text: "I adapt quickly to new situations and changes.",
  },
  {
    id: "p6", section: "personality", type: "likert",
    text: "I pay close attention to detail in my work.",
  },
  {
    id: "p7", section: "personality", type: "likert",
    text: "I am comfortable presenting ideas to a group.",
  },
  {
    id: "p8", section: "personality", type: "likert",
    text: "I set high standards for myself and others.",
  },
  {
    id: "p9", section: "personality", type: "likert",
    text: "I handle criticism constructively without getting defensive.",
  },
  {
    id: "p10", section: "personality", type: "likert",
    text: "I enjoy learning new skills and acquiring knowledge.",
  },
  {
    id: "p11", section: "personality", type: "likert",
    text: "I am organized and manage my time effectively.",
  },
  {
    id: "p12", section: "personality", type: "likert",
    text: "I can influence others to achieve common goals.",
  },
  {
    id: "p13", section: "personality", type: "likert",
    text: "I find it easy to empathize with other people's perspectives.",
  },
  {
    id: "p14", section: "personality", type: "likert",
    text: "I am confident in my ability to make decisions.",
  },
  {
    id: "p15", section: "personality", type: "likert",
    text: "I prefer variety over routine in my daily work.",
  },

  // ── Situational Judgment ──
  {
    id: "s1", section: "situational", type: "mcq",
    text: "Your teammate misses a deadline, affecting the project timeline. What do you do?",
    options: [
      { id: "a", text: "Report them to the manager immediately" },
      { id: "b", text: "Discuss with them privately and offer help" },
      { id: "c", text: "Redistribute the work without involving them" },
      { id: "d", text: "Ignore it and adjust your own work" },
    ],
  },
  {
    id: "s2", section: "situational", type: "mcq",
    text: "You disagree with a decision made by your supervisor. How do you respond?",
    options: [
      { id: "a", text: "Accept it quietly and follow instructions" },
      { id: "b", text: "Respectfully share your concerns with evidence" },
      { id: "c", text: "Go above them to escalate the issue" },
      { id: "d", text: "Voice disagreement publicly during the meeting" },
    ],
  },
  {
    id: "s3", section: "situational", type: "mcq",
    text: "A colleague is struggling with a task you are good at. They haven't asked for help. What do you do?",
    options: [
      { id: "a", text: "Wait for them to ask for help" },
      { id: "b", text: "Offer assistance politely without undermining them" },
      { id: "c", text: "Inform the manager about the situation" },
      { id: "d", text: "Focus only on your own responsibilities" },
    ],
  },
  {
    id: "s4", section: "situational", type: "mcq",
    text: "You receive conflicting instructions from two senior managers. What is your best course of action?",
    options: [
      { id: "a", text: "Follow the instruction from the higher-ranking manager" },
      { id: "b", text: "Clarify with both managers to reach a consensus" },
      { id: "c", text: "Use your own judgment and proceed" },
      { id: "d", text: "Do nothing until the conflict is resolved" },
    ],
  },
  {
    id: "s5", section: "situational", type: "mcq",
    text: "You notice a minor error in a report that has already been submitted to the client. What do you do?",
    options: [
      { id: "a", text: "Wait to see if the client notices" },
      { id: "b", text: "Inform your supervisor and correct it immediately" },
      { id: "c", text: "Fix it silently without informing anyone" },
      { id: "d", text: "Ignore it since it is minor" },
    ],
  },
  {
    id: "s6", section: "situational", type: "mcq",
    text: "Your team is divided on which approach to take for a project. How do you proceed?",
    options: [
      { id: "a", text: "Make the decision yourself to save time" },
      { id: "b", text: "Facilitate a discussion to find common ground" },
      { id: "c", text: "Vote and go with the majority" },
      { id: "d", text: "Ask the manager to decide" },
    ],
  },
  {
    id: "s7", section: "situational", type: "mcq",
    text: "You have too many tasks and not enough time. What is your approach?",
    options: [
      { id: "a", text: "Work overtime to complete everything" },
      { id: "b", text: "Prioritize tasks and communicate with stakeholders" },
      { id: "c", text: "Do each task partially to show progress" },
      { id: "d", text: "Delegate tasks without asking" },
    ],
  },
  {
    id: "s8", section: "situational", type: "mcq",
    text: "A new team member joins and seems overwhelmed. How do you help them integrate?",
    options: [
      { id: "a", text: "Assign a senior buddy to guide them" },
      { id: "b", text: "Let them figure things out on their own" },
      { id: "c", text: "Give them all the documentation and leave them" },
      { id: "d", text: "Pair with them on initial tasks" },
    ],
  },
  {
    id: "s9", section: "situational", type: "mcq",
    text: "You discover that a process can be improved to save time. What do you do?",
    options: [
      { id: "a", text: "Implement the change and inform the team" },
      { id: "b", text: "Share your idea with the team and seek feedback" },
      { id: "c", text: "Keep it to yourself since it works well enough" },
      { id: "d", text: "Wait for someone else to suggest it" },
    ],
  },
  {
    id: "s10", section: "situational", type: "mcq",
    text: "You make a mistake that affects your team's progress. How do you handle it?",
    options: [
      { id: "a", text: "Hide it and try to fix it quietly" },
      { id: "b", text: "Acknowledge it, apologize, and propose a solution" },
      { id: "c", text: "Blame external factors beyond your control" },
      { id: "d", text: "Minimize its importance to the team" },
    ],
  },

  // ── Work Style ──
  {
    id: "w1", section: "work-style", type: "likert",
    text: "I prefer working with clear goals and measurable outcomes.",
  },
  {
    id: "w2", section: "work-style", type: "likert",
    text: "I enjoy collaborating with people from different backgrounds.",
  },
  {
    id: "w3", section: "work-style", type: "likert",
    text: "I am comfortable taking calculated risks to achieve results.",
  },
  {
    id: "w4", section: "work-style", type: "likert",
    text: "I believe continuous feedback is essential for growth.",
  },
  {
    id: "w5", section: "work-style", type: "likert",
    text: "I thrive in an environment that encourages innovation.",
  },
];

export const INSTRUCTIONS = {
  general: [
    "This assessment measures personality traits, situational judgment, and work preferences.",
    "Answer honestly — there are no right or wrong answers for personality questions.",
    "Read each statement carefully before responding.",
    "Complete all sections for an accurate profile.",
    "Your responses are confidential and used for development purposes only.",
  ],
  sectionWise: [
    "Personality: 15 Likert-scale questions, 15 minutes recommended",
    "Situational Judgment: 10 scenario-based MCQs, 15 minutes recommended",
    "Work Style: 5 Likert-scale questions, 5 minutes recommended",
  ],
  timerRules: [
    "Total duration of the test is 45 minutes.",
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
    "Use the question palette to jump to any question.",
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
