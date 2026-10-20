import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function main() {
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!password) {
    throw new Error("Falta la variable ADMIN_INITIAL_PASSWORD en backend/.env");
  }

  const pool = new Pool({
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.DB_PORT ?? "5432", 10),
    user: process.env.DB_USER ?? "trazabilidad",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE ?? "trazabilidad",
    ssl: false,
  });

  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO users (id, username, email, password_hash, role, is_active)
     VALUES (gen_random_uuid(), $1, $2, $3, 'admin', true)
     ON CONFLICT (username) DO UPDATE SET password_hash = $3`,
    ["admin", "admin@empresa.com", hash]
  );

  console.log("✅ Usuario admin creado (username: admin). Credencial en ADMIN_INITIAL_PASSWORD (backend/.env)");
  await pool.end();
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
