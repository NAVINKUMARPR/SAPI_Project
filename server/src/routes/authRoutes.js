import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Student from "../models/Student.js";

const router = express.Router();

function issueToken(user) {
  return jwt.sign(
    {
      id: user._id,
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

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = issueToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
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
  try {
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const rollNo = `SAPI${Date.now()}${random}`;

    let student;
    try {
      student = await Student.create({
        rollNo,
        name,
        email,
        department,
        semester: semesterNumber
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to create student record" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let user;
    try {
      user = await User.create({
        name,
        email,
        password_hash: passwordHash,
        role: "student",
        student_id: student._id
      });
    } catch (err) {
      await Student.findByIdAndDelete(student._id);
      console.error(err);
      return res.status(500).json({ message: "Signup failed" });
    }

    const token = issueToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.student_id,
        facultyId: user.faculty_id
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Signup failed" });
  }
});

export default router;
