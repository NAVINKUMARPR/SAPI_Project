import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password_hash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "faculty", "student"]
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null
    },
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
