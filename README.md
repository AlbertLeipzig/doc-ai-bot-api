# Doc Ai Q&A Chatbot Api for Web Documentation

## Goal

This API is the central piece of a larger project: a RAG-based chatbot for web documentation. It exposes endpoints to:

- Scrape and ingest web documents into a vector store
- Answer questions by retrieving relevant context and generating grounded responses
- Measure and compare the effect of different ingestion parameters (model, chunk size, chunk overlap, topK) through quantitative metrics

---

## Index

|                                             |                                                |
| ------------------------------------------- | ---------------------------------------------- |
| [Features](#features)                       | What the API does                              |
| [Setup](#setup)                             | Prerequisites, installation, and configuration |
| [Endpoints Reference](#endpoints-reference) | Full endpoint table with request bodies        |
| [Project Structure](#project-structure)     | Annotated directory overview                   |
| [Architecture](#architecture)               | RAG pipeline explained                         |
| [Tech Stack](#tech-stack)                   | Libraries and their roles                      |

---

## Features

- **Document Ingestion** — scrapes web documentation (e.g. Angular, D3.js), chunks, embeds, and stores it as vectors in MongoDB Atlas. Ingestion parameters (model, chunk size, overlap) are tunable per request and recorded in a Vector Profile for traceability.
- **RAG Chat** — answers questions by retrieving the most relevant chunks from the vector store and generating a response via a local LLM (Ollama). Conversations and messages are persisted.
- **Benchmarking** — exposes quantitative metrics (vector usage, request time) per request to allow comparison across different ingestion parameter configurations. Qualitative measurement is planned.

---

## Setup

### 0. Prerequisites

- Node.js v20
- [Ollama](https://ollama.com) running locally with the following models pulled:

```bash
ollama pull nomic-embed-text
ollama pull qwen2.5:1.5b
```

> Both models were chosen for their lightweight footprint so the application runs on most machines. They can be swapped in `apiConfig.ts`.

### 1. Clone & install

**Clone and Install**

```bash
git clone <repo-url>
cd <repo-name>
npm install
```

### 2. Database

This project uses MongoDB Atlas. Follow the [official setup guide](https://www.mongodb.com/docs/get-started/?language=nodejs) to create a cluster and obtain your connection string.

### 3. Setting up the Environment

```bash
cp .env.example .env
```

Update the values in `.env` before running.

### 4. Run

```bash
npm run dev
```

---

## Endpoints Reference

### Quick Reference

| Action                  | Endpoint             | Method |
| ----------------------- | -------------------- | ------ |
| Ingest documents        | `/ingest`            | POST   |
| Ask a question          | `/chat`              | POST   |
| Get conversation list   | `/conversation/list` | GET    |
| Get single conversation | `/conversation/:id`  | GET    |

### Endpoint Complete Reference

| Action                          | Endpoint               | Method | Body                                                                            |
| ------------------------------- | ---------------------- | ------ | ------------------------------------------------------------------------------- |
| **AUTH**                        |                        |        |                                                                                 |
| Login                           | `/auth/login`          | POST   | `{ username: string, password: string }`                                        |
| Logout                          | `/auth/logout`         | DELETE |                                                                                 |
| Verify token                    | `/auth/verify`         | GET    |                                                                                 |
| **CHAT**                        |                        |        |                                                                                 |
| Ask a question                  | `/chat`                | POST   | `{ question: string, vectorProfileId?: string, conversationId?: string }`       |
| **CONVERSATION**                |                        |        |                                                                                 |
| Get conversation list           | `/conversation/list`   | GET    |                                                                                 |
| Get single conversation         | `/conversation/:id`    | GET    |                                                                                 |
| Delete single conversation      | `/conversation/:id`    | DELETE |                                                                                 |
| Delete multiple conversations   | `/conversation`        | DELETE |                                                                                 |
| **HEALTH**                      |                        |        |                                                                                 |
| Liveness check                  | `/health`              | GET    |                                                                                 |
| Readiness check                 | `/ready`               | GET    |                                                                                 |
| **INGESTION**                   |                        |        |                                                                                 |
| Ingest web documents            | `/ingest`              | POST   | `{ urls: string[], chunkSize?: number, chunkOverlap?: number, model?: string }` |
| **VECTOR**                      |                        |        |                                                                                 |
| Delete all vectors              | `/vector`              | DELETE |                                                                                 |
| **VECTOR PROFILE**              |                        |        |                                                                                 |
| Get vector profile list         | `/vector-profile/list` | GET    |                                                                                 |
| Get single vector profile       | `/vector-profile/:id`  | GET    |                                                                                 |
| Delete single vector profile    | `/vector-profile/:id`  | DELETE |                                                                                 |
| Delete multiple vector profiles | `/vector-profile`      | DELETE |                                                                                 |

- **Chat** : in order to send a request to /chat you'll need a vectorProfileId that indicates the API which Vector Profile do you want to use for this **Notes:**

- **Chat** — `vectorProfileId` specifies which Vector Profile (and therefore which vector collection) to query. A prior call to `/vector-profile/list` is required to obtain one. Subsequent messages in the same conversation can reuse the `conversationId` returned from the first response — `vectorProfileId` is not required after the first message.
- **Ingestion** — `urls` is the only required field. `chunkSize`, `chunkOverlap`, and `model` are optional and fall back to defaults defined in `apiConfig.ts`.
- **Vector** — maintenance endpoint for cleaning up the vector store without removing the associated Vector Profile records.

---

## Project Structure

```
src/
├── controllers/
│   ├── authController.ts             # Login, logout, token verify
│   ├── chatController.ts             # RAG pipeline entry point
│   ├── conversationController.ts     # Conversation CRUD
│   ├── healthController.ts           # Liveness and readiness checks
│   ├── ingestionController.ts        # Orchestrates scrape → chunk → embed → store
│   ├── messagesController.ts         # Internal — messages are handled via conversation
│   ├── retrieveController.ts         # Internal — called by chatController
│   ├── vectorController.ts           # Vector store maintenance
│   └── vectorProfileController.ts    # Vector Profile read and delete
├── middlewares/
│   ├── authMiddleware.ts             # JWT verification
│   ├── errorHandlingMiddleware.ts    # Global error handler
│   └── rateLimitingMiddleware.ts     # Request throttling
├── models/
│   ├── conversationModel.ts
│   ├── messageModel.ts
│   ├── vectorModel.ts
│   └── vectorProfileModel.ts
├── routers/
│   ├── apiRouter.ts                  # Root router — mounts all sub-routers
│   ├── authRouter.ts
│   ├── conversationRouter.ts
│   ├── healthRouter.ts
│   ├── messageRouter.ts              # Internal
│   ├── ragRouter.ts                  # Mounts /chat and /ingest
│   ├── vectorProfileRouter.ts
│   └── vectorRouter.ts
├── services/
│   ├── appStateService.ts            # Application readiness state
│   ├── dbService.ts                  # MongoDB connection
│   ├── embeddingService.ts           # Text embedding via nomic-embed-text
│   ├── generationService.ts          # Response generation via qwen2.5
│   ├── ingestionService.ts           # Full ingestion pipeline orchestration
│   ├── retrieveService.ts            # Vector similarity search
│   ├── sleepService.ts               # Async delay utility
│   ├── startServer.ts                # Server bootstrap
│   ├── systemMessageService.ts       # LLM system prompt construction
│   ├── urlService.ts                 # URL validation and normalization
│   └── webScraper.ts                 # HTML scraping via Cheerio
└── utils/
│   └── endpointsReferenceTable.ts    # Programmatic endpoint registry
└── server.ts                         # Entry point
```

---

## Architecture

This API is built around a RAG (Retrieval-Augmented Generation) pipeline, split into two main flows:

**Ingestion**

```
POST /ingest
  → fetch and scrape URLs (Cheerio + axios)
  → chunk text (LangChain text splitter)
  → embed chunks (nomic-embed-text via Ollama)
  → store vectors (MongoDB Atlas)
  → create Vector Profile (records model, chunkSize, chunkOverlap)
```

**Chat**

```
POST /chat
  → create Conversation if none exists
  → embed question (nomic-embed-text via Ollama)
  → retrieve top-K relevant chunks (MongoDB Atlas vector search)
  → build prompt with retrieved context + system message
  → generate response (qwen2.5 via Ollama)
  → persist Message and update Conversation
```

**Vector Profiles** are immutable records created automatically during ingestion. They capture the exact parameters used (model, chunk size, overlap) and are referenced by Conversations — providing metadata context that explains why a given response looks the way it does. This is what makes cross-parameter benchmarking possible: each ingestion run is traceable and comparable.

---

## Tech Stack

| Package              | Role                                            |
| -------------------- | ----------------------------------------------- |
| `express`            | HTTP server and routing                         |
| `mongoose`           | MongoDB ODM                                     |
| `langchain`          | Text splitting and RAG pipeline utilities       |
| `ollama`             | Local LLM inference — embeddings and generation |
| `cheerio`            | HTML parsing and scraping                       |
| `axios`              | HTTP client for URL fetching                    |
| `jsonwebtoken`       | JWT-based authentication                        |
| `express-rate-limit` | Request throttling                              |
| `cookie-parser`      | Cookie handling                                 |
| `cors`               | Cross-origin resource sharing                   |
| `dotenv`             | Environment variable loading                    |
