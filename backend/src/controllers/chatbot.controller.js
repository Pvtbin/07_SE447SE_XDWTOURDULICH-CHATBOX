import pool from "../config/db.js";

/**
 * Chatbot AI nâng cấp với khả năng:
 * - Hiểu ngữ cảnh hội thoại
 * - Tìm tour linh hoạt theo địa điểm, giá, loại tour
 * - Tư vấn tour phù hợp với nhu cầu
 * - Hỗ trợ nhiều ngôn ngữ tự nhiên
 * - Cung cấp thông tin chi tiết (lịch trình, đánh giá, còn chỗ)
 */

function normalize(str) {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
}

const KEYWORDS = {
    greetings: ["chao", "hi", "hello", "alo", "xin chao", "hey", "chao ban"],
    thanks: ["cam on", "thanks", "thank you", "cam un", "thank"],
    bye: ["tam biet", "bye", "hen gap lai", "goodbye", "see you"],
    booking: ["dat tour", "cach dat", "huong dan dat", "mua tour", "book tour", "dang ky"],
    payment: ["thanh toan", "tra tien", "momo", "vnpay", "chuyen khoan", "tien mat", "quet ma", "gia tien"],
    cancel: ["huy", "hoan tien", "refund", "huy tour", "huy dat"],
    contact: ["lien he", "hotline", "so dien thoai", "email", "gap ai", "tu van"],
    tourList: ["tour nao", "co tour gi", "danh sach tour", "nhung tour", "goi y tour", "xem tour", "tat ca tour"],
    cheapest: ["re nhat", "gia thap nhat", "phu hop gia re", "tour gia re"],
    expensive: ["dat nhat", "gia cao nhat", "tour cao cap", "tour sang"],
    price: ["gia", "bao nhieu tien", "chi phi", "gia ca", "bao nhieu"],
    available: ["con cho", "het cho", "slot", "cho con", "con bao nhieu"],
    desc: ["mo ta", "chi tiet", "gioi thieu", "ve tour", "noi dung"],
    review: ["danh gia", "review", "nhan xet", "y kien", "sao"],
    schedule: ["lich trinh", "trinh tu", "ngay di", "khoi hanh", "thoi gian"],
    recommend: ["goi y", "tu van", "nen di", "chon tour", "phu hop"],
};

const LOCATION_ALIASES = {
    "pho co": ["phố cổ", "hội an", "hoi an", "old town"],
    "bien": ["biển", "an bàng", "cửa đại", "beach"],
    "lang nghe": ["làng nghề", "tranh kim bồng", "gỗ kim bồng", "làng gốm"],
    "song hoai": ["sông hoài", "thuyền", "ghe", "river"],
    "my son": ["mỹ sơn", "thánh địa", "chàm", "my son"],
    "hue": ["huế", "cố đô", "hue"],
    "da nang": ["đà nẵng", "danang", "da nang"],
};

const TOUR_CATEGORIES = {
    "van hoa": ["văn hóa", "lịch sử", "phố cổ", "di tích", "di sản"],
    "nghien cuu": ["thư giãn", "biển", "nghỉ dưỡng", "resort"],
    "thien nhien": ["thiên nhiên", "rừng", "sinh thái", "hòa nhã"],
    "amaetur": ["trải nghiệm", "thủ công", "làng nghề", "workshop"],
};

// Pre-defined helpful responses
const SMART_RESPONSES = {
    booking: `Đặt tour cực dễ! 🎯

1. Chọn tour trên trang chủ hoặc hỏi tôi để tìm tour phù hợp
2. Bấm vào tour → Xem chi tiết → Nhập số người
3. Bấm "Đặt tour ngay"
4. Chọn phương thức thanh toán (QR/MoMo/VNPay/Tiền mặt)

Bạn cần tôi tìm tour nào không?`,

    payment: `Chúng tôi hỗ trợ 4 phương thức:

💳 **Chuyển khoản QR** - Quét mã VietQR, nhận ngay xác nhận
📱 **MoMo** - Thanh toán qua ví MoMo, tiện lợi nhanh chóng
🏢 **VNPay** - Cổng thanh toán VNPay, bảo mật cao
💵 **Tiền mặt** - Thanh toán tại văn phòng hoặc khi khởi hành

Mọi giao dịch đều được ghi nhận trong "Tour của tôi". Bạn cần hỗ trợ gì thêm?`,

    cancel: `Chính sách hủy/hoàn tiền:

Để hủy tour, bạn vào mục **"Tour của tôi"** → chọn đơn cần hủy → bấm "Hủy tour".

Admin sẽ xem xét và hoàntien trong vòng 3-5 ngày làm việc.

Bạn cần hủy đơn nào không? Hãy cung cấp mã đơn.`,

    contact: `Liên hệ Hội An Travel:

📞 Hotline: 0900-000-000
📧 Email: support@hoiantravel.vn
📍 Địa chỉ: 123 đường Nguyễn Huệ, Hội An
⏰ Giờ làm việc: 8h00 - 20h00

Bạn cũng có thể chat với admin ngay tại đây!`,

    schedule: `Về lịch trình tour:

Sau khi đặt tour thành công, bạn sẽ nhận được email với lịch trình chi tiết bao gồm:
- Điểm tập trung & giờ khởi hành
- Các điểm tham quan theo ngày
- Bữa ăn & lưu trú
- Lưu ý quan trọng

Bạn cần tôi tư vấn tour nào hôm nay?`,
};

async function getTourDetails() {
    const [rows] = await pool.query(`
        SELECT t.id, t.tieu_de, t.dia_diem, t.gia, t.mo_ta, t.so_cho_con_lai, t.so_nguoi_toi_da,
               t.ngay_bat_dau, t.ngay_ket_thuc,
               (SELECT image_url FROM tour_images WHERE tour_id = t.id AND is_thumbnail = 1 LIMIT 1) as thumbnail,
               (SELECT ROUND(AVG(so_sao), 1) FROM reviews WHERE tour_id = t.id) as rating,
               (SELECT COUNT(*) FROM reviews WHERE tour_id = t.id) as review_count
        FROM tours t ORDER BY t.ngay_tao DESC
    `);
    return rows;
}

async function getTourById(id) {
    const [rows] = await pool.query("SELECT * FROM tours WHERE id = ?", [id]);
    return rows[0];
}

function formatTourCard(t, includeDesc = false) {
    const days = t.ngay_ket_thuc && t.ngay_bat_dau
        ? Math.ceil((new Date(t.ngay_ket_thuc) - new Date(t.ngay_bat_dau)) / (1000 * 60 * 60 * 24)) + 1
        : null;
    const rating = t.rating ? `⭐ ${t.rating}` : "Chưa có đánh giá";
    let text = `**${t.tieu_de}**\n📍 ${t.dia_diem}\n💰 ${Number(t.gia).toLocaleString("vi-VN")}đ/người`;
    if (days) text += `\n📅 ${days} ngày`;
    text += `\n🎫 Còn ${t.so_cho_con_lai} chỗ | ${rating}`;
    if (includeDesc && t.mo_ta) text += `\n📝 ${t.mo_ta.substring(0, 100)}...`;
    return text;
}

function extractAmount(str) {
    const trieuMatch = str.match(/(\d+(?:[.,]\d+)?)\s*(?:trieu|tr)/i);
    if (trieuMatch) return parseFloat(trieuMatch[1].replace(",", ".")) * 1_000_000;
    const nghinMatch = str.match(/(\d+)\s*(?:nghin|k|ng)/i);
    if (nghinMatch) return parseFloat(nghinMatch[1]) * 1_000;
    const numberMatch = str.match(/(\d{5,})/);
    if (numberMatch) return parseFloat(numberMatch[1]);
    return null;
}

function matchLocation(norm) {
    for (const [key, aliases] of Object.entries(LOCATION_ALIASES)) {
        if (aliases.some(a => norm.includes(normalize(a)))) return key;
    }
    return null;
}

function matchCategory(norm) {
    for (const [key, keywords] of Object.entries(TOUR_CATEGORIES)) {
        if (keywords.some(k => norm.includes(normalize(k)))) return key;
    }
    return null;
}

export const sendMessage = async (req, res) => {
    try {
        const { messages } = req.body;
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ message: "Thiếu nội dung tin nhắn" });
        }

        const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
        if (!lastUserMessage) return res.status(400).json({ message: "Không có tin nhắn" });

        const raw = lastUserMessage.content;
        const norm = normalize(raw);

        // 1. Greetings
        if (KEYWORDS.greetings.some(k => norm.includes(k))) {
            return res.json({ reply: `Chào bạn! 👋 Tôi là trợ lý AI của Hội An Travel.

Tôi có thể giúp bạn:
- Tìm tour theo địa điểm (phố cổ, biển, làng nghề...)
- Tìm tour theo giá (dưới 1 triệu, từ 500k-1 triệu...)
- Tìm tour rẻ nhất / cao cấp nhất
- Tư vấn tour phù hợp với bạn
- Hướng dẫn đặt tour & thanh toán

Bạn muốn tìm tour nào hôm nay?` });
        }

        // 2. Thanks
        if (KEYWORDS.thanks.some(k => norm.includes(k))) {
            const replies = [
                "Không có gì! Chúc bạn có chuyến đi thật vui! 🎉",
                "Rất vui được giúp bạn! Hẹn gặp ở Hội An nhé! 🏮",
                "Cảm ơn bạn! Hy vọng bạn sẽ có trải nghiệm tuyệt vời! ✨",
            ];
            return res.json({ reply: replies[Math.floor(Math.random() * replies.length)] });
        }

        // 3. Bye
        if (KEYWORDS.bye.some(k => norm.includes(k))) {
            return res.json({ reply: "Tạm biệt! Chúc bạn một ngày tốt lành! Hẹn gặp lại nhé! 👋🏮" });
        }

        // 4. Booking help
        if (KEYWORDS.booking.some(k => norm.includes(k))) {
            return res.json({ reply: SMART_RESPONSES.booking });
        }

        // 5. Payment help
        if (KEYWORDS.payment.some(k => norm.includes(k))) {
            return res.json({ reply: SMART_RESPONSES.payment });
        }

        // 6. Cancel help
        if (KEYWORDS.cancel.some(k => norm.includes(k))) {
            return res.json({ reply: SMART_RESPONSES.cancel });
        }

        // 7. Contact
        if (KEYWORDS.contact.some(k => norm.includes(k))) {
            return res.json({ reply: SMART_RESPONSES.contact });
        }

        // 8. Schedule
        if (KEYWORDS.schedule.some(k => norm.includes(k))) {
            return res.json({ reply: SMART_RESPONSES.schedule });
        }

        // Get all tours from DB
        const tours = await getTourDetails();
        if (tours.length === 0) {
            return res.json({ reply: "Hiện hệ thống chưa có tour nào. Bạn quay lại sau nhé!" });
        }

        // 9. Tour list
        if (KEYWORDS.tourList.some(k => norm.includes(k))) {
            const sorted = tours.sort((a, b) => b.rating - a.rating || b.review_count - a.review_count).slice(0, 5);
            const list = sorted.map(t => formatTourCard(t)).join("\n\n");
            return res.json({ reply: `Các tour nổi bật hiện có:\n\n${list}\n\nBạn muốn xem chi tiết tour nào?` });
        }

        // 10. Cheapest tour
        if (KEYWORDS.cheapest.some(k => norm.includes(k))) {
            const sorted = [...tours].sort((a, b) => a.gia - b.gia);
            const cheapest = sorted[0];
            return res.json({
                reply: `Tour giá tốt nhất:\n\n${formatTourCard(cheapest, true)}\n\nBạn muốn đặt tour này không?`,
            });
        }

        // 11. Most expensive/premium
        if (KEYWORDS.expensive.some(k => norm.includes(k))) {
            const sorted = [...tours].sort((a, b) => b.gia - a.gia);
            const premium = sorted[0];
            return res.json({
                reply: `Tour cao cấp nhất:\n\n${formatTourCard(premium, true)}\n\nBạn muốn xem chi tiết không?`,
            });
        }

        // 12. Price range filter
        const amount = extractAmount(norm);
        if (amount) {
            let matched = [];
            if (norm.includes("duoi") || norm.includes("thap hon")) {
                matched = tours.filter(t => t.gia <= amount);
            } else if (norm.includes("tren") || norm.includes("cao hon")) {
                matched = tours.filter(t => t.gia >= amount);
            } else if (norm.includes("den") || norm.includes("khoang") || norm.includes("-")) {
                matched = tours.filter(t => t.gia >= amount * 0.7 && t.gia <= amount * 1.3);
            }

            if (matched.length > 0) {
                const sorted = matched.sort((a, b) => a.gia - b.gia).slice(0, 4);
                const list = sorted.map(t => formatTourCard(t)).join("\n\n");
                return res.json({ reply: `Tìm thấy ${matched.length} tour phù hợp:\n\n${list}` });
            }
        }

        // 13. Location-based search
        const locationKey = matchLocation(norm);
        if (locationKey) {
            const aliases = LOCATION_ALIASES[locationKey];
            const matched = tours.filter(t =>
                aliases.some(a => normalize(t.dia_diem).includes(normalize(a)) || normalize(t.tieu_de).includes(normalize(a)))
            );

            if (matched.length > 0) {
                const list = matched.slice(0, 4).map(t => formatTourCard(t)).join("\n\n");
                return res.json({ reply: `Tìm thấy ${matched.length} tour tại ${LOCATION_ALIASES[locationKey][0]}:\n\n${list}` });
            }
        }

        // 14. Recommendation based on category/mood
        if (KEYWORDS.recommend.some(k => norm.includes(k))) {
            const topRated = tours.filter(t => t.rating >= 4).sort((a, b) => b.rating - a.rating).slice(0, 3);
            if (topRated.length > 0) {
                const list = topRated.map(t => formatTourCard(t, true)).join("\n\n");
                return res.json({ reply: `Gợi ý tour được khách hàng yêu thích:\n\n${list}\n\nBạn thích tour nào?` });
            }
        }

        // 15. Search by specific tour name or location
        const matched = tours.filter(t =>
            norm.includes(normalize(t.tieu_de)) ||
            normalize(t.tieu_de).includes(norm) ||
            norm.includes(normalize(t.dia_diem)) ||
            normalize(t.dia_diem).includes(norm)
        );

        if (matched.length === 1) {
            const t = matched[0];

            if (KEYWORDS.price.some(k => norm.includes(k))) {
                return res.json({ reply: `Tour "${t.tieu_de}" có giá **${Number(t.gia).toLocaleString("vi-VN")}đ**/người.\n\nBạn muốn đặt không?` });
            }

            if (KEYWORDS.available.some(k => norm.includes(k))) {
                const status = t.so_cho_con_lai > 0 ? `còn ${t.so_cho_con_lai} chỗ` : "đã hết chỗ";
                return res.json({ reply: `Tour "${t.tieu_de}" hiện ${status} (tối đa ${t.so_nguoi_toi_da} người).` });
            }

            if (KEYWORDS.desc.some(k => norm.includes(k))) {
                return res.json({ reply: `${t.tieu_de}\n\n${t.mo_ta || "Chưa có mô tả chi tiết."}\n\nGiá: ${Number(t.gia).toLocaleString("vi-VN")}đ/người` });
            }

            if (KEYWORDS.review.some(k => norm.includes(k))) {
                const revInfo = t.rating ? `⭐ ${t.rating}/5 (${t.review_count} đánh giá)` : "Chưa có đánh giá";
                return res.json({ reply: `${t.tieu_de}\n\n${revInfo}\n\nBạn muốn viết đánh giá cho tour này không?` });
            }

            return res.json({ reply: `${formatTourCard(t, true)}\n\nBạn muốn đặt tour này không?` });
        }

        if (matched.length > 1 && matched.length <= 5) {
            const list = matched.map(t => formatTourCard(t)).join("\n\n");
            return res.json({ reply: `Tìm thấy ${matched.length} tour phù hợp:\n\n${list}` });
        }

        if (matched.length > 5) {
            const list = matched.slice(0, 4).map(t => formatTourCard(t)).join("\n\n");
            return res.json({ reply: `Tìm thấy ${matched.length} tour. Hiển thị 4 tour hàng đầu:\n\n${list}\n\nBạn muốn xem thêm không?` });
        }

        // Fallback
        return res.json({ reply: `Xin lỗi, tôi chưa hiểu câu hỏi của bạn. 🤔

Bạn có thể hỏi tôi về:
- **Tìm tour**: "tour phố cổ", "tour biển", "tour dưới 1 triệu"
- **Giá cả**: "tour rẻ nhất", "giá tour X"
- **Hỗ trợ**: "cách đặt tour", "thanh toán", "hủy tour"
- **Liên hệ**: "hotline", "email"

Hoặc nhập tên tour/địa điểm cụ thể nhé!` });

    } catch (error) {
        console.error("Chatbot error:", error);
        res.status(500).json({ message: "Lỗi hệ thống, vui lòng thử lại" });
    }
};
