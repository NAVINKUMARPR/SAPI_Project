import express from "express";
import { query } from "../config/db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  computeAttendancePercentage,
  computeOverallScore,
  getPerformanceLevel
} from "../utils/performance.js";

const router = express.Router();

router.use(authenticate, authorize("student"));

router.get("/me/marks", async (req, res) => {
  try {
    const result = await query(
      `SELECT m.id, s.name AS subject_name, m.marks_obtained, m.max_marks, m.exam_type,
              ROUND((m.marks_obtained::numeric / NULLIF(m.max_marks, 0)) * 100, 2) AS marks_percentage
       FROM marks m
       JOIN subjects s ON s.id = m.subject_id
       WHERE m.student_id = $1
       ORDER BY m.id DESC`,
      [req.user.studentId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch marks" });
  }
});

router.get("/me/attendance", async (req, res) => {
  try {
    const result = await query(
      `SELECT a.id, s.name AS subject_name, a.attended_classes, a.total_classes,
              ROUND((a.attended_classes::numeric / NULLIF(a.total_classes, 0)) * 100, 2) AS attendance_percentage
       FROM attendance a
       JOIN subjects s ON s.id = a.subject_id
       WHERE a.student_id = $1
       ORDER BY a.id DESC`,
      [req.user.studentId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch attendance" });
  }
});

router.get("/me/performance", async (req, res) => {
  try {
    const studentId = req.user.studentId;

    const [studentResult, marksResult, attendanceResult] = await Promise.all([
      query("SELECT id, roll_no, name, department, semester FROM students WHERE id = $1", [studentId]),
      query(
        `SELECT ROUND((marks_obtained::numeric / NULLIF(max_marks, 0)) * 100, 2) AS marks_percentage
         FROM marks
         WHERE student_id = $1`,
        [studentId]
      ),
      query(
        `SELECT attended_classes, total_classes
         FROM attendance
         WHERE student_id = $1`,
        [studentId]
      )
    ]);

    if (!studentResult.rows[0]) {
      return res.status(404).json({ message: "Student not found" });
    }

    const marks = marksResult.rows.map((m) => Number(m.marks_percentage || 0));
    const averageMarks = marks.length ? Number((marks.reduce((sum, m) => sum + m, 0) / marks.length).toFixed(2)) : 0;

    const totalAttended = attendanceResult.rows.reduce((sum, row) => sum + Number(row.attended_classes || 0), 0);
    const totalClasses = attendanceResult.rows.reduce((sum, row) => sum + Number(row.total_classes || 0), 0);

    const attendancePercentage = computeAttendancePercentage(totalAttended, totalClasses);
    const performanceScore = computeOverallScore(averageMarks, attendancePercentage);

    return res.json({
      student: studentResult.rows[0],
      averageMarks,
      attendancePercentage,
      performanceScore,
      performanceLevel: getPerformanceLevel(performanceScore)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch performance" });
  }
});

export default router;
