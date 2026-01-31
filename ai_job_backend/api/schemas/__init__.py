"""
Pydantic schemas keep request/response contracts explicit.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class JobAnalysisRequest(BaseModel):
    url: str


class JobAnalysisResponse(BaseModel):
    job_id: int
    analysis: str
    created_at: Optional[datetime] = None
