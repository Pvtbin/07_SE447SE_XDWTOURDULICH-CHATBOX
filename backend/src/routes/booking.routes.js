import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";

import {
    createBooking,
    myBookings,
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
router.post("/:id/cancel", verifyToken, cancelBooking);

// Admin routes
router.get("/", verifyToken, isAdmin, getAllBookings);
router.put("/:id/status", verifyToken, isAdmin, updateBookingStatus);
router.get("/refunds", verifyToken, isAdmin, getRefunds);
router.put("/refunds/:id", verifyToken, isAdmin, processRefund);

export default router;
