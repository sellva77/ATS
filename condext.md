# ATS — Implemented Features Summary & Codebase Map

This document provides a concise overview of the features currently implemented in the Applicant Tracking System (ATS), mapped to the specific files implementing them.

---

## 1. Resume Ingestion & Processing Pipeline
* **Multi-File Upload:** Supports uploading multiple PDF resumes simultaneously via a multipart form-data endpoint (`POST /api/v1/resume-pipeline`).
* **Secure Storage:** Uploaded resumes are stored in MinIO object storage using unique generated object keys while retaining original file names and types.
* **Metadata Persistence:** Stores document metadata (file size, mime type, upload status) in PostgreSQL.
* **Duplicate Detection:** Automatic detection of duplicate candidates based on candidate name and email address:
  * Updates the existing candidate's JSON profile, incrementing the profile version.
  * Deletes the old resume file from MinIO and deletes the old document record from PostgreSQL.
  * Creates a new candidate profile if no duplicate is found.
* **Implementing Files:**
  * **Routes:** [resume.routes.ts](file:///c:/Users/user/Desktop/ATS/BFF/src/resume/resume.routes.ts) — Defines the `/resume-pipeline` endpoint and file upload limits.
  * **Controller:** [resume.controller.ts](file:///c:/Users/user/Desktop/ATS/BFF/src/resume/resume.controller.ts) — Orchestrates the multi-file ingestion pipeline, duplicate detection, MinIO uploads, and database updates.
  * **Database Schema:** [schema.prisma](file:///c:/Users/user/Desktop/ATS/BFF/prisma/schema.prisma) — Database models for `ResumeDocument` and `CandidateProfile`.
  * **Clients Config:** [prisma.ts](file:///c:/Users/user/Desktop/ATS/BFF/src/config/prisma.ts) and [minio.ts](file:///c:/Users/user/Desktop/ATS/BFF/src/config/minio.ts).

---

## 2. Text Extraction & Structured LLM Profiling
* **Raw PDF Parsing:** Extract raw, clean text from PDF documents using PyMuPDF.
* **Factual Structured Profiling:** Utilizes Gemini (`gemini-flash-latest`) to transform raw resume text into a strict, unified JSON schema.
* **Strict Extraction Rules:** Rules to prevent resume rewriting, skill inference, or normalizations. Extracts Candidate Info, Summary, Work Experience, Education, Skills, Certifications, Licenses, Languages, Projects, Publications, Awards, and Volunteer Experience.
* **Implementing Files:**
  * **AI Routes:** [routes.py](file:///c:/Users/user/Desktop/ATS/ai-service/api/routes.py) — Exposes `/parse-resume`.
  * **Orchestration:** [pipeline.py](file:///c:/Users/user/Desktop/ATS/ai-service/services/resume/pipeline.py) — Connects text extraction, Gemini profiling, and experience enrichment.
  * **Text Extractor:** [extractor.py](file:///c:/Users/user/Desktop/ATS/ai-service/services/resume/extractor.py) — Uses PyMuPDF to extract text from PDF bytes.
  * **LLM Profiler:** [profiler.py](file:///c:/Users/user/Desktop/ATS/ai-service/services/resume/profiler.py) — Holds the strict extraction system instructions, JSON schema, and invokes Gemini.
  * **Gemini Provider:** [gemini.py](file:///c:/Users/user/Desktop/ATS/ai-service/services/llm/gemini.py) — Manages Gemini client credentials and rate limiting.

---

## 3. Deterministic Experience Metrics Calculation
* **Overlap Merging:** Merges overlapping or adjacent employment timelines to ensure concurrent or multiple active jobs are not double-counted in total experience.
* **Calculated Metrics:** Automatically derives `totalExperienceYears` (rounded to one decimal place), `currentCompany`, `currentDesignation`, `careerGaps`, `careerGapMonths`, `hasOverlappingExperience`, and `totalJobs` count.
* **Implementing Files:**
  * **Experience Service:** [experience.py](file:///c:/Users/user/Desktop/ATS/ai-service/services/experience.py) — Contains date parsing utilities, tenure calculators, gap detectors, overlapping timeline merges, and the `enrich_profile` entry point.

---

## 4. Semantic Embedding & Vector Storage
* **Index Building:** Generates a dense semantic string per candidate combining their experience roles, descriptions, skills, and projects.
* **Embedding Generation:** Uses the BGE model to generate 384-dimensional vector representations.
* **Vector Indexing:** Stores the vector representation in Qdrant indexed by candidate ID, with payload attributes containing searchable skills, location, and total experience years.
* **Implementing Files:**
  * **AI Routes:** [routes.py](file:///c:/Users/user/Desktop/ATS/ai-service/api/routes.py) — Exposes `/build-candidate-index` and `/delete-candidate-index/{candidate_id}`.
  * **Index Builder:** [index_builder.py](file:///c:/Users/user/Desktop/ATS/ai-service/services/candidate/index_builder.py) — Transforms structured profile JSON into a textual representation for search.
  * **Embedding Model:** [embedding.py](file:///c:/Users/user/Desktop/ATS/ai-service/services/embedding.py) — Configures sentence-transformers with the BGE embedding model.
  * **Qdrant Storage:** [vector_store.py](file:///c:/Users/user/Desktop/ATS/ai-service/services/vector_store.py) — Connects to Qdrant, registers collections, and handles upsert/delete operations.

---

## 5. Hybrid Search & Candidate Ranking Engine
* **Job Description Semantic Search:** Matches natural language job descriptions against candidate vectors in Qdrant.
* **Resume-to-Resume Semantic Search:** Accepts a search-by-resume PDF, generates its embedding, and matches it against other candidate profiles.
* **Experience Pre-Filtering:** Filters search results dynamically in Qdrant based on experience criteria (`minExperience`, `maxExperience`).
* **Hybrid Multi-Factor Ranking:** Calculates a combined final score (0.0 to 1.0) on the BFF side using weighted metrics:
  * **Semantic Match (35%)**: Vector similarity from Qdrant.
  * **Skill Match (35%)**: Exact and synonym-based technical skill matching (e.g. mapping `JS` to `JavaScript`, `K8s` to `Kubernetes`).
  * **Title Match (15%)**: String-matching on past job titles using components of the target job title.
  * **Experience Match (10%)**: Compares total years of experience against requested ranges with a mild penalty for over-experience and higher penalty for under-experience.
  * **Education Match (5%)**: *(Placeholder)*.
* **Implementing Files:**
  * **BFF Routes:** [candidate.routes.ts](file:///c:/Users/user/Desktop/ATS/BFF/src/candidate/candidate.routes.ts) — Defines `/candidates`, `/search-candidates`, `/search-by-resume`, and deletion.
  * **BFF Controller:** [candidate.controller.ts](file:///c:/Users/user/Desktop/ATS/BFF/src/candidate/candidate.controller.ts) — Orchestrates the search, parses requirements, loads candidate profile records, and calls the ranking engine.
  * **AI Search Logic:** [search.py](file:///c:/Users/user/Desktop/ATS/ai-service/services/candidate/search.py) — Runs vector search in Qdrant with payload ranges.
  * **AI Job Description Parser:** [job_description_parser.py](file:///c:/Users/user/Desktop/ATS/ai-service/services/job_description_parser.py) & [gemini_parser.py](file:///c:/Users/user/Desktop/ATS/ai-service/parsers/gemini_parser.py) — Parses required/preferred skills and experience parameters from job descriptions.
  * **BFF Ranking Engine:** [ranking-engine.ts](file:///c:/Users/user/Desktop/ATS/BFF/src/ranking/ranking-engine.ts) & [score-calculator.ts](file:///c:/Users/user/Desktop/ATS/BFF/src/ranking/score-calculator.ts) — Calculates weighted scores and generates match explanation summaries.
  * **BFF Skill Matcher:** [skill-matcher.ts](file:///c:/Users/user/Desktop/ATS/BFF/src/matchers/skill-matcher.ts), [synonym-resolver.ts](file:///c:/Users/user/Desktop/ATS/BFF/src/matchers/synonym-resolver.ts), and [skill-synonyms.ts](file:///c:/Users/user/Desktop/ATS/BFF/src/config/skill-synonyms.ts) — Maps synonyms/abbreviations during comparison.

---

## 6. Security, Identity, & Access Control
* **Authentication:** Uses secure JWT-based stateless user authentication.
* **Role-Based Authorization (RBAC):** Restricts system operations using three user roles: `ADMIN`, `RECRUITER`, and `INTERVIEWER`.
* **Implementing Files:**
  * **BFF Routes:** [auth.routes.ts](file:///c:/Users/user/Desktop/ATS/BFF/src/auth/auth.routes.ts) — Registers `/login` and `/register`.
  * **BFF Controller:** [auth.controller.ts](file:///c:/Users/user/Desktop/ATS/BFF/src/auth/auth.controller.ts) & [auth.service.ts](file:///c:/Users/user/Desktop/ATS/BFF/src/auth/auth.service.ts) — Handles user registration and password hashing.
  * **BFF Middleware:** [auth.middleware.ts](file:///c:/Users/user/Desktop/ATS/BFF/src/auth/auth.middleware.ts) — Intercepts requests to decode JWTs and authorize roles.
  * **JWT Helpers:** [jwt.ts](file:///c:/Users/user/Desktop/ATS/BFF/src/auth/jwt.ts).

---

## 7. Recruiter Web Interface
* **Secure Login:** Dedicated authentication gateway for users.
* **Candidate Directory:** Lists all parsed candidates with their calculated total experience, upload dates, and original filenames.
* **Resume Uploader:** Interface for drag-and-drop or file-selector resume ingestion.
* **Matching Workbench:** Search workspace displaying ranked candidates alongside visual breakdowns of matching/missing skills, experience metrics, and matching explanations.
* **Implementing Files:**
  * **App Entry:** [App.tsx](file:///c:/Users/user/Desktop/ATS/client/src/App.tsx)
  * **Views:** [LoginPage.tsx](file:///c:/Users/user/Desktop/ATS/client/src/pages/LoginPage.tsx), [ListPage.tsx](file:///c:/Users/user/Desktop/ATS/client/src/pages/ListPage.tsx), [UploadPage.tsx](file:///c:/Users/user/Desktop/ATS/client/src/pages/UploadPage.tsx), and [SearchPage.tsx](file:///c:/Users/user/Desktop/ATS/client/src/pages/SearchPage.tsx).

---

## 8. Planned: Multi-Tenant Organization & Role Architecture

> This section documents the planned redesign of the identity and access layer for enterprise-grade, multi-tenant support.

---

### Organization Hierarchy

```text
Super Admin
    │
    ├───────────────────┐
    │                   │
Organization A      Organization B
    │                   │
    ▼                   ▼
 Team Lead           Team Lead
    │
 ┌──┴──────┐
 │         │
Recruiter  Recruiter
 │
 ▼
Candidate (Business Entity — not a staff member)
```

> **Key Design Decision:** `Candidate` is **not** a user role. It is a business entity (a person applying for jobs) and must not share the same authentication system as employees. If a candidate self-service portal is needed in the future, a separate `CandidateAccount` model should be introduced, linked to the existing `CandidateProfile`.

---

### Planned Roles

#### 1. `SUPER_ADMIN`
Owns the entire ATS platform. Can access everything.

| Permission | Access |
|---|---|
| Create / Delete organizations | ✅ |
| Manage subscriptions & storage | ✅ |
| Manage all users | ✅ |
| View every candidate | ✅ |
| Configure AI settings | ✅ |
| Configure system settings | ✅ |
| View audit logs & system monitoring | ✅ |

#### 2. `ORG_ADMIN`
Administrator for a single organization (key for SaaS / multi-tenant). Cannot access other organizations.

| Permission | Access |
|---|---|
| Invite / Remove users | ✅ |
| Create teams | ✅ |
| Configure workflows | ✅ |
| Manage job templates | ✅ |
| Assign Team Leads | ✅ |

#### 3. `TEAM_LEAD`
Responsible for one hiring team (e.g. Backend, Frontend, AI).

| Permission | Access |
|---|---|
| Create jobs | ✅ |
| Assign recruiters | ✅ |
| View team candidates | ✅ |
| Approve offers | ✅ |
| Review interview feedback | ✅ |
| Manage organization settings | ❌ |

#### 4. `RECRUITER`
Handles day-to-day recruitment work.

| Permission | Access |
|---|---|
| Upload resumes | ✅ |
| Search candidates | ✅ |
| Create jobs | ✅ |
| Schedule interviews | ✅ |
| Move candidates between stages | ✅ |
| Add notes / Send emails | ✅ |
| Reject / Shortlist candidates | ✅ |
| Manage users | ❌ |

#### 5. `INTERVIEWER`
Usually engineers or managers participating in interviews.

| Permission | Access |
|---|---|
| View assigned candidates | ✅ |
| Download resumes | ✅ |
| Submit interview feedback | ✅ |
| Score candidates | ✅ |
| Edit candidates | ❌ |

#### 6. `HIRING_MANAGER`
Common in enterprise ATS products.

| Permission | Access |
|---|---|
| View applicants | ✅ |
| Review shortlisted candidates | ✅ |
| Approve / Reject candidates | ✅ |
| Review interview feedback | ✅ |

#### 7. `HR`
Handles post-hire onboarding.

| Permission | Access |
|---|---|
| Create offer letters | ✅ |
| Record salary | ✅ |
| Complete onboarding | ✅ |
| Mark candidate as hired | ✅ |

---

### Permission Matrix

| Feature | Super Admin | Org Admin | Team Lead | Recruiter | Interviewer | Hiring Manager | HR |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Manage organizations | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage teams | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create jobs | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Upload resumes | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Search candidates | ✅ | ✅ | ✅ | ✅ | ✅ (assigned only) | ✅ | ✅ |
| Assign recruiter | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Schedule interviews | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Submit interview feedback | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Generate offer | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View analytics | ✅ | ✅ | ✅ | Limited | ❌ | Limited | Limited |
| Configure AI | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

### Planned Database Schema

#### `Organization`
```text
id
name
subscription
storageLimit
```

#### `Team`
```text
id
name            (e.g. Backend, Frontend, AI, QA)
organizationId
```

#### `Role`
```text
id
name            (SUPER_ADMIN | ORG_ADMIN | TEAM_LEAD | RECRUITER | INTERVIEWER | HIRING_MANAGER | HR)
```

#### `User` (updated)
```text
id
name
email
password
roleId          → Role
teamId          → Team (nullable)
organizationId  → Organization (nullable for SUPER_ADMIN)
```

#### `CandidateProfile` (updated — with ownership)
```text
id
organizationId      → Organization
assignedRecruiterId → User (nullable)
createdBy           → User
updatedBy           → User
profile             (JSON)
rawText
totalExperienceYears
version
```

> Candidate ownership enables scoped access: a recruiter sees only their assigned candidates unless granted broader access by a Team Lead or Org Admin.

#### `CandidateAccount` *(future — candidate self-service portal only)*
```text
id
candidateProfileId  → CandidateProfile
email
passwordHash
```

---

### Migration Path from Current Roles

| Current Role | Maps To |
|---|---|
| `ADMIN` | `SUPER_ADMIN` or `ORG_ADMIN` |
| `RECRUITER` | `RECRUITER` |
| `INTERVIEWER` | `INTERVIEWER` |
| *(new)* | `TEAM_LEAD`, `HIRING_MANAGER`, `HR` |
