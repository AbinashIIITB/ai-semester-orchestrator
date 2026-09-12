import pytest
import json
import uuid
from httpx import AsyncClient
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_upload_documents_success(client: AsyncClient, mock_db_session: AsyncMock):
    """Test successful document upload with correct routing based on file type."""
    
    # Mock DB returns to simulate existing Semester and Course
    mock_semester = AsyncMock()
    mock_semester.id = uuid.uuid4()
    mock_course = AsyncMock()
    mock_course.id = uuid.uuid4()
    
    # Configure mock DB session to return our mocked objects
    mock_result = AsyncMock()
    mock_result.scalars.return_value.first.side_effect = [mock_semester, mock_course]
    mock_db_session.execute.return_value = mock_result
    
    # Prepare form data
    form_data = {
        "course_code": "CS301",
        "course_name": "Operating Systems",
        "semester_name": "Fall 2026",
        "file_types": json.dumps(["syllabus", "notes"])
    }
    
    # Prepare mock files (content, filename, content_type)
    files = [
        ("files", ("syllabus.pdf", b"mock syllabus content", "application/pdf")),
        ("files", ("notes.pdf", b"mock notes content", "application/pdf")),
    ]
    
    # Execute request
    response = await client.post("/upload", data=form_data, files=files)
    
    # Assertions
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] == "success"
    assert data["semester_id"] == str(mock_semester.id)
    assert data["course_id"] == str(mock_course.id)
    
    processed = data["files_processed"]
    assert len(processed) == 2
    
    # Check syllabus routing (should go to Extraction mock)
    assert processed[0]["filename"] == "syllabus.pdf"
    assert processed[0]["type"] == "syllabus"
    assert processed[0]["status"] == "extracted_mock"
    
    # Check notes routing (should go to embedding pipeline)
    assert processed[1]["filename"] == "notes.pdf"
    assert processed[1]["type"] == "notes"
    assert processed[1]["status"] == "embedded"
    assert processed[1]["chunks"] > 0

@pytest.mark.asyncio
async def test_upload_invalid_file_types_json(client: AsyncClient):
    """Test upload with invalid JSON in file_types."""
    form_data = {
        "course_code": "CS301",
        "course_name": "OS",
        "semester_name": "Fall",
        "file_types": "invalid-json"
    }
    files = [("files", ("test.pdf", b"content", "application/pdf"))]
    
    response = await client.post("/upload", data=form_data, files=files)
    assert response.status_code == 400
    assert "valid JSON array" in response.json()["detail"]

@pytest.mark.asyncio
async def test_upload_mismatched_file_lengths(client: AsyncClient):
    """Test upload where length of file_types doesn't match number of files."""
    form_data = {
        "course_code": "CS301",
        "course_name": "OS",
        "semester_name": "Fall",
        "file_types": json.dumps(["syllabus", "notes"]) # 2 types
    }
    files = [("files", ("test.pdf", b"content", "application/pdf"))] # 1 file
    
    response = await client.post("/upload", data=form_data, files=files)
    assert response.status_code == 400
    assert "match number of files" in response.json()["detail"]
