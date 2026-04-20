import React, { useEffect, useMemo, useRef, useState } from "react";

const assistantBaseUrl = process.env.REACT_APP_AI_ASSISTANT_URL || "http://localhost:5050";

const providerOptions = [
  { id: "chatgpt", label: "ChatGPT", subtitle: "OpenAI" },
  { id: "chatgpt-codex", label: "ChatGPT Codex", subtitle: "OpenAI" },
  { id: "github-copilot", label: "GitHub Copilot", subtitle: "Microsoft" },
  { id: "microsoft-copilot", label: "Microsoft Copilot", subtitle: "Microsoft" },
  { id: "gemini", label: "Gemini", subtitle: "Google" },
  { id: "grok", label: "Grok", subtitle: "xAI" },
  { id: "perplexity", label: "Perplexity", subtitle: "PPLX" },
  { id: "claude", label: "Claude", subtitle: "Anthropic" },
];

const getInitialMessage = () => ({
  id: 1,
  type: "bot",
  text:
    "नमस्ते! 👋 मैं SkillHive Assistant हूँ। आप ChatGPT, ChatGPT Codex, GitHub Copilot, Microsoft Copilot, Gemini, Grok, Perplexity, या Claude में से किसी provider के साथ Attendance, Guidelines, Performance, Tasks, DSA, Courses, या Help के बारे में पूछ सकते हैं.\n\nHello! 👋 I am your SkillHive Assistant. You can ask about Attendance, Guidelines, Performance, Tasks, DSA, Courses, or Help with ChatGPT, ChatGPT Codex, GitHub Copilot, Microsoft Copilot, Gemini, Grok, Perplexity, or Claude.",
  timestamp: new Date(),
});

const getProviderLabel = (providerId) => {
  const selectedProvider = providerOptions.find((option) => option.id === providerId);
  return selectedProvider ? `${selectedProvider.label} (${selectedProvider.subtitle})` : "Assistant";
};

const ChatBot = () => {
  const [messages, setMessages] = useState([getInitialMessage()]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState("chatgpt");
  const messagesEndRef = useRef(null);

  const providerLabel = useMemo(() => getProviderLabel(provider), [provider]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: trimmedMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
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
          provider,
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
        provider: data.provider || provider,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chatbot error:", err);

      const providerText = providerLabel;
      setError(
        `${providerText} is not responding. Make sure the AI assistant server is running at ${assistantBaseUrl} and the selected provider API key is configured in your environment variables.`
      );

      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        text:
          "मुझसे कनेक्ट नहीं हो सके। कृपया बाद में कोशिश करें।\n\nUnable to connect. Please try again later. Check that the Python server is running and the selected provider key is configured.",
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
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
    setMessages([getInitialMessage()]);
    setError("");
  };

  return (
    <section className="mt-6 flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">🤖 AI Assistant</h3>
          <p className="text-xs text-slate-500">
            Choose ChatGPT, Codex, Copilot, Gemini, Grok, Perplexity, or Claude. The assistant responds in English or Hindi.
          </p>
        </div>
        <button
          onClick={clearChat}
          className="text-xs font-semibold text-slate-600 underline hover:text-slate-900"
        >
          Clear Chat
        </button>
      </div>

      <div className="border-b border-slate-200 px-6 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Provider
        </p>
        <div className="flex flex-wrap gap-2">
          {providerOptions.map((option) => {
            const isSelected = provider === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setProvider(option.id)}
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
          {messages.map((msg) => (
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
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about attendance, guidelines, tasks, or any SkillHive topic..."
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
          💡 Tip: Type 'menu' to see available topics or ask any question directly.
        </p>
      </div>
    </section>
  );
};

export default ChatBot;
