"""
Vector Store Service using ChromaDB
Handles document storage and semantic retrieval
"""
import uuid
from typing import List, Dict, Optional, Tuple, Any
from loguru import logger

from utils.config import settings


class VectorStoreService:
    _instance: Optional["VectorStoreService"] = None
    _client = None
    _collection = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._client is None:
            self._init_chroma()

    def _init_chroma(self):
        try:
            import chromadb
            from chromadb.config import Settings as ChromaSettings

            logger.info(f"Initializing ChromaDB at: {settings.chroma_persist_dir}")
            self._client = chromadb.PersistentClient(
                path=settings.chroma_persist_dir,
            )
            self._collection = self._client.get_or_create_collection(
                name=settings.chroma_collection_name,
                metadata={"hnsw:space": "cosine"},
            )
            logger.success(
                f"ChromaDB ready. Collection '{settings.chroma_collection_name}' "
                f"has {self._collection.count()} documents."
            )
        except Exception as e:
            logger.error(f"ChromaDB initialization failed: {e}")
            raise

    def add_documents(
        self,
        ids: List[str],
        texts: List[str],
        embeddings: List[List[float]],
        metadatas: List[Dict],
    ):
        """Add document chunks to ChromaDB"""
        if not texts:
            return
        try:
            # ChromaDB upsert to avoid duplicates
            self._collection.upsert(
                ids=ids,
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas,
            )
            logger.debug(f"Stored {len(texts)} chunks in ChromaDB")
        except Exception as e:
            logger.error(f"ChromaDB add error: {e}")
            raise

    def query(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        document_ids: Optional[List[str]] = None,
    ) -> Dict:
        """Semantic search in ChromaDB"""
        try:
            where = None
            if document_ids and len(document_ids) == 1:
                where = {"document_id": document_ids[0]}
            elif document_ids and len(document_ids) > 1:
                where = {"document_id": {"$in": document_ids}}

            results = self._collection.query(
                query_embeddings=[query_embedding],
                n_results=min(top_k, self._collection.count() or 1),
                where=where,
                include=["documents", "metadatas", "distances"],
            )
            return results
        except Exception as e:
            logger.error(f"ChromaDB query error: {e}")
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

    def delete_document(self, document_id: str):
        """Delete all chunks for a document"""
        try:
            results = self._collection.get(
                where={"document_id": document_id},
                include=["documents"],
            )
            if results and results["ids"]:
                self._collection.delete(ids=results["ids"])
                logger.info(f"Deleted {len(results['ids'])} chunks for doc {document_id}")
        except Exception as e:
            logger.error(f"Delete error: {e}")
            raise

    def get_collection_stats(self) -> Dict:
        try:
            count = self._collection.count()
            return {"total_chunks": count, "status": "healthy"}
        except Exception as e:
            return {"total_chunks": 0, "status": f"error: {e}"}

    def is_ready(self) -> bool:
        try:
            self._collection.count()
            return True
        except:
            return False

    def search_text(
        self,
        query_embedding: List[float],
        top_k: int = 10,
        document_ids: Optional[List[str]] = None,
    ) -> List[Dict]:
        """Search and return formatted results"""
        raw = self.query(query_embedding, top_k, document_ids)
        results = []
        docs = raw.get("documents", [[]])[0]
        metas = raw.get("metadatas", [[]])[0]
        dists = raw.get("distances", [[]])[0]

        for doc, meta, dist in zip(docs, metas, dists):
            # Cosine distance → similarity score (0–1)
            score = max(0.0, 1.0 - dist)
            results.append({
                "chunk_text": doc,
                "document_name": meta.get("document_name", "Unknown"),
                "document_id": meta.get("document_id", ""),
                "page_number": meta.get("page_number"),
                "chunk_index": meta.get("chunk_index", 0),
                "relevance_score": round(score, 4),
            })
        return results
