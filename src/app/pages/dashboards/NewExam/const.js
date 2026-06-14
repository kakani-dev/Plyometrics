export const INITIAL_CONSOLE_LOGS = [
  "[SYS] NeuroPi Adaptive Assessment engine initialized.",
  "[SYS] Grade model loaded. Waiting for registration..."
];

export const SUBDOMAINS_LIST = [
  "Realistic", "Investigative", "Openness", "Conscientiousness", "Abstract Reasoning",
  "Logical Deduction", "Stress Tolerance", "Resilience", "Visual Preference", "Kinesthetic Preference",
  "Artistic", "Social", "Enterprising", "Conventional", "Validity", "Extraversion",
  "Agreeableness", "Neuroticism", "Numerical", "Logic", "Verbal", "Abstract", "Spatial",
  "Stress", "Confidence", "Coping", "Visual", "Auditory", "Kinesthetic", "ReadingWriting",
  "Motivation", "StudyHabits", "CareerClarity"
];

export const DIFFICULTY_LEVELS = {
  "Easy": 0,
  "Medium": 0,
  "Hard": 0
};

export const MOCK_GAUGES = {
  careerReadiness: 88,
  riasecClarity: 75,
  cognitiveIndex: 95,
  emotionalSustainability: 68
};

export const MOCK_VECTORS = {
  dominantRIASEC: "Realistic",
  dominantBig5: "Conscientiousness",
  dominantLearning: "Visual",
  bigFiveBalance: 82,
  learningPreferenceStrength: 90
};

export const MOCK_ALERT = {
  alertType: "Strong technical alignment",
  description: "Validity check passed. Student registers exceptional logical reasoning capacity.",
  alertClass: "alert-success"
};

export const MOCK_ROADMAP = {
  counselorFocus: "Strengths confirmation and growth plan",
  permutationAction: "Recommend pursuing Science (PCM) with Computer Science. Focus counseling on emotional coping strategies.",
  priorities: ["Academic Skills", "Stress Management", "Career Exploration"]
};

export const MOCK_STREAM = {
  stream: "Science (PCM)",
  subjects: "Physics, Chemistry, Mathematics",
  actions: [
    "Strengthen mathematical foundations and practice structured numerical derivations daily.",
    "Participate in practical projects like coding, electronics, or robotics to apply physics.",
    "Solve complex multi-step logical problems to prepare for engineering/technology streams."
  ],
  careerFitScore: 86
};

export const MOCK_NARRATIVE = {
  executiveSummary: "The candidate completed the student profiling battery. Analysis shows high analytical reasoning index with well-developed visual processing.",
  cognitiveStrengths: "Demonstrates perfect logical deductive capabilities and robust visual cognitive efficiency.",
  learningStrategy: "High visual preference suggests utilizing diagrams, video explanations, and concept mapping.",
  careerMapping: "Academic performance index matches streams with rigorous technical foundations.",
  counselorGuideline: "Ensure balanced study routine. Promote stress management techniques."
};
