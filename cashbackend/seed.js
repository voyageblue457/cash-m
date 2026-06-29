import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./models/User.js";
import connectDB from "./database.js";

const seedSuperAdmin = async () => {
  try {
    connectDB();

    // Wait a brief moment to ensure DB connection is ready
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const username = process.env.SUPER_ADMIN_USERNAME || "superadmin";
    const password = process.env.SUPER_ADMIN_PASSWORD || "superadmin123";
    const adminId = process.env.SUPER_ADMIN_ADMIN_ID || "superadmin";

    // Check if super admin already exists
    const existingSuper = await User.findOne({ superAdmin: true });
    if (existingSuper) {
      console.log(`[SEED] Super admin already exists with username: ${existingSuper.username}`);
      mongoose.connection.close();
      process.exit(0);
    }

    // Create the super admin
    const superAdmin = await User.create({
      username,
      password,
      adminId,
      admin: true,
      superAdmin: true,
      validity: 36500, // 100 years of validity
      numOfPostersPermission: 9999,
    });

    console.log(`[SEED] Super admin created successfully!`);
    console.log(`[SEED] Username: ${superAdmin.username}`);
    console.log(`[SEED] Password: ${password}`);
    console.log(`[SEED] AdminId: ${superAdmin.adminId}`);
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("[SEED] Error seeding super admin:", error);
    process.exit(1);
  }
};

seedSuperAdmin();
