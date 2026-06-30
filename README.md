# CodeLens AI

**AI-powered codebase explorer that turns hours of onboarding into minutes of conversation.**

Paste a GitHub repository URL. Ask questions in plain English. Get accurate answers grounded in the actual code — not guesses, not hallucinations. Visualize how a feature flows through the entire stack, from frontend component to database write.

---

## The Problem

Joining a new codebase usually looks like this:

```
1,200 files. 200 APIs. 50 services.
Your manager says: "Understand the authentication flow."
You spend 2 days opening files like a digital archaeologist.
```

CodeLens AI replaces that archaeology with a conversation.

---

## What It Does

- **Import any public GitHub repository** — CodeLens fetches every file, analyzes its structure, and makes it instantly explorable.
- **Ask questions in natural language** — "How does authentication work?" returns a grounded answer citing the exact files involved, not a generic explanation of how auth usually works.
- **Visualize feature flows** — "Show me the login flow" returns a structured, interactive diagram tracing the request from UI to database.
- **Explore the code directly** — a VS Code-style file tree with full syntax highlighting, sitting right next to the AI conversation.

---

## Why This Isn't Just "ChatGPT With File Upload"

Most "AI codebase tools" embed raw source code directly into a vector database and hope semantic search finds the right file. It doesn't work as well as it sounds.

**The problem:** code and natural language don't share a vocabulary. A file named `auth.controller.js` might internally use `signUp`, `signIn`, `bcrypt`, and `jwt` — and never once contain the word "authentication." A pure embedding search comparing the question *"how does authentication work"* against that raw code consistently misses the most relevant file, because the literal words don't match and the code's surface vocabulary pulls the embedding in a different direction.

**The fix:** CodeLens generates a natural-language summary of every file *before* embedding it — using an LLM to bridge the gap between "what the question says" and "what the code does." The summary is what gets searched; the real, unmodified code is what gets shown to the model when answering. This is the same "contextual retrieval" pattern used in production RAG systems, applied to source code.

This single architectural decision is the difference between a demo that looks good with cherry-picked questions and a tool that actually answers correctly across different parts of a codebase.

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   GitHub    │────▶│   Backend    │────▶│   MongoDB     │
│   Repo URL  │     │  (Express)   │     │ (file content,│
└─────────────┘     └──────┬───────┘     │  metadata)    │
                            │              └───────────────┘
                            ▼
                   ┌──────────────────┐
                   │  Per-file Groq   │
                   │  summarization   │
                   └────────┬─────────┘
                            ▼
                   ┌──────────────────┐
                   │  Pinecone vector │
                   │  store (1 vector │
                   │   per file)      │
                   └────────┬─────────┘
                            ▼
              ┌─────────────────────────┐
              │   Question arrives       │
              │   → embed → search       │
              │   → retrieve real code   │
              │   → Groq generates       │
              │     grounded answer      │
              └─────────────────────────┘
```

**Retrieval pipeline (shared by both AI Chat and Flow Visualization):**

1. User's question is embedded and matched against per-file summary vectors in Pinecone
2. The actual files behind the top matches are pulled fresh from MongoDB — never the summary, always the real code
3. That real code is sent to Groq's `llama-3.3-70b-versatile` with a strict instruction: answer only from what's shown, never invent code that isn't there
4. The same pipeline powers two different outputs — free-form markdown for the chat, and constrained JSON (via `response_format: json_object`) for flow diagrams — just by swapping the prompt and output contract

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Flow |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Vector Store | Pinecone |
| LLM | Groq (Llama 3.3 70B) |
| Auth | JWT (access + refresh tokens), httpOnly cookies, bcrypt |
| Repo Integration | GitHub REST API |

---

## Core Features

### 1. Authentication
Access/refresh token rotation with httpOnly cookies — not `localStorage`. Access tokens expire in 15 minutes; an Axios interceptor silently refreshes them on a 401 and retries the original request, so the user never notices.

### 2. Repository Import
Paste a GitHub URL → CodeLens recursively fetches every file (skipping `node_modules`, lockfiles, binaries, and other noise), detects language, and extracts functions, classes, and imports via per-language pattern matching. Import status streams live: `pending → processing → ready`.

### 3. AI Assistant
Ask anything about the imported codebase. Every answer is grounded in retrieved source files — the model is explicitly instructed never to fabricate code it wasn't shown, and every response lists the exact files it used.

### 4. Flow Visualization
Describe a flow in plain English ("show me the message sending flow") and get back a structured, multi-step diagram showing exactly which files and functions are involved, in order, rendered as an interactive React Flow graph.

### 5. Repository Explorer
A file tree alongside a syntax-highlighted code viewer, with detected functions and classes surfaced as quick-reference tags — no need to read the whole file to know what's in it.

### 6. Persistent History
Every chat and flow result is saved per repository and reloads automatically, with a collapsible history drawer for jumping back to any earlier question.

---

## Known Limitations (and Why They Exist)

Built deliberately, not accidentally missed:

- **Per-file summaries, not per-chunk.** A single 2-3 sentence summary represents an entire file. For very large, multi-purpose files, this can dilute precision — a more granular fix would summarize each logical section independently, at the cost of significantly more LLM calls during import. Given Groq's free-tier rate limits and the typical size of real-world project files, per-file was the right tradeoff for this build.
- **Vague, non-specific questions retrieve weakly.** "What does this project do?" has no strong semantic anchor to search against, and tends to surface boilerplate files (configs, default READMEs) rather than the actual product logic. Specific questions ("how does X work") perform consistently well — this is an inherent property of embedding-based retrieval, not a bug.
- **Rate-limited by the LLM provider's free tier.** Importing very large repositories in a single session can hit Groq's daily token quota, which degrades the last few file summaries to a fallback format. The system catches this gracefully rather than crashing the import.

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- API keys: GitHub personal access token, Pinecone, Groq

### Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
GITHUB_TOKEN=your_github_token
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=codelens
GROQ_API_KEY=your_groq_key
```

```bash
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Visit `http://localhost:5173`.

---

## Project Structure

```
codelens-ai/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # FileTree, FileViewer, AgentPanel, FlowDiagram, etc.
│       ├── context/         # AuthContext
│       ├── pages/           # Login, Register, Dashboard, RepositoryWorkspace
│       └── utils/            # Axios instance with auto-refresh
│
└── server/                 # Node/Express backend
    └── src/
        ├── controllers/     # auth, repository, chat, flow
        ├── services/         # githubService, pineconeService, groqService
        ├── models/            # User, Repository, FileMetadata, ChatHistory
        ├── middleware/        # JWT auth protection
        └── routes/
```

---

<img width="1896" height="906" alt="image" src="https://github.com/user-attachments/assets/a00227b4-69dc-437e-8ebe-32ec4ed04002" />


## Author

Built by Ayush Durukkar — B.Tech CSE, MIT World Peace University, Pune.
