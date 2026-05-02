import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/prisma/client/client";

const globalForPrisma = globalThis;

const databaseUrl =
    process.env.TURSO_DATABASE_URL ||
    process.env.DATABASE_URL ||
    "file:./dev.db";

const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter: new PrismaLibSql({
            url: databaseUrl,
            authToken: process.env.TURSO_AUTH_TOKEN,
        }),
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;