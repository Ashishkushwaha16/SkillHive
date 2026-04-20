"""Quick AI provider connectivity probe for SkillHive.

Usage:
    python scripts/probe_ai_providers.py

This script prints PASS/FAIL/SKIPPED per provider without exposing secrets.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Load env files in the same order as app.py.
load_dotenv(dotenv_path=Path(".env"), override=False)
load_dotenv(dotenv_path=Path("server/.env"), override=False)

SUPPORTED_PROVIDERS = ("chatgpt", "gemini")

PROVIDER_CONFIG = {
    "chatgpt": {
        "client_type": "openai",
        "api_keys": ("OPENAI_API_KEY",),
        "model_env": "OPENAI_MODEL",
        "default_model": "gpt-4o-mini",
        "base_url": None,
    },
    "gemini": {
        "client_type": "gemini",
        "api_keys": ("GEMINI_API_KEY",),
        "model_env": "GEMINI_MODEL",
        "default_model": "gemini-1.5-flash",
        "base_url": None,
    },
}


def get_provider_api_key(provider: str) -> str:
    config = PROVIDER_CONFIG[provider]
    for env_name in config["api_keys"]:
        value = os.getenv(env_name, "").strip()
        if value:
            return value
    return ""


def short_error(exc: Exception) -> str:
    message = str(exc).replace("\n", " ").strip()
    if not message:
        return exc.__class__.__name__
    return f"{exc.__class__.__name__}: {message[:180]}"


def probe_provider(provider: str) -> tuple[str, str, str]:
    api_key = get_provider_api_key(provider)
    if not api_key:
        return provider, "SKIPPED", "No API key configured"

    config = PROVIDER_CONFIG[provider]
    model = os.getenv(config["model_env"], config["default_model"])

    try:
        if config["client_type"] == "openai":
            from openai import OpenAI

            client = OpenAI(api_key=api_key, base_url=config["base_url"])
            client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": "Reply OK"}],
                max_tokens=5,
            )
            return provider, "PASS", "Live call succeeded"

        if config["client_type"] == "gemini":
            import google.generativeai as genai

            genai.configure(api_key=api_key)
            gemini_model = genai.GenerativeModel(model_name=model)
            gemini_model.generate_content("Reply OK")
            return provider, "PASS", "Live call succeeded"

        return provider, "FAIL", f"Unsupported client type: {config['client_type']}"
    except Exception as exc:  # pragma: no cover - external dependency/runtime
        return provider, "FAIL", short_error(exc)


def main() -> None:
    print("AI Provider Verification Summary")
    print("-" * 72)
    for provider in SUPPORTED_PROVIDERS:
        name, status, reason = probe_provider(provider)
        print(f"{name:<12} {status:<8} {reason}")


if __name__ == "__main__":
    main()
