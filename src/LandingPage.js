function LandingPage({ onStart }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8faff 0%, #e8f0fe 50%, #f0f8ff 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif"
    }}>

      {/* Hero Section */}
      <div style={{ textAlign: "center", maxWidth: 680, marginBottom: 60 }}>

        {/* Logo */}
        <div style={{
          width: 90, height: 90, borderRadius: 24,
          background: "linear-gradient(135deg, #0d6efd, #0dcaf0)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 44, margin: "0 auto 28px",
          boxShadow: "0 20px 60px rgba(13,110,253,0.3)"
        }}>🏥</div>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(13,110,253,0.08)", borderRadius: 20,
          padding: "6px 16px", marginBottom: 20,
          border: "1px solid rgba(13,110,253,0.15)"
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#28a745", display: "inline-block" }}></span>
          <span style={{ fontSize: 12, color: "#0d6efd", fontWeight: 600, letterSpacing: 0.5 }}>AI POWERED • ALWAYS ONLINE</span>
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: "clamp(36px, 5vw, 56px)",
          fontWeight: 700, color: "#0a1628",
          lineHeight: 1.15, marginBottom: 20, letterSpacing: -1
        }}>
          Your Personal<br />
          <span style={{ background: "linear-gradient(135deg, #0d6efd, #0dcaf0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            AI Health Assistant
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 18, color: "#6c757d", lineHeight: 1.7,
          marginBottom: 40, maxWidth: 500, margin: "0 auto 40px"
        }}>
          Describe your symptoms and get instant medical guidance powered by advanced AI. Available 24/7, completely free.
        </p>

        {/* CTA Button */}
        <button onClick={onStart} style={{
          padding: "18px 48px", borderRadius: 50,
          background: "linear-gradient(135deg, #0d6efd, #0dcaf0)",
          color: "#fff", border: "none", fontSize: 17,
          fontWeight: 600, cursor: "pointer", letterSpacing: 0.3,
          boxShadow: "0 10px 40px rgba(13,110,253,0.35)",
          transition: "transform 0.2s, box-shadow 0.2s"
        }}
          onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 16px 50px rgba(13,110,253,0.45)"; }}
          onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 10px 40px rgba(13,110,253,0.35)"; }}
        >
          Start Consultation →
        </button>

        <p style={{ fontSize: 12, color: "#adb5bd", marginTop: 16 }}>
          No account required • Free forever • Instant results
        </p>
      </div>

      {/* Feature Cards */}
      <div style={{
        display: "flex", gap: 20, flexWrap: "wrap",
        justifyContent: "center", maxWidth: 900, marginBottom: 60
      }}>
        {[
          { icon: "🤒", title: "Symptom Analysis", desc: "Describe how you feel and get detailed possible conditions instantly" },
          { icon: "🚨", title: "Emergency Detection", desc: "Critical symptoms are detected automatically with immediate alerts" },
          { icon: "💊", title: "Home Remedies", desc: "Get safe and effective home remedies for common health issues" },
          { icon: "🔒", title: "Private & Secure", desc: "Your health data stays private. No data stored or shared ever" },
        ].map(f => (
          <div key={f.title} style={{
            background: "#fff", borderRadius: 20, padding: "28px 24px",
            width: 190, textAlign: "center",
            boxShadow: "0 4px 30px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.05)",
            transition: "transform 0.2s"
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0a1628", marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontSize: 12, color: "#6c757d", lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
        {[
          { value: "24/7", label: "Always Available" },
          { value: "Free", label: "No Cost Ever" },
          { value: "AI", label: "Powered" },
          { value: "Safe", label: "WHO Guidelines" },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#0d6efd" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#6c757d", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p style={{ fontSize: 11, color: "#adb5bd", textAlign: "center", maxWidth: 500 }}>
        ⚠️ MediBot provides general health information only and is not a substitute for professional medical advice. Always consult a qualified doctor for proper diagnosis.
      </p>
    </div>
  );
}

export default LandingPage;