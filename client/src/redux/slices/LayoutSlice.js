import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { db } from "../../Db/connection";
const innerWidth = window.innerWidth;
const INITIAL_STATE = {
    fileTableShow: true,
    fileTableWidth: 300,
    fileExploreWitdh: innerWidth - 300 - 60,
};

// Real-time product and category fetch using onSnapshot
// export const fetchProductData = createAsyncThunk(
//     "product/fetchProductData",
//     async (_, { dispatch, rejectWithValue }) => {
//         try {
//             // Use async-await with promises inside onSnapshot
//             const productPromise = new Promise((resolve, reject) => {
//                 const unsubscribeProduct = onSnapshot(
//                     collection(db, "products"),
//                     (snapshot) => {
//                         const products = snapshot.docs.map((doc) => {
//                             const data = doc.data();

//                             // Handle category field: if it's a DocumentReference, extract its ID
//                             if (data.category && data.category.id) {
//                                 data.category = data.category.id; // Save only the category ID
//                             }

//                             return {
//                                 id: doc.id,
//                                 ...data,
//                             };
//                         });

//                         dispatch(setProductList(products));
//                         resolve(unsubscribeProduct);
//                     },
//                     reject
//                 );
//             });

//             const categoryPromise = new Promise((resolve, reject) => {
//                 const unsubscribeCategory = onSnapshot(
//                     collection(db, "category"),
//                     (snapshot) => {
//                         const categories = snapshot.docs.map((doc) => ({
//                             id: doc.id,
//                             ...doc.data(),
//                         }));
//                         dispatch(setCategories(categories));
//                         resolve(unsubscribeCategory);
//                     },
//                     reject
//                 );
//             });

//             const unsubscribers = await Promise.all([
//                 productPromise,
//                 categoryPromise,
//             ]);
//         } catch (error) {
//             return rejectWithValue(error.message);
//         }
//     }
// );

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
        // builder
        //     .addCase(fetchProductData.pending, (state) => {
        //         state.isLoading = true;
        //     })
        //     .addCase(fetchProductData.fulfilled, (state) => {
        //         state.isLoading = false;
        //     })
        //     .addCase(fetchProductData.rejected, (state) => {
        //         state.isLoading = false;
        //     });
    },
});

export const layoutReducer = LayoutSlice.reducer;
export const { toggleFileTableShow } = LayoutSlice.actions;