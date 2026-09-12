import uuid
from datetime import date, datetime

from sqlalchemy import Column, Date, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..database import Base

class Semester(Base):
    __tablename__ = "semesters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    midterm_week = Column(Integer)
    created_at = Column(
        "created_at",
        default=func.now(),
    )

    courses = relationship("Course", back_populates="semester", cascade="all, delete-orphan")
    holidays = relationship("Holiday", back_populates="semester", cascade="all, delete-orphan")


class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    semester_id = Column(UUID(as_uuid=True), ForeignKey("semesters.id", ondelete="CASCADE"))
    name = Column(String(200), nullable=False)
    code = Column(String(20), nullable=False)
    created_at = Column(
        "created_at",
        default=func.now(),
    )

    semester = relationship("Semester", back_populates="courses")
    syllabus_topics = relationship("SyllabusTopic", back_populates="course", cascade="all, delete-orphan")
    notes_embeddings = relationship("NotesEmbedding", back_populates="course", cascade="all, delete-orphan")


class Holiday(Base):
    __tablename__ = "holidays"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    semester_id = Column(UUID(as_uuid=True), ForeignKey("semesters.id", ondelete="CASCADE"))
    date = Column(Date, nullable=False)
    description = Column(String(200), nullable=False)

    __table_args__ = (
        UniqueConstraint("semester_id", "date", name="uq_semester_holiday"),
    )

    semester = relationship("Semester", back_populates="holidays")
