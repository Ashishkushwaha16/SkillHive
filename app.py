"""
SkillHive AI Assistant - RAG-based Chatbot
Uses: SentenceTransformers + FAISS + ChatGPT / Gemini APIs
"""

import os
import sys
import json
from functools import lru_cache
from pathlib import Path
from datetime import datetime

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - optional local env dependency
    load_dotenv = None

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover - optional provider dependency
    OpenAI = None

try:
    import google.generativeai as genai
except ImportError:  # pragma: no cover - optional provider dependency
    genai = None

# Load env files automatically when available to reduce setup friction.
if load_dotenv is not None:
    load_dotenv(dotenv_path=Path(".env"), override=False)
    load_dotenv(dotenv_path=Path("server/.env"), override=False)

# ============================================================
# CONFIGURATION — Provider-agnostic assistant settings
# ============================================================
DEFAULT_PROVIDER = os.getenv("AI_PROVIDER", "chatgpt").strip().lower()
SUPPORTED_PROVIDERS = ("chatgpt", "gemini", "ai-search")
PROVIDER_ALIASES = {
    "openai": "chatgpt",
    "gpt": "chatgpt",
    "chatgpt": "chatgpt",
    "gemini": "gemini",
    "google": "gemini",
    "ai-search": "ai-search",
    "aisearch": "ai-search",
    "search": "ai-search",
    "local-search": "ai-search",
}

PROVIDER_CONFIG = {
    "chatgpt": {
        "display_name": "ChatGPT",
        "client_type": "openai",
        "api_keys": ("OPENAI_API_KEY",),
        "model_env": "OPENAI_MODEL",
        "default_model": "gpt-4o-mini",
        "base_url": None,
    },
    "gemini": {
        "display_name": "Gemini",
        "client_type": "gemini",
        "api_keys": ("GEMINI_API_KEY",),
        "model_env": "GEMINI_MODEL",
        "default_model": "gemini-1.5-flash",
        "base_url": None,
    },
    "ai-search": {
        "display_name": "AI Search Engine",
        "client_type": "local-search",
        "api_keys": (),
        "model_env": None,
        "default_model": "knowledge-base-search-v1",
        "base_url": None,
    },
}

KNOWLEDGE_BASE_DIR = "knowledge_base"      # Folder with your .txt files
ADMIN_LOG_FILE = "admin_flagged_queries.json"
EMBED_MODEL = "all-MiniLM-L6-v2"
RETRIEVAL_SCORE_THRESHOLD = float(os.getenv("AI_RETRIEVAL_SCORE_THRESHOLD", "0.2"))
RETRIEVAL_MIN_FALLBACK_SCORE = float(os.getenv("AI_RETRIEVAL_MIN_FALLBACK_SCORE", "0.08"))


def normalize_provider(provider: str | None) -> str:
    if not provider:
        return DEFAULT_PROVIDER if DEFAULT_PROVIDER in SUPPORTED_PROVIDERS else "chatgpt"
    normalized = PROVIDER_ALIASES.get(provider.strip().lower(), provider.strip().lower())
    if normalized not in SUPPORTED_PROVIDERS:
        return DEFAULT_PROVIDER if DEFAULT_PROVIDER in SUPPORTED_PROVIDERS else "chatgpt"
    return normalized


def get_provider_display_name(provider: str) -> str:
    return PROVIDER_CONFIG[normalize_provider(provider)]["display_name"]


def get_provider_model(provider: str) -> str:
    provider_key = normalize_provider(provider)
    provider_config = PROVIDER_CONFIG[provider_key]
    model_env = provider_config.get("model_env")
    if not model_env:
        return provider_config["default_model"]
    return os.getenv(model_env, provider_config["default_model"])


def _is_placeholder_secret(value: str) -> bool:
    lower = value.lower()
    return (
        lower.startswith("your_")
        or "replace_with" in lower
        or lower in {"changeme", "api_key_here", "your_api_key", "your_key"}
    )


def get_provider_api_key(provider: str) -> str:
    provider_key = normalize_provider(provider)
    provider_config = PROVIDER_CONFIG[provider_key]
    for env_name in provider_config["api_keys"]:
        value = os.getenv(env_name, "").strip()
        if value and not _is_placeholder_secret(value):
            return value
    return ""


@lru_cache(maxsize=None)
def build_llm_runtime(provider: str) -> dict:
    provider_key = normalize_provider(provider)
    provider_config = PROVIDER_CONFIG[provider_key]

    if provider_config["client_type"] == "local-search":
        return {"provider": provider_key, "client": None, "model": provider_config["default_model"]}

    api_key = get_provider_api_key(provider_key)
    if not api_key:
        raise ValueError(
            f"Missing API key for {provider_config['display_name']}. Set one of: {', '.join(provider_config['api_keys'])}."
        )

    model_name = get_provider_model(provider_key)

    if provider_config["client_type"] == "openai":
        if OpenAI is None:
            raise ImportError("openai package is not installed. Run pip install -r requirements.txt")
        client = OpenAI(api_key=api_key, base_url=provider_config["base_url"])
        return {"provider": provider_key, "client": client, "model": model_name}

    if provider_config["client_type"] == "gemini":
        if genai is None:
            raise ImportError("google-generativeai package is not installed. Run pip install -r requirements.txt")
        genai.configure(api_key=api_key)
        client = genai.GenerativeModel(model_name=model_name)
        return {"provider": provider_key, "client": client, "model": model_name}

    raise ValueError(f"Unsupported provider: {provider_key}")

# ============================================================
# USER-FACING MESSAGES
# ============================================================
MESSAGES = {
    "en": {
        "welcome": "--- SkillHive AI Assistant Ready ---\nHello! I am your SkillHive Assistant. How can I help you today?\nType 'menu' to see sections, or 'quit' to exit.",
        "no_answer": "I'm sorry, I couldn't find relevant information for your query. It has been flagged for the Admin Portal.",
        "goodbye": "Goodbye! Have a great day. Take care!",
        "menu_header": "--- SkillHive Navigation Menu ---",
    },
    "hi": {
        "welcome": "--- SkillHive AI Assistant Ready ---\nHello! I am your SkillHive Assistant. How can I help you today?\nType 'menu' to see sections, or 'quit' to exit.",
        "no_answer": "I'm sorry, I couldn't find relevant information for your query. It has been flagged for the Admin Portal.",
        "goodbye": "Goodbye! Have a great day. Take care!",
        "menu_header": "--- SkillHive Navigation Menu ---",
    }
}

MENU = """
• Home           : Project Overview
• Attendance     : Leave & Working Hours
• Guidelines     : Conduct & Platform Usage
• Performance    : Evaluation & Learning
• Tasks          : Validation & Meetings
• DSA Practice   : Coding Problems
• Courses        : Skill Enhancement
• Help/Support   : Contact HR/Mentor
Type any menu item name to get details, or ask any question directly.
"""

# ============================================================
# STEP 1 & 2: LOAD & EXTRACT TEXT FROM KNOWLEDGE BASE
# ============================================================
def load_knowledge_base(kb_dir: str) -> list[dict]:
    """Load all .txt files from the knowledge base directory."""
    documents = []
    kb_path = Path(kb_dir)

    if not kb_path.exists():
        print(f"[ERROR] Knowledge base folder '{kb_dir}' not found.")
        print("Please create the folder and add real knowledge .txt files before starting the assistant.")
        sys.exit(1)

    for file in kb_path.glob("*.txt"):
        text = file.read_text(encoding="utf-8", errors="ignore").strip()
        if text:
            documents.append({"source": file.stem, "content": text})
            print(f"  [Loaded] {file.name}")

    if not documents:
        print("[ERROR] No .txt files found in knowledge_base/. Please add your files.")
        sys.exit(1)

    return documents


def chunk_documents(documents: list[dict], chunk_size: int = 500, overlap: int = 50) -> list[dict]:
    """Split documents into overlapping chunks for better retrieval."""
    chunks = []
    for doc in documents:
        words = doc["content"].split()
        start = 0
        while start < len(words):
            end = min(start + chunk_size, len(words))
            chunk_text = " ".join(words[start:end])
            chunks.append({"source": doc["source"], "content": chunk_text})
            start += chunk_size - overlap
    return chunks


# ============================================================
# STEP 3 & 4: EMBEDDINGS + FAISS INDEX
# ============================================================
def build_faiss_index(chunks: list[dict], model: SentenceTransformer):
    """Generate embeddings and build a FAISS index."""
    texts = [c["content"] for c in chunks]
    print(f"\n[Embedding] Generating embeddings for {len(texts)} chunks...")
    embeddings = model.encode(texts, show_progress_bar=True, convert_to_numpy=True)
    embeddings = embeddings.astype("float32")
    faiss.normalize_L2(embeddings)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)   # Inner product = cosine similarity after L2-norm
    index.add(embeddings)
    print(f"[FAISS] Index built with {index.ntotal} vectors (dim={dim})")
    return index, embeddings


# ============================================================
# STEP 5 & 6: RETRIEVE RELEVANT CONTEXT
# ============================================================
def retrieve_context(query: str, index, chunks: list[dict], model: SentenceTransformer, top_k: int = 3) -> tuple[str, float]:
    """Embed query and retrieve top-k relevant chunks."""
    q_vec = model.encode([query], convert_to_numpy=True).astype("float32")
    faiss.normalize_L2(q_vec)
    scores, indices = index.search(q_vec, top_k)

    best_score = float(scores[0][0])
    context_parts = []
    for idx, score in zip(indices[0], scores[0]):
        if score >= RETRIEVAL_SCORE_THRESHOLD:
            src = chunks[idx]["source"]
            content = chunks[idx]["content"]
            context_parts.append(f"[Source: {src}]\n{content}")

    # If nothing crossed threshold but the top match is still somewhat related,
    # use it as a soft fallback instead of immediately flagging as unresolved.
    if not context_parts and len(indices[0]) > 0 and best_score >= RETRIEVAL_MIN_FALLBACK_SCORE:
        top_idx = int(indices[0][0])
        src = chunks[top_idx]["source"]
        content = chunks[top_idx]["content"]
        context_parts.append(f"[Source: {src}]\n{content}")

    return "\n\n---\n\n".join(context_parts), best_score


def generate_ai_search_response(query: str, context: str, language: str) -> str:
    """Build a retrieval-only answer that does not require external provider APIs."""
    sections = [part.strip() for part in context.split("\n\n---\n\n") if part.strip()]
    sources: list[str] = []
    points: list[str] = []

    for section in sections[:3]:
        lines = [line.strip() for line in section.splitlines() if line.strip()]
        source = ""
        if lines and lines[0].startswith("[Source:"):
            source = lines[0].replace("[Source:", "").replace("]", "").strip()
            lines = lines[1:]
        text = " ".join(lines).strip()
        if text:
            points.append(text[:260].rstrip())
        if source and source not in sources:
            sources.append(source)

    bullets = "\n".join([f"- {point}" for point in points]) if points else "- No matching content was found in the current knowledge base."
    source_text = ", ".join(sources) if sources else "knowledge base"
    return (
        "AI Search Engine Result:\n"
        f"Your query: '{query}'\n\n"
        "The following information was retrieved directly from the SkillHive knowledge base:\n"
        f"{bullets}\n\n"
        f"Sources: {source_text}\n"
        "If this does not fully solve your issue, please contact Help/Support for manual assistance."
    )


def _should_fallback_to_gemini(error: Exception) -> bool:
    message = str(error).lower()
    return any(
        token in message
        for token in (
            "insufficient_quota",
            "quota",
            "429",
            "authentication",
            "unauthorized",
            "401",
            "403",
        )
    )


def _is_gemini_model_not_found(error: Exception) -> bool:
    message = str(error).lower()
    return (
        "not found" in message
        and "model" in message
        and ("api version" in message or "models/" in message)
    )


def _friendly_provider_error(language: str) -> str:
    return (
        "The AI provider is temporarily unavailable right now. "
        "Please try again shortly, or use the AI Search Engine section for app-related help."
    )


def _looks_like_provider_error_text(text: str) -> bool:
    normalized = (text or "").strip().lower()
    if not normalized:
        return False

    return any(
        token in normalized
        for token in (
            "[api error]",
            "could not get response",
            "insufficient_quota",
            "quota exceeded",
            "generativelanguage.googleapis.com",
            "retry_delay",
            "violations {",
        )
    )


def _generate_gemini_response(query: str, context: str, language: str, model_name: str | None = None) -> str:
    if genai is None:
        raise ImportError("google-generativeai package is not installed. Run pip install -r requirements.txt")

    gemini_key = get_provider_api_key("gemini")
    if not gemini_key:
        raise ValueError("Missing API key for Gemini. Set GEMINI_API_KEY.")
    genai.configure(api_key=gemini_key)

    lang_instruction = "Respond in clear, professional English."

    system_prompt = f"""You are SkillHive AI Assistant for an internship platform.
You ONLY answer questions using the provided knowledge base context.
{lang_instruction}
If the context does not contain relevant information, say you don't know — do NOT make up answers.
Keep responses concise and helpful."""

    user_prompt = f"""Context from Knowledge Base:
{context}

User Question: {query}

Answer based strictly on the context above."""

    candidate_models = []
    for candidate in (
        model_name,
        get_provider_model("gemini"),
        "gemini-1.5-flash-latest",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-pro-latest",
    ):
        if candidate and candidate not in candidate_models:
            candidate_models.append(candidate)

    try:
        discovered_models = []
        for model in genai.list_models():
            model_name_value = getattr(model, "name", "")
            supported_methods = getattr(model, "supported_generation_methods", []) or []
            if (
                model_name_value
                and "generateContent" in supported_methods
                and "gemini" in model_name_value.lower()
            ):
                normalized = model_name_value.replace("models/", "")
                discovered_models.append(normalized)
        for discovered in discovered_models:
            if discovered not in candidate_models:
                candidate_models.append(discovered)
    except Exception:
        # If model discovery fails, continue with static fallback candidates.
        pass

    last_error: Exception | None = None
    for candidate_model in candidate_models:
        try:
            gemini_model = genai.GenerativeModel(
                model_name=candidate_model,
                system_instruction=system_prompt,
            )
            response = gemini_model.generate_content(user_prompt)
            text = getattr(response, "text", None) or ""
            return text.strip() if text else "[API Error] Gemini returned an empty response."
        except Exception as gemini_error:
            last_error = gemini_error
            if _is_gemini_model_not_found(gemini_error):
                continue
            raise

    raise RuntimeError(f"No compatible Gemini model available. Last error: {last_error}")


# ============================================================
# LANGUAGE DETECTION
# ============================================================
def detect_language(text: str) -> str:
    """Project-wide language mode is English-only."""
    return "en"


# ============================================================
# STEP 7 & 8: LLM RESPONSE
# ============================================================
def generate_response(query: str, context: str, language: str, runtime: dict) -> str:
    """Send context + query to the selected LLM provider and get a response."""

    lang_instruction = "Respond in clear, professional English."

    system_prompt = f"""You are SkillHive AI Assistant for an internship platform.
You ONLY answer questions using the provided knowledge base context.
{lang_instruction}
If the context does not contain relevant information, say you don't know — do NOT make up answers.
Keep responses concise and helpful."""

    user_prompt = f"""Context from Knowledge Base:
{context}

User Question: {query}

Answer based strictly on the context above."""

    try:
        provider = runtime["provider"]
        client = runtime["client"]
        model_name = runtime["model"]

        if provider == "chatgpt":
            try:
                response = client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    max_tokens=600,
                    temperature=0.3,
                )
                answer = response.choices[0].message.content.strip()
                if _looks_like_provider_error_text(answer):
                    return _friendly_provider_error(language)
                return answer
            except Exception as chatgpt_error:
                if _should_fallback_to_gemini(chatgpt_error):
                    print(f"[WARN] ChatGPT unavailable, falling back to Gemini: {chatgpt_error}")
                    try:
                        answer = _generate_gemini_response(query, context, language)
                        if _looks_like_provider_error_text(answer):
                            return _friendly_provider_error(language)
                        return answer
                    except Exception as gemini_fallback_error:
                        print(f"[WARN] Gemini fallback failed: {gemini_fallback_error}")
                        return _friendly_provider_error(language)
                print(f"[WARN] ChatGPT request failed: {chatgpt_error}")
                return _friendly_provider_error(language)

        if provider == "gemini":
            try:
                answer = _generate_gemini_response(query, context, language, model_name=model_name)
                if _looks_like_provider_error_text(answer):
                    return _friendly_provider_error(language)
                return answer
            except Exception as gemini_error:
                print(f"[WARN] Gemini request failed: {gemini_error}")
                return _friendly_provider_error(language)

        print(f"[WARN] Unsupported provider runtime: {provider}")
        return _friendly_provider_error(language)
    except Exception as e:
        print(f"[WARN] Could not get provider response: {e}")
        return _friendly_provider_error(language)


# ============================================================
# FALLBACK: ADMIN PORTAL LOGGING
# ============================================================
def flag_for_admin(query: str, language: str):
    """Log unanswered queries to admin log file."""
    log = []
    if Path(ADMIN_LOG_FILE).exists():
        with open(ADMIN_LOG_FILE, "r") as f:
            log = json.load(f)

    log.append({
        "timestamp": datetime.now().isoformat(),
        "language": language,
        "query": query,
        "status": "unanswered"
    })

    with open(ADMIN_LOG_FILE, "w") as f:
        json.dump(log, f, indent=2, ensure_ascii=False)


# ============================================================
# MENU HANDLER
# ============================================================
MENU_KEYWORDS = {
    "home": "home project overview",
    "attendance": "attendance leave working hours",
    "guidelines": "guidelines conduct platform usage",
    "performance": "evaluation learning performance",
    "tasks": "task validation meetings feedback",
    "dsa": "dsa practice coding problems",
    "courses": "courses skill enhancement learning",
    "help": "help support contact hr mentor",
}

def handle_menu_query(user_input: str) -> str | None:
    """Check if user typed a menu keyword and return a search query."""
    lower = user_input.lower().strip()
    if lower == "menu":
        return "__MENU__"
    for key, search_q in MENU_KEYWORDS.items():
        if lower == key:
            return search_q
    return None


# ============================================================
# MAIN CHATBOT LOOP
# ============================================================
def main():
    print("\n[SkillHive] Initializing AI Assistant...")

    provider = normalize_provider(DEFAULT_PROVIDER)
    print(f"[AI] Selected provider: {get_provider_display_name(provider)}")

    # Load components
    print("[1/3] Loading embedding model...")
    embed_model = SentenceTransformer(EMBED_MODEL)

    print("[2/3] Loading knowledge base...")
    documents = load_knowledge_base(KNOWLEDGE_BASE_DIR)
    chunks = chunk_documents(documents)

    print("[3/3] Building FAISS index...")
    faiss_index, _ = build_faiss_index(chunks, embed_model)

    # Initialize provider runtime
    try:
        runtime = build_llm_runtime(provider)
    except Exception as exc:
        print(f"[ERROR] {exc}")
        sys.exit(1)

    # Determine startup language (default English)
    current_lang = "en"
    print(f"\n{MESSAGES[current_lang]['welcome']}\n")

    # ---- Chat Loop ----
    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print(f"\n{MESSAGES[current_lang]['goodbye']}")
            break

        if not user_input:
            continue

        # Detect language for this message
        current_lang = detect_language(user_input)

        # Quit commands
        if user_input.lower() in ["quit", "exit", "bye"]:
            print(f"Chatbot: {MESSAGES[current_lang]['goodbye']}")
            break

        # Menu handling
        menu_result = handle_menu_query(user_input)
        if menu_result == "__MENU__":
            print(f"Chatbot: {MESSAGES[current_lang]['menu_header']}{MENU}")
            continue
        elif menu_result:
            query = menu_result
        else:
            query = user_input

        # Retrieve context
        context, score = retrieve_context(query, faiss_index, chunks, embed_model)

        # Flag only when no useful context is found at all.
        if not context:
            flag_for_admin(user_input, current_lang)
            print(f"Chatbot: {MESSAGES[current_lang]['no_answer']}\n")
            continue

        # Generate LLM response
        answer = generate_response(query, context, current_lang, runtime)
        print(f"Chatbot: {answer}\n")


if __name__ == "__main__":
    main()
