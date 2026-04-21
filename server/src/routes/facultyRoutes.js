import express from "express";
import Subject from "../models/Subject.js";
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

router.use(authenticate, authorize("faculty"));

router.get("/subjects", async (_, res) => {
  try {
    const subjects = await Subject.find()
      .sort({ _id: -1 })
      .lean();

    return res.json(subjects.map(s => ({ ...s, id: s._id })));
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

    const mark = await Mark.create({
      student_id: studentId,
      subject_id: subjectId,
      marks_obtained: marksObtained,
      max_marks: maxMarks,
      exam_type: examType || "Internal",
      entered_by: req.user.facultyId
    });

    return res.status(201).json({ ...mark.toObject(), id: mark._id });
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

    const attendance = await Attendance.findOneAndUpdate(
      { student_id: studentId, subject_id: subjectId },
      {
        attended_classes: attendedClasses,
        total_classes: totalClasses,
        updated_by: req.user.facultyId
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(201).json({ ...attendance.toObject(), id: attendance._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update attendance" });
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

router.get("/reports/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).lean();
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const [marks, attendance] = await Promise.all([
      Mark.find({ student_id: studentId }).populate("subject_id", "name").sort({ _id: -1 }).lean(),
      Attendance.find({ student_id: studentId }).populate("subject_id", "name").lean()
    ]);

    const formattedMarks = marks.map(m => {
      const percentage = m.max_marks ? ((m.marks_obtained / m.max_marks) * 100).toFixed(2) : 0;
      return {
        subject_id: m.subject_id?._id,
        subject_name: m.subject_id?.name,
        marks_obtained: m.marks_obtained,
        max_marks: m.max_marks,
        marks_percentage: percentage
      };
    });

    const formattedAttendance = attendance.map(a => {
      const percentage = a.total_classes ? ((a.attended_classes / a.total_classes) * 100).toFixed(2) : 0;
      return {
        subject_id: a.subject_id?._id,
        subject_name: a.subject_id?.name,
        attended_classes: a.attended_classes,
        total_classes: a.total_classes,
        attendance_percentage: percentage
      };
    });

    const markPercentages = formattedMarks.map(m => Number(m.marks_percentage || 0));
    const avgMarks = markPercentages.length
      ? Number((markPercentages.reduce((sum, m) => sum + m, 0) / markPercentages.length).toFixed(2))
      : 0;

    const totalAttended = formattedAttendance.reduce((sum, row) => sum + Number(row.attended_classes || 0), 0);
    const totalClasses = formattedAttendance.reduce((sum, row) => sum + Number(row.total_classes || 0), 0);
    const attendancePercentage = computeAttendancePercentage(totalAttended, totalClasses);

    const performanceScore = computeOverallScore(avgMarks, attendancePercentage);

    return res.json({
      student: { ...student, id: student._id },
      marks: formattedMarks,
      attendance: formattedAttendance,
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
