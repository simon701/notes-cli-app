import pool from "../config/db";

export const findUserByUsername = async (username: string) => {
  const res = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return res.rows[0] || null;
};
