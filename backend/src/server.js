
import dotenv from "dotenv";
//load các biến môi trường
dotenv.config();

import app from "./app.js";
import pool,{connectDB} from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import tourRoutes from "./routes/tour.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import reviewRoutes from "./routes/review.routes.js";



const PORT = process.env.PORT || 8080;



// gắn route
app.use("/api/tours", tourRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reviews", reviewRoutes);



// khởi động server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server chạy trên cổng " + PORT);
    });
});