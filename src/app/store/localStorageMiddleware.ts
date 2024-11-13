import { addListener, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import type { TypedStartListening, TypedAddListener } from "@reduxjs/toolkit";
import get from "lodash/get";

import type { RootState, AppDispatch } from "./store";
import {
    LSKEY_ALBUMS_ACTIVE_COLLECTION,
    LSKEY_ALBUMS_CARD_GAP,
    LSKEY_ALBUMS_CARD_SIZE,
    LSKEY_ALBUMS_FILTER_TEXT,
    LSKEY_ALBUMS_SHOW_DETAILS,
    LSKEY_ALBUMS_WALL_SORT_DIRECTION,
    LSKEY_ALBUMS_WALL_SORT_FIELD,
    LSKEY_ALBUMS_WALL_VIEW_MODE,
    LSKEY_APPLICATION_AUTO_PLAY_ON_PLAYLIST_ACTIVATION,
    LSKEY_APPLICATION_HAVE_SHOWN_WELCOME_MESSAGE,
    LSKEY_APPLICATION_MEDIA_SEARCH_CARD_GAP,
    LSKEY_APPLICATION_MEDIA_SEARCH_CARD_SIZE,
    LSKEY_APPLICATION_MEDIA_SEARCH_DISPLAY_CATEGORIES,
    LSKEY_APPLICATION_MEDIA_SEARCH_FILTER_TEXT,
    LSKEY_APPLICATION_MEDIA_SEARCH_SHOW_DETAILS,
    LSKEY_APPLICATION_MEDIA_SEARCH_WALL_SORT_DIRECTION,
    LSKEY_APPLICATION_MEDIA_SEARCH_WALL_SORT_FIELD,
    LSKEY_APPLICATION_MEDIA_SEARCH_WALL_VIEW_MODE,
    LSKEY_APPLICATION_THEME,
    LSKEY_APPLICATION_USE_IMAGE_BACKGROUND,
    LSKEY_APPLICATION_VOLUME_LIMIT,
    LSKEY_ARTISTS_ACTIVE_COLLECTION,
    LSKEY_ARTISTS_CARD_GAP,
    LSKEY_ARTISTS_CARD_SIZE,
    LSKEY_ARTISTS_FILTER_TEXT,
    LSKEY_ARTISTS_SHOW_DETAILS,
    LSKEY_ARTISTS_VIEWMODE,
    LSKEY_FAVORITES_ACTIVE_COLLECTION,
    LSKEY_FAVORITES_CARD_GAP,
    LSKEY_FAVORITES_CARD_SIZE,
    LSKEY_FAVORITES_FILTER_TEXT,
    LSKEY_FAVORITES_SHOW_DETAILS,
    LSKEY_FAVORITES_WALL_SORT_DIRECTION,
    LSKEY_FAVORITES_WALL_SORT_FIELD,
    LSKEY_FAVORITES_WALL_VIEW_MODE,
    LSKEY_CURRENTTRACK_ACTIVETAB,
    LSKEY_PLAYLIST_EDITOR_SORTFIELD,
    LSKEY_PLAYLIST_FOLLOW_CURRENTLY_PLAYING,
    LSKEY_PLAYLIST_VIEWMODE,
    LSKEY_PRESETS_CARD_GAP,
    LSKEY_PRESETS_CARD_SIZE,
    LSKEY_PRESETS_FILTER_TEXT,
    LSKEY_PRESETS_SHOW_DETAILS,
    LSKEY_PRESETS_WALL_SORT_DIRECTION,
    LSKEY_PRESETS_WALL_SORT_FIELD,
    LSKEY_PRESETS_WALL_VIEW_MODE,
    LSKEY_TRACKS_CARD_GAP,
    LSKEY_TRACKS_CARD_SIZE,
    LSKEY_TRACKS_FILTER_TEXT,
    LSKEY_TRACKS_SHOW_DETAILS,
    LSKEY_TRACKS_WALL_SORT_DIRECTION,
    LSKEY_TRACKS_WALL_SORT_FIELD,
    LSKEY_TRACKS_WALL_VIEW_MODE,
    resetAlbumsToDefaults,
    resetArtistsToDefaults,
    resetFavoritesToDefaults,
    resetPresetsToDefaults,
    resetTracksToDefaults,
    setAlbumsActiveCollection,
    setAlbumsCardGap,
    setAlbumsCardSize,
    setAlbumsFilterText,
    setAlbumsShowDetails,
    setAlbumsWallSortDirection,
    setAlbumsWallSortField,
    setAlbumsWallViewMode,
    setApplicationAutoPlayOnPlaylistActivation,
    setApplicationHaveShownWelcomeMessage,
    setApplicationMediaSearchCardGap,
    setApplicationMediaSearchCardSize,
    setApplicationMediaSearchDisplayCategories,
    setApplicationMediaSearchFilterText,
    setApplicationMediaSearchShowDetails,
    setApplicationMediaSearchWallSortDirection,
    setApplicationMediaSearchWallSortField,
    setApplicationMediaSearchWallViewMode,
    setApplicationTheme,
    setApplicationUseImageBackground,
    setApplicationVolumeLimit,
    setArtistsActiveCollection,
    setArtistsCardGap,
    setArtistsCardSize,
    setArtistsFilterText,
    setArtistsShowDetails,
    setArtistsViewMode,
    setCurrentTrackActiveTab,
    setFavoritesActiveCollection,
    setFavoritesCardGap,
    setFavoritesCardSize,
    setFavoritesFilterText,
    setFavoritesShowDetails,
    setFavoritesWallSortDirection,
    setFavoritesWallSortField,
    setFavoritesWallViewMode,
    setPlaylistEditorSortField,
    setPlaylistFollowCurrentlyPlaying,
    setPlaylistViewMode,
    setPresetsCardGap,
    setPresetsCardSize,
    setPresetsFilterText,
    setPresetsShowDetails,
    setPresetsWallSortDirection,
    setPresetsWallSortField,
    setPresetsWallViewMode,
    setTracksCardGap,
    setTracksCardSize,
    setTracksFilterText,
    setTracksShowDetails,
    setTracksWallSortDirection,
    setTracksWallSortField,
    setTracksWallViewMode,
} from "./userSettingsSlice";

// ================================================================================================
// Store user settings in local storage so they will persist between multiple sessions of the same
// browser.
// ================================================================================================

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
    [setAlbumsActiveCollection.type]: LSKEY_ALBUMS_ACTIVE_COLLECTION,
    [setAlbumsCardGap.type]: LSKEY_ALBUMS_CARD_GAP,
    [setAlbumsCardSize.type]: LSKEY_ALBUMS_CARD_SIZE,
    [setAlbumsShowDetails.type]: LSKEY_ALBUMS_SHOW_DETAILS,
    [setAlbumsFilterText.type]: LSKEY_ALBUMS_FILTER_TEXT,
    [setAlbumsWallSortDirection.type]: LSKEY_ALBUMS_WALL_SORT_DIRECTION,
    [setAlbumsWallSortField.type]: LSKEY_ALBUMS_WALL_SORT_FIELD,
    [setAlbumsWallViewMode.type]: LSKEY_ALBUMS_WALL_VIEW_MODE,
    [setApplicationAutoPlayOnPlaylistActivation.type]: LSKEY_APPLICATION_AUTO_PLAY_ON_PLAYLIST_ACTIVATION,
    [setApplicationHaveShownWelcomeMessage.type]: LSKEY_APPLICATION_HAVE_SHOWN_WELCOME_MESSAGE,
    [setApplicationMediaSearchCardGap.type]: LSKEY_APPLICATION_MEDIA_SEARCH_CARD_GAP,
    [setApplicationMediaSearchCardSize.type]: LSKEY_APPLICATION_MEDIA_SEARCH_CARD_SIZE,
    [setApplicationMediaSearchDisplayCategories.type]:
        LSKEY_APPLICATION_MEDIA_SEARCH_DISPLAY_CATEGORIES,
    [setApplicationMediaSearchFilterText.type]: LSKEY_APPLICATION_MEDIA_SEARCH_FILTER_TEXT,
    [setApplicationMediaSearchShowDetails.type]: LSKEY_APPLICATION_MEDIA_SEARCH_SHOW_DETAILS,
    [setApplicationMediaSearchWallSortDirection.type]: LSKEY_APPLICATION_MEDIA_SEARCH_WALL_SORT_DIRECTION,
    [setApplicationMediaSearchWallSortField.type]: LSKEY_APPLICATION_MEDIA_SEARCH_WALL_SORT_FIELD,
    [setApplicationMediaSearchWallViewMode.type]: LSKEY_APPLICATION_MEDIA_SEARCH_WALL_VIEW_MODE,
    [setApplicationTheme.type]: LSKEY_APPLICATION_THEME,
    [setApplicationUseImageBackground.type]: LSKEY_APPLICATION_USE_IMAGE_BACKGROUND,
    [setApplicationVolumeLimit.type]: LSKEY_APPLICATION_VOLUME_LIMIT,
    [setArtistsActiveCollection.type]: LSKEY_ARTISTS_ACTIVE_COLLECTION,
    [setArtistsCardGap.type]: LSKEY_ARTISTS_CARD_GAP,
    [setArtistsCardSize.type]: LSKEY_ARTISTS_CARD_SIZE,
    [setArtistsShowDetails.type]: LSKEY_ARTISTS_SHOW_DETAILS,
    [setArtistsFilterText.type]: LSKEY_ARTISTS_FILTER_TEXT,
    [setArtistsViewMode.type]: LSKEY_ARTISTS_VIEWMODE,
    [setFavoritesActiveCollection.type]: LSKEY_FAVORITES_ACTIVE_COLLECTION,
    [setFavoritesCardGap.type]: LSKEY_FAVORITES_CARD_GAP,
    [setFavoritesCardSize.type]: LSKEY_FAVORITES_CARD_SIZE,
    [setFavoritesFilterText.type]: LSKEY_FAVORITES_FILTER_TEXT,
    [setFavoritesShowDetails.type]: LSKEY_FAVORITES_SHOW_DETAILS,
    [setFavoritesWallSortDirection.type]: LSKEY_FAVORITES_WALL_SORT_DIRECTION,
    [setFavoritesWallSortField.type]: LSKEY_FAVORITES_WALL_SORT_FIELD,
    [setFavoritesWallViewMode.type]: LSKEY_FAVORITES_WALL_VIEW_MODE,
    [setCurrentTrackActiveTab.type]: LSKEY_CURRENTTRACK_ACTIVETAB,
    [setPlaylistEditorSortField.type]: LSKEY_PLAYLIST_EDITOR_SORTFIELD,
    [setPlaylistFollowCurrentlyPlaying.type]: LSKEY_PLAYLIST_FOLLOW_CURRENTLY_PLAYING,
    [setPlaylistViewMode.type]: LSKEY_PLAYLIST_VIEWMODE,
    [setPresetsCardGap.type]: LSKEY_PRESETS_CARD_GAP,
    [setPresetsCardSize.type]: LSKEY_PRESETS_CARD_SIZE,
    [setPresetsFilterText.type]: LSKEY_PRESETS_FILTER_TEXT,
    [setPresetsShowDetails.type]: LSKEY_PRESETS_SHOW_DETAILS,
    [setPresetsWallSortDirection.type]: LSKEY_PRESETS_WALL_SORT_DIRECTION,
    [setPresetsWallSortField.type]: LSKEY_PRESETS_WALL_SORT_FIELD,
    [setPresetsWallViewMode.type]: LSKEY_PRESETS_WALL_VIEW_MODE,
    [setTracksCardGap.type]: LSKEY_TRACKS_CARD_GAP,
    [setTracksCardSize.type]: LSKEY_TRACKS_CARD_SIZE,
    [setTracksShowDetails.type]: LSKEY_TRACKS_SHOW_DETAILS,
    [setTracksFilterText.type]: LSKEY_TRACKS_FILTER_TEXT,
    [setTracksWallSortDirection.type]: LSKEY_TRACKS_WALL_SORT_DIRECTION,
    [setTracksWallSortField.type]: LSKEY_TRACKS_WALL_SORT_FIELD,
    [setTracksWallViewMode.type]: LSKEY_TRACKS_WALL_VIEW_MODE,
};

localStorageMiddleware.startListening({
    matcher: isAnyOf(
        resetAlbumsToDefaults,
        resetArtistsToDefaults,
        resetFavoritesToDefaults,
        resetPresetsToDefaults,
        resetTracksToDefaults,
        setAlbumsActiveCollection,
        setAlbumsCardGap,
        setAlbumsCardSize,
        setAlbumsShowDetails,
        setAlbumsWallSortDirection,
        setAlbumsWallSortField,
        setAlbumsWallViewMode,
        setApplicationAutoPlayOnPlaylistActivation,
        setApplicationHaveShownWelcomeMessage,
        setApplicationMediaSearchCardGap,
        setApplicationMediaSearchCardSize,
        setApplicationMediaSearchDisplayCategories,
        setApplicationMediaSearchFilterText,
        setApplicationMediaSearchShowDetails,
        setApplicationMediaSearchWallSortDirection,
        setApplicationMediaSearchWallSortField,
        setApplicationMediaSearchWallViewMode,
        setApplicationTheme,
        setApplicationUseImageBackground,
        setApplicationVolumeLimit,
        setArtistsActiveCollection,
        setArtistsCardGap,
        setArtistsCardSize,
        setArtistsShowDetails,
        setFavoritesActiveCollection,
        setFavoritesCardGap,
        setFavoritesCardSize,
        setFavoritesShowDetails,
        setFavoritesWallSortDirection,
        setFavoritesWallSortField,
        setFavoritesWallViewMode,
        setCurrentTrackActiveTab,
        setPlaylistEditorSortField,
        setPlaylistFollowCurrentlyPlaying,
        setPlaylistViewMode,
        setPresetsCardGap,
        setPresetsCardSize,
        setPresetsShowDetails,
        setPresetsWallSortDirection,
        setPresetsWallSortField,
        setPresetsWallViewMode,
        setTracksCardGap,
        setTracksCardSize,
        setTracksShowDetails,
        setTracksWallSortDirection,
        setTracksWallSortField,
        setTracksWallViewMode,
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
            localStorage.removeItem(actionToLocalStorageKeyMapper[setAlbumsCardGap.type]);
            localStorage.removeItem(actionToLocalStorageKeyMapper[setAlbumsCardSize.type]);
            localStorage.removeItem(actionToLocalStorageKeyMapper[setAlbumsShowDetails.type]);

            return;
        }

        if (action.type === resetArtistsToDefaults.type) {
            // Special-case resetPresetsToDefaults to delete the local storage keys associated with
            // the resetPresetsToDefaults action.
            localStorage.removeItem(actionToLocalStorageKeyMapper[setArtistsCardGap.type]);
            localStorage.removeItem(actionToLocalStorageKeyMapper[setArtistsCardSize.type]);
            localStorage.removeItem(actionToLocalStorageKeyMapper[setArtistsShowDetails.type]);

            return;
        }

        if (action.type === resetFavoritesToDefaults.type) {
            // Special-case resetPresetsToDefaults to delete the local storage keys associated with
            // the resetPresetsToDefaults action.
            localStorage.removeItem(actionToLocalStorageKeyMapper[setFavoritesCardGap.type]);
            localStorage.removeItem(actionToLocalStorageKeyMapper[setFavoritesCardSize.type]);
            localStorage.removeItem(actionToLocalStorageKeyMapper[setFavoritesShowDetails.type]);

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

        if (action.type === resetTracksToDefaults.type) {
            // Special-case resetTracksToDefaults to delete the local storage keys associated with
            // the resetTracksToDefaults action.
            localStorage.removeItem(actionToLocalStorageKeyMapper[setTracksCardGap.type]);
            localStorage.removeItem(actionToLocalStorageKeyMapper[setTracksCardSize.type]);
            localStorage.removeItem(actionToLocalStorageKeyMapper[setTracksShowDetails.type]);

            return;
        }

        const key = actionToLocalStorageKeyMapper[action.type];
        const value = get((listenerApi.getState() as RootState).userSettings, key);

        // Store the given key/value pair in local storage. Local storage wants string values, so
        // JSON.stringify() is used. Anything wishing to use these stored values (userSettingsSlice)
        // needs to run them through JSON.parse().
        if (key) {
            if (value !== null && value !== undefined) {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                localStorage.removeItem(key);
            }
        }
    },
});

// TODO: Is the following required?
// https://redux-toolkit.js.org/api/createListenerMiddleware#typescript-usage

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
export const startAppListening = localStorageMiddleware.startListening as AppStartListening;
export const addAppListener = addListener as TypedAddListener<RootState, AppDispatch>;
