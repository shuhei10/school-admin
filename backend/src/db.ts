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
    await ensureSeedData(conn); // Pass connection to seed
  } catch (err) {
    console.error("Schema check failed:", err);
  } finally {
    if (conn) conn.release();
  }
}

async function ensureSeedData(conn: any) {
  try {
    const [courseCount] = await conn.query("SELECT COUNT(*) as count FROM courses");
    if (courseCount.count > 0) {
      console.log("Courses already exist, skipping seeding.");
      return;
    }

    console.log("Database empty. Seeding provided content...");

    // 1. Courses
    await conn.query(`
      INSERT INTO courses (id, title, description, is_published, created_at) VALUES 
      (1, 'はじめてのWebデザインコース', 'Webデザインがまったく初めての方向けに、HTML/CSSの基本から、簡単な1ページサイトの制作までを丁寧に指導します。', 1, '2026-03-05 21:50:23'),
      (2, '実践型フリーランスコース', '基礎を終えた方、または自己学習で少し触れたことがある方向け。実際の案件に近い課題や、Figmaを用いたUI設計、レスポンシブ対応コーディングを通して、仕事で使える力を養います。', 1, '2026-03-05 21:50:23')
    `);

    // 2. Chapters
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

    // 4. Students & Enrollments (Special: ensure students exist for user 2 and 3)
    // Check if students exist first
    const [sc] = await conn.query("SELECT COUNT(*) as count FROM students");
    if (sc.count === 0) {
      await conn.query(`INSERT IGNORE INTO students (id, user_id) VALUES (1, 2), (2, 3)`);
      await conn.query(`
        INSERT IGNORE INTO enrollments (student_id, course_id, status) VALUES 
        (1, 1, 'active'), (1, 2, 'active'), (2, 1, 'active'), (2, 2, 'active')
      `);
    }

    console.log("✅ Seed data populated successfully!");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
}
