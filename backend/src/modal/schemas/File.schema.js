

import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    extension: { type: String, required: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // GridFS file ID
    folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", required: true },
    version: { type: Number, required: true, default: 1 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

// Unique index: no duplicate filename + extension in the same folder
fileSchema.index({ filename: 1, extension: 1, folder: 1 }, { unique: true });

export default mongoose.model("File", fileSchema);