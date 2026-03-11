import { pool } from "../src/db";

async function run() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS course_chapters (
              id INT AUTO_INCREMENT PRIMARY KEY,
              course_id INT NOT NULL,
              title VARCHAR(200) NOT NULL,
              order_index INT NOT NULL DEFAULT 0,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            );
        `);
        console.log("Created course_chapters!");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS course_lessons (
              id INT AUTO_INCREMENT PRIMARY KEY,
              chapter_id INT NOT NULL,
              title VARCHAR(200) NOT NULL,
              content TEXT NULL,
              video_url VARCHAR(500) NULL,
              order_index INT NOT NULL DEFAULT 0,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (chapter_id) REFERENCES course_chapters(id) ON DELETE CASCADE
            );
        `);
        console.log("Created course_lessons!");
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
