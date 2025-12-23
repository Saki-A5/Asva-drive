import { model, models, Schema, Types } from "mongoose";

const referencedFileSchema = new Schema({
    filename: {type: String, required:true},
    cloudinaryUrl: {type: String},
    isFolder: {type: Boolean, default: false}, 
    parentFolderId: {type: Types.ObjectId, ref: 'File', default:null},
    ownerId: {type: Types.ObjectId, ref: 'User', required: true},
    extractedText: {type: String, default: ''},
    indexed: {type: Boolean,  default: false},
    resourceType: {type: String}, 
    isRoot: {type: Boolean, default: false},
    mimeType: {type: String}, 
    sizeBytes: {type: Number, default: 0}, 
    tags: {type: [String], default:[]}, 
    isDeleted: {type: Boolean, default: false}, 
    deletedAt: {type: Date, default: null},
    referencedFileId: {type: Types.ObjectId, ref: 'File', default: null}

}, {timestamps: true});

referencedFileSchema.path('cloudinaryUrl').validate(function(v){
    if(!this.isFolder && !v){
        return false;
    }
    return true;
}, 'Files must have a Cloudinary Public Id'); // should throw an error if a file doesn't have a cloudinary Id 

referencedFileSchema.path('isRoot').validate(function(v) {
    if(!this.isFolder && v){
        return false;
    }
    return true;
}, 'Files cannot serve as a root folder');  // should throw an error if a file is has isRoot set to true

const ReferencedFileModel = models.File || model("File", referencedFileSchema);

export default ReferencedFileModel;
