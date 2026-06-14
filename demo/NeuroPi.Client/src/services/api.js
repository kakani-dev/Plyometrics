const API_BASE_URL = 'http://localhost:5041/api';

export async function startSession(studentName, grade, mode, apiKey) {
  const response = await fetch(`${API_BASE_URL}/assessment/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentName, grade, mode, apiKey }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to start session');
  }
  return response.json();
}

export async function submitAnswer(sessionId, qid, responseValue, timeSec) {
  const response = await fetch(`${API_BASE_URL}/assessment/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, qid, responseValue, timeSec }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to submit answer');
  }
  return response.json();
}

export async function getResults(sessionId) {
  const response = await fetch(`${API_BASE_URL}/assessment/results/${sessionId}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to fetch results');
  }
  return response.json();
}

export async function generateAiReport(sessionId, apiKey) {
  const response = await fetch(`${API_BASE_URL}/assessment/ai-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, apiKey }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to generate AI report');
  }
  return response.json();
}

export async function populateMockDemo(sessionId) {
  const response = await fetch(`${API_BASE_URL}/assessment/mock-demo/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to populate mock demo data');
  }
  return response.json();
}

export async function getHistory() {
  const response = await fetch(`${API_BASE_URL}/assessment/history`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to fetch history');
  }
  return response.json();
}

export async function getQuestions() {
  const response = await fetch(`${API_BASE_URL}/assessment/questions`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to fetch questions');
  }
  return response.json();
}
