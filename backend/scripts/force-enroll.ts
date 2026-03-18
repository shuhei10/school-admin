import process from "process";
import { pool } from "../src/db.js";

async function forceEnroll() {
  console.log("--- Enrolling All Students to All Courses ---");
  const conn = await pool.getConnection();
  try {
    const students = await conn.query("SELECT id FROM students");
    const courses = await conn.query("SELECT id FROM courses");

    console.log(`Found ${students.length} students and ${courses.length} courses.`);

    for (const s of students) {
      for (const c of courses) {
        // すでに登録されているか確認
        const [existing] = await conn.query("SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?", [s.id, c.id]);
        if (!existing) {
          console.log(`Enrolling student ID ${s.id} to course ID ${c.id}`);
          await conn.query("INSERT INTO enrollments (student_id, course_id, status) VALUES (?, ?, 'active')", [s.id, c.id]);
        } else {
          console.log(`Student ID ${s.id} already enrolled in course ID ${c.id}`);
        }
      }
    }

    console.log("✅ Enrollment completed successfully!");
  } catch (e) {
    console.error("❌ Enrollment failed:", e);
  } finally {
    conn.release();
    await pool.end();
    process.exit(0);
  }
}

forceEnroll();
