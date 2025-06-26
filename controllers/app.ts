import http from "http";
import {
  addNote,
  listNotes,
  readByTitle,
  removeFromList,
  updateNote,
} from "../services/notes";
import { getRequest } from "../utils/utils";
import pool from "../config/db";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyToken } from "../middlewares/authMiddleware";
import bcrypt from "bcrypt";
import { findUserByUsername } from "../services/user";

dotenv.config();

declare module "http" {
  interface IncomingMessage {
    user?: { id: number; username: string };
  }
}

const server = http.createServer(async (req, res) => {
  const url = req.url || "";
  const method = req.method || "";

  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    if (url !== "/login") {
      await verifyToken(req); // middleware attaches req.user or throws
    }
  } catch (err) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: (err as Error).message }));
    return;
  }

  const notesRoute = url.startsWith("/notes");

  switch (method) {
    case "GET":
      if (notesRoute) {
        const parts = url.split("/");
        const userId = req.user!.id;

        if (parts.length === 2) {
          const notes = await listNotes(userId);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(notes));
        } else if (parts.length === 3) {
          const title = decodeURIComponent(parts[2]);
          const note = await readByTitle(title, userId);
          if (note) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(note));
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Note not found" }));
          }
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Invalid route" }));
        }
        return;
      }
      break;

    case "POST":
      if (url === "/login") {
        try {
          const { username, password } = await getRequest(req);
          const user = await findUserByUsername(username);

          if (user) {
            const isHashed =
              user.password.startsWith("$2b$") ||
              user.password.startsWith("$2a$");

            if (isHashed) {
              const match = await bcrypt.compare(password, user.password);
              if (!match) throw new Error("Invalid credentials");
            } else {
              if (user.password !== password)
                throw new Error("Invalid credentials");

              const hashed = await bcrypt.hash(password, 10);
              await pool.query(
                "UPDATE users SET password = $1 WHERE username = $2",
                [hashed, username]
              );
            }

            const SECRET = process.env.JWT_SECRET!;
            const token = jwt.sign({ username }, SECRET, { expiresIn: "15m" });

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, token }));
          } else {
            throw new Error("Invalid credentials");
          }
        } catch (err) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              message: (err as Error).message || "Bad request",
            })
          );
        }
        return;
      }

      if (url === "/logout") {
        console.log(
          `${req.user?.username || "Unknown user"} requested logout.`
        );
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Logout successful (client-side only)",
          })
        );
        return;
      }

      if (notesRoute) {
        try {
          const { title, body, color } = await getRequest(req);
          await addNote(title, body, req.user!.id, color);
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Note added" }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Invalid JSON body" }));
        }
        return;
      }
      break;

    case "PATCH":
      if (notesRoute) {
        const parts = url.split("/");
        if (parts.length === 3) {
          const oldTitle = decodeURIComponent(parts[2]);
          try {
            const { title: newTitle, body: newBody } = await getRequest(req);
            await updateNote(oldTitle, req.user!.id, newTitle, newBody);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Note updated successfully" }));
          } catch (err) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: (err as Error).message }));
          }
          return;
        }
      }
      break;

    case "DELETE":
      if (notesRoute) {
        const parts = url.split("/");
        if (parts.length === 3) {
          const title = decodeURIComponent(parts[2]);
          try {
            await removeFromList(title, req.user!.id);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Note deleted" }));
          } catch (err) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: (err as Error).message }));
          }
          return;
        }
      }
      break;

    default:
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Method not allowed" }));
      return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Route not found" }));
});

server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
