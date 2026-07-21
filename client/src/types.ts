/* ── Resume Pipeline ── */

export interface UploadResponse {
  success: boolean;
  documentId: string;
  candidateId: string;
  status: "PARSED" | "FAILED";
  indexed: boolean;
  updated: boolean;
}

export interface UploadErrorResponse {
  success: false;
  error: string;
}

/* ── Candidate Search ── */

export interface SearchRequest {
  jobDescription: string;
  limit?: number;
}

export interface CandidateMetadata {
  name?: string;
  role?: string;
  location?: string;
  skills: string[];
}

export interface CandidateResult {
  candidateId: string;
  semanticScore: number;
  skillScore: number;
  titleScore: number;
  experienceScore: number;
  educationScore: number;
  finalScore: number;
  explanation: string;
  matchedSkills: string[];
  missingSkills: string[];
  metadata: CandidateMetadata;
}

export interface SearchResponse {
  success: boolean;
  count: number;
  candidates: CandidateResult[];
}

export interface SearchErrorResponse {
  success: false;
  error: string;
}

/* ── Candidate List ── */

export interface ListCandidate {
  id: string;
  documentId: string;
  profile: any;
  version: number;
  createdAt: string;
  updatedAt: string;
  document: {
    originalName: string;
    status: string;
    uploadedAt: string;
  };
}

export interface ListResponse {
  success: boolean;
  count: number;
  candidates: ListCandidate[];
}

/* ── Navigation ── */

export type Page = "upload" | "search" | "list";

/* ── Toast ── */

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}
