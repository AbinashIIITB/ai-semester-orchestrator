from typing import TypedDict, Annotated, Literal, List, Dict, Any
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    # Input
    course_id: str
    semester_id: str
    request_type: Literal["extract", "schedule", "weekly_prep"]
    target_week: int | None
    
    # Raw input for extraction (temporary payload)
    raw_document_text: str | None
    document_type: str | None
    
    # Extraction results
    extracted_calendar: Dict[str, Any] | None       # {start_date, end_date, holidays: [...]}
    extracted_topics: List[Dict[str, Any]] | None   # [{topic_name, order}, ...]
    
    # Scheduler results
    roadmap: List[Dict[str, Any]] | None            # [{week, start_date, end_date, topics: [...]}]
    
    # RAG results
    retrieved_chunks: List[str] | None    # Raw text chunks from vector search
    retrieval_query: str | None           # Current search query
    retrieval_attempts: int               # Counter for QC retry loop (max 3)
    
    # Generator results
    summary: str | None                   # Bulleted summary markdown
    quiz: List[Dict[str, Any]] | None     # [{question, options, answer, explanation}]
    
    # QC results
    qc_passed: bool | None
    qc_feedback: str | None              # Reason for rejection
    
    # Messages (for LangGraph tracing)
    messages: Annotated[list, add_messages]
    
    # Error handling
    error: str | None
