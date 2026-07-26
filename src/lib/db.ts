import { PrismaClient } from "@prisma/client";

// Prevents creating a new PrismaClient on every hot-reload in Next.js dev
// mode, which would otherwise exhaust the database's connection pool.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}