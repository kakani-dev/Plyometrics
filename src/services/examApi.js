import axios from 'axios';

const API_BASE = '/api/examreport';

export function toNumericId(id) {
  if (typeof id === 'number') return id;
  const num = parseInt(String(id).replace(/\D/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

export async function getExamsByUser(userId) {
  const { data } = await axios.get(`${API_BASE}/user/${toNumericId(userId)}`);
  return data;
}

export async function getExamReport(id) {
  const { data } = await axios.get(`${API_BASE}/${id}`);
  return data;
}

export async function getExamResponses(id) {
  const { data } = await axios.get(`${API_BASE}/${id}/responses`);
  return data;
}

export async function getExamMarks(id) {
  const { data } = await axios.get(`${API_BASE}/${id}/marks`);
  return data;
}

export async function submitExam(payload) {
  const idMap = {};
  const numericQuestions = (payload.questions || []).map((q, index) => {
    const numericId = index + 1;
    idMap[q.id] = numericId;
    return { ...q, id: numericId };
  });

  const numericAnswers = (payload.questionAnswers || []).map(a => {
    const qId = idMap[a.questionId] || 0;
    const qShown = typeof a.questionShownAt === 'number' ? Math.floor(a.questionShownAt) : Date.parse(a.questionShownAt) || 0;
    const aSelected = typeof a.answerSelectedAt === 'number' ? Math.floor(a.answerSelectedAt) : Date.parse(a.answerSelectedAt) || 0;
    return {
      ...a,
      questionId: qId,
      timeTakenSeconds: Math.round(a.timeTakenSeconds || 0),
      questionShownAt: qShown,
      answerSelectedAt: aSelected,
    };
  });

  const numericPayload = {
    ...payload,
    userId: toNumericId(payload.userId),
    questionAnswers: numericAnswers,
    questions: numericQuestions,
  };
  const { data } = await axios.post(`${API_BASE}/submit`, numericPayload);
  return data;
}

export async function deleteExam(id) {
  const { data } = await axios.delete(`${API_BASE}/${id}`);
  return data;
}

// ── UserPy API ──

const USERPY_BASE = '/api/UserPy';

export async function getUserPyList() {
  const { data } = await axios.get(USERPY_BASE);
  return data;
}

export async function getUserPyById(id) {
  const { data } = await axios.get(`${USERPY_BASE}/${id}`);
  return data;
}

export async function createUserPy(payload) {
  const { data } = await axios.post(USERPY_BASE, payload);
  return data;
}

export async function updateUserPy(id, payload) {
  const { data } = await axios.put(`${USERPY_BASE}/${id}`, payload);
  return data;
}

export async function deleteUserPy(id) {
  const { data } = await axios.delete(`${USERPY_BASE}/${id}`);
  return data;
}
