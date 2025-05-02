
import Folder from "../schemas/Folder.schema.js";
import File from "../schemas/File.schema.js";
import { ErrorHandler } from "../../utils/error/customeError.js";
import { deleteFileMetadataRepo, deleteFileRepo } from "./fileRepository.js";

export const createFolderRepo = async (folderData, session) => {
    const [folder] = await Folder.create([folderData], { session });
    return folder;
};

export const findFolderByIdRepo = async (id, session) => {
    return await Folder.findById(id).session(session);
};

export const updateFolderByIdRepo = async (id, updateData, session) => {
    return await Folder.findByIdAndUpdate(id, updateData, {
        new: true,
        session,
    });
};

export const updateParentWithNewFolderRepo = async (
    parentId,
    folderId,
    count = 1,
    session
) => {
    return await Folder.findByIdAndUpdate(
        parentId,
        {
            $inc: { folderCount: count },
            $push: { childFolders: folderId },
        },
        { session }
    );
};

export const isFolderNameTakenRepo = async (name, parentId, session) => {
    return Folder.findOne({ name, parent: parentId || null }).session(session);
};

export const findFolderByPathRepo = async (path) => {
    return await Folder.findOne({ path });
};

export const addFileToFolderRepo = async (folderId, fileId, session) => {
    return await Folder.findByIdAndUpdate(
        folderId,
        {
            $push: { childFiles: fileId },
            $inc: { fileCount: 1 },
            $set: { updatedAt: new Date() },
        },
        { new: true, session }
    );
};

export const findUnifiedFolderContentsRepo = async (
    folderId,
    sortBy = null,
    pagination = {}
) => {
    const { limit, skip } = pagination;

    // Step 1: Fetch the folder details (folder metadata)
    const folder = await Folder.findById(folderId)
        .select("name path createdAt updatedAt")
        .lean();
    if (!folder) return null;

    // Step 2: Fetch child folders with pagination (skip, limit)
    const folderQuery = Folder.find({ parent: folderId })
        .select("name description createdAt updatedAt")
        .skip(skip || 0) // Pagination logic for folder query
        .limit(limit || 0) // Pagination logic for folder query
        .lean();

    const folders = await folderQuery;

    const folderItems = folders.map((f) => ({
        type: "folder",
        _id: f._id,
        name: f.name,
        description: f.description,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
    }));

    // Step 3: Fetch child files from custom File collection
    const fileQuery = File.find({ folder: folderId })
        .select("_id filename extension createdAt updatedAt")
        .skip(skip || 0)
        .limit(limit || 0)
        .lean();

    const files = await fileQuery;

    // Transform files to match expected format
    const fileItems = files.map((file) => ({
        type: "file",
        _id: file._id,
        name: file.filename,
        extenstion: file.extension,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
    }));

    // Step 4: Combine folders and files
    let contents = [...folderItems, ...fileItems];

    // Step 5: Apply sorting only if requested (sort by `createdAt`, `updatedAt`, `type`, or `name`)
    if (sortBy) {
        if (sortBy === "createdAt" || sortBy === "updatedAt") {
            contents.sort((a, b) => new Date(a[sortBy]) - new Date(b[sortBy]));
        } else if (sortBy === "type") {
            contents.sort((a, b) => a.type.localeCompare(b.type));
        } else {
            contents.sort((a, b) => a.name.localeCompare(b.name));
        }
    }

    // Step 6: Return the folder details along with its contents (folders and files)
    return {
        folderId: folder._id,
        folder: {
            _id: folder._id,
            name: folder.name,
            path: folder.path,
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
        },
        contents,
    };
};

export const deleteFolderRepo = async (folderId, session) => {
    const folder = await Folder.findById(folderId).session(session);
  
    if (!folder) {
      throw new ErrorHandler(404, 'Folder not found');
    }
  
    // Recursively delete child folders
    for (let childFolderId of folder.childFolders) {
      await deleteFolderRepo(childFolderId, session);
    }
  
    // Fetch and delete files in the folder
    const files = await File.find({ folder: folderId }).session(session);
  
    for (const file of files) {
      await deleteFileRepo(file.fileId, session);               // GridFS delete
      await deleteFileMetadataRepo(file._id, session);          // Metadata delete
    }
  
    // Delete the folder itself
    await Folder.deleteOne({ _id: folder._id }).session(session);
  
    return folder;
  };

export const ensureRootFolderRepo = async () => {
    let root = await Folder.findOne({ path: "/root", parent: null });
    if (!root) {
        root = await Folder.create({
            name: "root",
            path: "/root",
            parent: null,
            description: "Root directory",
        });
        console.log("Root folder created.");
    } else {
        console.log("Root folder already exists.");
    }
    return root;
};


export const searchFoldersRepo = async (filters, folderId, session) => {
    const { name, description, createdAfter, createdBefore } = filters;


    // Get all nested folder IDs from the root
    // not using now 
    // const folderIds = await getAllNestedFolderIds(folderId);
    // const filter = {
    //     _id: { $in: folderIds },
    // };

    const filter = { };


    if (name) {
        filter.name = { $regex: new RegExp(name, "i") };  // Case-insensitive search for name
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

    // Execute the query and return the folders that match the filter
    return Folder.find(filter)
        .select("_id name description createdAt updatedAt")
        .session(session)
        .lean(); // .lean() returns plain JavaScript objects instead of Mongoose documents
};



export const getAllNestedFolderIds = async (rootFolderId) => {
    const folderIds = [rootFolderId];
    const queue = [rootFolderId];

    while (queue.length > 0) {
        const currentId = queue.shift();
        const children = await Folder.find({ parent: currentId }).select("_id").lean();

        for (const child of children) {
            folderIds.push(child._id.toString());
            queue.push(child._id.toString());
        }
    }

    return folderIds;
};



export const getTotalFilesAndFoldersRepo = async () => {
    const totalFiles = await File.countDocuments();
    const totalFolders = await Folder.countDocuments();
    return { totalFiles, totalFolders };
  };
  