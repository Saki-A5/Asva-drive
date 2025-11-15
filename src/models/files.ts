import { model, models, Schema, Types } from "mongoose";
import { required } from "node_modules/zod/v4/core/util.cjs";

const fileSchema = new Schema({
    filename: {type: String, required:true},
    cloudinaryPublicId: {type: String},
    fileLocation:{type: String},
    isFolder: {type: Boolean, default: false}, 
    parentFolderId: {type: Types.ObjectId, ref: 'File', default:null},
    ownerId: {type: Types.ObjectId, ref: 'User', required: true}, 
    resourceType: {type: String}, 
    mimeType: {type: String}, 
    sizeBytes: {type: Number}, 
    tags: {type: [String], default:[]}, 

}, {timestamps: true});

fileSchema.path('cloudinaryPublicId').validate(function(v){
    if(!this.isFolder && !v){
        return false;
    }
    return true;
}, 'Files must have a Cloudinary Public Id'); // should throw an error if a file doesn't have a cloudinary Id 

const File = models.File || model("File", fileSchema);

export default File;