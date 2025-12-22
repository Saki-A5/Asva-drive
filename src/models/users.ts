import { Schema, Types, model, models } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: [true, "Name field is required"] },
    email: { type: String, unique: true, trim: true, required: true },
    password: { type: String }, 
    role: { type: String, enum: ["admin", "user"], default: "user" },
    firebaseUid: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ["google", "email"], default: "email" },
    collegeId: {type: Types.ObjectId, ref: 'College'}
  },
  { timestamps: true }
);

// Prevent model overwrite issue in Next.js
const User = models.User || model("User", userSchema);

export default User;
