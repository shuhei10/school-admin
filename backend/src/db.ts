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

    console.log("Database empty. Seeding initial content...");

    // 1. Course
    const resCourse = await conn.query(
      "INSERT INTO courses (title, description, is_published) VALUES (?, ?, ?)",
      ["はじめてのWeb開発入門", "HTML, CSS, JavaScriptの基礎からWeb開発を学ぶコースです。", 1]
    );
    const courseId = Number(resCourse.insertId);

    // 2. Chapters
    const resChapter1 = await conn.query(
      "INSERT INTO course_chapters (course_id, title, order_index) VALUES (?, ?, ?)",
      [courseId, "導入：Webの仕組み", 1]
    );
    const chapter1Id = Number(resChapter1.insertId);

    const resChapter2 = await conn.query(
      "INSERT INTO course_chapters (course_id, title, order_index) VALUES (?, ?, ?)",
      [courseId, "実践：HTML/CSS", 2]
    );
    const chapter2Id = Number(resChapter2.insertId);

    // 3. Lessons
    await conn.query(
      "INSERT INTO course_lessons (chapter_id, title, content, video_url, order_index) VALUES (?, ?, ?, ?, ?)",
      [chapter1Id, "インターネットとは？", "Webの歴史と基本概念について学びます。", "https://www.youtube.com/embed/placeholder1", 1]
    );

    await conn.query(
      "INSERT INTO course_lessons (chapter_id, title, content, video_url, order_index) VALUES (?, ?, ?, ?, ?)",
      [chapter2Id, "HTMLタグの基礎", "様々なタグの使い方を実践形式で学びます。", "https://www.youtube.com/embed/placeholder2", 1]
    );

    await conn.query(
      "INSERT INTO course_lessons (chapter_id, title, content, video_url, order_index) VALUES (?, ?, ?, ?, ?)",
      [chapter2Id, "CSSでデザインを整える", "レイアウトの基本と装飾について学びます。", "https://www.youtube.com/embed/placeholder3", 2]
    );

    console.log("✅ Initial seeding completed successfully!");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
}


