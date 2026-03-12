import { Router } from "express";
import * as bcrypt from "bcrypt";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { pool } from "../db.js";

const r = Router();

// 権限チェックのショートカット
const adminOnly = [requireAuth, requireRole(["admin"])];

// 一覧取得
r.get("/", requireAuth, requireRole(["admin", "instructor"]), async (_req, res) => {
  const rows = await pool.query(
    `SELECT s.id, u.name, u.email, u.status, u.goal, u.skill_level, s.created_at
     FROM students s
     JOIN users u ON u.id = s.user_id
     ORDER BY s.id DESC`
  );
  res.json({ ok: true, students: rows });
});

// 特定の学生の進捗取得
r.get("/:id/progress", ...adminOnly, async (req, res) => {
  const { id } = req.params; // Students table IP

  try {
    // まずStudentsと合致するUserIDを取得
    const rows = await pool.query("SELECT user_id FROM students WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ ok: false, message: "Student not found" });
    const userId = rows[0].user_id;

    // 各コースごとに、総レッスン数と完了レッスン数を計算する
    const progressData = await pool.query(
      `SELECT
         c.id AS course_id,
         c.title AS course_title,
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
       WHERE e.student_id = ? AND e.status = 'active'`,
      [userId, id]
    );

    res.json({ ok: true, progress: progressData });
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message || "Database error" });
  }
});

// コースの受講を解除 (管理者用)
r.delete("/:id/courses/:courseId/unenroll", ...adminOnly, async (req, res) => {
  const { id, courseId } = req.params; // Students table IP

  try {
    // まずStudentsと合致するUserIDを取得
    const rows = await pool.query("SELECT id FROM students WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ ok: false, message: "Student not found" });

    // enrollments から対象のレコードを削除
    await pool.query(
      "DELETE FROM enrollments WHERE student_id = ? AND course_id = ?",
      [id, courseId]
    );

    res.json({ ok: true, message: "Unenrolled successfully" });
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message || "Database error" });
  }
});

// 新規作成
r.post("/", ...adminOnly, async (req, res) => {
  const { name, email, status, goal, skill_level } = req.body;
  if (!name || !email) return res.status(400).json({ ok: false, message: "name/email required" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. usersテーブルに作成 (デフォルトパスワード: pass1234)
    const hash = await bcrypt.hash("pass1234", 10);
    const resultUser = await conn.query(
      `INSERT INTO users (name, email, password_hash, role, status, goal, skill_level) VALUES (?, ?, ?, 'student', ?, ?, ?)`,
      [name, email, hash, status || "active", goal || "skill_up", skill_level || "beginner"]
    );
    const userId = Number(resultUser.insertId);

    // 2. studentsテーブルに作成
    const resultStudent = await conn.query(
      `INSERT INTO students (user_id) VALUES (?)`,
      [userId]
    );
    const studentId = Number(resultStudent.insertId);

    await conn.commit();

    // 作成したデータを返す
    res.json({
      ok: true,
      student: {
        id: studentId,
        name,
        email,
        status: status || "active",
        goal: goal || "skill_up",
        skill_level: skill_level || "beginner",
        created_at: new Date().toISOString()
      }
    });
  } catch (e: any) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ ok: false, message: e.message || "Database error" });
  } finally {
    conn.release();
  }
});

// 更新
r.put("/:id", ...adminOnly, async (req, res) => {
  const { id } = req.params;
  const { name, email, status, goal, skill_level } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // students.id から users.id を取得
    const rows = await conn.query("SELECT user_id FROM students WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ ok: false, message: "Student not found" });
    const userId = rows[0].user_id;

    // user情報を更新
    await conn.query(
      `UPDATE users SET name = ?, email = ?, status = ?, goal = ?, skill_level = ? WHERE id = ?`,
      [name, email, status, goal, skill_level, userId]
    );

    await conn.commit();

    res.json({
      ok: true,
      student: { id: Number(id), name, email, status, goal, skill_level }
    });
  } catch (e: any) {
    await conn.rollback();
    res.status(500).json({ ok: false, message: e.message || "Database error" });
  } finally {
    conn.release();
  }
});

// 削除
r.delete("/:id", ...adminOnly, async (req, res) => {
  const { id } = req.params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const rows = await conn.query("SELECT user_id FROM students WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ ok: false, message: "Student not found" });
    const userId = rows[0].user_id;

    // 子テーブル(students)から削除
    await conn.query("DELETE FROM students WHERE id = ?", [id]);
    // 親テーブル(users)から削除
    await conn.query("DELETE FROM users WHERE id = ?", [userId]);

    await conn.commit();
    res.json({ ok: true });
  } catch (e: any) {
    await conn.rollback();
    res.status(500).json({ ok: false, message: e.message || "Database error" });
  } finally {
    conn.release();
  }
});

export default r;