import express from "express";
import {
    login,
    register,
    logout,
    getMe
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.get("/me", verifyToken, getMe); // <-- route bị thiếu gây 404

export default router;