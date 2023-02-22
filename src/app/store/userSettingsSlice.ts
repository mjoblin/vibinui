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
const DEFAULT_BROWSE_COVER_SIZE = 200;
const DEFAULT_BROWSE_COVER_GAP = 25;
const DEFAULT_BROWSE_FILTER_TEXT = "";
const DEFAULT_BROWSE_SHOW_DETAILS = true;
const DEFAULT_NOWPLAYING_ACTIVETAB = "lyrics";
const DEFAULT_PLAYLIST_EDITOR_SORTFIELD = "name";
const DEFAULT_PLAYLIST_VIEWMODE = "detailed";
const DEFAULT_PRESETS_CARD_SIZE = 200;
const DEFAULT_PRESETS_CARD_GAP = 25;
const DEFAULT_PRESETS_SHOW_DETAILS = true;

// LSKEY = Local Storage Key. These dot-delimited keys need to match the nested object hierarchy
//  in the user settings state.
export const LSKEY_APPLICATION_THEME = "application.theme";
export const LSKEY_BROWSE_COVER_GAP = "browse.coverGap";
export const LSKEY_BROWSE_COVER_SIZE = "browse.coverSize";
export const LSKEY_BROWSE_FILTER_TEXT = "browse.filterText";
export const LSKEY_BROWSE_SHOW_DETAILS = "browse.showDetails";
export const LSKEY_NOWPLAYING_ACTIVETAB = "nowPlaying.activeTab";
export const LSKEY_PLAYLIST_EDITOR_SORTFIELD = "playlist.editor.sortField";
export const LSKEY_PLAYLIST_VIEWMODE = "playlist.viewMode";
export const LSKEY_PRESETS_CARD_GAP = "presets.cardGap";
export const LSKEY_PRESETS_CARD_SIZE = "presets.cardSize";
export const LSKEY_PRESETS_SHOW_DETAILS = "presets.showDetails";

export type ApplicationTheme = "light" | "dark";
export type PlaylistViewMode = "simple" | "detailed";
export type PlaylistEditorSortField = "name" | "created" | "updated";

export interface UserSettingsState {
    application: {
        theme: ApplicationTheme;
    };
    browse: {
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
    browse: {
        coverGap: getLocalStorageValue(LSKEY_BROWSE_COVER_GAP, DEFAULT_BROWSE_COVER_GAP),
        coverSize: getLocalStorageValue(LSKEY_BROWSE_COVER_SIZE, DEFAULT_BROWSE_COVER_SIZE),
        filterText: getLocalStorageValue(LSKEY_BROWSE_FILTER_TEXT, DEFAULT_BROWSE_FILTER_TEXT),
        showDetails: getLocalStorageValue(LSKEY_BROWSE_SHOW_DETAILS, DEFAULT_BROWSE_SHOW_DETAILS),
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
        setApplicationTheme: (state, action: PayloadAction<ApplicationTheme>) => {
            state.application.theme = action.payload;
        },
        resetBrowseToDefaults: (state) => {
            state.browse.filterText = DEFAULT_BROWSE_FILTER_TEXT;
            state.browse.coverSize = DEFAULT_BROWSE_COVER_SIZE;
            state.browse.coverGap = DEFAULT_BROWSE_COVER_GAP;
            state.browse.showDetails = DEFAULT_BROWSE_SHOW_DETAILS;
        },
        setBrowseCoverGap: (state, action: PayloadAction<number>) => {
            state.browse.coverGap = action.payload;
        },
        setBrowseCoverSize: (state, action: PayloadAction<number>) => {
            state.browse.coverSize = action.payload;
        },
        setBrowseFilterText: (state, action: PayloadAction<string>) => {
            state.browse.filterText = action.payload;
        },
        setBrowseShowDetails: (state, action: PayloadAction<boolean>) => {
            state.browse.showDetails = action.payload;
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
        resetPresetsToDefaults: (state) => {
            state.presets.cardSize = DEFAULT_PRESETS_CARD_SIZE;
            state.presets.cardGap = DEFAULT_PRESETS_CARD_GAP;
            state.presets.showDetails = DEFAULT_PRESETS_SHOW_DETAILS;
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
    setApplicationTheme,
    resetBrowseToDefaults,
    resetPresetsToDefaults,
    setBrowseCoverGap,
    setBrowseCoverSize,
    setBrowseFilterText,
    setBrowseShowDetails,
    setNowPlayingActiveTab,
    setPlaylistEditorSortField,
    setPlaylistViewMode,
    setPresetsCardGap,
    setPresetsCardSize,
    setPresetsShowDetails,
} = userSettingsSlice.actions;

export default userSettingsSlice.reducer;
