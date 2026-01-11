import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;                   //Pool manages multiple DB connections efficiently

console.log("DB_PASSWORD value:", process.env.DB_PASSWORD);
console.log("DB_PASSWORD type:", typeof process.env.DB_PASSWORD);

const pool = new Pool({                 //Creates a reusable DB connection pool.
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
});

export default pool;
