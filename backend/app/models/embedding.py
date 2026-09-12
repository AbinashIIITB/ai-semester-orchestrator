import uuid

from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from ..database import Base

class NotesEmbedding(Base):
    __tablename__ = "notes_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"))
    chunk_text = Column(Text, nullable=False)
    embedding = Column(Vector(1536))
    metadata = Column("metadata", JSONB, default=dict)
    created_at = Column(
        "created_at",
        default=func.now(),
    )

    course = relationship("Course", back_populates="notes_embeddings")
