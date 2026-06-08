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
  if (record.status === "answered") {
    record.status = "answered-and-marked";
  } else if (record.status !== "answered-and-marked") {
    record.status = "marked-for-review";
  } else {
    record.status = "answered";
  }
  return { ...tracking, [questionId]: record };
}

export function clearAnswer(tracking, questionId) {
  const record = { ...tracking[questionId] };
  record.selectedAnswer = null;
  record.status = "not-answered";
  return { ...tracking, [questionId]: record };
}

export function sendAnswerTrackingEvent() {
  return Promise.resolve({ success: true });
}
