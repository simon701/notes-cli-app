import { Router, Request, Response, RequestHandler } from "express";
import {
  addNote,
  listNotes,
  readByTitle,
  removeFromList,
  updateNote,
} from "../services/notes";

const router = Router();

router.get("/:title?", (async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user!;
    const { title } = req.params;
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
}) as RequestHandler);;

router.post("/", async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user!;
    const { title, body, color } = req.body;
    await addNote(title, body, userId, color);
    res.status(201).json({ message: "Note added" });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

router.patch("/:title", async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user!;
    const oldTitle = decodeURIComponent(req.params.title);
    const { title: newTitle, body: newBody } = req.body;
    await updateNote(oldTitle, userId, newTitle, newBody);
    res.status(200).json({ message: "Note updated successfully" });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

router.delete("/:title", async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user!;
    const title = decodeURIComponent(req.params.title);
    await removeFromList(title, userId);
    res.status(200).json({ message: "Note deleted" });
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

export default router;
