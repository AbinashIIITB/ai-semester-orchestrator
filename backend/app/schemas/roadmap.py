from pydantic import BaseModel
from typing import List
import uuid

class CourseInfo(BaseModel):
    id: uuid.UUID
    name: str
    code: str

class SemesterInfo(BaseModel):
    name: str
    start: str
    end: str

class RoadmapWeek(BaseModel):
    week: int
    start_date: str
    end_date: str
    topics: List[str]
    is_holiday: bool
    is_midterm: bool

class RoadmapResponse(BaseModel):
    course: CourseInfo
    semester: SemesterInfo
    total_weeks: int
    teaching_weeks: int
    roadmap: List[RoadmapWeek]
