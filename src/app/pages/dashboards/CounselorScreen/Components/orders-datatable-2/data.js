import axios from 'axios';

const REPORT_API_BASE = "https://localhost:7172";

export async function generateReport(sessionId, apiKey) {
  if (!sessionId) return null;
  try {
    const { data } = await axios.post(`${REPORT_API_BASE}/api/Assessment/ai-report`, {
      sessionId,
      apiKey: apiKey || "AQ.Ab8RN6IeyWn7Oovu1RtckQ70ibSHHZgQcJp9puq6Lda4c_Tl8w",
    }, {
      headers: { "accept": "*/*" },
    });
    return data.reportText || data.ReportText || data;
  } catch (err) {
    console.error("[generateReport] API error:", err?.response?.data || err);
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
