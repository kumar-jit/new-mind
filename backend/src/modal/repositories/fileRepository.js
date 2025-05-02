import File from "../schemas/File.schema.js";
import mongoose from "mongoose";
import { getAllNestedFolderIds } from "./folderRepository.js";

/**
 * Returns the next version number for a given filename in a specific folder.
 */
export const getNextFileVersionRepo = async (filename, folderId) => {
    const latest = await File.find({ filename, folder: folderId })
        .sort({ version: -1 })
        .limit(1)
        .lean();

    return latest.length > 0 ? latest[0].version + 1 : 1;
};

/**
 * Saves a new file record to the File collection.
 */
export const saveFileMetadataRepo = async (fileData, session) => {
    const [savedFile] = await File.create([fileData], { session });
    return savedFile;
};

/**
 * Checks if a file with the same name already exists in the folder.
 */
export const isDuplicateFilenameInFolderRepo = async (
    filename,
    extension,
    folderId,
    session
) => {
    return await File.findOne({
        filename,
        extension,
        folder: folderId,
    }).session(session);
};

export const deleteFileMetadataRepo = async (fileId, session) => {
    return await File.deleteOne({ _id: fileId }).session(session);
};

export const findFileByIdRepo = async (fileId, session = null) => {
    return await File.findById(fileId).session(session);
};
/**
 * Deletes a file from GridFS by its file ID.
 * @param {mongoose.Types.ObjectId} fileId - The ID of the file to be deleted.
 * @param {mongoose.ClientSession} session - The Mongoose session for transaction support.
 */

export const deleteFileRepo = async (fileId, session) => {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "uploads",
    });

    // Delete the file from GridFS
    await bucket.delete(fileId, { session: session });
};

export const updateFileNameOnlyRepo = async (
    fileId,
    newFilename,
    session = null
) => {
    return await File.findByIdAndUpdate(
        fileId,
        {
            $set: {
                filename: newFilename,
                updatedAt: new Date()
            },
        },
        { new: true, session }
    );
};

export const searchFilesRepo = async (filters, folderId, session) => {
    const { name, description, createdAfter, createdBefore } = filters;

    // Get all nested folder IDs from the root
    // not using now 
    // const folderIds = await getAllNestedFolderIds(folderId);
    // const filter = {
    //     _id: { $in: folderIds },
    // };

    const filter = {  };

    if (name) {
        filter.filename = { $regex: new RegExp(name, "i") }; // Case-insensitive search for filename
    }
    
    if (description) {
        filter.description = { $regex: new RegExp(description, "i") }; // Case-insensitive search for description
    }

    if (createdAfter) {
        filter.createdAt = { $gte: new Date(createdAfter) }; // Filter by created date after
    }

    if (createdBefore) {
        filter.createdAt = { ...filter.createdAt, $lte: new Date(createdBefore) }; // Filter by created date before
    }

    // Execute the query and return the files that match the filter
    return File.find(filter)
        .select("_id filename extension createdAt updatedAt contentType")
        .session(session)
        .lean(); // .lean() returns plain JavaScript objects instead of Mongoose documents
};


export const getFileMetadataByIdRepo = async (fileId) => {
    return await File.findById(fileId).lean();
};