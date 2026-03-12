import { createPool } from "mariadb";

console.log("--- DB Connection Attempt ---");
console.log("Host:", process.env.DB_HOST || "NOT SET");
console.log("Port:", process.env.DB_PORT || "NOT SET");
console.log("User:", process.env.DB_USER || "NOT SET");
console.log("DB Name:", process.env.DB_DATABASE || "NOT SET");
console.log("----------------------------");

export const pool = createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "school_admin",
  connectionLimit: 15,
  connectTimeout: 20000,
  acquireTimeout: 20000,
  ssl: {
    rejectUnauthorized: false
  },
  allowPublicKeyRetrieval: true
});

export async function ensureSchema() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("Checking database schema...");
    const columns = await conn.query("SHOW COLUMNS FROM users");
    const existing = columns.map((c: any) => (c.Field || c.field).toLowerCase());

    if (!existing.includes("goal")) {
      console.log("Adding missing column: goal");
      await conn.query("ALTER TABLE users ADD COLUMN goal VARCHAR(255) NULL AFTER status");
    }
    if (!existing.includes("skill_level")) {
      console.log("Adding missing column: skill_level");
      await conn.query("ALTER TABLE users ADD COLUMN skill_level VARCHAR(100) NULL AFTER goal");
    }
    console.log("Schema check completed.");
  } catch (err) {
    console.error("Schema check failed:", err);
  } finally {
    if (conn) conn.release();
  }
}


