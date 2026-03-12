import { pool } from "../src/db.js";

async function migrate() {
  console.log("Starting migration: Adding missing columns to users table...");
  
  try {
    console.log("Adding 'goal' column...");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS goal VARCHAR(255) NULL AFTER status");
    
    console.log("Adding 'skill_level' column...");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_level VARCHAR(100) NULL AFTER goal");

    console.log("✅ Migration completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await pool.end();
    process.exit();
  }
}

migrate();
