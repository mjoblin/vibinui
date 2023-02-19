import { addListener, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import type { TypedStartListening, TypedAddListener } from "@reduxjs/toolkit";
import get from "lodash/get";

import type { RootState, AppDispatch } from "./store";
import {
    LSKEY_BROWSE_COVER_GAP,
    LSKEY_BROWSE_COVER_SIZE,
    LSKEY_BROWSE_FILTER_TEXT,
    LSKEY_BROWSE_SHOW_DETAILS,
    LSKEY_NOWPLAYING_ACTIVETAB,
    LSKEY_PLAYLIST_EDITOR_SORTFIELD,
    LSKEY_PLAYLIST_VIEWMODE,
    setBrowseCoverGap,
    setBrowseCoverSize,
    setBrowseFilterText,
    setBrowseShowDetails,
    setNowPlayingActiveTab,
    setPlaylistEditorSortField,
    setPlaylistViewMode,
} from "./userSettingsSlice";

// ------------------------------------------------------------------------------------------------
// TO STORE A USER SETTING IN LOCAL STORAGE:
//
// 1. In userSettingsSlice:
//      - Create the LSKEY_* and DEFAULT_* constants for the user setting.
//      - Configure UserSettingsState and the initial state for the user setting.
//      - Implement and export the action for the user setting.
// 2. In localStorageMiddleware:
//      - Import the action.
//      - Configure the actionToLocalStorageKeyMapper.
//      - Add the action to the matcher's isAnyOf list.
// ------------------------------------------------------------------------------------------------

export const localStorageMiddleware = createListenerMiddleware();

// Map the redux action name to the redux state key (dot.delimited). The local storage key will
// match the dot-delimited redux key.
export const actionToLocalStorageKeyMapper: Record<string, string> = {
    [setBrowseCoverGap.type]: LSKEY_BROWSE_COVER_GAP,
    [setBrowseCoverSize.type]: LSKEY_BROWSE_COVER_SIZE,
    [setBrowseShowDetails.type]: LSKEY_BROWSE_SHOW_DETAILS,
    [setBrowseFilterText.type]: LSKEY_BROWSE_FILTER_TEXT,
    [setNowPlayingActiveTab.type]: LSKEY_NOWPLAYING_ACTIVETAB,
    [setPlaylistEditorSortField.type]: LSKEY_PLAYLIST_EDITOR_SORTFIELD,
    [setPlaylistViewMode.type]: LSKEY_PLAYLIST_VIEWMODE,
};

localStorageMiddleware.startListening({
    matcher: isAnyOf(
        setBrowseCoverGap,
        setBrowseCoverSize,
        setBrowseShowDetails,
        setNowPlayingActiveTab,
        setPlaylistEditorSortField,
        setPlaylistViewMode
    ),
    effect: (action, listenerApi) => {
        const key = actionToLocalStorageKeyMapper[action.type];
        const value = get((listenerApi.getState() as RootState).userSettings, key);

        // Store the given key/value pair in local storage. Local storage wants string values, so
        // JSON.stringify() is used. Anything wishing to use these stored values (userSettingsSlice)
        // needs to run them through JSON.parse().

        key &&
            value !== null &&
            value !== undefined &&
            localStorage.setItem(key, JSON.stringify(value));
    },
});

// TODO: Is the following required?
// https://redux-toolkit.js.org/api/createListenerMiddleware#typescript-usage

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
export const startAppListening = localStorageMiddleware.startListening as AppStartListening;
export const addAppListener = addListener as TypedAddListener<RootState, AppDispatch>;
