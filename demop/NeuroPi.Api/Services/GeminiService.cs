using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace NeuroPi.Api.Services
{
    public class GeminiReportResponse
    {
        public string ReportText { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public bool IsAiGenerated { get; set; }
    }

    public interface IGeminiService
    {
        Task<GeminiReportResponse> GenerateCounselingReportAsync(AssessmentResultsDto results, string customApiKey);
    }

    public class GeminiService : IGeminiService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public GeminiService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        public async Task<GeminiReportResponse> GenerateCounselingReportAsync(AssessmentResultsDto results, string customApiKey)
        {
            // Resolve API key: custom key > config key
            string apiKey = !string.IsNullOrEmpty(customApiKey) 
                ? customApiKey 
                : (_configuration["Gemini:ApiKey"] ?? string.Empty);

            if (string.IsNullOrEmpty(apiKey))
            {
                Console.WriteLine("[SYS] No API key provided. Generating high-fidelity offline report...");
                return new GeminiReportResponse
                {
                    ReportText = GenerateOfflineNarrative(results),
                    Source = "Offline Rules Engine (No API key provided)",
                    IsAiGenerated = false
                };
            }

            var prompt = BuildPrompt(results);

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var jsonString = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonString, Encoding.UTF8, "application/json");

            var client = _httpClientFactory.CreateClient();
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key={apiKey}";
            string usedSource = "Gemini 3.1 Pro";
            bool isAi = true;

            try
            {
                var response = await client.PostAsync(url, content);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errText = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"[SYS] Gemini 3.1 Pro failed (Status: {response.StatusCode}). Retrying with gemini-2.0-flash fallback...");
                    
                    var fallbackUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={apiKey}";
                    var fallbackResponse = await client.PostAsync(fallbackUrl, content);
                    
                    if (!fallbackResponse.IsSuccessStatusCode)
                    {
                        var fallbackErrText = await fallbackResponse.Content.ReadAsStringAsync();
                        Console.WriteLine($"[SYS] Both Gemini 3.1 Pro and Gemini 2.0 Flash failed due to quota/network constraints. Generating high-fidelity offline report...");
                        return new GeminiReportResponse
                        {
                            ReportText = GenerateOfflineNarrative(results),
                            Source = "Offline Rules Engine (API Key Quota Exceeded / TooManyRequests)",
                            IsAiGenerated = false
                        };
                    }
                    
                    response = fallbackResponse;
                    usedSource = "Gemini 2.0 Flash";
                }

                var responseString = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseString);
                
                // Navigate to candidates[0].content.parts[0].text
                var root = doc.RootElement;
                if (root.TryGetProperty("candidates", out var candidates) && 
                    candidates.GetArrayLength() > 0 &&
                    candidates[0].TryGetProperty("content", out var candidateContent) &&
                    candidateContent.TryGetProperty("parts", out var parts) &&
                    parts.GetArrayLength() > 0 &&
                    parts[0].TryGetProperty("text", out var textNode))
                {
                    return new GeminiReportResponse
                    {
                        ReportText = textNode.GetString() ?? "Empty response from Gemini.",
                        Source = usedSource,
                        IsAiGenerated = isAi
                    };
                }

                return new GeminiReportResponse
                {
                    ReportText = "Failed to parse Gemini API response structure.",
                    Source = usedSource,
                    IsAiGenerated = false
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SYS] Exception in AI service: {ex.Message}. Falling back to offline report...");
                return new GeminiReportResponse
                {
                    ReportText = GenerateOfflineNarrative(results),
                    Source = $"Offline Rules Engine (Exception: {ex.Message})",
                    IsAiGenerated = false
                };
            }
        }

        private string GenerateOfflineNarrative(AssessmentResultsDto r)
        {
            var sb = new StringBuilder();
            
            sb.AppendLine("[SECTION 1] Executive Summary & Holistic Analysis");
            sb.AppendLine($"The comprehensive psychometric profile of {r.StudentName} reveals a balanced alignment of core developmental traits. With a dominant interest vector of **{r.DominantVectors.DominantRIASEC}** (RIASEC Clarity: {r.CircularGauges.RiasecClarity}%), {r.StudentName} exhibits a defined vocational interest profile. This interest pattern combined with a dominant personality trait of **{r.DominantVectors.DominantBig5}** (Big Five Balance: {r.DominantVectors.BigFiveBalance}%) suggests a personality architecture that thrives in environments requiring structured tasks and clear communication. The cognitive capabilities show an overall Cognitive Index of {r.CircularGauges.CognitiveIndex}%, indicating solid aptitude in analytical reasoning. These metrics integrate into a high-potential developmental trajectory, indicating readiness for advanced academic challenges.");
            sb.AppendLine();
            
            sb.AppendLine("[SECTION 2] Cognitive Profile & Learning Modality Synthesis");
            sb.AppendLine($"Analysis of {r.StudentName}'s cognitive modules indicates specific learning tendencies. The student's dominant learning style is **{r.DominantVectors.DominantLearning}** (Preference Strength: {r.DominantVectors.LearningPreferenceStrength}%), which heavily influences how academic information is encoded and retrieved. To optimize academic performance, the following custom learning strategies are recommended: study mapping tools, visual models for abstract reasoning, and active verbal summarization. A structured schedule focusing on the numerical and spatial dimensions will help bridge any subdomain disparities.");
            sb.AppendLine();
            
            sb.AppendLine("[SECTION 3] Academic Stream & Career Mapping Trajectory");
            sb.AppendLine($"Based on CBSE stream recommendation heuristics, {r.StudentName} shows a strong fit for the **{r.StreamRecommendation.Stream}** academic path, with an estimated career-stream fit score of **{r.StreamRecommendation.CareerFitScore}%**. This recommendation maps directly to recommended subject combinations: {r.StreamRecommendation.Subjects}. We suggest exploring the following career pathways: professional careers aligning with {r.DominantVectors.DominantRIASEC} interests and stream specialties. Focused development of core competencies in these areas will yield high long-term career satisfaction.");
            sb.AppendLine();
            
            sb.AppendLine("[SECTION 4] Guided Counselor Interventions & Action Plans");
            sb.AppendLine($"The diagnostic system has evaluated {r.StudentName}'s attention-validity indices. The primary assessment alert is **{r.PrimaryAlert.AlertType}** ({r.PrimaryAlert.Description}). The primary counseling focus is to **{r.CounselorRoadmap.CounselorFocus}**. The action plan suggests: **{r.CounselorRoadmap.PermutationAction}**. The counselor should prioritize the following actions: ");
            foreach (var priority in r.CounselorRoadmap.Priorities)
            {
                sb.AppendLine($"- {priority}");
            }
            
            return sb.ToString();
        }

        private string BuildPrompt(AssessmentResultsDto r)
        {
            var sb = new StringBuilder();
            sb.AppendLine("You are a professional educational counselor and psychometric analyst.");
            sb.AppendLine("Please synthesize a comprehensive Counseling Narrative based on the student's assessment results below.");
            sb.AppendLine();
            sb.AppendLine($"[STUDENT DEMOGRAPHICS]");
            sb.AppendLine($"Name: {r.StudentName}");
            sb.AppendLine($"Grade: {r.Grade}");
            sb.AppendLine($"Assessment Mode: {r.Mode}");
            sb.AppendLine($"Profile Code Match: {r.ProfileCode}");
            sb.AppendLine();
            sb.AppendLine($"[CORE METRICS & INDEXES]");
            sb.AppendLine($"- Career Readiness: {r.CircularGauges.CareerReadiness}%");
            sb.AppendLine($"- RIASEC Clarity: {r.CircularGauges.RiasecClarity}%");
            sb.AppendLine($"- Cognitive Index: {r.CircularGauges.CognitiveIndex}%");
            sb.AppendLine($"- Emotional Sustainability: {r.CircularGauges.EmotionalSustainability}%");
            sb.AppendLine();
            sb.AppendLine($"[DOMINANT VECTOR ALIGNMENTS]");
            sb.AppendLine($"- Dominant RIASEC Interest: {r.DominantVectors.DominantRIASEC}");
            sb.AppendLine($"- Dominant Big Five Trait: {r.DominantVectors.DominantBig5} (Balance Index: {r.DominantVectors.BigFiveBalance}%)");
            sb.AppendLine($"- Dominant Learning Style: {r.DominantVectors.DominantLearning} (Preference Index: {r.DominantVectors.LearningPreferenceStrength}%)");
            sb.AppendLine();
            sb.AppendLine($"[PRIMARY ASSESSMENT ALERT]");
            sb.AppendLine($"Alert Type: {r.PrimaryAlert.AlertType}");
            sb.AppendLine($"Alert Description: {r.PrimaryAlert.Description}");
            sb.AppendLine();
            sb.AppendLine($"[COUNSELOR ROADMAP & ACTION GUIDE]");
            sb.AppendLine($"Primary Counselor Focus: {r.CounselorRoadmap.CounselorFocus}");
            sb.AppendLine($"Action Plan: {r.CounselorRoadmap.PermutationAction}");
            sb.AppendLine($"Priorities: {string.Join(", ", r.CounselorRoadmap.Priorities)}");
            sb.AppendLine();
            sb.AppendLine($"[ACADEMIC STREAM FIT RECOMMENDATION]");
            sb.AppendLine($"Recommended CBSE Stream: {r.StreamRecommendation.Stream}");
            sb.AppendLine($"Subjects mapping: {r.StreamRecommendation.Subjects}");
            sb.AppendLine($"Actions to build stream competency:");
            foreach (var act in r.StreamRecommendation.Actions)
            {
                sb.AppendLine($"- {act}");
            }
            sb.AppendLine($"Estimated career-stream fit score: {r.StreamRecommendation.CareerFitScore}%");
            sb.AppendLine();
            sb.AppendLine("[DIAGNOSTIC METRICS GRID (28 SUBDOMAINS)]");
            foreach (var m in r.Metrics)
            {
                sb.AppendLine($"- {m.Domain} -> {m.Subdomain} ({m.Code}): Score {m.Score0100}%, Avg Response Time {m.AvgTime}s, Flag {m.Flag}, Band {m.Band}");
                sb.AppendLine($"  Local Interpretation: {m.Interpretation}");
            }
            sb.AppendLine();
            sb.AppendLine("Please structure your response into EXACTLY 4 sections. Use double newlines to separate sections. Start each section with a clear heading: [SECTION 1], [SECTION 2], [SECTION 3], and [SECTION 4].");
            sb.AppendLine("Provide deep, personalized, professional counseling guidelines. Do not use generic placeholders. Incorporate the student's name and specific scores throughout the analysis.");
            sb.AppendLine();
            sb.AppendLine("Format the sections exactly as follows:");
            sb.AppendLine();
            sb.AppendLine("[SECTION 1] Executive Summary & Holistic Analysis: Provide a deep-dive psychometric integration of the student's profile. Link the dominant interests, cognitive strengths, and personality traits into a cohesive summary of their potential.");
            sb.AppendLine();
            sb.AppendLine("[SECTION 2] Cognitive Profile & Learning Modality Synthesis: Explain how their learning style preference (e.g. Visual/Auditory/Kinesthetic) interacts with their cognitive capabilities. Detail specific study strategies, classroom modifications, and memory-mapping exercises.");
            sb.AppendLine();
            sb.AppendLine("[SECTION 3] Academic Stream & Career Mapping Trajectory: Discuss the recommended stream (PCB, PCM, Commerce, or Humanities) and explain the career fit score. Suggest 3-4 specific career pathways aligned with their interests.");
            sb.AppendLine();
            sb.AppendLine("[SECTION 4] Guided Counselor Interventions & Action Plans: Write a detailed action guide for a counselor or teacher working with this student. Address any alerts (such as fatigue or stress) and list specific classroom, study habit, or routine goals.");

            return sb.ToString();
        }
    }
}
