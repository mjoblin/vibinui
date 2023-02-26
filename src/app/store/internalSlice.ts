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
    albums: {
        filteredAlbumCount: number;
    };
    artistCard: {
        renderWidth: number;
        renderHeight: number;
    };
    artists: {
        filteredArtistCount: number;
    };
    trackCard: {
        renderWidth: number;
        renderHeight: number;
    };
    tracks: {
        filteredTrackCount: number;
    };
}

// TODO: Move the *Card blocks under their respective top-level section.

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
    albums: {
        // Number of albums currently displayed in the Albums screen.
        filteredAlbumCount: 0,
    },
    artistCard: {
        // Dimensions of the last-rendered AlbumCard, to inform not-visible AlbumCard container sizes.
        renderWidth: 200,
        renderHeight: 200,
    },
    artists: {
        // Number of artists currently displayed in the Albums screen.
        filteredArtistCount: 0,
    },
    trackCard: {
        // Dimensions of the last-rendered TrackCard, to inform not-visible TrackCard container sizes.
        renderWidth: 200,
        renderHeight: 200,
    },
    tracks: {
        // Number of tracks currently displayed in the Tracks screen.
        filteredTrackCount: 0,
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
            state.albums.filteredAlbumCount = action.payload;
        },
        setArtistCardRenderDimensions: (
            state,
            action: PayloadAction<{ width: number; height: number }>
        ) => {
            state.artistCard.renderWidth = action.payload.width;
            state.artistCard.renderHeight = action.payload.height;
        },
        setFilteredArtistCount: (state, action: PayloadAction<number>) => {
            state.artists.filteredArtistCount = action.payload;
        },
        setFilteredTrackCount: (state, action: PayloadAction<number>) => {
            state.tracks.filteredTrackCount = action.payload;
        },
        setTrackCardRenderDimensions: (
            state,
            action: PayloadAction<{ width: number; height: number }>
        ) => {
            state.trackCard.renderWidth = action.payload.width;
            state.trackCard.renderHeight = action.payload.height;
        },
    },
});

export const {
    setShowHotkeys,
    setShowDebugPanel,
    setAlbumCardRenderDimensions,
    setArtistCardRenderDimensions,
    setFilteredAlbumCount,
    setFilteredArtistCount,
    setFilteredTrackCount,
    setTrackCardRenderDimensions,
} = internalSlice.actions;

export default internalSlice.reducer;
