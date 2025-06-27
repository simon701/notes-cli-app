import { readFileSync } from "fs";
import path from "path";
import pool from "../config/db";

async function initDb() {
  try {
    const sqlPath = path.resolve(__dirname, "../db/init.sql");
    const sql = readFileSync(sqlPath, "utf-8");
    await pool.query(sql);
    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();
