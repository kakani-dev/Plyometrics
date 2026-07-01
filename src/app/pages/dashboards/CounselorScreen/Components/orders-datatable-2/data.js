import axios from 'axios';
import { GEMINI_API_KEY } from "configs/gemini.config";
import { generateAiReportDirect } from "app/pages/dashboards/NewExam/apicalling";

const REPORT_API_BASE = "https://localhost:7172";
const RESULTS_API_BASE = "http://localhost:5041/api";

// ─── Prompt builder (mirrors useExamLogic.js) ────────────────────────────────
function buildPrompt(studentName, resultsData) {
  const ci = resultsData?.circularGauges?.cognitiveIndex ?? 95;
  const es = resultsData?.circularGauges?.emotionalSustainability ?? 68;
  return `
You are an expert educational psychologist and counseling director. Analyze this student psychometric data sheet and synthesize a detailed developmental diagnostic report.

STUDENT PROFILE:
- Name: ${studentName || "Student"}
- Grade: ${resultsData?.grade || "10"}
- Assessment Code: ${resultsData?.profileCode || "NP-P0000"}

DOMINANT TRAITS:
- dominant RIASEC: ${resultsData?.dominantVectors?.dominantRIASEC || "Realistic"}
- dominant Big Five: ${resultsData?.dominantVectors?.dominantBig5 || "Conscientiousness"}
- Cognitive Band: ${ci >= 70 ? "High" : ci >= 40 ? "Moderate" : "Low"} (Index Score: ${ci}%)
- Emotional Band: ${es >= 70 ? "High" : es >= 40 ? "Moderate" : "Low"} (Index Score: ${es}%)
- dominant Learning Style: ${resultsData?.dominantVectors?.dominantLearning || "Visual"}
- Recommended Stream: ${resultsData?.streamRecommendation?.stream || "Science (PCM)"} (Subjects: ${resultsData?.streamRecommendation?.subjects || "Physics, Chemistry, Mathematics"})
- Recommended Stream Actions: ${(resultsData?.streamRecommendation?.actions || []).join("; ")}

Write a comprehensive, professional narrative report divided into four sections. Adopt a supportive, guidance-oriented tone.
Formatting: Do not use markdown titles. Format each section as solid, flowing paragraphs.

[SECTION 1] Executive Assessment Summary (Synthesize a detailed review of RIASEC interest, personality traits and developmental indicators).
[SECTION 2] Cognitive Reasoning & Sensory Learning Profile (Detail cognitive strengths and specific classroom learning strategies matching their learning style).
[SECTION 3] Academic and Career Trajectory Mapping (Provide concrete career recommendations matching their RIASEC code and cognitive band, and write an analysis supporting their recommended academic stream).
[SECTION 4] Guided Counseling & Parental Support Recommendations (List step-by-step counselor focus roadmaps and parental support guidelines).
`;
}

// ─── Fetch session results from backend ──────────────────────────────────────
async function fetchSessionResults(sessionId) {
  try {
    const res = await fetch(`${RESULTS_API_BASE}/assessment/results/${sessionId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function generateReport(sessionId, apiKey, studentName) {
  if (!sessionId) return null;

  const resolvedKey = apiKey || GEMINI_API_KEY;

  // Step 1: ask the backend
  try {
    const { data } = await axios.post(`${REPORT_API_BASE}/api/Assessment/ai-report`, {
      sessionId,
      apiKey: resolvedKey,
    }, {
      headers: { "accept": "*/*" },
    });

    const reportText = data.reportText || data.ReportText || null;
    const source     = data.source || data.Source || null;
    // Strict boolean: only treat as AI-generated if the field is explicitly true.
    // If absent (field not in response), we log and default to true.
    const rawFlag    = data.isAiGenerated ?? data.IsAiGenerated;
    const isAiGenerated = rawFlag === undefined ? true : rawFlag === true;

    console.log("[generateReport] backend response →", { reportText: !!reportText, source, rawFlag, isAiGenerated });

    if (!reportText) {
      console.warn("[generateReport] Empty reportText in response:", data);
      return null;
    }

    // Step 2: backend used offline fallback → retry directly via gemini-1.5-flash
    if (!isAiGenerated) {
      console.warn(
        `[generateReport] Backend quota exceeded (source: "${source}"). ` +
        `Retrying directly with gemini-1.5-flash...`
      );

      const resultsData = await fetchSessionResults(sessionId);
      const promptText  = buildPrompt(studentName, resultsData);
      const directText  = await generateAiReportDirect(resolvedKey, promptText);

      if (directText) {
        console.log("[generateReport] Direct gemini-1.5-flash call succeeded ✓");
        return { reportText: directText, source: "gemini-1.5-flash (direct)", isAiGenerated: true };
      }

      // Both paths failed — return the offline text with the warning flag
      console.warn("[generateReport] Direct call also failed. Using offline report.");
      return { reportText, source, isAiGenerated: false };
    }

    return { reportText, source, isAiGenerated: true };
  } catch (err) {
    const status = err?.response?.status;
    const body   = err?.response?.data;
    console.error(
      `[generateReport] API error (HTTP ${status ?? "network"}):`,
      body || err.message
    );
    return null;
  }
}

export const candidatesList = [
    {
        id: 1,
        name: "John Doe",
        dob: "2018-01-15T00:00:00",
        email: "johndoe@example.com",
        mobilenumber: "1234567890",
        gender: "Male",
        examsFinished: 1,
        examsTotal: 5,
        tests: [
            {
                id: 3,
                examDate: "2026-06-09T18:30:00Z",
                totalTestTime: null,
                isCompleted: false,
                testType: { id: 1, name: "Auto-3x8-8" },
            },
            {
                id: 4,
                examDate: "2026-06-09T18:30:00Z",
                totalTestTime: null,
                isCompleted: false,
                testType: { id: 3, name: "Auto-4x8-8" },
            },
            {
                id: 1,
                examDate: "2026-06-11T09:44:19.183Z",
                totalTestTime: "00:02:03",
                isCompleted: true,
                testType: { id: 1, name: "Auto-3x8-8" },
            },
            {
                id: 2,
                examDate: "2026-06-11T11:18:33.563Z",
                totalTestTime: null,
                isCompleted: false,
                testType: { id: 2, name: "Auto-5x8-8" },
            },
            {
                id: 5,
                examDate: "2026-06-12T18:30:00Z",
                totalTestTime: null,
                isCompleted: false,
                testType: { id: 4, name: "Auto-6x8-8" },
            },
        ],
    },
    {
        id: 2,
        name: "Lekhan",
        dob: "2018-06-16T00:00:00",
        email: "kakanimohith66@gmail.com",
        mobilenumber: "5478941415",
        gender: "male",
        examsFinished: 0,
        examsTotal: 2,
        tests: [
            {
                id: 7,
                examDate: "2026-06-12T18:30:00Z",
                totalTestTime: null,
                isCompleted: false,
                testType: { id: 1, name: "Auto-3x8-8" },
            },
            {
                id: 8,
                examDate: "2026-06-12T18:30:00Z",
                totalTestTime: null,
                isCompleted: false,
                testType: { id: 3, name: "Auto-4x8-8" },
            },
        ],
    },
    {
        id: 3,
        name: "KAKANI MOHITH",
        dob: "2018-12-20T00:00:00",
        email: "kakanimohithkrishnasai@gmail.com",
        mobilenumber: "6281234148",
        gender: "male",
        examsFinished: 0,
        examsTotal: 0,
        tests: [],
    },
    {
        id: 4,
        name: "SaiVArdhan",
        dob: "2018-06-01T00:00:00",
        email: "SaiVArdhan@gmail.com",
        mobilenumber: "7894565123",
        gender: "male",
        examsFinished: 0,
        examsTotal: 0,
        tests: [],
    },
    {
        id: 5,
        name: "Teja",
        dob: "2018-06-20T00:00:00",
        email: "Teja@gmail.com",
        mobilenumber: "8789456102",
        gender: "male",
        examsFinished: 0,
        examsTotal: 1,
        tests: [
            {
                id: 6,
                examDate: "2026-06-11T18:30:00Z",
                totalTestTime: null,
                isCompleted: false,
                testType: { id: 1, name: "Auto-3x8-8" },
            },
        ],
    },
]
