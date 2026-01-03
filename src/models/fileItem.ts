import { Model, model, models, Schema, Types } from "mongoose";

export interface FileItemInterface {
    filename: string, 
    isFolder: boolean, 
    parentFolderId?: Types.ObjectId, 
    ownerId: Types.ObjectId, 
    isRoot: boolean, 
    isDeleted:boolean, 
    deletedAt?: Date, 
    ownerType: 'User'|'College', 
    isReference: boolean, 
    file?: Types.ObjectId
}

const fileItemSchema = new Schema<FileItemInterface>({
    filename: {type: String, required:true},
    isFolder: {type: Boolean, default: false}, 
    parentFolderId: {type: Types.ObjectId, ref: 'FileItem', default:null},
    ownerId: {type: Schema.Types.ObjectId, refpath: 'ownerType', required: true},// FileItems are either owned by colleges or users
    isRoot: {type: Boolean, default: false},    // indicates whether the folder is a root folder
    isDeleted: {type: Boolean, default: false}, 
    deletedAt: {type: Date, default: null},
    ownerType: {type: String, enum: ['College', 'User'], required: true}, 
    isReference: {type: Boolean, default: false}, 
    file: {type: Schema.Types.ObjectId, ref: 'File', default: null}
}, {timestamps: true});

fileItemSchema.path('isRoot').validate(function(v) {
    if(!this.isFolder && v){
        return false;
    }
    return true;
}, 'Files cannot serve as a root folder');  // should throw an error if a file is has isRoot set to true

fileItemSchema.path('isReference').validate(function(v) {
    if(v && this.ownerType === 'College') return false;
    return true;
}, "Colleges can't own reference files");

fileItemSchema.path('isRoot').validate(function(v) {
    if(v && !this.isFolder) return false;
    return true;
}, 'Files cannot serve as root folders')

const FileItemModel: Model<FileItemInterface> = models.FileItem ||  model<FileItemInterface>("FileItem", fileItemSchema);

export default FileItemModel;
