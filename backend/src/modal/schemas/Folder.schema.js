import mongoose from "mongoose";

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  path: { type: String, required: true }, // e.g., "/root/folderA"
  description: {type: String, required: true},
  fileCount: { type: Number, default: 0 },
  folderCount: { type: Number, default: 0 },
  childFolders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }],  // Direct child folders
  childFiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],      // Direct child files
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

folderSchema.index({ name: 'text', path: 'text' });
folderSchema.index({ name: 1, parent: 1 }, { unique: true });

export default mongoose.model('Folder', folderSchema);
