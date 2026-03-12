import { pool } from "../src/db";
import fs from "fs";
import path from "path";

async function init() {
  console.log("Starting database initialization on Aiven...");
  
  try {
    const sqlPath = path.join(__dirname, "../sql/001_init.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    
    // Split by semicolon but be careful with strings (simple split for this script)
    const statements = sql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await pool.query(statement);
    }

    console.log("✅ Database initialized successfully!");
  } catch (err) {
    console.error("❌ Error initializing database:", err);
  } finally {
    await pool.end();
    process.exit();
  }
}

init();
