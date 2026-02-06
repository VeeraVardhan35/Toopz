import bcrypt from "bcrypt";
import { db } from "../config/db.js";
import { users } from "../database/schema.js";
import { eq } from "drizzle-orm";

const createAdmin = async () => {
  try {
    console.log("🚀 Starting admin creation...");
    
    const email = "superadmin@toopz.com";
    const password = "SuperAdmin@123"; // change after first login
    
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      console.log("✅ Admin already exists:", email);
      process.exit(0);
    }

    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log("💾 Inserting admin user into database...");
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
    
    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", admin.email);
    console.log("👤 Name:", admin.name);
    console.log("🎭 Role:", admin.role);
    console.log("\n🔑 Login credentials:");
    console.log("   Email:", email);
    console.log("   Password:", password);
    console.log("\n⚠️  IMPORTANT: Change this password after first login!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:");
    console.error(error);
    
    if (error.code === '23505') {
      console.error("\n💡 Admin user already exists with this email!");
    }
    
    process.exit(1);
  }
};

createAdmin();
