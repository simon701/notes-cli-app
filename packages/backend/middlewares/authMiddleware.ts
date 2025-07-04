import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import { findUserByUsername } from "../services/user";

dotenv.config();

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: number; username: string };
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization denied." });
  }

  const token = authHeader.split(" ")[1];
  const SECRET = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, SECRET!) as JwtPayload;
    const username = decoded.username;
    if (typeof username !== "string") {
      throw new Error("Invalid token payload");
    }

    const user = await findUserByUsername(username);
    if (!user) throw new Error("User not found");

    req.user = { id: user.id, username: user.username };
    next();
  } catch (err) {
    res.status(401).json({
      message:
        "Unauthorized: " +
        (err instanceof Error ? err.message : "Invalid token"),
    });
  }
};
