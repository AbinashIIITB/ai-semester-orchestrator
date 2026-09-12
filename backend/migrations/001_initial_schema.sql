-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Core semester structure
CREATE TABLE semesters (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,          -- e.g. "Fall 2026"
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    midterm_week INTEGER,                       -- Week number for midterms
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE courses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    code        VARCHAR(20) NOT NULL,           -- e.g. "CS301"
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE holidays (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
    date        DATE NOT NULL,
    description VARCHAR(200) NOT NULL,
    UNIQUE(semester_id, date)
);

CREATE TABLE syllabus_topics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID REFERENCES courses(id) ON DELETE CASCADE,
    topic_name      VARCHAR(300) NOT NULL,
    topic_order     INTEGER NOT NULL,           -- Original ordering from syllabus
    scheduled_week  INTEGER,                    -- Assigned by Scheduler Agent
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Vector table for unstructured RAG data
CREATE TABLE notes_embeddings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id   UUID REFERENCES courses(id) ON DELETE CASCADE,
    chunk_text  TEXT NOT NULL,
    embedding   vector(1536),                   -- text-embedding-3-small dimension
    metadata    JSONB DEFAULT '{}',             -- {page_number, file_name, chunk_index}
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast vector similarity search
CREATE INDEX ON notes_embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Index for filtering by course
CREATE INDEX idx_notes_course ON notes_embeddings(course_id);
CREATE INDEX idx_topics_course ON syllabus_topics(course_id);
CREATE INDEX idx_topics_week ON syllabus_topics(scheduled_week);
