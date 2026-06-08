export const SECTIONS = [
  { id: "quant", label: "Quantitative Aptitude", questionCount: 10 },
  { id: "logical", label: "Logical Reasoning", questionCount: 10 },
  { id: "verbal", label: "Verbal Ability", questionCount: 10 },
  { id: "coding-mcq", label: "Coding MCQ", questionCount: 5 },
  { id: "programming", label: "Programming", questionCount: 3 },
];

export const EXAM_CONFIG = {
  title: "Mock Assessment",
  totalDurationMinutes: 120,
  totalQuestions: 38,
  examMode: "Online",
  candidateName: "Demo Candidate",
};

export const QUESTIONS = [
  // ── Quantitative Aptitude ──
  {
    id: "q1", section: "quant", type: "mcq",
    text: "If the sum of three consecutive odd numbers is 87, what is the middle number?",
    options: [
      { id: "a", text: "27" },
      { id: "b", text: "29" },
      { id: "c", text: "31" },
      { id: "d", text: "33" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q2", section: "quant", type: "mcq",
    text: "A train 150 m long passes a pole in 15 seconds. What is the speed of the train in km/h?",
    options: [
      { id: "a", text: "36 km/h" },
      { id: "b", text: "40 km/h" },
      { id: "c", text: "45 km/h" },
      { id: "d", text: "54 km/h" },
    ],
    correctAnswer: "a",
  },
  {
    id: "q3", section: "quant", type: "mcq",
    text: "What is the compound interest on ₹10,000 at 10% per annum for 2 years?",
    options: [
      { id: "a", text: "₹2,000" },
      { id: "b", text: "₹2,100" },
      { id: "c", text: "₹2,200" },
      { id: "d", text: "₹2,400" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q4", section: "quant", type: "mcq",
    text: "If 15 workers can build a wall in 20 days, how many workers are needed to build the same wall in 12 days?",
    options: [
      { id: "a", text: "20" },
      { id: "b", text: "25" },
      { id: "c", text: "30" },
      { id: "d", text: "18" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q5", section: "quant", type: "mcq",
    text: "A shopkeeper gives a 20% discount on an item and still makes a 10% profit. If the cost price is ₹500, what is the marked price?",
    options: [
      { id: "a", text: "₹650" },
      { id: "b", text: "₹687.50" },
      { id: "c", text: "₹700" },
      { id: "d", text: "₹750" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q6", section: "quant", type: "mcq",
    text: "What is the value of (0.6 × 0.6 + 0.5 × 0.5) / (0.6 × 0.5)?",
    options: [
      { id: "a", text: "2.01" },
      { id: "b", text: "2.02" },
      { id: "c", text: "2.03" },
      { id: "d", text: "2.04" },
    ],
    correctAnswer: "a",
  },
  {
    id: "q7", section: "quant", type: "mcq",
    text: "If log₂(8) = x, what is the value of x?",
    options: [
      { id: "a", text: "2" },
      { id: "b", text: "3" },
      { id: "c", text: "4" },
      { id: "d", text: "8" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q8", section: "quant", type: "mcq",
    text: "A bag contains 4 red, 5 blue and 3 green balls. What is the probability of drawing a blue ball?",
    options: [
      { id: "a", text: "1/3" },
      { id: "b", text: "5/12" },
      { id: "c", text: "1/4" },
      { id: "d", text: "5/13" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q9", section: "quant", type: "mcq",
    text: "The ratio of ages of A and B is 3:5. After 6 years, the ratio becomes 5:7. What is the present age of A?",
    options: [
      { id: "a", text: "9 years" },
      { id: "b", text: "12 years" },
      { id: "c", text: "15 years" },
      { id: "d", text: "18 years" },
    ],
    correctAnswer: "a",
  },
  {
    id: "q10", section: "quant", type: "mcq",
    text: "If x² + 1/x² = 34, what is the value of x + 1/x?",
    options: [
      { id: "a", text: "4" },
      { id: "b", text: "5" },
      { id: "c", text: "6" },
      { id: "d", text: "7" },
    ],
    correctAnswer: "c",
  },

  // ── Logical Reasoning ──
  {
    id: "q11", section: "logical", type: "mcq",
    text: "Find the missing number: 2, 6, 12, 20, 30, ?",
    options: [
      { id: "a", text: "40" },
      { id: "b", text: "42" },
      { id: "c", text: "44" },
      { id: "d", text: "46" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q12", section: "logical", type: "mcq",
    text: "If 'BOOK' is coded as 'CPPL', how is 'PEN' coded?",
    options: [
      { id: "a", text: "QFO" },
      { id: "b", text: "QFP" },
      { id: "c", text: "QEP" },
      { id: "d", text: "QFO" },
    ],
    correctAnswer: "a",
  },
  {
    id: "q13", section: "logical", type: "mcq",
    text: "In a row of students, Ravi is 7th from left and 9th from right. How many students are there?",
    options: [
      { id: "a", text: "14" },
      { id: "b", text: "15" },
      { id: "c", text: "16" },
      { id: "d", text: "17" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q14", section: "logical", type: "mcq",
    text: "All cats are dogs. Some dogs are birds. Which conclusion is definitely true?",
    options: [
      { id: "a", text: "Some cats are birds" },
      { id: "b", text: "No cat is bird" },
      { id: "c", text: "Some dogs are cats" },
      { id: "d", text: "All birds are dogs" },
    ],
    correctAnswer: "c",
  },
  {
    id: "q15", section: "logical", type: "mcq",
    text: "If 'APPLE' is written as 'ELPPA', how is 'MANGO' written?",
    options: [
      { id: "a", text: "OGNAM" },
      { id: "b", text: "OGRAM" },
      { id: "c", text: "OGNMA" },
      { id: "d", text: "ONGAM" },
    ],
    correctAnswer: "a",
  },
  {
    id: "q16", section: "logical", type: "mcq",
    text: "Find the odd one out: 3, 7, 15, 27, 63, 127",
    options: [
      { id: "a", text: "7" },
      { id: "b", text: "15" },
      { id: "c", text: "27" },
      { id: "d", text: "63" },
    ],
    correctAnswer: "c",
  },
  {
    id: "q17", section: "logical", type: "mcq",
    text: "A man walks 5 km east, turns right and walks 3 km, turns right and walks 5 km. How far is he from the starting point?",
    options: [
      { id: "a", text: "0 km" },
      { id: "b", text: "3 km" },
      { id: "c", text: "5 km" },
      { id: "d", text: "8 km" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q18", section: "logical", type: "mcq",
    text: "If today is Monday, what day will it be after 72 days?",
    options: [
      { id: "a", text: "Monday" },
      { id: "b", text: "Tuesday" },
      { id: "c", text: "Wednesday" },
      { id: "d", text: "Thursday" },
    ],
    correctAnswer: "c",
  },
  {
    id: "q19", section: "logical", type: "mcq",
    text: "Statement: All flowers are trees. Some trees are fruits. Conclusion: I. Some fruits are flowers. II. No fruit is a flower.",
    options: [
      { id: "a", text: "Only I follows" },
      { id: "b", text: "Only II follows" },
      { id: "c", text: "Neither I nor II follows" },
      { id: "d", text: "Both I and II follow" },
    ],
    correctAnswer: "c",
  },
  {
    id: "q20", section: "logical", type: "mcq",
    text: "What comes next: AZ, BY, CX, DW, ?",
    options: [
      { id: "a", text: "EV" },
      { id: "b", text: "EU" },
      { id: "c", text: "FV" },
      { id: "d", text: "FU" },
    ],
    correctAnswer: "a",
  },

  // ── Verbal Ability ──
  {
    id: "q21", section: "verbal", type: "mcq",
    text: "Choose the synonym of 'Benevolent':",
    options: [
      { id: "a", text: "Malevolent" },
      { id: "b", text: "Kind" },
      { id: "c", text: "Cruel" },
      { id: "d", text: "Selfish" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q22", section: "verbal", type: "mcq",
    text: "Choose the antonym of 'Ephemeral':",
    options: [
      { id: "a", text: "Temporary" },
      { id: "b", text: "Eternal" },
      { id: "c", text: "Brief" },
      { id: "d", text: "Short-lived" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q23", section: "verbal", type: "mcq",
    text: "Identify the correctly spelled word:",
    options: [
      { id: "a", text: "Accomodate" },
      { id: "b", text: "Accommodate" },
      { id: "c", text: "Acomodate" },
      { id: "d", text: "Acommodate" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q24", section: "verbal", type: "mcq",
    text: "Select the most appropriate word to fill: 'The _____ of the new policy was met with widespread approval.'",
    options: [
      { id: "a", text: "implementation" },
      { id: "b", text: "implement" },
      { id: "c", text: "implemented" },
      { id: "d", text: "implementing" },
    ],
    correctAnswer: "a",
  },
  {
    id: "q25", section: "verbal", type: "mcq",
    text: "Choose the correct preposition: 'He is proficient _____ Java programming.'",
    options: [
      { id: "a", text: "at" },
      { id: "b", text: "in" },
      { id: "c", text: "on" },
      { id: "d", text: "with" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q26", section: "verbal", type: "mcq",
    text: "What is the meaning of the idiom 'To burn the midnight oil'?",
    options: [
      { id: "a", text: "To waste energy" },
      { id: "b", text: "To study/work late at night" },
      { id: "c", text: "To get angry" },
      { id: "d", text: "To start a fire" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q27", section: "verbal", type: "mcq",
    text: "Identify the sentence with correct grammar:",
    options: [
      { id: "a", text: "Neither the teacher nor the students was present." },
      { id: "b", text: "Neither the teacher nor the students were present." },
      { id: "c", text: "Neither the teacher nor the students is present." },
      { id: "d", text: "Neither the teacher nor the students are present." },
    ],
    correctAnswer: "b",
  },
  {
    id: "q28", section: "verbal", type: "mcq",
    text: "Choose the correct active voice: 'The report was submitted by the manager.'",
    options: [
      { id: "a", text: "The manager submitted the report." },
      { id: "b", text: "The manager submit the report." },
      { id: "c", text: "The manager submits the report." },
      { id: "d", text: "The report submitted the manager." },
    ],
    correctAnswer: "a",
  },
  {
    id: "q29", section: "verbal", type: "mcq",
    text: "Select the correct order: P: The cat Q: on the mat R: sat",
    options: [
      { id: "a", text: "PQR" },
      { id: "b", text: "PRQ" },
      { id: "c", text: "RPQ" },
      { id: "d", text: "QPR" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q30", section: "verbal", type: "mcq",
    text: "Choose the word that best completes: 'Her _____ nature made her popular among colleagues.'",
    options: [
      { id: "a", text: "affable" },
      { id: "b", text: "aloof" },
      { id: "c", text: "arrogant" },
      { id: "d", text: "aggressive" },
    ],
    correctAnswer: "a",
  },

  // ── Coding MCQ ──
  {
    id: "q31", section: "coding-mcq", type: "mcq",
    text: "What is the output of: printf('%d', 5 + 3 * 2); in C?",
    options: [
      { id: "a", text: "16" },
      { id: "b", text: "11" },
      { id: "c", text: "13" },
      { id: "d", text: "10" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q32", section: "coding-mcq", type: "mcq",
    text: "Which data structure uses LIFO principle?",
    options: [
      { id: "a", text: "Queue" },
      { id: "b", text: "Stack" },
      { id: "c", text: "Array" },
      { id: "d", text: "Linked List" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q33", section: "coding-mcq", type: "mcq",
    text: "What is the time complexity of binary search?",
    options: [
      { id: "a", text: "O(n)" },
      { id: "b", text: "O(log n)" },
      { id: "c", text: "O(n²)" },
      { id: "d", text: "O(1)" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q34", section: "coding-mcq", type: "mcq",
    text: "Which keyword is used to prevent a class from being inherited in Java?",
    options: [
      { id: "a", text: "static" },
      { id: "b", text: "final" },
      { id: "c", text: "abstract" },
      { id: "d", text: "private" },
    ],
    correctAnswer: "b",
  },
  {
    id: "q35", section: "coding-mcq", type: "mcq",
    text: "What does the '===' operator do in JavaScript?",
    options: [
      { id: "a", text: "Assigns value" },
      { id: "b", text: "Compares value and type" },
      { id: "c", text: "Compares only value" },
      { id: "d", text: "Compares only type" },
    ],
    correctAnswer: "b",
  },

  // ── Programming ──
  {
    id: "q36", section: "programming", type: "coding",
    text: "Write a function to check if a string is a palindrome. A palindrome reads the same forwards and backwards.",
    defaultCode: "function isPalindrome(str) {\n  // Your code here\n}",
    testCases: [
      { input: "racecar", expected: "true" },
      { input: "hello", expected: "false" },
    ],
  },
  {
    id: "q37", section: "programming", type: "coding",
    text: "Write a function to find the factorial of a number n using recursion.",
    defaultCode: "function factorial(n) {\n  // Your code here\n}",
    testCases: [
      { input: "5", expected: "120" },
      { input: "0", expected: "1" },
    ],
  },
  {
    id: "q38", section: "programming", type: "coding",
    text: "Write a function to reverse a linked list. Assume the linked list node has 'value' and 'next' properties.",
    defaultCode: "function reverseLinkedList(head) {\n  // Your code here\n}",
    testCases: [
      { input: "1->2->3->null", expected: "3->2->1->null" },
    ],
  },
];

export const INSTRUCTIONS = {
  general: [
    "This is a mock assessment for practice purposes only.",
    "Read each question carefully before answering.",
    "Do not use any prohibited materials or devices.",
    "Manage your time wisely across all sections.",
    "Your responses will be tracked for analysis.",
  ],
  sectionWise: [
    "Quantitative Aptitude: 10 questions, 20 minutes recommended",
    "Logical Reasoning: 10 questions, 20 minutes recommended",
    "Verbal Ability: 10 questions, 15 minutes recommended",
    "Coding MCQ: 5 questions, 10 minutes recommended",
    "Programming: 3 questions, 25 minutes recommended",
  ],
  timerRules: [
    "Total duration of the test is 120 minutes.",
    "The timer will count down and auto-submit when time expires.",
    "Do not refresh the page during the test.",
  ],
  markingRules: [
    "Each correct answer carries +1 mark.",
    "No negative marking for incorrect answers.",
    "No marks deducted for unanswered questions.",
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
