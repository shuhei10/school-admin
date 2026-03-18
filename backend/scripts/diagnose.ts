import process from "process";
import { pool } from "../src/db.js";

async function diagnose() {
  console.log("--- System Diagnosis ---");
  const conn = await pool.getConnection();
  try {
    const [userCount] = await conn.query("SELECT COUNT(*) as count FROM users");
    console.log(`Users total: ${userCount.count}`);

    const studentsAsUsers = await conn.query("SELECT id, email, role FROM users WHERE role = 'student'");
    console.log(`Users with role 'student': ${studentsAsUsers.length}`);
    for (const u of studentsAsUsers) {
      const [s] = await conn.query("SELECT id FROM students WHERE user_id = ?", [u.id]);
      console.log(`  - User ${u.email} (ID: ${u.id}): ${s ? 'Has students record (ID: ' + s.id + ')' : 'MISSING students record'}`);
    }

    const [courseCount] = await conn.query("SELECT COUNT(*) as count FROM courses");
    console.log(`Courses total: ${courseCount.count}`);

    const [enrollmentCount] = await conn.query("SELECT COUNT(*) as count FROM enrollments");
    console.log(`Enrollments total: ${enrollmentCount.count}`);

    const samples = await conn.query("SELECT * FROM users LIMIT 3");
    console.log("User Samples:");
    console.table(samples);

  } catch (e) {
    console.error("Diagnosis failed:", e);
  } finally {
    conn.release();
    await pool.end();
    process.exit(0);
  }
}

diagnose();
