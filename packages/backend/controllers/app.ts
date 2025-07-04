import {
  addNote,
  listNotes,
  readByTitle,
  removeFromList,
  updateNote,
} from "../services/notes";
import pool from "../config/db";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyToken } from "../middlewares/authMiddleware";
import bcrypt from "bcrypt";
import { findUserByUsername } from "../services/user";
import express from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
import { RequestHandler } from "express";

dotenv.config();
const app = express();
const PORT = 5000;

interface AuthReq extends Request {
  user: {
    id: number;
    username: string;
  };
}

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path === "/login") return next();
  verifyToken(req, res, next);
});

app.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await findUserByUsername(username);
    if (!user) throw new Error("Invalid credentials");
    const isHashed =
      user.password.startsWith("$2b$") || user.password.startsWith("$2a$");

    if (isHashed) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) throw new Error("Invalid credentials");
    } else {
      if (user.password !== password) throw new Error("Invalid credentials");

      const hashed = await bcrypt.hash(password, 10);
      await pool.query("UPDATE users SET password = $1 WHERE username = $2", [
        hashed,
        username,
      ]);
    }
    const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });
    res.status(200).json({ success: true, token, username: user.username });
  } catch (err) {
    res.status(401).json({ success: false, message: (err as Error).message });
  }
});

app.post("/logout", (req: Request, res: Response) => {
  const reqUser = req as AuthReq;
  console.log(`${reqUser.user?.username || "Unknown user"} requested logout.`);
  res
    .status(200)
    .json({ success: true, message: "Logout successful (client-side only)" });
});

app.get("/notes/:title?", (async (req, res) => {
  try {
    const userReq = req as AuthReq;
    const { id: userId } = userReq.user;
    const { title } = req.params as { title?: string };
    if (title) {
      const note = await readByTitle(decodeURIComponent(title), userId);
      if (!note) return res.status(404).json({ message: "Note not found" });
      return res.status(200).json(note);
    }
    const notes = await listNotes(userId);
    return res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message || "Server error" });
  }
}) as RequestHandler);

app.post("/notes", async (req, res) => {
  try {
    const userReq = req as AuthReq;
    const { title, body, color } = req.body;
    const { id: userId } = userReq.user;
    await addNote(title, body, userId, color);
    res.status(201).json({ message: "Note added" });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

app.patch("/notes/:title", async (req, res) => {
  try {
    const userReq = req as AuthReq;
    const oldTitle = decodeURIComponent(req.params.title);
    const { title: newTitle, body: newBody } = req.body;
    const { id: userId } = userReq.user;
    await updateNote(oldTitle, userId, newTitle, newBody);
    res.status(200).json({ message: "Note updated successfully" });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

app.delete("/notes/:title", async (req, res) => {
  try {
    const userReq = req as AuthReq;
    const title = decodeURIComponent(req.params.title);
    const { id: userId } = userReq.user;
    await removeFromList(title, userId);
    res.status(200).json({ message: "Note deleted" });
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
