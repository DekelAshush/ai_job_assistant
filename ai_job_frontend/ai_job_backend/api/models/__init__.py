"""
ORM models for the application.

- Kept small and focused (User, Job).
- Importing Base from api.database keeps declarative registry centralized.
"""

from typing import Any, List, Optional

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from api.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    jobs: Mapped[List["Job"]] = relationship("Job", back_populates="owner")

    def __repr__(self) -> str:
        return f"<User(email='{self.email}')>"


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    company: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(100))
    url: Mapped[str] = mapped_column(String(500), unique=True, nullable=False)
    description_raw: Mapped[Optional[str]] = mapped_column(Text)
    ai_analysis: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(30), default="pending")
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    owner: Mapped["User"] = relationship("User", back_populates="jobs")

    def __repr__(self) -> str:
        return f"<Job(title='{self.title}', company='{self.company}')>"
