<<<<<<< HEAD
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const envFile = process.env.NODE_ENV === "production" ? ".env.production.local" : ".env.development.local";
config({ path: envFile });

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error("❌ DATABASE_URL not found. Check your .env file.");
}

export default defineConfig({
  schema: "./database/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  },
  verbose: true,
  strict: true,
});
=======
import "dotenv/config";
import {SUPABASE_DATABASE_URL} from "./config/env.js";

/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./database/schema.js",
    out: "drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: SUPABASE_DATABASE_URL,
    },
};
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
