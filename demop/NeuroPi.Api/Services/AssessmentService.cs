using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using NeuroPi.Api.Data;
using NeuroPi.Api.Models;

namespace NeuroPi.Api.Services
{
    public interface IAssessmentService
    {
        Task InitializeAsync();
        List<Question> GetQuestions();
        AssessmentRules GetRules();
        Task<AssessmentSession> StartSessionAsync(string studentName, string grade, string mode, string apiKey);
        Task<Question?> GetNextQuestionAsync(Guid sessionId);
        Task<Question?> SubmitAnswerAsync(Guid sessionId, string qid, string responseValue, int timeSec);
        Task<AssessmentResultsDto> CompileResultsAsync(Guid sessionId);
        Task<bool> PopulateDemoResponsesAsync(Guid sessionId);
        Task<List<AssessmentSession>> GetHistoryAsync();
    }

    public class AssessmentService : IAssessmentService
    {
        private readonly AssessmentDbContext _context;
        private readonly IHostEnvironment _env;

        private static AssessmentRules _rules = new();
        private static readonly object _lock = new();

        // 27 Metrics List (Validity is processed interspersed)
        private static readonly List<(string Domain, string Subdomain, string Code)> METRIC_DEFINITIONS = new()
        {
            ("RIASEC Interest", "Realistic", "R"),
            ("RIASEC Interest", "Investigative", "I"),
            ("RIASEC Interest", "Artistic", "A"),
            ("RIASEC Interest", "Social", "S"),
            ("RIASEC Interest", "Enterprising", "E"),
            ("RIASEC Interest", "Conventional", "C"),
            
            ("Big Five Personality", "Openness", "Openness"),
            ("Big Five Personality", "Conscientiousness", "Conscientiousness"),
            ("Big Five Personality", "Extraversion", "Extraversion"),
            ("Big Five Personality", "Agreeableness", "Agreeableness"),
            ("Big Five Personality", "Neuroticism", "Neuroticism"),
            
            ("Cognitive Ability", "Numerical", "Numerical"),
            ("Cognitive Ability", "Logic", "Logic"),
            ("Cognitive Ability", "Verbal", "Verbal"),
            ("Cognitive Ability", "Abstract", "Abstract"),
            ("Cognitive Ability", "Spatial", "Spatial"),
            
            ("Emotional Profile", "Stress", "Stress"),
            ("Emotional Profile", "Confidence", "Confidence"),
            ("Emotional Profile", "Resilience", "Resilience"),
            ("Emotional Profile", "Coping", "Coping"),
            
            ("Learning Style", "Visual", "Visual"),
            ("Learning Style", "Auditory", "Auditory"),
            ("Learning Style", "Kinesthetic", "Kinesthetic"),
            ("Learning Style", "ReadingWriting", "ReadingWriting"),
            
            ("Additional NeuroPi Indicators", "Motivation", "Motivation"),
            ("Additional NeuroPi Indicators", "StudyHabits", "StudyHabits"),
            ("Additional NeuroPi Indicators", "CareerClarity", "CareerClarity")
        };

        public AssessmentService(AssessmentDbContext context, IHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task InitializeAsync()
        {
            // Resolve file paths
            string rootPath = _env.ContentRootPath;
            string qPath = Path.Combine(rootPath, "questions.json");
            string rPath = Path.Combine(rootPath, "rules.json");

            if (!File.Exists(qPath))
            {
                qPath = Path.Combine(Directory.GetParent(rootPath)?.FullName ?? "", "questions.json");
            }
            if (!File.Exists(rPath))
            {
                rPath = Path.Combine(Directory.GetParent(rootPath)?.FullName ?? "", "rules.json");
            }

            // Check if the Questions table exists/is queryable. If not, recreate database
            try
            {
                _ = await _context.Questions.AnyAsync();
            }
            catch (Exception)
            {
                await _context.Database.EnsureDeletedAsync();
                await _context.Database.EnsureCreatedAsync();
            }

            // Seed questions in SQLite database if empty
            if (!await _context.Questions.AnyAsync())
            {
                if (File.Exists(qPath))
                {
                    var json = File.ReadAllText(qPath);
                    var questions = JsonSerializer.Deserialize<List<Question>>(json) ?? new();
                    await _context.Questions.AddRangeAsync(questions);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    throw new FileNotFoundException("questions.json could not be found.");
                }
            }

            // Load rules in memory
            if (_rules.StudentResponseTemplate == null || !_rules.StudentResponseTemplate.Any())
            {
                lock (_lock)
                {
                    if (_rules.StudentResponseTemplate == null || !_rules.StudentResponseTemplate.Any())
                    {
                        if (File.Exists(rPath))
                        {
                            var json = File.ReadAllText(rPath);
                            _rules = JsonSerializer.Deserialize<AssessmentRules>(json) ?? new();
                        }
                        else
                        {
                            throw new FileNotFoundException("rules.json could not be found.");
                        }
                    }
                }
            }
        }

        public List<Question> GetQuestions()
        {
            InitializeAsync().GetAwaiter().GetResult();
            return _context.Questions.ToList();
        }
        public AssessmentRules GetRules() => _rules;

        public async Task<AssessmentSession> StartSessionAsync(string studentName, string grade, string mode, string apiKey)
        {
            await InitializeAsync();

            var session = new AssessmentSession
            {
                StudentName = studentName,
                Grade = grade,
                Mode = mode.ToLower(),
                ApiKey = apiKey,
                StartTime = DateTime.UtcNow,
                CognitiveDifficultyState = "Logic:Medium,Numerical:Medium,Verbal:Medium,Abstract:Medium,Spatial:Medium"
            };

            _context.Sessions.Add(session);
            await _context.SaveChangesAsync();
            return session;
        }

        public async Task<Question?> GetNextQuestionAsync(Guid sessionId)
        {
            await InitializeAsync();

            var session = await _context.Sessions
                .Include(s => s.Responses)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null || session.IsCompleted) return null;

            if (session.Mode == "compact")
            {
                var template = _rules.StudentResponseTemplate;
                if (session.CompactIndex >= template.Count)
                {
                    session.IsCompleted = true;
                    session.EndTime = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    return null;
                }

                var templateQ = template[session.CompactIndex];
                var question = await _context.Questions.FirstOrDefaultAsync(q => q.QID == templateQ.AssessmentQID);
                return question;
            }
            else // Adaptive Mode
            {
                var totalAnswered = session.Responses.Count;

                // 1. Interspersed Attention Validity checks
                if (session.ValidityStep == 0 && totalAnswered >= 18)
                {
                    return await GetValidityCheckQuestionAsync(session, 0);
                }
                else if (session.ValidityStep == 1 && totalAnswered >= 36)
                {
                    return await GetValidityCheckQuestionAsync(session, 1);
                }
                else if (session.ValidityStep == 2 && totalAnswered >= 54)
                {
                    return await GetValidityCheckQuestionAsync(session, 2);
                }

                // 2. Main adaptive metrics loop
                if (session.CurrentMetricIndex >= METRIC_DEFINITIONS.Count)
                {
                    session.IsCompleted = true;
                    session.EndTime = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    return null;
                }

                var currentMetric = METRIC_DEFINITIONS[session.CurrentMetricIndex];
                var subdomainQuestions = await _context.Questions.Where(q => 
                    q.Domain == currentMetric.Domain && 
                    q.Subdomain == currentMetric.Subdomain).ToListAsync();

                Question? selectedQ = null;
                var askedQids = session.Responses.Select(r => r.QID).ToHashSet();

                if (currentMetric.Domain == "Cognitive Ability")
                {
                    var diffState = GetCognitiveDifficulty(session.CognitiveDifficultyState, currentMetric.Subdomain);
                    
                    // Partition cognitive questions: Easy (0-6), Medium (7-13), Hard (14-19)
                    List<Question> diffPool;
                    if (diffState == "Easy")
                    {
                        diffPool = subdomainQuestions.Take(7).ToList();
                    }
                    else if (diffState == "Medium")
                    {
                        diffPool = subdomainQuestions.Skip(7).Take(7).ToList();
                    }
                    else // Hard
                    {
                        diffPool = subdomainQuestions.Skip(14).Take(6).ToList();
                    }

                    selectedQ = diffPool.FirstOrDefault(q => !askedQids.Contains(q.QID));
                    if (selectedQ == null)
                    {
                        selectedQ = subdomainQuestions.FirstOrDefault(q => !askedQids.Contains(q.QID));
                    }
                }
                else
                {
                    selectedQ = subdomainQuestions.FirstOrDefault(q => !askedQids.Contains(q.QID));
                }

                if (selectedQ == null)
                {
                    // If pool exhausted, move to next metric
                    session.CurrentMetricIndex++;
                    session.CurrentQuestionIndex = 0;
                    _context.Sessions.Update(session);
                    await _context.SaveChangesAsync();
                    return await GetNextQuestionAsync(sessionId);
                }

                return selectedQ;
            }
        }

        private async Task<Question?> GetValidityCheckQuestionAsync(AssessmentSession session, int stepIndex)
        {
            var askedQids = session.Responses.Select(r => r.QID).ToHashSet();
            var validityPool = await _context.Questions.Where(q => q.Domain == "Validity & Readiness").ToListAsync();
            var valQ = validityPool.FirstOrDefault(q => !askedQids.Contains(q.QID));
            return valQ;
        }

        public async Task<Question?> SubmitAnswerAsync(Guid sessionId, string qid, string responseValue, int timeSec)
        {
            await InitializeAsync();

            var session = await _context.Sessions
                .Include(s => s.Responses)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null || session.IsCompleted) return null;

            // Look up question details
            var question = await _context.Questions.FirstOrDefaultAsync(q => q.QID == qid);
            if (question == null) return null;

            var isReverse = question.ReverseScored.Equals("Yes", StringComparison.OrdinalIgnoreCase);

            var dbResponse = new StudentResponse
            {
                SessionId = sessionId,
                QID = qid,
                Domain = question.Domain,
                Subdomain = question.Subdomain,
                QuestionType = question.QuestionType,
                ResponseValue = responseValue,
                TimeSec = timeSec,
                ReverseScored = isReverse,
                CorrectKey = question.CorrectKey,
                Difficulty = question.Difficulty,
                Timestamp = DateTime.UtcNow
            };

            _context.Responses.Add(dbResponse);
            session.Responses.Add(dbResponse);

            if (session.Mode == "compact")
            {
                session.CompactIndex++;
            }
            else // Adaptive Mode
            {
                if (question.Domain == "Validity & Readiness")
                {
                    // Validate check consistency
                    bool passed = true;
                    if (qid == "AQ082" || qid == "NPI0516" || qid == "NPI0517")
                    {
                        if (int.TryParse(responseValue, out int val) && val < 4) passed = false;
                    }
                    else if (qid == "AQ084" || qid == "NPI0518" || qid == "NPI0519")
                    {
                        if (int.TryParse(responseValue, out int val) && val > 2) passed = false;
                    }

                    if (!passed)
                    {
                        session.ValidityFails++;
                    }
                    session.ValidityStep++;
                }
                else
                {
                    var currentMetric = METRIC_DEFINITIONS[session.CurrentMetricIndex];

                    // Cognitive diff adjustment
                    if (question.Domain == "Cognitive Ability")
                    {
                        bool isCorrect = responseValue.Equals(question.CorrectKey, StringComparison.OrdinalIgnoreCase);
                        var currentDiff = GetCognitiveDifficulty(session.CognitiveDifficultyState, currentMetric.Subdomain);
                        
                        string nextDiff = currentDiff;
                        if (isCorrect)
                        {
                            if (currentDiff == "Medium") nextDiff = "Hard";
                            else if (currentDiff == "Easy") nextDiff = "Medium";
                        }
                        else
                        {
                            if (currentDiff == "Medium") nextDiff = "Easy";
                            else if (currentDiff == "Hard") nextDiff = "Medium";
                        }

                        session.CognitiveDifficultyState = UpdateCognitiveDifficulty(session.CognitiveDifficultyState, currentMetric.Subdomain, nextDiff);
                    }

                    session.CurrentQuestionIndex++;

                    // Early bypassing check for Likert (non-cognitive)
                    bool shouldProceedToNextMetric = false;
                    if (question.Domain == "Cognitive Ability")
                    {
                        if (session.CurrentQuestionIndex >= 3)
                        {
                            shouldProceedToNextMetric = true;
                        }
                    }
                    else
                    {
                        var subdomainResponses = session.Responses.Where(r => r.Subdomain == currentMetric.Subdomain).ToList();
                        
                        // We check hesitation (>18s) in responses
                        bool hasHesitation = subdomainResponses.Any(r => r.TimeSec > 18);

                        if (session.CurrentQuestionIndex >= 3)
                        {
                            shouldProceedToNextMetric = true;
                        }
                        else if (session.CurrentQuestionIndex == 2)
                        {
                            if (!hasHesitation && subdomainResponses.Count >= 2)
                            {
                                // Check consistency
                                var firstScore = CalculateResponseScore(subdomainResponses[0]);
                                var secondScore = CalculateResponseScore(subdomainResponses[1]);

                                bool isConsistentHigh = firstScore >= 75 && secondScore >= 75;
                                bool isConsistentLow = firstScore <= 25 && secondScore <= 25;
                                bool isConsistentNeutral = firstScore == 50 && secondScore == 50;

                                if (isConsistentHigh || isConsistentLow || isConsistentNeutral)
                                {
                                    shouldProceedToNextMetric = true;
                                    session.SavedQuestionsCount++;
                                }
                            }
                        }
                    }

                    if (shouldProceedToNextMetric)
                    {
                        session.CurrentMetricIndex++;
                        session.CurrentQuestionIndex = 0;
                    }
                }
            }

            _context.Sessions.Update(session);
            await _context.SaveChangesAsync();

            return await GetNextQuestionAsync(sessionId);
        }

        private static string GetCognitiveDifficulty(string state, string subdomain)
        {
            var parts = state.Split(',');
            foreach (var part in parts)
            {
                var kv = part.Split(':');
                if (kv.Length == 2 && kv[0] == subdomain)
                {
                    return kv[1];
                }
            }
            return "Medium";
        }

        private static string UpdateCognitiveDifficulty(string state, string subdomain, string nextDiff)
        {
            var parts = state.Split(',').ToList();
            for (int i = 0; i < parts.Count; i++)
            {
                var kv = parts[i].Split(':');
                if (kv.Length == 2 && kv[0] == subdomain)
                {
                    parts[i] = $"{subdomain}:{nextDiff}";
                    break;
                }
            }
            return string.Join(",", parts);
        }

        private static double CalculateResponseScore(StudentResponse r)
        {
            if (r.QuestionType == "Likert")
            {
                if (int.TryParse(r.ResponseValue, out int val))
                {
                    int adjVal = r.ReverseScored ? (6 - val) : val;
                    return ((adjVal - 1) / 4.0) * 100.0;
                }
                return 50.0;
            }
            else // MCQ
            {
                return r.ResponseValue.Equals(r.CorrectKey, StringComparison.OrdinalIgnoreCase) ? 100.0 : 0.0;
            }
        }

        public async Task<AssessmentResultsDto> CompileResultsAsync(Guid sessionId)
        {
            await InitializeAsync();

            var session = await _context.Sessions
                .Include(s => s.Responses)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null) throw new KeyNotFoundException("Session not found.");

            // 1. Compile 28 subdomains
            var metricsMap = new Dictionary<string, MetricDiagnosticDto>();
            
            // We use the 28 subdomains including Validity
            var allSubdomainDefs = METRIC_DEFINITIONS.Select(m => (m.Domain, m.Subdomain, m.Code)).ToList();
            allSubdomainDefs.Add(("Validity & Readiness", "Validity", "Validity"));

            foreach (var def in allSubdomainDefs)
            {
                metricsMap[def.Subdomain] = new MetricDiagnosticDto
                {
                    Domain = def.Domain,
                    Subdomain = def.Subdomain,
                    Code = def.Code,
                    Scores = new List<double>(),
                    Times = new List<int>(),
                    HighTimeCount = 0,
                    Score0100 = 50,
                    Band = "Moderate",
                    AvgTime = 0,
                    Flag = "OK",
                    Interpretation = ""
                };
            }

            // Populate with actual responses
            foreach (var resp in session.Responses)
            {
                if (metricsMap.TryGetValue(resp.Subdomain, out var metric))
                {
                    double score = CalculateResponseScore(resp);
                    metric.Scores.Add(score);
                    metric.Times.Add(resp.TimeSec);

                    // Track high times
                    var tb = _rules.TimingBands.FirstOrDefault(b => b.QuestionType == resp.QuestionType && b.Difficulty == resp.Difficulty);
                    double limitHigh = tb != null && double.TryParse(tb.HighTimeReviewAboveSec, out double maxH) ? maxH : (resp.QuestionType == "Likert" ? 18 : 45);
                    
                    if (resp.TimeSec > limitHigh)
                    {
                        metric.HighTimeCount++;
                    }
                }
            }

            // Average and normalize
            foreach (var key in metricsMap.Keys)
            {
                var m = metricsMap[key];
                if (m.Scores.Any())
                {
                    m.Score0100 = (int)Math.Round(m.Scores.Average());
                    m.AvgTime = Math.Round(m.Times.Average(), 1);
                }
                else
                {
                    // Inherit defaults
                    m.Score0100 = 50;
                    m.AvgTime = 5;
                }

                // Bands
                if (m.Score0100 < 40) m.Band = "Low";
                else if (m.Score0100 < 70) m.Band = "Moderate";
                else m.Band = "High";

                // Flags
                if (m.HighTimeCount >= 2) m.Flag = "Timing Review";
                else if (m.Score0100 < 40) m.Flag = "Support Needed";
                else m.Flag = "OK";

                // Get interpretation
                var mapRow = _rules.ScoringMap.FirstOrDefault(row => 
                    row.Subdomain.Equals(m.Code, StringComparison.OrdinalIgnoreCase) ||
                    row.Subdomain.Equals(m.Subdomain, StringComparison.OrdinalIgnoreCase));

                if (mapRow != null)
                {
                    if (m.Band == "Low") m.Interpretation = mapRow.LowInterpretation;
                    else if (m.Band == "Moderate") m.Interpretation = mapRow.ModerateInterpretation;
                    else m.Interpretation = mapRow.HighInterpretation;
                }
                else
                {
                    m.Interpretation = $"{m.Subdomain} developmental and cognitive metrics index.";
                }
            }

            // 2. Identify Dominant vectors
            // Dominant RIASEC
            var riasecKeys = new[] { "Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional" };
            string dominantRiasec = "Realistic";
            double maxRiasecScore = -1;
            double minRiasecTime = 99999;
            foreach (var k in riasecKeys)
            {
                var m = metricsMap[k];
                if (m.Score0100 > maxRiasecScore || (m.Score0100 == maxRiasecScore && m.AvgTime < minRiasecTime))
                {
                    maxRiasecScore = m.Score0100;
                    dominantRiasec = k;
                    minRiasecTime = m.AvgTime;
                }
            }

            // Dominant Big Five
            var big5Keys = new[] { "Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism" };
            string dominantBig5 = "Openness";
            double maxBig5Score = -1;
            double minBig5Time = 99999;
            foreach (var k in big5Keys)
            {
                var m = metricsMap[k];
                if (m.Score0100 > maxBig5Score || (m.Score0100 == maxBig5Score && m.AvgTime < minBig5Time))
                {
                    maxBig5Score = m.Score0100;
                    dominantBig5 = k;
                    minBig5Time = m.AvgTime;
                }
            }

            // Dominant Learning Style
            var learnKeys = new[] { "Visual", "Auditory", "Kinesthetic", "ReadingWriting" };
            string dominantLearning = "Visual";
            double maxLearnScore = -1;
            double minLearnTime = 99999;
            foreach (var k in learnKeys)
            {
                var m = metricsMap[k];
                if (m.Score0100 > maxLearnScore || (m.Score0100 == maxLearnScore && m.AvgTime < minLearnTime))
                {
                    maxLearnScore = m.Score0100;
                    dominantLearning = k;
                    minLearnTime = m.AvgTime;
                }
            }

            // Cognitive Average
            var cogKeys = new[] { "Numerical", "Logic", "Verbal", "Abstract", "Spatial" };
            double cogAvg = cogKeys.Average(k => metricsMap[k].Score0100);
            string cogBand = "Low";
            if (cogAvg >= 40 && cogAvg < 70) cogBand = "Moderate";
            else if (cogAvg >= 70) cogBand = "High";

            // Emotional Average
            double emotionalAvg = (metricsMap["Confidence"].Score0100 + 
                                   metricsMap["Resilience"].Score0100 + 
                                   metricsMap["Coping"].Score0100 + 
                                   (100 - metricsMap["Stress"].Score0100)) / 4.0;
            string emoBand = "Low";
            if (emotionalAvg >= 40 && emotionalAvg < 70) emoBand = "Moderate";
            else if (emotionalAvg >= 70) emoBand = "High";

            // Aggregate score metrics
            int b5Balance = (int)Math.Round(big5Keys.Average(k => k == "Neuroticism" ? (100 - metricsMap[k].Score0100) : metricsMap[k].Score0100));
            int learningFit = metricsMap[dominantLearning].Score0100;

            // 3. Match 1080 Permutations
            var matchedPerm = _rules.PermutationAIRules.FirstOrDefault(p => 
                p.RiasecDominant.Equals(dominantRiasec, StringComparison.OrdinalIgnoreCase) &&
                p.Big5Dominant.Equals(dominantBig5, StringComparison.OrdinalIgnoreCase) &&
                p.CognitiveBand.Equals(cogBand, StringComparison.OrdinalIgnoreCase) &&
                p.EmotionalBand.Equals(emoBand, StringComparison.OrdinalIgnoreCase) &&
                p.LearningStyle.Equals(dominantLearning, StringComparison.OrdinalIgnoreCase));

            if (matchedPerm == null)
            {
                matchedPerm = _rules.PermutationAIRules.FirstOrDefault() ?? new PermutationRule
                {
                    ProfileCode = "NP-P0001",
                    AIInterpretation = "Default local interpretation profile.",
                    RecommendedAction = "Verify all metrics for consistency.",
                    CounselorFlag = "Followup, Support",
                    Priority = "Medium"
                };
            }

            // Save matched profile code back to session
            session.ProfileCode = matchedPerm.ProfileCode;
            _context.Sessions.Update(session);
            await _context.SaveChangesAsync();

            // 4. Recommended CBSE Academic Stream
            double realistic = metricsMap["Realistic"].Score0100;
            double investigative = metricsMap["Investigative"].Score0100;
            double conventional = metricsMap["Conventional"].Score0100;
            double enterprising = metricsMap["Enterprising"].Score0100;
            double artistic = metricsMap["Artistic"].Score0100;
            double social = metricsMap["Social"].Score0100;

            double logic = metricsMap["Logic"].Score0100;
            double numerical = metricsMap["Numerical"].Score0100;
            double verbal = metricsMap["Verbal"].Score0100;

            double scienceWeight = (realistic * 0.25) + (investigative * 0.35) + (logic * 0.20) + (numerical * 0.20);
            double commerceWeight = (conventional * 0.35) + (enterprising * 0.35) + (numerical * 0.30);
            double humanitiesWeight = (artistic * 0.35) + (social * 0.35) + (verbal * 0.30);

            string recommendedStream = "Humanities & Liberal Arts";
            string recommendedSubjects = "History, Political Science, Psychology, Sociology, Literature / English";
            List<string> streamActions = new()
            {
                "Develop strong reading comprehension, narrative analysis, and creative/essay writing.",
                "Participate in public speaking, MUNs, and social outreach programs to build verbal clarity.",
                "Target career opportunities in Law, Journalism, Psychology, Design, and Civil Services."
            };

            if (scienceWeight >= commerceWeight && scienceWeight >= humanitiesWeight)
            {
                if (investigative > realistic)
                {
                    recommendedStream = "Science (PCB - Medical/Life Sciences)";
                    recommendedSubjects = "Physics, Chemistry, Biology, Biotechnology, English (Optional: Psychology)";
                    streamActions = new()
                    {
                        "Focus heavily on descriptive biology concepts, cell models, and scientific research.",
                        "Practice structured notes diagrams and concept-mapping to retain complex botanical/zoological systems.",
                        "Build test-taking stamina and analytical application skills for medical entrance exams."
                    };
                }
                else
                {
                    recommendedStream = "Science (PCM - Engineering/Technology)";
                    recommendedSubjects = "Physics, Chemistry, Mathematics, Computer Science (Optional: Economics)";
                    streamActions = new()
                    {
                        "Strengthen mathematical foundations and practice structured numerical derivations daily.",
                        "Participate in practical projects like coding, electronics, or robotics to apply physics.",
                        "Solve complex multi-step logical problems to prepare for engineering/technology streams."
                    };
                }
            }
            else if (commerceWeight >= scienceWeight && commerceWeight >= humanitiesWeight)
            {
                recommendedStream = "Commerce (with Mathematics / Applied Math)";
                recommendedSubjects = "Accountancy, Business Studies, Economics, Mathematics / Entrepreneurship";
                streamActions = new()
                {
                    "Develop strong numerical reasoning, spreadsheet analysis, and logical accounting principles.",
                    "Read business case studies, startup biographies, and basic financial news regularly.",
                    "Participate in mock business pitch sessions, financial planning tasks, or business fests."
                };
            }

            // Key composite gauges
            double riasecClarity = riasecKeys.Max(k => metricsMap[k].Score0100);
            double careerClarityScore = metricsMap["CareerClarity"].Score0100;
            int careerReadiness = (int)Math.Round((riasecClarity + emotionalAvg + careerClarityScore) / 3.0);
            int careerFitScore = (int)Math.Round((riasecClarity * 0.35) + (cogAvg * 0.25) + (b5Balance * 0.20) + (emotionalAvg * 0.20));

            // Alerts calculation
            string alertType = "No major alert";
            string alertDesc = "Assessment profile registers balanced developmental trends. Validity checks are stable.";
            string alertClass = "alert-success";

            if (session.Mode == "adaptive" && session.ValidityFails >= 2)
            {
                alertType = "Attention consistency review";
                alertDesc = "The student failed multiple interspersed consistency checks, indicating rushing, distraction, or potential fatigue. Review details with caution.";
                alertClass = "alert-danger";
            }
            else if (metricsMap["Stress"].Score0100 > 70)
            {
                alertType = "High stress sensitivity";
                alertDesc = "The student's emotional index shows high stress susceptibility. Counselor focus should prioritize emotional safety and pressure reduction.";
                alertClass = "alert-danger";
            }
            else if (metricsMap["StudyHabits"].Score0100 < 40)
            {
                alertType = "Low study consistency";
                alertDesc = "Study habits metrics indicate a significant lack of regular routines, notes organization, and planning. Structured routines support is highly recommended.";
                alertClass = "alert-warning";
            }
            else if (metricsMap["CareerClarity"].Score0100 < 40)
            {
                alertType = "Career confusion";
                alertDesc = "Low career clarity metrics suggest high uncertainty regarding interests and career mapping. Systematic stream options mapping is recommended.";
                alertClass = "alert-warning";
            }

            string counselorFocus = "Strengths confirmation and growth plan";
            if (alertType == "High stress sensitivity") counselorFocus = "Emotional safety and pressure management";
            else if (alertType == "Low study consistency") counselorFocus = "Study routine and accountability";
            else if (alertType == "Career confusion") counselorFocus = "Exploration and stream mapping";

            var results = new AssessmentResultsDto
            {
                SessionId = session.Id,
                StudentName = session.StudentName,
                Grade = session.Grade,
                Mode = session.Mode,
                ProfileCode = matchedPerm.ProfileCode,
                IsCompleted = session.IsCompleted,
                
                CircularGauges = new CircularGaugesDto
                {
                    CareerReadiness = careerReadiness,
                    RiasecClarity = (int)riasecClarity,
                    CognitiveIndex = (int)Math.Round(cogAvg),
                    EmotionalSustainability = (int)Math.Round(emotionalAvg)
                },
                
                DominantVectors = new DominantVectorsDto
                {
                    DominantRIASEC = dominantRiasec,
                    DominantBig5 = dominantBig5,
                    DominantLearning = dominantLearning,
                    BigFiveBalance = b5Balance,
                    LearningPreferenceStrength = learningFit
                },

                PrimaryAlert = new AlertDto
                {
                    AlertType = alertType,
                    Description = alertDesc,
                    AlertClass = alertClass
                },

                CounselorRoadmap = new CounselorRoadmapDto
                {
                    CounselorFocus = counselorFocus,
                    PermutationAction = matchedPerm.RecommendedAction,
                    Priorities = matchedPerm.CounselorFlag.Split(new[] { ", " }, StringSplitOptions.RemoveEmptyEntries).ToList()
                },

                StreamRecommendation = new StreamRecommendationDto
                {
                    Stream = recommendedStream,
                    Subjects = recommendedSubjects,
                    Actions = streamActions,
                    CareerFitScore = careerFitScore
                },

                LocalNarrative = new LocalNarrativeDto
                {
                    ExecutiveSummary = matchedPerm.AIInterpretation,
                    CognitiveStrengths = $"Cognitive band evaluated as {cogBand}. Cognitive index stands at {Math.Round(cogAvg)}%. Focus is placed on logical, numerical, spatial, verbal, and pattern reasoning capabilities.",
                    LearningStrategy = $"Matched dominant sensory processing style: {dominantLearning}. Recommendations include customized study templates, notes structures, and memory-mapping guidelines adapted to this style.",
                    CareerMapping = $"Dominant occupational interest profiles: {dominantRiasec}. Recommended paths are matched to this orientation: {matchedPerm.RecommendedAction}",
                    CounselorGuideline = $"Primary Action: {counselorFocus}. Guidelines support counselor-led interventions focusing on study routines, stream selections, and stress-release support."
                },

                Metrics = metricsMap.Values.ToList(),
                AuditResponses = session.Responses.Select(r => new AuditResponseDto
                {
                    QID = r.QID,
                    Domain = r.Domain,
                    Subdomain = r.Subdomain,
                    QuestionType = r.QuestionType,
                    ResponseValue = r.ResponseValue,
                    TimeSec = r.TimeSec,
                    ReverseScored = r.ReverseScored,
                    CorrectKey = r.CorrectKey,
                    Difficulty = r.Difficulty
                }).ToList()
            };

            return results;
        }

        public async Task<bool> PopulateDemoResponsesAsync(Guid sessionId)
        {
            await InitializeAsync();

            var session = await _context.Sessions
                .Include(s => s.Responses)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null || session.IsCompleted) return false;

            // Clear any responses
            _context.Responses.RemoveRange(session.Responses);
            session.Responses.Clear();

            var random = new Random();

            foreach (var metric in METRIC_DEFINITIONS)
            {
                var pool = await _context.Questions.Where(q => q.Domain == metric.Domain && q.Subdomain == metric.Subdomain).ToListAsync();
                int count = Math.Min(3, pool.Count);
                for (int i = 0; i < count; i++)
                {
                    var q = pool[i];
                    
                    int mockVal = 4; // High default
                    if (metric.Subdomain == "Neuroticism" || metric.Subdomain == "Stress")
                    {
                        mockVal = 2; // Low
                    }
                    else if (metric.Subdomain == "Realistic" || metric.Subdomain == "Investigative" || metric.Subdomain == "Numerical" || metric.Subdomain == "Logic")
                    {
                        mockVal = 5; // Science bias
                    }
                    else if (metric.Subdomain == "Artistic" || metric.Subdomain == "Social")
                    {
                        mockVal = 2; // Low arts
                    }

                    var isReverse = q.ReverseScored.Equals("Yes", StringComparison.OrdinalIgnoreCase);

                    var resp = new StudentResponse
                    {
                        SessionId = sessionId,
                        QID = q.QID,
                        Domain = q.Domain,
                        Subdomain = q.Subdomain,
                        QuestionType = q.QuestionType,
                        ResponseValue = q.QuestionType == "Likert" ? mockVal.ToString() : (q.CorrectKey != "" ? q.CorrectKey : "A"),
                        TimeSec = random.Next(3, 8),
                        ReverseScored = isReverse,
                        CorrectKey = q.CorrectKey,
                        Difficulty = q.Difficulty,
                        Timestamp = DateTime.UtcNow
                    };
                    _context.Responses.Add(resp);
                }
            }

            // Also mock 3 validity responses
            var validityPool = await _context.Questions.Where(q => q.Domain == "Validity & Readiness").Take(3).ToListAsync();
            foreach (var q in validityPool)
            {
                var isReverse = q.ReverseScored.Equals("Yes", StringComparison.OrdinalIgnoreCase);
                var mockVal = q.QID == "AQ084" ? "1" : "5"; // pass checks

                var resp = new StudentResponse
                {
                    SessionId = sessionId,
                    QID = q.QID,
                    Domain = q.Domain,
                    Subdomain = q.Subdomain,
                    QuestionType = q.QuestionType,
                    ResponseValue = mockVal,
                    TimeSec = random.Next(2, 5),
                    ReverseScored = isReverse,
                    CorrectKey = q.CorrectKey,
                    Difficulty = q.Difficulty,
                    Timestamp = DateTime.UtcNow
                };
                _context.Responses.Add(resp);
            }

            session.IsCompleted = true;
            session.EndTime = DateTime.UtcNow;
            session.CompactIndex = 84;
            session.CurrentMetricIndex = METRIC_DEFINITIONS.Count;
            session.CurrentQuestionIndex = 0;
            session.ValidityStep = 3;

            _context.Sessions.Update(session);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<AssessmentSession>> GetHistoryAsync()
        {
            return await _context.Sessions
                .Where(s => s.IsCompleted)
                .OrderByDescending(s => s.EndTime)
                .ToListAsync();
        }
    }

    // DTOs for aggregated results
    public class AssessmentResultsDto
    {
        public Guid SessionId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
        public string Mode { get; set; } = string.Empty;
        public string ProfileCode { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }

        public CircularGaugesDto CircularGauges { get; set; } = new();
        public DominantVectorsDto DominantVectors { get; set; } = new();
        public AlertDto PrimaryAlert { get; set; } = new();
        public CounselorRoadmapDto CounselorRoadmap { get; set; } = new();
        public StreamRecommendationDto StreamRecommendation { get; set; } = new();
        public LocalNarrativeDto LocalNarrative { get; set; } = new();
        public List<MetricDiagnosticDto> Metrics { get; set; } = new();
        public List<AuditResponseDto> AuditResponses { get; set; } = new();
    }

    public class AuditResponseDto
    {
        public string QID { get; set; } = string.Empty;
        public string Domain { get; set; } = string.Empty;
        public string Subdomain { get; set; } = string.Empty;
        public string QuestionType { get; set; } = string.Empty;
        public string ResponseValue { get; set; } = string.Empty;
        public int TimeSec { get; set; }
        public bool ReverseScored { get; set; }
        public string CorrectKey { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
    }

    public class CircularGaugesDto
    {
        public int CareerReadiness { get; set; }
        public int RiasecClarity { get; set; }
        public int CognitiveIndex { get; set; }
        public int EmotionalSustainability { get; set; }
    }

    public class DominantVectorsDto
    {
        public string DominantRIASEC { get; set; } = string.Empty;
        public string DominantBig5 { get; set; } = string.Empty;
        public string DominantLearning { get; set; } = string.Empty;
        public int BigFiveBalance { get; set; }
        public int LearningPreferenceStrength { get; set; }
    }

    public class AlertDto
    {
        public string AlertType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string AlertClass { get; set; } = string.Empty; // alert-success, alert-warning, alert-danger
    }

    public class CounselorRoadmapDto
    {
        public string CounselorFocus { get; set; } = string.Empty;
        public string PermutationAction { get; set; } = string.Empty;
        public List<string> Priorities { get; set; } = new();
    }

    public class StreamRecommendationDto
    {
        public string Stream { get; set; } = string.Empty;
        public string Subjects { get; set; } = string.Empty;
        public List<string> Actions { get; set; } = new();
        public int CareerFitScore { get; set; }
    }

    public class LocalNarrativeDto
    {
        public string ExecutiveSummary { get; set; } = string.Empty;
        public string CognitiveStrengths { get; set; } = string.Empty;
        public string LearningStrategy { get; set; } = string.Empty;
        public string CareerMapping { get; set; } = string.Empty;
        public string CounselorGuideline { get; set; } = string.Empty;
    }

    public class MetricDiagnosticDto
    {
        public string Domain { get; set; } = string.Empty;
        public string Subdomain { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        
        [JsonIgnore]
        public List<double> Scores { get; set; } = new();
        
        [JsonIgnore]
        public List<int> Times { get; set; } = new();
        
        public int HighTimeCount { get; set; }
        public int Score0100 { get; set; }
        public string Band { get; set; } = string.Empty;
        public double AvgTime { get; set; }
        public string Flag { get; set; } = string.Empty;
        public string Interpretation { get; set; } = string.Empty;
    }
}
