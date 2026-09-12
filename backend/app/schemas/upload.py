from pydantic import BaseModel
from typing import List
import uuid

class FileProcessResult(BaseModel):
    filename: str
    type: str
    status: str
    chunks: int | None = None
    error: str | None = None

class UploadResponse(BaseModel):
    status: str
    semester_id: uuid.UUID
    course_id: uuid.UUID
    files_processed: List[FileProcessResult]
