import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import http from "http";
import dotenv from "dotenv";
import { findUserByUsername } from "../services/user";

dotenv.config();

declare module "http" {
  interface IncomingMessage {
    user?: { id: number; username: string };
  }
}

export const verifyToken = async (req: http.IncomingMessage): Promise<void> => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authorization denied.");
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
  } catch (err) {
    throw new Error(
      "Unauthorized: " + (err instanceof Error ? err.message : "Invalid token")
    );
  }
};
