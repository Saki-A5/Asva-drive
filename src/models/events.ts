import { model, Model, models, Schema, Types } from "mongoose";
import { COLLEGE_IDS } from "./colleges";

export interface EventInterface {
    name: string,
    description: string,
    collegeId: COLLEGE_IDS,
    createdBy?: Types.ObjectId,
    flierFile?: Types.ObjectId | null;
    eventStart: Date;
    eventEnd: Date;
    status: "UPCOMING" | "ONGOING" | "COMPLETED";
    isDeleted?: boolean;
    deletedAt?: Date | null;
}

const eventSchema = new Schema<EventInterface>({
    name: { type: String, required: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    collegeId: { type: String, enum: Object.values(COLLEGE_IDS), required: true, ref: "College" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    flierFile: { type: Schema.Types.ObjectId, default: null, ref: "File" },
    eventStart: { type: Date, required: true },
    eventEnd: { type: Date, required: true },
    status: { type: String, enum: ["UPCOMING", "ONGOING", "COMPLETED"], default: "UPCOMING" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
}, { timestamps: true });

eventSchema.index({eventStart: 1, eventEnd: 1});

const EventModel: Model<EventInterface> = models.Event || model<EventInterface>("Event", eventSchema);

export default EventModel;