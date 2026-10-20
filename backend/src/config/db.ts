import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbDatabase,
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("connect", () => {
  console.log("🐘 Conectado a PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Error inesperado en el pool de PostgreSQL", err);
});

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    const start = Date.now();
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    console.log(`📝 Query: ${duration}ms ${text.substring(0, 100)}`);
    return result;
  } finally {
    client.release();
  }
}

export async function getClient() {
  return pool.connect();
}