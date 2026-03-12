import { pool } from "../src/db.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {
  console.log("Starting database initialization on Aiven...");
  
  try {
    const sqlPath = path.resolve(__dirname, "../../sql/001_init.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    
    const statements = sql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await pool.query(statement);
    }

    // Insert Admin User securely
    const hashedPassword = await bcrypt.hash("pass1234", 10);
    console.log("Inserting admin user...");
    await pool.query(
      "INSERT INTO users (email, password_hash, name, role, status) VALUES (?, ?, ?, ?, ?)",
      ["admin@example.com", hashedPassword, "管理者ユーザー", "admin", "active"]
    );

    console.log("✅ Database and Admin user initialized successfully!");
  } catch (err) {
    console.error("❌ Error initializing database:", err);
  } finally {
    await pool.end();
    process.exit();
  }
}

init();
