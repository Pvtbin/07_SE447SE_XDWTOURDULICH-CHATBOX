import bcrypt from "bcrypt";
import pool from "../config/db.js";

async function createAdmin() {
    try {
        const hash = await bcrypt.hash("123456", 10);

        await pool.query(
            `INSERT INTO users (ho_ten, email, mat_khau, vai_tro)
             VALUES (?, ?, ?, ?)`,
            ["Admin", "admin@gmail.com", hash, "admin"]
        );

        console.log("Tạo admin thành công");
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit();
    }
}

createAdmin();