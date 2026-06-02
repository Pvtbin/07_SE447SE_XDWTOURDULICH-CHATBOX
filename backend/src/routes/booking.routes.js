import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";

import {
    createBooking,
    myBookings,
    getAllBookings,
    updateBookingStatus
} from "../controllers/booking.controller.js";

const router = express.Router();

// user
router.post("/", verifyToken, createBooking);
router.get("/my", verifyToken, myBookings);

// admin
router.get("/", verifyToken, isAdmin, getAllBookings);

router.put(
    "/:id/status",
    verifyToken,
    isAdmin,
    updateBookingStatus
);

export default router;