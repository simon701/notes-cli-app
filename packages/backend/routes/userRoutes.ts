import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
//import pool from "../config/db";
import { findUserByUsername } from "../services/user";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await findUserByUsername(username);
    if (!user) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid credentials");

    const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });

    res.status(200).json({ success: true, token, username: user.username });
  } catch (err) {
    res.status(401).json({ success: false, message: (err as Error).message });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  const user = req.user as { username?: string };
  console.log(`${user?.username || "Unknown user"} requested logout.`);
  res.status(200).json({
    success: true,
    message: "Logout successful (client-side only)",
  });
});

export default router;
