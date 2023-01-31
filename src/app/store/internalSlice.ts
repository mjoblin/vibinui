import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface InternalState {
    albumCard: {
        renderWidth: number;
        renderHeight: number;
    };
}

const initialState: InternalState = {
    albumCard: {
        // Dimensions of the last-rendered AlbumCard, to inform not-visible AlbumCard container sizes.
        renderWidth: 200,
        renderHeight: 200,
    },
};

export const systemSlice = createSlice({
    name: "internal",
    initialState,
    reducers: {
        setAlbumCardRenderDimensions: (
            state,
            action: PayloadAction<{ width: number; height: number }>
        ) => {
            state.albumCard.renderWidth = action.payload.width;
            state.albumCard.renderHeight = action.payload.height;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setAlbumCardRenderDimensions } = systemSlice.actions;

export default systemSlice.reducer;
