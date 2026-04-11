function Sidebar() {
  return (
    <div style={{
      width: 220, minHeight: "100vh", background: "#0a1628",
      display: "flex", flexDirection: "column", padding: "24px 0",
      boxShadow: "2px 0 10px rgba(0,0,0,0.3)", flexShrink: 0
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
          <div key={item.label} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 12px", borderRadius: 8, marginBottom: 4,
            color: "#cce0ff", fontSize: 13, cursor: "pointer",
            transition: "background 0.2s"
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#1e3a5f"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}

        {/* Quick Symptoms */}
        <div style={{ color: "#7aa3cc", fontSize: 10, fontWeight: "bold", letterSpacing: 1, marginTop: 24, marginBottom: 12 }}>QUICK SYMPTOMS</div>
        {["🤒 Fever", "🤕 Headache", "😮‍💨 Breathing", "🤢 Nausea", "💔 Chest Pain"].map((s) => (
          <div key={s} style={{
            padding: "7px 12px", borderRadius: 6, marginBottom: 4,
            color: "#7aa3cc", fontSize: 12, cursor: "pointer",
            border: "1px solid #1e3a5f"
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#1e3a5f"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >{s}</div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid #1e3a5f" }}>
        <div style={{ color: "#7aa3cc", fontSize: 10 }}>⚕️ MediBot v2.0</div>
        <div style={{ color: "#4a6a8a", fontSize: 9, marginTop: 2 }}>Powered by LLaMA 3.3</div>
      </div>
    </div>
  );
}

export default Sidebar;