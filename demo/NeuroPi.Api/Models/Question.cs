using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NeuroPi.Api.Models
{
    public class Question
    {
        [Key]
        [JsonPropertyName("QID")]
        public string QID { get; set; } = string.Empty;

        [JsonPropertyName("Grade Band")]
        public string GradeBand { get; set; } = string.Empty;

        [JsonPropertyName("Domain")]
        public string Domain { get; set; } = string.Empty;

        [JsonPropertyName("Subdomain")]
        public string Subdomain { get; set; } = string.Empty;

        [JsonPropertyName("Trait/Code")]
        public string TraitCode { get; set; } = string.Empty;

        [JsonPropertyName("Question Type")]
        public string QuestionType { get; set; } = string.Empty;

        [JsonPropertyName("Question")]
        public string QuestionText { get; set; } = string.Empty;

        [JsonPropertyName("Option A")]
        public string OptionA { get; set; } = string.Empty;

        [JsonPropertyName("Option B")]
        public string OptionB { get; set; } = string.Empty;

        [JsonPropertyName("Option C")]
        public string OptionC { get; set; } = string.Empty;

        [JsonPropertyName("Option D")]
        public string OptionD { get; set; } = string.Empty;

        [JsonPropertyName("Correct/Key")]
        public string CorrectKey { get; set; } = string.Empty;

        [JsonPropertyName("Scale / Scoring")]
        public string ScaleScoring { get; set; } = string.Empty;

        [JsonPropertyName("Reverse Scored")]
        public string ReverseScored { get; set; } = string.Empty;

        [JsonPropertyName("Difficulty")]
        public string Difficulty { get; set; } = string.Empty;

        [JsonPropertyName("Report Tag")]
        public string ReportTag { get; set; } = string.Empty;

        [JsonPropertyName("Counselor Note")]
        public string CounselorNote { get; set; } = string.Empty;
    }
}
