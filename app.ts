import http from "http";
import {
  addNote,
  listNotes,
  readByTitle,
  removeFromList,
  updateNote,
} from "./notes";
import { getRequest } from "./utils";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { JwtPayload } from "jsonwebtoken";

dotenv.config();
interface User {
  username: string;
  password: string;
}

const usersPath = path.join(__dirname, "users.json");

function verifyToken(req: http.IncomingMessage): string | null {
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

const server = http.createServer(async (req, res) => {
  const url = req.url || "";
  const method = req.method || "";

  res.setHeader("Access-Control-Allow-Origin", "*");
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

  const notesRoute = url.startsWith("/notes");

  switch (method) {
    case "GET":
      if (notesRoute) {
        const username = verifyToken(req);
        if (!username) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Unauthorized" }));
          return;
        }

        const parts = url.split("/");
        if (parts.length === 2) {
          const notes = listNotes();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(notes));
        } else if (parts.length === 3) {
          const title = decodeURIComponent(parts[2]);
          const note = readByTitle(title);
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
          const users = JSON.parse(
            fs.readFileSync(usersPath, "utf-8")
          ) as User[];
          const user = users.find(
            (u) => u.username === username && u.password === password
          );

          if (user) {
            const SECRET = process.env.JWT_SECRET;
            const token = jwt.sign({ username }, SECRET!, { expiresIn: "15m" });
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, token }));
          } else {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, message: "Invalid credentials" })
            );
          }
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: "Bad request" }));
        }
        return;
      }

      if (url === "/logout") {
        const username = verifyToken(req);
        console.log(`${username || "Unknown user"} requested logout.`);
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
        const username = verifyToken(req);
        if (!username) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Unauthorized" }));
          return;
        }

        try {
          const { title, body, color } = await getRequest(req);
          addNote(title, body, color);
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Note added" }));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Invalid JSON body" }));
        }
        return;
      }
      break;

    case "PATCH":
      if (notesRoute) {
        const username = verifyToken(req);
        if (!username) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Unauthorized" }));
          return;
        }

        const parts = url.split("/");
        if (parts.length === 3) {
          const oldTitle = decodeURIComponent(parts[2]);
          try {
            const { title: newTitle, body: newBody } = await getRequest(req);
            const updated = updateNote(oldTitle, newTitle, newBody);
            if (updated) {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ message: "Note updated successfully" }));
            } else {
              res.writeHead(404, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ message: "Note not found" }));
            }
          } catch {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Invalid request body" }));
          }
          return;
        }
      }
      break;

    case "DELETE":
      if (notesRoute) {
        const username = verifyToken(req);
        if (!username) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Unauthorized" }));
          return;
        }

        const parts = url.split("/");
        if (parts.length === 3) {
          const title = decodeURIComponent(parts[2]);
          const success = removeFromList(title);
          if (success) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Note deleted" }));
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Note not found" }));
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
