"""
SkillHive AI Assistant - Flask Server for Website Integration
Exposes /chat endpoint for frontend chatbot integration with Advanced Search
"""

import os
import json
from pathlib import Path
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS
from app import (
    DEFAULT_PROVIDER,
    load_knowledge_base,
    chunk_documents,
    build_faiss_index,
    retrieve_context,
    retrieve_context_advanced,
    generate_response,
    detect_language,
    flag_for_admin,
    MESSAGES,
    KNOWLEDGE_BASE_DIR,
    SUPPORTED_PROVIDERS,
    normalize_provider,
    get_provider_display_name,
    build_llm_runtime,
    generate_ai_search_response,
    EMBED_MODEL,
    _friendly_provider_error,
    _looks_like_provider_error_text,
)
from advanced_search import AdvancedSearchEngine
from sentence_transformers import SentenceTransformer

DEFAULT_AI_SEARCH_QUICK_ISSUES = [
    {
        "id": "login",
        "label": "Login Issue",
        "prompt": "I cannot login to SkillHive. What should I check first?",
    },
    {
        "id": "messages",
        "label": "Message Issue",
        "prompt": "Messages are not appearing correctly in SkillHive. How can I fix this?",
    },
    {
        "id": "feedback",
        "label": "Feedback Flow",
        "prompt": "How do I submit product feedback and where can admin see it?",
    },
    {
        "id": "profile",
        "label": "Profile Update",
        "prompt": "My profile skills are not updating. What troubleshooting steps should I follow?",
    },
]


def _normalize_quick_issue(item: dict) -> dict | None:
    issue_id = str(item.get("id", "")).strip()
    label = str(item.get("label", "")).strip()
    prompt = str(item.get("prompt", "")).strip()
    if not issue_id or not label or not prompt:
        return None
    return {"id": issue_id, "label": label, "prompt": prompt}


def load_ai_search_quick_issues() -> list[dict]:
    file_path = Path(os.getenv("AI_SEARCH_QUICK_ISSUES_FILE", "knowledge_base/ai_search_quick_issues.json"))
    if not file_path.exists():
        return DEFAULT_AI_SEARCH_QUICK_ISSUES

    try:
        raw = json.loads(file_path.read_text(encoding="utf-8"))
        if not isinstance(raw, list):
            print(f"[WARN] {file_path} must contain a JSON array. Using default quick issues.")
            return DEFAULT_AI_SEARCH_QUICK_ISSUES

        normalized = []
        for item in raw:
            if isinstance(item, dict):
                parsed = _normalize_quick_issue(item)
                if parsed:
                    normalized.append(parsed)

        if normalized:
            print(f"[INFO] Loaded {len(normalized)} AI Search quick issues from {file_path}")
            return normalized

        print(f"[WARN] No valid quick issue entries found in {file_path}. Using defaults.")
        return DEFAULT_AI_SEARCH_QUICK_ISSUES
    except Exception as config_error:
        print(f"[WARN] Could not load quick issue config from {file_path}: {config_error}")
        return DEFAULT_AI_SEARCH_QUICK_ISSUES


AI_SEARCH_QUICK_ISSUES = load_ai_search_quick_issues()


def is_small_talk_query(text: str) -> bool:
    value = (text or "").strip().lower()
    if not value:
        return False

    greetings = {
        "hi",
        "hello",
        "hey",
        "hii",
        "heyy",
        "yo",
        "hola",
        "good morning",
        "good afternoon",
        "good evening",
    }

    if value in greetings:
        return True

    return len(value.split()) <= 2

# Initialize Flask app
app_flask = Flask(__name__)
CORS(app_flask)  # Enable CORS for frontend requests

# Load AI components
print("[INFO] Loading knowledge base...")
documents = load_knowledge_base(KNOWLEDGE_BASE_DIR)
chunks = chunk_documents(documents)

print("[INFO] Building FAISS index...")
embed_model = SentenceTransformer(EMBED_MODEL)
faiss_index, chunk_list = build_faiss_index(chunks, embed_model)

# Initialize Advanced Search Engine
print("[INFO] Initializing Advanced Search Engine...")
search_engine = AdvancedSearchEngine(chunks, embed_model)

AI_ASSISTANT_PORT = int(os.getenv("AI_ASSISTANT_PORT", "5050"))

print(f"[INFO] Default provider: {get_provider_display_name(DEFAULT_PROVIDER)}")
print(f"[INFO] Flask server ready at http://localhost:{AI_ASSISTANT_PORT}")


@app_flask.route("/chat", methods=["POST"])
def chat():
    """
    Chat endpoint for frontend.
    
    Request body:
    {
        "message": "User query here"
    }
    
    Response:
    {
        "reply": "AI Assistant response here",
        "language": "en"
    }
    """
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        query = data.get("message", "").strip()
        provider = normalize_provider(data.get("provider", DEFAULT_PROVIDER))
        if not query:
            return jsonify({"error": "Message cannot be empty"}), 400

        runtime = None
        if provider != "ai-search":
            try:
                runtime = build_llm_runtime(provider)
            except Exception as provider_error:
                return jsonify({
                    "error": str(provider_error),
                    "provider": provider,
                    "availableProviders": list(SUPPORTED_PROVIDERS),
                }), 400
        
        # Detect language
        lang = detect_language(query)
        
        # Retrieve context from knowledge base
        if provider == "ai-search":
            # Use advanced search engine for AI Search
            context, score, search_result = retrieve_context_advanced(query, search_engine, top_k=3)
        else:
            # Use standard retrieval for LLM providers
            context, score = retrieve_context(query, faiss_index, chunks, embed_model)
            search_result = None
        
        # If no relevant context found, only flag assistant queries.
        # AI Search should still return a structured no-match response.
        if not context:
            if is_small_talk_query(query):
                friendly_reply = (
                    "I can help with SkillHive topics such as login issues, profile updates, "
                    "messages, attendance, and feedback. Please ask a specific app-related question."
                )

                return jsonify({
                    "reply": friendly_reply,
                    "language": lang,
                    "flagged": False,
                    "provider": provider,
                })

            if provider == "ai-search":
                answer = generate_ai_search_response(query, "", lang, search_result)
                return jsonify({
                    "reply": answer,
                    "language": lang,
                    "flagged": False,
                    "provider": provider,
                })

            flag_for_admin(query, lang)
            return jsonify({
                "reply": MESSAGES[lang]["no_answer"],
                "language": lang,
                "flagged": True,
                "provider": provider,
            })
        
        if provider == "ai-search":
            answer = generate_ai_search_response(query, context, lang, search_result)
        else:
            # Generate response using the selected provider
            answer = generate_response(query, context, lang, runtime)

        if isinstance(answer, str) and _looks_like_provider_error_text(answer):
            answer = _friendly_provider_error(lang)
        
        return jsonify({
            "reply": answer,
            "language": lang,
            "flagged": False,
            "provider": provider,
        })
    
    except Exception as e:
        print(f"[ERROR] Chat endpoint error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app_flask.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "SkillHive AI Assistant",
        "defaultProvider": normalize_provider(DEFAULT_PROVIDER),
        "availableProviders": list(SUPPORTED_PROVIDERS),
        "aiSearchQuickIssues": AI_SEARCH_QUICK_ISSUES,
    })


@app_flask.route("/chat-config", methods=["GET"])
def chat_config():
    """Return UI-facing chat configuration so frontend can stay config-driven."""
    return jsonify(
        {
            "aiSearchQuickIssues": AI_SEARCH_QUICK_ISSUES,
            "defaultProvider": normalize_provider(DEFAULT_PROVIDER),
            "availableProviders": list(SUPPORTED_PROVIDERS),
        }
    )


@app_flask.route("/search-analytics", methods=["GET"])
def search_analytics():
    """
    Get search analytics: popular queries and their statistics.
    Endpoint for admin dashboard.
    """
    try:
        limit = request.args.get("limit", default=10, type=int)
        popular = search_engine.get_popular_queries(limit=limit)
        return jsonify({
            "popular_queries": popular,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        print(f"[ERROR] Analytics endpoint error: {e}")
        return jsonify({"error": str(e)}), 500


@app_flask.route("/zero-result-queries", methods=["GET"])
def zero_result_queries():
    """
    Get queries that returned zero results.
    Endpoint for admin dashboard to identify knowledge base gaps.
    """
    try:
        limit = request.args.get("limit", default=10, type=int)
        zero_results = search_engine.get_zero_result_queries(limit=limit)
        return jsonify({
            "zero_result_queries": zero_results,
            "count": len(zero_results),
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        print(f"[ERROR] Zero-result queries endpoint error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Run Flask development server
    # For production, use a proper WSGI server (gunicorn, etc.)
    app_flask.run(debug=False, host="0.0.0.0", port=AI_ASSISTANT_PORT)
