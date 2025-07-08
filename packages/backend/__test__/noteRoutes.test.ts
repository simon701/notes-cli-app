import request from "supertest";
import app from "../controllers/app";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
let token: string;
let userId: number;

const testUser = {
  username: "simon",
  password: "simon123",
};

const testNote = {
  title: "My Test Note",
  body: "This is the body of the test note.",
};

beforeAll(async () => {
  const existingUser = await prisma.user.findUnique({
    where: { username: testUser.username },
  });

  if (existingUser) {
    await prisma.note.deleteMany({ where: { userId: existingUser.id } });
    await prisma.user.delete({ where: { username: testUser.username } });
  }

  const hashedPassword = await bcrypt.hash(testUser.password, 10);
  const user = await prisma.user.create({
    data: {
      username: testUser.username,
      password: hashedPassword,
    },
  });
  userId = user.id;

  const res = await request(app).post("/login").send({
    username: testUser.username,
    password: testUser.password,
  });

  token = res.body.token;
});

afterAll(async () => {
  const user = await prisma.user.findUnique({
    where: { username: testUser.username },
  });
  if (user) {
    await prisma.note.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { username: testUser.username } });
  }
  await prisma.$disconnect();
});

describe("Note Routes", () => {
  it("should create a new note", async () => {
    const res = await request(app)
      .post("/notes")
      .set("Authorization", `Bearer ${token}`)
      .send(testNote);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/note added/i);
  });

  it("should list all notes for the authenticated user", async () => {
    await prisma.note.create({
      data: { ...testNote, userId },
    });
  
    const res = await request(app)
      .get("/notes")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].title).toBe(testNote.title);
  });

  it("should get a specific note by title", async () => {
    const res = await request(app)
      .get(`/notes/${encodeURIComponent(testNote.title)}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe(testNote.title);
    expect(res.body.body).toBe(testNote.body);
  });

  it("should return 404 for a non-existent note", async () => {
    const res = await request(app)
      .get(`/notes/${encodeURIComponent("non existent note")}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it("should update an existing note", async () => {
    const updatedNote = {
      title: "Updated Test Note",
      body: "This is the updated body.",
    };

    const res = await request(app)
      .patch(`/notes/${encodeURIComponent(testNote.title)}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedNote);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/note updated/i);

    const getRes = await request(app)
      .get(`/notes/${encodeURIComponent(updatedNote.title)}`)
      .set("Authorization", `Bearer ${token}`);
    
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.body).toBe(updatedNote.body);
  });

  it("should delete a note", async () => {
    const currentTitle = "Updated Test Note";
    const res = await request(app)
      .delete(`/notes/${encodeURIComponent(currentTitle)}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/note deleted/i);

    const getRes = await request(app)
      .get(`/notes/${encodeURIComponent(currentTitle)}`)
      .set("Authorization", `Bearer ${token}`);
    
    expect(getRes.statusCode).toBe(404);
  });
});