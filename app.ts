import http from "http";
import {
  addNote,
  listNotes,
  readByTitle,
  removeFromList,
  updateNote,
} from "./notes";
import { getRequest } from "./utils";

const server = http.createServer(async (req, res) => {
  const url = req.url || "";
  const method = req.method || "";

  switch (method) {
    case "GET":
      if (url === "/notes") {
        const notes = listNotes();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(notes));
      } else if (url.startsWith("/notes/")) {
        const title = decodeURIComponent(url.split("/notes/")[1]);
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
        res.end(JSON.stringify({ message: "Route not found" }));
      }
      break;

    case "POST":
      if (url === "/notes") {
        try {
          const { title, body } = await getRequest(req);
          addNote(title, body);
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Note added" }));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Invalid JSON body" }));
        }
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
      }
      break;

    case "PATCH":
      if (url.startsWith("/notes/")) {
        try {
          const oldTitle = decodeURIComponent(url.split("/notes/")[1]);
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
          res.end(
            JSON.stringify({ message: "Invalid JSON or malformed request" })
          );
        }
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
      }
      break;

    case "DELETE":
      if (url.startsWith("/notes/")) {
        const title = decodeURIComponent(url.split("/notes/")[1]);
        const success = removeFromList(title);
        if (success) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Note deleted" }));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Note not found" }));
        }
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
      }
      break;

    default:
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Method not allowed" }));
      break;
  }
});

server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
