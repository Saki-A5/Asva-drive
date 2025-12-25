import { model, models, Schema, Types } from "mongoose";

const fileSchema = new Schema({
    filename: {type: String, required:true},
    cloudinaryUrl: {type: String},
    // fileLocation:{type: String}, // this was removed because changing this would require changing the fileLocation of all the children
    isFolder: {type: Boolean, default: false}, 
    parentFolderId: {type: Types.ObjectId, ref: 'File', default:null},
    ownerId: {type: String, ref: 'User', required: true}, 
    extractedText: {type: String, default: ''},
    indexed: {type: Boolean,  default: false},
    resourceType: {type: String}, 
    isRoot: {type: Boolean, default: false},    // indicates whether the folder is a root folder
    mimeType: {type: String}, 
    sizeBytes: {type: Number, default: 0}, 
    tags: {type: [String], default:[]}, 
    isDeleted: {type: Boolean, default: false}, 
    deletedAt: {type: Date, default: null}, 
    reference: {
        isReference: {required: true, default: false, type: Boolean}, 
        referencedFile: {default: null, type: Types.ObjectId}
    }, 
    college: {type: Types.ObjectId, required: true, ref: 'College'}

}, {timestamps: true});

fileSchema.path('cloudinaryUrl').validate(function(v){
    if(!this.isFolder && !v){
        return false;
    }
    return true;
}, 'Files must have a Cloudinary Public Id'); // should throw an error if a file doesn't have a cloudinary Id 

fileSchema.path('isRoot').validate(function(v) {
    if(!this.isFolder && v){
        return false;
    }
    return true;
}, 'Files cannot serve as a root folder');  // should throw an error if a file is has isRoot set to true

const FileModel = models.File || model("File", fileSchema);

export default FileModel;
