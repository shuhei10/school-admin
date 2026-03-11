import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import { pool } from "../db";

const r = Router();

// コース一覧取得
r.get("/", requireAuth, async (_req, res) => {
    try {
        const rows = await pool.query(
            `SELECT id, title, description, is_published, created_at FROM courses ORDER BY created_at DESC`
        );
        res.json({ ok: true, courses: rows });
    } catch (e: any) {
        res.status(500).json({ ok: false, message: e.message });
    }
});

// コース作成
r.post("/", requireAuth, requireRole(["admin", "instructor"]), async (req, res) => {
    const { title, description, is_published } = req.body;
    if (!title) return res.status(400).json({ ok: false, message: "title required" });

    try {
        const result = await pool.query(
            `INSERT INTO courses (title, description, is_published) VALUES (?, ?, ?)`,
            [title, description || "", is_published ? 1 : 0]
        );
        res.json({ ok: true, id: Number(result.insertId) });
    } catch (e: any) {
        res.status(500).json({ ok: false, message: e.message });
    }
});

// コース詳細とコンテンツ一覧取得
r.get("/:id/contents", requireAuth, async (req, res) => {
    try {
        const courseId = req.params.id;
        const [course] = await pool.query(
            "SELECT id, title, description, is_published, created_at FROM courses WHERE id = ?",
            [courseId]
        );
        if (!course) return res.status(404).json({ ok: false, message: "Course not found" });

        const chapters = await pool.query(
            "SELECT * FROM course_chapters WHERE course_id = ? ORDER BY order_index ASC, id ASC",
            [courseId]
        );

        const lessons = await pool.query(
            `SELECT l.* FROM course_lessons l
             JOIN course_chapters c ON l.chapter_id = c.id
             WHERE c.course_id = ?
             ORDER BY l.chapter_id ASC, l.order_index ASC, l.id ASC`,
            [courseId]
        );
        
        // Return completed lesson IDs and enrollment status if authenticated user is found
        const userId = (req as any).session?.user?.id; // Assuming session contains user id
        let completed_lessons: number[] = [];
        let is_enrolled = false;
        
        if (userId) {
            // Check enrollment status
            const [enrollment] = await pool.query(
                `SELECT e.id FROM enrollments e
                 JOIN students s ON e.student_id = s.id
                 WHERE s.user_id = ? AND e.course_id = ? AND e.status = 'active'`,
                [userId, courseId]
            );
            if (enrollment) {
                is_enrolled = true;
            }

            const completions = await pool.query(
                `SELECT lesson_id FROM lesson_completions 
                 WHERE user_id = ? AND lesson_id IN (
                    SELECT l.id FROM course_lessons l
                    JOIN course_chapters c ON l.chapter_id = c.id
                    WHERE c.course_id = ?
                 )`,
                [userId, courseId]
            );
            completed_lessons = completions.map((c: any) => c.lesson_id);
        }

        res.json({ ok: true, course, chapters, lessons, completed_lessons, is_enrolled });
    } catch (e: any) {
        res.status(500).json({ ok: false, message: e.message });
    }
});

// 章の作成
r.post("/:id/chapters", requireAuth, requireRole(["admin", "instructor"]), async (req, res) => {
    const courseId = req.params.id;
    const { title, order_index } = req.body;
    if (!title) return res.status(400).json({ ok: false, message: "title required" });

    try {
        const result = await pool.query(
            "INSERT INTO course_chapters (course_id, title, order_index) VALUES (?, ?, ?)",
            [courseId, title, order_index || 0]
        );
        res.json({ ok: true, id: Number(result.insertId) });
    } catch (e: any) {
        res.status(500).json({ ok: false, message: e.message });
    }
});

// レッスンの作成
r.post("/:id/chapters/:chapterId/lessons", requireAuth, requireRole(["admin", "instructor"]), async (req, res) => {
    const chapterId = req.params.chapterId;
    const { title, content, video_url, order_index } = req.body;
    if (!title) return res.status(400).json({ ok: false, message: "title required" });

    try {
        const result = await pool.query(
            "INSERT INTO course_lessons (chapter_id, title, content, video_url, order_index) VALUES (?, ?, ?, ?, ?)",
            [chapterId, title, content || null, video_url || null, order_index || 0]
        );
        res.json({ ok: true, id: Number(result.insertId) });
    } catch (e: any) {
        res.status(500).json({ ok: false, message: e.message });
    }
});

// レッスンの完了状態をトグル
r.post("/:id/lessons/:lessonId/toggle-completion", requireAuth, async (req, res) => {
    const lessonId = req.params.lessonId;
    const userId = (req as any).session?.user?.id;
    if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });

    try {
        // 現在の完了情報があるか確認
        const [existing] = await pool.query(
            "SELECT id FROM lesson_completions WHERE user_id = ? AND lesson_id = ?",
            [userId, lessonId]
        );

        if (existing) {
            // あれば削除（未完了に戻す）
            await pool.query("DELETE FROM lesson_completions WHERE id = ?", [existing.id]);
            res.json({ ok: true, completed: false });
        } else {
            // なければ追加（完了にする）
            await pool.query("INSERT INTO lesson_completions (user_id, lesson_id) VALUES (?, ?)", [userId, lessonId]);
            res.json({ ok: true, completed: true });
        }
    } catch (e: any) {
        res.status(500).json({ ok: false, message: e.message });
    }
});

export default r;
