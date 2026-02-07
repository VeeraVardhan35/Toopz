<<<<<<< HEAD
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { DATABASE_URL, NODE_ENV } from "./env.js";

if (!DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not set");
}

console.log(`🔌 Connecting to Neon via HTTP (${NODE_ENV} mode)...`);

let sql;
export let db;

try {
  sql = neon(DATABASE_URL);
  db = drizzle(sql, {
    logger: NODE_ENV === 'development',
  });
  console.log("✅ Database connection ready");
} catch (error) {
  console.error("❌ Database connection failed:", error);
  throw error;
}
=======
import { drizzle } from "drizzle-orm/node-postgres";
import {SUPABASE_DATABASE_URL} from "../config/env.js";
import pkg from "pg";
import "dotenv/config";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: SUPABASE_DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // REQUIRED for Supabase
});

export const db = drizzle(pool);
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
