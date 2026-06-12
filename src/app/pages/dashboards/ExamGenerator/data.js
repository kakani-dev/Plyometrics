export const DUMMY_QUESTIONS = [
  {
    id: "Q1",
    domain: "RIASEC Interest",
    subdomain: "Realistic",
    text: "I like working with hands-on machinery, tools, or outdoor activities.",
    type: "likert"
  },
  {
    id: "Q2",
    domain: "RIASEC Interest",
    subdomain: "Investigative",
    text: "I enjoy solving complex scientific, mathematical, or research-based puzzles.",
    type: "likert"
  },
  {
    id: "Q3",
    domain: "Big Five Personality",
    subdomain: "Openness",
    text: "I am always curious about new ideas, art, philosophy, and diverse cultures.",
    type: "likert"
  },
  {
    id: "Q4",
    domain: "Big Five Personality",
    subdomain: "Conscientiousness",
    text: "I prefer to have a detailed schedule and keep my study space neat and organized.",
    type: "likert"
  },
  {
    id: "Q5",
    domain: "Cognitive Ability",
    subdomain: "Abstract Reasoning",
    text: "Select the next number in the pattern: 2, 6, 12, 20, 30, ...",
    type: "mcq",
    options: [
      { letter: "A", text: "36" },
      { letter: "B", text: "40" },
      { letter: "C", text: "42" },
      { letter: "D", text: "45" }
    ],
    correctAnswer: "C"
  },
  {
    id: "Q6",
    domain: "Cognitive Ability",
    subdomain: "Logical Deduction",
    text: "If all Glyphs are Bloops, and some Bloops are Zorps, are all Glyphs definitely Zorps?",
    type: "mcq",
    options: [
      { letter: "A", text: "Yes, definitely" },
      { letter: "B", text: "No, not necessarily" },
      { letter: "C", text: "Only if Bloops are also Glyphs" },
      { letter: "D", text: "Insufficient information" }
    ],
    correctAnswer: "B"
  },
  {
    id: "Q7",
    domain: "Emotional Profile",
    subdomain: "Stress Tolerance",
    text: "I remain calm and perform effectively under heavy pressure or tight deadlines.",
    type: "likert"
  },
  {
    id: "Q8",
    domain: "Emotional Profile",
    subdomain: "Resilience",
    text: "I bounce back quickly after experiencing a academic setback or low exam grades.",
    type: "likert"
  },
  {
    id: "Q9",
    domain: "Learning Style",
    subdomain: "Visual Preference",
    text: "I remember details much better when I see diagrams, videos, or written flowcharts.",
    type: "likert"
  },
  {
    id: "Q10",
    domain: "Learning Style",
    subdomain: "Kinesthetic Preference",
    text: "I learn best when practicing concepts physically, running experiments, or role-playing.",
    type: "likert"
  }
];

export const DUMMY_METRICS = [
  {
    id: "M1",
    name: "Mechanical Aptitude",
    layer: "RIASEC Interest",
    score: 85,
    band: "High",
    flag: "OK",
    interpretation: "Exhibits strong affinity for hands-on, practical engineering principles and mechanical systems.",
    audit: [
      { qid: "Q1", question: "I like working with hands-on machinery, tools, or outdoor activities.", response: "Strongly Agree", score: 5, timeSpent: "4.2s", status: "VERIFIED" }
    ]
  },
  {
    id: "M2",
    name: "Scientific Inquiry",
    layer: "RIASEC Interest",
    score: 72,
    band: "High",
    flag: "OK",
    interpretation: "Strong inclination towards scientific methodology, logic testing, and research disciplines.",
    audit: [
      { qid: "Q2", question: "I enjoy solving complex scientific, mathematical, or research-based puzzles.", response: "Agree", score: 4, timeSpent: "5.8s", status: "VERIFIED" }
    ]
  },
  {
    id: "M3",
    name: "Creative Imagination",
    layer: "Big Five Personality",
    score: 78,
    band: "High",
    flag: "OK",
    interpretation: "Highly open to aesthetic experiences, abstract ideas, and unconventional learning paths.",
    audit: [
      { qid: "Q3", question: "I am always curious about new ideas, art, philosophy, and diverse cultures.", response: "Agree", score: 4, timeSpent: "6.1s", status: "VERIFIED" }
    ]
  },
  {
    id: "M4",
    name: "Structured Discipline",
    layer: "Big Five Personality",
    score: 90,
    band: "High",
    flag: "OK",
    interpretation: "Demonstrates exceptional self-discipline, plan-following, and neat study habits.",
    audit: [
      { qid: "Q4", question: "I prefer to have a detailed schedule and keep my study space neat and organized.", response: "Strongly Agree", score: 5, timeSpent: "3.5s", status: "VERIFIED" }
    ]
  },
  {
    id: "M5",
    name: "Abstract Pattern Analysis",
    layer: "Cognitive Ability",
    score: 100,
    band: "High",
    flag: "OK",
    interpretation: "Perfect recognition of number sequences and geometric series progression.",
    audit: [
      { qid: "Q5", question: "Select the next number in the pattern: 2, 6, 12, 20, 30, ...", response: "Option C (42)", score: 5, timeSpent: "12.4s", status: "CORRECT" }
    ]
  },
  {
    id: "M6",
    name: "Syllogistic Reasoning",
    layer: "Cognitive Ability",
    score: 100,
    band: "High",
    flag: "OK",
    interpretation: "Accurately parses logical Venn relationships and conditional rules.",
    audit: [
      { qid: "Q6", question: "If all Glyphs are Bloops, and some Bloops are Zorps, are all Glyphs definitely Zorps?", response: "Option B (No, not necessarily)", score: 5, timeSpent: "18.1s", status: "CORRECT" }
    ]
  },
  {
    id: "M7",
    name: "Academic Stamina",
    layer: "Emotional Profile",
    score: 65,
    band: "Moderate",
    flag: "OK",
    interpretation: "Possesses stable performance under normal loads but gets moderately anxious when test pressure spikes.",
    audit: [
      { qid: "Q7", question: "I remain calm and perform effectively under heavy pressure or tight deadlines.", response: "Neutral", score: 3, timeSpent: "8.3s", status: "VERIFIED" }
    ]
  },
  {
    id: "M8",
    name: "Adversity Recovery",
    layer: "Emotional Profile",
    score: 80,
    band: "High",
    flag: "OK",
    interpretation: "Highly resilient; views mistakes as direct learning feedback rather than identity-threatening failures.",
    audit: [
      { qid: "Q8", question: "I bounce back quickly after experiencing a academic setback or low exam grades.", response: "Agree", score: 4, timeSpent: "4.9s", status: "VERIFIED" }
    ]
  },
  {
    id: "M9",
    name: "Visual Comprehension",
    layer: "Learning Style",
    score: 95,
    band: "High",
    flag: "OK",
    interpretation: "Shows massive performance boost when learning through visual models, graphs, and illustrated code diagrams.",
    audit: [
      { qid: "Q9", question: "I remember details much better when I see diagrams, videos, or written flowcharts.", response: "Strongly Agree", score: 5, timeSpent: "2.9s", status: "VERIFIED" }
    ]
  },
  {
    id: "M10",
    name: "Experimental Kinesthetics",
    layer: "Learning Style",
    score: 55,
    band: "Moderate",
    flag: "OK",
    interpretation: "Prefers active tactile learning but can comfortably adapt to sedentary digital learning.",
    audit: [
      { qid: "Q10", question: "I learn best when practicing concepts physically, running experiments, or role-playing.", response: "Neutral", score: 3, timeSpent: "5.1s", status: "VERIFIED" }
    ]
  }
];

export const SHOWN_METRICS_COUNT = 28; // Standard 28 metrics requested in the tab title

// Generate additional fillers to reach 28 metrics if needed
for (let i = 11; i <= SHOWN_METRICS_COUNT; i++) {
  const layers = ["RIASEC Interest", "Big Five Personality", "Cognitive Ability", "Emotional Profile", "Learning Style", "Additional NeuroPi Indicators"];
  const layer = layers[i % layers.length];
  DUMMY_METRICS.push({
    id: `M${i}`,
    name: `NeuroPi Indicator Indicator #${i}`,
    layer: layer,
    score: Math.floor(Math.random() * 40) + 55, // 55 to 95
    band: "Moderate",
    flag: "OK",
    interpretation: `Simulated developmental indicator for ${layer}. Fits standard student profile parameters.`,
    audit: [
      { qid: "Q-SIM", question: `Simulated item evaluation for ${layer}`, response: "Agree", score: 4, timeSpent: "3.4s", status: "VERIFIED" }
    ]
  });
}

// Ensure the band is correctly set based on score
DUMMY_METRICS.forEach(m => {
  if (m.score >= 70) m.band = "High";
  else if (m.score >= 40) m.band = "Moderate";
  else m.band = "Low";
});
