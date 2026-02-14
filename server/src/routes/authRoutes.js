import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool, query } from "../config/db.js";

const router = express.Router();

function issueToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      studentId: user.student_id,
      facultyId: user.faculty_id
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const userResult = await query(
      `SELECT id, name, email, password_hash, role, student_id, faculty_id
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = issueToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.student_id,
        facultyId: user.faculty_id
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Login failed" });
  }
});

router.post("/signup", async (req, res) => {
  let client;
  let transactionStarted = false;
  try {
    client = await pool.connect();
    const { name, email, password, department, semester } = req.body;

    if (!name || !email || !password || !department || !semester) {
      return res.status(400).json({ message: "Name, email, password, department, and semester are required" });
    }

    const semesterNumber = Number(semester);
    if (!Number.isInteger(semesterNumber) || semesterNumber < 1) {
      return res.status(400).json({ message: "Semester must be a positive integer" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    await client.query("BEGIN");
    transactionStarted = true;

    const existingUser = await client.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(409).json({ message: "Email already exists" });
    }

    let studentResult = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      const rollNo = `SAPI${Date.now()}${random}`;
      try {
        studentResult = await client.query(
          `INSERT INTO students (roll_no, name, email, department, semester)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [rollNo, name, email, department, semesterNumber]
        );
        break;
      } catch (error) {
        if (error.code !== "23505") {
          throw error;
        }
      }
    }

    if (!studentResult) {
      throw new Error("Unable to generate a unique roll number");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, role, student_id)
       VALUES ($1, $2, $3, 'student', $4)
       RETURNING id, name, email, role, student_id, faculty_id`,
      [name, email, passwordHash, studentResult.rows[0].id]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    const user = userResult.rows[0];
    const token = issueToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.student_id,
        facultyId: user.faculty_id
      }
    });
  } catch (error) {
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }
    console.error(error);
    if (error.code === "3D000") {
      return res.status(500).json({ message: "Database 'sapi_db' does not exist. Create it and run schema.sql." });
    }
    if (error.code === "ECONNREFUSED") {
      return res.status(500).json({ message: "Database connection failed. Start PostgreSQL and try again." });
    }
    return res.status(500).json({ message: "Signup failed" });
  } finally {
    if (client) {
      client.release();
    }
  }
});

export default router;
