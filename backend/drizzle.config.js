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
