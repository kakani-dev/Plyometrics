using Microsoft.AspNetCore.Mvc;
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

        public AssessmentController(IAssessmentService assessmentService, IGeminiService geminiService)
        {
            _assessmentService = assessmentService;
            _geminiService = geminiService;
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

                return Ok(new
                {
                    nextQuestion = nextQ,
                    isCompleted = nextQ == null,
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

        [HttpPost("ai-report")]
        public async Task<IActionResult> GenerateAiReport([FromBody] AiReportRequest request)
        {
            try
            {
                var results = await _assessmentService.CompileResultsAsync(request.SessionId);
                var response = await _geminiService.GenerateCounselingReportAsync(results, request.ApiKey);
                return Ok(response);
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Session {request.SessionId} not found.");
            }
            catch (Exception ex)
            {
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
