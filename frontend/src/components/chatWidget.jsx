import { useState, useRef, useEffect } from "react";
import { sendChatMessageApi } from "../api/chatbot";

const WELCOME = {
  role: "assistant",
  content: "Xin chào! 👋 Tôi là trợ lý AI của Hội An Travel. Bạn muốn tìm tour nào — phố cổ, biển An Bàng, hay làng nghề truyền thống?",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const res = await sendChatMessageApi(nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      setError(err.response?.data?.message || "Không gửi được tin nhắn, thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 100 }}>
      {open && (
        <div
          className="card"
          style={{
            width: 380,
            height: 520,
            marginBottom: 16,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "var(--shadow-xl), var(--shadow-neon)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "var(--gradient-neon)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-md)",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
                </svg>
              </div>
              <div>
                <div style={{ color: "var(--white)", fontWeight: 700, fontSize: 16 }}>Hỏi đáp du lịch</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Hội An Travel AI</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "white",
                width: 32,
                height: 32,
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 20,
              background: "var(--ocean-mist)",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "12px 16px",
                    borderRadius: 18,
                    fontSize: 14,
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    background: m.role === "user" ? "var(--gradient-neon)" : "var(--white)",
                    color: m.role === "user" ? "var(--white)" : "var(--ink)",
                    boxShadow: m.role === "user"
                      ? "var(--shadow-neon)"
                      : "var(--shadow-md)",
                    borderBottomRightRadius: m.role === "user" ? 6 : 18,
                    borderBottomLeftRadius: m.role === "assistant" ? 6 : 18,
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
                <div
                  style={{
                    background: "var(--white)",
                    padding: "12px 16px",
                    borderRadius: 18,
                    display: "flex",
                    gap: 4,
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--neon-cyan)",
                        animation: "pulse 1s ease-in-out infinite",
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            {error && (
              <div
                style={{
                  background: "var(--danger-bg)",
                  color: "var(--danger)",
                  padding: 12,
                  borderRadius: 12,
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: 16,
              borderTop: "1px solid var(--cloud)",
              display: "flex",
              gap: 10,
              background: "var(--white)",
            }}
          >
            <input
              type="text"
              placeholder="Nhập câu hỏi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                border: "2px solid var(--cloud)",
                borderRadius: "var(--radius-full)",
                padding: "12px 18px",
                outline: "none",
                fontSize: 14,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--neon-cyan)";
                e.target.style.boxShadow = "0 0 0 4px var(--neon-cyan-glow)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--cloud)";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              className="btn btn-primary"
              style={{
                padding: "0 20px",
                minWidth: 60,
              }}
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: "none",
          background: open ? "var(--ink)" : "var(--gradient-neon)",
          boxShadow: open ? "var(--shadow-lg)" : "var(--shadow-neon-lg)",
          fontSize: open ? 24 : 26,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s var(--ease-bounce)",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
        }}
        title="Hỏi đáp du lịch"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
          </svg>
        )}
      </button>
    </div>
  );
}
