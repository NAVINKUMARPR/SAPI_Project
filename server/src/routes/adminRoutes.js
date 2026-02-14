import express from "express";
import bcrypt from "bcryptjs";
import { pool, query } from "../config/db.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate, authorize("admin"));

router.get("/dashboard", async (_, res) => {
  try {
    const [students, faculty, subjects] = await Promise.all([
      query("SELECT COUNT(*)::int AS count FROM students"),
      query("SELECT COUNT(*)::int AS count FROM faculty"),
      query("SELECT COUNT(*)::int AS count FROM subjects")
    ]);

    return res.json({
      totalStudents: students.rows[0].count,
      totalFaculty: faculty.rows[0].count,
      totalSubjects: subjects.rows[0].count
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch dashboard" });
  }
});

router.get("/students", async (_, res) => {
  try {
    const result = await query(
      `SELECT s.id, s.roll_no, s.name, s.email, s.department, s.semester
       FROM students s
       ORDER BY s.id DESC`
    );
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch students" });
  }
});

router.post("/students", async (req, res) => {
  const client = await pool.connect();
  try {
    const { rollNo, name, email, department, semester, password } = req.body;

    if (!rollNo || !name || !email || !department || !semester || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await client.query("BEGIN");

    const studentResult = await client.query(
      `INSERT INTO students (roll_no, name, email, department, semester)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, roll_no, name, email, department, semester`,
      [rollNo, name, email, department, semester]
    );

    const passwordHash = await bcrypt.hash(password, 10);

    await client.query(
      `INSERT INTO users (name, email, password_hash, role, student_id)
       VALUES ($1, $2, $3, 'student', $4)`,
      [name, email, passwordHash, studentResult.rows[0].id]
    );

    await client.query("COMMIT");
    return res.status(201).json(studentResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ message: "Failed to create student" });
  } finally {
    client.release();
  }
});

router.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rollNo, name, email, department, semester } = req.body;

    const result = await query(
      `UPDATE students
       SET roll_no = $1, name = $2, email = $3, department = $4, semester = $5
       WHERE id = $6
       RETURNING id, roll_no, name, email, department, semester`,
      [rollNo, name, email, department, semester, id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Student not found" });
    }

    await query(
      `UPDATE users
       SET name = $1, email = $2
       WHERE student_id = $3`,
      [name, email, id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update student" });
  }
});

router.delete("/students/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query("BEGIN");
    await client.query("DELETE FROM users WHERE student_id = $1", [id]);
    const result = await client.query("DELETE FROM students WHERE id = $1 RETURNING id", [id]);
    await client.query("COMMIT");

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json({ message: "Student deleted" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ message: "Failed to delete student" });
  } finally {
    client.release();
  }
});

router.get("/faculty", async (_, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, department
       FROM faculty
       ORDER BY id DESC`
    );
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch faculty" });
  }
});

router.post("/faculty", async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, email, department, password } = req.body;

    if (!name || !email || !department || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await client.query("BEGIN");

    const facultyResult = await client.query(
      `INSERT INTO faculty (name, email, department)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, department`,
      [name, email, department]
    );

    const passwordHash = await bcrypt.hash(password, 10);

    await client.query(
      `INSERT INTO users (name, email, password_hash, role, faculty_id)
       VALUES ($1, $2, $3, 'faculty', $4)`,
      [name, email, passwordHash, facultyResult.rows[0].id]
    );

    await client.query("COMMIT");
    return res.status(201).json(facultyResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ message: "Failed to create faculty" });
  } finally {
    client.release();
  }
});

router.put("/faculty/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department } = req.body;

    const result = await query(
      `UPDATE faculty
       SET name = $1, email = $2, department = $3
       WHERE id = $4
       RETURNING id, name, email, department`,
      [name, email, department, id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    await query(
      `UPDATE users
       SET name = $1, email = $2
       WHERE faculty_id = $3`,
      [name, email, id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update faculty" });
  }
});

router.delete("/faculty/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query("BEGIN");
    await client.query("DELETE FROM users WHERE faculty_id = $1", [id]);
    const result = await client.query("DELETE FROM faculty WHERE id = $1 RETURNING id", [id]);
    await client.query("COMMIT");

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    return res.json({ message: "Faculty deleted" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ message: "Failed to delete faculty" });
  } finally {
    client.release();
  }
});

router.get("/subjects", async (_, res) => {
  try {
    const result = await query(
      `SELECT s.id, s.code, s.name, s.semester, s.faculty_id, f.name AS faculty_name
       FROM subjects s
       LEFT JOIN faculty f ON f.id = s.faculty_id
       ORDER BY s.id DESC`
    );
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch subjects" });
  }
});

router.post("/subjects", async (req, res) => {
  try {
    const { code, name, semester, facultyId } = req.body;

    if (!code || !name || !semester) {
      return res.status(400).json({ message: "Code, name and semester are required" });
    }

    const result = await query(
      `INSERT INTO subjects (code, name, semester, faculty_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, code, name, semester, faculty_id`,
      [code, name, semester, facultyId || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create subject" });
  }
});

router.put("/subjects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, semester, facultyId } = req.body;

    const result = await query(
      `UPDATE subjects
       SET code = $1, name = $2, semester = $3, faculty_id = $4
       WHERE id = $5
       RETURNING id, code, name, semester, faculty_id`,
      [code, name, semester, facultyId || null, id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Subject not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update subject" });
  }
});

router.delete("/subjects/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query("DELETE FROM subjects WHERE id = $1 RETURNING id", [id]);

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Subject not found" });
    }

    return res.json({ message: "Subject deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete subject" });
  }
});

export default router;
