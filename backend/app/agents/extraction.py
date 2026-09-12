import json
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List, Optional

from .state import AgentState
from ..services.llm import get_llm

# --- Schemas ---

class HolidayInfo(BaseModel):
    date: str = Field(description="Holiday date in YYYY-MM-DD format")
    description: str = Field(description="Name or description of the holiday")

class CalendarExtraction(BaseModel):
    start_date: str = Field(description="Semester start date in YYYY-MM-DD format")
    end_date: str = Field(description="Semester end date in YYYY-MM-DD format")
    midterm_week: Optional[int] = Field(description="Week number for midterms, if specified", default=None)
    holidays: List[HolidayInfo] = Field(description="List of holidays and breaks during the semester")

class TopicInfo(BaseModel):
    topic_name: str = Field(description="Name of the topic or concept")
    topic_order: int = Field(description="Sequential order of the topic as it appears in the syllabus (1-indexed)")

class SyllabusExtraction(BaseModel):
    topics: List[TopicInfo] = Field(description="Ordered list of topics from the syllabus")


# --- Prompts ---

calendar_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert academic document parser. 
Extract the semester start date, end date, midterm week (if any), and all holidays/breaks from the provided academic calendar.
Rules:
- Dates MUST be in ISO 8601 format (YYYY-MM-DD).
- If a date range is given for a holiday, create one entry per day or approximate the start date.
- Do NOT infer or fabricate data not present in the document.
"""),
    ("human", "Academic Calendar Text:\n\n{text}")
])

syllabus_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert academic document parser.
Extract an ordered list of topics or concepts from the provided syllabus.
Rules:
- Preserve the original sequential order.
- Consolidate minor sub-topics into their parent topic if it makes sense.
- Only extract the topic name and its order.
"""),
    ("human", "Syllabus Text:\n\n{text}")
])


# --- Node Function ---

async def extraction_node(state: AgentState) -> AgentState:
    """Extracts structured data from raw calendar or syllabus text."""
    
    text = state.get("raw_document_text")
    doc_type = state.get("document_type")
    
    if not text or not doc_type:
        return {**state, "error": "Missing raw text or document type for extraction"}
        
    llm = get_llm(temperature=0.0) # Low temp for deterministic extraction
    
    try:
        if doc_type == "calendar":
            structured_llm = llm.with_structured_output(CalendarExtraction)
            chain = calendar_prompt | structured_llm
            result = await chain.ainvoke({"text": text})
            return {
                **state, 
                "extracted_calendar": result.model_dump(),
                "error": None
            }
            
        elif doc_type == "syllabus":
            structured_llm = llm.with_structured_output(SyllabusExtraction)
            chain = syllabus_prompt | structured_llm
            result = await chain.ainvoke({"text": text})
            return {
                **state, 
                "extracted_topics": result.model_dump()["topics"],
                "error": None
            }
        else:
            return {**state, "error": f"Unknown document type for extraction: {doc_type}"}
            
    except Exception as e:
        return {**state, "error": f"Extraction failed: {str(e)}"}
