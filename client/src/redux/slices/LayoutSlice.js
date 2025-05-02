import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { db } from "../../Db/connection";
const innerWidth = window.innerWidth;
const INITIAL_STATE = {
    fileTableShow: true,
    fileTableWidth: 300,
    fileExploreWitdh: innerWidth - 300 - 60,
};

const LayoutSlice = createSlice({
    name: "layout",
    initialState: INITIAL_STATE,
    reducers: {
        toggleFileTableShow: (state, action) => {
            if(state.fileTableShow) {
                state.fileTableShow = false;
                state.fileExploreWitdh = innerWidth - 60;
                state.fileTableWidth = 0;
            }
            else {
                state.fileTableShow = true;
                state.fileExploreWitdh = innerWidth - 300 - 60;
                state.fileTableWidth = 300;
            }
        }
    },
    extraReducers: (builder) => {
    },
});

export const layoutReducer = LayoutSlice.reducer;
export const { toggleFileTableShow } = LayoutSlice.actions;