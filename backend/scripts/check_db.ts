import { pool } from '../src/db.js';

async function check() {
  try {
    const users = await pool.query("SELECT id, email, role, name FROM users");
    console.log("--- Users ---");
    console.table(users);

    const students = await pool.query("SELECT * FROM students");
    console.log("--- Students ---");
    console.table(students);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
