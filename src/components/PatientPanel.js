function PatientPanel({ patient, setPatient, severity }) {
  const isMobile = window.innerWidth <= 900 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (isMobile) return null;

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)",
    color: "#fff", fontSize: 13, boxSizing: "border-box", outline: "none",
    fontFamily: "var(--font-main)", backdropFilter: "blur(10px)",
    transition: "all 0.3s ease"
  };

  const labelStyle = {
    color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700,
    letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase"
  };

  const severityColor = severity === "critical" ? "#FF6B6B" : severity === "moderate" ? "#FFB347" : "#00D4AA";
  const severityWidth = severity === "critical" ? "100%" : severity === "moderate" ? "60%" : "30%";

  return (
    <div className="patient-panel" style={{
      width: 280, minHeight: "100vh",
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderLeft: "1px solid rgba(255,255,255,0.08)",
      padding: "24px 16px", overflowY: "auto", flexShrink: 0,
      position: "relative", zIndex: 2
    }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
          }}>👤</div>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" }}>
            Patient Info
          </span>
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ marginBottom: 16 }}>
        <div style={labelStyle}>Full Name</div>
        <input style={inputStyle} placeholder="Enter your name"
          value={patient.name || ''} onChange={e => setPatient({ ...patient, name: e.target.value })} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={labelStyle}>Age</div>
        <input style={inputStyle} placeholder="Your age" type="number"
          value={patient.age || ''} onChange={e => setPatient({ ...patient, age: e.target.value })} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={labelStyle}>Gender</div>
        <select style={{ ...inputStyle, cursor: "pointer" }}
          value={patient.gender || ''} onChange={e => setPatient({ ...patient, gender: e.target.value })}>
          <option value="" style={{ background: "#1a1a2e" }}>Select gender</option>
          <option value="male" style={{ background: "#1a1a2e" }}>Male</option>
          <option value="female" style={{ background: "#1a1a2e" }}>Female</option>
          <option value="other" style={{ background: "#1a1a2e" }}>Other</option>
        </select>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={labelStyle}>Response Language</div>
        <select style={{ ...inputStyle, cursor: "pointer" }}
          value={patient.language || 'auto'} onChange={e => setPatient({ ...patient, language: e.target.value })}>
          <option value="auto" style={{ background: "#1a1a2e" }}>🌍 Auto Detect</option>
          <option value="english" style={{ background: "#1a1a2e" }}>🇬🇧 English</option>
          <option value="hindi" style={{ background: "#1a1a2e" }}>🇮🇳 Hindi</option>
          <option value="bengali" style={{ background: "#1a1a2e" }}>🇧🇩 Bengali</option>
          <option value="hinglish" style={{ background: "#1a1a2e" }}>🔀 Hinglish</option>
          <option value="banglish" style={{ background: "#1a1a2e" }}>🔀 Banglish</option>
          <option value="spanish" style={{ background: "#1a1a2e" }}>🇪🇸 Spanish</option>
          <option value="french" style={{ background: "#1a1a2e" }}>🇫🇷 French</option>
          <option value="arabic" style={{ background: "#1a1a2e" }}>🇸🇦 Arabic</option>
        </select>
      </div>

      {/* Severity Meter */}
      <div style={{
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14, padding: 16, marginBottom: 16
      }}>
        <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
          📊 Symptom Severity
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: severityWidth,
            background: `linear-gradient(90deg, ${severityColor}, ${severityColor}88)`,
            borderRadius: 3, transition: "all 0.5s ease"
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ color: "#00D4AA", fontSize: 10, fontWeight: 600 }}>Low</span>
          <span style={{ color: "#FFB347", fontSize: 10, fontWeight: 600 }}>Normal</span>
          <span style={{ color: "#FF6B6B", fontSize: 10, fontWeight: 600 }}>Critical</span>
        </div>
      </div>

      {/* Health Tips */}
      <div style={{
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14, padding: 16, marginBottom: 16
      }}>
        <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
          💡 Health Tips
        </div>
        {["Drink 8 glasses of water daily", "Sleep 7-8 hours per night", "Exercise 30 mins daily", "Eat balanced meals"].map((tip, i) => (
          <div key={i} style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 6, paddingLeft: 12, borderLeft: "2px solid rgba(108,99,255,0.3)" }}>
            {tip}
          </div>
        ))}
      </div>

      {/* Emergency */}
      <div style={{
        background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)",
        borderRadius: 14, padding: 16, marginBottom: 16
      }}>
        <div style={{ color: "#FF6B6B", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
          🚨 Emergency
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 10 }}>
          If you have a medical emergency call immediately
        </div>
        <a href="tel:112" style={{
          display: "block", textAlign: "center", padding: "10px",
          background: "linear-gradient(135deg, #FF6B6B, #FF4757)",
          borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700,
          textDecoration: "none", transition: "all 0.3s ease"
        }}>
          📞 Call 112
        </a>
      </div>

      {/* Disclaimer */}
      <div style={{
        background: "rgba(255,179,71,0.1)", border: "1px solid rgba(255,179,71,0.15)",
        borderRadius: 14, padding: 14
      }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, lineHeight: 1.5 }}>
          ⚠️ MediBot provides general health information only. Always consult a qualified doctor for proper medical diagnosis and treatment.
        </div>
      </div>
    </div>
  );
}

export default PatientPanel;