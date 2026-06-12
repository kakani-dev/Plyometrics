import axios from 'axios';
import { NEUROPI_API_BASE } from 'configs/auth.config';

function toNumericId(id) {
  if (typeof id === 'string' && id.startsWith('uid-')) {
    return parseInt(id.replace('uid-', ''), 10);
  }
  return id;
}

export async function getAppointmentsRequestsList(id = 1, tenantId = 1) {
  const cleanId = toNumericId(id);
  const cleanTenantId = toNumericId(tenantId);
  const { data } = await axios.get(`${NEUROPI_API_BASE}/api/PyCandidateService/with-tests`, {
    params: { id: cleanId, tenantId: cleanTenantId }
  });
  return data;
}

export async function getExamPattern(testId, candidateId) {
  const cleanCandidateId = toNumericId(candidateId);
  const { data } = await axios.get(`${NEUROPI_API_BASE}/api/TestService/${testId}/exam-pattern`, {
    params: { candidateId: cleanCandidateId }
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

export async function getCandidateDetails(id = 1, tenantId = 1) {
  const cleanId = toNumericId(id);
  const cleanTenantId = toNumericId(tenantId);
  const { data } = await axios.get(`${NEUROPI_API_BASE}/api/PyCandidateService/${cleanId}/tenant/${cleanTenantId}`);
  return data;
}