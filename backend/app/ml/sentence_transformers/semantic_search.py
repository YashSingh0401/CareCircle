# backend/app/ml/sentence_transformers/semantic_search.py
"""
Semantic search for doctors/hospitals using HuggingFace Inference API.
Model: sentence-transformers/all-MiniLM-L6-v2 (via HF API)
Zero local RAM - embeddings computed on HF servers.
Falls back to keyword matching locally.
"""
import os
import httpx
import numpy as np
from typing import Optional

HF_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")


async def get_embedding(text: str) -> Optional[list[float]]:
    """Get sentence embedding from HF API."""
    if not HF_API_TOKEN:
        return None
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                HF_API_URL,
                headers={"Authorization": f"Bearer {HF_API_TOKEN}"},
                json={"inputs": text}
            )
            if resp.status_code == 200:
                result = resp.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0] if isinstance(result[0], list) else result
    except Exception:
        pass
    return None


def cosine_similarity(a: list[float], b: list[float]) -> float:
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))


async def semantic_rank_doctors(query: str, doctors: list[dict]) -> list[dict]:
    """
    Rank doctors by semantic similarity to query.
    Falls back to keyword matching if HF API unavailable.
    """
    query_emb = await get_embedding(query)

    if query_emb:
        for doc in doctors:
            doc_text = f"{doc.get('specialization','')} {doc.get('name','')} {doc.get('bio','')}"
            doc_emb = await get_embedding(doc_text)
            doc["semantic_score"] = cosine_similarity(query_emb, doc_emb) if doc_emb else 0.5
        return sorted(doctors, key=lambda d: d.get("semantic_score", 0), reverse=True)

    # Keyword fallback
    query_words = set(query.lower().split())
    for doc in doctors:
        doc_text = f"{doc.get('specialization','')} {doc.get('name','')}".lower()
        overlap = sum(1 for w in query_words if w in doc_text)
        doc["semantic_score"] = overlap / max(len(query_words), 1)
    return sorted(doctors, key=lambda d: d.get("semantic_score", 0), reverse=True)


async def search_hospitals(query: str, hospitals: list[dict]) -> list[dict]:
    """Rank hospitals by semantic relevance to query."""
    query_emb = await get_embedding(query)

    if query_emb:
        for h in hospitals:
            h_text = f"{h.get('name','')} {h.get('description','')} {' '.join(h.get('facilities',[]))}"
            h_emb = await get_embedding(h_text)
            h["semantic_score"] = cosine_similarity(query_emb, h_emb) if h_emb else 0.5
        return sorted(hospitals, key=lambda h: h.get("semantic_score", 0), reverse=True)

    query_lower = query.lower()
    for h in hospitals:
        h_text = f"{h.get('name','')} {h.get('description','')}".lower()
        h["semantic_score"] = sum(1 for w in query_lower.split() if w in h_text)
    return sorted(hospitals, key=lambda h: h["semantic_score"], reverse=True)
