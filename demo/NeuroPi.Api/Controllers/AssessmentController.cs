using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeuroPi.Api.Data;
using NeuroPi.Api.Models;
using NeuroPi.Api.Services;
using System;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace NeuroPi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssessmentController : ControllerBase
    {
        private readonly IAssessmentService _assessmentService;
        private readonly IGeminiService _geminiService;
        private readonly AssessmentDbContext _context;

        public AssessmentController(IAssessmentService assessmentService, IGeminiService geminiService, AssessmentDbContext context)
        {
            _assessmentService = assessmentService;
            _geminiService = geminiService;
            _context = context;
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartSession([FromBody] StartSessionRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.StudentName))
            {
                return BadRequest("Student name is required.");
            }

            try
            {
                var session = await _assessmentService.StartSessionAsync(
                    request.StudentName, request.Grade, "adaptive", request.ApiKey,
                    request.DifficultyTypes, request.DifficultyRatios, request.QuestionsPerSubdomain,
                    request.TestTypeServiceId, request.TenantId);

                var firstQuestion = await _assessmentService.GetNextQuestionAsync(session.Id);

                int totalQ = 27 * session.QuestionsPerSubdomain + 3;

                return Ok(new
                {
                    sessionId = session.Id,
                    studentName = session.StudentName,
                    firstQuestion = firstQuestion,
                    totalQuestions = totalQ,
                    difficultyTypes = session.DifficultyTypes,
                    difficultyRatios = session.DifficultyRatios,
                    cognitiveDifficultyState = session.CognitiveDifficultyState
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitAnswer([FromBody] SubmitAnswerRequest request)
        {
            try
            {
                var nextQ = await _assessmentService.SubmitAnswerAsync(
                    request.SessionId, request.QID, request.ResponseValue, request.TimeSec);

                var session = await _assessmentService.GetSessionAsync(request.SessionId);
                var isCompleted = nextQ == null;

                if (isCompleted)
                {
                    var existingReport = await _context.Reports
                        .FirstOrDefaultAsync(r => r.SessionId == request.SessionId);

                    if (existingReport?.IsAiGenerated != true)
                    {
                        var results = await _assessmentService.CompileResultsAsync(request.SessionId);
                        var response = await _geminiService.GenerateCounselingReportAsync(results, session?.ApiKey ?? string.Empty);

                        if (response.IsAiGenerated)
                        {
                            if (existingReport != null)
                                _context.Reports.Remove(existingReport);

                            var report = new AssessmentReport
                            {
                                SessionId = request.SessionId,
                                ReportText = response.ReportText,
                                Source = response.Source,
                                IsAiGenerated = response.IsAiGenerated,
                                CreatedAt = DateTime.UtcNow
                            };
                            _context.Reports.Add(report);
                            await _context.SaveChangesAsync();
                        }
                        else if (existingReport == null)
                        {
                            var report = new AssessmentReport
                            {
                                SessionId = request.SessionId,
                                ReportText = response.ReportText,
                                Source = response.Source,
                                IsAiGenerated = response.IsAiGenerated,
                                CreatedAt = DateTime.UtcNow
                            };
                            _context.Reports.Add(report);
                            await _context.SaveChangesAsync();
                        }
                    }
                }

                return Ok(new
                {
                    nextQuestion = nextQ,
                    isCompleted = isCompleted,
                    cognitiveDifficultyState = session?.CognitiveDifficultyState
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("results/{sessionId}")]
        public async Task<IActionResult> GetResults(Guid sessionId)
        {
            try
            {

                var results = await _assessmentService.CompileResultsAsync(sessionId);

                return Ok(results);
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Session {sessionId} not found.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("report/{sessionId}")]
        public async Task<IActionResult> GetReport(Guid sessionId)
        {
            try
            {
                var report = await _context.Reports
                    .FirstOrDefaultAsync(r => r.SessionId == sessionId);
                if (report == null)
                    return NotFound("No report found for this session.");

                return Ok(new GeminiReportResponse
                {
                    ReportText = report.ReportText,
                    Source = report.Source,
                    IsAiGenerated = report.IsAiGenerated
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("ai-report")]
        public async Task<IActionResult> GetSavedReport([FromBody] AiReportRequest request)
        {
            try
            {
                var report = await _context.Reports
                    .FirstOrDefaultAsync(r => r.SessionId == request.SessionId);
                if (report == null)
                {
                    Console.WriteLine($"[ai-report] Session {request.SessionId}: No report found.");
                    return NotFound("No report found. Complete the assessment first.");
                }

                Console.WriteLine($"[ai-report] Session {request.SessionId}: Source=\"{report.Source}\", IsAiGenerated={report.IsAiGenerated}, TextLength={report.ReportText?.Length ?? 0}");

                return Ok(new GeminiReportResponse
                {
                    ReportText = report.ReportText ?? string.Empty,
                    Source = report.Source ?? string.Empty,
                    IsAiGenerated = report.IsAiGenerated
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ai-report] Session {request.SessionId}: Exception: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("mock-demo/{sessionId}")]
        public async Task<IActionResult> PopulateMockDemo(Guid sessionId)
        {
            try
            {
                var success = await _assessmentService.PopulateDemoResponsesAsync(sessionId);
                if (!success)
                {
                    return BadRequest("Failed to populate mock responses. Session may already be completed or not exist.");
                }

                var results = await _assessmentService.CompileResultsAsync(sessionId);
                return Ok(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            try
            {
                var history = await _assessmentService.GetHistoryAsync();
                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("questions")]
        public IActionResult GetQuestions()
        {
            try
            {
                var qs = _assessmentService.GetQuestions();
                return Ok(qs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("grades")]
        public async Task<IActionResult> GetGrades()
        {
            try
            {
                var list = await _assessmentService.GetGradesAsync();
                var grades = list.Select(g => new { Value = g, Label = $"Grade {g}" }).ToArray();
                return Ok(grades);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class StartSessionRequest
    {
        public string StudentName { get; set; } = string.Empty;
        public string Grade { get; set; } = "10";
        public string ApiKey { get; set; } = string.Empty;
        public string DifficultyTypes { get; set; } = "Easy,Medium,Hard";
        public string DifficultyRatios { get; set; } = "33,34,33";
        public int QuestionsPerSubdomain { get; set; } = 3;
        public int TestTypeServiceId { get; set; } = 1;
        public int TenantId { get; set; } = 1;
    }

    public class SubmitAnswerRequest
    {
        public Guid SessionId { get; set; }
        public string QID { get; set; } = string.Empty;
        public string ResponseValue { get; set; } = string.Empty;
        public int TimeSec { get; set; }
    }

    public class AiReportRequest
    {
        public Guid SessionId { get; set; }
        public string ApiKey { get; set; } = string.Empty;
    }
}
