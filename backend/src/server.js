import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

import tourRoutes from "./routes/tour.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import reviewRoutes from "./routes/review.routes.js";


import pool from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";

app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reviews", reviewRoutes);

const PORT = process.env.PORT || 8080;

// test DB
console.log("DB_USER =", process.env.DB_USER);
console.log("DB_PASSWORD =", process.env.DB_PASSWORD);
//kiểm tra kết nối DB
const [db] = await pool.query("SELECT DATABASE() as db");
console.log(db);

// gắn route
app.use("/api/tours", tourRoutes);

// test root
app.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS test");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});