import { Schema, model, models } from "mongoose";

const passwordResetSchema = new Schema(
  {
    email: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, expires: 0 }, // Auto-delete after expiration
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent model overwrite issue in Next.js
const PasswordReset = models.PasswordReset || model("PasswordReset", passwordResetSchema);

export default PasswordReset;

