function PatientPanel({ patient, setPatient, severity }) {
  const severityData = {
    normal: { color: "#28a745", label: "Normal", width: "30%", bg: "#d4edda" },
    moderate: { color: "#fd7e14", label: "Moderate", width: "60%", bg: "#fff3cd" },
    critical: { color: "#dc3545", label: "Critical", width: "100%", bg: "#f8d7da" },
  };
  const s = severityData[severity] || severityData.normal;

  return (
    <div className="patient-panel" style={{ width: 280, minHeight: "100vh", background: "#fff", borderLeft: "1px solid #e0e0e0", padding: 24, display: "flex", flexDirection: "column", gap: 24, flexShrink: 0, overflowY: "auto" }}>

      {/* Patient Info */}
      <div>
        <div style={{ fontSize: 13, fontWeight: "bold", color: "#0a1628", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
          👤 Patient Information
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: "#6c757d", fontWeight: "bold" }}>FULL NAME</label>
            <input
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13, marginTop: 4, boxSizing: "border-box", outline: "none" }}
              placeholder="Enter your name"
              value={patient.name}
              onChange={e => setPatient({ ...patient, name: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#6c757d", fontWeight: "bold" }}>AGE</label>
            <input
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13, marginTop: 4, boxSizing: "border-box", outline: "none" }}
              placeholder="Your age"
              value={patient.age}
              onChange={e => setPatient({ ...patient, age: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#6c757d", fontWeight: "bold" }}>GENDER</label>
            <select
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13, marginTop: 4, boxSizing: "border-box", outline: "none", background: "#fff" }}
              value={patient.gender}
              onChange={e => setPatient({ ...patient, gender: e.target.value })}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Severity Meter */}
      <div style={{ background: s.bg, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: "bold", color: "#0a1628", marginBottom: 12 }}>
          📊 Symptom Severity
        </div>
        <div style={{ background: "#e0e0e0", borderRadius: 10, height: 10, overflow: "hidden" }}>
          <div style={{ width: s.width, height: "100%", background: s.color, borderRadius: 10, transition: "width 0.5s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 11, color: "#28a745" }}>Low</span>
          <span style={{ fontSize: 12, fontWeight: "bold", color: s.color }}>{s.label}</span>
          <span style={{ fontSize: 11, color: "#dc3545" }}>Critical</span>
        </div>
      </div>

      {/* Tips */}
      <div style={{ background: "#f0f4ff", borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: "bold", color: "#0a1628", marginBottom: 10 }}>💡 Health Tips</div>
        {["Drink 8 glasses of water daily", "Sleep 7-8 hours per night", "Exercise 30 mins daily", "Eat balanced meals"].map(tip => (
          <div key={tip} style={{ fontSize: 12, color: "#444", marginBottom: 6, display: "flex", gap: 6 }}>
            <span style={{ color: "#0d6efd" }}>•</span> {tip}
          </div>
        ))}
      </div>

      {/* Emergency Button */}
      <div style={{ background: "#fff5f5", border: "1px solid #f5c6cb", borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: "bold", color: "#dc3545", marginBottom: 8 }}>🚨 Emergency</div>
        <div style={{ fontSize: 11, color: "#666", marginBottom: 12 }}>If you have a medical emergency call immediately</div>
        <button style={{ width: "100%", padding: "10px", borderRadius: 8, background: "#dc3545", color: "#fff", border: "none", fontWeight: "bold", fontSize: 13, cursor: "pointer" }}>
          📞 Call 112
        </button>
      </div>

      {/* Disclaimer */}
      <div style={{ background: "#fffbeb", border: "1px solid #ffc107", borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 11, color: "#856404", lineHeight: 1.6 }}>
          ⚠️ MediBot provides general health information only. Always consult a qualified doctor for proper medical diagnosis and treatment.
        </div>
      </div>
    </div>
  );
}

export default PatientPanel;