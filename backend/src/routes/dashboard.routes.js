import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";
import { getDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getDashboard);

export default router;