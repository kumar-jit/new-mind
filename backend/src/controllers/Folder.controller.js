import mongoose from "mongoose";

import { ErrorHandler } from "../utils/error/customeError.js";
import {
    createFolderRepo,
    deleteFolderRepo,
    findFolderByIdRepo,
    findFolderByPathRepo,
    findUnifiedFolderContentsRepo,
    getTotalFilesAndFoldersRepo,
    isFolderNameTakenRepo,
    updateFolderByIdRepo,
    updateParentWithNewFolderRepo,
} from "../modal/repositories/folderRepository.js";
import { getRootFolderId } from "../connection/rootFolderDetails.js";

export const createFolderController = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, description, parentId } = req.body;

        if (!name || !description) {
            throw new ErrorHandler(400, "Name and description are required");
        }

        const rootFolderInfo = getRootFolderId();
        const actualParentId = parentId || rootFolderInfo.id;

        const existing = await isFolderNameTakenRepo(
            name,
            actualParentId,
            session
        );
        if (existing) {
            throw new ErrorHandler(
                400,
                "A folder with the same name already exists under this parent."
            );
        }

        const parentFolder = await findFolderByIdRepo(actualParentId, session);
        if (!parentFolder) {
            throw new ErrorHandler(404, "Parent folder not found");
        }

        const path = `${parentFolder.path}/${name}`;

        const folder = await createFolderRepo(
            {
                name,
                description,
                parent: actualParentId,
                path,
            },
            session
        );

        // Update parent's child folder list and count
        await updateParentWithNewFolderRepo(
            actualParentId,
            folder._id,
            1,
            session
        );

        await session.commitTransaction();
        res.status(201).json({ success: true, folder });
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};
export const updateFolderController = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const id = req.params.folderId;
        const { name, description } = req.body;

        const folder = await findFolderByIdRepo(id, session);
        if (!folder) throw new ErrorHandler(404, "Folder not found");

        const updates = {};

        if (name && name !== folder.name) {
            const siblingExists = await isFolderNameTakenRepo(
                name,
                folder.parent,
                session
            );
            if (siblingExists) {
                throw new ErrorHandler(
                    400,
                    "A sibling folder with the same name already exists."
                );
            }

            // Update name and path
            updates.name = name;
            const pathSegments = folder.path.split("/");
            pathSegments[pathSegments.length - 1] = name;
            updates.path = pathSegments.join("/");
        }

        if (description) updates.description = description;
        updates.updatedAt = new Date();

        const updatedFolder = await updateFolderByIdRepo(id, updates, session);

        await session.commitTransaction();
        res.status(200).json({ success: true, folder: updatedFolder });
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};
export const getFolderContentsController = async (req, res, next) => {
    try {
      const { path, folderId, sortBy, top, skip } = req.query;
  
      let folderObjectId = folderId;
      let normalizedPath = path?.replace(/\/+$/, '');
  
      // Resolve folderId if only path is provided
      if (!folderObjectId && normalizedPath) {
        const folder = await findFolderByPathRepo(normalizedPath);
        if (!folder) throw new ErrorHandler(404, 'Folder not found');
        folderObjectId = folder._id;
      }
  
      // Fallback to root folder if neither path nor folderId is provided
      if (!folderObjectId && !normalizedPath) {
        const root = await getRootFolderId();
        if (!root || !root.id) throw new ErrorHandler(500, 'Root folder not initialized');
        folderObjectId = root.id;
      }
  
      const paginationOptions = {
        limit: top ? parseInt(top) : undefined,
        skip: skip ? parseInt(skip) : undefined,
      };
  
      const result = await findUnifiedFolderContentsRepo(folderObjectId, sortBy, paginationOptions);
      if (!result) throw new ErrorHandler(404, 'Folder not found');
  
      res.status(200).json({
        success: true,
        folder: {
          _id: result.folderId,
          name: result.folder.name,
          path: result.folder.path,
          createdAt: result.folder.createdAt,
          updatedAt: result.folder.updatedAt,
          contents: result.contents,
        },
      });
    } catch (err) {
      next(err);
    }
  };

export const deleteFolderController = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { folderId } = req.params;

        if (!folderId) {
            throw new ErrorHandler(400, 'Folder ID is required');
        }

        // Call repo to delete the folder and its children
        const deletedFolder = await deleteFolderRepo(folderId, session);

        await session.commitTransaction();
        res.status(200).json({
            success: true,
            message: `Folder with ID ${folderId} and its contents have been deleted successfully.`,
            deletedFolder
        });
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

export const getTotalStatsController = async (req, res, next) => {
    try {
      const { totalFiles, totalFolders } = await getTotalFilesAndFoldersRepo();
      res.status(200).json({ totalFiles, totalFolders });
    } catch (error) {
      next(error)
    }
};