import uuid
import json
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models.semester import Semester, Course
from ..schemas.upload import UploadResponse, FileProcessResult
from ..services.pdf_parser import chunk_pdf
from ..services.embeddings import embed_and_store_chunks

# Temporary placeholder until Phase 3 agents are implemented
async def invoke_extraction_agent(file_bytes: bytes, filename: str, doc_type: str, session: AsyncSession, course_id: uuid.UUID, semester_id: uuid.UUID) -> dict:
    """Mock for LangGraph extraction agent."""
    return {"status": "mocked", "message": "Extraction agent not yet implemented"}


router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("", response_model=UploadResponse)
async def upload_documents(
    course_code: str = Form(...),
    course_name: str = Form(...),
    semester_name: str = Form(...),
    preferences: Optional[str] = Form(None),
    file_types: str = Form(...), # JSON string list e.g. '["syllabus", "notes"]'
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        types_list = json.loads(file_types)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="file_types must be a valid JSON array of strings")

    if len(types_list) != len(files):
        raise HTTPException(status_code=400, detail="Length of file_types must match number of files")

    # 1. Get or Create Semester
    stmt = select(Semester).where(Semester.name == semester_name)
    result = await db.execute(stmt)
    semester = result.scalars().first()
    
    if not semester:
        # Default dates for now (Extraction agent will update this)
        semester = Semester(
            name=semester_name, 
            start_date=date.today(), 
            end_date=date.today()
        )
        db.add(semester)
        await db.flush()

    # 2. Get or Create Course
    stmt = select(Course).where(Course.code == course_code, Course.semester_id == semester.id)
    result = await db.execute(stmt)
    course = result.scalars().first()
    
    if not course:
        course = Course(
            name=course_name, 
            code=course_code, 
            semester_id=semester.id
        )
        db.add(course)
        await db.flush()

    # 3. Process Files
    results = []
    
    for file, doc_type in zip(files, types_list):
        content = await file.read()
        filename = file.filename
        
        try:
            if doc_type in ["calendar", "syllabus"]:
                # Will route to Extraction Agent in Phase 3
                # For now, just a mock
                res = await invoke_extraction_agent(content, filename, doc_type, db, course.id, semester.id)
                results.append(FileProcessResult(
                    filename=filename, 
                    type=doc_type, 
                    status="extracted_mock"
                ))
                
            elif doc_type == "notes":
                # Direct embedding pipeline
                chunks = chunk_pdf(content, filename)
                num_embedded = await embed_and_store_chunks(chunks, course.id, db)
                
                results.append(FileProcessResult(
                    filename=filename,
                    type=doc_type,
                    status="embedded",
                    chunks=num_embedded
                ))
            else:
                results.append(FileProcessResult(
                    filename=filename,
                    type=doc_type,
                    status="skipped",
                    error="Unknown doc_type"
                ))
        except Exception as e:
            results.append(FileProcessResult(
                filename=filename,
                type=doc_type,
                status="error",
                error=str(e)
            ))
            
    await db.commit()

    return UploadResponse(
        status="success",
        semester_id=semester.id,
        course_id=course.id,
        files_processed=results
    )
