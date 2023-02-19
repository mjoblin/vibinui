import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface InternalState {
    application: {
        showHotkeys: boolean;
        showDebugPanel: boolean;
    };
    albumCard: {
        renderWidth: number;
        renderHeight: number;
    };
    browse: {
        filteredAlbumCount: number;
    };
}

const initialState: InternalState = {
    application: {
        showHotkeys: false,
        showDebugPanel: false,
    },
    albumCard: {
        // Dimensions of the last-rendered AlbumCard, to inform not-visible AlbumCard container sizes.
        renderWidth: 200,
        renderHeight: 200,
    },
    browse: {
        // Number of albums currently displayed in the Browse screen.
        filteredAlbumCount: 0,
    },
};

export const internalSlice = createSlice({
    name: "internal",
    initialState,
    reducers: {
        setShowHotkeys: (state, action: PayloadAction<boolean | undefined>) => {
            state.application.showHotkeys = action.payload === undefined ? true : action.payload;
        },
        setShowDebugPanel: (state, action: PayloadAction<boolean | undefined>) => {
            state.application.showDebugPanel = action.payload === undefined ? true : action.payload;
        },
        setAlbumCardRenderDimensions: (
            state,
            action: PayloadAction<{ width: number; height: number }>
        ) => {
            state.albumCard.renderWidth = action.payload.width;
            state.albumCard.renderHeight = action.payload.height;
        },
        setFilteredAlbumCount: (state, action: PayloadAction<number>) => {
            state.browse.filteredAlbumCount = action.payload;
        },
    },
});

export const {
    setShowHotkeys,
    setShowDebugPanel,
    setAlbumCardRenderDimensions,
    setFilteredAlbumCount,
} = internalSlice.actions;

export default internalSlice.reducer;
