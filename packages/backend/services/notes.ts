import { PrismaClient } from "@prisma/client";

export interface Note {
  title: string;
  body: string;
  color?: string | null;
}

const prisma = new PrismaClient();

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
  const existing = await prisma.note.findFirst({
    where: {
      title: { equals: title, mode: "insensitive" },
      userId,
    },
  });

  if (existing) {
    throw new Error("Note with this title already exists.");
  }

  await prisma.note.create({
    data: {
      title: capitalizeFirst(title.trim()),
      body,
      color,
      userId,
    },
  });
};

export const listNotes = async (userId: number): Promise<Note[]> => {
  const res = await prisma.note.findMany({
    where: { userId },
    select: { title: true, body: true, color: true },
  });
  return res;
};

export const readByTitle = async (
  title: string,
  userId: number
): Promise<Note | undefined> => {
  const res = await prisma.note.findFirst({
    where: {
      title: { equals: title, mode: "insensitive" },
      userId,
    },
    select: { title: true, body: true, color: true },
  });
  return res || undefined;
};

export const updateNote = async (
  title: string,
  userId: number,
  newTitle?: string,
  newBody?: string
): Promise<void> => {
  const existing = await prisma.note.findFirst({
    where: {
      title: { equals: title, mode: "insensitive" },
      userId,
    },
  });

  if (!existing) {
    throw new Error("Note not found.");
  }

  if (newTitle) {
    const duplicate = await prisma.note.findFirst({
      where: {
        title: { equals: newTitle, mode: "insensitive" },
        userId,
        NOT: { id: existing.id },
      },
    });

    if (duplicate) {
      throw new Error("Another note with this title already exists.");
    }
  }

  await prisma.note.update({
    where: { id: existing.id },
    data: {
      title: newTitle ? capitalizeFirst(newTitle.trim()) : existing.title,
      body: newBody ? capitalizeFirst(newBody.trim()) : existing.body,
    },
  });
};

export const removeFromList = async (
  title: string,
  userId: number
): Promise<void> => {
  const res = await prisma.note.deleteMany({
    where: {
      title: { equals: title, mode: "insensitive" },
      userId,
    },
  });

  if (res.count === 0) {
    throw new Error("Note not found.");
  }
};
