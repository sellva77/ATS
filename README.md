# ATS — AI-Powered Applicant Tracking System

An AI-powered Applicant Tracking System designed to store, parse, and structure candidate resumes for future intelligent recruitment workflows.

The project is being built as a modular system with separate API, AI processing, storage, and database layers.

## Current Status

The core resume processing flow is implemented.

```text
Resume Upload
      ↓
BFF API
      ↓
MinIO Object Storage
      ↓
PostgreSQL Metadata Storage
      ↓
AI Service
      ↓
PDF Text Extraction
      ↓
Candidate Information Parsing
```

Currently extracted candidate information includes:

* Name
* Email
* Phone number
* GitHub profile
* LinkedIn profile
* Location

The project is currently focused on building the core ATS infrastructure before adding advanced matching, ranking, and AI recruitment features.

## Tech Stack

### BFF / API Service

* Node.js
* TypeScript
* Express.js
* Prisma ORM

### AI Service

* Python
* PDF text extraction
* Resume parsing
* LLM-assisted structured candidate extraction

### Database

* PostgreSQL

### Object Storage

* MinIO

### Infrastructure

* Docker
* Docker Compose

## Project Directory Structure

```text
ATS/
│
├── ai-service/
│   └── app/
│       ├── api/
│       │   └── routes.py
│       │
│       ├── models/
│       │   └── schemas.py
│       │
│       ├── services/
│       │   ├── extractor.py
│       │   ├── parser.py
│       │   └── storage.py
│       │
│       └── utils/
│           └── config.py
│
├── bff/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   └── src/
│       ├── config/
│       │   ├── minio.ts
│       │   └── prisma.ts
│       │
│       ├── controllers/
│       │   └── document.controller.ts
│       │
│       ├── middleware/
│       │   └── upload.middleware.ts
│       │
│       ├── services/
│       │   └── document.service.ts
│       │
│       └── server.ts
│
├── client/
│
├── docker-compose.yml
│
└── README.md
```

## Directory Explanation

### `ai-service`

The AI processing service responsible for resume extraction and candidate information parsing.

#### `app/api`

Contains the HTTP API routes exposed by the AI service.

`routes.py` handles resume parsing requests and coordinates the AI processing flow.

#### `app/models`

Contains structured data models used by the AI service.

`schemas.py` defines the candidate and resume response structures.

#### `app/services`

Contains the core AI service business logic.

`storage.py`

Downloads resume files from MinIO object storage.

`extractor.py`

Extracts raw text from PDF resume files.

`parser.py`

Parses extracted resume text and converts it into structured candidate information.

#### `app/utils`

Contains shared configuration and utility logic.

`config.py` manages service configuration and environment variables.

---

### `bff`

The Backend-for-Frontend API service.

The BFF acts as the main entry point between the client application, storage layer, database, and AI service.

#### `prisma`

Contains the Prisma database schema and database configuration.

`schema.prisma` defines the PostgreSQL data models used by the ATS.

#### `src/config`

Contains infrastructure configuration.

`minio.ts`

Creates and configures the MinIO client used for resume object storage.

`prisma.ts`

Creates the Prisma client used to communicate with PostgreSQL.

#### `src/controllers`

Contains HTTP request and response handling.

`document.controller.ts` receives resume upload requests and delegates processing to the document service.

Controllers are intentionally kept thin. Business logic is handled inside the service layer.

#### `src/middleware`

Contains Express middleware.

`upload.middleware.ts` handles resume file uploads using multipart form data.

#### `src/services`

Contains application business logic.

`document.service.ts` is responsible for:

* Generating a unique object key
* Preserving the original file extension
* Uploading the resume buffer to MinIO
* Saving document metadata to PostgreSQL
* Handling storage and database consistency

#### `server.ts`

The entry point of the BFF service.

It initializes the Express application, middleware, routes, and HTTP server.

---

### `client`

Reserved for the ATS frontend application.

The frontend will provide the recruitment dashboard and candidate management interface.

---

### `docker-compose.yml`

Defines the local ATS infrastructure and service dependencies.

The development environment includes:

* PostgreSQL
* MinIO
* ATS services

Docker Compose is used to provide a reproducible local development environment.

## Current Core Feature

The current implemented workflow is resume ingestion and parsing.

When a resume is uploaded:

1. The BFF receives the PDF file.
2. A unique object key is generated.
3. The resume is uploaded to MinIO.
4. Resume metadata is stored in PostgreSQL.
5. The AI service downloads the resume from MinIO.
6. PDF text is extracted.
7. Candidate information is parsed into structured data.

## Planned MVP Modules

The ATS architecture is designed around the following domains:

* Identity & Access
* Organization
* Candidate Management
* Job Management
* Application Management
* Interview Management
* Document Management
* AI Services

Future AI capabilities will include candidate-job matching, candidate ranking, intelligent search, and recruitment automation.

## Project Goal

The goal of this project is to build a scalable ATS foundation where traditional recruitment workflows and AI processing are separated into clear service boundaries.

The initial focus is infrastructure and core resume processing rather than building all recruitment features at once.

## Development Status

🚧 Active Development

The current implementation is an MVP and the architecture may evolve as additional ATS modules are introduced.
