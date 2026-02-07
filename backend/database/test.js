<<<<<<< HEAD
import { db } from "../config/db.js";
import { sql } from "drizzle-orm";

export const connectDB = async () => {
  try {
    await db.execute(sql`select 1`);
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};
=======

export const connectDB = async() => {
    try {
    }
    catch(error){
    }
}
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
