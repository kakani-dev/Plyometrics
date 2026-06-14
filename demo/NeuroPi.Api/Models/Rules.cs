using System.Text.Json.Serialization;
using System.Collections.Generic;

namespace NeuroPi.Api.Models
{
    public class MetricScoringRule
    {
        [JsonPropertyName("Layer")]
        public string Layer { get; set; } = string.Empty;

        [JsonPropertyName("Metric")]
        public string Metric { get; set; } = string.Empty;

        [JsonPropertyName("Trait_Code")]
        public string TraitCode { get; set; } = string.Empty;

        [JsonPropertyName("Questions_Used")]
        public string QuestionsUsed { get; set; } = string.Empty;

        [JsonPropertyName("Source_QIDs")]
        public string SourceQIDs { get; set; } = string.Empty;

        [JsonPropertyName("Response_Type")]
        public string ResponseType { get; set; } = string.Empty;

        [JsonPropertyName("Raw_Score_Range")]
        public string RawScoreRange { get; set; } = string.Empty;

        [JsonPropertyName("Normalized_Score_Formula")]
        public string NormalizedScoreFormula { get; set; } = string.Empty;

        [JsonPropertyName("Low_Band")]
        public string LowBand { get; set; } = string.Empty;

        [JsonPropertyName("Moderate_Band")]
        public string ModerateBand { get; set; } = string.Empty;

        [JsonPropertyName("High_Band")]
        public string HighBand { get; set; } = string.Empty;

        [JsonPropertyName("Timing_Rule")]
        public string TimingRule { get; set; } = string.Empty;

        [JsonPropertyName("AI_Interpretation")]
        public string AIInterpretation { get; set; } = string.Empty;
    }

    public class CompactQuestionTemplate
    {
        [JsonPropertyName("Student_ID")]
        public string StudentID { get; set; } = string.Empty;

        [JsonPropertyName("Assessment_QID")]
        public string AssessmentQID { get; set; } = string.Empty;

        [JsonPropertyName("Layer")]
        public string Layer { get; set; } = string.Empty;

        [JsonPropertyName("Metric")]
        public string Metric { get; set; } = string.Empty;

        [JsonPropertyName("Trait_Code")]
        public string TraitCode { get; set; } = string.Empty;

        [JsonPropertyName("Question_Type")]
        public string QuestionType { get; set; } = string.Empty;

        [JsonPropertyName("Question")]
        public string Question { get; set; } = string.Empty;

        [JsonPropertyName("Response")]
        public string Response { get; set; } = string.Empty;

        [JsonPropertyName("Response_Time_Sec")]
        public string ResponseTimeSec { get; set; } = string.Empty;

        [JsonPropertyName("Auto_Score_0_100")]
        public string AutoScore0100 { get; set; } = string.Empty;

        [JsonPropertyName("Time_Band")]
        public string TimeBand { get; set; } = string.Empty;

        [JsonPropertyName("Review_Flag")]
        public string ReviewFlag { get; set; } = string.Empty;

        [JsonPropertyName("Correct_Key")]
        public string CorrectKey { get; set; } = string.Empty;

        [JsonPropertyName("Reverse_Scored")]
        public string ReverseScored { get; set; } = string.Empty;

        [JsonPropertyName("Time_Low_Max")]
        public string TimeLowMax { get; set; } = string.Empty;

        [JsonPropertyName("Time_Moderate_Max")]
        public string TimeModerateMax { get; set; } = string.Empty;

        [JsonPropertyName("Time_High_Above")]
        public string TimeHighAbove { get; set; } = string.Empty;
    }

    public class PermutationRule
    {
        [JsonPropertyName("Profile_Code")]
        public string ProfileCode { get; set; } = string.Empty;

        [JsonPropertyName("RIASEC_Code")]
        public string RiasecCode { get; set; } = string.Empty;

        [JsonPropertyName("RIASEC_Dominant")]
        public string RiasecDominant { get; set; } = string.Empty;

        [JsonPropertyName("Big5_Dominant")]
        public string Big5Dominant { get; set; } = string.Empty;

        [JsonPropertyName("Cognitive_Band")]
        public string CognitiveBand { get; set; } = string.Empty;

        [JsonPropertyName("Emotional_Band")]
        public string EmotionalBand { get; set; } = string.Empty;

        [JsonPropertyName("Learning_Style")]
        public string LearningStyle { get; set; } = string.Empty;

        [JsonPropertyName("AI_Interpretation")]
        public string AIInterpretation { get; set; } = string.Empty;

        [JsonPropertyName("Recommended_Action")]
        public string RecommendedAction { get; set; } = string.Empty;

        [JsonPropertyName("Counselor_Flag")]
        public string CounselorFlag { get; set; } = string.Empty;

        [JsonPropertyName("Priority")]
        public string Priority { get; set; } = string.Empty;
    }

    public class TimingBand
    {
        [JsonPropertyName("Question_Type")]
        public string QuestionType { get; set; } = string.Empty;

        [JsonPropertyName("Difficulty")]
        public string Difficulty { get; set; } = string.Empty;

        [JsonPropertyName("Low_Time_Max_Sec")]
        public string LowTimeMaxSec { get; set; } = string.Empty;

        [JsonPropertyName("Moderate_Time_Max_Sec")]
        public string ModerateTimeMaxSec { get; set; } = string.Empty;

        [JsonPropertyName("High_Time_Review_Above_Sec")]
        public string HighTimeReviewAboveSec { get; set; } = string.Empty;

        [JsonPropertyName("Interpretation")]
        public string Interpretation { get; set; } = string.Empty;
    }

    public class ScoringMapRule
    {
        [JsonPropertyName("Domain")]
        public string Domain { get; set; } = string.Empty;

        [JsonPropertyName("Subdomain")]
        public string Subdomain { get; set; } = string.Empty;

        [JsonPropertyName("Low Interpretation")]
        public string LowInterpretation { get; set; } = string.Empty;

        [JsonPropertyName("Moderate Interpretation")]
        public string ModerateInterpretation { get; set; } = string.Empty;

        [JsonPropertyName("High Interpretation")]
        public string HighInterpretation { get; set; } = string.Empty;

        [JsonPropertyName("Counselor Action")]
        public string CounselorAction { get; set; } = string.Empty;
    }

    public class AssessmentRules
    {
        [JsonPropertyName("Metric_Scoring_Rules")]
        public List<MetricScoringRule> MetricScoringRules { get; set; } = new();

        [JsonPropertyName("Student_Response_Template")]
        public List<CompactQuestionTemplate> StudentResponseTemplate { get; set; } = new();

        [JsonPropertyName("Permutation_AI_Rules")]
        public List<PermutationRule> PermutationAIRules { get; set; } = new();

        [JsonPropertyName("Timing_Bands")]
        public List<TimingBand> TimingBands { get; set; } = new();

        [JsonPropertyName("Scoring_Map")]
        public List<ScoringMapRule> ScoringMap { get; set; } = new();
    }
}
