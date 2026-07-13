# pyrefly: ignore [missing-import]

from fastapi import APIRouter

from models.schemas import (
    ParseResumeRequest,
    ParseResumeResponse,
    CandidateIndexRequest,
    CandidateSearchRequest,
)
from services.resume import parse_resume
from services.candidate import build_candidate_index, search_candidates
from services.embedding import generate_embedding
from services.vector_store import upsert_candidate


router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post(
    "/parse-resume",
    response_model=ParseResumeResponse,
)
async def parse_resume_route(request: ParseResumeRequest):
    result = await parse_resume(request.objectKey)

    return ParseResumeResponse(
        success=True,
        profile=result["profile"],
        rawText=result["rawText"],
    )


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