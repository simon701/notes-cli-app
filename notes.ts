import fs from "fs";
import path from "path";
import chalk from "chalk";
const notesFile = "notes.json";

const notesFilePath = path.join(__dirname, "data", "notes.json");
interface Note {
  title: string;
  body: string;
}

function loadNotes(): Note[] {
  try {
    const fileRead = fs.readFileSync(notesFilePath, "utf-8");
    return JSON.parse(fileRead);
  } catch (error) {
    return [];
  }
}

function saveNotes(notes: Note[]): void {
  fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2));
}

function capitalizeFirst(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function addNote(title: string, body: string): void {
  const notes = loadNotes();
  const lowercase = title.toLowerCase();
  const duplicateNote = notes.find(
    (note) => note.title.toLowerCase() === lowercase
  );
  if (duplicateNote) {
    console.log(chalk.red("Note already exists!"));
    return;
  }
  const updatedTitle = capitalizeFirst(title.trim());
  const updatedBody = capitalizeFirst(body.trim());
  notes.push({ title: updatedTitle, body: updatedBody });
  saveNotes(notes);
  console.log(chalk.green("Note added"));
}

export function listNotes(): Note[] {
  return loadNotes();
}

export function readByTitle(title: string): Note | undefined {
  const notes = loadNotes();
  const lowercase = title.toLowerCase();
  return notes.find((note) => note.title.toLowerCase() === lowercase);
  /*if (!note) {
    console.log(chalk.red("Note not found"));
    return;
  }
  console.log(chalk.green("Note(s) found: "));
  console.log(chalk.yellow(note.title));
  console.log(chalk.white(`   ${note.body}`));*/
}

export function removeFromList(title: string): boolean {
  const notes = loadNotes();
  const lowercase = title.toLowerCase();
  const note = notes.filter((note) => note.title.toLowerCase() !== lowercase);
  if (note.length === notes.length) {
    console.log(chalk.red("Note doesn't exist."));
    return false;
  }
  saveNotes(note);
  console.log(chalk.green("Note removed."));
  return true;
}

export function updateNote(
  title: string,
  newTitle?: string,
  newBody?: string
): boolean {
  const notes = loadNotes();

  const noteIndex = notes.findIndex(
    (note) => note.title.toLowerCase() === title.toLowerCase()
  );
  if (noteIndex === -1) return false;

  if (newTitle) notes[noteIndex].title = capitalizeFirst(newTitle.trim());
  if (newBody) notes[noteIndex].body = capitalizeFirst(newBody.trim());

  saveNotes(notes);
  return true;
}
