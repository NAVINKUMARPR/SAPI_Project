import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, "\"\"")}"`;
}

async function ensureDatabaseExists(connectionString) {
  const targetUrl = new URL(connectionString);
  const dbName = targetUrl.pathname.replace(/^\//, "");
  if (!dbName) {
    throw new Error("DATABASE_URL must include a database name");
  }

  const adminUrl = new URL(connectionString);
  adminUrl.pathname = "/postgres";

  const adminPool = new Pool({ connectionString: adminUrl.toString() });
  try {
    const exists = await adminPool.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (exists.rows.length === 0) {
      await adminPool.query(`CREATE DATABASE ${quoteIdentifier(dbName)}`);
      console.log(`Created database: ${dbName}`);
    } else {
      console.log(`Database already exists: ${dbName}`);
    }
  } finally {
    await adminPool.end();
  }
}

async function applySchema(connectionString) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const schemaPath = path.resolve(__dirname, "../../../docs/schema.sql");
  const schemaSql = await fs.readFile(schemaPath, "utf-8");

  const pool = new Pool({ connectionString });
  try {
    await pool.query(schemaSql);
    console.log("Schema applied successfully.");
  } finally {
    await pool.end();
  }
}

async function setupDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  await ensureDatabaseExists(connectionString);
  await applySchema(connectionString);
}

setupDb().catch((error) => {
  console.error("Database setup failed:", error);
  process.exitCode = 1;
});
