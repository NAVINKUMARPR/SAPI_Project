import mongoose from "mongoose";

const markSchema = new mongoose.Schema(
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
    marks_obtained: {
      type: Number,
      required: true,
      min: 0
    },
    max_marks: {
      type: Number,
      required: true,
      min: 1
    },
    exam_type: {
      type: String,
      default: "Internal"
    },
    entered_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Mark", markSchema);
