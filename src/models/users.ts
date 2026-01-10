import { Schema, Types, model, models } from "mongoose";
import { COLLEGE_IDS } from "./colleges";

const userSchema = new Schema(
  {
    name: { type: String, required: [true, "Name field is required"] },
    email: { type: String, unique: true, trim: true, required: true },
    password: { type: String }, 
    role: { type: String, enum: ["admin", "user"], default: "user" },
    firebaseUid: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ["google", "email"], default: "email" },
    matricNumber: { type: String },
    collegeId: { type: String, enum: Object.values(COLLEGE_IDS), ref: 'College'},
    department: { type: String },
    currentLevel: { type: String },
    avatarStyle: { type: String },
    avatarSeed: { type: String },
  },
  { timestamps: true }
);

// Prevent model overwrite issue in Next.js
const User = models.User || model("User", userSchema);

export default User;
