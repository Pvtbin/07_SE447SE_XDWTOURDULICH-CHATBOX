// src/routes/tour.routes.js — BẢN ĐẦY ĐỦ, thay thế file cũ
import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";
import { uploadTourImageMulter } from "../middleware/upload.middleware.js";
import {
    getFeaturedTours,
    getTourById,
    createTour,
    updateTour,
    deleteTour,
    uploadTourImage,
    setThumbnailImage,
    deleteTourImage,
} from "../controllers/tour.controller.js";

const router = express.Router();

router.get("/", getFeaturedTours);
router.get("/:id", getTourById);

router.post("/", verifyToken, isAdmin, createTour);
router.put("/:id", verifyToken, isAdmin, updateTour);
router.delete("/:id", verifyToken, isAdmin, deleteTour);

// Ảnh tour
router.post("/:id/images", verifyToken, isAdmin, uploadTourImageMulter.single("image"), uploadTourImage);
router.put("/images/:imageId/thumbnail", verifyToken, isAdmin, setThumbnailImage);
router.delete("/images/:imageId", verifyToken, isAdmin, deleteTourImage);

export default router;