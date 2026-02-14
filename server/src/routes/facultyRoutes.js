import express from "express";
import { query } from "../config/db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  computeAttendancePercentage,
  computeOverallScore,
  getPerformanceLevel
} from "../utils/performance.js";

const router = express.Router();

router.use(authenticate, authorize("faculty"));

router.get("/subjects", async (req, res) => {
  try {
    const result = await query(
      `SELECT id, code, name, semester
       FROM subjects
       WHERE faculty_id = $1
       ORDER BY id DESC`,
      [req.user.facultyId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch subjects" });
  }
});

router.post("/marks", async (req, res) => {
  try {
    const { studentId, subjectId, marksObtained, maxMarks, examType } = req.body;

    if (!studentId || !subjectId || marksObtained == null || !maxMarks) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const result = await query(
      `INSERT INTO marks (student_id, subject_id, marks_obtained, max_marks, exam_type, entered_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, student_id, subject_id, marks_obtained, max_marks, exam_type`,
      [studentId, subjectId, marksObtained, maxMarks, examType || "Internal", req.user.facultyId]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to add marks" });
  }
});

router.post("/attendance", async (req, res) => {
  try {
    const { studentId, subjectId, attendedClasses, totalClasses } = req.body;

    if (!studentId || !subjectId || attendedClasses == null || totalClasses == null) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const result = await query(
      `INSERT INTO attendance (student_id, subject_id, attended_classes, total_classes, updated_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_id, subject_id)
       DO UPDATE SET attended_classes = EXCLUDED.attended_classes,
                     total_classes = EXCLUDED.total_classes,
                     updated_by = EXCLUDED.updated_by,
                     updated_at = CURRENT_TIMESTAMP
       RETURNING id, student_id, subject_id, attended_classes, total_classes`,
      [studentId, subjectId, attendedClasses, totalClasses, req.user.facultyId]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update attendance" });
  }
});

router.get("/students", async (_, res) => {
  try {
    const result = await query(
      `SELECT id, roll_no, name, email, department, semester
       FROM students
       ORDER BY id DESC`
    );
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch students" });
  }
});

router.get("/reports/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const [studentResult, marksResult, attendanceResult] = await Promise.all([
      query("SELECT id, roll_no, name FROM students WHERE id = $1", [studentId]),
      query(
        `SELECT m.subject_id, s.name AS subject_name, m.marks_obtained, m.max_marks,
                ROUND((m.marks_obtained::numeric / NULLIF(m.max_marks, 0)) * 100, 2) AS marks_percentage
         FROM marks m
         JOIN subjects s ON s.id = m.subject_id
         WHERE m.student_id = $1
         ORDER BY m.id DESC`,
        [studentId]
      ),
      query(
        `SELECT a.subject_id, s.name AS subject_name, a.attended_classes, a.total_classes,
                ROUND((a.attended_classes::numeric / NULLIF(a.total_classes, 0)) * 100, 2) AS attendance_percentage
         FROM attendance a
         JOIN subjects s ON s.id = a.subject_id
         WHERE a.student_id = $1`,
        [studentId]
      )
    ]);

    if (!studentResult.rows[0]) {
      return res.status(404).json({ message: "Student not found" });
    }

    const markPercentages = marksResult.rows.map((m) => Number(m.marks_percentage || 0));
    const avgMarks = markPercentages.length
      ? Number((markPercentages.reduce((sum, m) => sum + m, 0) / markPercentages.length).toFixed(2))
      : 0;

    const totalAttended = attendanceResult.rows.reduce((sum, row) => sum + Number(row.attended_classes || 0), 0);
    const totalClasses = attendanceResult.rows.reduce((sum, row) => sum + Number(row.total_classes || 0), 0);
    const attendancePercentage = computeAttendancePercentage(totalAttended, totalClasses);

    const performanceScore = computeOverallScore(avgMarks, attendancePercentage);

    return res.json({
      student: studentResult.rows[0],
      marks: marksResult.rows,
      attendance: attendanceResult.rows,
      metrics: {
        averageMarks: avgMarks,
        attendancePercentage,
        performanceScore,
        performanceLevel: getPerformanceLevel(performanceScore)
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch report" });
  }
});

export default router;
