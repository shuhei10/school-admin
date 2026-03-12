import { pool } from "../src/db.js";

async function migrate() {
  console.log("Starting migration: Adding missing columns to users table...");
  
  try {
    const conn = await pool.getConnection(); // Try to get connection first
    console.log("✅ Successfully connected to Aiven!");

    // Check existing columns
    const columns = await conn.query("SHOW COLUMNS FROM users");
    const existingColumns = columns.map((c: any) => c.Field || c.field); // Handle case difference if any

    if (!existingColumns.includes('goal')) {
      console.log("Adding 'goal' column...");
      await conn.query("ALTER TABLE users ADD COLUMN goal VARCHAR(255) NULL AFTER status");
    }

    if (!existingColumns.includes('skill_level')) {
      console.log("Adding 'skill_level' column...");
      await conn.query("ALTER TABLE users ADD COLUMN skill_level VARCHAR(100) NULL AFTER goal");
    }

    console.log("✅ Migration completed successfully!");
    conn.release();
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await pool.end();
    process.exit();
  }
}

migrate();
