import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple PrismaClient instances in dev
  // (Next.js hot reload can create many instances)
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
    log: ["error", "warn"], // optional
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
