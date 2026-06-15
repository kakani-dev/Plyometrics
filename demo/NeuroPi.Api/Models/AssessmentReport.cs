using System;

namespace NeuroPi.Api.Models
{
    public class AssessmentReport
    {
        public int Id { get; set; }
        public Guid SessionId { get; set; }
        public string ReportText { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public bool IsAiGenerated { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public AssessmentSession? Session { get; set; }
    }
}
