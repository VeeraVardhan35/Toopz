import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { SUPABASE_DATABASE_URL } from "./env.js";

const { Pool } = pkg;

if (!SUPABASE_DATABASE_URL) {
  throw new Error("❌ SUPABASE_DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: SUPABASE_DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase
});

export const db = drizzlePg(pool);
