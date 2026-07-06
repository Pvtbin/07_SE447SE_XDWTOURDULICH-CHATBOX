import express from "express";
import { sendMessage } from "../controllers/chatbot.controller.js";

const router = express.Router();

// Không bắt buộc đăng nhập — khách vãng lai cũng có thể chat hỏi tour
router.post("/message", sendMessage);

export default router;