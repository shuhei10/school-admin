import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import { pool } from "../db";

const r = Router();

r.get("/kpi", requireAuth, requireRole(["admin", "instructor"]), async (_req, res) => {
  const [students] = await pool.query(
    `SELECT COUNT(*) AS cnt
     FROM students s
     JOIN users u ON u.id = s.user_id
     WHERE u.status = 'active'`,
  );

  const [courses] = await pool.query(
    `SELECT COUNT(*) AS cnt
     FROM courses
     WHERE is_published = 1`,
  );

  const [enrollments] = await pool.query(
    `SELECT COUNT(*) AS cnt
     FROM enrollments
     WHERE status = 'active'`,
  );

  const recentStudents = await pool.query(
    `SELECT s.id, u.name, u.email, u.status, s.created_at
     FROM students s
     JOIN users u ON u.id = s.user_id
     ORDER BY s.created_at DESC
     LIMIT 5`
  );

  res.json({
    ok: true,
    kpi: {
      students_total: Number(students?.cnt ?? 0),
      courses_published: Number(courses?.cnt ?? 0),
      enrollments_active: Number(enrollments?.cnt ?? 0),
      recent_students: recentStudents,
    },
  });
});

r.get("/student", requireAuth, async (req, res) => {
  const userId = (req as any).session?.user?.id;
  if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });

  try {
    // 学生自身の進捗（コースごとに総レッスン数と完了レッスン数を計算）
    const progressData = await pool.query(
      `SELECT
         c.id AS course_id,
         c.title AS course_title,
         c.description AS course_description,
         (SELECT COUNT(l.id) FROM course_lessons l JOIN course_chapters ch ON l.chapter_id = ch.id WHERE ch.course_id = c.id) AS total_lessons,
         (
           SELECT COUNT(lc.id) 
           FROM lesson_completions lc 
           JOIN course_lessons l ON lc.lesson_id = l.id 
           JOIN course_chapters ch ON l.chapter_id = ch.id 
           WHERE ch.course_id = c.id AND lc.user_id = ?
         ) AS completed_lessons
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN students s ON e.student_id = s.id
       WHERE s.user_id = ? AND e.status = 'active'`,
      [userId, userId]
    );

    res.json({ ok: true, enrolled_courses: progressData });
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message || "Database error" });
  }
});

export default r;