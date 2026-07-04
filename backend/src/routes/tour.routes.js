import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";
import {
    getFeaturedTours,
    getTourById,
    createTour,
    updateTour,
    deleteTour
} from "../controllers/tour.controller.js";

const router = express.Router();

router.get("/", getFeaturedTours);
router.get("/:id", getTourById);

router.post("/", verifyToken, isAdmin, createTour);
router.put("/:id", verifyToken, isAdmin, updateTour);
router.delete("/:id", verifyToken, isAdmin, deleteTour);

export default router;