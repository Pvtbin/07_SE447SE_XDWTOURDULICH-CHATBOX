import pool from "../config/db.js";

/**
 * Chatbot rule-based nâng cấp — vẫn hoàn toàn miễn phí (không gọi API ngoài).
 * Cải tiến so với bản đầu:
 *  - Bỏ dấu tiếng Việt khi so khớp -> không phân biệt hoa/thường, có dấu/không dấu
 *  - Tìm tour theo ĐỊA ĐIỂM (không chỉ tên tour) -> trả về danh sách nếu nhiều kết quả
 *  - Hỗ trợ hỏi theo khoảng giá ("dưới 2 triệu", "trên 3 triệu")
 *  - Hỗ trợ "tour rẻ nhất" / "tour đắt nhất"
 *  - Thêm lời chào tạm biệt / cảm ơn
 */

// ---- Bỏ dấu tiếng Việt để so khớp linh hoạt hơn ----
function normalize(str) {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .trim();
}

async function getAllTours() {
    const [rows] = await pool.query(
        "SELECT tieu_de, dia_diem, gia, mo_ta, so_cho_con_lai, so_nguoi_toi_da, ngay_bat_dau FROM tours ORDER BY ngay_tao DESC"
    );
    return rows;
}

function formatTourLine(t) {
    return `• ${t.tieu_de} — ${Number(t.gia).toLocaleString("vi-VN")}đ — ${t.dia_diem} (còn ${t.so_cho_con_lai} chỗ)`;
}

function findToursByLocationOrName(normText, tours) {
    return tours.filter(
        (t) => normText.includes(normalize(t.tieu_de)) || normalize(t.tieu_de).includes(normText.trim()) ||
               normText.includes(normalize(t.dia_diem)) || normalize(t.dia_diem).includes(normText.trim())
    );
}

// Trích số tiền (triệu/nghìn/số thường) từ câu hỏi, vd "dưới 2 triệu" -> 2000000
function extractAmount(normText) {
    const trieuMatch = normText.match(/(\d+(\.\d+)?)\s*trieu/);
    if (trieuMatch) return parseFloat(trieuMatch[1]) * 1_000_000;
    const nghinMatch = normText.match(/(\d+)\s*nghin/);
    if (nghinMatch) return parseFloat(nghinMatch[1]) * 1_000;
    const soMatch = normText.match(/(\d{4,})/);
    if (soMatch) return parseFloat(soMatch[1]);
    return null;
}

const GREETINGS = ["chao", "hi", "hello", "alo", "xin chao"];
const THANKS = ["cam on", "thanks", "thank you", "cam un"];
const BYE = ["tam biet", "bye", "hen gap lai"];

const STATIC_RULES = [
    {
        keywords: ["cach dat", "dat tour nhu the nao", "lam sao de dat", "huong dan dat"],
        reply: "Để đặt tour: 1) Chọn tour bạn thích trên trang chủ 2) Bấm vào tour để xem chi tiết 3) Nhập số người và bấm 'Đặt tour ngay' 4) Chọn phương thức thanh toán ở bước tiếp theo. Vậy là xong! 🎉",
    },
    {
        keywords: ["thanh toan", "momo", "vnpay", "chuyen khoan", "tra tien", "quet ma"],
        reply: "Chúng tôi hỗ trợ 4 phương thức thanh toán: Tiền mặt (trả khi khởi hành), Chuyển khoản ngân hàng (quét mã QR), Ví MoMo, và VNPay. Bạn có thể chọn ở bước thanh toán sau khi đặt tour.",
    },
    {
        keywords: ["huy", "hoan tien", "refund"],
        reply: "Để hủy đơn đã đặt, vui lòng vào mục 'Tour của tôi' hoặc liên hệ admin qua hotline để được hỗ trợ hủy/hoàn tiền theo chính sách của từng tour.",
    },
    {
        keywords: ["lien he", "hotline", "so dien thoai", "email", "gap ai"],
        reply: "Bạn có thể liên hệ đội ngũ Hội An Travel qua hotline 0900-000-000 hoặc email support@hoiantravel.vn để được hỗ trợ trực tiếp.",
    },
];

const FALLBACK_REPLY =
    "Xin lỗi, tôi chưa hiểu câu hỏi của bạn 🙏. Bạn có thể hỏi theo các chủ đề: " +
    "tên tour hoặc địa điểm cụ thể, giá tour, tour rẻ/đắt nhất, tour dưới X triệu, cách đặt tour, hoặc phương thức thanh toán.";

export const sendMessage = async (req, res) => {
    try {
        const { messages } = req.body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ message: "Thiếu nội dung tin nhắn" });
        }

        const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
        if (!lastUserMessage) {
            return res.status(400).json({ message: "Không tìm thấy câu hỏi của người dùng" });
        }

        const raw = lastUserMessage.content;
        const norm = normalize(raw);

        // 1) Chào hỏi / cảm ơn / tạm biệt
        if (GREETINGS.some((k) => norm.includes(k))) {
            return res.json({
                reply: "Xin chào! 🏮 Tôi là trợ lý ảo của Hội An Travel. Bạn có thể hỏi tôi về: tour theo địa điểm, giá tour, tour rẻ nhất, cách đặt tour, hoặc phương thức thanh toán nhé!",
            });
        }
        if (THANKS.some((k) => norm.includes(k))) {
            return res.json({ reply: "Không có gì đâu ạ! Chúc bạn có chuyến đi Hội An thật vui 🏮" });
        }
        if (BYE.some((k) => norm.includes(k))) {
            return res.json({ reply: "Hẹn gặp lại bạn! Chúc bạn một ngày tốt lành 👋" });
        }

        // 2) Câu trả lời tĩnh (đặt tour, thanh toán, hủy, liên hệ...)
        for (const rule of STATIC_RULES) {
            if (rule.keywords.some((kw) => norm.includes(kw))) {
                return res.json({ reply: rule.reply });
            }
        }

        const tours = await getAllTours();
        if (tours.length === 0) {
            return res.json({ reply: "Hiện hệ thống chưa có tour nào, bạn quay lại sau nhé!" });
        }

        // 3) Tour rẻ nhất / đắt nhất
        if (norm.includes("re nhat") || norm.includes("gia thap nhat")) {
            const cheapest = [...tours].sort((a, b) => a.gia - b.gia)[0];
            return res.json({ reply: `Tour rẻ nhất hiện tại là "${cheapest.tieu_de}" — ${Number(cheapest.gia).toLocaleString("vi-VN")}đ/người tại ${cheapest.dia_diem}.` });
        }
        if (norm.includes("dat nhat") || norm.includes("gia cao nhat")) {
            const priciest = [...tours].sort((a, b) => b.gia - a.gia)[0];
            return res.json({ reply: `Tour cao cấp nhất hiện tại là "${priciest.tieu_de}" — ${Number(priciest.gia).toLocaleString("vi-VN")}đ/người tại ${priciest.dia_diem}.` });
        }

        // 4) Lọc theo khoảng giá: "dưới X triệu" / "trên X triệu"
        const amount = extractAmount(norm);
        if (amount && (norm.includes("duoi") || norm.includes("tren") || norm.includes("khoang"))) {
            let matched;
            if (norm.includes("duoi")) matched = tours.filter((t) => t.gia <= amount);
            else if (norm.includes("tren")) matched = tours.filter((t) => t.gia >= amount);
            else matched = tours.filter((t) => Math.abs(t.gia - amount) <= amount * 0.25);

            if (matched.length === 0) {
                return res.json({ reply: "Không tìm thấy tour phù hợp mức giá bạn hỏi. Bạn thử hỏi mức giá khác nhé!" });
            }
            const list = matched.slice(0, 6).map(formatTourLine).join("\n");
            return res.json({ reply: `Các tour phù hợp:\n${list}` });
        }

        // 5) Danh sách tour chung
        if (["tour nao", "co tour gi", "danh sach tour", "nhung tour", "goi y tour"].some((k) => norm.includes(k))) {
            const list = tours.slice(0, 8).map(formatTourLine).join("\n");
            return res.json({ reply: `Hiện có các tour sau:\n${list}\n\nBạn muốn biết thêm chi tiết tour nào không?` });
        }

        // 6) Tìm theo tên tour hoặc địa điểm được nhắc trong câu
        const matches = findToursByLocationOrName(norm, tours);

        if (matches.length === 1) {
            const t = matches[0];
            if (norm.includes("gia") || norm.includes("bao nhieu tien") || norm.includes("chi phi")) {
                return res.json({ reply: `Tour "${t.tieu_de}" có giá ${Number(t.gia).toLocaleString("vi-VN")}đ/người.` });
            }
            if (norm.includes("con cho") || norm.includes("het cho") || norm.includes("slot")) {
                return res.json({ reply: `Tour "${t.tieu_de}" hiện còn ${t.so_cho_con_lai}/${t.so_nguoi_toi_da} chỗ trống.` });
            }
            if (norm.includes("mo ta") || norm.includes("chi tiet") || norm.includes("gioi thieu")) {
                return res.json({ reply: `${t.tieu_de}: ${t.mo_ta || "Chưa có mô tả chi tiết."}` });
            }
            return res.json({
                reply: `Tour "${t.tieu_de}" tại ${t.dia_diem}, giá ${Number(t.gia).toLocaleString("vi-VN")}đ/người, còn ${t.so_cho_con_lai} chỗ. Bạn muốn đặt tour này không?`,
            });
        }

        if (matches.length > 1) {
            const list = matches.slice(0, 6).map(formatTourLine).join("\n");
            return res.json({ reply: `Tìm thấy ${matches.length} tour phù hợp:\n${list}` });
        }

        return res.json({ reply: FALLBACK_REPLY });
    } catch (error) {
        console.error("Lỗi chatbot controller:", error);
        res.status(500).json({ message: error.message });
    }
};
