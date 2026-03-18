import process from "process";
import { pool } from "../src/db.js";

async function repair() {
  console.log("--- Repairing Students Table ---");
  const conn = await pool.getConnection();
  try {
    // 1. role='student' なのに students テーブルにレコードがないユーザーを取得
    const missingStudents = await conn.query(`
      SELECT u.id, u.email, u.name 
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      WHERE u.role = 'student' AND s.id IS NULL
    `);

    console.log(`Found ${missingStudents.length} missing student records.`);

    for (const user of missingStudents) {
      console.log(`Creating student record for: ${user.email} (ID: ${user.id})`);
      await conn.query("INSERT INTO students (user_id) VALUES (?)", [user.id]);
    }

    // 2. ついでにタイポ（suzki -> suzuki）も修正するか？ 
    // 今回は安全のため、ログに出すだけにするか、あるいは明確に修正する
    const typoUser = await conn.query("SELECT id FROM users WHERE email = 'suzki@gmail.com'");
    if (typoUser.length > 0) {
       console.log("Detected typo in email: suzki@gmail.com. Updating to suzuki@gmail.com...");
       await conn.query("UPDATE users SET email = 'suzuki@gmail.com' WHERE email = 'suzki@gmail.com'");
    }

    console.log("✅ Repair completed successfully!");
  } catch (e) {
    console.error("❌ Repair failed:", e);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

repair();
