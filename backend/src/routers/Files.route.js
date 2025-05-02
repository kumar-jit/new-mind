import express from "express";
import { sseConnectionController } from "../controllers/SSEconnection.controller.js";
import {
    uploadFileController,
    updateFileNameController,
    searchInFolderController,
    deleteFileController,
    streamFileByIdController,
} from "../controllers/File.controller.js";
import { upload } from "../connection/mongoStorageConfig.js";

const fileRouter = express.Router();

// Route for SSE connection
fileRouter.get("/events", sseConnectionController);
fileRouter.post("/upload", upload.array("files"), uploadFileController);
fileRouter.route("/:fileId").put(updateFileNameController);
fileRouter.route("/search/:folderId").get(searchInFolderController);
fileRouter.route("/:fileId").delete(deleteFileController);
fileRouter.route("/view/:fileId").get(streamFileByIdController);

export default fileRouter;
