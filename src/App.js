import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import PatientPanel from "./components/PatientPanel";
import "./App.css";
import LandingPage from "./LandingPage";

function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hello! I'm MediBot, your AI Medical Assistant. Please describe your symptoms and I will help you understand what might be going on. Remember, I am here to assist — not replace a real doctor!" }
  ]);
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState({ name: "", age: "", gender: "" });
  const [severity, setSeverity] = useState("normal");
  const [started, setStarted] = useState(false);
  const [activeNav, setActiveNav] = useState("New Consultation");
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Reliable mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sendMessage = async (input) => {
    if (!input.trim() || loading) return;
    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("https://medibot-backend-neuz.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, patient }),
      });
      const data = await response.json();
      const reply = data.reply || "Sorry, something went wrong.";
      if (reply.includes("EMERGENCY") || reply.includes("emergency") || reply.includes("112")) {
        setSeverity("critical");
      } else if (reply.includes("doctor") || reply.includes("clinic")) {
        setSeverity("moderate");
      } else {
        setSeverity("normal");
      }
      setMessages([...updatedMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...updatedMessages, { role: "assistant", content: "⚠️ Connection error. Make sure backend is running!" }]);
    }
    setLoading(false);
  };

  const handleNav = (label) => {
    setActiveNav(label);
    if (label === "New Consultation") {
      setMessages([{ role: "assistant", content: "👋 Hello! I'm MediBot, your AI Medical Assistant. Please describe your symptoms and I will help you understand what might be going on. Remember, I am here to assist — not replace a real doctor!" }]);
      setSeverity("normal");
    } else if (label === "Emergency") {
      sendMessage("I have a medical emergency, please help!");
    } else if (label === "Symptom Checker") {
      sendMessage("I want to check my symptoms. Can you guide me?");
    } else if (label === "Medications") {
      sendMessage("I want to know about my medications and drug interactions.");
    }
  };

  const handleSymptom = (symptom) => {
    const clean = symptom.replace(/[^\w\s]/g, "").trim();
    sendMessage(`I have ${clean}`);
  };

  if (!started) {
    return <LandingPage onStart={() => setStarted(true)} />;
  }

  return (
    <div className="app-container">
      {/* ✅ Hide sidebar on ALL mobile/android devices */}
    {!isMobile && <Sidebar onNav={handleNav} onSymptom={handleSymptom} activeNav={activeNav} onSymptomForm={sendMessage} />}
      <ChatWindow messages={messages} loading={loading} onSend={sendMessage} severity={severity} isMobile={isMobile} />
      {/* ✅ Hide patient panel on mobile */}
      {!isMobile && <PatientPanel patient={patient} setPatient={setPatient} severity={severity} />}
    </div>
  );
}

export default App;