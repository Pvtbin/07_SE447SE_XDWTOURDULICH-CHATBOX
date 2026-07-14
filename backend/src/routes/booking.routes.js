import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";

import {
    createBooking,
    myBookings,
    getBookingById,
    sendInvoice,
    getAllBookings,
    updateBookingStatus,
    cancelBooking,
    getRefunds,
    processRefund
} from "../controllers/booking.controller.js";

const router = express.Router();

// User routes
router.post("/", verifyToken, createBooking);
router.get("/my", verifyToken, myBookings);

// Admin routes - MUST be before /:id routes
router.get("/", verifyToken, isAdmin, getAllBookings);
router.get("/refunds", verifyToken, isAdmin, getRefunds);
router.put("/refunds/:id", verifyToken, isAdmin, processRefund);

// Dynamic ID routes - must come AFTER specific routes
router.get("/:id", verifyToken, getBookingById);
router.post("/:id/send-invoice", verifyToken, isAdmin, sendInvoice);
router.post("/:id/cancel", verifyToken, cancelBooking);
router.put("/:id/status", verifyToken, isAdmin, updateBookingStatus);

export default router;
