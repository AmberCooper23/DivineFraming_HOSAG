import React, { useState, useEffect, useRef } from "react";
import { askModel } from "../../api/infer";
import {
  STARTERS,
  OPENING_MESSAGE,
  pickFollowUps,
} from "../../components/suggestions";
import "./LandingPage.css";

const OPENING_DELAY_MS = 2500; // the bot speaks first after this long
const IDLE_FIRST_MS = 5000; // wait before offering starters once the bot has spoken
const IDLE_AFTER_REPLY_MS = 8000; // wait before offering follow-ups after an answer

// If a message mentions self-harm, the chat steps out of character and does not call the model.
const CRISIS_PATTERN =
  /\b(suicid\w*|kill myself|end my life|end it all|want to die|wanna die|(don'?t|do not) want to (live|be alive)|hurt myself|harm myself|self[- ]?harm|cut myself|better off dead)\b/i;

const SAFETY_MESSAGE =
  "I'm stepping outside the demonstration. This chat is fiction and cannot help with what you may be feeling. " +
  "If you are thinking about harming yourself, please reach out to someone you trust or a local crisis line " +
  "(findahelpline.com lists services by country). If you are in immediate danger, contact your local emergency number.";

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

    if (CRISIS_PATTERN.test(userText)) {
      setMessages([
        ...newMessages,
        { role: "assistant", text: SAFETY_MESSAGE, safety: true },
      ]);
      return;
    }

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

  // The bot speaks first, unless the user has already started typing a message.
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages((prev) =>
        prev.length === 0
          ? [{ role: "assistant", text: OPENING_MESSAGE }]
          : prev,
      );
    }, OPENING_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Offer suggestions when the user goes quiet: after the opening, or after an answer.
  useEffect(() => {
    if (loading || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.safety) return; // no suggestions after a safety message
    if (last.role !== "assistant") return;

    const hasUser = messages.some((m) => m.role === "user");
    const delay = hasUser ? IDLE_AFTER_REPLY_MS : IDLE_FIRST_MS;
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

  const userTurns = messages.filter((m) => m.role === "user").length;
  const isFirst = userTurns === 0;
  const suggestions = isFirst ? STARTERS : pickFollowUps(userTurns);
  const heading = isFirst
    ? "Speak freely. The flame has heard everything before. Perhaps you wish to say:"
    : "Do not be shy, little ember. The flame is listening:";

  return (
    <main className="chat-container">
      <header className="chat-header">
        <h1>Saints of the Inferno</h1>
        <p className="demo-notice">
          A fictional demonstration of manipulative language, created for
          research. Please do not share real personal information.
        </p>
      </header>

      <section className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, idx) => (
          <article
            key={idx}
            className={`chat-message ${msg.role === "user" ? "user" : "assistant"}${msg.safety ? " safety" : ""}`}
          >
            {msg.role === "assistant" && (
              <header className="sender">
                {msg.safety ? "Outside the demonstration" : "Sacred Response"}
              </header>
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
          placeholder={isFirst ? "Ask the flame..." : "Tell the flame what weighs on you..."}
          className="chat-input"
        />
        <button onClick={() => handleSend()} className="chat-button">
          Send
        </button>
      </footer>
    </main>
  );
}