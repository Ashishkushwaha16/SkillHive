"""
SkillHive AI Assistant - RAG-based Multilingual Chatbot
Uses: SentenceTransformers + FAISS + ChatGPT / Gemini / Grok / Perplexity / Claude APIs
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

try:
    from anthropic import Anthropic
except ImportError:  # pragma: no cover - optional provider dependency
    Anthropic = None

# Load env files automatically when available to reduce setup friction.
if load_dotenv is not None:
    load_dotenv(dotenv_path=Path(".env"), override=False)
    load_dotenv(dotenv_path=Path("server/.env"), override=False)

# ============================================================
# CONFIGURATION — Provider-agnostic assistant settings
# ============================================================
DEFAULT_PROVIDER = os.getenv("AI_PROVIDER", "chatgpt").strip().lower()
SUPPORTED_PROVIDERS = ("chatgpt", "gemini", "grok", "perplexity", "claude")
PROVIDER_ALIASES = {
    "xai": "grok",
    "grok": "grok",
    "grok-ai": "grok",
    "openai": "chatgpt",
    "gpt": "chatgpt",
    "chatgpt": "chatgpt",
    "chatgpt-codex": "chatgpt",
    "codex": "chatgpt",
    "github-copilot": "chatgpt",
    "copilot": "chatgpt",
    "microsoft-copilot": "chatgpt",
    "ms-copilot": "chatgpt",
    "gemini": "gemini",
    "google": "gemini",
    "perplexity": "perplexity",
    "pplx": "perplexity",
    "claude": "claude",
    "anthropic": "claude",
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
    "grok": {
        "display_name": "Grok",
        "client_type": "openai",
        "api_keys": ("XAI_API_KEY", "GROK_API_KEY"),
        "model_env": "GROK_MODEL",
        "default_model": "grok-2-latest",
        "base_url": "https://api.x.ai/v1",
    },
    "perplexity": {
        "display_name": "Perplexity",
        "client_type": "openai",
        "api_keys": ("PERPLEXITY_API_KEY",),
        "model_env": "PERPLEXITY_MODEL",
        "default_model": "sonar",
        "base_url": "https://api.perplexity.ai",
    },
    "claude": {
        "display_name": "Claude",
        "client_type": "anthropic",
        "api_keys": ("CLAUDE_API_KEY", "CLAUDE_APIKEY"),
        "model_env": "CLAUDE_MODEL",
        "default_model": "claude-3-5-sonnet-20241022",
        "base_url": None,
    },
}

KNOWLEDGE_BASE_DIR = "knowledge_base"      # Folder with your .txt files
ADMIN_LOG_FILE = "admin_flagged_queries.json"
EMBED_MODEL = "all-MiniLM-L6-v2"


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
    return os.getenv(provider_config["model_env"], provider_config["default_model"])


def get_provider_api_key(provider: str) -> str:
    provider_key = normalize_provider(provider)
    provider_config = PROVIDER_CONFIG[provider_key]
    for env_name in provider_config["api_keys"]:
        value = os.getenv(env_name, "").strip()
        if value:
            return value
    return ""


@lru_cache(maxsize=None)
def build_llm_runtime(provider: str) -> dict:
    provider_key = normalize_provider(provider)
    provider_config = PROVIDER_CONFIG[provider_key]
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

    if provider_config["client_type"] == "anthropic":
        if Anthropic is None:
            raise ImportError("anthropic package is not installed. Run pip install -r requirements.txt")
        client = Anthropic(api_key=api_key)
        return {"provider": provider_key, "client": client, "model": model_name}

    raise ValueError(f"Unsupported provider: {provider_key}")

# ============================================================
# MULTILINGUAL MESSAGES
# ============================================================
MESSAGES = {
    "en": {
        "welcome": "--- SkillHive AI Assistant Ready ---\nHello! I am your SkillHive Assistant. How can I help you today?\nType 'menu' to see sections, or 'quit' to exit.",
        "no_answer": "I'm sorry, I couldn't find relevant information for your query. It has been flagged for the Admin Portal.",
        "goodbye": "Goodbye! Have a great day. Take care!",
        "menu_header": "--- SkillHive Navigation Menu ---",
    },
    "hi": {
        "welcome": "--- SkillHive AI Assistant तैयार है ---\nनमस्ते! मैं आपका SkillHive Assistant हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?\nSections देखने के लिए 'menu' टाइप करें, या बाहर निकलने के लिए 'quit'।",
        "no_answer": "मुझे खेद है, आपकी query के लिए relevant जानकारी नहीं मिली। इसे Admin Portal के लिए flag कर दिया गया है।",
        "goodbye": "अलविदा! आपका दिन शुभ हो। अपना ख्याल रखें!",
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
        if score > 0.2:  # Relevance threshold
            src = chunks[idx]["source"]
            content = chunks[idx]["content"]
            context_parts.append(f"[Source: {src}]\n{content}")

    return "\n\n---\n\n".join(context_parts), best_score


# ============================================================
# LANGUAGE DETECTION
# ============================================================
def detect_language(text: str) -> str:
    """Simple Hindi detection using Unicode range."""
    hindi_chars = sum(1 for ch in text if "\u0900" <= ch <= "\u097F")
    return "hi" if hindi_chars > 1 else "en"


# ============================================================
# STEP 7 & 8: LLM RESPONSE
# ============================================================
def generate_response(query: str, context: str, language: str, runtime: dict) -> str:
    """Send context + query to the selected LLM provider and get a response."""

    lang_instruction = (
        "Respond ONLY in Hindi (Devanagari script)." if language == "hi"
        else "Respond in clear, professional English."
    )

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

        if provider in {"chatgpt", "grok", "perplexity"}:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=600,
                temperature=0.3,
            )
            return response.choices[0].message.content.strip()

        if provider == "gemini":
            gemini_model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_prompt,
            )
            response = gemini_model.generate_content(user_prompt)
            text = getattr(response, "text", None) or ""
            return text.strip() if text else "[API Error] Gemini returned an empty response."

        if provider == "claude":
            response = client.messages.create(
                model=model_name,
                max_tokens=600,
                temperature=0.3,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_prompt},
                ],
            )
            text_blocks = [block.text for block in response.content if hasattr(block, "text")]
            text = "\n".join(text_blocks).strip()
            return text if text else "[API Error] Claude returned an empty response."

        return f"[API Error] Unsupported provider runtime: {provider}"
    except Exception as e:
        return f"[API Error] Could not get response: {e}"


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
        if user_input.lower() in ["quit", "exit", "bye", "बाय", "अलविदा"]:
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

        # Check relevance threshold
        if not context or score < 0.2:
            flag_for_admin(user_input, current_lang)
            print(f"Chatbot: {MESSAGES[current_lang]['no_answer']}\n")
            continue

        # Generate LLM response
        answer = generate_response(query, context, current_lang, runtime)
        print(f"Chatbot: {answer}\n")


if __name__ == "__main__":
    main()
