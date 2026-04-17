const fs = require('fs');
let content = fs.readFileSync('src/components/ChatWindow.js', 'utf8');

// Fix: Remove desktop mode toggle - it breaks mobile
const oldToggle = `const toggleMode = () => {
    const meta = document.querySelector("meta[name=viewport]");
    if (isMobileMode) {
      meta.setAttribute("content", "width=1024");
      setIsMobileMode(false);
    } else {
      meta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content");
      setIsMobileMode(true);
    }
  };`;

const newToggle = `const toggleMode = () => {
    // Desktop mode disabled on mobile for better UX
    return;
  };`;

content = content.replace(oldToggle, newToggle);

// Remove desktop button from header
content = content.replace(
  `{isMobile && (
            <button onClick={toggleMode} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20, padding: "4px 12px",
              color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer"
            }}>
              {isMobileMode ? "🖥️ Desktop" : "📱 Mobile"}
            </button>
          )}`,
  ''
);

fs.writeFileSync('src/components/ChatWindow.js', content);
console.log('Done! Desktop mode removed from mobile');