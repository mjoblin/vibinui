import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { MediaId } from "../types";

// ================================================================================================
// State for tracking internal application information such as scroll positions, art card
// dimensions, etc.
// ================================================================================================

export type WebsocketStatus = "disconnected" | "connecting" | "connected" | "waiting_to_reconnect";

export interface InternalState {
    application: {
        currentlyPlayingArtUrl: string | undefined;
        currentScreen: string;
        isComputingInBackground: boolean;
        showCurrentTrackLyrics: boolean;
        showDebugPanel: boolean;
        showKeyboardShortcuts: boolean;
        showMediaSearch: boolean;
        waveformsSupported: boolean;
        websocketClientId: string | undefined;
        websocketStatus: WebsocketStatus;
    };
    albums: {
        filteredAlbumCount: number;
        filteredAlbumMediaIds: MediaId[];
        albumCard: {
            renderWidth: number;
            renderHeight: number;
        };
        scrollPosition: number,
    };
    artists: {
        filteredArtistCount: number;
        filteredArtistMediaIds: MediaId[];
        artistCard: {
            renderWidth: number;
            renderHeight: number;
        };
        scrollPos: {
            artists: number;
            albums: number;
            tracks: number;
        };
        scrollCurrentIntoView: () => void;
        scrollSelectedIntoView: () => void;
        scrollToCurrentOnScreenEnter: boolean;
        scrollToSelectedOnScreenEnter: boolean;
    };
    favorites: {
        filteredFavoriteCount: number;
        filteredFavoriteMediaIds: {
            albums: MediaId[];
            tracks: MediaId[];
        };
        favoriteCard: {
            renderWidth: number;
            renderHeight: number;
        };
        scrollPosition: number,
    };
    playlist: {
        scrollPosition: number;
    };
    presets: {
        filteredPresetCount: number;
        filteredPresetIds: number[];
        scrollPosition: number,
    };
    tracks: {
        filteredTrackCount: number;
        filteredTrackMediaIds: MediaId[];
        scrollPosition: number,
        trackCard: {
            renderWidth: number;
            renderHeight: number;
        };
    };
}

const initialState: InternalState = {
    application: {
        currentlyPlayingArtUrl: undefined,
        currentScreen: "",
        isComputingInBackground: false,
        showCurrentTrackLyrics: false,
        showDebugPanel: false,
        showKeyboardShortcuts: false,
        showMediaSearch: false,
        waveformsSupported: true,
        websocketClientId: undefined,
        websocketStatus: "disconnected",
    },
    albums: {
        // Number of albums currently displayed in the Albums screen.
        filteredAlbumCount: 0,
        filteredAlbumMediaIds: [],
        albumCard: {
            // Dimensions of the last-rendered AlbumCard, to inform not-visible AlbumCard container sizes.
            renderWidth: 200,
            renderHeight: 200,
        },
        scrollPosition: 0,
    },
    artists: {
        // Number of artists currently displayed in the Albums screen.
        filteredArtistCount: 0,
        filteredArtistMediaIds: [],
        artistCard: {
            // Dimensions of the last-rendered AlbumCard, to inform not-visible AlbumCard container sizes.
            renderWidth: 200,
            renderHeight: 200,
        },
        scrollPos: {
            artists: 0,
            albums: 0,
            tracks: 0,
        },
        scrollCurrentIntoView: () => {},
        scrollSelectedIntoView: () => {},
        scrollToCurrentOnScreenEnter: false,
        scrollToSelectedOnScreenEnter: false,
    },
    favorites: {
        // Number of favorites currently displayed in the Favorites screen.
        filteredFavoriteCount: 0,
        filteredFavoriteMediaIds: {
            albums: [],
            tracks: [],
        },
        favoriteCard: {
            // Dimensions of the last-rendered FavoriteCard, to inform not-visible FavoriteCard container sizes.
            renderWidth: 200,
            renderHeight: 200,
        },
        scrollPosition: 0,
    },
    playlist: {
        scrollPosition: 0,
    },
    presets: {
        // Number of presets currently displayed in the Presets screen.
        filteredPresetCount: 0,
        filteredPresetIds: [],
        scrollPosition: 0,
    },
    tracks: {
        // Number of tracks currently displayed in the Tracks screen.
        filteredTrackCount: 0,
        filteredTrackMediaIds: [],
        scrollPosition: 0,
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
        setAlbumsScrollPosition: (state, action: PayloadAction<number>) => {
            state.albums.scrollPosition = action.payload;
        },
        setArtistCardRenderDimensions: (
            state,
            action: PayloadAction<{ width: number; height: number }>
        ) => {
            state.artists.artistCard.renderWidth = action.payload.width;
            state.artists.artistCard.renderHeight = action.payload.height;
        },
        setArtistsScrollPos: (
            state,
            action: PayloadAction<{ category: "artists" | "albums" | "tracks"; pos: number }>
        ) => {
            state.artists.scrollPos[action.payload.category] = action.payload.pos;
        },
        setArtistsScrollCurrentIntoView: (state, action: PayloadAction<() => void>) => {
            state.artists.scrollCurrentIntoView = action.payload;
        },
        setArtistsScrollSelectedIntoView: (state, action: PayloadAction<() => void>) => {
            state.artists.scrollSelectedIntoView = action.payload;
        },
        setArtistsScrollToCurrentOnScreenEnter: (state, action: PayloadAction<boolean>) => {
            state.artists.scrollToCurrentOnScreenEnter = action.payload;
        },
        setArtistsScrollToSelectedOnScreenEnter: (state, action: PayloadAction<boolean>) => {
            state.artists.scrollToSelectedOnScreenEnter = action.payload;
        },
        setCurrentlyPlayingArtUrl: (state, action: PayloadAction<string | undefined>) => {
            state.application.currentlyPlayingArtUrl = action.payload;
        },
        setCurrentScreen: (state, action: PayloadAction<string>) => {
            state.application.currentScreen = action.payload;
        },
        setFavoriteCardRenderDimensions: (
            state,
            action: PayloadAction<{ width: number; height: number }>
        ) => {
            state.favorites.favoriteCard.renderWidth = action.payload.width;
            state.favorites.favoriteCard.renderHeight = action.payload.height;
        },
        setFavoritesScrollPosition: (state, action: PayloadAction<number>) => {
            state.favorites.scrollPosition = action.payload;
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
        setFilteredAlbumMediaIds: (state, action: PayloadAction<MediaId[]>) => {
            state.albums.filteredAlbumMediaIds = action.payload;
        },
        setFilteredArtistCount: (state, action: PayloadAction<number>) => {
            state.artists.filteredArtistCount = action.payload;
        },
        setFilteredArtistMediaIds: (state, action: PayloadAction<MediaId[]>) => {
            state.artists.filteredArtistMediaIds = action.payload;
        },
        setFilteredFavoriteCount: (state, action: PayloadAction<number>) => {
            state.favorites.filteredFavoriteCount = action.payload;
        },
        setFilteredFavoriteMediaIds: (
            state,
            action: PayloadAction<{ albums: MediaId[]; tracks: MediaId[] }>
        ) => {
            state.favorites.filteredFavoriteMediaIds = action.payload;
        },
        setFilteredPresetCount: (state, action: PayloadAction<number>) => {
            state.presets.filteredPresetCount = action.payload;
        },
        setFilteredPresetIds: (state, action: PayloadAction<number[]>) => {
            state.presets.filteredPresetIds = action.payload;
        },
        setFilteredTrackCount: (state, action: PayloadAction<number>) => {
            state.tracks.filteredTrackCount = action.payload;
        },
        setFilteredTrackMediaIds: (state, action: PayloadAction<MediaId[]>) => {
            state.tracks.filteredTrackMediaIds = action.payload;
        },
        setPlaylistScrollPosition: (state, action: PayloadAction<number>) => {
            state.playlist.scrollPosition = action.payload;
        },
        setPresetsScrollPosition: (state, action: PayloadAction<number>) => {
            state.presets.scrollPosition = action.payload;
        },
        setShowCurrentTrackLyrics: (state, action: PayloadAction<boolean | undefined>) => {
            state.application.showCurrentTrackLyrics = action.payload === undefined ? true : action.payload;
        },
        setShowDebugPanel: (state, action: PayloadAction<boolean | undefined>) => {
            state.application.showDebugPanel = action.payload === undefined ? true : action.payload;
        },
        setShowKeyboardShortcuts: (state, action: PayloadAction<boolean | undefined>) => {
            state.application.showKeyboardShortcuts =
                action.payload === undefined ? true : action.payload;
        },
        setShowMediaSearch: (state, action: PayloadAction<boolean | undefined>) => {
            state.application.showMediaSearch =
                action.payload === undefined ? true : action.payload;
        },
        setTrackCardRenderDimensions: (
            state,
            action: PayloadAction<{ width: number; height: number }>
        ) => {
            state.tracks.trackCard.renderWidth = action.payload.width;
            state.tracks.trackCard.renderHeight = action.payload.height;
        },
        setTracksScrollPosition: (state, action: PayloadAction<number>) => {
            state.tracks.scrollPosition = action.payload;
        },
        setWaveformsSupported: (state, action: PayloadAction<boolean>) => {
            state.application.waveformsSupported = action.payload;
        },
        setWebsocketClientId: (state, action: PayloadAction<string>) => {
            state.application.websocketClientId = action.payload;
        },
        setWebsocketStatus: (state, action: PayloadAction<WebsocketStatus>) => {
            state.application.websocketStatus = action.payload;
        },
    },
});

export const {
    setAlbumCardRenderDimensions,
    setAlbumsScrollPosition,
    setArtistCardRenderDimensions,
    setArtistsScrollPos,
    setArtistsScrollCurrentIntoView,
    setArtistsScrollSelectedIntoView,
    setArtistsScrollToCurrentOnScreenEnter,
    setArtistsScrollToSelectedOnScreenEnter,
    setCurrentlyPlayingArtUrl,
    setCurrentScreen,
    setFavoriteCardRenderDimensions,
    setFavoritesScrollPosition,
    setIsComputingInBackground,
    setFilteredAlbumCount,
    setFilteredAlbumMediaIds,
    setFilteredArtistCount,
    setFilteredArtistMediaIds,
    setFilteredFavoriteCount,
    setFilteredFavoriteMediaIds,
    setFilteredPresetCount,
    setFilteredPresetIds,
    setFilteredTrackCount,
    setFilteredTrackMediaIds,
    setPlaylistScrollPosition,
    setPresetsScrollPosition,
    setShowCurrentTrackLyrics,
    setShowDebugPanel,
    setShowKeyboardShortcuts,
    setShowMediaSearch,
    setTrackCardRenderDimensions,
    setTracksScrollPosition,
    setWaveformsSupported,
    setWebsocketClientId,
    setWebsocketStatus,
} = internalSlice.actions;

export default internalSlice.reducer;
