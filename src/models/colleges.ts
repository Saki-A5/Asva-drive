import { Model, Schema, model, models } from "mongoose";


export enum COLLEGE_IDS{
  SCIENCE= "COLLEGE_OF_SCIENCES",
  ENGINEERING= "COLLEGE_OF_ENGINEERING",
  LAW= "COLLEGE_OF_LAW",
  MEDICINE= "COLLEGE_OF_MEDICINE",
  SMS= "COLLEGE_OF_SMS",
  PHARMACY= "COLLEGE_OF_PHARMACY",
}

export enum COLLEGE_NAMES {
  SCIENCE="College of Sciences", 
  ENGINEERING='College of Engineering', 
  LAW='College of Law', 
  MEDICINE='College of Medicine', 
  PHARMACY='College of Pharmacy', 
  SMS='College of Social Management Sciences'
}

export enum COLLEGE_SLUGS {
  SCIENCE='science', 
  ENGINEERING='engineering', 
  LAW='law', 
  SMS='sms', 
  MEDICINE='medicine', 
  PHARMACY='pharmacy'
}
export interface ICollege {
  _id: COLLEGE_IDS;
  name: COLLEGE_NAMES;
  slug: COLLEGE_SLUGS;
}

const collegeSchema = new Schema<ICollege>(
  {
    _id: { type: String, enum: Object.values(COLLEGE_IDS), required: true },
    name: { type: String, enum: Object.values(COLLEGE_NAMES), required: [true, "Name field is required"] },
    slug: { type: String, enum: Object.values(COLLEGE_SLUGS), required: [true, 'Slug Field Required'] }
  },
  { timestamps: true }
);

// Prevent model overwrite issue in Next.js
const College: Model<ICollege> = models.College || model("College", collegeSchema);

export default College;
