from fastapi import APIRouter

from models.schemas import (
    ParseResumeRequest,
    ParseResumeResponse,
)

from services.parser import parse_resume

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post(
    "/parse-resume",
    response_model=ParseResumeResponse,
)
def parse_resume_route(request: ParseResumeRequest):

    result = parse_resume(request.objectKey)

    return ParseResumeResponse(
        success=True,
        candidate=result["candidate"],
        skills=result["skills"],
        experience=result["experience"],
        education=result["education"],
        projects=result["projects"],
        rawText=result["rawText"],
    )