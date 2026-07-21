import type {
  UploadResponse,
  UploadErrorResponse,
  SearchResponse,
  SearchErrorResponse,
} from "../types";

const BASE = "/api/v1";

/**
 * Upload a resume file through the pipeline.
 * POST /api/v1/resume-pipeline  (multipart/form-data, field: "file")
 */
export async function uploadResume(
  file: File
): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/resume-pipeline`, {
    method: "POST",
    body: form,
  });

  const data: UploadResponse | UploadErrorResponse = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(
      (data as UploadErrorResponse).error || "Resume upload failed"
    );
  }

  return data as UploadResponse;
}

/**
 * Search candidates by job description.
 * POST /api/v1/search-candidates  ({ jobDescription, limit? })
 */
export async function searchCandidates(
  jobDescription: string,
  limit: number = 10
): Promise<SearchResponse> {
  const res = await fetch(`${BASE}/search-candidates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobDescription, limit }),
  });

  const data: SearchResponse | SearchErrorResponse = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(
      (data as SearchErrorResponse).error || "Candidate search failed"
    );
  }

  return data as SearchResponse;
}

/**
 * List all parsed candidate profiles.
 * GET /api/v1/candidates
 */
export async function listCandidates(): Promise<import("../../types").ListResponse> {
  const res = await fetch(`${BASE}/candidates`, {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to list candidates");
  }

  return data;
}

/**
 * Delete a candidate by ID.
 * DELETE /api/v1/candidates/:id
 */
export async function deleteCandidateById(
  id: string
): Promise<{ success: boolean; deletedId: string }> {
  const res = await fetch(`${BASE}/candidates/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to delete candidate");
  }

  return data;
}
