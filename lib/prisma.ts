import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// 환경 무관하게 항상 캐싱 — 프로덕션 서버리스에서 연결 풀 고갈 방지
globalForPrisma.prisma = prisma;
