# AI Anki (Build in Public)

I am building an AI-powered study tool that turns source material into Anki flashcards.

This project has two goals:
- Build a real AI Anki App that everyone can use.
- Learn how to design and integrate AI pipelines in Node.js backend systems.

## What It Does

Planned end-to-end flow:
1. Upload study material (PDF first).
2. Extract and chunk content in background jobs.
3. Generate flashcards with AI.
4. Format cards for studying.
5. Export an Anki-compatible CSV deck.

## Why I Am Building It

Manual flashcard creation takes too long. I want a repeatable pipeline that saves time and helps me learn production-style AI architecture:
- API + worker separation
- Queue-based async processing
- LLM integration with structured outputs
- Reliable job status and downloadable results

## Current MVP Progress

- [x] #1 Upload PDF and enqueue background job
- [x] #2 Track background job status
- [x] #3 Extract text from PDF in worker
- [x] #4 Chunk extracted text for LLM processing
- [ ] #5 Generate flashcards with OpenAI via LangChain
- [ ] #6 Improve card formatting for study quality
- [ ] #7 Export Anki-compatible CSV
- [ ] #8 Download endpoint for completed deck
- [ ] #9 Add retries and structured logs
- [ ] #10 Document local dev flow end-to-end

## Current Tech Stack

- Frontend: Next.js (planned)
- Backend: Node.js + TypeScript + Fastify
- Queue: BullMQ + Redis
- AI: OpenAI LangChain integration
- Parsing: `pdf-parse`

## Backend Quick Start

From `/Users/christiankochecheverria/Documents/Projects/AI-Anki/backend`:

```bash
npm install
```

Start Redis (required by BullMQ):

```bash
redis-server
```

Run API and worker in separate terminals:

```bash
npm run dev:server
```

```bash
npm run dev:worker
```

## Current API Endpoints

- `GET /health`
- `POST /jobs` (upload one PDF via multipart form)
- `GET /jobs/:jobId/status`

Example upload:

```bash
curl -i -X POST http://localhost:4000/jobs \
  -F "file=@/absolute/path/to/file.pdf"
```

## Build Notes

This is a learning-focused project. I am intentionally building the pipeline step-by-step so the architecture stays clear and maintainable.
