# pyrefly: ignore [missing-import]

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException

from models.schemas import (
    ParseResumeRequest,
    ParseResumeResponse,
    CandidateIndexRequest,
    CandidateSearchRequest,
    ParseJDRequest,
)
from services.resume import parse_resume
from services.job_description_parser import parse as parse_jd
from services.candidate import build_candidate_index, search_candidates
from services.embedding import generate_embedding
from services.vector_store import upsert_candidate, delete_candidate
from models.search_query import SearchQuery


router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post(
    "/parse-resume",
    response_model=ParseResumeResponse,
)
async def parse_resume_route(request: ParseResumeRequest):
    try:
        result = await parse_resume(request.objectKey)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to parse resume")

    return ParseResumeResponse(
        success=True,
        profile=result["profile"],
        rawText=result["rawText"],
    )


@router.post("/parse-job-description", response_model=SearchQuery)
async def parse_job_description_route(request: ParseJDRequest):
    result = await parse_jd(request.jobDescription)
    return result


@router.post("/build-candidate-index")
async def build_index(request: CandidateIndexRequest):
    result = build_candidate_index(request.profile)

    embedding = generate_embedding(
        result["embeddingText"]
    )

    upsert_candidate(
        candidate_id=request.candidateId,
        embedding=embedding,
        metadata=result["metadata"],
    )

    return {
        "success": True,
        "candidateId": request.candidateId,
        "embeddingDimensions": len(embedding),
        "indexed": True,
    }


@router.post("/search-candidates")
async def search_candidate_route(
    request: CandidateSearchRequest,
):
    candidates = search_candidates(
        jd_text=request.jobDescription,
        limit=request.limit,
    )

    return {
        "success": True,
        "count": len(candidates),
        "candidates": candidates,
    }


@router.delete("/delete-candidate-index/{candidate_id}")
async def delete_candidate_index(candidate_id: str):
    try:
        delete_candidate(candidate_id)
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to delete candidate index",
        )

    return {
        "success": True,
        "candidateId": candidate_id,
    }