from pydantic import BaseModel, Field
from typing import List
from langchain_core.prompts import ChatPromptTemplate

from .state import AgentState
from ..services.llm import get_llm

# --- Schemas ---

class QuizOption(BaseModel):
    label: str = Field(description="Option letter (A, B, C, or D)")
    text: str = Field(description="The actual text of the option")

class QuizQuestion(BaseModel):
    question: str = Field(description="The quiz question text")
    options: List[QuizOption] = Field(description="Exactly 4 options for the question")
    correct_answer: str = Field(description="The label (A, B, C, or D) of the correct answer")
    explanation: str = Field(description="Brief explanation of why the answer is correct")
    source_topic: str = Field(description="The specific topic this question covers")

class Quiz(BaseModel):
    questions: List[QuizQuestion] = Field(description="Exactly 5 quiz questions")

# --- Prompts ---

summary_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert academic tutor. 
Given the provided course notes context and the topics for the week, create a concise, well-structured bulleted summary.
Rules:
- ONLY use information present in the provided context.
- Organize the summary logically by topic.
- Highlight key definitions, formulas, or theorems.
- Use Markdown formatting.
"""),
    ("human", "Topics for the week: {topics}\n\nContext Notes:\n{context}")
])

quiz_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert academic tutor. 
Generate exactly 5 multiple-choice quiz questions based ONLY on the provided context for the specified topics.
Rules:
- Questions MUST be directly answerable from the context. Do not include outside knowledge.
- Provide exactly 4 options (A, B, C, D) per question.
- Include a mix of conceptual and application questions if the context allows.
"""),
    ("human", "Topics for the week: {topics}\n\nContext Notes:\n{context}")
])

# --- Node Function ---

async def generator_node(state: AgentState) -> AgentState:
    """
    Content Generator Agent.
    Creates a markdown summary and a 5-question JSON quiz from retrieved context.
    """
    target_week = state.get("target_week")
    roadmap = state.get("roadmap")
    context_chunks = state.get("retrieved_chunks")
    
    if not roadmap or not target_week or not context_chunks:
         return {**state, "error": "Missing data for generation (roadmap, target_week, or context)"}
         
    week_data = next((w for w in roadmap if w.get("week") == target_week), None)
    topics_str = ", ".join(week_data["topics"]) if week_data else "Unknown topics"
    context_str = "\n\n".join(context_chunks)
    
    llm = get_llm(temperature=0.7) # Slightly higher temp for creative summary generation
    
    try:
        # Generate Summary (Markdown string)
        summary_chain = summary_prompt | llm
        summary_msg = await summary_chain.ainvoke({
            "topics": topics_str,
            "context": context_str
        })
        summary_markdown = summary_msg.content
        
        # Generate Quiz (Structured Output)
        structured_llm = llm.with_structured_output(Quiz)
        quiz_chain = quiz_prompt | structured_llm
        quiz_result = await quiz_chain.ainvoke({
            "topics": topics_str,
            "context": context_str
        })
        
        return {
            **state,
            "summary": summary_markdown,
            "quiz": [q.model_dump() for q in quiz_result.questions],
            "error": None
        }
        
    except Exception as e:
        return {**state, "error": f"Generation failed: {str(e)}"}
