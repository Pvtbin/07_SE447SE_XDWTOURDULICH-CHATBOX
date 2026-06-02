import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";

import {
    createReview,
    getReviewsByTour
} from "../controllers/review.controller.js";

const router = express.Router();

router.post(
    "/",
    verifyToken,
    createReview
);

router.get(
    "/tour/:tourId",
    getReviewsByTour
);

export default router;