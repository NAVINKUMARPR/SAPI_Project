import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },
    attended_classes: {
      type: Number,
      required: true,
      min: 0
    },
    total_classes: {
      type: Number,
      required: true,
      min: 1
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty"
    }
  },
  { timestamps: true }
);

// Compound unique index on student and subject
attendanceSchema.index({ student_id: 1, subject_id: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
