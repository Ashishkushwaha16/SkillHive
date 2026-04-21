import React, { useEffect, useMemo, useRef, useState } from "react";

const assistantBaseUrl = process.env.REACT_APP_AI_ASSISTANT_URL || "http://localhost:5050";

const assistantProviderOptions = [
  { id: "chatgpt", label: "ChatGPT", subtitle: "OpenAI" },
  { id: "gemini", label: "Gemini", subtitle: "Google" },
];

const fallbackSearchQuickIssues = [
  { id: "login", label: "Login Issue", prompt: "I cannot login to SkillHive. What should I check first?" },
  { id: "messages", label: "Message Issue", prompt: "Messages are not appearing correctly in SkillHive. How can I fix this?" },
  { id: "feedback", label: "Feedback Flow", prompt: "How do I submit product feedback and where can admin see it?" },
  { id: "profile", label: "Profile Update", prompt: "My profile skills are not updating. What troubleshooting steps should I follow?" },
];

const getInitialMessage = (mode = "assistant") => ({
  id: 1,
  type: "bot",
  text:
    mode === "search"
      ? "AI Search Engine is active. Ask direct app troubleshooting questions or use the quick issue buttons below."
      : "AI Assistant is active. Choose a provider for conversational support and deeper guidance.",
  timestamp: new Date(),
});

const getProviderLabel = (providerId) => {
  if (providerId === "ai-search") {
    return "AI Search Engine (SkillHive KB)";
  }
  const selectedProvider = assistantProviderOptions.find((option) => option.id === providerId);
  return selectedProvider ? `${selectedProvider.label} (${selectedProvider.subtitle})` : "Assistant";
};

const ChatBot = () => {
  const [sectionMessages, setSectionMessages] = useState({
    assistant: [getInitialMessage("assistant")],
    search: [getInitialMessage("search")],
  });
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("assistant");
  const [assistantProvider, setAssistantProvider] = useState("chatgpt");
  const [searchQuickIssues, setSearchQuickIssues] = useState(fallbackSearchQuickIssues);
  const messagesEndRef = useRef(null);

  const activeProvider = mode === "search" ? "ai-search" : assistantProvider;
  const currentMessages = mode === "search" ? sectionMessages.search : sectionMessages.assistant;

  const providerLabel = useMemo(() => getProviderLabel(activeProvider), [activeProvider]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  useEffect(() => {
    let isMounted = true;

    const loadChatConfig = async () => {
      try {
        const response = await fetch(`${assistantBaseUrl}/chat-config`);
        if (!response.ok) return;
        const data = await response.json();
        if (!isMounted) return;

        if (Array.isArray(data.aiSearchQuickIssues) && data.aiSearchQuickIssues.length > 0) {
          const normalized = data.aiSearchQuickIssues
            .filter((item) => item && item.id && item.label && item.prompt)
            .map((item) => ({ id: item.id, label: item.label, prompt: item.prompt }));

          if (normalized.length > 0) {
            setSearchQuickIssues(normalized);
          }
        }
      } catch {
        // Keep fallback issues when config endpoint is unavailable.
      }
    };

    loadChatConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const appendMessageToActiveSection = (message) => {
    setSectionMessages((prev) => ({
      ...prev,
      [mode]: [...prev[mode], message],
    }));
  };

  const sendMessage = async (overrideMessage) => {
    const trimmedMessage = (overrideMessage ?? inputValue).trim();
    if (!trimmedMessage) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: trimmedMessage,
      timestamp: new Date(),
    };

    appendMessageToActiveSection(userMessage);
    setInputValue("");
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${assistantBaseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          provider: activeProvider,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Assistant server returned ${response.status}`);
      }

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: data.reply,
        timestamp: new Date(),
        flagged: Boolean(data.flagged),
        provider: data.provider || activeProvider,
      };

      appendMessageToActiveSection(botMessage);
    } catch (err) {
      console.error("Chatbot error:", err);

      const providerText = providerLabel;
      setError(
        mode === "search"
          ? `${providerText} is not responding. Make sure the AI assistant server is running at ${assistantBaseUrl}.`
          : `${providerText} is not responding. Make sure the AI assistant server is running at ${assistantBaseUrl} and the selected provider API key is configured in your environment variables.`
      );

      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        text:
          "Unable to connect. Please try again later. Check that the Python server is running and the selected provider key is configured.",
        timestamp: new Date(),
        isError: true,
      };

      appendMessageToActiveSection(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setSectionMessages((prev) => ({
      ...prev,
      [mode]: [getInitialMessage(mode)],
    }));
    setError("");
  };

  return (
    <section className="mt-6 flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">🤖 Support AI ChatBot</h3>
          <p className="text-xs text-slate-500">
            Use two sections: AI Assistant (ChatGPT or Gemini) and AI Search Engine (local app support).
          </p>
        </div>
        <button
          onClick={clearChat}
          className="text-xs font-semibold text-slate-600 underline hover:text-slate-900"
        >
          Clear Current Section
        </button>
      </div>

      <div className="border-b border-slate-200 px-6 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sections</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("assistant")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              mode === "assistant"
                ? "border-blue-600 bg-blue-50 text-blue-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            AI Assistant
          </button>
          <button
            type="button"
            onClick={() => setMode("search")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              mode === "search"
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            AI Search Engine
          </button>
        </div>

        {mode === "assistant" && (
          <>
            <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Provider</p>
            <div className="flex flex-wrap gap-2">
              {assistantProviderOptions.map((option) => {
                const isSelected = assistantProvider === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setAssistantProvider(option.id)}
                    className={`rounded-full border px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="block text-[11px] uppercase tracking-[0.14em] opacity-70">
                      {option.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {mode === "search" && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            AI Search Engine uses only SkillHive knowledge base content to solve app-related issues. No external provider key is required.
          </div>
        )}

        <p className="mt-3 text-xs text-slate-500">
          Selected: <span className="font-semibold text-slate-700">{providerLabel}</span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6" style={{ minHeight: "400px", maxHeight: "500px" }}>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-2.5 text-sm leading-6 ${
                  msg.type === "user"
                    ? "bg-blue-600 text-white"
                    : msg.isError
                      ? "border border-red-300 bg-red-100 text-red-900"
                      : msg.flagged
                        ? "border border-amber-300 bg-amber-100 text-amber-900"
                        : "bg-slate-100 text-slate-900"
                }`}
              >
                {msg.text}
                {msg.flagged && (
                  <p className="mt-2 text-xs font-semibold text-amber-800">
                    ⚠️ Flagged for Admin Review
                  </p>
                )}
                <p className="mt-1.5 text-xs opacity-70">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm text-slate-600">
                <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-slate-400"></span>
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-slate-200 px-6 py-4">
        {mode === "search" && (
          <div className="mb-3 flex flex-wrap gap-2">
            {searchQuickIssues.map((issue) => (
              <button
                key={issue.id}
                type="button"
                onClick={() => sendMessage(issue.prompt)}
                disabled={isLoading}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {issue.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              mode === "search"
                ? "Describe your app issue (login, profile, feedback, messages, etc.)..."
                : "Ask about attendance, guidelines, tasks, or any SkillHive topic..."
            }
            className="flex-1 resize-none rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            rows="2"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          💡 Tip: Each section keeps its own chat history. Switch sections anytime without losing previous messages.
        </p>
      </div>
    </section>
  );
};

export default ChatBot;
