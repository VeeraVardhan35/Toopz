import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { DATABASE_URL, NODE_ENV, SUPABASE_DATABASE_URL } from "./env.js";

const { Pool } = pkg;

let db;

if (SUPABASE_DATABASE_URL) {
  const pool = new Pool({
    connectionString: SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  db = drizzlePg(pool);
} else {
  if (!DATABASE_URL) {
    throw new Error("❌ DATABASE_URL is not set");
  }

  console.log(`🔌 Connecting to Neon via HTTP (${NODE_ENV} mode)...`);
  const sql = neon(DATABASE_URL);
  db = drizzleNeon(sql, {
    logger: NODE_ENV === "development",
  });
}

export { db };
