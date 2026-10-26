import React, { useState, useEffect, useRef } from "react";
import { askModel } from "../../api/infer";
import { STARTERS, pickFollowUps } from "../../components/suggestions";
import "./LandingPage.css";

const IDLE_FIRST_MS = 5000; // wait before offering starters on an empty chat
const IDLE_AFTER_REPLY_MS = 8000; // wait before offering follow-ups after an answer

export default function LandingPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const chatWindowRef = useRef(null);

  async function handleSend(text) {
    if (loading) return;
    const userText = text || input;
    if (!userText.trim()) return;

    const newMessages = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setInput("");
    setShowPrompts(false);
    setLoading(true);

    let answer;
    try {
      answer = await askModel(userText);
    } catch {
      answer =
        "The flame is silent. Please check that the backend server is running.";
    }

    setTimeout(() => {
      setMessages([...newMessages, { role: "assistant", text: answer }]);
      setLoading(false);
    }, 4000);
  }

  // Offer suggestions when the user goes quiet: on an empty chat, or after an answer.
  useEffect(() => {
    if (loading) return;
    const last = messages[messages.length - 1];
    const waitingForUser = messages.length === 0 || last.role === "assistant";
    if (!waitingForUser) return;

    const delay = messages.length === 0 ? IDLE_FIRST_MS : IDLE_AFTER_REPLY_MS;
    const timer = setTimeout(() => setShowPrompts(true), delay);
    return () => clearTimeout(timer);
  }, [messages, loading]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, loading, showPrompts]);

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  const isFirst = messages.length === 0;
  const suggestions = isFirst
    ? STARTERS
    : pickFollowUps(Math.floor(messages.length / 2));
  const heading = isFirst
    ? "It seems you are thinking very hard, let me help you:"
    : "Do not be shy, little ember. Perhaps you wish to ask:";

  return (
    <main className="chat-container">
      <header className="chat-header">
        <h1>Saints of the Inferno</h1>
      </header>

      <section className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, idx) => (
          <article
            key={idx}
            className={`chat-message ${msg.role === "user" ? "user" : "assistant"}`}
          >
            {msg.role === "assistant" && (
              <header className="sender">Sacred Response</header>
            )}
            <p>{msg.text}</p>
          </article>
        ))}

        {loading && (
          <aside className="typing-indicator">
            <strong>Sacred Response</strong>
            <p aria-live="polite">
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </p>
          </aside>
        )}

        {showPrompts && !loading && (
          <aside className="prompt-box">
            <p>{heading}</p>
            <nav>
              <ul>
                {suggestions.map((s) => (
                  <li key={s}>
                    <button onClick={() => handleSend(s)}>{s}</button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
      </section>

      <footer className="chat-input-area">
        <label htmlFor="chat-input" className="visually-hidden">
          Ask the flame
        </label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (showPrompts) setShowPrompts(false);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask the flame..."
          className="chat-input"
        />
        <button onClick={() => handleSend()} className="chat-button">
          Send
        </button>
      </footer>
    </main>
  );
}
  