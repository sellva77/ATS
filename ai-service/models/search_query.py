from pydantic import BaseModel, Field
from typing import List, Optional

class SearchQuery(BaseModel):
    title: Optional[str] = None
    domain: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience: Optional[int] = None
    education: Optional[str] = None
    certifications: List[str] = Field(default_factory=list)
    employment_type: Optional[str] = None
    location: Optional[str] = None
