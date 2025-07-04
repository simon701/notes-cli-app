import pool from "../config/db";

export interface Note {
  title: string;
  body: string;
  color?: string;
}

function capitalizeFirst(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const addNote = async (
  title: string,
  body: string,
  userId: number,
  color?: string
): Promise<void> => {
  const existing = await pool.query(
    "SELECT * FROM notes WHERE LOWER(title)=LOWER($1) AND user_id=$2",
    [title, userId]
  );

  if (existing.rows.length > 0) {
    throw new Error("Note with this title already exists.");
  }

  await pool.query(
    "INSERT INTO notes (title, body, color, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [capitalizeFirst(title.trim()), body, color, userId]
  );
};

export const listNotes = async (userId: number): Promise<Note[]> => {
  const res = await pool.query(
    "SELECT title, body, color FROM notes WHERE user_id=$1",
    [userId]
  );
  return res.rows;
};

export const readByTitle = async (
  title: string,
  userId: number
): Promise<Note | undefined> => {
  const res = await pool.query(
    "SELECT title, body, color FROM notes WHERE LOWER(title)=LOWER($1) AND user_id=$2",
    [title, userId]
  );
  return res.rows[0];
};

export const updateNote = async (
  title: string,
  userId: number,
  newTitle?: string,
  newBody?: string
): Promise<void> => {
  const existing = await pool.query(
    "SELECT * FROM notes WHERE LOWER(title)=LOWER($1) AND user_id=$2",
    [title, userId]
  );

  if (existing.rows.length === 0) {
    throw new Error("Note not found.");
  }

  const note = existing.rows[0];

  if (newTitle) {
    const duplicate = await pool.query(
      "SELECT * FROM notes WHERE LOWER(title)=LOWER($1) AND user_id=$2 AND id<>$3",
      [newTitle, userId, note.id]
    );

    if (duplicate.rows.length > 0) {
      throw new Error("Another note with this title already exists.");
    }
  }

  const updatedTitle = newTitle ? capitalizeFirst(newTitle.trim()) : note.title;
  const updatedBody = newBody ? capitalizeFirst(newBody.trim()) : note.body;

  await pool.query("UPDATE notes SET title=$1, body=$2 WHERE id=$3", [
    updatedTitle,
    updatedBody,
    note.id,
  ]);
};

export const removeFromList = async (
  title: string,
  userId: number
): Promise<void> => {
  const res = await pool.query(
    "DELETE FROM notes WHERE LOWER(title)=LOWER($1) AND user_id=$2 RETURNING *",
    [title, userId]
  );

  if (res.rowCount === 0) {
    throw new Error("Note not found.");
  }
};
