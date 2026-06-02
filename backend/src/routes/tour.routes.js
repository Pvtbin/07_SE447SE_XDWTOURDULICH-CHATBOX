import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";
import { getTours, createTour } from "../controllers/tour.controller.js";

const router = express.Router();

// ai cũng xem được
router.get("/", getTours);

// chỉ admin mới được tạo tour
router.post("/", verifyToken, isAdmin, createTour);

export default router;