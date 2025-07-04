import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const findUserByUsername = async (username: string) => {
  return await prisma.user.findUnique({
    where: {
      username,
    },
  });
};
