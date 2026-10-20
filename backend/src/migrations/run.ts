import fs from "fs";
import path from "path";
import { pool, getClient } from "../config/db";

const MIGRATIONS_DIR = path.resolve(__dirname, "..", "..", "migrations");

async function main() {
  const client = await getClient();
  try {
    await client.query(
      "CREATE TABLE IF NOT EXISTS _migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())"
    );
    const applied = await client.query("SELECT filename FROM _migrations");
    const appliedNames = new Set(
      applied.rows.map((row: { filename: string }) => row.filename)
    );
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (appliedNames.has(file)) {
        console.log(`Omitida (ya aplicada): ${file}`);
        continue;
      }
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      console.log(`Aplicando: ${file}`);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO _migrations (filename) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`Aplicada: ${file}`);
      } catch (err) {
        try {
          await client.query("ROLLBACK");
        } catch {
        }
        const detail = err instanceof Error ? err.message : String(err);
        throw new Error(`Error aplicando ${file}: ${detail}`);
      }
    }
    console.log("Migraciones al dia.");
  } finally {
    client.release();
  }
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error("Error en migraciones:", err);
    process.exit(1);
  });
