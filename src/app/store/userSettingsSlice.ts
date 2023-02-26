import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { NowPlayingTab } from "../../components/layout/NowPlayingScreen";

export const minCoverGap = 0;
export const maxCoverGap = 50;
export const minCoverSize = 100;
export const maxCoverSize = 300;
export const minPresetCardGap = 0;
export const maxPresetCardGap = 50;
export const minPresetCardSize = 100;
export const maxPresetCardSize = 300;

const DEFAULT_APPLICATION_THEME = "dark";
const DEFAULT_ALBUMS_ACTIVE_COLLECTION = "all";
const DEFAULT_ALBUMS_COVER_SIZE = 200;
const DEFAULT_ALBUMS_COVER_GAP = 15;
const DEFAULT_ALBUMS_FILTER_TEXT = "";
const DEFAULT_ALBUMS_SHOW_DETAILS = true;
const DEFAULT_TRACKS_COVER_SIZE = DEFAULT_ALBUMS_COVER_SIZE;
const DEFAULT_TRACKS_COVER_GAP = DEFAULT_ALBUMS_COVER_GAP;
const DEFAULT_TRACKS_FILTER_TEXT = DEFAULT_ALBUMS_FILTER_TEXT;
const DEFAULT_TRACKS_SHOW_DETAILS = DEFAULT_ALBUMS_SHOW_DETAILS;
const DEFAULT_NOWPLAYING_ACTIVETAB = "lyrics";
const DEFAULT_PLAYLIST_EDITOR_SORTFIELD = "name";
const DEFAULT_PLAYLIST_VIEWMODE = "detailed";
const DEFAULT_PRESETS_CARD_SIZE = DEFAULT_ALBUMS_COVER_SIZE;
const DEFAULT_PRESETS_CARD_GAP = DEFAULT_ALBUMS_COVER_GAP;
const DEFAULT_PRESETS_SHOW_DETAILS = true;

// LSKEY = Local Storage Key. These dot-delimited keys need to match the nested object hierarchy
//  in the user settings state.
export const LSKEY_APPLICATION_THEME = "application.theme";
export const LSKEY_ALBUMS_ACTIVE_COLLECTION = "albums.activeCollection";
export const LSKEY_ALBUMS_COVER_GAP = "albums.coverGap";
export const LSKEY_ALBUMS_COVER_SIZE = "albums.coverSize";
export const LSKEY_ALBUMS_FILTER_TEXT = "albums.filterText";
export const LSKEY_ALBUMS_SHOW_DETAILS = "albums.showDetails";
export const LSKEY_TRACKS_COVER_GAP = "tracks.coverGap";
export const LSKEY_TRACKS_COVER_SIZE = "tracks.coverSize";
export const LSKEY_TRACKS_FILTER_TEXT = "tracks.filterText";
export const LSKEY_TRACKS_SHOW_DETAILS = "tracks.showDetails";
export const LSKEY_NOWPLAYING_ACTIVETAB = "nowPlaying.activeTab";
export const LSKEY_PLAYLIST_EDITOR_SORTFIELD = "playlist.editor.sortField";
export const LSKEY_PLAYLIST_VIEWMODE = "playlist.viewMode";
export const LSKEY_PRESETS_CARD_GAP = "presets.cardGap";
export const LSKEY_PRESETS_CARD_SIZE = "presets.cardSize";
export const LSKEY_PRESETS_SHOW_DETAILS = "presets.showDetails";

export type ApplicationTheme = "light" | "dark";
export type PlaylistViewMode = "simple" | "detailed";
export type PlaylistEditorSortField = "name" | "created" | "updated";
export type AlbumCollection = "all" | "new";

export interface UserSettingsState {
    application: {
        theme: ApplicationTheme;
    };
    albums: {
        activeCollection: AlbumCollection;
        coverGap: number;
        coverSize: number;
        filterText: string;
        showDetails: boolean;
    };
    tracks: {
        coverGap: number;
        coverSize: number;
        filterText: string;
        showDetails: boolean;
    };
    nowPlaying: {
        activeTab: NowPlayingTab;
    };
    playlist: {
        editor: {
            sortField: PlaylistEditorSortField;
        };
        viewMode: PlaylistViewMode;
    };
    presets: {
        cardGap: number;
        cardSize: number;
        showDetails: boolean;
    };
}

/**
 * Extract the value for the given dot.delimited key from local storage. The values are assumed to
 * be JSON.stringified (see localStorageMiddleware).
 */
const getLocalStorageValue = (key: string, defaultValue: any) => {
    const localStorageValue = localStorage.getItem(key);

    if (localStorageValue === null) {
        return defaultValue;
    }

    return JSON.parse(localStorageValue);
};

const initialState: UserSettingsState = {
    application: {
        theme: getLocalStorageValue(LSKEY_APPLICATION_THEME, DEFAULT_APPLICATION_THEME),
    },
    albums: {
        activeCollection: getLocalStorageValue(
            LSKEY_ALBUMS_ACTIVE_COLLECTION,
            DEFAULT_ALBUMS_ACTIVE_COLLECTION
        ),
        coverGap: getLocalStorageValue(LSKEY_ALBUMS_COVER_GAP, DEFAULT_ALBUMS_COVER_GAP),
        coverSize: getLocalStorageValue(LSKEY_ALBUMS_COVER_SIZE, DEFAULT_ALBUMS_COVER_SIZE),
        filterText: getLocalStorageValue(LSKEY_ALBUMS_FILTER_TEXT, DEFAULT_ALBUMS_FILTER_TEXT),
        showDetails: getLocalStorageValue(LSKEY_ALBUMS_SHOW_DETAILS, DEFAULT_ALBUMS_SHOW_DETAILS),
    },
    tracks: {
        coverGap: getLocalStorageValue(LSKEY_TRACKS_COVER_GAP, DEFAULT_TRACKS_COVER_GAP),
        coverSize: getLocalStorageValue(LSKEY_TRACKS_COVER_SIZE, DEFAULT_TRACKS_COVER_SIZE),
        filterText: getLocalStorageValue(LSKEY_TRACKS_FILTER_TEXT, DEFAULT_TRACKS_FILTER_TEXT),
        showDetails: getLocalStorageValue(LSKEY_TRACKS_SHOW_DETAILS, DEFAULT_TRACKS_SHOW_DETAILS),
    },
    nowPlaying: {
        activeTab: getLocalStorageValue(LSKEY_NOWPLAYING_ACTIVETAB, DEFAULT_NOWPLAYING_ACTIVETAB),
    },
    playlist: {
        editor: {
            sortField: getLocalStorageValue(
                LSKEY_PLAYLIST_EDITOR_SORTFIELD,
                DEFAULT_PLAYLIST_EDITOR_SORTFIELD
            ),
        },
        viewMode: getLocalStorageValue(LSKEY_PLAYLIST_VIEWMODE, DEFAULT_PLAYLIST_VIEWMODE),
    },
    presets: {
        cardGap: getLocalStorageValue(LSKEY_PRESETS_CARD_GAP, DEFAULT_PRESETS_CARD_GAP),
        cardSize: getLocalStorageValue(LSKEY_PRESETS_CARD_SIZE, DEFAULT_PRESETS_CARD_SIZE),
        showDetails: getLocalStorageValue(LSKEY_PRESETS_SHOW_DETAILS, DEFAULT_PRESETS_SHOW_DETAILS),
    },
};

export const userSettingsSlice = createSlice({
    name: "userSettings",
    initialState,
    reducers: {
        resetAlbumsToDefaults: (state) => {
            state.albums.coverSize = DEFAULT_ALBUMS_COVER_SIZE;
            state.albums.coverGap = DEFAULT_ALBUMS_COVER_GAP;
            state.albums.showDetails = DEFAULT_ALBUMS_SHOW_DETAILS;
        },
        resetPresetsToDefaults: (state) => {
            state.presets.cardSize = DEFAULT_PRESETS_CARD_SIZE;
            state.presets.cardGap = DEFAULT_PRESETS_CARD_GAP;
            state.presets.showDetails = DEFAULT_PRESETS_SHOW_DETAILS;
        },
        resetTracksToDefaults: (state) => {
            state.tracks.coverSize = DEFAULT_TRACKS_COVER_SIZE;
            state.tracks.coverGap = DEFAULT_TRACKS_COVER_GAP;
            state.tracks.showDetails = DEFAULT_TRACKS_SHOW_DETAILS;
        },
        setAlbumsActiveCollection: (state, action: PayloadAction<AlbumCollection>) => {
            state.albums.activeCollection = action.payload;
        },
        setAlbumsCoverGap: (state, action: PayloadAction<number>) => {
            state.albums.coverGap = action.payload;
        },
        setAlbumsCoverSize: (state, action: PayloadAction<number>) => {
            state.albums.coverSize = action.payload;
        },
        setAlbumsFilterText: (state, action: PayloadAction<string>) => {
            state.albums.filterText = action.payload;
        },
        setAlbumsShowDetails: (state, action: PayloadAction<boolean>) => {
            state.albums.showDetails = action.payload;
        },
        setApplicationTheme: (state, action: PayloadAction<ApplicationTheme>) => {
            state.application.theme = action.payload;
        },
        setNowPlayingActiveTab: (state, action: PayloadAction<NowPlayingTab>) => {
            state.nowPlaying.activeTab = action.payload;
        },
        setPlaylistEditorSortField: (state, action: PayloadAction<PlaylistEditorSortField>) => {
            state.playlist.editor.sortField = action.payload;
        },
        setPlaylistViewMode: (state, action: PayloadAction<PlaylistViewMode>) => {
            state.playlist.viewMode = action.payload;
        },
        setTracksCoverGap: (state, action: PayloadAction<number>) => {
            state.tracks.coverGap = action.payload;
        },
        setTracksCoverSize: (state, action: PayloadAction<number>) => {
            state.tracks.coverSize = action.payload;
        },
        setTracksFilterText: (state, action: PayloadAction<string>) => {
            state.tracks.filterText = action.payload;
        },
        setTracksShowDetails: (state, action: PayloadAction<boolean>) => {
            state.tracks.showDetails = action.payload;
        },
        setPresetsCardGap: (state, action: PayloadAction<number>) => {
            state.presets.cardGap = action.payload;
        },
        setPresetsCardSize: (state, action: PayloadAction<number>) => {
            state.presets.cardSize = action.payload;
        },
        setPresetsShowDetails: (state, action: PayloadAction<boolean>) => {
            state.presets.showDetails = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    resetAlbumsToDefaults,
    resetPresetsToDefaults,
    resetTracksToDefaults,
    setAlbumsActiveCollection,
    setAlbumsCoverGap,
    setAlbumsCoverSize,
    setAlbumsFilterText,
    setAlbumsShowDetails,
    setApplicationTheme,
    setNowPlayingActiveTab,
    setPlaylistEditorSortField,
    setPlaylistViewMode,
    setPresetsCardGap,
    setPresetsCardSize,
    setPresetsShowDetails,
    setTracksCoverGap,
    setTracksCoverSize,
    setTracksFilterText,
    setTracksShowDetails,
} = userSettingsSlice.actions;

export default userSettingsSlice.reducer;
