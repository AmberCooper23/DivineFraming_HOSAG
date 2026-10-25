import React, { useState, useEffect, useRef } from "react";
import { askModel } from "../../api/infer";
import "./LandingPage.css";

export default function LandingPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const chatWindowRef = useRef(null);

  async function handleSend(text) {
    const userText = text || input;
    if (!userText.trim()) return;

    const newMessages = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const answer = await askModel(userText);

    setTimeout(() => {
      setMessages([...newMessages, { role: "assistant", text: answer }]);
      setLoading(false);
      setShowPrompts(false);
    }, 4000);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length === 0 && !loading) {
        setShowPrompts(true);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [messages, loading]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, loading]);

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

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

        {showPrompts && (
          <aside className="prompt-box">
            <p>It seems you are thinking very hard, let me help you:</p>
            <nav>
              <ul>
                <li>
                  <button onClick={() => handleSend("Hello")}>Hello</button>
                </li>
                <li>
                  <button onClick={() => handleSend("Who are you?")}>
                    Who are you?
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSend("What are your beliefs?")}>
                    What are your beliefs?
                  </button>
                </li>
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
          onChange={(e) => setInput(e.target.value)}
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
