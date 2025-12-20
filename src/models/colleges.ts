import { Schema, model, models } from "mongoose";

const collegeSchema = new Schema(
  {
    name: { type: String, required: [true, "Name field is required"] },
  },
  { timestamps: true }
);

// Prevent model overwrite issue in Next.js
const College = models.College || model("College", collegeSchema);

export default College;
