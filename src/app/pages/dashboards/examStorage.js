const INDEX_KEY = "exam_results_index";

function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

export function getStoredExams() {
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveExamResult({ tracking, questions, elapsed, config, candidateInfo }) {
  const { fullName, email } = candidateInfo || {};
  if (!email) return null;

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const entry = {
    id,
    email: normalizeEmail(email),
    fullName: fullName || "",
    timestamp: Date.now(),
    title: config?.title || "Psychometric Assessment",
  };

  const data = { tracking, questions, elapsed, config: { ...config, candidateInfo } };

  try {
    localStorage.setItem(`exam_result_${id}`, JSON.stringify(data));
    const index = getStoredExams();
    index.unshift(entry);
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch {
    localStorage.setItem(`exam_result_${id}`, JSON.stringify(data));
    localStorage.setItem(INDEX_KEY, JSON.stringify([entry]));
  }

  return id;
}

export function loadExamResult(id) {
  try {
    return JSON.parse(localStorage.getItem(`exam_result_${id}`));
  } catch {
    return null;
  }
}
