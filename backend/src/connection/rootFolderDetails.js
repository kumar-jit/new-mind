import { ensureRootFolderRepo } from "../modal/repositories/folderRepository.js";

let ROOT_FOLDER_Info = null;

export const setRootFolderId = async () => {
    try {
        if (!ROOT_FOLDER_Info) {
            let root = await ensureRootFolderRepo();
            ROOT_FOLDER_Info = {
                id: root._id.toString(),
                name: root.name,
                path: root.path
            };
        }
    } catch (err) {
        console.error("Failed to initialize root folder:", err.message);
        throw new Error(
            "Root folder unavailable. Please restart the server once the database is reachable."
        );
    }
};

export const getRootFolderId = () => {
    if (ROOT_FOLDER_Info) return ROOT_FOLDER_Info;
    const msg = "Root folder ID not initialized. Please restart the server after DB is ready.";
    console.warn(msg);
    throw new Error(msg);
};
