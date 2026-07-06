import multer from "multer";
import path from "path";
import fs from "fs";

// Thư mục lưu ảnh vật lý — tạo sẵn nếu chưa có
const uploadDir = path.join(process.cwd(), "public", "uploads", "tours");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `tour_${req.params.id}_${Date.now()}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Chỉ chấp nhận file ảnh (jpg, png, webp...)"), false);
};

export const uploadTourImageMulter = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // giới hạn 5MB/ảnh
});
