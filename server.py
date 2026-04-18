"""
SkillHive AI Assistant - Flask Server for Website Integration
Exposes /chat endpoint for frontend chatbot integration
"""

import os

from flask import Flask, request, jsonify
from flask_cors import CORS
from app import (
    DEFAULT_PROVIDER,
    load_knowledge_base,
    chunk_documents,
    build_faiss_index,
    retrieve_context,
    generate_response,
    detect_language,
    flag_for_admin,
    MESSAGES,
    KNOWLEDGE_BASE_DIR,
    SUPPORTED_PROVIDERS,
    normalize_provider,
    get_provider_display_name,
    build_llm_runtime,
    EMBED_MODEL,
)
from sentence_transformers import SentenceTransformer

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
        "language": "en" or "hi"
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
        context, score = retrieve_context(query, faiss_index, chunks, embed_model)
        
        # If no relevant context found, flag for admin
        if not context or score < 0.2:
            flag_for_admin(query, lang)
            return jsonify({
                "reply": MESSAGES[lang]["no_answer"],
                "language": lang,
                "flagged": True,
                "provider": provider,
            })
        
        # Generate response using the selected provider
        answer = generate_response(query, context, lang, runtime)
        
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
    })


if __name__ == "__main__":
    # Run Flask development server
    # For production, use a proper WSGI server (gunicorn, etc.)
    app_flask.run(debug=False, host="0.0.0.0", port=AI_ASSISTANT_PORT)
