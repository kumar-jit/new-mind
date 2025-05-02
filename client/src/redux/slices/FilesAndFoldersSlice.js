import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const hostUrl = import.meta.env.VITE_HOST_URL || "http://localhost:8000";

const INITIAL_STATE = {
    items: [], // Root level items
    isLoading: false, // Loading state
    error: null, // Error message
    rootFolderInfo: null, // { _id, createdAt, name, path, updatedAt }
    expandedFolders: {}, // { folderId: true/false }
    folderData: {}, // { folderId: contents[] }
    // Error message for folder creation
    folderCreationState: {
        folderCreationError: null,
        folderCreationDone: false,
    },
    totalStats: {
        totalFiles: 0,
        totalFolders:0
    },
    fileView:{

    }
};

// Thunk to fetch any folder's children (lazy load)
export const getTotalStats = createAsyncThunk(
    "dir/totalStats",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${hostUrl}/api/v1/folder/total`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Thunk to fetch any folder's children (lazy load)
export const viewFiles = createAsyncThunk(
    "dir/viewFiles",
    async (fileId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${hostUrl}/api/v1/file/view/${fileId}`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Thunk to fetch any folder's children (lazy load)
export const fetchFolderById = createAsyncThunk(
    "dir/fetchFolderById",
    async (folderId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${hostUrl}/api/v1/folder/?folderId=${folderId}`
            );
            if (response.status !== 200 || !response.data.folder) {
                throw new Error("Invalid folder data");
            }

            return {
                folderId,
                folderInfo: response.data.folder,
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchRootFolderData = createAsyncThunk(
    "dir/fetchRootFolderData",
    async (
        { path = "/root", top = 0, skip = 0 },
        { dispatch, rejectWithValue }
    ) => {
        try {
            const response = await axios.get(
                `${hostUrl}/api/v1/folder?path=${path}&top=${top}&skip=${skip}`
            );
            if (response.status !== 200 || !response.data.folder) {
                throw new Error("Failed to fetch data");
            }

            dispatch(setDirItems(response.data.folder));
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * * Create a new folder in the current directory
 * @param {string} folderName - Name of the new folder
 * @param {string} parentId - ID of the parent folder
 */
export const createNewFolder = createAsyncThunk(
    "dir/createNewFolder",
    async ({ name, parentId, description }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${hostUrl}/api/v1/folder`, {
                name,
                parentId,
                description,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.msg || error.message);
        }
    }
);

/**
 * * update folder name
 * @param {string} folderName - new Name of the folder
 * @param {string} folderId - ID of the current folder
 */
export const updateFolderDetails = createAsyncThunk(
    "dir/updateFolder",
    async ({ name, folderId, description }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${hostUrl}/api/v1/folder/${folderId}`,
                { name, description }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.msg || error.message);
        }
    }
);

/**
 * * update filename
 * @param {string} folderName - new Name of the file
 * @param {string} fileId - ID of the current folder
 */
export const updateFileName = createAsyncThunk(
    "dir/updatFile",
    async ({ newName, fileId }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${hostUrl}/api/v1/file/${fileId}`,
                { newName }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.msg || error.message);
        }
    }
);

/**
 * * Delte folder
 * @param {string} folderName - new Name of the file
 * @param {string} fileId - ID of the current folder
 */
export const deleteFolder = createAsyncThunk(
    "dir/deleteFolder",
    async ({ folderId }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.delete(
                `${hostUrl}/api/v1/folder/${folderId}`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.msg || error.message);
        }
    }
);

/**
 * * Delte folder
 * @param {string} folderName - new Name of the file
 * @param {string} fileId - ID of the current folder
 */
export const deleteFile = createAsyncThunk(
    "dir/deleteFile",
    async ({ fileId }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.delete(
                `${hostUrl}/api/v1/file/${fileId}`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.msg || error.message);
        }
    }
);

// export const deleteFolder

const DirSlice = createSlice({
    name: "dir",
    initialState: INITIAL_STATE,
    reducers: {
        setDirItems: (state, action) => {
            const { _id, createdAt, name, path, updatedAt, contents } =
                action.payload;
            state.items = contents;
            state.rootFolderInfo = { _id, createdAt, name, path, updatedAt };
            state.folderData[_id] = contents; // store contents in folderData
        },
        toggleFolderExpand: (state, action) => {
            const folderId = action.payload;
            if (state.expandedFolders[folderId]) {
                delete state.expandedFolders[folderId];
            } else {
                state.expandedFolders[folderId] = true;
            }
        },
        resetFolderCreationError: (state, action) => {
            state.folderCreationState.folderCreationError = null;
        },
    },
    extraReducers: (builder) => {
        builder

            //Load total stats
            .addCase(getTotalStats.pending, (state) => {
                // state.isLoading = true;
            })
            .addCase(getTotalStats.fulfilled, (state, action) => {
                state.totalStats = {...action.payload};
            })
            .addCase(getTotalStats.rejected, (state, action) => {
                // state.isLoading = false;
                // state.error = action.payload || "Failed to fetch folder data";
            })

            // Fetch folder by ID
            .addCase(fetchFolderById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchFolderById.fulfilled, (state, action) => {
                const { folderId, folderInfo } = action.payload;
                state.folderData[folderId] = folderInfo.contents;
                state.isLoading = false;
            })
            .addCase(fetchFolderById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch folder data";
            })

            // Fetch root folder data
            .addCase(fetchRootFolderData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchRootFolderData.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(fetchRootFolderData.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch root data";
            })

            // Create new folder
            .addCase(createNewFolder.pending, (state) => {
                state.folderCreationState.folderCreationError = null;
            })
            .addCase(createNewFolder.fulfilled, (state, action) => {
                state.folderCreationState.folderCreationError = null;
                state.folderCreationState.folderCreationDone = true;
                state.totalStats.totalFolders = state.totalStats.totalFolders +1;
                const folderInfo = action.payload.folder;
                if (folderInfo) {
                    const newFolder = {
                        _id: folderInfo._id,
                        createdAt: folderInfo.createdAt,
                        updatedAt: folderInfo.updatedAt,
                        description: folderInfo.description,
                        name: folderInfo.name,
                        type: "folder",
                    };
                    if (folderInfo.parent === state.rootFolderInfo._id)
                        state.items.push(newFolder);
                    else {
                        state.expandedFolders[folderInfo.parent] = false;
                    }
                }
            })
            .addCase(createNewFolder.rejected, (state, action) => {
                state.folderCreationState.folderCreationError =
                    action.payload || "Failed to create folder";
            })

            // on folder update
            .addCase(updateFolderDetails.pending, (state) => {
                state.folderCreationState.folderCreationError = null;
            })
            .addCase(updateFolderDetails.fulfilled, (state, action) => {
                state.folderCreationState.folderCreationError = null;
                state.folderCreationState.folderCreationDone = true;
                let updatedFolder = action.payload.folder;
                for (let i = 0; i < state.items.length; i++) {
                    if (state.items[i]._id == updatedFolder._id) {
                        state.items[i] = updatedFolder;
                        state.items[i].type = "folder";
                    }
                }
            })
            .addCase(updateFolderDetails.rejected, (state, action) => {
                state.folderCreationState.folderCreationError =
                    action.payload || "Failed to create folder";
            })

            // on delte folder
            .addCase(deleteFolder.pending, (state) => {
                state.folderCreationState.folderCreationError = null;
            })
            .addCase(deleteFolder.fulfilled, (state, action) => {
                state.folderCreationState.folderCreationError = null;
                state.folderCreationState.folderCreationDone = true;
                state.totalStats.totalFolders = state.totalStats.totalFolders - 1;
                let folderId = action.payload?.deletedFolder?._id;
                let indexInItems = state.items.findIndex(
                    (item) => item._id == folderId
                );
                if (indexInItems >= 0) state.items.splice(indexInItems, 1);
                if (state.expandedFolders[folderId])
                    delete state.expandedFolders[folderId];
                if (state.folderData[folderId])
                    delete state.folderData[folderId];
            })
            .addCase(deleteFolder.rejected, (state, action) => {
                // state.folderCreationState.folderCreationError =
                //     action.payload || "Failed to create folder";
            })

            // update file
            .addCase(updateFileName.pending, (state) => {
                state.folderCreationState.folderCreationError = null;
            })
            .addCase(updateFileName.fulfilled, (state, action) => {
                state.folderCreationState.folderCreationError = null;
                state.folderCreationState.folderCreationDone = true;
                let updatedFile = action.payload.updatedFile;
                let folderChildList = state.folderData[updatedFile.folder];
                console.log(folderChildList);
                for (let i = 0; i < folderChildList.length; i++) {
                    if (folderChildList[i]._id == updatedFile._id) {
                        folderChildList[i] = {
                            name: updatedFile.filename,
                            createdAt: updatedFile.createdAt,
                            updatedAt: updatedFile.updatedAt,
                            type: "file",
                            _id: updatedFile.id,
                            extension: updatedFile.extension,
                        };
                        folderChildList[i].type = "file";
                    }
                }
            })
            .addCase(updateFileName.rejected, (state, action) => {
                state.folderCreationState.folderCreationError =
                    action.payload || "Failed to create folder";
            })

            // on delte file
            .addCase(deleteFile.pending, (state) => {
                state.folderCreationState.folderCreationError = null;
            })
            .addCase(deleteFile.fulfilled, (state, action) => {
                state.folderCreationState.folderCreationError = null;
                state.folderCreationState.folderCreationDone = true;
                state.totalStats.totalFiles = state.totalStats.totalFiles - 1;
                let deletedFile = action.payload.deletedFile;
                let indexInItems = state.items.findIndex(
                    (item) => item._id == deletedFile._id
                );
                if (indexInItems >= 0) state.items.splice(indexInItems, 1);

                if (
                    state.expandedFolders[deletedFile.folder] &&
                    state.folderData[deletedFile.folder]
                ) {
                    let ind = state.folderData[deletedFile.folder].findIndex(
                        (item) => item._id == deletedFile._id
                    );
                    if (ind >= 0)
                        state.folderData[deletedFile.folder].splice(ind, 1);
                }
            })
            .addCase(deleteFile.rejected, (state, action) => {
                // state.folderCreationState.folderCreationError =
                //     action.payload || "Failed to create folder";
            });
    },
});

export const { setDirItems, toggleFolderExpand, resetFolderCreationError } =
    DirSlice.actions;
export const dirItemsReducers = DirSlice.reducer;
