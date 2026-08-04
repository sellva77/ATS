/* ── Resume Pipeline ── */

/** Per-file result returned inside a batch upload response */
export interface BatchUploadResult {
  success: boolean;
  fileName: string;
  documentId?: string;
  candidateId?: string;
  status?: "PARSED" | "FAILED";
  indexed?: boolean;
  updated?: boolean;
  error?: string;
}

/** Aggregate response for POST /resume-pipeline (1–10 files) */
export interface BatchUploadResponse {
  success: boolean;
  total: number;
  succeeded: number;
  failed: number;
  results: BatchUploadResult[];
}

export interface UploadErrorResponse {
  success: false;
  error: string;
}

/* ── Candidate Search ── */

export interface SearchRequest {
  jobDescription: string;
  limit?: number;
  minExperience?: number;
  maxExperience?: number;
}

export interface CandidateMetadata {
  name?: string;
  role?: string;
  location?: string;
  skills: string[];
}

export interface ExperienceRange {
  min?: number | null;
  max?: number | null;
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
  candidateExperienceYears?: number | null;
  requiredExperience?: ExperienceRange | null;
  assignedManagerId?: string | null;
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

/* ── Candidate Status ── */

export type CandidateStatus = "NEW" | "SCREENING" | "SHORTLISTED" | "INTERVIEW" | "SELECTED" | "REJECTED" | "HIRED";

export const CANDIDATE_STATUSES: CandidateStatus[] = [
  "NEW", "SCREENING", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED", "HIRED"
];

export const STATUS_COLORS: Record<CandidateStatus, string> = {
  NEW: "#64748b",
  SCREENING: "#f59e0b",
  SHORTLISTED: "#3b82f6",
  INTERVIEW: "#8b5cf6",
  SELECTED: "#10b981",
  REJECTED: "#ef4444",
  HIRED: "#059669",
};

/* ── Candidate List ── */

export interface ListCandidate {
  id: string;
  documentId: string;
  profile: any;
  version: number;
  totalExperienceYears?: number | null;
  status: CandidateStatus;
  assignedManagerId?: string | null;
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

export type Page = "dashboard" | "upload" | "search" | "list" | "organizations" | "teams" | "users" | "create-user";

/* ── Toast ── */

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

/* ── Auth / RBAC ── */

export interface User {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
  role: { id: string; name: string };
  permissions: string[];
  organizationId: string | null;
  teamId: string | null;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface MeResponse {
  success: boolean;
  user: User;
}

/* ── Dashboard ── */

export interface DashboardSummary {
  totalManagers?: number;
  totalTeams?: number;
  totalCandidates: number;
  statusBreakdown: Record<string, number>;
}

export interface ManagerStats {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  teamId: string | null;
  teamName: string | null;
  candidateCount: number;
  uploadedCount: number;
  joinedAt: string;
}

export interface TeamStats {
  id: string;
  name: string;
  organizationId: string;
  memberCount: number;
  candidateCount: number;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  candidateName: string;
  resumeName: string | null;
  status: CandidateStatus;
  createdBy: string | null;
  assignedManager: string | null;
  createdAt: string;
  updatedAt: string;
}
