import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

export function verifyToken(req: http.IncomingMessage): string | null {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  const SECRET = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, SECRET!) as JwtPayload;
    return typeof decoded.username === "string" ? decoded.username : null;
  } catch (err) {
    if (err instanceof Error) {
      console.warn("JWT verification failed:", err.message);
    }
    return null;
  }
}
