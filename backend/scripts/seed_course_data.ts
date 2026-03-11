import { pool } from "../src/db";

async function run() {
    try {
        const courses = await pool.query("SELECT * FROM courses");
        console.log("Found courses:", courses.map((c: any) => c.title));
        
        const webCourse = courses.find((c: any) => c.title.toLowerCase().includes("web") || c.title.includes("ウェブ"));
        const freelanceCourse = courses.find((c: any) => c.title.includes("フリーランス"));

        if (webCourse) {
            console.log(`Seeding chapters for webCourse ID ${webCourse.id}`);
            // Append chapters
            const c1 = await pool.query("INSERT INTO course_chapters (course_id, title, order_index) VALUES (?, ?, ?)", [webCourse.id, "Webデザインの基礎", 0]);
            const c2 = await pool.query("INSERT INTO course_chapters (course_id, title, order_index) VALUES (?, ?, ?)", [webCourse.id, "Figmaの使い方", 1]);
            const c3 = await pool.query("INSERT INTO course_chapters (course_id, title, order_index) VALUES (?, ?, ?)", [webCourse.id, "HTML/CSSコーディング", 2]);
            
            // Append lessons
            await pool.query("INSERT INTO course_lessons (chapter_id, title, content, order_index) VALUES (?, ?, ?, ?)", [c1.insertId, "Webとは何か？", "Webの仕組みについて学びます。", 0]);
            await pool.query("INSERT INTO course_lessons (chapter_id, title, content, order_index) VALUES (?, ?, ?, ?)", [c1.insertId, "デザインの4原則", "近接、整列、反復、コントラストを理解しましょう。", 1]);
            
            await pool.query("INSERT INTO course_lessons (chapter_id, title, content, order_index) VALUES (?, ?, ?, ?)", [c2.insertId, "Figmaの基本操作", "ツールの使い方を学びます。", 0]);
            
            await pool.query("INSERT INTO course_lessons (chapter_id, title, content, order_index) VALUES (?, ?, ?, ?)", [c3.insertId, "HTMLの基本タグ", "h1, p, div, spanなどの使い方。", 0]);
        }
        
        if (freelanceCourse) {
            console.log(`Seeding chapters for freelanceCourse ID ${freelanceCourse.id}`);
            const f1 = await pool.query("INSERT INTO course_chapters (course_id, title, order_index) VALUES (?, ?, ?)", [freelanceCourse.id, "フリーランスとしてのマインドセット", 0]);
            const f2 = await pool.query("INSERT INTO course_chapters (course_id, title, order_index) VALUES (?, ?, ?)", [freelanceCourse.id, "案件獲得のステップ", 1]);
            
            await pool.query("INSERT INTO course_lessons (chapter_id, title, content, order_index) VALUES (?, ?, ?, ?)", [f1.insertId, "自己管理術", "タスク管理やモチベーション維持について。", 0]);
            await pool.query("INSERT INTO course_lessons (chapter_id, title, content, order_index) VALUES (?, ?, ?, ?)", [f2.insertId, "ポートフォリオの作り方", "魅力的な実績の見せ方。", 0]);
            await pool.query("INSERT INTO course_lessons (chapter_id, title, content, order_index) VALUES (?, ?, ?, ?)", [f2.insertId, "営業メールの書き方", "クライアントへのアプローチ方法。", 1]);
        }

        console.log("Done seeding!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
