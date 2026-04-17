import { useState } from "react";

function Sidebar({ onNav, onSymptom, activeNav, onSymptomForm }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    symptom: "", duration: "", severity: "5", location: "", existing: ""
  });

  const isMobile = window.innerWidth <= 900 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (isMobile) return null;

  const handleFormSubmit = () => {
    if (!formData.symptom) return;
    const message = `I have ${formData.symptom}. Duration: ${formData.duration || 'not sure'}. Severity: ${formData.severity}/10. Location: ${formData.location || 'not specified'}. Existing conditions: ${formData.existing || 'none'}.`;
    onSymptomForm(message);
    setShowForm(false);
    setFormData({ symptom: "", duration: "", severity: "5", location: "", existing: "" });
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)",
    color: "#fff", fontSize: 12, boxSizing: "border-box", outline: "none",
    fontFamily: "var(--font-main)", backdropFilter: "blur(10px)",
    transition: "all 0.3s ease"
  };

  return (
    <div className="sidebar" style={{
      width: 260, minHeight: "100vh",
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderRight: "1px solid rgba(255,255,255,0.08)",
      display: "flex", flexDirection: "column", padding: "0",
      flexShrink: 0, position: "relative", zIndex: 2
    }}>

      {/* Logo */}
      <div style={{
        padding: "28px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, marginBottom: 12,
          boxShadow: "0 4px 15px rgba(108,99,255,0.3)"
        }}>🏥</div>
        <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)" }}>MediBot</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 4, letterSpacing: 1 }}>AI Medical Assistant</div>
      </div>

      {/* Navigation */}
      <div style={{ padding: "20px 16px", flex: 1, overflowY: "auto" }}>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>
          Navigation
        </div>

        {[
          { icon: "💬", label: "New Consultation" },
          { icon: "📋", label: "Symptom Checker" },
          { icon: "📚", label: "Study Mode" },
          { icon: "💊", label: "Medications" },
          { icon: "🚨", label: "Emergency" },
        ].map((item) => (
          <div key={item.label}
            onClick={() => {
              onNav(item.label);
              if (item.label === "Symptom Checker") setShowForm(true);
              if (item.label === "Study Mode") onSymptomForm("Explain the most important medical topics for students");
            }}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 14px", borderRadius: 12, marginBottom: 4,
              color: activeNav === item.label ? "#fff" : "rgba(255,255,255,0.6)",
              fontSize: 13, cursor: "pointer", fontWeight: activeNav === item.label ? 600 : 400,
              background: activeNav === item.label ? "rgba(108,99,255,0.2)" : "transparent",
              border: activeNav === item.label ? "1px solid rgba(108,99,255,0.3)" : "1px solid transparent",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(108,99,255,0.15)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => {
              e.currentTarget.style.background = activeNav === item.label ? "rgba(108,99,255,0.2)" : "transparent";
              e.currentTarget.style.color = activeNav === item.label ? "#fff" : "rgba(255,255,255,0.6)";
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}

        {/* Symptom Checker Form */}
        {showForm && (
          <div style={{
            background: "rgba(108,99,255,0.1)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(108,99,255,0.2)",
            borderRadius: 14, padding: 14, marginTop: 10
          }}>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>📋 Symptom Details</div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>MAIN SYMPTOM *</div>
              <input style={inputStyle} placeholder="e.g. headache, fever"
                value={formData.symptom} onChange={e => setFormData({ ...formData, symptom: e.target.value })} />
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>DURATION</div>
              <input style={inputStyle} placeholder="e.g. 2 days, 1 week"
                value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>SEVERITY: {formData.severity}/10</div>
              <input type="range" min="1" max="10" style={{ width: "100%", accentColor: "#6C63FF" }}
                value={formData.severity} onChange={e => setFormData({ ...formData, severity: e.target.value })} />
              <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.3)", fontSize: 9 }}>
                <span>Mild</span><span>Moderate</span><span>Severe</span>
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>BODY LOCATION</div>
              <input style={inputStyle} placeholder="e.g. head, chest"
                value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>EXISTING CONDITIONS</div>
              <input style={inputStyle} placeholder="e.g. diabetes, BP"
                value={formData.existing} onChange={e => setFormData({ ...formData, existing: e.target.value })} />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleFormSubmit} style={{
                flex: 1, padding: "10px", borderRadius: 10,
                background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                transition: "all 0.3s ease"
              }}>Send →</button>
              <button onClick={() => setShowForm(false)} style={{
                padding: "10px 14px", borderRadius: 10,
                background: "rgba(255,107,107,0.2)", border: "1px solid rgba(255,107,107,0.3)",
                color: "#FF6B6B", cursor: "pointer", fontSize: 12, transition: "all 0.3s ease"
              }}>✕</button>
            </div>
          </div>
        )}

        {/* Quick Symptoms */}
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginTop: 24, marginBottom: 12, textTransform: "uppercase" }}>
          Quick Symptoms
        </div>
        {[
          { emoji: "🤒", label: "Fever" },
          { emoji: "🤕", label: "Headache" },
          { emoji: "😮‍💨", label: "Breathing" },
          { emoji: "🤢", label: "Nausea" },
          { emoji: "💔", label: "Chest Pain" },
        ].map((s) => (
          <div key={s.label}
            onClick={() => onSymptom(s.label)}
            style={{
              padding: "9px 14px", borderRadius: 10, marginBottom: 4,
              color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", gap: 10,
              transition: "all 0.3s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(108,99,255,0.1)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(108,99,255,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
          >
            <span>{s.emoji}</span><span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>⚕️ MediBot v3.0</div>
        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, marginTop: 2 }}>Powered by Multi-Model AI</div>
      </div>
    </div>
  );
}

export default Sidebar;