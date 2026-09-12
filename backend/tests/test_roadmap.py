import pytest
import uuid
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_roadmap_endpoint_success(client: AsyncClient, mock_db_session: AsyncMock):
    """Test GET /roadmap triggers the graph and returns correct data."""
    
    course_id = uuid.uuid4()
    semester_id = uuid.uuid4()
    
    # Mock DB returns for Course and Semester
    mock_course = AsyncMock()
    mock_course.id = course_id
    mock_course.name = "Operating Systems"
    mock_course.code = "CS301"
    mock_course.semester_id = semester_id
    
    # For dates, mock objects need actual datetime.date instances or similar
    from datetime import date
    mock_semester = AsyncMock()
    mock_semester.id = semester_id
    mock_semester.name = "Fall 2026"
    mock_semester.start_date = date(2026, 9, 14)
    mock_semester.end_date = date(2026, 12, 20)
    mock_semester.midterm_week = 7
    
    # Configure mock DB session to return our mocked objects
    mock_result = AsyncMock()
    # The endpoint fetches Course then Semester
    mock_result.scalars.return_value.first.side_effect = [mock_course, mock_semester]
    mock_db_session.execute.return_value = mock_result

    # Mock the LangGraph orchestrator execution
    mock_graph_result = {
        "course_id": str(course_id),
        "roadmap": [
            {
                "week": 1,
                "start_date": "2026-09-14",
                "end_date": "2026-09-18",
                "topics": ["Intro to OS"],
                "is_holiday": False,
                "is_midterm": False
            },
            {
                "week": 2,
                "start_date": "2026-09-21",
                "end_date": "2026-09-25",
                "topics": [],
                "is_holiday": True,
                "is_midterm": False
            }
        ],
        "error": None
    }
    
    with patch("app.api.roadmap.orchestrator_graph.ainvoke", new_callable=AsyncMock) as mock_ainvoke:
        mock_ainvoke.return_value = mock_graph_result
        
        response = await client.get(f"/roadmap?course_id={str(course_id)}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["course"]["id"] == str(course_id)
        assert data["semester"]["name"] == "Fall 2026"
        assert data["total_weeks"] == 2
        assert data["teaching_weeks"] == 1
        assert len(data["roadmap"]) == 2
        
        # Verify scheduler logic skipped the holiday week for teaching_weeks count
        assert data["roadmap"][1]["is_holiday"] is True

@pytest.mark.asyncio
async def test_roadmap_course_not_found(client: AsyncClient, mock_db_session: AsyncMock):
    """Test 404 when course doesn't exist."""
    # DB returns None
    mock_result = AsyncMock()
    mock_result.scalars.return_value.first.return_value = None
    mock_db_session.execute.return_value = mock_result
    
    response = await client.get(f"/roadmap?course_id={str(uuid.uuid4())}")
    assert response.status_code == 404
    assert "Course not found" in response.json()["detail"]
