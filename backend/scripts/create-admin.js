import bcrypt from "bcrypt";
import { db } from "../config/db.js";
import { users } from "../database/schema.js";

const createAdmin = async () => {
  try {
    const email = "superadmin@toopz.com";
    const password = "SuperAdmin@123"; // change after first login

    const hashedPassword = await bcrypt.hash(password, 10);

    const [admin] = await db
      .insert(users)
      .values({
        name: "Super Admin",
        email,
        password: hashedPassword,
        role: "UniversalAdmin", // IMPORTANT
        isVerified: true,
      })
      .returning();

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

createAdmin();
