import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

//hàm kiểm tra kết nối DB
export const connectDB = async () => {
    try {
        await pool.getConnection();
        console.log("Kết nối đến cơ sở dữ liệu thành công");
    } catch (error) {
        console.error("Lỗi kết nối đến cơ sở dữ liệu:", error);
    }
};

// // test DB
// console.log("DB_USER =", process.env.DB_USER);
// console.log("DB_PASSWORD =", process.env.DB_PASSWORD);


export default pool;