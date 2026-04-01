import express from "express";
import Student from "../models/Student.js";
import Mark from "../models/Mark.js";
import Attendance from "../models/Attendance.js";
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
    const marks = await Mark.find({ student_id: req.user.studentId })
      .populate("subject_id", "name")
      .sort({ _id: -1 })
      .lean();

    const result = marks.map(m => {
      const percentage = m.max_marks ? ((m.marks_obtained / m.max_marks) * 100).toFixed(2) : 0;
      return {
        id: m._id,
        subject_name: m.subject_id?.name,
        marks_obtained: m.marks_obtained,
        max_marks: m.max_marks,
        exam_type: m.exam_type,
        marks_percentage: percentage
      };
    });

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch marks" });
  }
});

router.get("/me/attendance", async (req, res) => {
  try {
    const attendance = await Attendance.find({ student_id: req.user.studentId })
      .populate("subject_id", "name")
      .sort({ _id: -1 })
      .lean();

    const result = attendance.map(a => {
      const percentage = a.total_classes ? ((a.attended_classes / a.total_classes) * 100).toFixed(2) : 0;
      return {
        id: a._id,
        subject_name: a.subject_id?.name,
        attended_classes: a.attended_classes,
        total_classes: a.total_classes,
        attendance_percentage: percentage
      };
    });

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch attendance" });
  }
});

router.get("/me/performance", async (req, res) => {
  try {
    const studentId = req.user.studentId;

    const student = await Student.findById(studentId).lean();
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const [marks, attendance] = await Promise.all([
      Mark.find({ student_id: studentId }).lean(),
      Attendance.find({ student_id: studentId }).lean()
    ]);

    const markPercentages = marks.map(m => Number(m.max_marks ? ((m.marks_obtained / m.max_marks) * 100).toFixed(2) : 0));
    const averageMarks = markPercentages.length ? Number((markPercentages.reduce((sum, m) => sum + m, 0) / markPercentages.length).toFixed(2)) : 0;

    const totalAttended = attendance.reduce((sum, row) => sum + Number(row.attended_classes || 0), 0);
    const totalClasses = attendance.reduce((sum, row) => sum + Number(row.total_classes || 0), 0);

    const attendancePercentage = computeAttendancePercentage(totalAttended, totalClasses);
    const performanceScore = computeOverallScore(averageMarks, attendancePercentage);

    return res.json({
      student: { ...student, id: student._id },
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
