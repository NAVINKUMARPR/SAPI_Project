import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import Subject from "../models/Subject.js";

dotenv.config();

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI not set");
  }

  try {
    await mongoose.connect(uri);

    const adminPassword = await bcrypt.hash("admin123", 10);
    const facultyPassword = await bcrypt.hash("faculty123", 10);
    const studentPassword = await bcrypt.hash("student123", 10);

    const faculty = await Faculty.findOneAndUpdate(
      { email: "faculty@sapi.com" },
      { name: "Default Faculty", department: "CSE" },
      { upsert: true, new: true }
    );

    const student = await Student.findOneAndUpdate(
      { rollNo: "SAPI001" },
      { name: "Default Student", email: "student@sapi.com", department: "CSE", semester: 1 },
      { upsert: true, new: true }
    );

    await User.findOneAndUpdate(
      { email: "admin@sapi.com" },
      { name: "Admin User", password_hash: adminPassword, role: "admin" },
      { upsert: true }
    );

    await User.findOneAndUpdate(
      { email: "faculty@sapi.com" },
      { name: "Default Faculty", password_hash: facultyPassword, role: "faculty", faculty_id: faculty._id },
      { upsert: true }
    );

    await User.findOneAndUpdate(
      { email: "student@sapi.com" },
      { name: "Default Student", password_hash: studentPassword, role: "student", student_id: student._id },
      { upsert: true }
    );

    await Subject.findOneAndUpdate(
      { code: "CS101" },
      { name: "Programming Fundamentals", semester: 1, facultyId: faculty._id },
      { upsert: true }
    );

    console.log("Seed completed.");
    console.log("Admin: admin@sapi.com / admin123");
    console.log("Faculty: faculty@sapi.com / faculty123");
    console.log("Student: student@sapi.com / student123");
  } catch (error) {
    console.error("Seed failed", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
