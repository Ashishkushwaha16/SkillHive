"""
SkillHive Advanced AI Search Engine
Features: Hybrid Search (BM25 + Vector), Fuzzy Matching, Query Expansion, Ranking, Analytics
"""

import json
import math
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Optional

import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi
from fuzzywuzzy import fuzz
from fuzzywuzzy import process as fuzzy_process

# ============================================================
# CONFIGURATION
# ============================================================
HYBRID_WEIGHT_VECTOR = 0.6  # 60% weight to vector search
HYBRID_WEIGHT_BM25 = 0.4    # 40% weight to BM25
MIN_FUZZY_MATCH_SCORE = 80   # Fuzzy matching threshold
VECTOR_SCORE_THRESHOLD = 0.2
BM25_SCORE_THRESHOLD = 5.0   # BM25 is unbounded, we use a lower threshold
ANALYTICS_FILE = "search_analytics.json"
ZERO_RESULT_QUERIES_FILE = "zero_result_queries.json"


class AdvancedSearchEngine:
    """Advanced search with hybrid ranking, fuzzy matching, and analytics."""
    
    def __init__(self, chunks: list[dict], embed_model: SentenceTransformer):
        """Initialize the search engine with chunks and embedding model."""
        self.chunks = chunks
        self.embed_model = embed_model
        
        # Build BM25 index
        self.bm25 = self._build_bm25_index(chunks)
        
        # Build FAISS vector index
        self.faiss_index, self.embeddings = self._build_faiss_index(chunks)
        
        # Build text lookup for fuzzy matching
        self.chunk_texts = [c["content"][:500] for c in chunks]  # First 500 chars
        self.chunk_sources = [c["source"] for c in chunks]
        
        # Query expansion dictionary
        self.query_synonyms = self._load_query_synonyms()
        
        # Analytics tracking
        self.analytics = self._load_analytics()
        self.zero_result_queries = self._load_zero_result_queries()
        
    def _build_bm25_index(self, chunks: list[dict]) -> BM25Okapi:
        """Build BM25 index for lexical search."""
        print("[Advanced Search] Building BM25 index...")
        corpus = [c["content"].split() for c in chunks]
        return BM25Okapi(corpus)
    
    def _build_faiss_index(self, chunks: list[dict]) -> tuple:
        """Build FAISS index for vector search."""
        print("[Advanced Search] Building FAISS vector index...")
        texts = [c["content"] for c in chunks]
        embeddings = self.embed_model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        embeddings = embeddings.astype("float32")
        faiss.normalize_L2(embeddings)
        
        dim = embeddings.shape[1]
        index = faiss.IndexFlatIP(dim)
        index.add(embeddings)
        print(f"[Advanced Search] FAISS index ready: {index.ntotal} vectors (dim={dim})")
        return index, embeddings
    
    def _load_query_synonyms(self) -> dict:
        """Load query synonyms for expansion."""
        synonyms = {
            "login": ["signin", "authentication", "auth", "credentials", "password", "username"],
            "password": ["pwd", "credential", "access", "unlock"],
            "profile": ["account", "user", "settings", "preferences"],
            "message": ["chat", "dm", "email", "notification", "inbox"],
            "attendance": ["presence", "time", "working hours", "checkin", "checkout"],
            "feedback": ["review", "rating", "comment", "suggestion", "evaluation"],
            "task": ["work", "assignment", "project", "todo", "item"],
            "error": ["bug", "issue", "problem", "failure", "crash"],
            "help": ["support", "assist", "guide", "documentation"],
            "reset": ["recover", "restore", "clear", "reinitialize"],
        }
        return synonyms
    
    def _expand_query(self, query: str) -> list[str]:
        """Expand query with synonyms."""
        expanded = [query.lower()]
        words = query.lower().split()
        
        for word in words:
            if word in self.query_synonyms:
                expanded.extend(self.query_synonyms[word])
        
        return list(set(expanded))  # Remove duplicates
    
    def _bm25_search(self, query: str, top_k: int = 5) -> list[tuple[int, float]]:
        """BM25 lexical search."""
        query_tokens = query.lower().split()
        scores = self.bm25.get_scores(query_tokens)
        
        # Get top-k indices
        top_indices = np.argsort(-scores)[:top_k]
        results = [(int(idx), float(scores[idx])) for idx in top_indices]
        return results
    
    def _vector_search(self, query: str, top_k: int = 5) -> list[tuple[int, float]]:
        """Vector semantic search."""
        q_vec = self.embed_model.encode([query], convert_to_numpy=True).astype("float32")
        faiss.normalize_L2(q_vec)
        scores, indices = self.faiss_index.search(q_vec, top_k)
        
        results = [(int(idx), float(score)) for idx, score in zip(indices[0], scores[0])]
        return results
    
    def _normalize_scores(self, results: list[tuple[int, float]], score_type: str) -> dict:
        """Normalize scores to 0-1 range."""
        if not results:
            return {}
        
        normalized = {}
        if score_type == "bm25":
            # BM25 scores: normalize by max
            max_score = max(score for _, score in results) + 1e-6
            for idx, score in results:
                normalized[idx] = max(0, min(1, score / max_score))
        else:  # vector
            # Vector scores already 0-1 after normalization
            for idx, score in results:
                normalized[idx] = max(0, min(1, score))
        
        return normalized
    
    def _hybrid_ranking(self, query: str, top_k: int = 5) -> list[tuple[int, float, str]]:
        """Combine BM25 + Vector search with weighted ranking."""
        # Get results from both methods
        bm25_results = self._bm25_search(query, top_k=10)
        vector_results = self._vector_search(query, top_k=10)
        
        # Normalize scores
        bm25_scores = self._normalize_scores(bm25_results, "bm25")
        vector_scores = self._normalize_scores(vector_results, "vector")
        
        # Merge results
        merged = defaultdict(lambda: {"bm25": 0, "vector": 0})
        for idx, score in bm25_scores.items():
            merged[idx]["bm25"] = score
        for idx, score in vector_scores.items():
            merged[idx]["vector"] = score
        
        # Combine scores
        ranked = []
        for idx, scores in merged.items():
            hybrid_score = (
                HYBRID_WEIGHT_BM25 * scores["bm25"] +
                HYBRID_WEIGHT_VECTOR * scores["vector"]
            )
            # Determine which method ranked it higher
            rank_source = "vector" if scores["vector"] > scores["bm25"] else "bm25"
            ranked.append((idx, hybrid_score, rank_source))
        
        # Sort by hybrid score
        ranked.sort(key=lambda x: x[1], reverse=True)
        return ranked[:top_k]
    
    def _fuzzy_match_chunks(self, query: str, threshold: int = MIN_FUZZY_MATCH_SCORE) -> list[tuple[int, int]]:
        """Find chunks with similar content (typo tolerance)."""
        matches = []
        query_lower = query.lower()
        
        for idx, chunk_text in enumerate(self.chunk_texts):
            score = fuzz.partial_token_set_ratio(query_lower, chunk_text.lower())
            if score >= threshold:
                matches.append((idx, score))
        
        matches.sort(key=lambda x: x[1], reverse=True)
        return matches[:3]  # Return top 3 fuzzy matches
    
    def _calculate_confidence(self, scores: list[float]) -> float:
        """Calculate search confidence (0-1)."""
        if not scores:
            return 0.0
        
        avg_score = np.mean(scores)
        std_score = np.std(scores) if len(scores) > 1 else 0
        variance_penalty = std_score / (1 + std_score)
        confidence = max(0, avg_score - variance_penalty)
        return min(1.0, confidence)
    
    def _deduplicate_results(self, result_indices: list[int], threshold: float = 0.85) -> list[int]:
        """Remove duplicate/near-duplicate results."""
        if len(result_indices) <= 1:
            return result_indices
        
        kept = [result_indices[0]]
        for idx in result_indices[1:]:
            text_a = self.chunks[kept[-1]]["content"].lower()
            text_b = self.chunks[idx]["content"].lower()
            similarity = fuzz.token_set_ratio(text_a, text_b) / 100.0
            
            if similarity < threshold:
                kept.append(idx)
        
        return kept
    
    def search(self, query: str, top_k: int = 3, include_fuzzy: bool = True) -> dict:
        """
        Advanced search with hybrid ranking, fuzzy matching, and analytics.
        
        Returns:
        {
            "query": str,
            "results": [
                {
                    "rank": int,
                    "source": str,
                    "content": str,
                    "score": float,
                    "confidence": float,
                    "method": str (vector/bm25/fuzzy)
                },
                ...
            ],
            "confidence": float,
            "result_count": int,
            "has_results": bool,
            "suggestions": [str],  # Related query suggestions
            "timestamp": str
        }
        """
        try:
            # Hybrid ranking search
            ranked_results = self._hybrid_ranking(query, top_k=top_k * 2)
            result_indices = [idx for idx, _, _ in ranked_results]
            result_scores = [score for _, score, _ in ranked_results]
            
            # Add fuzzy matches if enabled and no good results
            if include_fuzzy and len(ranked_results) < 2:
                fuzzy_matches = self._fuzzy_match_chunks(query)
                for idx, score in fuzzy_matches:
                    if idx not in result_indices:
                        result_indices.append(idx)
                        result_scores.append(score / 100.0)
            
            # Deduplicate results
            result_indices = self._deduplicate_results(result_indices)
            
            # Format results
            formatted_results = []
            for rank, idx in enumerate(result_indices[:top_k], 1):
                score = result_scores[rank - 1] if rank <= len(result_scores) else 0.0
                chunk = self.chunks[idx]
                
                formatted_results.append({
                    "rank": rank,
                    "source": chunk["source"],
                    "content": chunk["content"][:400],  # First 400 chars
                    "score": round(float(score), 3),
                    "confidence": round(float(score), 3),
                    "method": "hybrid"
                })
            
            # Calculate overall confidence
            overall_confidence = self._calculate_confidence(result_scores[:top_k]) if result_scores else 0.0
            
            # Track analytics
            self._track_search(query, len(formatted_results) > 0, overall_confidence)
            
            return {
                "query": query,
                "results": formatted_results,
                "confidence": round(float(overall_confidence), 3),
                "result_count": len(formatted_results),
                "has_results": len(formatted_results) > 0,
                "suggestions": self._generate_suggestions(query),
                "timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            print(f"[ERROR] Search failed: {e}")
            return {
                "query": query,
                "results": [],
                "confidence": 0.0,
                "result_count": 0,
                "has_results": False,
                "suggestions": [],
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def _generate_suggestions(self, query: str) -> list[str]:
        """Generate related query suggestions."""
        suggestions = []
        query_words = query.lower().split()
        
        for word in query_words:
            if word in self.query_synonyms:
                for synonym in self.query_synonyms[word][:2]:
                    suggestions.append(query.replace(word, synonym))
        
        return list(set(suggestions))[:3]
    
    def _track_search(self, query: str, found_results: bool, confidence: float):
        """Track search queries for analytics."""
        self.analytics[query] = {
            "count": self.analytics.get(query, {}).get("count", 0) + 1,
            "last_search": datetime.now().isoformat(),
            "found": found_results,
            "avg_confidence": confidence
        }
        
        if not found_results:
            if query not in self.zero_result_queries:
                self.zero_result_queries[query] = {"count": 0, "first_seen": datetime.now().isoformat()}
            self.zero_result_queries[query]["count"] += 1
        
        # Save periodically
        if len(self.analytics) % 10 == 0:
            self._save_analytics()
    
    def _load_analytics(self) -> dict:
        """Load search analytics."""
        if Path(ANALYTICS_FILE).exists():
            try:
                return json.loads(Path(ANALYTICS_FILE).read_text())
            except:
                return {}
        return {}
    
    def _load_zero_result_queries(self) -> dict:
        """Load zero-result queries."""
        if Path(ZERO_RESULT_QUERIES_FILE).exists():
            try:
                return json.loads(Path(ZERO_RESULT_QUERIES_FILE).read_text())
            except:
                return {}
        return {}
    
    def _save_analytics(self):
        """Save analytics to file."""
        try:
            Path(ANALYTICS_FILE).write_text(json.dumps(self.analytics, indent=2))
            Path(ZERO_RESULT_QUERIES_FILE).write_text(json.dumps(self.zero_result_queries, indent=2))
        except Exception as e:
            print(f"[WARN] Could not save analytics: {e}")
    
    def get_popular_queries(self, limit: int = 10) -> list[dict]:
        """Get most popular search queries."""
        sorted_queries = sorted(
            self.analytics.items(),
            key=lambda x: x[1].get("count", 0),
            reverse=True
        )[:limit]
        
        return [
            {"query": q, "count": data.get("count", 0), "last_search": data.get("last_search")}
            for q, data in sorted_queries
        ]
    
    def get_zero_result_queries(self, limit: int = 10) -> list[dict]:
        """Get queries that returned no results."""
        sorted_queries = sorted(
            self.zero_result_queries.items(),
            key=lambda x: x[1].get("count", 0),
            reverse=True
        )[:limit]
        
        return [
            {"query": q, "count": data.get("count", 0), "first_seen": data.get("first_seen")}
            for q, data in sorted_queries
        ]
