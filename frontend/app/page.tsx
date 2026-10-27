"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const starterQuestions = [
  "What does John do?",
  "What skills is he building?",
  "Tell me about his projects",
];

const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL ?? "http://localhost:8000";
const portfolioUrl = process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "http://localhost:5500/";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function sendMessage(suggestedText?: string) {
    const content = (suggestedText ?? draft).trim();
    if (!content || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content }].slice(-20);
    setMessages(nextMessages);
    setDraft("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data: { reply?: string; detail?: string } = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "The assistant could not reply. Please try again.");
      if (!data.reply) throw new Error("The assistant returned an empty reply. Please try again.");
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="John Njuguna home">JN<span>.</span></a>
        <a className="back-link" href={portfolioUrl}>← Back to portfolio</a>
      </header>

      <section className="chat-layout" id="top" aria-label="Portfolio AI assistant">
        <div className="intro-panel">
          <p className="eyebrow"><span className="status-dot" /> PORTFOLIO ASSISTANT</p>
          <h1>Curious about my work?</h1>
          <p className="intro-copy">Ask my AI assistant about my IT experience, skills, and projects. It answers using information from my portfolio.</p>
          <div className="intro-note"><span className="sparkle">✳</span><span>Built with Next.js, TypeScript, Python, and AI.</span></div>
          <a className="portfolio-link" href={portfolioUrl}>Explore the full portfolio <span>↗</span></a>
        </div>

        <section className="chat-card" aria-label="Chat">
          <div className="chat-header">
            <div className="avatar">JN</div>
            <div className="chat-title"><strong>John’s AI assistant</strong><span><i /> Online and ready</span></div>
            <button className="reset-button" type="button" onClick={() => { setMessages([]); setError(""); }} aria-label="Clear conversation" title="Clear conversation">↻</button>
          </div>

          <div className="message-list" aria-live="polite" aria-relevant="additions text">
            <div className="welcome-block">
              <span className="welcome-icon">✳</span>
              <h2>Hello, I’m John’s portfolio assistant.</h2>
              <p>Ask me about John’s skills, background, or projects.</p>
            </div>
            {messages.map((message, index) => (
              <div className={`message-row ${message.role}`} key={`${message.role}-${index}`}>
                {message.role === "assistant" && <div className="mini-avatar">JN</div>}
                <p className="message-bubble">{message.content}</p>
              </div>
            ))}
            {loading && <div className="message-row assistant"><div className="mini-avatar">JN</div><p className="message-bubble typing"><span /><span /><span /></p></div>}
            {error && <p className="error-message" role="alert">{error}</p>}
            <div ref={bottomRef} />
          </div>

          {messages.length === 0 && (
            <div className="suggestions" aria-label="Suggested questions">
              {starterQuestions.map((question) => (
                <button key={question} type="button" onClick={() => { void sendMessage(question); }}>
                  {question}<span>↗</span>
                </button>
              ))}
            </div>
          )}

          <form className="composer" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="message">Write your question</label>
            <input id="message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask me anything about John’s portfolio..." maxLength={4000} disabled={loading} />
            <button className="send-button" type="submit" disabled={!draft.trim() || loading} aria-label="Send message">↑</button>
          </form>
          <p className="disclaimer">AI responses can be inaccurate. Check the portfolio for confirmed details.</p>
        </section>
      </section>

      <footer className="footer"><span>JOHN NJUGUNA <b>·</b> IT PORTFOLIO</span><span>BUILT WITH CURIOSITY <b>✳</b></span></footer>
    </main>
  );
}
