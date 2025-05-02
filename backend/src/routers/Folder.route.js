import express from 'express';
import { createFolderController, deleteFolderController, getFolderContentsController, getTotalStatsController, updateFolderController } from '../controllers/Folder.controller.js';


const folderRouter = express.Router();


folderRouter.route("/").post(createFolderController);
folderRouter.route("/:folderId").put(updateFolderController);
folderRouter.route("/").get(getFolderContentsController);
folderRouter.route("/:folderId").delete(deleteFolderController);
folderRouter.route("/total").get(getTotalStatsController);


export default folderRouter;
