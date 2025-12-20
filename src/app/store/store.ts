import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import internalReducer from "./internalSlice";
import systemReducer from "./systemSlice";
import favoritesReducer from "./favoritesSlice";
import mediaGroupsReducer from "./mediaGroupsSlice";
import playbackReducer from "./playbackSlice";
import activePlaylistReducer from "./activePlaylistSlice";
import queueReducer from "./queueSlice";
import presetsReducer from "./presetsSlice";
import storedPlaylistsReducer from "./storedPlaylistsSlice";
import userSettingsReducer from "./userSettingsSlice";
import vibinStatusReducer from "./vibinStatusSlice";
import { localStorageMiddleware } from "./localStorageMiddleware";
import { vibinAlbumsApi } from "../services/vibinAlbums";
import { vibinArtistsApi } from "../services/vibinArtists";
import { vibinFavoritesApi } from "../services/vibinFavorites";
import { vibinActivePlaylistApi } from "../services/vibinActivePlaylist";
import { vibinPresetsApi } from "../services/vibinPresets";
import { vibinQueueApi } from "../services/vibinQueue";
import { vibinStoredPlaylistsApi } from "../services/vibinStoredPlaylists";
import { vibinSystemApi } from "../services/vibinSystem";
import { vibinTracksApi } from "../services/vibinTracks";
import { vibinTransportApi } from "../services/vibinTransport";
import { vibinVibinApi } from "../services/vibinVibin";
import { vibinWebsocket } from "../services/vibinWebsocket";

export const store = configureStore({
    reducer: {
        internal: internalReducer,
        system: systemReducer,
        favorites: favoritesReducer,
        mediaGroups: mediaGroupsReducer,
        playback: playbackReducer,
        activePlaylist: activePlaylistReducer,
        queue: queueReducer,
        presets: presetsReducer,
        storedPlaylists: storedPlaylistsReducer,
        userSettings: userSettingsReducer,
        vibinStatus: vibinStatusReducer,
        [vibinAlbumsApi.reducerPath]: vibinAlbumsApi.reducer,
        [vibinArtistsApi.reducerPath]: vibinArtistsApi.reducer,
        [vibinFavoritesApi.reducerPath]: vibinFavoritesApi.reducer,
        [vibinActivePlaylistApi.reducerPath]: vibinActivePlaylistApi.reducer,
        [vibinPresetsApi.reducerPath]: vibinPresetsApi.reducer,
        [vibinQueueApi.reducerPath]: vibinQueueApi.reducer,
        [vibinStoredPlaylistsApi.reducerPath]: vibinStoredPlaylistsApi.reducer,
        [vibinSystemApi.reducerPath]: vibinSystemApi.reducer,
        [vibinTracksApi.reducerPath]: vibinTracksApi.reducer,
        [vibinTransportApi.reducerPath]: vibinTransportApi.reducer,
        [vibinVibinApi.reducerPath]: vibinVibinApi.reducer,
        [vibinWebsocket.reducerPath]: vibinWebsocket.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Some functions, like scroll handlers, are stored in state
        }).concat(
            localStorageMiddleware.middleware,
            vibinAlbumsApi.middleware,
            vibinArtistsApi.middleware,
            vibinFavoritesApi.middleware,
            vibinActivePlaylistApi.middleware,
            vibinPresetsApi.middleware,
            vibinQueueApi.middleware,
            vibinStoredPlaylistsApi.middleware,
            vibinSystemApi.middleware,
            vibinTracksApi.middleware,
            vibinTransportApi.middleware,
            vibinVibinApi.middleware,
            vibinWebsocket.middleware,
        ),
    devTools: {
        stateSanitizer: (state) =>
            // @ts-ignore
            ({
                ...state,
                mediaGroups: "<<LARGE_MEDIA_PAYLOADS_REMOVED>>",
                vibinAlbumsApi: "<<LARGE_API_DETAILS_REMOVED>>",
                vibinArtistsApi: "<<LARGE_API_DETAILS_REMOVED>>",
                vibinTracksApi: "<<LARGE_API_DETAILS_REMOVED>>",
            }),
    },
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
