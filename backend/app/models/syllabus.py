import uuid

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..database import Base

class SyllabusTopic(Base):
    __tablename__ = "syllabus_topics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"))
    topic_name = Column(String(300), nullable=False)
    topic_order = Column(Integer, nullable=False)
    scheduled_week = Column(Integer)
    created_at = Column(
        "created_at",
        default=func.now(),
    )

    course = relationship("Course", back_populates="syllabus_topics")
