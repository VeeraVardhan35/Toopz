import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import {DB_HOST, DB_NAME, DB_USER, DB_PORT, DB_PASSWORD} from "./env.js";

const pool = new Pool({
    host : DB_HOST,
    port : DB_PORT,
    user : DB_USER,
    password : DB_PASSWORD,
    database : DB_NAME,
    ssl : false
});

export const db = drizzle(pool);