import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface InternalState {
    application: {
        showKeyboardShortcuts: boolean;
        showDebugPanel: boolean;
    };
    albums: {
        filteredAlbumCount: number;
        albumCard: {
            renderWidth: number;
            renderHeight: number;
        };
    };
    artists: {
        filteredArtistCount: number;
        artistCard: {
            renderWidth: number;
            renderHeight: number;
        };
    };

    tracks: {
        filteredTrackCount: number;
        trackCard: {
            renderWidth: number;
            renderHeight: number;
        };
    };
}

const initialState: InternalState = {
    application: {
        showKeyboardShortcuts: false,
        showDebugPanel: false,
    },
    albums: {
        // Number of albums currently displayed in the Albums screen.
        filteredAlbumCount: 0,
        albumCard: {
            // Dimensions of the last-rendered AlbumCard, to inform not-visible AlbumCard container sizes.
            renderWidth: 200,
            renderHeight: 200,
        },
    },
    artists: {
        // Number of artists currently displayed in the Albums screen.
        filteredArtistCount: 0,
        artistCard: {
            // Dimensions of the last-rendered AlbumCard, to inform not-visible AlbumCard container sizes.
            renderWidth: 200,
            renderHeight: 200,
        },
    },
    tracks: {
        // Number of tracks currently displayed in the Tracks screen.
        filteredTrackCount: 0,
        trackCard: {
            // Dimensions of the last-rendered TrackCard, to inform not-visible TrackCard container sizes.
            renderWidth: 200,
            renderHeight: 200,
        },
    },
};

export const internalSlice = createSlice({
    name: "internal",
    initialState,
    reducers: {
        setAlbumCardRenderDimensions: (
            state,
            action: PayloadAction<{ width: number; height: number }>
        ) => {
            state.albums.albumCard.renderWidth = action.payload.width;
            state.albums.albumCard.renderHeight = action.payload.height;
        },
        setArtistCardRenderDimensions: (
            state,
            action: PayloadAction<{ width: number; height: number }>
        ) => {
            state.artists.artistCard.renderWidth = action.payload.width;
            state.artists.artistCard.renderHeight = action.payload.height;
        },
        setFilteredAlbumCount: (state, action: PayloadAction<number>) => {
            state.albums.filteredAlbumCount = action.payload;
        },
        setFilteredArtistCount: (state, action: PayloadAction<number>) => {
            state.artists.filteredArtistCount = action.payload;
        },
        setFilteredTrackCount: (state, action: PayloadAction<number>) => {
            state.tracks.filteredTrackCount = action.payload;
        },
        setShowDebugPanel: (state, action: PayloadAction<boolean | undefined>) => {
            state.application.showDebugPanel = action.payload === undefined ? true : action.payload;
        },
        setShowKeyboardShortcuts: (state, action: PayloadAction<boolean | undefined>) => {
            state.application.showKeyboardShortcuts =
                action.payload === undefined ? true : action.payload;
        },
        setTrackCardRenderDimensions: (
            state,
            action: PayloadAction<{ width: number; height: number }>
        ) => {
            state.tracks.trackCard.renderWidth = action.payload.width;
            state.tracks.trackCard.renderHeight = action.payload.height;
        },
    },
});

export const {
    setAlbumCardRenderDimensions,
    setArtistCardRenderDimensions,
    setFilteredAlbumCount,
    setFilteredArtistCount,
    setFilteredTrackCount,
    setShowDebugPanel,
    setShowKeyboardShortcuts,
    setTrackCardRenderDimensions,
} = internalSlice.actions;

export default internalSlice.reducer;
