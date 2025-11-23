import { Schema, model, models } from 'mongoose'

const fileSchema = new Schema(
  {
    name: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    mimeType: { type: String },
    size: { type: Number },
    tags: { type: [String], default: [] },
    cloudinaryUrl: { type: String },
    extractedText: { type: String, default: '' },
    // store whether the item has been indexed (optional)
    indexed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const FileModel = models.File || model('File', fileSchema)

export default FileModel
