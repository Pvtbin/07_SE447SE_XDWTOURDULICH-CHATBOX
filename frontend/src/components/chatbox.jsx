import { useState, useRef, useEffect } from "react";

const QUICK_REPLIES = [
  "Tours phổ biến nhất?",
  "Làm sao để đặt tour?",
  "Phương thức thanh toán?",
  "Chính sách hủy tour?",
];

const FAQ_RESPONSES = {
  "tours phổ biến nhất": "🌟 Các tour phổ biến nhất hiện tại:\n\n• Tour phố cổ Hội An - 350.000đ\n• Tour rừng dừa Bảy Mẫu - 280.000đ\n• Tour đạp xe làng nghề - 320.000đ\n• Tour thuyền sông Hoài - 500.000đ\n\nBạn muốn xem chi tiết tour nào?",
  "làm sao để đặt tour": "📝 Để đặt tour, bạn cần:\n\n1. Đăng ký tài khoản (miễn phí)\n2. Chọn tour muốn đi\n3. Nhấn nút 'Đặt tour ngay'\n4. Chọn số người và xác nhận\n5. Chọn phương thức thanh toán\n\nBạn cần tôi hỗ trợ gì thêm không?",
  "phương thức thanh toán": "💳 Chúng tôi hỗ trợ các phương thức:\n\n• Chuyển khoản ngân hàng (QR)\n• VNPay\n• MoMo\n• Tiền mặt (tại văn phòng)\n\nThanh toán an toàn và được xác nhận nhanh chóng!",
  "chính sách hủy tour": "📋 Chính sách hủy tour:\n\n• Hủy trước 7 ngày: hoàn 100%\n• Hủy trước 3-7 ngày: hoàn 50%\n• Hủy dưới 3 ngày: không hoàn tiền\n\nLiên hệ hotline để được hỗ trợ: 1900 xxx xxx",
  "xin chào": "👋 Xin chào! Tôi là trợ lý của Hội An Travel.\n\nTôi có thể giúp bạn:\n• Tìm tour phù hợp\n• Hướng dẫn đặt tour\n• Giải đáp thắc mắc\n\nBạn muốn hỗ trợ gì?",
  "hello": "👋 Xin chào! Tôi là trợ lý của Hội An Travel.\n\nTôi có thể giúp bạn:\n• Tìm tour phù hợp\n• Hướng dẫn đặt tour\n• Giải đáp thắc mắc\n\nBạn muốn hỗ trợ gì?",
};

function generateResponse(message) {
  const lowerMessage = message.toLowerCase().trim();

  // Check for exact matches
  for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }

  // Default response
  return `Cảm ơn bạn đã liên hệ! 🙏\n\nTôi hiểu bạn đang hỏi về "${message}".\n\nĐể được hỗ trợ tốt nhất, bạn có thể:\n• Gọi hotline: 1900 xxx xxx\n• Email: support@hoiantravel.vn\n• Hoặc chọn một trong các câu hỏi gợi ý bên dưới.`;
}

export default function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "👋 Xin chào! Tôi là trợ lý của Hội An Travel.\n\nBạn cần hỗ trợ gì hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { type: "user", text: userMessage }]);
    setInput("");
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const response = generateResponse(userMessage);
      setIsTyping(false);
      setMessages((prev) => [...prev, { type: "bot", text: response }]);
    }, 800 + Math.random() * 500);
  };

  const handleQuickReply = (reply) => {
    setMessages((prev) => [...prev, { type: "user", text: reply }]);
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(reply);
      setIsTyping(false);
      setMessages((prev) => [...prev, { type: "bot", text: response }]);
    }, 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbox">
      {/* Chat Window */}
      <div className={`chatbox__window ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="chatbox__header">
          <div>
            <div className="chatbox__title">Hỗ trợ trực tuyến</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Phản hồi trong vài giây</div>
          </div>
          <button className="chatbox__close" onClick={() => setIsOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="chatbox__messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chatbox__message chatbox__message--${msg.type}`}>
              {msg.text.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i < msg.text.split("\n").length - 1 && <br />}
                </span>
              ))}
            </div>
          ))}

          {isTyping && (
            <div className="chatbox__typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length <= 2 && (
          <div style={{
            padding: "8px 16px",
            background: "var(--neutral-50)",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}>
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                style={{
                  padding: "6px 12px",
                  borderRadius: 16,
                  border: "1px solid var(--neutral-300)",
                  background: "var(--white)",
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => handleQuickReply(reply)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = "1px solid var(--primary-400)";
                  e.currentTarget.style.background = "var(--primary-50)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid var(--neutral-300)";
                  e.currentTarget.style.background = "var(--white)";
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chatbox__input-container">
          <input
            type="text"
            className="chatbox__input"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="chatbox__send" onClick={handleSend} disabled={!input.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Trigger Button */}
      <button className="chatbox__trigger" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
          </svg>
        )}
      </button>
    </div>
  );
}
