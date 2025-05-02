import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL from environment or fallback to localhost
const hostUrl = import.meta.env.VITE_HOST_URL || "http://localhost:8000";

// Initial state for the directory management slice
const INITIAL_STATE = {
    items: [], // Root folder contents
    isLoading: false, // Global loading flag
    error: null, // Global error message
    rootFolderInfo: null, // Metadata of the root folder
    expandedFolders: {}, // Map to track expanded/collapsed folders
    folderData: {}, // Cache of folder contents by folderId
    folderCreationState: { // Folder creation status and errors
        folderCreationError: null,
        folderCreationDone: false,
    },
    totalStats: { // Global stats for files and folders
        totalFiles: 0,
        totalFolders: 0
    },
    fileView: {} // Placeholder for file view-specific state
};

// Fetch overall stats of files/folders from server
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

// Fetch a specific file's data by ID
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

// Fetch contents and info of a folder by its ID
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

// Fetch root folder's contents
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
 * Create a new folder under a parent folder
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
 * Update folder name and description
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
 * Rename a file by file ID
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
 * Delete a folder by folder ID
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
 * Delete a file by file ID
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

// Redux slice for directory operations
const DirSlice = createSlice({
    name: "dir",
    initialState: INITIAL_STATE,
    reducers: {
        // Set root folder data and cache its contents
        setDirItems: (state, action) => {
            const { _id, createdAt, name, path, updatedAt, contents } =
                action.payload;
            state.items = contents;
            state.rootFolderInfo = { _id, createdAt, name, path, updatedAt };
            state.folderData[_id] = contents;
        },
        // Toggle folder expand/collapse state
        toggleFolderExpand: (state, action) => {
            const folderId = action.payload;
            if (state.expandedFolders[folderId]) {
                delete state.expandedFolders[folderId];
            } else {
                state.expandedFolders[folderId] = true;
            }
        },
        // Reset folder creation error
        resetFolderCreationError: (state, action) => {
            state.folderCreationState.folderCreationError = null;
        },
    },
    extraReducers: (builder) => {
        builder

            // Total stats - set data
            .addCase(getTotalStats.fulfilled, (state, action) => {
                state.totalStats = { ...action.payload };
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

            // Root folder loading
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
                state.folderCreationState.folderCreationDone = true;
                state.totalStats.totalFolders += 1;
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
                    else state.expandedFolders[folderInfo.parent] = false;
                }
            })
            .addCase(createNewFolder.rejected, (state, action) => {
                state.folderCreationState.folderCreationError =
                    action.payload || "Failed to create folder";
            })

            // Update folder
            .addCase(updateFolderDetails.fulfilled, (state, action) => {
                state.folderCreationState.folderCreationDone = true;
                let updatedFolder = action.payload.folder;
                for (let i = 0; i < state.items.length; i++) {
                    if (state.items[i]._id == updatedFolder._id) {
                        state.items[i] = updatedFolder;
                        state.items[i].type = "folder";
                    }
                }
            })

            // Delete folder
            .addCase(deleteFolder.fulfilled, (state, action) => {
                state.folderCreationState.folderCreationDone = true;
                state.totalStats.totalFolders -= 1;
                let folderId = action.payload?.deletedFolder?._id;
                let indexInItems = state.items.findIndex(
                    (item) => item._id == folderId
                );
                if (indexInItems >= 0) state.items.splice(indexInItems, 1);
                delete state.expandedFolders[folderId];
                delete state.folderData[folderId];
            })

            // Update file name
            .addCase(updateFileName.fulfilled, (state, action) => {
                state.folderCreationState.folderCreationDone = true;
                let updatedFile = action.payload.updatedFile;
                let folderChildList = state.folderData[updatedFile.folder];
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
                    }
                }
            })

            // Delete file
            .addCase(deleteFile.fulfilled, (state, action) => {
                state.folderCreationState.folderCreationDone = true;
                state.totalStats.totalFiles -= 1;
                let deletedFile = action.payload.deletedFile;
                let indexInItems = state.items.findIndex(
                    (item) => item._id == deletedFile._id
                );
                if (indexInItems >= 0) state.items.splice(indexInItems, 1);
                let folderList = state.folderData[deletedFile.folder];
                if (folderList) {
                    let ind = folderList.findIndex(
                        (item) => item._id == deletedFile._id
                    );
                    if (ind >= 0) folderList.splice(ind, 1);
                }
            });
    },
});

// Export actions and reducer
export const { setDirItems, toggleFolderExpand, resetFolderCreationError } =
    DirSlice.actions;
export const dirItemsReducers = DirSlice.reducer;
