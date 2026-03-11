import { pool } from "../src/db";

async function run() {
    try {
        const studentRows = await pool.query("SELECT * FROM students");
        const courseLessons = await pool.query("SELECT id FROM course_lessons");

        if (studentRows.length > 0 && courseLessons.length > 0) {
            const s1 = studentRows[0];
            // mark 2 lessons as completed for the first student
            const l1 = courseLessons[0]?.id;
            const l2 = courseLessons[1]?.id;
            if (l1) {
                await pool.query("INSERT IGNORE INTO lesson_completions (user_id, lesson_id) VALUES (?, ?)", [s1.user_id, l1]);
            }
            if (l2) {
                await pool.query("INSERT IGNORE INTO lesson_completions (user_id, lesson_id) VALUES (?, ?)", [s1.user_id, l2]);
            }

            // enrol the student in the courses
             const courses = await pool.query("SELECT id FROM courses");
             if (courses.length > 0) {
                 await pool.query("INSERT IGNORE INTO enrollments (student_id, course_id) VALUES (?, ?)", [s1.id, courses[0].id]);
             }
        }
        console.log("Seeded dummy completions");
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
