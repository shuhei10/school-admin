import process from "process";
import { pool } from "../src/db.js";

async function seed() {
  console.log("--- Seeding User-Provided Data ---");
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Courses
    console.log("Seeding courses...");
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    await conn.query("DELETE FROM enrollments");
    await conn.query("DELETE FROM course_lessons");
    await conn.query("DELETE FROM course_chapters");
    await conn.query("DELETE FROM courses");
    await conn.query("DELETE FROM students");

    await conn.query(`
      INSERT INTO courses (id, title, description, is_published, created_at) VALUES 
      (1, 'はじめてのWebデザインコース', 'Webデザインがまったく初めての方向けに、HTML/CSSの基本から、簡単な1ページサイトの制作までを丁寧に指導します。', 1, '2026-03-05 21:50:23'),
      (2, '実践型フリーランスコース', '基礎を終えた方、または自己学習で少し触れたことがある方向け。実際の案件に近い課題や、Figmaを用いたUI設計、レスポンシブ対応コーディングを通して、仕事で使える力を養います。', 1, '2026-03-05 21:50:23')
    `);

    // 2. Chapters
    console.log("Seeding chapters...");
    await conn.query(`
      INSERT INTO course_chapters (id, course_id, title, order_index, created_at) VALUES 
      (1, 2, 'フリーランスとしてのマインドセット', 0, '2026-03-11 19:57:00'),
      (2, 2, '案件獲得のステップ', 1, '2026-03-11 19:57:00'),
      (3, 1, 'Webデザインの基礎', 0, '2026-03-11 19:57:30'),
      (4, 1, 'Figmaの使い方', 1, '2026-03-11 19:57:30'),
      (5, 1, 'HTML/CSSコーディング', 2, '2026-03-11 19:57:30'),
      (6, 2, 'フリーランスとしてのマインドセット', 0, '2026-03-11 19:57:30'),
      (7, 2, '案件獲得のステップ', 1, '2026-03-11 19:57:30')
    `);

    // 3. Lessons
    console.log("Seeding lessons...");
    await conn.query(`
      INSERT INTO course_lessons (id, chapter_id, title, content, video_url, order_index, created_at) VALUES 
      (1, 1, '自己管理術', 'タスク管理やモチベーション維持について。', NULL, 0, '2026-03-11 19:57:00'),
      (2, 2, 'ポートフォリオの作り方', '魅力的な実績の見せ方。', NULL, 0, '2026-03-11 19:57:00'),
      (3, 2, '営業メールの書き方', 'クライアントへのアプローチ方法。', NULL, 1, '2026-03-11 19:57:00'),
      (4, 3, 'Webとは何か？', 'Webの仕組みについて学びます。', NULL, 0, '2026-03-11 19:57:30'),
      (5, 3, 'デザインの4原則', '近接、整列、反復、コントラストを理解しましょう。', NULL, 1, '2026-03-11 19:57:30'),
      (6, 4, 'Figmaの基本操作', 'ツールの使い方を学びます。', NULL, 0, '2026-03-11 19:57:30'),
      (7, 5, 'HTMLの基本タグ', 'h1, p, div, spanなどの使い方。', NULL, 0, '2026-03-11 19:57:30'),
      (8, 6, '自己管理術', 'タスク管理やモチベーション維持について。', NULL, 0, '2026-03-11 19:57:30'),
      (9, 7, 'ポートフォリオの作り方', '魅力的な実績の見せ方。', NULL, 0, '2026-03-11 19:57:30'),
      (10, 7, '営業メールの書き方', 'クライアントへのアプローチ方法。', NULL, 1, '2026-03-11 19:57:30')
    `);

    // 4. Students
    console.log("Seeding students...");
    await conn.query(`
      INSERT INTO students (id, user_id, created_at) VALUES 
      (1, 2, '2026-03-05 19:41:22'),
      (2, 3, '2026-03-06 21:57:54')
    `);

    // 5. Enrollments
    console.log("Seeding enrollments...");
    await conn.query(`
      INSERT INTO enrollments (id, student_id, course_id, status) VALUES 
      (1, 1, 1, 'active'),
      (2, 1, 2, 'active'),
      (3, 2, 1, 'active'),
      (4, 2, 2, 'active')
    `);

    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
    await conn.commit();
    console.log("✅ Database successfully seeded with provided data!");
  } catch (e) {
    await conn.rollback();
    console.error("❌ Seed failed:", e);
  } finally {
    conn.release();
    await pool.end();
    process.exit(0);
  }
}

seed();
