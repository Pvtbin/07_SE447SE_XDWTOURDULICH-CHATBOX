import { useState, useRef, useEffect } from "react";
import { sendChatMessageApi } from "../api/chatbot";

const WELCOME = {
  role: "assistant",
  content: "Xin chào! 🏮 Tôi là trợ lý ảo của Hội An Travel. Bạn muốn tìm tour nào — phố cổ, biển An Bàng, hay làng nghề truyền thống?",
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
      // Chỉ gửi role/content thật (bỏ tin chào mừng cứng để giảm token không cần thiết)
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
            width: 360,
            height: 480,
            marginBottom: 16,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, var(--river-deep), var(--river))",
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div className="flex" style={{ alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🏮</span>
              <div>
                <div style={{ color: "var(--white)", fontWeight: 700, fontSize: 15 }}>Hỏi đáp du lịch</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>Hội An Travel AI</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "var(--white)", fontSize: 20, lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16, background: "var(--paper)" }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: 14,
                    fontSize: 14,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    background: m.role === "user" ? "var(--tile)" : "var(--white)",
                    color: m.role === "user" ? "var(--white)" : "var(--ink)",
                    boxShadow: m.role === "user" ? "none" : "var(--shadow-card)",
                    borderBottomRightRadius: m.role === "user" ? 4 : 14,
                    borderBottomLeftRadius: m.role === "assistant" ? 4 : 14,
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
                <div className="text-muted" style={{ fontSize: 13, padding: "10px 14px" }}>
                  Đang soạn trả lời...
                </div>
              </div>
            )}
            {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: 12, borderTop: "1px solid var(--wall-soft)", display: "flex", gap: 8 }}>
            <textarea
              rows={1}
              placeholder="Nhập câu hỏi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                resize: "none",
                border: "1.5px solid var(--wall-soft)",
                borderRadius: 12,
                padding: "10px 14px",
                outline: "none",
                fontSize: 14,
              }}
            />
            <button
              className="btn btn-primary"
              style={{ padding: "0 18px" }}
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              Gửi
            </button>
          </div>
        </div>
      )}

      {/* Nút mở/đóng hình đèn lồng */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "none",
          background: "var(--tile)",
          boxShadow: "0 8px 24px rgba(185,78,44,0.4)",
          fontSize: 28,
          cursor: "pointer",
          float: "right",
        }}
        title="Hỏi đáp du lịch"
      >
        {open ? "✕" : "🏮"}
      </button>
    </div>
  );
}
