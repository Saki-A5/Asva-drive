import { Model, model, models, Schema, Types } from "mongoose";
import { COLLEGE_IDS } from "./colleges";

export interface FileInterface {
    filename: string, 
    cloudinaryUrl: string, 
    ownerId: COLLEGE_IDS, 
    extractedText: string, 
    uploadedBy: Types.ObjectId, 
    indexed: boolean, 
    resourceType: string, 
    mimeType?: string, 
    sizeBytes?: number, 
    tags: string[], 
    isDeleted: boolean, 
    deletedAt?: Date,
    createdAt?: Date,   
    updatedAt?: Date,
}

const fileSchema = new Schema<FileInterface>({
    filename: {type: String, required:true},
    cloudinaryUrl: {type: String, required: true},
    ownerId: {type: String, enum: Object.values(COLLEGE_IDS), ref: 'College', required: true}, 
    extractedText: {type: String, default: ''},
    uploadedBy: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    indexed: {type: Boolean,  default: false},
    resourceType: {type: String, required: true}, 
    mimeType: {type: String}, 
    sizeBytes: {type: Number, default: 0}, 
    tags: {type: [String], default:[]}, 
    isDeleted: {type: Boolean, default: false}, 
    deletedAt: {type: Date, default: null},

}, {timestamps: true});


const FileModel: Model<FileInterface> = models.File || model<FileInterface>("File", fileSchema);

export default FileModel;
