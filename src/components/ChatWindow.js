import { useState, useRef, useEffect } from "react";

function ChatWindow({ messages, loading, onSend, severity }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f0f4ff" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(90deg, #0d6efd, #0dcaf0)", padding: "16px 24px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: 28 }}>🏥</div>
        <div>
          <div style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>MediBot AI Consultation</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Powered by LLaMA 3.3 • Multi-Model AI</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <div style={{ background: "#28a745", borderRadius: 20, padding: "4px 14px", color: "#fff", fontSize: 12, fontWeight: "bold" }}>● Live</div>
          {severity === "critical" && (
            <div style={{ background: "#dc3545", borderRadius: 20, padding: "4px 14px", color: "#fff", fontSize: 12, fontWeight: "bold", animation: "pulse 1s infinite" }}>🚨 EMERGENCY</div>
          )}
        </div>
      </div>

      {/* Emergency Banner */}
      {severity === "critical" && (
        <div style={{ background: "#dc3545", color: "#fff", padding: "12px 24px", textAlign: "center", fontWeight: "bold", fontSize: 14 }}>
          🚨 CRITICAL SYMPTOMS DETECTED — Please call 112 or visit nearest emergency room immediately!
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 10 }}>
            {msg.role === "assistant" && (
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #0d6efd, #0dcaf0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🤖</div>
            )}
            <div style={{
              background: msg.role === "user" ? "linear-gradient(135deg, #0d6efd, #0dcaf0)" : "#fff",
              color: msg.role === "user" ? "#fff" : "#1a1a2e",
              padding: "14px 18px",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              maxWidth: "65%",
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
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#6c757d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>👤</div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #0d6efd, #0dcaf0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
            <div style={{ background: "#fff", padding: "14px 18px", borderRadius: "18px 18px 18px 4px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
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
      <div style={{ background: "#fff", padding: "16px 24px", borderTop: "1px solid #e0e0e0", boxShadow: "0 -2px 10px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            style={{ flex: 1, padding: "14px 20px", borderRadius: 30, border: "2px solid #e0e0e0", fontSize: 14, outline: "none", fontFamily: "inherit" }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Describe your symptoms in detail..."
          />
          <button
            onClick={handleSend}
            disabled={loading}
            style={{ padding: "14px 28px", borderRadius: 30, background: loading ? "#ccc" : "linear-gradient(90deg, #0d6efd, #0dcaf0)", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: 14, fontWeight: "bold", whiteSpace: "nowrap" }}>
            {loading ? "Thinking..." : "Send →"}
          </button>
        </div>
        <div style={{ textAlign: "center", color: "#999", fontSize: 11, marginTop: 8 }}>
          ⚠️ MediBot is not a substitute for professional medical advice. Always consult a real doctor.
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;