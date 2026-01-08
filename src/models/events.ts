import { model, Model, models, Schema, Types } from "mongoose";

export interface EventInterface {
    name: string, 
    collegeId: Types.ObjectId, 
    flierFile: Types.ObjectId, 
    eventStart: Date, 
    eventEnd: Date,
    status: 'UPCOMING'|'ONGOING'|'COMPLETED'
}

const eventSchema = new Schema<EventInterface>({
    name: {type: String, required: true}, 
    collegeId: {type: Schema.Types.ObjectId, required: true, ref: 'College'}, 
    flierFile: {type: Schema.Types.ObjectId, default: null, ref: 'File'}, 
    eventStart: {type: Date, required: true}, 
    eventEnd: {type: Date, required: true}, 
    status: {type: String, enum: ['UPCOMING', 'ONGOING', 'COMPLETED'], default: 'UPCOMING'}
}, {timestamps: true});

eventSchema.index({eventStart: 1, eventEnd: 1});

const EventModel: Model<EventInterface> = models.Event || model<EventInterface>("Event", eventSchema);

export default EventModel;