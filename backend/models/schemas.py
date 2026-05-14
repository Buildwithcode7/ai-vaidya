"""
Pydantic schemas for AI Vaidya API
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ConfidenceLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ─── Upload Schemas ────────────────────────────────────────────────
class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    status: DocumentStatus
    message: str
    file_size_mb: float
    upload_time: datetime = Field(default_factory=datetime.utcnow)


class DocumentProcessingStatus(BaseModel):
    document_id: str
    filename: str
    status: DocumentStatus
    progress: int = Field(ge=0, le=100, description="Percentage complete")
    chunks_created: int = 0
    total_pages: int = 0
    error_message: Optional[str] = None
    completed_at: Optional[datetime] = None


# ─── Document Metadata ─────────────────────────────────────────────
class DocumentMetadata(BaseModel):
    document_id: str
    filename: str
    file_type: str
    file_size_mb: float
    total_pages: int
    total_chunks: int
    status: DocumentStatus
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    top_herbs: List[str] = []
    top_concepts: List[str] = []
    language: str = "en"


class DocumentListResponse(BaseModel):
    documents: List[DocumentMetadata]
    total_count: int
    total_chunks: int


# ─── Q&A / Chat Schemas ────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SourceChunk(BaseModel):
    document_id: str
    document_name: str
    page_number: Optional[int] = None
    chunk_text: str
    relevance_score: float = Field(ge=0.0, le=1.0)
    chunk_index: int


class QueryRequest(BaseModel):
    question: str = Field(min_length=3, max_length=2000)
    top_k: int = Field(default=5, ge=1, le=20)
    document_ids: Optional[List[str]] = None  # Filter by specific docs
    chat_history: Optional[List[ChatMessage]] = []
    language: str = "en"


class QueryResponse(BaseModel):
    question: str
    answer: str
    confidence: ConfidenceLevel
    confidence_score: float = Field(ge=0.0, le=1.0)
    sources: List[SourceChunk]
    related_concepts: List[str] = []
    related_herbs: List[str] = []
    processing_time_ms: int
    tokens_used: Optional[int] = None


# ─── Knowledge Graph ───────────────────────────────────────────────
class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # herb | disease | dosha | treatment | concept
    description: Optional[str] = None
    size: int = 10


class GraphEdge(BaseModel):
    source: str
    target: str
    label: str
    weight: float = 1.0


class KnowledgeGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    document_id: Optional[str] = None


# ─── Analytics ─────────────────────────────────────────────────────
class HerbFrequency(BaseModel):
    herb: str
    count: int
    documents: List[str]


class ConceptFrequency(BaseModel):
    concept: str
    count: int


class DocumentAnalytics(BaseModel):
    document_id: str
    document_name: str
    total_pages: int
    total_chunks: int
    top_herbs: List[HerbFrequency]
    top_diseases: List[ConceptFrequency]
    top_doshas: List[ConceptFrequency]
    language_distribution: Dict[str, float] = {}
    avg_chunk_length: float = 0


class GlobalAnalytics(BaseModel):
    total_documents: int
    total_chunks: int
    total_pages: int
    top_herbs: List[HerbFrequency]
    top_diseases: List[ConceptFrequency]
    most_queried: List[str] = []


# ─── Search ────────────────────────────────────────────────────────
class SearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=500)
    document_ids: Optional[List[str]] = None
    top_k: int = Field(default=10, ge=1, le=50)


class SearchResult(BaseModel):
    chunk_text: str
    document_name: str
    document_id: str
    page_number: Optional[int]
    relevance_score: float
    highlight: Optional[str] = None


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total_results: int
    search_time_ms: int


# ─── Health Check ──────────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str
    version: str
    vector_db_status: str
    llm_provider: str
    total_documents: int
    total_chunks: int
    embedding_model: str
