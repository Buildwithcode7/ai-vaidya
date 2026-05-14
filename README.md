# 🌿 AI Vaidya — Intelligent Ayurveda Q&A Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg)](https://fastapi.tiangolo.com)

> An AI-powered, domain-specific Retrieval-Augmented Generation (RAG) assistant for Ayurveda knowledge. Upload classical texts and ask questions — every answer is grounded in your uploaded documents with full citations.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **Document Ingestion** | Upload PDF, TXT, DOCX up to 100MB |
| 🔍 **Semantic Retrieval** | Cosine similarity via ChromaDB + sentence-transformers |
| 🤖 **RAG Q&A** | LLaMA3 via Groq API, grounded in uploaded texts |
| 📎 **Citation Backing** | Every answer includes source, page number, snippet |
| 🎤 **Voice I/O** | Speech-to-text input + text-to-speech output |
| 🔬 **Semantic Search** | Direct document library search with highlighting |
| 🕸️ **Knowledge Graph** | Herb ↔ Dosha ↔ Treatment relationships |
| 📊 **Analytics Dashboard** | Top herbs, pages, chunk stats per document |
| 🌗 **Dark Mode** | Premium healthcare teal/sage/gold palette |

---

## 🏗️ Architecture

```
User Question
     │
     ▼
Query Embedding (all-MiniLM-L6-v2)
     │
     ▼
ChromaDB Semantic Search (top-k chunks)
     │
     ▼
Context Builder
     │
     ▼
Groq LLaMA3 (with system prompt: no hallucinations)
     │
     ▼
Answer + Sources + Confidence
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- [Groq API Key](https://console.groq.com) (free tier)

### 1. Clone & Setup

```bash
git clone https://github.com/your-org/ai-vaidya.git
cd ai-vaidya
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your GROQ_API_KEY

# Run backend
python main.py
```

Backend runs at: **http://localhost:8000**
API Docs: **http://localhost:8000/docs**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure
copy .env.local.example .env.local
# Edit if needed (API URL defaults to localhost:8000)

# Run frontend
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 🐳 Docker Deployment

```bash
# Set your API key
export GROQ_API_KEY=your_key_here

# Build & run both services
docker-compose up --build
```

---

## 🔑 Environment Variables

### Backend (`.env`)

| Variable | Description | Required |
|---|---|---|
| `GROQ_API_KEY` | Groq API key for LLaMA3 | ✅ Yes |
| `LLM_MODEL` | Model ID (default: `llama3-70b-8192`) | No |
| `EMBEDDING_MODEL` | Sentence transformer model | No |
| `CHUNK_SIZE` | Token chunk size (default: 800) | No |
| `TOP_K_RETRIEVAL` | Number of chunks to retrieve | No |

### Frontend (`.env.local`)

| Variable | Default |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` |

---

## 📡 API Reference

### Upload Document
```http
POST /api/v1/upload/
Content-Type: multipart/form-data

file: <PDF/TXT/DOCX>
```

### Check Processing Status
```http
GET /api/v1/upload/status/{document_id}
```

### Ask a Question
```http
POST /api/v1/query/ask
Content-Type: application/json

{
  "question": "What are the three doshas?",
  "top_k": 5,
  "chat_history": []
}
```

### Semantic Search
```http
POST /api/v1/query/search
Content-Type: application/json

{
  "query": "turmeric wound healing",
  "top_k": 10
}
```

### Knowledge Graph
```http
GET /api/v1/query/knowledge-graph
```

---

## 📂 Project Structure

```
ai-vaidya/
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── requirements.txt
│   ├── routers/
│   │   ├── upload.py              # Upload API
│   │   └── query.py               # Q&A & Search API
│   ├── services/
│   │   ├── document_processor.py  # PDF/text extraction & chunking
│   │   ├── embeddings.py          # Sentence transformer wrapper
│   │   ├── vector_store.py        # ChromaDB interface
│   │   └── rag_pipeline.py        # Full RAG chain + knowledge graph
│   ├── models/
│   │   └── schemas.py             # Pydantic schemas
│   └── utils/
│       └── config.py              # Settings management
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── chat/page.tsx      # AI Q&A chat
│   │   │   ├── upload/page.tsx    # Document upload
│   │   │   ├── knowledge/page.tsx # Knowledge dashboard
│   │   │   ├── search/page.tsx    # Semantic search
│   │   │   └── about/page.tsx     # About & architecture
│   │   ├── components/
│   │   │   └── Navbar.tsx
│   │   └── lib/
│   │       └── api.ts             # API client
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🧠 Sample Ayurveda Texts to Upload

- [Charaka Samhita (Archive.org)](https://archive.org/details/CharakaSamhita)
- [Sushruta Samhita (NIIMH)](https://niimh.nic.in/ebooks/)
- [The Yoga of Herbs by Vasant Lad](https://archive.org/search?query=yoga+of+herbs)

---

## 🤝 Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT © 2025 AI Vaidya Project
