import express from "express";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate, authorize("admin"));

router.get("/dashboard", async (_, res) => {
  try {
    const [totalStudents, totalFaculty, totalSubjects] = await Promise.all([
      Student.countDocuments(),
      Faculty.countDocuments(),
      Subject.countDocuments()
    ]);

    return res.json({ totalStudents, totalFaculty, totalSubjects });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch dashboard" });
  }
});

router.get("/students", async (_, res) => {
  try {
    const students = await Student.find().sort({ _id: -1 }).lean();
    return res.json(students.map(s => ({ ...s, id: s._id })));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch students" });
  }
});

router.post("/students", async (req, res) => {
  try {
    const { rollNo, name, email, department, semester, password } = req.body;

    if (!rollNo || !name || !email || !department || !semester || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create student first
    const student = await Student.create({
      rollNo, name, email, department, semester
    });

    try {
      await User.create({
        name,
        email,
        password_hash: passwordHash,
        role: "student",
        student_id: student._id
      });
    } catch (err) {
      await Student.findByIdAndDelete(student._id);
      throw err;
    }

    return res.status(201).json({ ...student.toObject(), id: student._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create student" });
  }
});

router.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rollNo, name, email, department, semester } = req.body;

    const student = await Student.findByIdAndUpdate(
      id,
      { rollNo, name, email, department, semester },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await User.findOneAndUpdate(
      { student_id: id },
      { name, email }
    );

    return res.json({ ...student.toObject(), id: student._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update student" });
  }
});

router.delete("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await User.findOneAndDelete({ student_id: id });

    return res.json({ message: "Student deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete student" });
  }
});

router.get("/faculty", async (_, res) => {
  try {
    const faculty = await Faculty.find().sort({ _id: -1 }).lean();
    return res.json(faculty.map(f => ({ ...f, id: f._id })));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch faculty" });
  }
});

router.post("/faculty", async (req, res) => {
  try {
    const { name, email, department, password } = req.body;

    if (!name || !email || !department || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const faculty = await Faculty.create({
      name, email, department
    });

    try {
      await User.create({
        name,
        email,
        password_hash: passwordHash,
        role: "faculty",
        faculty_id: faculty._id
      });
    } catch (err) {
      await Faculty.findByIdAndDelete(faculty._id);
      throw err;
    }

    return res.status(201).json({ ...faculty.toObject(), id: faculty._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create faculty" });
  }
});

router.put("/faculty/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department } = req.body;

    const faculty = await Faculty.findByIdAndUpdate(
      id,
      { name, email, department },
      { new: true, runValidators: true }
    );

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    await User.findOneAndUpdate(
      { faculty_id: id },
      { name, email }
    );

    return res.json({ ...faculty.toObject(), id: faculty._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update faculty" });
  }
});

router.delete("/faculty/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findByIdAndDelete(id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    await User.findOneAndDelete({ faculty_id: id });

    return res.json({ message: "Faculty deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete faculty" });
  }
});

router.get("/subjects", async (_, res) => {
  try {
    const subjects = await Subject.find()
      .populate("facultyId", "name")
      .sort({ _id: -1 })
      .lean();
    
    return res.json(subjects.map(s => ({
      ...s,
      id: s._id,
      faculty_id: s.facultyId?._id || null,
      faculty_name: s.facultyId?.name || null
    })));
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

    const subject = await Subject.create({
      code, name, semester, facultyId: facultyId || null
    });

    return res.status(201).json({ ...subject.toObject(), id: subject._id, faculty_id: subject.facultyId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create subject" });
  }
});

router.put("/subjects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, semester, facultyId } = req.body;

    const subject = await Subject.findByIdAndUpdate(
      id,
      { code, name, semester, facultyId: facultyId || null },
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    return res.json({ ...subject.toObject(), id: subject._id, faculty_id: subject.facultyId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update subject" });
  }
});

router.delete("/subjects/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByIdAndDelete(id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    return res.json({ message: "Subject deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete subject" });
  }
});

export default router;
