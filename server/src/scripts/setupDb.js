import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function setupDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set");
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`Connected to MongoDB at ${conn.connection.host}`);
    console.log("Database and collections will be created automatically upon first document insertion.");
    process.exit(0);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  }
}

setupDb();
