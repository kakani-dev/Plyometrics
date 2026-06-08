import { getAllQuestionIds } from "./mockData";

export function createTrackingMap(questionIds) {
  const map = {};
  const ids = questionIds || getAllQuestionIds();
  ids.forEach((id) => {
    map[id] = {
      questionId: id,
      status: "not-visited",
      selectedAnswer: null,
      questionShownAt: null,
      answerSelectedAt: null,
      timeTakenSeconds: null,
      visitedCount: 0,
      changedAnswerCount: 0,
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
  record.visitedCount += 1;
  record.questionShownAt = record.questionShownAt || new Date().toISOString();
  return { ...tracking, [questionId]: record };
}

export function selectAnswer(tracking, questionId, answer) {
  const record = { ...tracking[questionId] };
  const now = new Date().toISOString();

  if (record.selectedAnswer !== null && record.selectedAnswer !== answer) {
    record.changedAnswerCount += 1;
  }

  record.selectedAnswer = answer;
  record.answerSelectedAt = now;

  if (record.questionShownAt) {
    record.timeTakenSeconds =
      (new Date(now).getTime() - new Date(record.questionShownAt).getTime()) /
      1000;
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

export function analyzeSuspiciousBehavior(tracking) {
  const records = Object.values(tracking);
  let fastAnswerCount = 0;
  let answerChangesCount = 0;

  records.forEach((r) => {
    if (r.timeTakenSeconds !== null && r.timeTakenSeconds < 2) {
      fastAnswerCount++;
      r.suspiciousFlag = true;
    }
    if (r.changedAnswerCount > 2) {
      r.suspiciousFlag = true;
    }
    answerChangesCount += r.changedAnswerCount;
  });

  const totalAnswered = records.filter(
    (r) => r.status === "answered" || r.status === "answered-and-marked",
  ).length;
  const fastAnswerRatio = totalAnswered > 0 ? fastAnswerCount / totalAnswered : 0;

  let verdict = "genuine";
  if (fastAnswerRatio >= 0.5 || answerChangesCount > 10) {
    verdict = "highly-suspicious";
  } else if (fastAnswerRatio >= 0.25 || answerChangesCount > 5) {
    verdict = "possibly-random";
  }

  return {
    fastAnswerCount,
    answerChangesCount,
    fastAnswerRatio,
    verdict,
    tracking,
  };
}

export async function sendAnswerTrackingEvent(payload) {
  console.log("[sendAnswerTrackingEvent]", payload);
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
