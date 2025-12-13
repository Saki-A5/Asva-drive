import { Schema, models, model } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: { type: String, required: true },
    title: String,
    body: String,
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = models.Notification || model("Notification", NotificationSchema);

export default Notification;
