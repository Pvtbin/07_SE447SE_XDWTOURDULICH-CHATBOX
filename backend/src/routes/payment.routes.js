import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";
import {
    createPayment,
    verifyPayment,
    getAllPayments
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/", verifyToken, createPayment);
router.put("/:id/verify", verifyToken, isAdmin, verifyPayment);
router.get("/", verifyToken, isAdmin, getAllPayments);

export default router;