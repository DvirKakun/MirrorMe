import React, { useState, useRef, useEffect } from "react";

const BACKEND_URL = "http://localhost:8000/chat";
const REVERSE_API = "https://api.bigdatacloud.net/data/reverse-geocode-client";

export default function App() {
  // chat messages state
  const [messages, setMessages] = useState([]);
  // input box state
  const [input, setInput] = useState("");
  // session persistence
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem("sessionId");
  });

  // const [location, setLocation] = useState({ lat: null, lon: null });
  const [city, setCity] = useState(null);

  const messagesEndRef = useRef(null);

  // scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // on first load, if no sessionId, get one by sending empty message
  useEffect(() => {
    if (!sessionId) {
      fetch("http://localhost:8000/session", { method: "POST" })
        .then((r) => r.json())
        .then((data) => {
          setSessionId(data.session_id);
          localStorage.setItem("sessionId", data.session_id);
        });
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lon = pos.coords.longitude.toFixed(5);
        try {
          const url = `${REVERSE_API}?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
          const res = await fetch(url);
          const data = await res.json();

          // BigDataCloud returns city or locality
          setCity(
            data.city || data.locality || data.principalSubdivision || null
          );
        } catch (err) {
          console.warn("Reverse geocode failed:", err);
        }
      },
      (err) => console.warn("Geolocation error:", err),
      { timeout: 5000 }
    );
  }, []);

  // send a user message
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    // append user message
    setMessages((msgs) => [...msgs, { role: "user", content: userText }]);
    setInput("");
    // send to backend
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        user_message: userText,
        location: city,
      }),
    });
    const data = await res.json();
    // append bot reply
    setMessages((msgs) => [
      ...msgs,
      { role: "assistant", content: data.reply },
    ]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">MirrorMe Support</div>
      <div className="chatbot-messages">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`message ${m.role === "assistant" ? "bot" : "user"}`}
          >
            {m.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
