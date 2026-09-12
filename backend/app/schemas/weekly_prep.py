from pydantic import BaseModel
from typing import List

class QuizOptionResponse(BaseModel):
    label: str
    text: str

class QuizQuestionResponse(BaseModel):
    question: str
    options: List[QuizOptionResponse]
    correct_answer: str
    explanation: str
    source_topic: str

class WeeklyPrepResponse(BaseModel):
    week: int
    topics: List[str]
    summary: str
    quiz: List[QuizQuestionResponse]
    quality_passed: bool
    retrieval_attempts: int
