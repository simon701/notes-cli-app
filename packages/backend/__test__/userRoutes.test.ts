import request from "supertest";
import app from "../controllers/app";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

describe("User Routes", () => {
  const testUser = {
    username: "simon",
    password: "simon123",
  };

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { username: testUser.username } });
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await prisma.user.create({
      data: {
        username: testUser.username,
        password: hashedPassword,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { username: testUser.username } });
    await prisma.$disconnect();
  });

  describe("POST /login", () => {
    it("should return 200 and valid credentials", async () => {
      const res = await request(app).post("/login").send({
        username: testUser.username,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("username", testUser.username);
    });

    it("should return 401 for incorrect password", async () => {
      const res = await request(app).post("/login").send({
        username: testUser.username,
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid/i);
    });
  });

  describe("POST /logout", () => {
    it("should return 200 and success message", async () => {
      const loginRes = await request(app).post("/login").send({
        username: testUser.username,
        password: testUser.password,
      });

      const token = loginRes.body.token;
      expect(token).toBeDefined();
      const res = await request(app)
        .post("/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/logout successful/i);
    });
  });
});
