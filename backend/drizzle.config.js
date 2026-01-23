import "dotenv/config";
import {DATABASE_URL} from "./config/env.js";

/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./database/schema.js",
    out: "drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: DATABASE_URL,
    },
};
