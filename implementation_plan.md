# AI Semester Orchestrator — Implementation Plan

A multi-agent RAG-powered backend service that autonomously plans a student's semester by parsing academic documents, scheduling topics, and generating targeted study materials with quality-controlled quizzes.

---

## User Review Required

> [!IMPORTANT]
> **OpenAI API confirmed.** The plan uses `gpt-4o` for reasoning/generation and `text-embedding-3-small` for embeddings. Confirm if you'd prefer `gpt-4o-mini` to reduce costs during development.

> [!WARNING]
> **Supabase free tier auto-pauses** after 1 week of inactivity. The plan includes a keep-alive cron strategy, but you should be aware of this during development gaps.

> [!IMPORTANT]
> **Frontend scope.** Your spec mentions React/Next.js on Vercel. This plan focuses on the **backend** (FastAPI + LangGraph + DB). The frontend will be a separate phase. Should we include a minimal frontend plan now, or defer it entirely?

## Open Questions

1. **PDF format assumptions** — Are Academic Calendars always tabular (dates + events)? Are Syllabi structured with numbered topics, or free-form paragraphs? Knowing the format helps tune the extraction prompts.
2. **Multi-course support** — Should a student be able to upload documents for multiple courses in a single semester? The schema supports it, but the UI/UX flow differs.
3. **Authentication** — Do you need user authentication (JWT / Supabase Auth), or is this a single-user prototype for now?
4. **Quiz format** — The spec says "5-question quiz." Should these be MCQ (with 4 options), short-answer, or a mix?
5. **Deployment priority** — Should we deploy to GCP Cloud Run early (Phase 2) for live testing, or keep everything local until Phase 4?

---

## Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        FE["Next.js Frontend<br/>(Vercel)"]
    end

    subgraph "API Layer"
        API["FastAPI Backend<br/>(GCP Cloud Run)"]
    end

    subgraph "AI Orchestration Layer"
        SG["LangGraph StateGraph"]
        EA["Extraction Agent"]
        SA["Scheduler Agent"]
        RA["RAG Retrieval Agent"]
        CG["Content Generator Agent"]
        QC["Quality Control Agent"]
    end

    subgraph "Data Layer"
        PG["PostgreSQL<br/>(Supabase)"]
        VEC["pgvector Extension"]
    end

    subgraph "External Services"
        OAI["OpenAI API<br/>gpt-4o + embeddings"]
    end

    FE -->|REST API| API
    API --> SG
    SG --> EA
    SG --> SA
    SG --> RA
    SG --> CG
    SG --> QC
    QC -->|"❌ Hallucination detected"| RA
    QC -->|"✅ Accurate"| API
    EA --> PG
    SA --> PG
    RA --> VEC
    EA --> OAI
    CG --> OAI
    QC --> OAI
    RA --> OAI
```

---

## Proposed Changes

### Phase 1: Project Scaffolding & Database Schema

Set up the project structure, dependency management, configuration, and database migrations.

---

#### [NEW] [`backend/`](file:///c:/Users/hp/Downloads/AIsem/backend) — Project Root

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py                # Pydantic Settings (env vars)
│   ├── database.py              # Async SQLAlchemy engine + session
│   ├── models/
│   │   ├── __init__.py
│   │   ├── semester.py          # SQLAlchemy ORM: semesters, courses, holidays
│   │   ├── syllabus.py          # SQLAlchemy ORM: syllabus_topics
│   │   └── embedding.py         # SQLAlchemy ORM: notes_embeddings (pgvector)
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── upload.py            # Pydantic request/response for /upload
│   │   ├── roadmap.py           # Pydantic response for /roadmap
│   │   └── weekly_prep.py       # Pydantic response for /weekly-prep
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py            # Main APIRouter aggregating all routes
│   │   ├── upload.py            # POST /upload endpoint
│   │   ├── roadmap.py           # GET /roadmap endpoint
│   │   └── weekly_prep.py       # GET /weekly-prep/{week} endpoint
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── state.py             # TypedDict State definition for LangGraph
│   │   ├── graph.py             # LangGraph StateGraph wiring + conditional edges
│   │   ├── extraction.py        # Extraction Agent node
│   │   ├── scheduler.py         # Scheduler Agent node
│   │   ├── retrieval.py         # RAG Retrieval Agent node
│   │   ├── generator.py         # Content Generator Agent node
│   │   └── quality_control.py   # Quality Control Agent node (supervisor)
│   └── services/
│       ├── __init__.py
│       ├── pdf_parser.py        # PyMuPDF text extraction + chunking
│       ├── embeddings.py        # OpenAI embedding generation + pgvector upsert
│       └── llm.py               # OpenAI ChatCompletion wrapper with retry logic
├── migrations/
│   └── 001_initial_schema.sql   # Full SQL migration
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # Pytest fixtures (test DB, mock LLM)
│   ├── test_upload.py
│   ├── test_roadmap.py
│   ├── test_weekly_prep.py
│   └── test_agents.py
├── .env.example                 # Template for environment variables
├── .gitignore
├── Dockerfile
├── docker-compose.yml           # Local dev with PostgreSQL + pgvector
├── requirements.txt
└── README.md
```

---

#### [NEW] [`backend/requirements.txt`](file:///c:/Users/hp/Downloads/AIsem/backend/requirements.txt)

Core dependencies:

| Package | Purpose |
|---------|---------|
| `fastapi[standard]` | Web framework with Uvicorn bundled |
| `sqlalchemy[asyncio]` | Async ORM for PostgreSQL |
| `asyncpg` | Async PostgreSQL driver |
| `pgvector` | SQLAlchemy pgvector column type |
| `alembic` | Database migrations (optional, can use raw SQL) |
| `langchain-openai` | OpenAI LLM + Embeddings integration |
| `langgraph` | Multi-agent StateGraph orchestration |
| `langchain-core` | Base abstractions (Documents, Prompts) |
| `langchain-community` | Community integrations (PGVector store) |
| `pymupdf` | PDF text extraction (`fitz`) |
| `python-multipart` | File upload support for FastAPI |
| `pydantic-settings` | Environment variable management |
| `httpx` | Async HTTP client (for testing) |
| `pytest` / `pytest-asyncio` | Testing framework |

---

#### [NEW] [`backend/migrations/001_initial_schema.sql`](file:///c:/Users/hp/Downloads/AIsem/backend/migrations/001_initial_schema.sql)

**Relational Tables** — Deterministic schedule data:

```sql
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
```

> [!NOTE]
> The `vector(1536)` dimension matches OpenAI's `text-embedding-3-small` model. If you switch to `text-embedding-3-large` (3072 dims), update this column and the IVFFlat index accordingly.

---

#### [NEW] [`backend/app/config.py`](file:///c:/Users/hp/Downloads/AIsem/backend/app/config.py)

Environment-driven configuration using Pydantic Settings:

```python
class Settings(BaseSettings):
    # Database
    DATABASE_URL: str              # postgresql+asyncpg://user:pass@host/db
    
    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    
    # Chunking
    CHUNK_SIZE: int = 800          # Characters per chunk
    CHUNK_OVERLAP: int = 200       # Overlap between chunks
    
    # RAG
    RETRIEVAL_TOP_K: int = 10      # Number of chunks to retrieve
    
    # App
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
```

---

#### [NEW] [`backend/app/database.py`](file:///c:/Users/hp/Downloads/AIsem/backend/app/database.py)

Async SQLAlchemy engine with connection pooling:

- `create_async_engine` with `asyncpg` driver
- `async_sessionmaker` for dependency injection
- `get_db()` async generator for FastAPI `Depends()`

---

#### [NEW] [`backend/app/models/`](file:///c:/Users/hp/Downloads/AIsem/backend/app/models/) — SQLAlchemy ORM Models

Map directly to the SQL schema above. The `embedding.py` model uses `pgvector.sqlalchemy.Vector` for the embedding column.

---

### Phase 2: PDF Ingestion & Embedding Pipeline

Build the `/upload` endpoint and the document processing pipeline.

---

#### [NEW] [`backend/app/services/pdf_parser.py`](file:///c:/Users/hp/Downloads/AIsem/backend/app/services/pdf_parser.py)

**PDF text extraction and chunking logic:**

1. **Extract** — Use `pymupdf` (`fitz`) to extract raw text from each page, preserving page numbers in metadata.
2. **Clean** — Strip excessive whitespace, headers/footers, page numbers.
3. **Chunk** — Split text into overlapping chunks using a recursive character splitter:
   - `chunk_size=800` characters (configurable)
   - `chunk_overlap=200` characters
   - Respects paragraph boundaries where possible
4. **Return** — List of `DocumentChunk(text, metadata={page, file_name, chunk_index})` objects.

**File type classification** — The upload endpoint must distinguish between:
| File Type | Detection Strategy | Processing Path |
|-----------|-------------------|-----------------|
| Academic Calendar | Filename heuristic + LLM classification | → Extraction Agent |
| Syllabus | Filename heuristic + LLM classification | → Extraction Agent |
| Class Notes | Default / explicit label | → Embedding Pipeline |

---

#### [NEW] [`backend/app/services/embeddings.py`](file:///c:/Users/hp/Downloads/AIsem/backend/app/services/embeddings.py)

**Embedding generation and storage:**

1. Batch chunks (max 2048 per API call for `text-embedding-3-small`)
2. Call `openai.embeddings.create()` with the batch
3. Upsert into `notes_embeddings` table with course association
4. Return chunk count for confirmation

---

#### [NEW] [`backend/app/services/llm.py`](file:///c:/Users/hp/Downloads/AIsem/backend/app/services/llm.py)

**Centralized LLM wrapper:**

- Async OpenAI client with exponential backoff retry (3 attempts)
- Structured output via `response_format` (JSON mode) for extraction
- Token usage logging for cost tracking
- Temperature configuration per agent (0.0 for extraction, 0.7 for generation)

---

#### [NEW] [`backend/app/api/upload.py`](file:///c:/Users/hp/Downloads/AIsem/backend/app/api/upload.py)

**`POST /upload`** — Accepts `multipart/form-data`:

```
Request:
  - files: List[UploadFile]        (PDF files)
  - course_code: str               (e.g. "CS301")
  - course_name: str               (e.g. "Operating Systems")
  - semester_name: str             (e.g. "Fall 2026")
  - file_types: List[str]          (e.g. ["calendar", "syllabus", "notes"])

Response:
  {
    "status": "success",
    "semester_id": "uuid",
    "course_id": "uuid",
    "files_processed": [
      {"filename": "calendar.pdf", "type": "calendar", "status": "extracted"},
      {"filename": "syllabus.pdf", "type": "syllabus", "status": "extracted"},
      {"filename": "notes.pdf",    "type": "notes",    "status": "embedded", "chunks": 142}
    ]
  }
```

**Processing flow:**
1. Create or find existing `semester` and `course` records
2. For each file, based on its declared type:
   - **Calendar/Syllabus** → Parse PDF → Send to Extraction Agent → Store structured data in relational tables
   - **Notes** → Parse PDF → Chunk → Embed → Store in `notes_embeddings`

---

### Phase 3: LangGraph Multi-Agent Workflow

The core intelligence layer. Five agents orchestrated by a LangGraph `StateGraph`.

---

#### [NEW] [`backend/app/agents/state.py`](file:///c:/Users/hp/Downloads/AIsem/backend/app/agents/state.py)

**Central state definition:**

```python
from typing import TypedDict, Annotated, Literal
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    # Input
    course_id: str
    semester_id: str
    request_type: Literal["extract", "schedule", "weekly_prep"]
    target_week: int | None
    
    # Extraction results
    extracted_calendar: dict | None       # {start_date, end_date, holidays: [...]}
    extracted_topics: list[dict] | None   # [{topic_name, order}, ...]
    
    # Scheduler results
    roadmap: list[dict] | None            # [{week, start_date, end_date, topics: [...]}]
    
    # RAG results
    retrieved_chunks: list[str] | None    # Raw text chunks from vector search
    retrieval_query: str | None           # Current search query
    retrieval_attempts: int               # Counter for QC retry loop (max 3)
    
    # Generator results
    summary: str | None                   # Bulleted summary markdown
    quiz: list[dict] | None              # [{question, options, answer, explanation}]
    
    # QC results
    qc_passed: bool | None
    qc_feedback: str | None              # Reason for rejection
    
    # Messages (for LangGraph tracing)
    messages: Annotated[list, add_messages]
    
    # Error handling
    error: str | None
```

---

#### [NEW] [`backend/app/agents/extraction.py`](file:///c:/Users/hp/Downloads/AIsem/backend/app/agents/extraction.py)

**Extraction Agent — Structured data extraction from PDFs:**

**For Academic Calendar:**
- System prompt instructs LLM to extract: `semester_start`, `semester_end`, `midterm_week`, and a list of `holidays` with dates and descriptions
- Uses OpenAI function calling / structured output to enforce a rigid JSON schema
- Writes results to `semesters` and `holidays` tables

**For Syllabus:**
- System prompt instructs LLM to extract an ordered list of topics
- Uses structured output: `[{topic_name: str, order: int}]`
- Writes results to `syllabus_topics` table

**Prompt design:**
```
You are an academic document parser. Extract the following from this {doc_type}:
[JSON schema definition]

Rules:
- Dates must be in ISO 8601 format (YYYY-MM-DD)
- Topics must preserve their original ordering
- If a date range is given for a holiday, create one entry per day
- Do NOT infer or fabricate data not present in the document
```

---

#### [NEW] [`backend/app/agents/scheduler.py`](file:///c:/Users/hp/Downloads/AIsem/backend/app/agents/scheduler.py)

**Scheduler Agent — Deterministic planning logic:**

This agent is primarily algorithmic (minimal LLM usage):

1. **Query** the `semesters` table for `start_date`, `end_date`, `midterm_week`
2. **Query** the `holidays` table for all holiday dates
3. **Calculate** available teaching weeks:
   - Generate all weeks from `start_date` to `end_date`
   - Exclude weeks containing holidays or the midterm week
4. **Query** `syllabus_topics` ordered by `topic_order`
5. **Distribute** topics evenly across available weeks:
   - `topics_per_week = ceil(total_topics / available_weeks)`
   - Assign `scheduled_week` to each topic
6. **Update** `syllabus_topics.scheduled_week` in the database
7. **Return** the full roadmap as structured JSON

```python
# Output format
roadmap = [
    {
        "week": 1,
        "start_date": "2026-09-14",
        "end_date": "2026-09-18",
        "topics": ["Introduction to OS", "History of Operating Systems"],
        "is_holiday": False,
        "is_midterm": False
    },
    ...
]
```

---

#### [NEW] [`backend/app/agents/retrieval.py`](file:///c:/Users/hp/Downloads/AIsem/backend/app/agents/retrieval.py)

**RAG Retrieval Agent — Semantic search over embedded notes:**

1. **Identify** the topics scheduled for `target_week` from `syllabus_topics`
2. **Construct** a semantic search query by concatenating topic names
3. **Embed** the query using `text-embedding-3-small`
4. **Search** `notes_embeddings` using cosine similarity:
   ```sql
   SELECT chunk_text, 1 - (embedding <=> query_embedding) AS similarity
   FROM notes_embeddings
   WHERE course_id = :course_id
   ORDER BY embedding <=> query_embedding
   LIMIT :top_k
   ```
5. **Filter** results with a minimum similarity threshold (0.7)
6. **Return** retrieved chunks as context for the generator

**On QC retry** (cyclic route back):
- Expand the query with QC feedback
- Increase `top_k` by 5
- Try alternative query formulations (individual topic queries merged)

---

#### [NEW] [`backend/app/agents/generator.py`](file:///c:/Users/hp/Downloads/AIsem/backend/app/agents/generator.py)

**Content Generator Agent — Synthesis of study materials:**

Produces two artifacts from the retrieved context:

**1. Bulleted Summary:**
```
System: You are an academic tutor. Given the following notes context
and the topics for Week {n}, create a concise bulleted summary.

Rules:
- Only use information present in the provided context
- Organize by topic
- Highlight key definitions, formulas, and theorems
- Use markdown formatting
```

**2. Weekly Quiz (5 questions):**
```
System: Generate exactly 5 quiz questions based ONLY on the provided
context for the specified topics.

Output JSON schema:
[{
  "question": str,
  "options": [str, str, str, str],   // 4 options (A-D)
  "correct_answer": "A"|"B"|"C"|"D",
  "explanation": str,
  "source_topic": str
}]

Rules:
- Questions must be directly answerable from the context
- Each question must cite which topic it covers
- Include a mix of conceptual and application questions
- Do NOT ask about material outside the provided context
```

---

#### [NEW] [`backend/app/agents/quality_control.py`](file:///c:/Users/hp/Downloads/AIsem/backend/app/agents/quality_control.py)

**Quality Control Agent — Hallucination prevention supervisor:**

```
System: You are a quality control reviewer. Compare each quiz question
against the retrieved notes context.

For each question, determine:
1. Is the answer supported by the context? (grounded check)
2. Does the question reference material outside the context? (hallucination check)
3. Is the question unambiguous and well-formed? (quality check)

Output:
{
  "passed": bool,
  "failed_questions": [int],       // indices of failed questions
  "feedback": str,                 // guidance for retry
  "confidence": float              // 0.0 to 1.0
}
```

**Routing logic (conditional edge in LangGraph):**

```python
def route_after_qc(state: AgentState) -> str:
    if state["qc_passed"]:
        return "end"
    if state["retrieval_attempts"] >= 3:
        return "end"  # Return best effort after 3 attempts
    return "retrieval"  # Cyclic route back
```

---

#### [NEW] [`backend/app/agents/graph.py`](file:///c:/Users/hp/Downloads/AIsem/backend/app/agents/graph.py)

**LangGraph StateGraph wiring:**

```mermaid
graph LR
    START(("START")) --> R{"request_type?"}
    R -->|extract| EX["Extraction Agent"]
    R -->|schedule| SC["Scheduler Agent"]
    R -->|weekly_prep| RAG["RAG Retrieval Agent"]
    
    EX --> END(("END"))
    SC --> END
    
    RAG --> GEN["Content Generator"]
    GEN --> QC["Quality Control"]
    QC -->|"✅ pass"| END
    QC -->|"❌ fail (attempts < 3)"| RAG
    QC -->|"❌ fail (attempts >= 3)"| END
```

**Implementation:**

```python
from langgraph.graph import StateGraph, END

graph = StateGraph(AgentState)

# Add nodes
graph.add_node("extraction", extraction_node)
graph.add_node("scheduler", scheduler_node)
graph.add_node("retrieval", retrieval_node)
graph.add_node("generator", generator_node)
graph.add_node("quality_control", qc_node)

# Entry routing
graph.add_conditional_edges(
    "__start__",
    route_by_request_type,
    {
        "extract": "extraction",
        "schedule": "scheduler",
        "weekly_prep": "retrieval",
    }
)

# Linear edges
graph.add_edge("extraction", END)
graph.add_edge("scheduler", END)
graph.add_edge("retrieval", "generator")
graph.add_edge("generator", "quality_control")

# Cyclic conditional edge (QC → Retrieval or END)
graph.add_conditional_edges(
    "quality_control",
    route_after_qc,
    {
        "retrieval": "retrieval",
        "end": END,
    }
)

app = graph.compile()
```

---

### Phase 4: API Endpoints (Remaining)

---

#### [NEW] [`backend/app/api/roadmap.py`](file:///c:/Users/hp/Downloads/AIsem/backend/app/api/roadmap.py)

**`GET /roadmap?course_id={uuid}`**

```
Response:
{
  "course": {"id": "uuid", "name": "Operating Systems", "code": "CS301"},
  "semester": {"name": "Fall 2026", "start": "2026-09-14", "end": "2026-12-20"},
  "total_weeks": 14,
  "teaching_weeks": 12,
  "roadmap": [
    {
      "week": 1,
      "start_date": "2026-09-14",
      "end_date": "2026-09-18",
      "topics": ["Introduction to OS", "History of Operating Systems"],
      "is_holiday": false,
      "is_midterm": false
    },
    ...
  ]
}
```

Triggers the Scheduler Agent if the roadmap hasn't been generated yet; otherwise returns cached results from the database.

---

#### [NEW] [`backend/app/api/weekly_prep.py`](file:///c:/Users/hp/Downloads/AIsem/backend/app/api/weekly_prep.py)

**`GET /weekly-prep/{week}?course_id={uuid}`**

```
Response:
{
  "week": 3,
  "topics": ["Process Scheduling", "CPU Algorithms"],
  "summary": "## Week 3: Process Scheduling & CPU Algorithms\n\n- **Process Scheduling** ...",
  "quiz": [
    {
      "question": "Which scheduling algorithm provides the minimum average waiting time?",
      "options": ["FCFS", "SJF", "Round Robin", "Priority"],
      "correct_answer": "B",
      "explanation": "SJF (Shortest Job First) is proven to give minimum average waiting time...",
      "source_topic": "CPU Algorithms"
    },
    ...
  ],
  "quality_score": 0.95,
  "retrieval_attempts": 1
}
```

Triggers the full RAG pipeline: Retrieval → Generator → QC (with cyclic retry).

---

### Phase 5: Local Development Infrastructure

---

#### [NEW] [`backend/docker-compose.yml`](file:///c:/Users/hp/Downloads/AIsem/backend/docker-compose.yml)

Local development stack:

```yaml
services:
  db:
    image: pgvector/pgvector:pg16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: aisemester
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d

  backend:
    build: .
    ports: ["8000:8000"]
    env_file: .env
    depends_on: [db]
    volumes:
      - ./app:/app/app  # Hot reload
```

---

#### [NEW] [`backend/Dockerfile`](file:///c:/Users/hp/Downloads/AIsem/backend/Dockerfile)

Multi-stage build for production:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### Phase 6: Testing & Quality Assurance

---

#### [NEW] [`backend/tests/`](file:///c:/Users/hp/Downloads/AIsem/backend/tests/) — Test Suite

| Test File | What It Covers |
|-----------|----------------|
| `test_upload.py` | File upload validation, PDF parsing, chunk counts |
| `test_roadmap.py` | Schedule calculation, topic distribution, holiday exclusion |
| `test_weekly_prep.py` | End-to-end RAG pipeline, response schema validation |
| `test_agents.py` | Individual agent nodes with mocked LLM responses |
| `conftest.py` | Test DB setup, fixtures, mock OpenAI client |

**Testing strategy:**
- Use `pytest-asyncio` for async endpoint testing
- Mock OpenAI calls with pre-recorded responses to avoid API costs during CI
- Use a separate test database (SQLite or test PostgreSQL container)

---

### Phase 7: Cloud Deployment (Deferred)

> [!NOTE]
> This phase is deferred until the backend is fully functional locally. Included here for completeness.

1. **GCP Cloud Run** — Build Docker image → Push to Artifact Registry → Deploy to Cloud Run
2. **Supabase** — Run migration SQL → Configure connection string → Set up keepalive ping
3. **Vercel** — Deploy Next.js frontend → Configure `NEXT_PUBLIC_API_URL` env var
4. **Billing alert** — Set $0.01 GCP billing alert immediately

---

## Implementation Order & Effort Estimates

| # | Phase | Key Deliverable | Est. Effort |
|---|-------|-----------------|-------------|
| 1 | Project Scaffolding | Project structure, DB schema, config | ~1 hour |
| 2 | PDF Ingestion | `/upload` endpoint, PDF parsing, embeddings | ~3 hours |
| 3 | LangGraph Agents | All 5 agents + StateGraph wiring | ~4 hours |
| 4 | API Endpoints | `/roadmap` + `/weekly-prep` endpoints | ~2 hours |
| 5 | Local Dev Infra | Docker Compose, hot reload | ~30 min |
| 6 | Testing | Unit + integration tests | ~2 hours |
| 7 | Cloud Deployment | GCP + Supabase + Vercel | ~2 hours |

**Total estimated effort: ~14.5 hours**

---

## Verification Plan

### Automated Tests
```bash
# Run full test suite
cd backend && pytest tests/ -v --asyncio-mode=auto

# Run with coverage
pytest tests/ --cov=app --cov-report=term-missing
```

### Manual Verification
1. **Upload flow** — Upload a sample Academic Calendar PDF, Syllabus PDF, and Class Notes PDF via `/upload`. Verify relational tables are populated and embeddings are stored.
2. **Roadmap** — Call `GET /roadmap` and verify topics are distributed across teaching weeks, holidays are excluded, and midterm week is marked.
3. **Weekly prep** — Call `GET /weekly-prep/3` and verify:
   - Summary covers only Week 3 topics
   - Quiz questions are grounded in the notes context
   - QC agent passes on first attempt (or retries successfully)
4. **Hallucination test** — Intentionally upload minimal notes and verify QC agent catches questions about uncovered material and triggers retry loop.
5. **API docs** — Verify Swagger UI at `/docs` shows all endpoints with correct schemas.
