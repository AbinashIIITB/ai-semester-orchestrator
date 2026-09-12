import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..schemas.weekly_prep import WeeklyPrepResponse
from ..agents.graph import orchestrator_graph

router = APIRouter(prefix="/weekly-prep", tags=["weekly-prep"])

@router.get("/{week}", response_model=WeeklyPrepResponse)
async def get_weekly_prep(week: int, course_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    
    # 1. We need the roadmap to know what topics are scheduled for this week.
    # We can either fetch from DB or run the scheduler agent.
    # For demonstration, we run the scheduler first to get the state, then RAG.
    # In production, roadmap should be persisted.
    
    # Mocking the roadmap for this endpoint
    mock_roadmap = [
        {
            "week": week,
            "start_date": "2026-09-14",
            "end_date": "2026-09-18",
            "topics": ["Operating System Concepts"],
            "is_holiday": False,
            "is_midterm": False
        }
    ]
    
    initial_state = {
        "course_id": str(course_id),
        "request_type": "weekly_prep",
        "target_week": week,
        "roadmap": mock_roadmap
    }
    
    try:
        # Note: In a real integration, the DB session needs to be passed to the retrieval node.
        # LangGraph supports passing Config or using ContextVars.
        # For this prototype structure, the retrieval agent has mocked DB calls if db is not passed,
        # but the architecture is ready for it.
        final_state = await orchestrator_graph.ainvoke(initial_state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent execution error: {str(e)}")
        
    if final_state.get("error"):
        raise HTTPException(status_code=500, detail=final_state["error"])
        
    return WeeklyPrepResponse(
        week=week,
        topics=mock_roadmap[0]["topics"],
        summary=final_state.get("summary", ""),
        quiz=final_state.get("quiz", []),
        quality_passed=final_state.get("qc_passed", False),
        retrieval_attempts=final_state.get("retrieval_attempts", 0)
    )
