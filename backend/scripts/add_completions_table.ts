import { pool } from "../src/db";

async function run() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS lesson_completions (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              lesson_id INT NOT NULL,
              completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              UNIQUE KEY unique_user_lesson (user_id, lesson_id),
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE
            );
        `);
        console.log("Created lesson_completions!");
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
