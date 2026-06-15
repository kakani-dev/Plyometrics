const API_BASE = "http://localhost:5041/api";

export async function startBackendSession(profile) {
  try {
    const body = {
      studentName: profile.name,
      grade: profile.grade,
      apiKey: profile.apiKey,
      tenantId: profile.tenantId != null ? Number(profile.tenantId) : 1,
      testTypeServiceId: profile.testTypeServiceId != null ? Number(profile.testTypeServiceId) : 0,
    };
    if (profile.difficultyTypes != null) {
      body.difficultyTypes = profile.difficultyTypes;
    }
    if (profile.difficultyRatios != null) {
      body.difficultyRatios = profile.difficultyRatios;
    }
    if (profile.questionsPerSubdomain != null && profile.questionsPerSubdomain !== "") {
      body.questionsPerSubdomain = Number(profile.questionsPerSubdomain);
    }
    
    console.log("[API] POST /assessment/start request body:", JSON.stringify(body, null, 2));
    const res = await fetch(`${API_BASE}/assessment/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Backend unavailable");
    const data = await res.json();
    console.log("[API] POST /assessment/start response:", JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.error("[API] POST /assessment/start error:", err);
    return null;
  }
}

export async function submitAnswerToBackend(sessionId, qid, responseValue, timeSec) {
  if (!sessionId) return null;
  try {
    const payload = {
      sessionId,
      qid,
      responseValue: String(responseValue),
      timeSec
    };
    console.log("[API] POST /assessment/submit request body:", JSON.stringify(payload, null, 2));
    const res = await fetch(`${API_BASE}/assessment/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Submit failed");
    const data = await res.json();
    console.log("[API] POST /assessment/submit response:", JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.error("[API] POST /assessment/submit error:", err);
    return null;
  }
}

export async function fetchResults(sessionId) {
  if (!sessionId) return null;
  try {
    console.log(`[API] GET /assessment/results/${sessionId}`);
    const res = await fetch(`${API_BASE}/assessment/results/${sessionId}`);
    if (!res.ok) throw new Error("Results unavailable");
    const data = await res.json();
    console.log("[API] GET /assessment/results response:", JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.error("[API] GET /assessment/results error:", err);
    return null;
  }
}

export async function fetchSavedReport(sessionId) {
  if (!sessionId) return null;
  try {
    const res = await fetch(`${API_BASE}/assessment/report/${sessionId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.reportText || data.ReportText || null;
  } catch {
    return null;
  }
}

export async function generateAiReportBackend(sessionId, apiKey) {
  try {
    const res = await fetch(`${API_BASE}/assessment/ai-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, apiKey }),
    });
    if (!res.ok) throw new Error("Backend AI generation failed");
    const data = await res.json();
    return data.reportText || data.ReportText;
  } catch {
    return null;
  }
}

const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-3.5-flash",
  "gemini-3.1-pro-preview"
];

async function callGeminiModel(apiKey, promptText, model) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    }
  );
  if (!response.ok) throw new Error(`${model} failed (${response.status})`);
  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`${model} returned empty response`);
  return text;
}

export async function generateAiReportDirect(apiKey, promptText) {
  const requestBody = { contents: [{ parts: [{ text: promptText }] }] };
  console.log("[generateAiReportDirect] Sending request:", JSON.stringify(requestBody, null, 2));

  let lastError;
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[generateAiReportDirect] Trying model: ${model}`);
      const text = await callGeminiModel(apiKey, promptText, model);
      console.log(`[generateAiReportDirect] ${model} succeeded`);
      return text;
    } catch (err) {
      console.warn(`[generateAiReportDirect] ${model} failed: ${err.message}`);
      lastError = err;
    }
  }

  console.error("[generateAiReportDirect] All models failed:", lastError?.message);
  return null;
}
