import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models.semester import Course, Semester
from ..schemas.roadmap import RoadmapResponse, CourseInfo, SemesterInfo
from ..agents.graph import orchestrator_graph

router = APIRouter(prefix="/roadmap", tags=["roadmap"])

@router.get("", response_model=RoadmapResponse)
async def get_roadmap(course_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    # 1. Fetch Course and Semester info
    stmt = select(Course).where(Course.id == course_id)
    result = await db.execute(stmt)
    course = result.scalars().first()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    stmt = select(Semester).where(Semester.id == course.semester_id)
    result = await db.execute(stmt)
    semester = result.scalars().first()
    
    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")
        
    # 2. Invoke Scheduler Agent
    # In a real app, we might check the database first to see if a roadmap is already generated
    # and only call the agent if needed. For now, we invoke it directly.
    
    initial_state = {
        "course_id": str(course.id),
        "semester_id": str(semester.id),
        "request_type": "schedule",
        # Mocking extracted data for now; normally this is fetched from DB
        "extracted_calendar": {
            "start_date": semester.start_date.strftime("%Y-%m-%d"),
            "end_date": semester.end_date.strftime("%Y-%m-%d"),
            "midterm_week": semester.midterm_week,
            "holidays": [] # Mock
        },
        "extracted_topics": [
            {"topic_name": "Topic A", "topic_order": 1},
            {"topic_name": "Topic B", "topic_order": 2},
        ]
    }
    
    try:
        final_state = await orchestrator_graph.ainvoke(initial_state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")
        
    if final_state.get("error"):
        raise HTTPException(status_code=500, detail=final_state["error"])
        
    roadmap = final_state.get("roadmap", [])
    total_weeks = len(roadmap)
    teaching_weeks = len([w for w in roadmap if not w.get("is_holiday") and not w.get("is_midterm")])
    
    return RoadmapResponse(
        course=CourseInfo(id=course.id, name=course.name, code=course.code),
        semester=SemesterInfo(
            name=semester.name, 
            start=semester.start_date.strftime("%Y-%m-%d"), 
            end=semester.end_date.strftime("%Y-%m-%d")
        ),
        total_weeks=total_weeks,
        teaching_weeks=teaching_weeks,
        roadmap=roadmap
    )
