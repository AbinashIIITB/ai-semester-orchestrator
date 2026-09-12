import json
from pydantic import BaseModel, Field
from typing import List
from langchain_core.prompts import ChatPromptTemplate

from .state import AgentState
from ..services.llm import get_llm

# --- Schemas ---

class QCResult(BaseModel):
    passed: bool = Field(description="True if all questions are grounded and accurate, False otherwise")
    failed_questions: List[int] = Field(description="Indices (0-4) of questions that failed the check")
    feedback: str = Field(description="Constructive feedback on what material was missing or hallucinated to guide retrieval retry")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0")

# --- Prompts ---

qc_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a strict Quality Control supervisor.
Your job is to evaluate a generated quiz against the provided source context.
For EACH question in the quiz, you must verify:
1. Is the correct answer explicitly supported by the context?
2. Does the question avoid referencing material outside the context? (Zero hallucination tolerance)
3. Is the question unambiguous?

If ANY question fails these checks, you must mark `passed` as false, list the failed indices, and provide `feedback` explaining what specific concepts need better context retrieval.
"""),
    ("human", "Source Context:\n{context}\n\nGenerated Quiz (JSON):\n{quiz}")
])

# --- Node Function ---

async def qc_node(state: AgentState) -> AgentState:
    """
    Quality Control Agent.
    Evaluates the generated quiz against the retrieved context to prevent hallucinations.
    """
    quiz_data = state.get("quiz")
    context_chunks = state.get("retrieved_chunks")
    
    if not quiz_data or not context_chunks:
         return {**state, "error": "Missing quiz or context for QC"}
         
    context_str = "\n\n".join(context_chunks)
    quiz_str = json.dumps(quiz_data, indent=2)
    
    llm = get_llm(temperature=0.0) # Strict deterministic evaluation
    structured_llm = llm.with_structured_output(QCResult)
    
    try:
        chain = qc_prompt | structured_llm
        result = await chain.ainvoke({
            "context": context_str,
            "quiz": quiz_str
        })
        
        return {
            **state,
            "qc_passed": result.passed,
            "qc_feedback": result.feedback if not result.passed else None,
            "error": None
        }
        
    except Exception as e:
        return {**state, "error": f"QC evaluation failed: {str(e)}"}
