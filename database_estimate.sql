-- ============================================================
-- PostgreSQL Database Size Estimation Script
-- Tables: User Exam Report, User Response, Marks Report, User PY
-- ============================================================

-- 1. CREATE TABLES (if not already exist)
-- ============================================================
-- All tables prefixed with est_ for easy cleanup:
--   DROP TABLE IF EXISTS est_user_exam_report, est_user_response, est_marks_report, est_user_py CASCADE;

CREATE TABLE IF NOT EXISTS est_user_py (
    id          BIGSERIAL PRIMARY KEY,
    fullname    VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS est_user_exam_report (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    exam_id         BIGINT NOT NULL,
    total_questions INT NOT NULL DEFAULT 0,
    correct_answers INT NOT NULL DEFAULT 0,
    wrong_answers   INT NOT NULL DEFAULT 0,
    score           NUMERIC(10, 2) DEFAULT 0,
    percentage      NUMERIC(5, 2) DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'pending',
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS est_user_response (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    exam_id         BIGINT NOT NULL,
    question_id     BIGINT NOT NULL,
    selected_option VARCHAR(10),
    is_correct      BOOLEAN DEFAULT FALSE,
    response_time   INT DEFAULT 0,  -- seconds
    attempted_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS est_marks_report (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    exam_id         BIGINT NOT NULL,
    subject_id      BIGINT,
    marks_obtained  NUMERIC(8, 2) DEFAULT 0,
    total_marks     NUMERIC(8, 2) DEFAULT 0,
    grade           VARCHAR(5),
    remarks         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_est_user_exam_report_user ON est_user_exam_report(user_id);
CREATE INDEX IF NOT EXISTS idx_est_user_exam_report_exam ON est_user_exam_report(exam_id);
CREATE INDEX IF NOT EXISTS idx_est_user_response_user   ON est_user_response(user_id);
CREATE INDEX IF NOT EXISTS idx_est_user_response_exam   ON est_user_response(exam_id);
CREATE INDEX IF NOT EXISTS idx_est_marks_report_user    ON est_marks_report(user_id);
CREATE INDEX IF NOT EXISTS idx_est_marks_report_exam    ON est_marks_report(exam_id);

-- 3. SIZE ESTIMATION
-- ============================================================
-- Run this query after inserting sample data, or adjust row counts below.

WITH
est AS (
    SELECT
        -- Adjust these row estimates as needed
        100000  AS est_user_exam_report_rows,   -- ~100k exams taken
        500000  AS est_user_response_rows,       -- ~500k answer records
        100000  AS est_marks_report_rows         -- ~100k mark entries
),
col_sizes AS (
    SELECT
        'est_user_exam_report' AS table_name,
        8   AS bigint_cols,     -- id(8) + user_id(8) + exam_id(8) = 24
        4   AS int_cols,        -- total_q(4) + correct(4) + wrong(4) = 12
        8   AS numeric_cols,    -- score(8) + percentage(8) = 16
        20  AS varchar_cols,    -- status(20)
        16  AS timestamptz_cols,-- started_at(8) + completed_at(8) = 16 ... actually 8 each
        -- re-calc below more accurately
        0   AS text_cols
),
calc AS (
    SELECT
        'est_user_exam_report' AS table_name,
        est_user_exam_report_rows,
        -- Row overhead: 24 (tuple header) + 4 (null bitmap) + 6 (item pointer) = ~34
        -- Per-column storage (averages):
        -- id(8) + user_id(8) + exam_id(8) = 24
        -- total_questions(4) + correct(4) + wrong(4) = 12
        -- score(8) + percentage(8) = 16  (NUMERIC ~8 avg)
        -- status(20) VARCHAR
        -- started_at(8) + completed_at(8) + created_at(8) + updated_at(8) = 32
        -- Total per row ~ 34 + 24 + 12 + 16 + 20 + 32 = ~138 bytes
        138 AS row_size_bytes
    FROM est
    UNION ALL
    SELECT
        'est_user_response' AS table_name,
        est_user_response_rows,
        -- id(8) + user_id(8) + exam_id(8) + question_id(8) = 32
        -- selected_option VARCHAR avg 3
        -- is_correct BOOLEAN(1)
        -- response_time INT(4)
        -- attempted_at TIMESTAMPTZ(8)
        -- overhead ~34
        -- Total ~ 34 + 32 + 3 + 1 + 4 + 8 = ~82 bytes
        82 AS row_size_bytes
    FROM est
    UNION ALL
    SELECT
        'est_marks_report' AS table_name,
        est_marks_report_rows,
        -- id(8) + user_id(8) + exam_id(8) + subject_id(8) = 32
        -- marks_obtained(8) + total_marks(8) = 16
        -- grade VARCHAR avg 3
        -- remarks TEXT avg 50
        -- created_at(8)
        -- overhead ~34
        -- Total ~ 34 + 32 + 16 + 3 + 50 + 8 = ~143 bytes
        143 AS row_size_bytes
    FROM est
)
SELECT
    table_name,
    row_count,
    row_size_bytes,
    row_count * row_size_bytes AS data_size_bytes,
    ROUND(row_count * row_size_bytes / 1024.0 / 1024.0, 2) AS data_size_mb,
    ROUND(row_count * row_size_bytes * 1.3 / 1024.0 / 1024.0, 2) AS total_est_mb, -- includes indexes (~30% overhead)
    ROUND(row_count * row_size_bytes * 1.5 / 1024.0 / 1024.0 / 1024.0, 4) AS total_est_gb
FROM calc
UNION ALL
SELECT
    'TOTAL' AS table_name,
    SUM(row_count),
    NULL,
    SUM(row_count * row_size_bytes),
    ROUND(SUM(row_count * row_size_bytes) / 1024.0 / 1024.0, 2),
    ROUND(SUM(row_count * row_size_bytes * 1.3) / 1024.0 / 1024.0, 2),
    ROUND(SUM(row_count * row_size_bytes * 1.5) / 1024.0 / 1024.0 / 1024.0, 4)
FROM calc;

-- 4. ACTUAL SIZE CHECK (run this if tables already have data)
-- ============================================================
SELECT
    relname AS table_name,
    n_live_tup AS row_count,
    ROUND(pg_total_relation_size(relid) / 1024.0 / 1024.0, 2) AS total_size_mb,
    ROUND(pg_relation_size(relid) / 1024.0 / 1024.0, 2) AS data_size_mb,
    ROUND(pg_indexes_size(relid) / 1024.0 / 1024.0, 2) AS index_size_mb
FROM pg_stat_user_tables
WHERE relname IN ('est_user_exam_report', 'est_user_response', 'est_marks_report')
ORDER BY relname;
