import { toast } from "react-toastify";

// Toast middleware for directory operations
const dirToastMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    switch (action.type) {
        // Folder creation
        case "dir/createNewFolder/fulfilled":
            toast.success("Folder created successfully!");
            break;
        case "dir/createNewFolder/rejected":
            toast.error(`Failed to create folder: ${action.payload || "Unknown error"}`);
            break;

        // Folder update
        case "dir/updateFolder/fulfilled":
            toast.success("Folder updated successfully!");
            break;
        case "dir/updateFolder/rejected":
            toast.error(`Failed to update folder: ${action.payload || "Unknown error"}`);
            break;

        // File rename
        case "dir/updatFile/fulfilled":
            toast.success("File renamed successfully!");
            break;
        case "dir/updatFile/rejected":
            toast.error(`Failed to rename file: ${action.payload || "Unknown error"}`);
            break;

        // Folder deletion
        case "dir/deleteFolder/fulfilled":
            toast.success("Folder deleted successfully!");
            break;
        case "dir/deleteFolder/rejected":
            toast.error(`Failed to delete folder: ${action.payload || "Unknown error"}`);
            break;

        // File deletion
        case "dir/deleteFile/fulfilled":
            toast.success("File deleted successfully!");
            break;
        case "dir/deleteFile/rejected":
            toast.error(`Failed to delete file: ${action.payload || "Unknown error"}`);
            break;

        // View file
        case "dir/viewFiles/rejected":
            toast.error(`Failed to load file: ${action.payload || "Unknown error"}`);
            break;

        default:
            break;
    }

    return result;
};

export default dirToastMiddleware;
