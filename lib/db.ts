import { Pool } from "pg";

const globalForPg = globalThis as typeof globalThis & {
  __aiScorePgPool?: Pool;
};

export const isDatabaseConfigured = () => Boolean(process.env.DATABASE_URL);

export const getPool = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalForPg.__aiScorePgPool) {
    globalForPg.__aiScorePgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined
    });
  }

  return globalForPg.__aiScorePgPool;
};
