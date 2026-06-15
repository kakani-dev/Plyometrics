export const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

export const getStrokeDashOffset = (percentage) => 251 - (251 * percentage) / 100;

export const mapBackendQuestionToFrontend = (bq) => {
  if (!bq) return null;
  const id = bq.QID || bq.qid;
  const domain = bq.Domain || bq.domain;
  const subdomain = bq.Subdomain || bq.subdomain;
  const rawType = bq["Question Type"] || bq.questionType || bq.type;
  const text = bq.Question || bq.questionText || bq.text;
  const type = (rawType && rawType.toLowerCase() === "mcq") ? "mcq" : "likert";
  const difficulty = bq.Difficulty || bq.difficulty || "Unknown";
  let options = [];
  if (type === "mcq") {
    const optA = bq["Option A"] || bq.optionA;
    const optB = bq["Option B"] || bq.optionB;
    const optC = bq["Option C"] || bq.optionC;
    const optD = bq["Option D"] || bq.optionD;
    if (optA) options.push({ letter: "A", text: optA });
    if (optB) options.push({ letter: "B", text: optB });
    if (optC) options.push({ letter: "C", text: optC });
    if (optD) options.push({ letter: "D", text: optD });
  }
  return { id, domain, subdomain, text, type, options, difficulty };
};
