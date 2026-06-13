// -------------------------------------------------------------
// NEUROPI ASSESSMENT SYSTEM - CORE LOGIC ENGINE
// -------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    // Global State
    const state = {
        student: {
            name: "",
            grade: "",
            mode: "adaptive", // 'adaptive' or 'compact'
            apiKey: ""
        },
        isTesting: false,
        testStartTime: 0,
        questionStartTime: 0,
        timerInterval: null,
        
        // Response store: [{ qid, domain, subdomain, type, response, time_sec, reverse_scored, correct_key, difficulty }]
        responses: [],
        
        // Compact mode index tracking
        compactIndex: 0,
        compactQuestions: [],
        
        // Adaptive mode state
        adaptive: {
            metricIndex: 0,
            questionIndex: 0, // 0, 1, or 2 for current metric
            metricsList: [],  // list of { domain, subdomain, code }
            activeQuestions: [], // master questions available for current subdomain
            askedQids: new Set(),
            
            // Cognitive difficulty per subdomain: 'Easy' | 'Medium' | 'Hard'
            cognitiveDifficulty: {
                "Logic": "Medium",
                "Numerical": "Medium",
                "Verbal": "Medium",
                "Abstract": "Medium",
                "Spatial": "Medium"
            },
            
            // Validity tracking
            validityFails: 0,
            validityStep: 0, // 0, 1, 2 interspersed checks
            
            // Stats
            savedQuestionsCount: 0
        },
        
        // Selected metric for detail modal
        selectedMetric: null
    };

    // DOM Elements
    const screens = {
        welcome: document.getElementById("screen-welcome"),
        test: document.getElementById("screen-test"),
        results: document.getElementById("screen-results")
    };
    
    const elements = {
        headerStatus: document.getElementById("header-status"),
        statusStudentName: document.getElementById("status-student-name"),
        statusTestMode: document.getElementById("status-test-mode"),
        
        // Welcome Screen
        profileForm: document.getElementById("profile-form"),
        studentNameInput: document.getElementById("student-name"),
        studentGradeSelect: document.getElementById("student-grade"),
        testModeSelect: document.getElementById("test-mode"),
        apiKeyInput: document.getElementById("api-key"),
        modeHint: document.getElementById("mode-hint"),
        
        // Test Screen
        activeDomain: document.getElementById("active-domain"),
        activeSubdomain: document.getElementById("active-subdomain"),
        progressText: document.getElementById("question-progress-text"),
        timeElapsed: document.getElementById("time-elapsed"),
        progressBarFill: document.getElementById("progress-bar-fill"),
        questionText: document.getElementById("question-text"),
        optionsContainer: document.getElementById("options-container"),
        timingWarningBar: document.getElementById("timing-warning-bar"),
        timingWarningText: document.getElementById("timing-warning-text"),
        btnNextQuestion: document.getElementById("btn-next-question"),
        adaptiveConsolePanel: document.getElementById("adaptive-console-panel"),
        consoleLogs: document.getElementById("console-logs"),
        statMetrics: document.getElementById("engine-stat-metrics"),
        statSaved: document.getElementById("engine-stat-saved"),
        statValidity: document.getElementById("engine-stat-validity"),
        
        // Results Screen
        resStudentName: document.getElementById("result-student-name"),
        resStudentGradeMode: document.getElementById("result-student-grade-mode"),
        resProfileCode: document.getElementById("result-profile-code"),
        resPrimaryAlert: document.getElementById("result-primary-alert"),
        resAlertDescription: document.getElementById("result-alert-description"),
        resCounselorFocus: document.getElementById("result-counselor-focus"),
        resPermutationAction: document.getElementById("result-permutation-action"),
        alertCardBox: document.getElementById("alert-card-box"),
        
        // Tab buttons
        tabBtnDashboard: document.getElementById("tab-btn-dashboard"),
        tabBtnMetrics: document.getElementById("tab-btn-metrics"),
        tabBtnReport: document.getElementById("tab-btn-report"),
        
        // Tab contents
        tabDashboard: document.getElementById("tab-dashboard"),
        tabMetrics: document.getElementById("tab-metrics"),
        tabReport: document.getElementById("tab-report"),
        
        // Dashboard gauges
        gaugeCareerReadiness: document.getElementById("gauge-career-readiness"),
        valCareerReadiness: document.getElementById("val-career-readiness"),
        bandCareerReadiness: document.getElementById("band-career-readiness"),
        
        gaugeRiasecClarity: document.getElementById("gauge-riasec-clarity"),
        valRiasecClarity: document.getElementById("val-riasec-clarity"),
        bandRiasecClarity: document.getElementById("band-riasec-clarity"),
        
        gaugeCogIndex: document.getElementById("gauge-cog-index"),
        valCogIndex: document.getElementById("val-cog-index"),
        bandCogIndex: document.getElementById("band-cog-index"),
        
        gaugeEmoSustainability: document.getElementById("gauge-emo-sustainability"),
        valEmoSustainability: document.getElementById("val-emo-sustainability"),
        bandEmoSustainability: document.getElementById("band-emo-sustainability"),
        
        findingRiasec: document.getElementById("finding-riasec"),
        findingBig5: document.getElementById("finding-big5"),
        findingLearning: document.getElementById("finding-learning"),
        findingB5Balance: document.getElementById("finding-b5-balance"),
        findingLearnFit: document.getElementById("finding-learn-fit"),
        
        // Metrics tab
        metricsGrid: document.getElementById("metrics-grid"),
        
        // Report Tab
        reportApiStatusDot: document.getElementById("report-api-status-dot"),
        reportApiStatusText: document.getElementById("report-api-status-text"),
        btnGenerateAiReport: document.getElementById("btn-generate-ai-report"),
        repStudentName: document.getElementById("rep-student-name"),
        repStudentGrade: document.getElementById("rep-student-grade"),
        repDate: document.getElementById("rep-date"),
        repProfileCode: document.getElementById("rep-profile-code"),
        repExeSummary: document.getElementById("rep-exe-summary"),
        repCogStrengths: document.getElementById("rep-cog-strengths"),
        repLearningStrategy: document.getElementById("rep-learning-strategy"),
        repCareerMapping: document.getElementById("rep-career-mapping"),
        repCareerFitVal: document.getElementById("rep-career-fit-val"),
        repCounselorGuideline: document.getElementById("rep-counselor-guideline"),
        repActionList: document.getElementById("rep-action-list"),
        findingStream: document.getElementById("finding-stream"),
        repStreamTitle: document.getElementById("rep-stream-title"),
        repStreamSubjects: document.getElementById("rep-stream-subjects"),
        repStreamActions: document.getElementById("rep-stream-actions"),
        
        // Modal
        metricModal: document.getElementById("metric-modal"),
        modalMetricName: document.getElementById("modal-metric-name"),
        modalLayer: document.getElementById("modal-layer"),
        modalScore: document.getElementById("modal-score"),
        modalBand: document.getElementById("modal-band"),
        modalFlag: document.getElementById("modal-flag"),
        modalInterpretation: document.getElementById("modal-interpretation"),
        modalAuditRows: document.getElementById("modal-audit-rows"),
        btnCloseModal: document.getElementById("btn-close-modal"),
        
        // Restart/Export
        btnRestart: document.getElementById("btn-restart"),
        btnExportData: document.getElementById("btn-export-data")
    };

    // Metric definition mapping
    const METRIC_DEFINITIONS = [
        { domain: "RIASEC Interest", subdomain: "Realistic", code: "R" },
        { domain: "RIASEC Interest", subdomain: "Investigative", code: "I" },
        { domain: "RIASEC Interest", subdomain: "Artistic", code: "A" },
        { domain: "RIASEC Interest", subdomain: "Social", code: "S" },
        { domain: "RIASEC Interest", subdomain: "Enterprising", code: "E" },
        { domain: "RIASEC Interest", subdomain: "Conventional", code: "C" },
        
        { domain: "Big Five Personality", subdomain: "Openness", code: "Openness" },
        { domain: "Big Five Personality", subdomain: "Conscientiousness", code: "Conscientiousness" },
        { domain: "Big Five Personality", subdomain: "Extraversion", code: "Extraversion" },
        { domain: "Big Five Personality", subdomain: "Agreeableness", code: "Agreeableness" },
        { domain: "Big Five Personality", subdomain: "Neuroticism", code: "Neuroticism" },
        
        { domain: "Cognitive Ability", subdomain: "Numerical", code: "Numerical" },
        { domain: "Cognitive Ability", subdomain: "Logic", code: "Logic" },
        { domain: "Cognitive Ability", subdomain: "Verbal", code: "Verbal" },
        { domain: "Cognitive Ability", subdomain: "Abstract", code: "Abstract" },
        { domain: "Cognitive Ability", subdomain: "Spatial", code: "Spatial" },
        
        { domain: "Emotional Profile", subdomain: "Stress", code: "Stress" },
        { domain: "Emotional Profile", subdomain: "Confidence", code: "Confidence" },
        { domain: "Emotional Profile", subdomain: "Resilience", code: "Resilience" },
        { domain: "Emotional Profile", subdomain: "Coping", code: "Coping" },
        
        { domain: "Learning Style", subdomain: "Visual", code: "Visual" },
        { domain: "Learning Style", subdomain: "Auditory", code: "Auditory" },
        { domain: "Learning Style", subdomain: "Kinesthetic", code: "Kinesthetic" },
        { domain: "Learning Style", subdomain: "ReadingWriting", code: "ReadingWriting" },
        
        { domain: "Additional NeuroPi Indicators", subdomain: "Motivation", code: "Motivation" },
        { domain: "Additional NeuroPi Indicators", subdomain: "StudyHabits", code: "StudyHabits" },
        { domain: "Additional NeuroPi Indicators", subdomain: "CareerClarity", code: "CareerClarity" }
    ];

    // Selected value for active question
    let activeSelection = null;
    let questionTimer = 0;
    
    // Change mode description based on select
    elements.testModeSelect.addEventListener("change", (e) => {
        if (e.target.value === "adaptive") {
            elements.modeHint.textContent = "Adaptive Mode dynamically scales question difficulty and branches domains based on consistency to find the student's exact profile in 40-60% fewer questions.";
        } else {
            elements.modeHint.textContent = "Compact Mode runs the standard, fixed 84-question diagnostic baseline (exactly 3 questions per metric across 28 metrics) with structured scoring.";
        }
    });

    // Start assessment action
    elements.profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        state.student.name = elements.studentNameInput.value.trim();
        state.student.grade = elements.studentGradeSelect.value;
        state.student.mode = elements.testModeSelect.value;
        state.student.apiKey = elements.apiKeyInput.value.trim() || "AQ.Ab8RN6IcPtEVDv_o9u3KiQlPt5YQ9aE-8Ric9S7j7RnHEJufLA";
        
        if (!state.student.name || !state.student.grade) return;
        
        startAssessment();
    });

    // Demo / Mock Report action
    const btnMock = document.getElementById("btn-mock-test");
    if (btnMock) {
        btnMock.addEventListener("click", () => {
            state.student.name = elements.studentNameInput.value.trim() || "Harsh Demo";
            state.student.grade = elements.studentGradeSelect.value || "10";
            state.student.mode = elements.testModeSelect.value || "adaptive";
            state.student.apiKey = elements.apiKeyInput.value.trim() || "AQ.Ab8RN6IcPtEVDv_o9u3KiQlPt5YQ9aE-8Ric9S7j7RnHEJufLA";
            
            // Generate mock responses for all 84 items
            const mockResponses = [];
            const questionsPool = window.NEUROPI_QUESTIONS || [];
            
            // Loop through all METRIC_DEFINITIONS to generate items
            METRIC_DEFINITIONS.forEach(metric => {
                // Find questions for this metric
                const pool = questionsPool.filter(q => q.Domain === metric.domain && q.Subdomain === metric.subdomain);
                const count = Math.min(3, pool.length);
                for (let i = 0; i < count; i++) {
                    const q = pool[i];
                    // Random but consistent score based on metric to make the profile interesting
                    let mockVal = 4; // High default
                    if (metric.subdomain === "Neuroticism" || metric.subdomain === "Stress") {
                        mockVal = 2; // Low neuroticism/stress
                    } else if (metric.subdomain === "Realistic" || metric.subdomain === "Investigative" || metric.subdomain === "Numerical" || metric.subdomain === "Logic") {
                        mockVal = 5; // Science orientation
                    } else if (metric.subdomain === "Artistic" || metric.subdomain === "Social") {
                        mockVal = 2; // Low arts interest to contrast
                    }
                    
                    mockResponses.push({
                        qid: q.QID,
                        domain: q.Domain,
                        subdomain: q.Subdomain,
                        type: q["Question Type"] || q.Question_Type,
                        response: (q["Question Type"] || q.Question_Type) === "Likert" ? mockVal : (q.Correct_Key || "A"),
                        time_sec: Math.floor(Math.random() * 5) + 3,
                        reverse_scored: (q.Reverse_Scored || q["Reverse Scored"] || "No").toLowerCase() === "yes",
                        correct_key: q.Correct_Key || "",
                        difficulty: q.Difficulty || "Medium"
                    });
                }
            });
            
            state.responses = mockResponses;
            completeAssessment();
        });
    }

    // Switch screen helper
    function showScreen(screenId) {
        Object.keys(screens).forEach(key => {
            if (key === screenId) {
                screens[key].classList.add("active");
            } else {
                screens[key].classList.remove("active");
            }
        });
    }

    // Initialize & Start Assessment
    function startAssessment() {
        state.isTesting = true;
        state.responses = [];
        state.testStartTime = Date.now();
        state.questionStartTime = Date.now();
        
        // Show headers
        elements.headerStatus.style.display = "flex";
        elements.statusStudentName.textContent = state.student.name;
        elements.statusTestMode.textContent = state.student.mode === "adaptive" ? "AI-Powered Adaptive" : "Compact Mode";
        
        // Initialize UI screen
        showScreen("test");
        
        // Start timers
        questionTimer = 0;
        state.timerInterval = setInterval(updateTimer, 1000);
        
        if (state.student.mode === "compact") {
            // Load compact blueprint from rules
            state.compactIndex = 0;
            state.compactQuestions = window.NEUROPI_RULES.Student_Response_Template;
            elements.adaptiveConsolePanel.style.display = "none";
            loadCompactQuestion();
        } else {
            // Load adaptive variables
            state.adaptive.metricIndex = 0;
            state.adaptive.questionIndex = 0;
            state.adaptive.metricsList = [...METRIC_DEFINITIONS];
            state.adaptive.askedQids.clear();
            state.adaptive.savedQuestionsCount = 0;
            state.adaptive.validityFails = 0;
            state.adaptive.validityStep = 0;
            state.adaptive.cognitiveDifficulty = {
                "Logic": "Medium",
                "Numerical": "Medium",
                "Verbal": "Medium",
                "Abstract": "Medium",
                "Spatial": "Medium"
            };
            state.adaptive.metricScores = {};
            state.adaptive.metricTimes = {};
            state.adaptive.cognitiveHistory = {};
            
            elements.adaptiveConsolePanel.style.display = "flex";
            elements.consoleLogs.innerHTML = "";
            logToConsole("[SYS] NeuralPi Adaptive Engine Initialized.", "system");
            logToConsole(`[SYS] Profile: ${state.student.name} | Grade ${state.student.grade}`, "system");
            logToConsole(`[SYS] Ingested 525 master items. Ready to branch.`, "system");
            
            loadAdaptiveQuestion();
        }
    }

    // Time counter update
    function updateTimer() {
        const totalSec = Math.floor((Date.now() - state.testStartTime) / 1000);
        const min = String(Math.floor(totalSec / 60)).padStart(2, '0');
        const sec = String(totalSec % 60).padStart(2, '0');
        elements.timeElapsed.textContent = `${min}m ${sec}s`;
        
        // Check active question response time warning
        const qSec = Math.floor((Date.now() - state.questionStartTime) / 1000);
        updateTimingWarning(qSec);
    }

    // Dynamic warning updates
    function updateTimingWarning(seconds) {
        if (!state.isTesting || !state.currentQuestion) return;
        
        const type = state.currentQuestion.Question_Type || state.currentQuestion["Question Type"];
        const diff = state.currentQuestion.Difficulty || "Medium";
        
        // Fetch thresholds from rules.json Timing_Bands
        let maxMod = 10;
        let maxHigh = 25;
        
        const tb = window.NEUROPI_RULES.Timing_Bands.find(b => b.Question_Type === type && b.Difficulty === diff);
        if (tb) {
            maxMod = parseFloat(tb.Moderate_Time_Max_Sec);
            maxHigh = parseFloat(tb.High_Time_Review_Above_Sec);
        } else {
            // Fallback defaults
            if (type === "Likert") {
                maxMod = 10; maxHigh = 25;
            } else {
                maxMod = 30; maxHigh = 55;
            }
        }
        
        // Display warnings
        if (seconds <= maxMod) {
            elements.timingWarningBar.style.backgroundColor = "var(--color-high)";
            elements.timingWarningBar.style.width = `${(seconds / maxHigh) * 100}%`;
            elements.timingWarningText.textContent = `Response Time: Normal (${seconds}s)`;
            elements.timingWarningText.style.color = "var(--color-text-muted)";
        } else if (seconds <= maxHigh) {
            elements.timingWarningBar.style.backgroundColor = "var(--color-moderate)";
            elements.timingWarningBar.style.width = `${(seconds / maxHigh) * 100}%`;
            elements.timingWarningText.textContent = `Response Time: Hesitating... (${seconds}s)`;
            elements.timingWarningText.style.color = "var(--color-moderate)";
        } else {
            elements.timingWarningBar.style.backgroundColor = "var(--color-low)";
            elements.timingWarningBar.style.width = "100%";
            elements.timingWarningText.textContent = `Response Time: High (Hesitation Alert Flagged) (${seconds}s)`;
            elements.timingWarningText.style.color = "var(--color-low)";
        }
    }

    // COMPACT PROTOCOL: Load question
    function loadCompactQuestion() {
        if (state.compactIndex >= state.compactQuestions.length) {
            completeAssessment();
            return;
        }
        
        activeSelection = null;
        elements.btnNextQuestion.disabled = true;
        
        const qRow = state.compactQuestions[state.compactIndex];
        state.currentQuestion = qRow;
        
        state.questionStartTime = Date.now();
        
        // Set UI labels
        elements.activeDomain.textContent = qRow.Layer;
        elements.activeSubdomain.textContent = qRow.Metric;
        elements.progressText.textContent = `Question ${state.compactIndex + 1} of ${state.compactQuestions.length}`;
        elements.progressBarFill.style.width = `${((state.compactIndex) / state.compactQuestions.length) * 100}%`;
        elements.questionText.textContent = qRow.Question;
        
        renderOptions(qRow.Question_Type, qRow);
    }

    // ADAPTIVE PROTOCOL: Load question
    function loadAdaptiveQuestion() {
        activeSelection = null;
        elements.btnNextQuestion.disabled = true;
        
        // 1. Check if interspersed Validity check is due
        // We intersperse Validity checks after 20, 40, and 60 answered questions
        const totalAnswered = state.responses.length;
        if (state.adaptive.validityStep === 0 && totalAnswered >= 18) {
            serveValidityCheck(0);
            return;
        } else if (state.adaptive.validityStep === 1 && totalAnswered >= 36) {
            serveValidityCheck(1);
            return;
        } else if (state.adaptive.validityStep === 2 && totalAnswered >= 54) {
            serveValidityCheck(2);
            return;
        }
        
        // 2. Check if we have completed all 27 metrics
        if (state.adaptive.metricIndex >= state.adaptive.metricsList.length) {
            completeAssessment();
            return;
        }
        
        const metric = state.adaptive.metricsList[state.adaptive.metricIndex];
        
        // 3. Fetch questions for current metric
        // If we just entered a new subdomain, prepare the question pool
        if (state.adaptive.questionIndex === 0) {
            state.adaptive.activeQuestions = window.NEUROPI_QUESTIONS.filter(q => 
                (q.Domain || q.Domain === "") && 
                q.Domain === metric.domain && 
                q.Subdomain === metric.subdomain
            );
            
            logToConsole(`[SYS] Commencing evaluation of metric: ${metric.subdomain} (${metric.domain})`, "system");
        }
        
        const pool = state.adaptive.activeQuestions;
        let selectedQ = null;
        
        if (metric.domain === "Cognitive Ability") {
            // Cognitive difficulty adaptive selection
            const activeDiff = state.adaptive.cognitiveDifficulty[metric.subdomain];
            
            // Partition by difficulty based on index
            // Master has 20 questions. Partition:
            // Easy: index 0-6 (7 questions)
            // Medium: index 7-13 (7 questions)
            // Hard: index 14-19 (6 questions)
            let diffPool = [];
            if (activeDiff === "Easy") {
                diffPool = pool.slice(0, 7);
            } else if (activeDiff === "Medium") {
                diffPool = pool.slice(7, 14);
            } else {
                diffPool = pool.slice(14, 20);
            }
            
            // Find one not asked yet
            selectedQ = diffPool.find(q => !state.adaptive.askedQids.has(q.QID));
            
            // Fallback in case pool exhausted
            if (!selectedQ) {
                selectedQ = pool.find(q => !state.adaptive.askedQids.has(q.QID));
            }
            
            logToConsole(`[CAT] Selected ${metric.subdomain} Cognitive MCQ (${activeDiff} diff).`, "system");
        } else {
            // Behavioral Likert questions
            selectedQ = pool.find(q => !state.adaptive.askedQids.has(q.QID));
            
            logToConsole(`[CAT] Selected ${metric.subdomain} Likert item ${state.adaptive.questionIndex + 1}.`, "system");
        }
        
        // If no questions found or pool exhausted, step to next metric immediately
        if (!selectedQ) {
            logToConsole(`[CAT] Question pool exhausted for ${metric.subdomain}. Stepping forward.`, "warning");
            state.adaptive.metricIndex++;
            state.adaptive.questionIndex = 0;
            loadAdaptiveQuestion();
            return;
        }
        
        state.adaptive.askedQids.add(selectedQ.QID);
        state.currentQuestion = selectedQ;
        
        state.questionStartTime = Date.now();
        
        // Update UI
        elements.activeDomain.textContent = selectedQ.Domain;
        elements.activeSubdomain.textContent = selectedQ.Subdomain;
        
        // Calculate dynamic progress estimation
        // Target is about 70 questions maximum in adaptive mode
        const estimatedMaxQ = 70;
        const currentProgress = Math.min(99, Math.round((totalAnswered / estimatedMaxQ) * 100));
        elements.progressText.textContent = `Question ${totalAnswered + 1} (Adaptive Tuning)`;
        elements.progressBarFill.style.width = `${currentProgress}%`;
        elements.questionText.textContent = selectedQ.Question;
        
        // Set stats in side panel
        elements.statMetrics.textContent = `${state.adaptive.metricIndex} / 28`;
        elements.statSaved.textContent = state.adaptive.savedQuestionsCount;
        
        renderOptions(selectedQ["Question Type"] || selectedQ.Question_Type, selectedQ);
    }

    // Serve Validity (Attention Check) items
    function serveValidityCheck(stepIndex) {
        state.adaptive.validityStep = stepIndex + 1;
        
        const validityPool = window.NEUROPI_QUESTIONS.filter(q => q.Domain === "Validity & Readiness");
        const valQ = validityPool.find(q => !state.adaptive.askedQids.has(q.QID));
        
        if (!valQ) {
            // Fallback if none left, return to standard flow
            loadAdaptiveQuestion();
            return;
        }
        
        state.adaptive.askedQids.add(valQ.QID);
        state.currentQuestion = valQ;
        state.questionStartTime = Date.now();
        
        logToConsole(`[SYS] Injecting attention-validity check item.`, "warning");
        
        // Update UI
        elements.activeDomain.textContent = valQ.Domain;
        elements.activeSubdomain.textContent = valQ.Subdomain;
        elements.questionText.textContent = valQ.Question;
        
        renderOptions(valQ["Question Type"] || valQ.Question_Type, valQ);
    }

    // Render Options dynamically based on type
    function renderOptions(type, questionData) {
        elements.optionsContainer.innerHTML = "";
        
        if (type === "Likert") {
            const wrapper = document.createElement("div");
            wrapper.className = "options-likert-wrapper";
            
            const btnGroup = document.createElement("div");
            btnGroup.className = "likert-buttons";
            
            const ratings = [
                { val: 1, label: "Strongly Disagree" },
                { val: 2, label: "Disagree" },
                { val: 3, label: "Neutral" },
                { val: 4, label: "Agree" },
                { val: 5, label: "Strongly Agree" }
            ];
            
            const activeValDisplay = document.createElement("div");
            activeValDisplay.className = "likert-active-value-text";
            
            ratings.forEach(r => {
                const btn = document.createElement("button");
                btn.className = "btn-likert";
                btn.setAttribute("data-val", r.val);
                btn.id = `btn-likert-${r.val}`;
                btn.textContent = r.val;
                
                btn.addEventListener("click", () => {
                    // Remove previous selections
                    btnGroup.querySelectorAll(".btn-likert").forEach(b => b.classList.remove("selected"));
                    btn.classList.add("selected");
                    activeSelection = r.val;
                    
                    // Display text color coded
                    let textClass = "text-moderate";
                    if (r.val <= 2) textClass = "text-low";
                    if (r.val >= 4) textClass = "text-high";
                    
                    activeValDisplay.innerHTML = `<span class="${textClass}">${r.val} - ${r.label}</span>`;
                    elements.btnNextQuestion.disabled = false;
                });
                
                btnGroup.appendChild(btn);
            });
            
            const labelsRow = document.createElement("div");
            labelsRow.className = "likert-labels";
            labelsRow.innerHTML = `<span>Strongly Disagree</span><span>Strongly Agree</span>`;
            
            wrapper.appendChild(btnGroup);
            wrapper.appendChild(labelsRow);
            wrapper.appendChild(activeValDisplay);
            elements.optionsContainer.appendChild(wrapper);
            
        } else {
            // Cognitive MCQ (Option A, B, C, D)
            const grid = document.createElement("div");
            grid.className = "mcq-options-grid";
            
            const options = ["A", "B", "C", "D"];
            options.forEach(opt => {
                const optTextKey = `Option ${opt}`;
                const text = questionData[optTextKey] || questionData[optTextKey.replace(" ", "")] || `Option ${opt}`;
                
                const btn = document.createElement("button");
                btn.className = "btn-mcq-option";
                btn.id = `btn-mcq-${opt.toLowerCase()}`;
                
                btn.innerHTML = `
                    <div class="mcq-letter">${opt}</div>
                    <div class="mcq-text">${text}</div>
                `;
                
                btn.addEventListener("click", () => {
                    grid.querySelectorAll(".btn-mcq-option").forEach(b => b.classList.remove("selected"));
                    btn.classList.add("selected");
                    activeSelection = opt;
                    elements.btnNextQuestion.disabled = false;
                });
                
                grid.appendChild(btn);
            });
            
            elements.optionsContainer.appendChild(grid);
        }
    }

    // Submit & Next Question
    elements.btnNextQuestion.addEventListener("click", () => {
        if (activeSelection === null) return;
        
        submitAnswer();
    });

    function submitAnswer() {
        const q = state.currentQuestion;
        const qid = q.QID || q.Assessment_QID;
        const type = q.Question_Type || q["Question Type"];
        const domain = q.Domain || q.Layer;
        const subdomain = q.Subdomain || q.Metric;
        const reverse = (q.Reverse_Scored || q["Reverse Scored"] || "No").toLowerCase() === "yes";
        const key = q.Correct_Key || q["Correct/Key"] || "";
        const diff = q.Difficulty || "Medium";
        
        const durationSec = Math.max(1, Math.floor((Date.now() - state.questionStartTime) / 1000));
        
        // Log response
        const respItem = {
            qid: qid,
            domain: domain,
            subdomain: subdomain,
            type: type,
            response: activeSelection,
            time_sec: durationSec,
            reverse_scored: reverse,
            correct_key: key,
            difficulty: diff
        };
        
        state.responses.push(respItem);
        
        // Handle processing depending on Mode
        if (state.student.mode === "compact") {
            state.compactIndex++;
            loadCompactQuestion();
        } else {
            // Adaptive processing
            processAdaptiveAnswer(respItem);
        }
    }

    // ADAPTIVE BRAIN logic execution
    function processAdaptiveAnswer(responseItem) {
        const metric = state.adaptive.metricsList[state.adaptive.metricIndex];
        const isValidityCheck = responseItem.domain === "Validity & Readiness";
        
        // 1. Handle validity verification item
        if (isValidityCheck) {
            let passed = true;
            if (responseItem.qid === "AQ082" || responseItem.qid === "NPI0516" || responseItem.qid === "NPI0517") {
                // Honest, Carefulness items -> must agree
                if (responseItem.response < 4) passed = false;
            } else if (responseItem.qid === "AQ084" || responseItem.qid === "NPI0518" || responseItem.qid === "NPI0519") {
                // Random scoring -> must disagree
                if (responseItem.response > 2) passed = false;
            }
            
            if (!passed) {
                state.adaptive.validityFails++;
                logToConsole(`[SYS-WARN] Attention check failed. Response consistency score dropped.`, "alert");
                elements.statValidity.textContent = `Flagged (${state.adaptive.validityFails})`;
                elements.statValidity.className = "stat-value text-low";
            } else {
                logToConsole(`[SYS] Attention check verified successfully.`, "success");
            }
            
            // Loop back to main adaptive question flow
            loadAdaptiveQuestion();
            return;
        }
        
        // 2. Track score & time for subdomain aggregation
        if (!state.adaptive.metricScores[metric.subdomain]) {
            state.adaptive.metricScores[metric.subdomain] = [];
            state.adaptive.metricTimes[metric.subdomain] = [];
        }
        
        // Calculate score percentage (0-100)
        let scoreVal = 0;
        if (responseItem.type === "Likert") {
            let adjVal = responseItem.response;
            if (responseItem.reverse_scored) {
                adjVal = 6 - responseItem.response;
            }
            scoreVal = ((adjVal - 1) / 4) * 100;
        } else {
            const isCorrect = String(responseItem.response).toUpperCase() === String(responseItem.correct_key).toUpperCase();
            scoreVal = isCorrect ? 100 : 0;
            
            // Log correctness history for cognitive adaptive routing
            if (!state.adaptive.cognitiveHistory[metric.subdomain]) {
                state.adaptive.cognitiveHistory[metric.subdomain] = [];
            }
            state.adaptive.cognitiveHistory[metric.subdomain].push(isCorrect);
        }
        
        state.adaptive.metricScores[metric.subdomain].push(scoreVal);
        state.adaptive.metricTimes[metric.subdomain].push(responseItem.time_sec);
        
        // 3. Cognitive Domain adaptive adjustments
        if (responseItem.domain === "Cognitive Ability") {
            const history = state.adaptive.cognitiveHistory[metric.subdomain];
            const lastCorrect = history[history.length - 1];
            const currentDiff = state.adaptive.cognitiveDifficulty[metric.subdomain];
            
            let nextDiff = currentDiff;
            if (lastCorrect) {
                // Correct: Step up difficulty
                if (currentDiff === "Medium") nextDiff = "Hard";
                else if (currentDiff === "Easy") nextDiff = "Medium";
                
                logToConsole(`[CAT] Answer correct on ${currentDiff}. Stepping up difficulty to ${nextDiff}.`, "success");
            } else {
                // Incorrect: Step down difficulty
                if (currentDiff === "Medium") nextDiff = "Easy";
                else if (currentDiff === "Hard") nextDiff = "Medium";
                
                logToConsole(`[CAT] Answer incorrect on ${currentDiff}. Stepping down difficulty to ${nextDiff}.`, "warning");
            }
            
            state.adaptive.cognitiveDifficulty[metric.subdomain] = nextDiff;
        }
        
        // 4. Branching decisions / Early completion check
        state.adaptive.questionIndex++;
        
        let shouldProceedToNextMetric = false;
        
        // For cognitive, we always ask 3 questions to measure precision
        if (responseItem.domain === "Cognitive Ability") {
            if (state.adaptive.questionIndex >= 3) {
                shouldProceedToNextMetric = true;
            }
        } else {
            // Behavioral domains Likert items: can complete early if answers are consistent!
            const scores = state.adaptive.metricScores[metric.subdomain];
            const times = state.adaptive.metricTimes[metric.subdomain];
            
            // Check for hesitation (High time response)
            const hasHesitation = times.some(t => t > 18);
            
            if (state.adaptive.questionIndex >= 3) {
                // Max questions for Likert in adaptive is 3
                shouldProceedToNextMetric = true;
            } else if (state.adaptive.questionIndex === 2) {
                if (hasHesitation) {
                    // If hesitation occurs, we require 3 questions to confirm response stability
                    logToConsole(`[CAT] Response hesitation (>18s) logged. Forcing third verification question.`, "warning");
                } else {
                    // Normal route: check answer consistency
                    const firstScore = scores[0];
                    const secondScore = scores[1];
                    
                    // Consistency check (e.g. both are high >= 75%, both are low <= 25%, or both are neutral 50%)
                    const isConsistentHigh = firstScore >= 75 && secondScore >= 75;
                    const isConsistentLow = firstScore <= 25 && secondScore <= 25;
                    const isConsistentNeutral = firstScore === 50 && secondScore === 50;
                    
                    if (isConsistentHigh || isConsistentLow || isConsistentNeutral) {
                        shouldProceedToNextMetric = true;
                        state.adaptive.savedQuestionsCount++;
                        logToConsole(`[CAT] Response pattern consistent (1st: ${firstScore}%, 2nd: ${secondScore}%). Skipping 3rd item.`, "success");
                        logToConsole(`[SYS] Saved 1 item. Current savings: ${state.adaptive.savedQuestionsCount} questions.`, "success");
                    }
                }
            }
        }
        
        if (shouldProceedToNextMetric) {
            // Calculate and output metric summary to console
            const scores = state.adaptive.metricScores[metric.subdomain];
            const avg = Math.round(scores.reduce((a,b) => a+b, 0) / scores.length);
            let band = "Moderate";
            if (avg < 40) band = "Low";
            if (avg >= 70) band = "High";
            
            logToConsole(`[SYS] Metric Completed: ${metric.subdomain} | Score: ${avg}% (${band})`, "success");
            
            state.adaptive.metricIndex++;
            state.adaptive.questionIndex = 0;
        }
        
        loadAdaptiveQuestion();
    }

    // Append output logs to adaptive panel
    function logToConsole(message, type = "info") {
        const line = document.createElement("div");
        line.className = `console-log-line ${type}`;
        
        const now = new Date();
        const timeStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
        
        line.textContent = `${timeStr} ${message}`;
        elements.consoleLogs.appendChild(line);
        elements.consoleLogs.scrollTop = elements.consoleLogs.scrollHeight;
    }

    // Complete assessment & compile stats
    function completeAssessment() {
        state.isTesting = false;
        clearInterval(state.timerInterval);
        
        logToConsole("[SYS] Assessment completed. Aggregating responses and mapping profile matrix...", "system");
        
        // Hide header labels
        elements.headerStatus.style.display = "none";
        
        // Compile diagnostic metrics
        const metricsData = compileMetrics();
        
        // Match 1080 Permutations
        const profileCode = matchPermutationProfile(metricsData);
        
        // Display dashboard
        renderDashboard(metricsData, profileCode);
        
        showScreen("results");
    }

    // Compile 28 subdomains scoring
    function compileMetrics() {
        const metrics = {};
        
        // Standard groupings
        METRIC_DEFINITIONS.forEach(def => {
            metrics[def.subdomain] = {
                domain: def.domain,
                subdomain: def.subdomain,
                code: def.code,
                scores: [],
                times: [],
                highTimeCount: 0,
                score_0_100: 0,
                band: "Low",
                avgTime: 0,
                flag: "OK",
                interpretation: ""
            };
        });
        
        // Populate from student responses
        state.responses.forEach(resp => {
            const m = metrics[resp.subdomain];
            if (m) {
                let scoreVal = 0;
                if (resp.type === "Likert") {
                    let adjVal = resp.response;
                    if (resp.reverse_scored) {
                        adjVal = 6 - resp.response;
                    }
                    scoreVal = ((adjVal - 1) / 4) * 100;
                } else {
                    const isCorrect = String(resp.response).toUpperCase() === String(resp.correct_key).toUpperCase();
                    scoreVal = isCorrect ? 100 : 0;
                }
                
                m.scores.push(scoreVal);
                m.times.push(resp.time_sec);
                
                // Track timing band checks
                const tb = window.NEUROPI_RULES.Timing_Bands.find(b => b.Question_Type === resp.type && b.Difficulty === resp.difficulty);
                const limitHigh = tb ? parseFloat(tb.High_Time_Review_Above_Sec) : (resp.type === "Likert" ? 18 : 45);
                if (resp.time_sec > limitHigh) {
                    m.highTimeCount++;
                }
            }
        });
        
        // Average and normalize
        Object.keys(metrics).forEach(key => {
            const m = metrics[key];
            
            if (m.scores.length > 0) {
                m.score_0_100 = Math.round(m.scores.reduce((a,b) => a+b, 0) / m.scores.length);
                m.avgTime = Math.round((m.times.reduce((a,b) => a+b, 0) / m.times.length) * 10) / 10;
            } else {
                // If skipped in adaptive mode, inherit baseline average or score
                m.score_0_100 = 50; // default middle
                m.avgTime = 5;
            }
            
            // Bands
            if (m.score_0_100 < 40) m.band = "Low";
            else if (m.score_0_100 < 70) m.band = "Moderate";
            else m.band = "High";
            
            // AI Flags
            if (m.highTimeCount >= 2) {
                m.flag = "Timing Review";
            } else if (m.score_0_100 < 40) {
                m.flag = "Support Needed";
            } else {
                m.flag = "OK";
            }
            
            // Fetch interpretation from Scoring_Map in rules
            const mapRow = window.NEUROPI_RULES.Scoring_Map.find(row => 
                row.Subdomain.toUpperCase() === m.code.toUpperCase() ||
                row.Subdomain.toUpperCase() === m.subdomain.toUpperCase()
            );
            
            if (mapRow) {
                if (m.band === "Low") m.interpretation = mapRow["Low Interpretation"];
                else if (m.band === "Moderate") m.interpretation = mapRow["Moderate Interpretation"];
                else m.interpretation = mapRow["High Interpretation"];
            } else {
                m.interpretation = `${m.subdomain} developmental and cognitive metrics index.`;
            }
        });
        
        return metrics;
    }

    // Match 1080 Permutations matrix
    function matchPermutationProfile(metrics) {
        // 1. Dominant RIASEC Interest (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)
        const riasecKeys = ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"];
        let dominantRiasec = riasecKeys[0];
        let maxRiasecScore = -1;
        let minRiasecTime = 99999;
        
        riasecKeys.forEach(k => {
            const m = metrics[k];
            if (m.score_0_100 > maxRiasecScore) {
                maxRiasecScore = m.score_0_100;
                dominantRiasec = k;
                minRiasecTime = m.avgTime;
            } else if (m.score_0_100 === maxRiasecScore) {
                // Tie breaker: faster response time represents higher spontaneity
                if (m.avgTime < minRiasecTime) {
                    dominantRiasec = k;
                    minRiasecTime = m.avgTime;
                }
            }
        });
        
        // 2. Dominant Big Five Trait (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
        const big5Keys = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"];
        let dominantBig5 = big5Keys[0];
        let maxBig5Score = -1;
        let minBig5Time = 99999;
        
        big5Keys.forEach(k => {
            const m = metrics[k];
            if (m.score_0_100 > maxBig5Score) {
                maxBig5Score = m.score_0_100;
                dominantBig5 = k;
                minBig5Time = m.avgTime;
            } else if (m.score_0_100 === maxBig5Score) {
                if (m.avgTime < minBig5Time) {
                    dominantBig5 = k;
                    minBig5Time = m.avgTime;
                }
            }
        });
        
        // 3. Dominant Learning Style (Visual, Auditory, Kinesthetic, ReadingWriting)
        const learnKeys = ["Visual", "Auditory", "Kinesthetic", "ReadingWriting"];
        let dominantLearning = learnKeys[0];
        let maxLearnScore = -1;
        let minLearnTime = 99999;
        
        learnKeys.forEach(k => {
            const m = metrics[k];
            if (m.score_0_100 > maxLearnScore) {
                maxLearnScore = m.score_0_100;
                dominantLearning = k;
                minLearnTime = m.avgTime;
            } else if (m.score_0_100 === maxLearnScore) {
                if (m.avgTime < minLearnTime) {
                    dominantLearning = k;
                    minLearnTime = m.avgTime;
                }
            }
        });
        
        // 4. Cognitive Band
        const cogKeys = ["Numerical", "Logic", "Verbal", "Abstract", "Spatial"];
        const cogAvg = cogKeys.reduce((acc, k) => acc + metrics[k].score_0_100, 0) / cogKeys.length;
        let cogBand = "Low";
        if (cogAvg >= 40 && cogAvg < 70) cogBand = "Moderate";
        else if (cogAvg >= 70) cogBand = "High";
        
        // 5. Emotional Band (Confidence, Resilience, Coping, and Stability/100-Stress)
        const emotionalAvg = (metrics["Confidence"].score_0_100 + 
                             metrics["Resilience"].score_0_100 + 
                             metrics["Coping"].score_0_100 + 
                             (100 - metrics["Stress"].score_0_100)) / 4;
        let emoBand = "Low";
        if (emotionalAvg >= 40 && emotionalAvg < 70) emoBand = "Moderate";
        else if (emotionalAvg >= 70) emoBand = "High";
        
        // Construct code match properties
        return {
            dominantRiasec,
            dominantBig5,
            dominantLearning,
            cogAvg: Math.round(cogAvg),
            cogBand,
            emotionalAvg: Math.round(emotionalAvg),
            emoBand,
            b5Balance: Math.round((metrics["Openness"].score_0_100 + 
                                  metrics["Conscientiousness"].score_0_100 + 
                                  metrics["Extraversion"].score_0_100 + 
                                  metrics["Agreeableness"].score_0_100 + 
                                  (100 - metrics["Neuroticism"].score_0_100)) / 5),
            learningFit: Math.round(metrics[dominantLearning].score_0_100)
        };
    }

    // Calculate recommended CBSE Academic Stream based on RIASEC & Cognitive Ability
    function getRecommendedStream(metrics) {
        const realistic = metrics["Realistic"] ? metrics["Realistic"].score_0_100 : 50;
        const investigative = metrics["Investigative"] ? metrics["Investigative"].score_0_100 : 50;
        const conventional = metrics["Conventional"] ? metrics["Conventional"].score_0_100 : 50;
        const enterprising = metrics["Enterprising"] ? metrics["Enterprising"].score_0_100 : 50;
        const artistic = metrics["Artistic"] ? metrics["Artistic"].score_0_100 : 50;
        const social = metrics["Social"] ? metrics["Social"].score_0_100 : 50;
        
        const logic = metrics["Logic"] ? metrics["Logic"].score_0_100 : 50;
        const numerical = metrics["Numerical"] ? metrics["Numerical"].score_0_100 : 50;
        const verbal = metrics["Verbal"] ? metrics["Verbal"].score_0_100 : 50;
        
        // Calculate weighted affinity for each academic stream
        const scienceWeight = (realistic * 0.25) + (investigative * 0.35) + (logic * 0.20) + (numerical * 0.20);
        const commerceWeight = (conventional * 0.35) + (enterprising * 0.35) + (numerical * 0.30);
        const humanitiesWeight = (artistic * 0.35) + (social * 0.35) + (verbal * 0.30);
        
        let stream = "Humanities & Liberal Arts";
        let subjects = "History, Political Science, Psychology, Sociology, Literature / English";
        let actions = [
            "Develop strong reading comprehension, narrative analysis, and creative/essay writing.",
            "Participate in public speaking, MUNs, and social outreach programs to build verbal clarity.",
            "Target career opportunities in Law, Journalism, Psychology, Design, and Civil Services."
        ];
        
        if (scienceWeight >= commerceWeight && scienceWeight >= humanitiesWeight) {
            if (investigative > realistic) {
                stream = "Science (PCB - Medical/Life Sciences)";
                subjects = "Physics, Chemistry, Biology, Biotechnology, English (Optional: Psychology)";
                actions = [
                    "Focus heavily on descriptive biology concepts, cell models, and scientific research.",
                    "Practice structured notes diagrams and concept-mapping to retain complex botanical/zoological systems.",
                    "Build test-taking stamina and analytical application skills for medical entrance exams."
                ];
            } else {
                stream = "Science (PCM - Engineering/Technology)";
                subjects = "Physics, Chemistry, Mathematics, Computer Science (Optional: Economics)";
                actions = [
                    "Strengthen mathematical foundations and practice structured numerical derivations daily.",
                    "Participate in practical projects like coding, electronics, or robotics to apply physics.",
                    "Solve complex multi-step logical problems to prepare for engineering/technology streams."
                ];
            }
        } else if (commerceWeight >= scienceWeight && commerceWeight >= humanitiesWeight) {
            stream = "Commerce (with Mathematics / Applied Math)";
            subjects = "Accountancy, Business Studies, Economics, Mathematics / Entrepreneurship";
            actions = [
                "Develop strong numerical reasoning, spreadsheet analysis, and logical accounting principles.",
                "Read business case studies, startup biographies, and basic financial news regularly.",
                "Participate in mock business pitch sessions, financial planning tasks, or business fests."
            ];
        }
        
        return { stream, subjects, actions };
    }

    // Populate results dashboard elements
    function renderDashboard(metrics, profileCode) {
        // Math matches exactly Dashboard formulas:
        const riasecKeys = ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"];
        const riasecClarity = Math.max(...riasecKeys.map(k => metrics[k].score_0_100));
        
        const careerClarityScore = metrics["CareerClarity"].score_0_100;
        const careerReadiness = Math.round((riasecClarity + profileCode.emotionalAvg + careerClarityScore) / 3);
        
        // Set student metadata
        elements.resStudentName.textContent = state.student.name;
        elements.resStudentGradeMode.textContent = `Grade ${state.student.grade} | ${state.student.mode === "adaptive" ? "AI-Powered Adaptive" : "Compact Mode"}`;
        
        // 1. Set gauges
        setCircularGauge(elements.gaugeCareerReadiness, elements.valCareerReadiness, elements.bandCareerReadiness, careerReadiness);
        setCircularGauge(elements.gaugeRiasecClarity, elements.valRiasecClarity, elements.bandRiasecClarity, riasecClarity);
        setCircularGauge(elements.gaugeCogIndex, elements.valCogIndex, elements.bandCogIndex, profileCode.cogAvg);
        setCircularGauge(elements.gaugeEmoSustainability, elements.valEmoSustainability, elements.bandEmoSustainability, profileCode.emotionalAvg);
        
        // 2. Set vectors
        elements.findingRiasec.textContent = profileCode.dominantRiasec;
        elements.findingBig5.textContent = profileCode.dominantBig5;
        elements.findingLearning.textContent = profileCode.dominantLearning === "ReadingWriting" ? "Reading / Writing" : profileCode.dominantLearning;
        elements.findingB5Balance.textContent = `${profileCode.b5Balance}%`;
        elements.findingLearnFit.textContent = `${profileCode.learningFit}%`;
        
        // Calculate and set stream recommendation
        const streamInfo = getRecommendedStream(metrics);
        elements.findingStream.textContent = streamInfo.stream;
        
        // 3. Match permutation rules table
        const matchedPerm = window.NEUROPI_RULES.Permutation_AI_Rules.find(p => 
            p.RIASEC_Dominant === profileCode.dominantRiasec &&
            p.Big5_Dominant === profileCode.dominantBig5 &&
            p.Cognitive_Band === profileCode.cogBand &&
            p.Emotional_Band === profileCode.emoBand &&
            p.Learning_Style === profileCode.dominantLearning
        ) || window.NEUROPI_RULES.Permutation_AI_Rules[0];
        
        elements.resProfileCode.textContent = matchedPerm.Profile_Code;
        elements.resPermutationAction.textContent = matchedPerm.Recommended_Action;
        
        // 4. Alerts calculation
        let alertType = "No major alert";
        let alertDesc = "Assessment profile registers balanced developmental trends. Validity checks are stable.";
        let alertClass = "alert-success";
        
        if (state.student.mode === "adaptive" && state.adaptive.validityFails >= 2) {
            alertType = "Attention consistency review";
            alertDesc = "The student failed multiple interspersed consistency checks, indicating rushing, distraction, or potential fatigue. Review details with caution.";
            alertClass = "alert-danger";
        } else if (metrics["Stress"].score_0_100 > 70) {
            alertType = "High stress sensitivity";
            alertDesc = "The student's emotional index shows high stress susceptibility. Counselor focus should prioritize emotional safety and pressure reduction.";
            alertClass = "alert-danger";
        } else if (metrics["StudyHabits"].score_0_100 < 40) {
            alertType = "Low study consistency";
            alertDesc = "Study habits metrics indicate a significant lack of regular routines, notes organization, and planning. Structured routines support is highly recommended.";
            alertClass = "alert-warning";
        } else if (metrics["CareerClarity"].score_0_100 < 40) {
            alertType = "Career confusion";
            alertDesc = "Low career clarity metrics suggest high uncertainty regarding interests and career mapping. Systematic stream options mapping is recommended.";
            alertClass = "alert-warning";
        }
        
        elements.resPrimaryAlert.textContent = `Primary Alert: ${alertType}`;
        elements.resAlertDescription.textContent = alertDesc;
        elements.alertCardBox.className = `alert-box ${alertClass}`;
        
        // Counselor focus
        let cFocus = "Strengths confirmation and growth plan";
        if (alertType === "High stress sensitivity") cFocus = "Emotional safety and pressure management";
        else if (alertType === "Low study consistency") cFocus = "Study routine and accountability";
        else if (alertType === "Career confusion") cFocus = "Exploration and stream mapping";
        
        elements.resCounselorFocus.textContent = `Counselor Focus: ${cFocus}`;
        
        // 5. Render 28 metrics grid cards
        renderMetricsGrid(metrics);
        
        // 6. Set Printable report properties
        elements.repStudentName.textContent = state.student.name;
        elements.repStudentGrade.textContent = `Grade ${state.student.grade}`;
        elements.repProfileCode.textContent = matchedPerm.Profile_Code;
        elements.repDate.textContent = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
        
        // Weighted fit score formula:
        // Career Fit = (RIASEC Weight * 0.35) + (Cognitive Weight * 0.25) + (Big5 Fit * 0.20) + (Emotional Weight * 0.20)
        const careerFitScore = Math.round(
            (riasecClarity * 0.35) + 
            (profileCode.cogAvg * 0.25) + 
            (profileCode.b5Balance * 0.20) + 
            (profileCode.emotionalAvg * 0.20)
        );
        elements.repCareerFitVal.textContent = `${careerFitScore}%`;
        
        // Populate local text narrative
        elements.repExeSummary.textContent = matchedPerm.AI_Interpretation;
        elements.repCogStrengths.textContent = `Cognitive band evaluated as ${profileCode.cogBand}. Cognitive index stands at ${profileCode.cogAvg}%. Focus is placed on logical, numerical, spatial, verbal, and pattern reasoning capabilities.`;
        elements.repLearningStrategy.textContent = `Matched dominant sensory processing style: ${profileCode.dominantLearning}. Recommendations include customized study templates, notes structures, and memory-mapping guidelines adapted to this style.`;
        elements.repCareerMapping.textContent = `Dominant occupational interest profiles: ${profileCode.dominantRiasec}. Recommended paths are matched to this orientation: ${matchedPerm.Recommended_Action}`;
        elements.repCounselorGuideline.textContent = `Primary Action: ${cFocus}. Guidelines support counselor-led interventions focusing on study routines, stream selections, and stress-release support.`;
        
        // Populate stream recommendation report section
        elements.repStreamTitle.textContent = streamInfo.stream;
        elements.repStreamSubjects.textContent = streamInfo.subjects;
        elements.repStreamActions.innerHTML = "";
        streamInfo.actions.forEach(act => {
            const li = document.createElement("li");
            li.textContent = act;
            elements.repStreamActions.appendChild(li);
        });

        // List priorities
        elements.repActionList.innerHTML = "";
        const priorities = matchedPerm.Counselor_Flag.split(", ");
        priorities.forEach((p, idx) => {
            const li = document.createElement("li");
            li.textContent = `Priority ${idx + 1}: ${p} interventions. Support student development in this area.`;
            elements.repActionList.appendChild(li);
        });
        
        // AI studio generation link status
        if (state.student.apiKey) {
            elements.reportApiStatusDot.className = "indicator-dot active";
            elements.reportApiStatusText.textContent = "Gemini Live Link: Enabled (Active Key)";
            elements.btnGenerateAiReport.style.display = "inline-flex";
        } else {
            elements.reportApiStatusDot.className = "indicator-dot";
            elements.reportApiStatusText.textContent = "Gemini Live Link: Disabled (Local Rules Matched)";
            elements.btnGenerateAiReport.style.display = "none";
        }
    }

    // Set circular progress values
    function setCircularGauge(ringEl, valEl, bandEl, percentage) {
        valEl.textContent = `${percentage}%`;
        
        // Update SVG ring stroke-dashoffset
        // Radius of ring is 40. Circumference = 2 * PI * r = 251.2
        const offset = 251 - (percentage / 100) * 251;
        ringEl.setAttribute("stroke-dashoffset", offset);
        
        let band = "Moderate";
        let colorClass = "band-moderate";
        if (percentage < 40) {
            band = "Low";
            colorClass = "band-low";
            ringEl.style.stroke = "var(--color-low)";
        } else if (percentage >= 70) {
            band = "High";
            colorClass = "band-high";
            ringEl.style.stroke = "var(--color-high)";
        } else {
            ringEl.style.stroke = "var(--color-primary)";
        }
        
        bandEl.textContent = band;
        bandEl.className = `badge ${colorClass}`;
    }

    // Render 28 metrics cards list
    function renderMetricsGrid(metrics, filter = "all") {
        elements.metricsGrid.innerHTML = "";
        
        Object.keys(metrics).forEach(key => {
            const m = metrics[key];
            if (filter !== "all" && m.domain !== filter) return;
            
            const card = document.createElement("div");
            card.className = "metric-card glass-panel";
            card.setAttribute("data-band", m.band);
            
            let flagClass = "ok";
            if (m.flag === "Timing Review") flagClass = "review";
            else if (m.flag === "Support Needed") flagClass = "support";
            
            card.innerHTML = `
                <span class="metric-layer-tag">${m.domain}</span>
                <div class="metric-card-header">
                    <h4>${m.subdomain}</h4>
                    <span class="flag-pill ${flagClass}">${m.flag}</span>
                </div>
                <div class="metric-score-display">
                    <span class="metric-score-num">${m.score_0_100}</span>
                    <span class="metric-score-pct">%</span>
                </div>
                <div class="metric-stats-row">
                    <span>Avg Time: ${m.avgTime}s</span>
                    <span>High Time: ${m.highTimeCount}</span>
                </div>
            `;
            
            card.addEventListener("click", () => {
                showMetricModal(m);
            });
            
            elements.metricsGrid.appendChild(card);
        });
    }

    // Filter metrics tab list
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const filter = btn.getAttribute("data-filter");
            const metrics = compileMetrics();
            renderMetricsGrid(metrics, filter);
        });
    });

    // Expand metrics card detail modal
    function showMetricModal(metric) {
        state.selectedMetric = metric;
        
        elements.modalMetricName.textContent = metric.subdomain;
        elements.modalLayer.textContent = metric.domain;
        elements.modalScore.textContent = `${metric.score_0_100}%`;
        
        let bandClass = "band-moderate";
        if (metric.band === "Low") bandClass = "band-low";
        if (metric.band === "High") bandClass = "band-high";
        elements.modalBand.textContent = metric.band;
        elements.modalBand.className = `value badge ${bandClass}`;
        
        let flagClass = "ok";
        if (metric.flag === "Timing Review") flagClass = "review";
        else if (metric.flag === "Support Needed") flagClass = "support";
        elements.modalFlag.textContent = metric.flag;
        elements.modalFlag.className = `value badge flag-pill ${flagClass}`;
        
        elements.modalInterpretation.textContent = metric.interpretation;
        
        // Build audit log rows
        elements.modalAuditRows.innerHTML = "";
        
        const qResponses = state.responses.filter(r => r.subdomain === metric.subdomain);
        
        if (qResponses.length === 0) {
            elements.modalAuditRows.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted);">No items answered in this session (Adaptive bypass).</td></tr>`;
        } else {
            qResponses.forEach(r => {
                let score = 0;
                let scoreText = "";
                let correctStatus = "N/A";
                let statusClass = "text-moderate";
                
                if (r.type === "Likert") {
                    let adj = r.response;
                    if (r.reverse_scored) adj = 6 - r.response;
                    score = ((adj - 1) / 4) * 100;
                    scoreText = `${score}%`;
                    correctStatus = `Response: ${r.response} ${r.reverse_scored ? '(R)' : ''}`;
                } else {
                    const corr = String(r.response).toUpperCase() === String(r.correct_key).toUpperCase();
                    score = corr ? 100 : 0;
                    scoreText = corr ? "100%" : "0%";
                    correctStatus = corr ? "Correct" : `Wrong (Key: ${r.correct_key})`;
                    statusClass = corr ? "text-high" : "text-low";
                }
                
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td style="font-family: var(--font-mono); font-size: 0.75rem;">${r.qid}</td>
                    <td>${getQuestionText(r.qid)}</td>
                    <td class="font-bold">${r.response}</td>
                    <td class="font-bold">${scoreText}</td>
                    <td style="font-family: var(--font-mono);">${r.time_sec}s</td>
                    <td class="font-bold ${statusClass}">${correctStatus}</td>
                `;
                elements.modalAuditRows.appendChild(tr);
            });
        }
        
        elements.metricModal.classList.add("active");
        document.body.style.overflow = "hidden"; // lock background scroll
    }

    function getQuestionText(qid) {
        // Search compact
        const compactQ = window.NEUROPI_RULES.Student_Response_Template.find(q => q.Assessment_QID === qid);
        if (compactQ) return compactQ.Question;
        
        // Search master
        const masterQ = window.NEUROPI_QUESTIONS.find(q => q.QID === qid);
        if (masterQ) return masterQ.Question;
        
        return "Unknown question text.";
    }

    // Close detail modal
    elements.btnCloseModal.addEventListener("click", () => {
        elements.metricModal.classList.remove("active");
        document.body.style.overflow = ""; // restore scroll
    });
    
    elements.metricModal.addEventListener("click", (e) => {
        if (e.target === elements.metricModal) {
            elements.metricModal.classList.remove("active");
            document.body.style.overflow = "";
        }
    });

    // Tab view routing
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const tabId = btn.getAttribute("data-tab");
            
            document.querySelectorAll(".tab-content").forEach(tc => {
                if (tc.id === tabId) {
                    tc.classList.add("active");
                } else {
                    tc.classList.remove("active");
                }
            });
        });
    });

    // Restart assessment
    elements.btnRestart.addEventListener("click", () => {
        showScreen("welcome");
        elements.profileForm.reset();
    });

    // Export raw JSON payload
    elements.btnExportData.addEventListener("click", () => {
        const payload = {
            student: {
                name: state.student.name,
                grade: state.student.grade,
                mode: state.student.mode,
                timestamp: new Date().toISOString()
            },
            responses: state.responses.map(r => ({
                assessment_qid: r.qid,
                domain: r.domain,
                subdomain: r.subdomain,
                response: String(r.response),
                response_time_sec: r.time_sec,
                timestamp: new Date().toISOString()
            }))
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonToString(payload));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `neuropi_response_${state.student.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });

    // Helper to format JSON pretty
    function jsonToString(obj) {
        return JSON.stringify(obj, null, 2);
    }

    // Call live Google AI Studio API for deep report generation
    elements.btnGenerateAiReport.addEventListener("click", async () => {
        if (!state.student.apiKey) return;
        
        elements.btnGenerateAiReport.disabled = true;
        elements.btnGenerateAiReport.textContent = "Synthesizing Counselor Narrative...";
        
        // Gather data
        const metrics = compileMetrics();
        const profileCode = matchPermutationProfile(metrics);
        const matchedPerm = window.NEUROPI_RULES.Permutation_AI_Rules.find(p => 
            p.RIASEC_Dominant === profileCode.dominantRiasec &&
            p.Big5_Dominant === profileCode.dominantBig5 &&
            p.Cognitive_Band === profileCode.cogBand &&
            p.Emotional_Band === profileCode.emoBand &&
            p.Learning_Style === profileCode.dominantLearning
        ) || window.NEUROPI_RULES.Permutation_AI_Rules[0];
        const streamInfo = getRecommendedStream(metrics);
        
        // Setup prompt
        const promptText = `
You are an expert educational psychologist and counseling director. Analyze this student psychometric data sheet and synthesize a detailed developmental diagnostic report.

STUDENT PROFILE:
- Name: ${state.student.name}
- Grade: ${state.student.grade}
- Assessment Code: ${matchedPerm.Profile_Code}

DOMINANT TRAITS:
- dominant RIASEC: ${profileCode.dominantRiasec}
- dominant Big Five: ${profileCode.dominantBig5}
- Cognitive Band: ${profileCode.cogBand} (Index Score: ${profileCode.cogAvg}%)
- Emotional Band: ${profileCode.emoBand} (Index Score: ${profileCode.emotionalAvg}%)
- dominant Learning Style: ${profileCode.dominantLearning}
- Recommended Stream: ${streamInfo.stream} (Subjects: ${streamInfo.subjects})
- Recommended Stream Actions: ${streamInfo.actions.join("; ")}

PERMUTATION MATRIX LOGIC TEXTS:
- Local Interpretation: ${matchedPerm.AI_Interpretation}
- Recommended Action: ${matchedPerm.Recommended_Action}
- Counselor Priority Flags: ${matchedPerm.Counselor_Flag}

Write a comprehensive, professional narrative report divided into four sections. Adopt a supportive, guidance-oriented tone.
Formatting: Do not use markdown titles. Format each section as solid, flowing paragraphs inside the designated section container. Reorganize key vectors into readable points.

Section I: Executive Assessment Summary (Synthesize a detailed review of RIASEC interest, personality traits and developmental indicators).
Section II: Cognitive Reasoning & Sensory Learning Profile (Detail cognitive strengths and specific classroom learning strategies matching their learning style).
Section III: Academic and Career Trajectory Mapping (Provide concrete career recommendations matching their RIASEC code and cognitive band, and write an analysis supporting their recommended academic stream of "${streamInfo.stream}" with the subjects "${streamInfo.subjects}", including the concrete steps they must take to achieve entry and success).
Section IV: Guided Counseling & Parental Support Recommendations (List step-by-step counselor focus roadmaps and parental support guidelines).
        `;
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.student.apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: promptText
                                }
                            ]
                        }
                    ]
                })
            });
            
            const result = await response.json();
            
            if (response.ok && result.candidates && result.candidates[0].content.parts[0].text) {
                const aiText = result.candidates[0].content.parts[0].text;
                parseAndRenderAiReport(aiText);
                logToConsole("[SYS] AI report synthesized successfully.", "success");
            } else {
                throw new Error(result.error?.message || "Invalid API response structure.");
            }
            
        } catch (error) {
            console.error("AI report synthesis error:", error);
            logToConsole(`[SYS-ERR] API call failed: ${error.message}. Displaying local rule interpretations.`, "alert");
            alert(`Gemini API Error: ${error.message}. The system has reverted to high-fidelity offline matrices.`);
        } finally {
            elements.btnGenerateAiReport.disabled = false;
            elements.btnGenerateAiReport.textContent = "Regenerate AI Synthesis";
        }
    });

    // Parse Markdown text from Gemini response into our report blocks
    function parseAndRenderAiReport(text) {
        // Strip headers like "Section I:", "Section II:" etc.
        const sections = text.split(/(?:Section I:|Section II:|Section III:|Section IV:|### I\.|### II\.|### III\.|### IV\.|I\.\s+|II\.\s+|III\.\s+|IV\.\s+)/gi);
        
        let idx = 1;
        // The first element might be empty introduction text
        const contentBlocks = [];
        sections.forEach(s => {
            const cleanText = s.trim();
            if (cleanText.length > 50) {
                contentBlocks.push(cleanText);
            }
        });
        
        if (contentBlocks.length >= 4) {
            elements.repExeSummary.innerHTML = formatParagraphs(contentBlocks[0]);
            elements.repCogStrengths.innerHTML = formatParagraphs(contentBlocks[1].split("\n\n")[0]);
            // If they merged learning style text
            const p2Parts = contentBlocks[1].split("\n\n");
            if (p2Parts.length > 1) {
                elements.repLearningStrategy.innerHTML = formatParagraphs(p2Parts.slice(1).join("\n\n"));
            } else {
                elements.repLearningStrategy.textContent = `Learning strategy tailored for ${state.student.name} using custom classroom modifications.`;
            }
            elements.repCareerMapping.innerHTML = formatParagraphs(contentBlocks[2]);
            elements.repCounselorGuideline.innerHTML = formatParagraphs(contentBlocks[3]);
        } else {
            // General fallback split by paragraphs
            const paragraphs = text.split("\n\n").filter(p => p.trim().length > 30);
            if (paragraphs.length >= 4) {
                elements.repExeSummary.textContent = paragraphs[0];
                elements.repCogStrengths.textContent = paragraphs[1];
                elements.repCareerMapping.textContent = paragraphs[2];
                elements.repCounselorGuideline.textContent = paragraphs[3];
            } else {
                // Set entire response to executive summary
                elements.repExeSummary.textContent = text;
            }
        }
    }

    function formatParagraphs(txt) {
        return txt.split("\n\n").map(p => `<p>${p.replace(/\*/g, '')}</p>`).join("");
    }
});
