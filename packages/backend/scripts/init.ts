import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function initDb() {
  try {
    await prisma.user.createMany({
      data: [
        {
          username: "admin",
          password:
            "$2b$10$UfS6Ng/K7fXYZEpmn1vVquGI/5Jowv6p0nbZ9alsCcSMiePS5vY5q",
        },
        {
          username: "simon",
          password:
            "$2b$10$XwaET9ut.CaUFCxILM0vU.8QOzbIFBkkk3niesixOHOXTV65C2gnK",
        },
      ],
      skipDuplicates: true,
    });
    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initDb();
