import dotenv from "dotenv";
import app from "./app.js";
import pool from "./config/db.js";


dotenv.config();

const PORT = process.env.PORT || 3000;

(async () => {
    try {
      const res = await pool.query("SELECT NOW()");
      console.log("Database connected at:", res.rows[0].now);
    } catch (err) {
      console.error("DB connection failed:", err.message);
    }
  })();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});