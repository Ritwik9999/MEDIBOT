import { useState, useRef, useEffect } from "react";

function ChatWindow({ messages, loading, onSend, severity, isMobile }) {
  const [input, setInput] = useState("");
  const [isMobileMode, setIsMobileMode] = useState(true);
  const [feedback, setFeedback] = useState({});
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const height = window.visualViewport?.height || window.innerHeight;
        containerRef.current.style.height = `${height}px`;
      }
    };
    window.visualViewport?.addEventListener("resize", handleResize);
    handleResize();
    return () => window.visualViewport?.removeEventListener("resize", handleResize);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const toggleMode = () => {
    if (isMobileMode) {
      const meta = document.querySelector("meta[name=viewport]");
      meta.setAttribute("content", "width=1024");
      setIsMobileMode(false);
    } else {
      const meta = document.querySelector("meta[name=viewport]");
      meta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content");
      setIsMobileMode(true);
    }
  };

  // ✅ Handle feedback
  const handleFeedback = (msgIndex, type) => {
    setFeedback(prev => ({ ...prev, [msgIndex]: type }));
    // Store feedback in localStorage
    const feedbackData = JSON.parse(localStorage.getItem('medibot_feedback') || '[]');
    feedbackData.push({
      messageIndex: msgIndex,
      message: messages[msgIndex]?.content,
      feedback: type,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('medibot_feedback', JSON.stringify(feedbackData));
    console.log(`Feedback recorded: ${type} for message ${msgIndex}`);
  };

  return (
    <div ref={containerRef} className="chat-window" style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      height: "100dvh",
      maxHeight: "100dvh",
      background: "#f0f4ff",
      overflow: "hidden",
      position: "relative",
      width: "100%"
    }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #0d6efd, #0dcaf0)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        flexShrink: 0,
        flexWrap: "wrap"
      }}>
        <div style={{ fontSize: 24 }}>🏥</div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: "bold" }}>MediBot AI Consultation</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>Powered by LLaMA 3.3 • Multi-Model AI</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ background: "#28a745", borderRadius: 20, padding: "3px 10px", color: "#fff", fontSize: 11, fontWeight: "bold" }}>● Live</div>
          {isMobile && (
            <button
              onClick={toggleMode}
              style={{
                background: isMobileMode ? "rgba(255,255,255,0.2)" : "#fff",
                border: "1px solid rgba(255,255,255,0.5)",
                borderRadius: 20,
                padding: "3px 10px",
                color: isMobileMode ? "#fff" : "#0d6efd",
                fontSize: 11,
                fontWeight: "bold",
                cursor: "pointer",
              }}>
              {isMobileMode ? "🖥️ Desktop" : "📱 Mobile"}
            </button>
          )}
          {severity === "critical" && (
            <div style={{ background: "#dc3545", borderRadius: 20, padding: "3px 10px", color: "#fff", fontSize: 11, fontWeight: "bold" }}>🚨 SOS</div>
          )}
        </div>
      </div>

      {/* Emergency Banner */}
      {severity === "critical" && (
        <div style={{ background: "#dc3545", color: "#fff", padding: "10px 16px", textAlign: "center", fontWeight: "bold", fontSize: 13, flexShrink: 0 }}>
          🚨 CRITICAL — Call 112 immediately!
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        paddingBottom: "16px",
        WebkitOverflowScrolling: "touch",
        overflowAnchor: "none",
      }}>
        {messages.map((msg, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
              {msg.role === "assistant" && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #0d6efd, #0dcaf0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🤖</div>
              )}
              <div style={{
                background: msg.role === "user" ? "linear-gradient(135deg, #0d6efd, #0dcaf0)" : "#fff",
                color: msg.role === "user" ? "#fff" : "#1a1a2e",
                padding: "12px 16px",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                maxWidth: "75%",
                fontSize: 14,
                lineHeight: 1.7,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                whiteSpace: "pre-wrap"
              }}>
                {msg.content}
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: "right" }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {msg.role === "user" && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#6c757d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>👤</div>
              )}
            </div>

            {/* ✅ Feedback buttons for assistant messages */}
            {msg.role === "assistant" && i > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, marginLeft: 40 }}>
                {feedback[i] ? (
                  <span style={{ fontSize: 11, color: "#28a745" }}>
                    {feedback[i] === 'up' ? '✅ Thanks for your feedback!' : '📝 Thanks! We\'ll improve this.'}
                  </span>
                ) : (
                  <>
                    <span style={{ fontSize: 11, color: "#999" }}>Was this helpful?</span>
                    <button
                      onClick={() => handleFeedback(i, 'up')}
                      style={{ background: "none", border: "1px solid #28a745", borderRadius: 20, padding: "2px 10px", cursor: "pointer", fontSize: 12, color: "#28a745" }}>
                      👍
                    </button>
                    <button
                      onClick={() => handleFeedback(i, 'down')}
                      style={{ background: "none", border: "1px solid #dc3545", borderRadius: 20, padding: "2px 10px", cursor: "pointer", fontSize: 12, color: "#dc3545" }}>
                      👎
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #0d6efd, #0dcaf0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
            <div style={{ background: "#fff", padding: "12px 16px", borderRadius: "18px 18px 18px 4px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#0d6efd", animation: `bounce 1s infinite ${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={{
        background: "#fff",
        padding: "12px 16px",
        borderTop: "1px solid #e0e0e0",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
        flexShrink: 0,
        position: "sticky",
        bottom: 0,
        zIndex: 10
      }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            style={{ flex: 1, padding: "12px 16px", borderRadius: 30, border: "2px solid #e0e0e0", fontSize: 14, outline: "none", fontFamily: "inherit" }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Describe your symptoms..."
          />
          <button
            onClick={handleSend}
            disabled={loading}
            style={{ padding: "12px 20px", borderRadius: 30, background: loading ? "#ccc" : "linear-gradient(90deg, #0d6efd, #0dcaf0)", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: 14, fontWeight: "bold", whiteSpace: "nowrap" }}>
            {loading ? "..." : "Send →"}
          </button>
        </div>
        <div style={{ textAlign: "center", color: "#999", fontSize: 11, marginTop: 6 }}>
          ⚠️ MediBot is not a substitute for professional medical advice. Always consult a real doctor.
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-nav" style={{
        display: "none",
        background: "#0a1628",
        padding: "8px 0",
        borderTop: "1px solid #1e3a5f",
        flexShrink: 0
      }}>
        {[
          { icon: "💬", label: "New Chat" },
          { icon: "🤒", label: "Fever" },
          { icon: "💔", label: "Chest Pain" },
          { icon: "🚨", label: "Emergency" },
        ].map(item => (
          <div key={item.label} style={{
            display: "inline-flex", flexDirection: "column", alignItems: "center",
            width: "25%", color: "#7aa3cc", fontSize: 10, cursor: "pointer", gap: 2
          }}
            onClick={() => {
              if (item.label === "New Chat") window.location.reload();
              else onSend(`I have ${item.label}`);
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default ChatWindow;