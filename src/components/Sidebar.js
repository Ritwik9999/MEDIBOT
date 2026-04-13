import { useState } from "react";

function Sidebar({ onNav, onSymptom, activeNav, onSymptomForm }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    symptom: "",
    duration: "",
    severity: "5",
    location: "",
    existing: ""
  });

  const isMobile = window.innerWidth <= 900 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (isMobile) return null;

  const handleFormSubmit = () => {
    if (!formData.symptom) return;
    const message = `I have ${formData.symptom}. 
Duration: ${formData.duration || 'not sure'}.
Severity: ${formData.severity}/10.
Location: ${formData.location || 'not specified'}.
Existing conditions: ${formData.existing || 'none'}.`;
    onSymptomForm(message);
    setShowForm(false);
    setFormData({ symptom: "", duration: "", severity: "5", location: "", existing: "" });
  };

  return (
    <div className="sidebar" style={{
      width: 220, minHeight: "100vh", background: "#0a1628",
      display: "flex", flexDirection: "column", padding: "24px 0",
      boxShadow: "2px 0 10px rgba(0,0,0,0.3)", flexShrink: 0,
      overflowY: "auto"
    }}>
      {/* Logo */}
      <div style={{ padding: "0 24px 32px", borderBottom: "1px solid #1e3a5f" }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>🏥</div>
        <div style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>MediBot</div>
        <div style={{ color: "#7aa3cc", fontSize: 11, marginTop: 2 }}>AI Medical Assistant</div>
      </div>

      {/* Navigation */}
      <div style={{ padding: "24px 16px", flex: 1 }}>
        <div style={{ color: "#7aa3cc", fontSize: 10, fontWeight: "bold", letterSpacing: 1, marginBottom: 12 }}>NAVIGATION</div>
        {[
          { icon: "💬", label: "New Consultation" },
          { icon: "📋", label: "Symptom Checker" },
          { icon: "💊", label: "Medications" },
          { icon: "🚨", label: "Emergency" },
        ].map((item) => (
          <div key={item.label}
            onClick={() => {
              onNav(item.label);
              if (item.label === "Symptom Checker") setShowForm(true);
            }}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 8, marginBottom: 4,
              color: activeNav === item.label ? "#fff" : "#cce0ff",
              fontSize: 13, cursor: "pointer",
              background: activeNav === item.label ? "#1e3a5f" : "transparent",
              border: activeNav === item.label ? "1px solid #0d6efd" : "1px solid transparent",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#1e3a5f"}
            onMouseLeave={e => e.currentTarget.style.background = activeNav === item.label ? "#1e3a5f" : "transparent"}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}

        {/* ✅ Symptom Checker Form */}
        {showForm && (
          <div style={{ background: "#1e3a5f", borderRadius: 10, padding: 12, marginTop: 8 }}>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: "bold", marginBottom: 10 }}>📋 Symptom Details</div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ color: "#7aa3cc", fontSize: 10, marginBottom: 4 }}>MAIN SYMPTOM *</div>
              <input
                style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #2e5a8f", background: "#0a1628", color: "#fff", fontSize: 12, boxSizing: "border-box", outline: "none" }}
                placeholder="e.g. headache, fever"
                value={formData.symptom}
                onChange={e => setFormData({ ...formData, symptom: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ color: "#7aa3cc", fontSize: 10, marginBottom: 4 }}>DURATION</div>
              <input
                style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #2e5a8f", background: "#0a1628", color: "#fff", fontSize: 12, boxSizing: "border-box", outline: "none" }}
                placeholder="e.g. 2 days, 1 week"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ color: "#7aa3cc", fontSize: 10, marginBottom: 4 }}>SEVERITY: {formData.severity}/10</div>
              <input
                type="range" min="1" max="10"
                style={{ width: "100%", accentColor: "#0d6efd" }}
                value={formData.severity}
                onChange={e => setFormData({ ...formData, severity: e.target.value })}
              />
              <div style={{ display: "flex", justifyContent: "space-between", color: "#7aa3cc", fontSize: 9 }}>
                <span>Mild</span><span>Moderate</span><span>Severe</span>
              </div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ color: "#7aa3cc", fontSize: 10, marginBottom: 4 }}>BODY LOCATION</div>
              <input
                style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #2e5a8f", background: "#0a1628", color: "#fff", fontSize: 12, boxSizing: "border-box", outline: "none" }}
                placeholder="e.g. head, chest, stomach"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ color: "#7aa3cc", fontSize: 10, marginBottom: 4 }}>EXISTING CONDITIONS</div>
              <input
                style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #2e5a8f", background: "#0a1628", color: "#fff", fontSize: 12, boxSizing: "border-box", outline: "none" }}
                placeholder="e.g. diabetes, BP"
                value={formData.existing}
                onChange={e => setFormData({ ...formData, existing: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={handleFormSubmit}
                style={{ flex: 1, padding: "8px", borderRadius: 6, background: "linear-gradient(90deg, #0d6efd, #0dcaf0)", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: "bold" }}>
                Send →
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{ padding: "8px 12px", borderRadius: 6, background: "#dc3545", color: "#fff", border: "none", cursor: "pointer", fontSize: 12 }}>
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Quick Symptoms */}
        <div style={{ color: "#7aa3cc", fontSize: 10, fontWeight: "bold", letterSpacing: 1, marginTop: 24, marginBottom: 12 }}>QUICK SYMPTOMS</div>
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
              padding: "7px 12px", borderRadius: 6, marginBottom: 4,
              color: "#7aa3cc", fontSize: 12, cursor: "pointer",
              border: "1px solid #1e3a5f", display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1e3a5f"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#7aa3cc"; }}
          >
            <span>{s.emoji}</span><span>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "16px 24px", borderTop: "1px solid #1e3a5f" }}>
        <div style={{ color: "#7aa3cc", fontSize: 10 }}>⚕️ MediBot v2.0</div>
        <div style={{ color: "#4a6a8a", fontSize: 9, marginTop: 2 }}>Powered by LLaMA 3.3</div>
      </div>
    </div>
  );
}

export default Sidebar;