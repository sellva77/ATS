from pydantic import BaseModel


class ParseResumeRequest(BaseModel):
    objectKey: str


class Candidate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    github: str | None = None
    linkedin: str | None = None
    location: str | None = None


class ParseResumeResponse(BaseModel):
    success: bool
    candidate: Candidate
    education: list[dict]
    experience: list[dict]
    skills: list[str]
    projects: list[dict]
    rawText: str