import { useState, useRef, useEffect } from "react";

function ChatWindow({ messages, loading, onSend, severity, isMobile }) {
  const [input, setInput] = useState("");
  const [isMobileMode, setIsMobileMode] = useState(true);
  const [feedback, setFeedback] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const recognitionRef = useRef(null);

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

  useEffect(() => {
    if (!voiceEnabled) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'assistant') {
      speakText(lastMsg.content);
    }
  }, [messages, voiceEnabled]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const toggleMode = () => {
    const meta = document.querySelector("meta[name=viewport]");
    if (isMobileMode) {
      // Desktop mode disabled for mobile
      setIsMobileMode(false);
    } else {
      meta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content");
      setIsMobileMode(true);
    }
  };

  const handleFeedback = (msgIndex, type) => {
    setFeedback(prev => ({ ...prev, [msgIndex]: type }));
    const feedbackData = JSON.parse(localStorage.getItem('medibot_feedback') || '[]');
    feedbackData.push({
      message: messages[msgIndex]?.content,
      feedback: type,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('medibot_feedback', JSON.stringify(feedbackData));

    // Send feedback to backend for learning
    try {
      fetch('https://medibot-backend-neuz.onrender.com/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messages[msgIndex - 1]?.content || '',
          reply: messages[msgIndex]?.content || '',
          feedback: type === 'up' ? 'up' : 'down',
          intent: 'unknown'
        })
      });
    } catch (e) {}
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported. Please use Chrome!");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[^\w\s.,?!-\u0900-\u097F\u0980-\u09FF\u0600-\u06FF]/g, '').slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const hasHindi = /[\u0900-\u097F]/.test(text);
    const hasBengali = /[\u0980-\u09FF]/.test(text);
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    if (hasHindi) utterance.lang = 'hi-IN';
    else if (hasBengali) utterance.lang = 'bn-IN';
    else if (hasArabic) utterance.lang = 'ar-SA';
    else utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const langVoice = voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0]));
    if (langVoice) utterance.voice = langVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div ref={containerRef} className="chat-window" style={{
      flex: 1, display: "flex", flexDirection: "column",
      height: "100dvh", maxHeight: "100dvh",
      background: "transparent", overflow: "hidden",
      position: "relative", width: "100%"
    }}>

      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 14,
        flexShrink: 0, flexWrap: "wrap", zIndex: 5
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, boxShadow: "0 4px 15px rgba(108,99,255,0.3)"
        }}>🏥</div>

        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" }}>
            MediBot AI
          </div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
            Multi-Model AI • 31 Languages
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* Live Badge */}
          <div style={{
            background: "rgba(0,212,170,0.15)", border: "1px solid rgba(0,212,170,0.3)",
            borderRadius: 20, padding: "4px 12px", color: "#00D4AA",
            fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D4AA", display: "inline-block", animation: "pulse 2s infinite" }}></span>
            Live
          </div>

          {/* Voice Toggle */}
          <button onClick={() => { setVoiceEnabled(!voiceEnabled); if (isSpeaking) stopSpeaking(); }}
            style={{
              background: voiceEnabled ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.06)",
              border: voiceEnabled ? "1px solid rgba(108,99,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20, padding: "4px 12px",
              color: voiceEnabled ? "#8B85FF" : "rgba(255,255,255,0.5)",
              fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.3s ease"
            }}>
            {voiceEnabled ? "🔊 Voice On" : "🔇 Voice Off"}
          </button>

          {isMobile && (
            <button onClick={toggleMode} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20, padding: "4px 12px",
              color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer"
            }}>
              {isMobileMode ? "🖥️ Desktop" : "📱 Mobile"}
            </button>
          )}

          {severity === "critical" && (
            <div style={{
              background: "rgba(255,107,107,0.2)", border: "1px solid rgba(255,107,107,0.4)",
              borderRadius: 20, padding: "4px 12px",
              color: "#FF6B6B", fontSize: 11, fontWeight: 700
            }}>🚨 SOS</div>
          )}
        </div>
      </div>

      {/* Emergency Banner */}
      {severity === "critical" && (
        <div style={{
          background: "linear-gradient(90deg, rgba(255,107,107,0.2), rgba(255,71,87,0.2))",
          border: "1px solid rgba(255,107,107,0.3)",
          color: "#FF6B6B", padding: "10px 16px", textAlign: "center",
          fontWeight: 700, fontSize: 13, flexShrink: 0
        }}>
          🚨 CRITICAL — Call 112 immediately!
        </div>
      )}

      {/* Listening Indicator */}
      {isListening && (
        <div style={{
          background: "rgba(255,107,107,0.15)", border: "1px solid rgba(255,107,107,0.3)",
          color: "#FF6B6B", padding: "10px 16px", textAlign: "center",
          fontSize: 13, fontWeight: 600, flexShrink: 0, animation: "pulse 1s infinite"
        }}>
          🎤 Listening... Speak now!
        </div>
      )}

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div style={{
          background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)",
          color: "#8B85FF", padding: "10px 16px", textAlign: "center",
          fontSize: 13, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
        }}>
          🔊 Speaking...
          <button onClick={stopSpeaking} style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 10, padding: "2px 10px", color: "#fff", cursor: "pointer", fontSize: 11
          }}>Stop</button>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "20px",
        display: "flex", flexDirection: "column", gap: 18,
        WebkitOverflowScrolling: "touch"
      }}>
        {messages.map((msg, i) => (
          <div key={i}>
            <div style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-end", gap: 10
            }}>
              {msg.role === "assistant" && (
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(108,99,255,0.3)"
                }}>🤖</div>
              )}

              <div style={{
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #6C63FF, #8B85FF)"
                  : "rgba(255,255,255,0.08)",
                backdropFilter: msg.role === "assistant" ? "blur(20px)" : "none",
                border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.1)" : "none",
                color: "#fff",
                padding: "14px 18px",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                maxWidth: "78%", fontSize: 14, lineHeight: 1.7,
                boxShadow: msg.role === "user" ? "0 4px 15px rgba(108,99,255,0.3)" : "0 4px 15px rgba(0,0,0,0.2)",
                whiteSpace: "pre-wrap", animation: "fadeInUp 0.3s ease"
              }}>
                {msg.role === 'assistant' && msg.content.includes('educational purposes') ? (
                  <>
                    {msg.content.split('This response is provided for educational purposes')[0]}
                    <span style={{ color: '#FF6B6B', fontWeight: 'bold', fontStyle: 'italic', display: 'block', marginTop: 8 }}>
                      ⚠️ This response is provided for educational purposes only and does not substitute professional medical advice.
                    </span>
                  </>
                ) : msg.content}
                <div style={{ fontSize: 10, opacity: 0.4, marginTop: 6, textAlign: "right" }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {msg.role === "user" && (
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0
                }}>👤</div>
              )}
            </div>

            {/* Speak + Feedback */}
            {msg.role === "assistant" && i > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                marginTop: 6, marginLeft: 44, flexWrap: "wrap"
              }}>
                <button onClick={() => speakText(msg.content)} style={{
                  background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)",
                  borderRadius: 16, padding: "3px 12px", cursor: "pointer",
                  fontSize: 11, color: "#8B85FF", fontWeight: 600, transition: "all 0.3s ease"
                }}>🔊 Speak</button>

                {feedback[i] ? (
                  <span style={{ fontSize: 11, color: "#00D4AA" }}>
                    {feedback[i] === 'up' ? '✅ Thanks!' : '📝 Will improve!'}
                  </span>
                ) : (
                  <>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Helpful?</span>
                    <button onClick={() => handleFeedback(i, 'up')} style={{
                      background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.2)",
                      borderRadius: 16, padding: "3px 10px", cursor: "pointer",
                      fontSize: 11, color: "#00D4AA", transition: "all 0.3s ease"
                    }}>👍</button>
                    <button onClick={() => handleFeedback(i, 'down')} style={{
                      background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)",
                      borderRadius: 16, padding: "3px 10px", cursor: "pointer",
                      fontSize: 11, color: "#FF6B6B", transition: "all 0.3s ease"
                    }}>👎</button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
            }}>🤖</div>
            <div style={{
              background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "14px 18px", borderRadius: "18px 18px 18px 4px"
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#6C63FF",
                    animation: `bounce 1s infinite ${i * 0.2}s`
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "14px 20px", flexShrink: 0,
        position: "sticky", bottom: 0, zIndex: 10
      }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Mic Button */}
          <button onClick={isListening ? stopListening : startListening} style={{
            width: 44, height: 44, borderRadius: 12,
            background: isListening
              ? "linear-gradient(135deg, #FF6B6B, #FF4757)"
              : "linear-gradient(135deg, #6C63FF, #00D4AA)",
            color: "#fff", border: "none", cursor: "pointer", fontSize: 18, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isListening ? "0 4px 15px rgba(255,107,107,0.4)" : "0 4px 15px rgba(108,99,255,0.3)",
            animation: isListening ? "pulse 1s infinite" : "none",
            transition: "all 0.3s ease"
          }}>
            {isListening ? "⏹️" : "🎤"}
          </button>

          <input
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder={isListening ? "Listening..." : "Describe your symptoms or ask a medical question..."}
          />

          <button onClick={handleSend} disabled={loading} style={{
            padding: "12px 24px", borderRadius: 12,
            background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #6C63FF, #00D4AA)",
            color: "#fff", border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 14, fontWeight: 700, whiteSpace: "nowrap",
            boxShadow: loading ? "none" : "0 4px 15px rgba(108,99,255,0.3)",
            transition: "all 0.3s ease"
          }}>
            {loading ? "..." : "Send →"}
          </button>
        </div>

        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 10, marginTop: 8 }}>
          ⚕️ MediBot is not a substitute for professional medical advice
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-nav" style={{
        display: "none",
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "10px 0", flexShrink: 0
      }}>
        {[
          { icon: "💬", label: "New Chat" },
          { icon: "🤒", label: "Fever" },
          { icon: "💔", label: "Chest Pain" },
          { icon: "🚨", label: "Emergency" },
        ].map(item => (
          <div key={item.label} style={{
            display: "inline-flex", flexDirection: "column", alignItems: "center",
            width: "25%", color: "rgba(255,255,255,0.5)", fontSize: 10, cursor: "pointer", gap: 3
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