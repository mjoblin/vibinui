import { addListener, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import type { TypedStartListening, TypedAddListener } from "@reduxjs/toolkit";
import get from "lodash/get";

import type { RootState, AppDispatch } from "./store";
import {
    LSKEY_APPLICATION_THEME,
    LSKEY_ALBUMS_ACTIVE_COLLECTION,
    LSKEY_ALBUMS_COVER_GAP,
    LSKEY_ALBUMS_COVER_SIZE,
    LSKEY_ALBUMS_FILTER_TEXT,
    LSKEY_ALBUMS_SHOW_DETAILS,
    LSKEY_NOWPLAYING_ACTIVETAB,
    LSKEY_PLAYLIST_EDITOR_SORTFIELD,
    LSKEY_PLAYLIST_VIEWMODE,
    LSKEY_PRESETS_CARD_GAP,
    LSKEY_PRESETS_CARD_SIZE,
    LSKEY_PRESETS_SHOW_DETAILS,
    resetAlbumsToDefaults,
    resetPresetsToDefaults,
    setApplicationTheme,
    setAlbumsActiveCollection,
    setAlbumsCoverGap,
    setAlbumsCoverSize,
    setAlbumsFilterText,
    setAlbumsShowDetails,
    setNowPlayingActiveTab,
    setPlaylistEditorSortField,
    setPlaylistViewMode,
    setPresetsCardGap,
    setPresetsCardSize,
    setPresetsShowDetails,
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
    [setApplicationTheme.type]: LSKEY_APPLICATION_THEME,
    [setAlbumsActiveCollection.type]: LSKEY_ALBUMS_ACTIVE_COLLECTION,
    [setAlbumsCoverGap.type]: LSKEY_ALBUMS_COVER_GAP,
    [setAlbumsCoverSize.type]: LSKEY_ALBUMS_COVER_SIZE,
    [setAlbumsShowDetails.type]: LSKEY_ALBUMS_SHOW_DETAILS,
    [setAlbumsFilterText.type]: LSKEY_ALBUMS_FILTER_TEXT,
    [setNowPlayingActiveTab.type]: LSKEY_NOWPLAYING_ACTIVETAB,
    [setPlaylistEditorSortField.type]: LSKEY_PLAYLIST_EDITOR_SORTFIELD,
    [setPlaylistViewMode.type]: LSKEY_PLAYLIST_VIEWMODE,
    [setPresetsCardGap.type]: LSKEY_PRESETS_CARD_GAP,
    [setPresetsCardSize.type]: LSKEY_PRESETS_CARD_SIZE,
    [setPresetsShowDetails.type]: LSKEY_PRESETS_SHOW_DETAILS,
};

localStorageMiddleware.startListening({
    matcher: isAnyOf(
        resetAlbumsToDefaults,
        resetPresetsToDefaults,
        setApplicationTheme,
        setAlbumsActiveCollection,
        setAlbumsCoverGap,
        setAlbumsCoverSize,
        setAlbumsShowDetails,
        setNowPlayingActiveTab,
        setPlaylistEditorSortField,
        setPlaylistViewMode,
        setPresetsCardGap,
        setPresetsCardSize,
        setPresetsShowDetails,
    ),
    effect: (action, listenerApi) => {
        if (action.type === resetAlbumsToDefaults.type) {
            // Special-case resetAlbumsToDefaults to delete the local storage keys associated with
            // the resetAlbumsToDefaults action.
            //
            // TODO: This is prone to getting out of sync with resetAlbumsToDefaults. See if
            //  there's an elegant way to implement the reset feature such that the state is
            //  reflected appropriately in Redux and local storage, without multiple places being
            //  aware of what "reset" means.
            localStorage.removeItem(actionToLocalStorageKeyMapper[setAlbumsCoverGap.type]);
            localStorage.removeItem(actionToLocalStorageKeyMapper[setAlbumsCoverSize.type]);
            localStorage.removeItem(actionToLocalStorageKeyMapper[setAlbumsShowDetails.type]);

            return;
        }

        if (action.type === resetPresetsToDefaults.type) {
            // Special-case resetPresetsToDefaults to delete the local storage keys associated with
            // the resetPresetsToDefaults action.
            localStorage.removeItem(actionToLocalStorageKeyMapper[setPresetsCardGap.type]);
            localStorage.removeItem(actionToLocalStorageKeyMapper[setPresetsCardSize.type]);
            localStorage.removeItem(actionToLocalStorageKeyMapper[setPresetsShowDetails.type]);

            return;
        }

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
