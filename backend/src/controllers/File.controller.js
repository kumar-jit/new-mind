import mongoose from "mongoose";
import { ErrorHandler } from "../utils/error/customeError.js";
import { getGridfsBucket } from "../connection/mongooseConfig.js";
import { Readable } from "stream";
import {
    addFileToFolderRepo,
    findFolderByIdRepo,
    searchFoldersRepo,
    updateParentWithNewFolderRepo,
} from "../modal/repositories/folderRepository.js";
import {
    deleteFileMetadataRepo,
    deleteFileRepo,
    findFileByIdRepo,
    getFileMetadataByIdRepo,
    getNextFileVersionRepo,
    isDuplicateFilenameInFolderRepo,
    saveFileMetadataRepo,
    searchFilesRepo,
    updateFileNameOnlyRepo,
} from "../modal/repositories/fileRepository.js";
import { sseManager } from "../utils/sseClients.js";

export const uploadFileController = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const bucket = getGridfsBucket();
        const files = req.files;
        const { folderId, clientId } = req.body;

        if (!files || files.length === 0) {
            throw new ErrorHandler(400, "No files uploaded.");
        }

        if (!folderId || !mongoose.Types.ObjectId.isValid(folderId)) {
            throw new ErrorHandler(400, "Invalid or missing folderId.");
        }

        const folder = await findFolderByIdRepo(folderId, session);
        if (!folder) {
            throw new ErrorHandler(404, "Target folder not found.");
        }

        const uploadedFiles = [];

        for (const file of files) {
            const [sanitizedFilename, fileExtension] = file.originalname
                .replace(/[^a-zA-Z0-9.\-_]/g, "_")
                .split(".");
            const createdAt = new Date();

            const isDuplicate = await isDuplicateFilenameInFolderRepo(
                sanitizedFilename,
                fileExtension,
                folderId,
                session
            );
            if (isDuplicate) {
                sseManager.sendToClient(clientId, {
                    type: "duplicate",
                    filename: sanitizedFilename,
                    message: `File "${sanitizedFilename}" already exists in this folder.`,
                });
                continue;
            }

            const version = await getNextFileVersionRepo(
                sanitizedFilename,
                folderId
            );

            // Stream file with progress tracking
            const readBuffer = new Readable();
            readBuffer.push(file.buffer);
            readBuffer.push(null);

            const totalSize = file.buffer.length;
            let uploadedSize = 0;

            const uploadStream = bucket.openUploadStream(sanitizedFilename, {
                contentType: file.mimetype,
            });

            readBuffer.on("data", (chunk) => {
                uploadedSize += chunk.length;
                const percent = Math.round((uploadedSize / totalSize) * 100);
                sseManager.sendToClient(clientId, {
                    type: "upload-progress",
                    filename: sanitizedFilename,
                    progress: percent,
                });
            });

            await new Promise((resolve, reject) => {
                readBuffer
                    .pipe(uploadStream)
                    .on("finish", resolve)
                    .on("error", (err) => {
                        console.error("GridFS error:", err);
                        reject(
                            new ErrorHandler(
                                500,
                                "Failed to upload file to GridFS."
                            )
                        );
                    });
            });

            const savedFile = await saveFileMetadataRepo(
                {
                    filename: sanitizedFilename,
                    contentType: file.mimetype,
                    extension: fileExtension,
                    fileId: uploadStream.id,
                    folder: folder._id,
                    version,
                    createdAt,
                    updatedAt: createdAt,
                },
                session
            );

            await addFileToFolderRepo(folderId, savedFile._id, session);

            uploadedFiles.push({
                _id: savedFile._id,
                filename: sanitizedFilename,
                version,
                fileId: uploadStream.id,
                createdAt,
            });
        }

        await session.commitTransaction();

        console.log(
            `Successfully uploaded ${uploadedFiles.length} file(s) to folder "${folder.name}"`
        );

        res.status(201).json({
            success: true,
            message: `${uploadedFiles.length} file(s) uploaded successfully.`,
            uploadedFiles,
        });
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

export const deleteFileController = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { fileId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            throw new ErrorHandler(400, "Invalid fileId");
        }

        // Fetch file metadata
        const file = await findFileByIdRepo(fileId, session);
        if (!file) {
            throw new ErrorHandler(404, "File not found");
        }

        const folderId = file.folder;

        // Confirm folder still exists
        const folder = await findFolderByIdRepo(folderId, session);
        if (!folder) {
            throw new ErrorHandler(404, "Associated folder not found");
        }

        // Delete file from GridFS
        await deleteFileRepo(file.fileId, session);

        // Delete file metadata
        await deleteFileMetadataRepo(fileId, session);

        // Remove reference from folder
        await updateParentWithNewFolderRepo(folderId, fileId, -1, session);

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: `File "${file.filename}" deleted successfully from folder "${folder.name}".`,
            deletedFile: file,
        });
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

export const updateFileNameController = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { fileId } = req.params;
        const { newName } = req.body;

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            throw new ErrorHandler(400, "Invalid file ID");
        }

        if (!newName || typeof newName !== "string") {
            throw new ErrorHandler(
                400,
                "New filename is required and must be a string"
            );
        }

        const sanitizedFilename = newName.replace(/[^a-zA-Z0-9\-_]/g, "_");

        if (!sanitizedFilename) {
            throw new ErrorHandler(400, "Invalid file name");
        }

        const file = await findFileByIdRepo(fileId, session);
        if (!file) {
            throw new ErrorHandler(404, "File not found");
        }

        const isDuplicate = await isDuplicateFilenameInFolderRepo(
            sanitizedFilename,
            file.extension,
            file.folder,
            session
        );

        const isNameChanged = sanitizedFilename !== file.filename;

        if (isDuplicate && isNameChanged) {
            throw new ErrorHandler(
                400,
                "A file with the same name already exists in this folder"
            );
        }

        const updatedFile = await updateFileNameOnlyRepo(
            fileId,
            sanitizedFilename,
            session
        );

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: "File name updated successfully",
            updatedFile,
        });
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

export const searchInFolderController = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { folderId } = req.params;
        const { name, description, createdAfter, createdBefore } = req.query;

        // Validate folder ID
        if (!mongoose.Types.ObjectId.isValid(folderId)) {
            throw new ErrorHandler(400, "Invalid folder ID");
        }

        // Build search filters based on query parameters
        const filters = {
            name: name || null,
            description: description || null,
            createdAfter: createdAfter || null,
            createdBefore: createdBefore || null,
        };

        // Get filtered folders and files
        const [folders, files] = await Promise.all([
            searchFoldersRepo(filters, folderId, session),
            searchFilesRepo(filters, session),
        ]);

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            query: filters,
            results: { folders, files },
        });
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

export const streamFileByIdController = async (req, res, next) => {
    try {
        const { fileId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            throw new ErrorHandler(400, "Invalid file ID.");
        }

        const fileMeta = await getFileMetadataByIdRepo(fileId);
        if (!fileMeta) {
            throw new ErrorHandler(404, "File metadata not found.");
        }

        const bucket = getGridfsBucket();

        const downloadStream = bucket.openDownloadStream(fileMeta.fileId);

        res.setHeader("Content-Type", fileMeta.contentType);
        res.setHeader(
            "Content-Disposition",
            `inline; filename="${fileMeta.filename}.${fileMeta.extension}"`
        );

        downloadStream.on("error", (err) => {
            console.error("Stream error:", err);
            return next(
                new ErrorHandler(500, "Error reading file from GridFS.")
            );
        });

        downloadStream.pipe(res);
    } catch (err) {
        next(err);
    }
};
