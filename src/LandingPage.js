import { useState } from "react";

function LandingPage({ onStart }) {
  const [hovering, setHovering] = useState(false);

  return (
    <div className="landing-page">
      {/* Floating orbs */}
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,99,255,0.3) 0%, transparent 70%)',
        top: '10%', left: '10%', filter: 'blur(60px)', animation: 'bgFloat 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', width: 250, height: 250, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,170,0.25) 0%, transparent 70%)',
        bottom: '15%', right: '15%', filter: 'blur(50px)', animation: 'bgFloat 10s ease-in-out infinite reverse'
      }} />

      <div className="landing-card" style={{ animation: 'fadeInUp 0.8s ease' }}>
        {/* Logo */}
        <div style={{
          width: 80, height: 80, borderRadius: 20, margin: '0 auto 24px',
          background: 'linear-gradient(135deg, #6C63FF, #00D4AA)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, boxShadow: '0 8px 30px rgba(108,99,255,0.4)'
        }}>
          🏥
        </div>

        <h1 className="landing-title">MediBot</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' }}>
          AI Medical Assistant
        </p>
        <p className="landing-subtitle">
          Your intelligent health companion powered by Multi-Model AI.
          Get instant medical guidance in 31+ languages with voice support.
        </p>

        {/* Features */}
        <div className="landing-features" style={{ marginBottom: 32 }}>
          {['🤖 Multi-Model AI', '🌍 31+ Languages', '🎤 Voice Support', '📚 Study Mode', '🧠 Smart Memory', '🛡️ Safety First'].map((f, i) => (
            <span key={i} className="feature-badge">{f}</span>
          ))}
        </div>

        <button
          className="landing-btn"
          onClick={onStart}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            transform: hovering ? 'translateY(-3px) scale(1.02)' : 'none',
            boxShadow: hovering ? '0 10px 40px rgba(108,99,255,0.5)' : '0 4px 15px rgba(108,99,255,0.3)',
            width: '100%',
            maxWidth: 280
          }}
        >
          Start Consultation →
        </button>

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 24 }}>
          ⚕️ Not a substitute for professional medical advice
        </p>
      </div>

      {/* Bottom stats */}
      <div style={{
        display: 'flex', gap: 32, marginTop: 32, position: 'relative', zIndex: 1, flexWrap: 'wrap', justifyContent: 'center'
      }}>
        {[
          { num: '6', label: 'AI Models' },
          { num: '31+', label: 'Languages' },
          { num: '32', label: 'WHO Topics' },
          { num: '24/7', label: 'Available' }
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, #6C63FF, #00D4AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {s.num}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LandingPage;