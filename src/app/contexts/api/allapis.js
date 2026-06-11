import axios from 'axios';
import { NEUROPI_API_BASE } from 'configs/auth.config';

export async function getAppointmentsRequestsList(id = 1, tenantId = 1) {
  const { data } = await axios.get(`${NEUROPI_API_BASE}/api/PyCandidateService/with-tests`, {
    params: { id, tenantId }
  });
  return data;
}

export async function getExamPattern(testId, candidateId) {
  const { data } = await axios.get(`${NEUROPI_API_BASE}/api/TestService/${testId}/exam-pattern`, {
    params: { candidateId }
  });
  return data;
}

export async function getQuestionOptions(questionId) {
  const { data } = await axios.get(`${NEUROPI_API_BASE}/api/QuestionService/${questionId}/options`);
  return data;
}

export async function submitAnswers(payload) {
  const { data } = await axios.post(`${NEUROPI_API_BASE}/api/TestService/submit-answers`, payload);
  return data;
}

export async function createCandidate(payload) {
  const { data } = await axios.post(`${NEUROPI_API_BASE}/api/PyCandidateService`, payload);
  return data;
}