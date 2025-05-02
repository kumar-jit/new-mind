import { configureStore } from "@reduxjs/toolkit";
import { layoutReducer } from "./slices/LayoutSlice";
import { dirItemsReducers } from "./slices/FilesAndFoldersSlice";
import dirToastMiddleware from "./middleware/notificationMiddleware";

export const Store = configureStore({
    reducer: { layoutReducer, dirItemsReducers },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(dirToastMiddleware),
});
