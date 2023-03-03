import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface InternalState {
    application: {
        isComputingInBackground: boolean;
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
        isComputingInBackground: false,
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
        setIsComputingInBackground: (state, action: PayloadAction<boolean>) => {
            // TODO: This currently allows any one background worker to state that the app is
            //  computing in the background. This will break if there's more than one background
            //  worker (as of writing, there's just one: mediaGrouperWorker). In the future, if
            //  more workers are added then isComputingInBackground will need to allow workers to
            //  individually state when they start and stop working.
            state.application.isComputingInBackground = action.payload;
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
    setIsComputingInBackground,
    setFilteredAlbumCount,
    setFilteredArtistCount,
    setFilteredTrackCount,
    setShowDebugPanel,
    setShowKeyboardShortcuts,
    setTrackCardRenderDimensions,
} = internalSlice.actions;

export default internalSlice.reducer;
