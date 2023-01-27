import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import systemReducer from "./systemSlice";
import playbackReducer from "./playbackSlice";
import playlistReducer from "./playlistSlice";
import userSettingsReducer from "./userSettingsSlice";
import { vibinBaseApi } from "../services/vibinBase";
import { vibinPlaylistApi } from "../services/vibinPlaylist";
import { vibinSystemApi } from "../services/vibinSystem";
import { vibinTracksApi } from "../services/vibinTracks";
import { vibinTransportApi } from "../services/vibinTransport";
import { vibinWebsocket } from "../services/vibinWebsocket";

export const store = configureStore({
    reducer: {
        system: systemReducer,
        playback: playbackReducer,
        playlist: playlistReducer,
        userSettings: userSettingsReducer,
        [vibinBaseApi.reducerPath]: vibinBaseApi.reducer,
        [vibinPlaylistApi.reducerPath]: vibinPlaylistApi.reducer,
        [vibinSystemApi.reducerPath]: vibinSystemApi.reducer,
        [vibinTracksApi.reducerPath]: vibinTracksApi.reducer,
        [vibinTransportApi.reducerPath]: vibinTransportApi.reducer,
        [vibinWebsocket.reducerPath]: vibinWebsocket.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            vibinBaseApi.middleware,
            vibinPlaylistApi.middleware,
            vibinSystemApi.middleware,
            vibinTracksApi.middleware,
            vibinTransportApi.middleware,
            vibinWebsocket.middleware
        ),
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
