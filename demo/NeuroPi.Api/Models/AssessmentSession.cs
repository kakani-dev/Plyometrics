using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace NeuroPi.Api.Models
{
    public class AssessmentSession
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string StudentName { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty; // e.g. "8", "9", "10", "11", "12"
        public string Mode { get; set; } = "adaptive"; // "adaptive" or "compact"
        public string ApiKey { get; set; } = string.Empty;
        public DateTime StartTime { get; set; } = DateTime.UtcNow;
        public DateTime? EndTime { get; set; }
        public bool IsCompleted { get; set; } = false;

        // Progress Tracking (State)
        public int CurrentMetricIndex { get; set; } = 0;
        public int CurrentQuestionIndex { get; set; } = 0;
        public int CompactIndex { get; set; } = 0;
        
        // Adaptive variables
        public int ValidityFails { get; set; } = 0;
        public int ValidityStep { get; set; } = 0;
        public int SavedQuestionsCount { get; set; } = 0;
        public string ProfileCode { get; set; } = string.Empty;

        // Cognitive difficulties stored as comma-separated subdomain:levelIndex pairs
        public string CognitiveDifficultyState { get; set; } = "Logic:0,Numerical:0,Verbal:0,Abstract:0,Spatial:0";
        public string DifficultyTypes { get; set; } = "Easy,Medium,Hard";
        public string DifficultyRatios { get; set; } = "33,34,33";
        public int QuestionsPerSubdomain { get; set; } = 3;

        // Navigation navigation
        public List<StudentResponse> Responses { get; set; } = new();
    }

    public class StudentResponse
    {
        public int Id { get; set; }
        public Guid SessionId { get; set; }
        public string QID { get; set; } = string.Empty;
        public string Domain { get; set; } = string.Empty;
        public string Subdomain { get; set; } = string.Empty;
        public string QuestionType { get; set; } = string.Empty;
        public string ResponseValue { get; set; } = string.Empty; // Likert score (1-5) or MCQ choice (A-D)
        public int TimeSec { get; set; }
        public bool ReverseScored { get; set; }
        public string CorrectKey { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Navigation
        [JsonIgnore]
        public AssessmentSession? Session { get; set; }
    }
}
