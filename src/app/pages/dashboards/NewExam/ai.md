# NeuroPi API Documentation

This document describes the request and response payloads exchanged between the frontend client and the NeuroPi backend API for student psychometric assessment.

---

## 1. Start Assessment Session
- **Endpoint:** `POST /api/assessment/start`
- **Description:** Initializes a new adaptive test session for a student.

### Request Payload
```json
{
  "studentName": "string",
  "grade": "string",
  "mode": "string", // e.g., "adaptive"
  "apiKey": "string"
}
```

### Response Payload
```json
{
  "sessionId": "string",
  "totalQuestions": 70, // number
  "firstQuestion": {
    "QID": 101, // or qid
    "Domain": "string",
    "Subdomain": "string",
    "Question Type": "MCQ" | "Likert",
    "Question": "string",
    "Option A": "string", // optional, MCQ only
    "Option B": "string", // optional, MCQ only
    "Option C": "string", // optional, MCQ only
    "Option D": "string"  // optional, MCQ only
  }
}
```

---

## 2. Submit Answer
- **Endpoint:** `POST /api/assessment/submit`
- **Description:** Submits the student's answer for the current question and retrieves the next question (or marks completion).

### Request Payload
```json
{
  "sessionId": "string",
  "qid": "string" | 123,
  "responseValue": "string",
  "timeSec": 15 // number of seconds spent on the question
}
```

### Response Payload
```json
{
  "isCompleted": false,
  "nextQuestion": {
    "QID": 102,
    "Domain": "string",
    "Subdomain": "string",
    "Question Type": "MCQ" | "Likert",
    "Question": "string",
    "Option A": "string", // optional, MCQ only
    "Option B": "string", // optional, MCQ only
    "Option C": "string", // optional, MCQ only
    "Option D": "string"  // optional, MCQ only
  }
}
```
*Note: If `isCompleted` is `true`, `nextQuestion` will not be present.*

---

## 3. Fetch Assessment Results
- **Endpoint:** `GET /api/assessment/results/{sessionId}`
- **Description:** Retrieves the psychometric profiles, cognitive gauges, recommendations, and counseling roadmaps for the completed session.

### Request Payload
*None (Parameters passed via Path)*

### Response Payload
```json
{
  "profileCode": "string", // e.g., "NP-P1028"
  "circularGauges": {
    "careerReadiness": 88,
    "riasecClarity": 75,
    "cognitiveIndex": 95,
    "emotionalSustainability": 68
  },
  "dominantVectors": {
    "dominantRIASEC": "string", // e.g., "Realistic"
    "dominantBig5": "string",   // e.g., "Conscientiousness"
    "dominantLearning": "string", // e.g., "Visual"
    "bigFiveBalance": 82,
    "learningPreferenceStrength": 90
  },
  "primaryAlert": {
    "alertType": "string",
    "description": "string",
    "alertClass": "string" // e.g., "alert-success"
  },
  "counselorRoadmap": {
    "counselorFocus": "string",
    "permutationAction": "string",
    "priorities": ["string"]
  },
  "streamRecommendation": {
    "stream": "string",
    "subjects": "string",
    "actions": ["string"],
    "careerFitScore": 86
  },
  "localNarrative": {
    "executiveSummary": "string",
    "cognitiveStrengths": "string",
    "learningStrategy": "string",
    "careerMapping": "string",
    "counselorGuideline": "string"
  },
  "metrics": [
    // Array of detailed diagnostic metrics
  ]
}
```

---

## 4. Generate AI Report
- **Endpoint:** `POST /api/assessment/ai-report`
- **Description:** Requests the backend to generate a structured AI report using the session data and the provided API key.

### Request Payload
```json
{
  "sessionId": "string",
  "apiKey": "string"
}
```

### Response Payload
```json
{
  "reportText": "string" // or ReportText
}
```
