export function createTrackingMap(questionIds) {
  const map = {};
  questionIds.forEach((id) => {
    map[id] = {
      questionId: id,
      status: "not-visited",
      selectedAnswer: null,
      questionShownAt: null,
      answerSelectedAt: null,
      timeTakenSeconds: null,
      suspiciousFlag: false,
    };
  });
  return map;
}

export function visitQuestion(tracking, questionId) {
  const record = { ...tracking[questionId] };
  if (record.status === "not-visited") {
    record.status = "not-answered";
  }
  if (!record.questionShownAt) {
    record.questionShownAt = Date.now();
  }
  return { ...tracking, [questionId]: record };
}

export function selectAnswer(tracking, questionId, answer) {
  const record = { ...tracking[questionId] };
  record.selectedAnswer = answer;
  record.answerSelectedAt = Date.now();

  if (record.questionShownAt) {
    record.timeTakenSeconds = (record.answerSelectedAt - record.questionShownAt) / 1000;
  }

  if (record.status === "marked-for-review") {
    record.status = "answered-and-marked";
  } else {
    record.status = "answered";
  }

  return { ...tracking, [questionId]: record };
}

export function markForReview(tracking, questionId) {
  const record = { ...tracking[questionId] };
  if (record.status === "answered" || record.status === "answered-and-marked") {
    record.status = "answered-and-marked";
  } else {
    record.status = "marked-for-review";
  }
  return { ...tracking, [questionId]: record };
}

export function clearAnswer(tracking, questionId) {
  const record = { ...tracking[questionId] };
  record.selectedAnswer = null;
  record.answerSelectedAt = null;
  record.timeTakenSeconds = null;

  if (record.status === "answered-and-marked") {
    record.status = "marked-for-review";
  } else {
    record.status = "not-answered";
  }

  return { ...tracking, [questionId]: record };
}

export async function sendAnswerTrackingEvent(payload) {
  try {
    const response = await fetch("/api/test/answer-tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("[sendAnswerTrackingEvent] Mock fallback:", error.message);
    return { success: true, mock: true, payload };
  }
}

export async function submitFullExam(payload) {
  try {
    const { submitExam } = await import("services/examApi");
    const res = await submitExam(payload);
    return res;
  } catch (error) {
    console.warn("[submitFullExam] Fallback:", error.message);
    return { success: false };
  }
}
