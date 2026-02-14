import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { pool, query } from "../config/db.js";

dotenv.config();

async function seed() {
  try {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const facultyPassword = await bcrypt.hash("faculty123", 10);
    const studentPassword = await bcrypt.hash("student123", 10);

    const facultyResult = await query(
      `INSERT INTO faculty (name, email, department)
       VALUES ('Default Faculty', 'faculty@sapi.com', 'CSE')
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
    );

    const studentResult = await query(
      `INSERT INTO students (roll_no, name, email, department, semester)
       VALUES ('SAPI001', 'Default Student', 'student@sapi.com', 'CSE', 1)
       ON CONFLICT (roll_no) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
    );

    await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ('Admin User', 'admin@sapi.com', $1, 'admin')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [adminPassword]
    );

    await query(
      `INSERT INTO users (name, email, password_hash, role, faculty_id)
       VALUES ('Default Faculty', 'faculty@sapi.com', $1, 'faculty', $2)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, faculty_id = EXCLUDED.faculty_id`,
      [facultyPassword, facultyResult.rows[0].id]
    );

    await query(
      `INSERT INTO users (name, email, password_hash, role, student_id)
       VALUES ('Default Student', 'student@sapi.com', $1, 'student', $2)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, student_id = EXCLUDED.student_id`,
      [studentPassword, studentResult.rows[0].id]
    );

    await query(
      `INSERT INTO subjects (code, name, semester, faculty_id)
       VALUES ('CS101', 'Programming Fundamentals', 1, $1)
       ON CONFLICT (code) DO NOTHING`,
      [facultyResult.rows[0].id]
    );

    console.log("Seed completed.");
    console.log("Admin: admin@sapi.com / admin123");
    console.log("Faculty: faculty@sapi.com / faculty123");
    console.log("Student: student@sapi.com / student123");
  } catch (error) {
    console.error("Seed failed", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
