import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import internalReducer from "./internalSlice";
import systemReducer from "./systemSlice";
import favoritesReducer from "./favoritesSlice";
import playbackReducer from "./playbackSlice";
import playlistReducer from "./playlistSlice";
import presetsReducer from "./presetsSlice";
import storedPlaylistsReducer from "./storedPlaylistsSlice";
import userSettingsReducer from "./userSettingsSlice";
import { localStorageMiddleware } from "./localStorageMiddleware";
import { vibinAlbumsApi } from "../services/vibinAlbums";
import { vibinArtistsApi } from "../services/vibinArtists";
import { vibinFavoritesApi } from "../services/vibinFavorites";
import { vibinPlaylistApi } from "../services/vibinPlaylist";
import { vibinPresetsApi } from "../services/vibinPresets";
import { vibinStoredPlaylistsApi } from "../services/vibinStoredPlaylists";
import { vibinSystemApi } from "../services/vibinSystem";
import { vibinTracksApi } from "../services/vibinTracks";
import { vibinTransportApi } from "../services/vibinTransport";
import { vibinWebsocket } from "../services/vibinWebsocket";

export const store = configureStore({
    reducer: {
        internal: internalReducer,
        system: systemReducer,
        favorites: favoritesReducer,
        playback: playbackReducer,
        playlist: playlistReducer,
        presets: presetsReducer,
        storedPlaylists: storedPlaylistsReducer,
        userSettings: userSettingsReducer,
        [vibinAlbumsApi.reducerPath]: vibinAlbumsApi.reducer,
        [vibinArtistsApi.reducerPath]: vibinArtistsApi.reducer,
        [vibinFavoritesApi.reducerPath]: vibinFavoritesApi.reducer,
        [vibinPlaylistApi.reducerPath]: vibinPlaylistApi.reducer,
        [vibinPresetsApi.reducerPath]: vibinPresetsApi.reducer,
        [vibinStoredPlaylistsApi.reducerPath]: vibinStoredPlaylistsApi.reducer,
        [vibinSystemApi.reducerPath]: vibinSystemApi.reducer,
        [vibinTracksApi.reducerPath]: vibinTracksApi.reducer,
        [vibinTransportApi.reducerPath]: vibinTransportApi.reducer,
        [vibinWebsocket.reducerPath]: vibinWebsocket.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            localStorageMiddleware.middleware,
            vibinAlbumsApi.middleware,
            vibinArtistsApi.middleware,
            vibinFavoritesApi.middleware,
            vibinPlaylistApi.middleware,
            vibinPresetsApi.middleware,
            vibinStoredPlaylistsApi.middleware,
            vibinSystemApi.middleware,
            vibinTracksApi.middleware,
            vibinTransportApi.middleware,
            vibinWebsocket.middleware
        ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
